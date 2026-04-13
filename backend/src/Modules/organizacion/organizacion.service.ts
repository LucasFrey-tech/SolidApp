import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Organizacion } from '../../Entities/organizacion.entity';
import { CreateOrganizacionDto } from './dto/create_organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from './dto/response_organizacion.dto';
import { CampaignsService } from '../campaign/campaign.service';
import { DonacionService } from '../donation/donacion.service';
import { ResponseCampaignsDetailPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';
import { CreateCampaignsDto } from '../campaign/dto/create_campaigns.dto';
import { ResponseCampaignsDto } from '../campaign/dto/response_campaigns.dto';
import { UpdateCampaignsDto } from '../campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../donation/dto/update_donation_estado.dto';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { Rol, RolSecundario } from '../user/enums/enums';
import { HashService } from '../../common/bcryptService/hashService';
import { InvitacionesService } from '../invitaciones/invitacion.service';
import { ErrorManager } from '../../common/errors/error.manager';
import { ResponseDonationDto } from '../donation/dto/response_donation.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../donation/dto/response_donation_paginatedByOrganizacion.dto';
import { Contacto } from '../../Entities/contacto.entity';

/**
 * Servicio para gestionar las organizaciones del sistema
 */
@Injectable()
export class OrganizacionService {
  private readonly logger = new Logger(OrganizacionService.name);

  constructor(
    @InjectRepository(Organizacion)
    private readonly organizacionRepository: Repository<Organizacion>,
    @InjectRepository(OrganizacionUsuario)
    private readonly organizacionUsuarioRepository: Repository<OrganizacionUsuario>,
    private readonly campaignService: CampaignsService,
    private readonly donacionService: DonacionService,
    private readonly hashService: HashService,
    private readonly dataSource: DataSource,
    private readonly invitacionesService: InvitacionesService,
  ) {}

  /**
   * Obtiene organizaciones paginadas con búsqueda opcional
   *
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @param search - Búsqueda por razón social o nombre de organización
   * @returns Organizaciones paginadas
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: ResponseOrganizacionDto[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder =
        this.organizacionRepository.createQueryBuilder('organizacion');

      if (search) {
        queryBuilder.andWhere(
          '(organizacion.razon_social LIKE :search OR organizacion.nombre_organizacion LIKE :search)',
          { search: `%${search}%` },
        );
      }

      const [organizaciones, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('organizacion.id', 'ASC')
        .getManyAndCount();

      return {
        items: organizaciones.map((org) => this.mapToResponseDto(org)),
        total,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene la organización asociada a un usuario colaborador
   *
   * @param usuarioId - ID del usuario
   * @returns Organización del usuario
   *
   * @throws {ErrorManager} Si el usuario no gestiona ninguna organización
   */
  async getOrganizacionByUsuario(usuarioId: number): Promise<Organizacion> {
    try {
      const organizacionUsuario =
        await this.organizacionUsuarioRepository.findOne({
          where: {
            usuario: { id: usuarioId },
            activo: true,
          },
          relations: [
            'organizacion',
            'organizacion.contacto',
            'organizacion.direccion',
          ],
        });

      if (!organizacionUsuario) {
        throw new ErrorManager({
          type: 'FORBIDDEN',
          message: 'El usuario no gestiona ninguna organizacion',
        });
      }

      return organizacionUsuario.organizacion;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene una organización por su ID
   *
   * @param id - ID de la organización
   * @returns Organización encontrada
   *
   * @throws {ErrorManager} Si la organización no existe
   */
  async findById(id: number): Promise<Organizacion> {
    try {
      const perfil = await this.organizacionRepository.findOne({
        where: { id },
      });

      if (!perfil) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organización ${id} no encontrada`,
        });
      }

      return perfil;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene las campañas de una organización (paginado)
   *
   * @param id - ID de la organización
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @returns Campañas paginadas de la organización
   */
  async getCampaigns(
    id: number,
    page: number,
    limit: number,
  ): Promise<ResponseCampaignsDetailPaginatedDto> {
    return this.campaignService.findCampaignsPaginated(id, page, limit);
  }

  /**
   * Obtiene las donaciones de una organización (paginado)
   *
   * @param organizacionId - ID de la organización
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @param search - Búsqueda por email del usuario (opcional)
   * @returns Donaciones paginadas de la organización
   */
  async getDonaciones(
    organizacionId: number,
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedOrganizationDonationsResponseDto> {
    return this.donacionService.findAllPaginatedByOrganizacion(
      organizacionId,
      page,
      limit,
      search,
    );
  }

  /**
   * Confirma o rechaza una donación (cambia su estado)
   *
   * @param id - ID de la donación
   * @param dto - Nuevo estado y motivo de rechazo (opcional)
   * @param gestorId - ID del gestor que realiza la acción
   * @returns Donación actualizada
   */
  async confirmarDonacion(
    id: number,
    dto: UpdateDonacionEstadoDto,
    gestorId: number,
  ): Promise<ResponseDonationDto> {
    return await this.donacionService.confirmarDonacion(id, dto, gestorId);
  }

  /**
   * Crea una nueva campaña para la organización
   *
   * @param id - ID de la organización
   * @param createDto - Datos de la campaña
   * @param imagenes - Lista de URLs de las imágenes
   * @param usuarioId - ID del usuario que crea la campaña
   * @returns Campaña creada
   */
  async createCampaign(
    id: number,
    createDto: CreateCampaignsDto,
    imagenes: string[],
    usuarioId: number,
  ): Promise<ResponseCampaignsDto> {
    return await this.campaignService.create(
      id,
      createDto,
      imagenes,
      usuarioId,
    );
  }

  /**
   * Actualiza una campaña existente de la organización
   *
   * @param id - ID de la organización
   * @param campaignId - ID de la campaña
   * @param updateDto - Datos a actualizar
   * @param usuarioId - ID del usuario que actualiza
   * @param imagenes - Nuevas imágenes (opcional)
   * @returns Campaña actualizada
   */
  async updateCampaign(
    id: number,
    campaignId: number,
    updateDto: UpdateCampaignsDto,
    usuarioId: number,
    imagenes?: string[],
  ): Promise<ResponseCampaignsDto> {
    return await this.campaignService.update(
      id,
      campaignId,
      updateDto,
      usuarioId,
      imagenes,
    );
  }

  /**
   * Registra una nueva organización con su colaborador asociado
   *
   * @param dto - Datos de registro de organización y colaborador
   * @returns Organización creada
   *
   * @throws {ErrorManager} Si el CUIT ya existe
   * @throws {ErrorManager} Si el documento ya existe
   * @throws {ErrorManager} Si el correo ya está registrado
   */
  async registrarOrganizacion(
    dto: CreateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const usuarioRepo = manager.getRepository(Usuario);
        const organizacionRepo = manager.getRepository(Organizacion);
        const orgUsuarioRepo = manager.getRepository(OrganizacionUsuario);
        const contactoRepo = manager.getRepository(Contacto);

        const cuitExistente = await organizacionRepo.findOne({
          where: { cuit: dto.cuit_organizacion },
        });

        if (cuitExistente) {
          throw new ErrorManager({
            type: 'CONFLICT',
            message: 'Ya existe una organización con ese CUIT',
          });
        }

        const docExistente = await usuarioRepo.findOne({
          where: { documento: dto.documento },
        });

        if (docExistente) {
          throw new ErrorManager({
            type: 'CONFLICT',
            message: 'Ya existe un usuario con ese documento',
          });
        }

        const correosExistentes = await contactoRepo.find({
          where: [{ correo: dto.correo }, { correo: dto.correo_organizacion }],
        });

        correosExistentes.forEach((c) => {
          if (c.correo === dto.correo) {
            throw new ErrorManager({
              type: 'CONFLICT',
              message: 'Ya existe un usuario con ese correo',
            });
          }

          if (c.correo === dto.correo_organizacion) {
            throw new ErrorManager({
              type: 'CONFLICT',
              message: 'Ya existe una organización con ese correo',
            });
          }
        });

        const claveHash = await this.hashService.hash(dto.clave);

        const colaborador = usuarioRepo.create({
          nombre: dto.nombre,
          apellido: dto.apellido,
          documento: dto.documento,
          clave: claveHash,
          rol: Rol.COLABORADOR,
          contacto: {
            correo: dto.correo,
            prefijo: dto.prefijo,
            telefono: dto.telefono,
          },
          direccion: {},
          puntos: 0,
          habilitado: true,
          verificado: false,
        });

        const savedGestor = await usuarioRepo.save(colaborador);
        this.logger.log(`COLABORADOR creado con ID ${savedGestor.id}`);

        const organizacion = organizacionRepo.create({
          cuit: dto.cuit_organizacion,
          razon_social: dto.razon_social,
          nombre_organizacion: dto.nombre_organizacion,
          web: dto.web ?? '',
          contacto: {
            correo: dto.correo_organizacion,
          },
          direccion: {
            calle: dto.calle,
            numero: dto.numero,
          },
          habilitada: true,
          verificada: false,

          creado_por: { id: savedGestor.id },
          actualizado_por: { id: savedGestor.id },
        });

        const savedOrganizacion = await organizacionRepo.save(organizacion);
        this.logger.log(`Organización creada con ID ${savedOrganizacion.id}`);

        if (dto.token) {
          const invitacion = await this.invitacionesService.validarInvitacion(
            dto.token,
            dto.correo,
          );

          await this.invitacionesService.marcarAceptada(
            invitacion.id,
            savedGestor.id,
            manager,
          );
        }

        const vinculo = orgUsuarioRepo.create({
          usuario: { id: savedGestor.id },
          organizacion: { id: savedOrganizacion.id },
          activo: true,
          rol: RolSecundario.GESTOR,
        });

        await orgUsuarioRepo.save(vinculo);
        this.logger.log(`Vínculo colaborador-organización creado`);

        return this.mapToResponseDto(savedOrganizacion);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Actualiza los datos de una organización
   *
   * @param updateDto - Datos a actualizar
   * @param usuarioId - ID del usuario colaborador
   * @returns Organización actualizada
   *
   * @throws {ErrorManager} Si el usuario no gestiona ninguna organización
   * @throws {ErrorManager} Si la organización no existe
   */
  async update(
    updateDto: UpdateOrganizacionDto,
    usuarioId: number,
  ): Promise<ResponseOrganizacionDto> {
    try {
      const organizacionActual =
        await this.organizacionUsuarioRepository.findOne({
          where: { usuario: { id: usuarioId } },
          relations: [
            'organizacion',
            'organizacion.contacto',
            'organizacion.direccion',
          ],
        });

      if (!organizacionActual) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'El usuario no gestiona ninguna organización',
        });
      }

      const organizacionId = organizacionActual.organizacion.id;

      const organizacionPreload = await this.organizacionRepository.preload({
        id: organizacionId,
        ...updateDto,
        contacto: updateDto.contacto
          ? {
              ...organizacionActual.organizacion.contacto,
              ...updateDto.contacto,
            }
          : undefined,
        direccion: updateDto.direccion
          ? {
              ...organizacionActual.organizacion.direccion,
              ...updateDto.direccion,
            }
          : undefined,

        actualizado_por: { id: usuarioId },
      });

      if (!organizacionPreload) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organización con ID ${organizacionId} no encontrada`,
        });
      }

      const updated =
        await this.organizacionRepository.save(organizacionPreload);
      this.logger.log(`Organización ${organizacionId} actualizada`);

      return this.mapToResponseDto(updated);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Marca una organización como verificada
   *
   * @param id - ID de la organización
   * @returns Organización verificada
   *
   * @throws {ErrorManager} Si la organización no existe
   */
  async verify(id: number): Promise<ResponseOrganizacionDto> {
    try {
      const organizacion = await this.organizacionRepository.findOne({
        where: { id },
      });

      if (!organizacion) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organización con ID ${id} no encontrada`,
        });
      }

      organizacion.verificada = true;
      const updated = await this.organizacionRepository.save(organizacion);

      return this.mapToResponseDto(updated);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Deshabilita una organización (soft delete)
   *
   * @param id - ID de la organización
   *
   * @throws {ErrorManager} Si la organización no existe
   */
  async delete(id: number): Promise<void> {
    try {
      const organizacion = await this.organizacionRepository.findOne({
        where: { id },
      });

      if (!organizacion) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organizacion con ID ${id} no encontrada`,
        });
      }

      await this.organizacionRepository.update(id, { habilitada: false });
      this.logger.log(`Organizacion ${id} deshabilitada`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Restaura una organización deshabilitada
   *
   * @param id - ID de la organización
   *
   * @throws {ErrorManager} Si la organización no existe
   */
  async restore(id: number): Promise<void> {
    try {
      const organizacion = await this.organizacionRepository.findOne({
        where: { id },
      });

      if (!organizacion) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organizacion con ID ${id} no encontrada`,
        });
      }

      await this.organizacionRepository.update(id, { habilitada: true });
      this.logger.log(`Organizacion ${id} restaurada`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Mapea una entidad Organizacion a ResponseOrganizacionDto
   *
   * @param organizacion - Entidad Organizacion
   * @returns DTO de respuesta para organización
   */
  private mapToResponseDto(
    organizacion: Organizacion,
  ): ResponseOrganizacionDto {
    const dto = new ResponseOrganizacionDto();

    dto.id = organizacion.id;
    dto.cuit = organizacion.cuit;
    dto.razon_social = organizacion.razon_social;
    dto.nombre_organizacion = organizacion.nombre_organizacion;
    dto.descripcion = organizacion.descripcion;
    dto.web = organizacion.web;
    dto.verificada = organizacion.verificada;
    dto.habilitada = organizacion.habilitada;

    dto.contacto = organizacion.contacto
      ? {
          id: organizacion.contacto.id,
          correo: organizacion.contacto.correo,
          telefono: organizacion.contacto.telefono,
          prefijo: organizacion.contacto.prefijo,
        }
      : undefined;

    dto.direccion = organizacion.direccion
      ? {
          id: organizacion.direccion.id,
          calle: organizacion.direccion.calle,
          numero: organizacion.direccion.numero,
          provincia: organizacion.direccion.provincia,
          ciudad: organizacion.direccion.ciudad,
          codigo_postal: organizacion.direccion.codigo_postal,
        }
      : undefined;

    dto.creado_por = organizacion.creado_por
      ? {
          id: organizacion.creado_por.id,
          nombre: organizacion.creado_por.nombre,
          apellido: organizacion.creado_por.apellido,
          email: organizacion.creado_por.contacto?.correo,
        }
      : undefined;

    dto.actualizado_por = organizacion.actualizado_por
      ? {
          id: organizacion.actualizado_por.id,
          nombre: organizacion.actualizado_por.nombre,
          apellido: organizacion.actualizado_por.apellido,
          email: organizacion.actualizado_por.contacto?.correo,
        }
      : undefined;

    dto.fecha_registro = organizacion.fecha_registro;
    dto.ultimo_cambio = organizacion.ultimo_cambio;

    return dto;
  }
}
