import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Organizacion } from '../../Entities/organizacion.entity';
import { CreateOrganizacionDto } from './dto/create_organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from './dto/response_organizacion.dto';
import { CampaignsService } from '../campaign/campaign.service';
import { DonacionService } from '../donation/donacion.service';
import { UsuarioService } from '../user/usuario.service';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../donation/dto/response_donation_paginatedByOrganizacion.dto';
import { CreateCampaignsDto } from '../campaign/dto/create_campaigns.dto';
import { ResponseCampaignsDto } from '../campaign/dto/response_campaigns.dto';
import { UpdateCampaignsDto } from '../campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../donation/dto/update_donation_estado.dto';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';
import { Rol, Usuario } from '../../Entities/usuario.entity';
import { HashService } from '../../common/bcryptService/hashService';

/**
 * ============================================================
 * OrganizationsService
 * ============================================================
 *
 * Servicio encargado de la lógica de negocio relacionada
 * con las Organizaciones del sistema.
 *
 * Responsabilidades:
 * - Gestión CRUD de organizaciones
 * - Paginación y búsqueda
 * - Soft delete y restauración
 * - Gestión de credenciales (email y contraseña)
 * - Generación de JWT actualizado
 * - Obtención de campañas asociadas
 *
 * Arquitectura:
 * Controller → Service → Repository (TypeORM)
 *
 * Dependencias:
 * - organizationRepository (TypeORM)
 * - CampaignsService (relación con campañas)
 * - JwtService (emisión de tokens)
 *
 * ============================================================
 */
@Injectable()
export class PerfilOrganizacionService {
  private readonly logger = new Logger(PerfilOrganizacionService.name);

  constructor(
    @InjectRepository(Organizacion)
    private readonly organizacionRepository: Repository<Organizacion>,
    @InjectRepository(OrganizacionUsuario)
    private readonly organizacionUsuarioRepository: Repository<OrganizacionUsuario>,
    private readonly campaignService: CampaignsService,
    private readonly donacionService: DonacionService,
    private readonly usuarioService: UsuarioService,
    private readonly hashService: HashService,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Obtiene organizaciones paginadas con búsqueda opcional.
   *
   * @param page - Número de página.
   * @param limit - Cantidad de registros por página.
   * @param search - Texto para búsqueda por razón social o nombre fantasía.
   *
   * @returns {Promise<{ items: ResponseOrganizacionDto[]; total: number }>}
   * Objeto con listado paginado y total de registros.
   */
  async findPaginated(page: number, limit: number, search: string) {
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
  }

  /**
   * Obtiene una organización por ID.
   *
   * @param id ID de la organización.
   *
   * @returns {Promise<ResponseOrganizacionDto>}
   *
   * @throws NotFoundException
   * Si la organización no existe.
   */

  async getOrganizacionByUsuario(usuarioId: number): Promise<Organizacion> {
    const organizacionUsuario =
      await this.organizacionUsuarioRepository.findOne({
        where: {
          id_usuario: usuarioId,
          activo: true,
        },
        relations: [
          'organizacion',
          'organizacion.contacto',
          'organizacion.direccion',
        ],
      });

    if (!organizacionUsuario) {
      throw new ForbiddenException(
        'El usuario no gestiona ninguna organizacion',
      );
    }

    return organizacionUsuario.organizacion;
  }

  async findById(id: number): Promise<Organizacion> {
    const perfil = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!perfil) {
      throw new NotFoundException(`Organización ${id} no encontrado`);
    }

    return perfil;
  }

  async getCampaigns(
    id: number,
    page: number,
    limit: number,
  ): Promise<ResponseCampaignsDetailPaginatedDto> {
    return this.campaignService.findCampaignsPaginated(id, page, limit);
  }

  async getDonaciones(
    id: number,
    page: number,
    limit: number,
  ): Promise<PaginatedOrganizationDonationsResponseDto> {
    return this.donacionService.findAllPaginatedByOrganizacion(id, page, limit);
  }

  async confirmarDonacion(
    id: number,
    dto: UpdateDonacionEstadoDto,
    gestorId: number,
  ) {
    return await this.donacionService.confirmarDonacion(id, dto, gestorId);
  }

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

  async updateCampaign(
    id: number,
    updateDto: UpdateCampaignsDto,
    usuarioId: number,
    imagenes?: string[],
  ): Promise<ResponseCampaignsDto> {
    return await this.campaignService.update(
      id,
      updateDto,
      usuarioId,
      imagenes,
    );
  }

  async registrarOrganizacion(
    dto: CreateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    return await this.dataSource.transaction(async (manager) => {
      const usuarioRepo = manager.getRepository(Usuario);
      const organizacionRepo = manager.getRepository(Organizacion);
      const orgUsuarioRepo = manager.getRepository(OrganizacionUsuario);

      const cuitExistente = await organizacionRepo.findOne({
        where: { cuit: dto.cuit_organizacion },
      });
      if (cuitExistente) {
        throw new ConflictException('Ya existe una organización con ese CUIT');
      }

      const docExistente = await usuarioRepo.findOne({
        where: { documento: dto.documento },
      });
      if (docExistente) {
        throw new ConflictException('Ya existe un usuario con ese documento');
      }

      const correoExistente = await usuarioRepo.findOne({
        relations: ['contacto'],
        where: { contacto: { correo: dto.correo } },
      });
      if (correoExistente) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }

      const claveHash = await this.hashService.hash(dto.clave);

      const gestor = usuarioRepo.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        documento: dto.documento,
        clave: claveHash,
        rol: Rol.GESTOR,
        contacto: {
          correo: dto.correo,
          telefono: dto.telefono,
        },
        direccion: {},
        puntos: 0,
        habilitado: true,
        verificado: false,
      });

      const savedGestor = await usuarioRepo.save(gestor);
      this.logger.log(`Gestor creado con ID ${savedGestor.id}`);

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

      const vinculo = orgUsuarioRepo.create({
        usuario: { id: savedGestor.id },
        organizacion: { id: savedOrganizacion.id },
        activo: true,
      });

      await orgUsuarioRepo.save(vinculo);
      this.logger.log(`Vínculo gestor-organización creado`);

      return this.mapToResponseDto(savedOrganizacion);
    });
  }

  /**
   * Actualiza una organización existente.
   *
   * @param id ID de la organización.
   * @param updateDto Datos a modificar.
   *
   * @returns {Promise<ResponseOrganizacionDto>}
   *
   * @throws NotFoundException
   * Si la organización no existe.
   */
  async update(
    updateDto: UpdateOrganizacionDto,
    usuarioId: number,
  ): Promise<ResponseOrganizacionDto> {
    const organizacionActual = await this.organizacionUsuarioRepository.findOne(
      {
        where: { usuario: { id: usuarioId } },
        relations: [
          'organizacion',
          'organizacion.contacto',
          'organizacion.direccion',
        ],
      },
    );

    if (!organizacionActual) {
      throw new NotFoundException(
        'El usuario no gestiona ninguna organización',
      );
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
      throw new NotFoundException(
        `Organización con ID ${organizacionId} no encontrada`,
      );
    }

    const updated = await this.organizacionRepository.save(organizacionPreload);
    this.logger.log(`Organización ${organizacionId} actualizada`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Actualiza las credenciales del usuario
   */
  async updateCredenciales(cuentaId: number, dto: UpdateCredencialesDto) {
    return this.usuarioService.updateCredenciales(cuentaId, dto);
  }

  /**
   * Marca una organización como verificada.
   */
  async verify(id: number): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    organizacion.verificada = true;
    const updated = await this.organizacionRepository.save(organizacion);

    return this.mapToResponseDto(updated);
  }

  /**
   * Deshabilita un organizacion (soft delete sobre la Cuenta).
   */
  async delete(id: number): Promise<void> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organizacion con ID ${id} no encontrada`);
    }

    await this.organizacionRepository.update(id, { habilitada: false });
    this.logger.log(`Organizacion ${id} deshabilitada`);
  }

  /**
   * Restaura un organizacion deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organizacion con ID ${id} no encontrada`);
    }

    await this.organizacionRepository.update(id, { habilitada: true });
    this.logger.log(`Organizacion ${id} restaurada`);
  }

  /**
   * Mapea la entidad Organizations a ResponseOrganizacionDto.
   *
   * @param organization Entidad Organization.
   *
   * @returns {ResponseOrganizacionDto}
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
