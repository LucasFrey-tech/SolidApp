import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { SettingsService } from '../../common/settings/settings.service';
import { PaginatedBeneficiosResponseDTO } from '../benefit/dto/response_paginated_beneficios';
import { BeneficioService } from '../benefit/beneficio.service';
import { CreateBeneficiosDTO } from '../benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../benefit/dto/update_beneficios.dto';
import { EmpresaUsuario } from '../../Entities/empresa_usuario.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { HashService } from '../../common/bcryptService/hashService';
import { Rol, RolSecundario } from '../user/enums/enums';
import { InvitacionesService } from '../invitaciones/invitacion.service';
import { ErrorManager } from '../../common/errors/error.manager';
import { BeneficiosResponseDTO } from '../benefit/dto/response_beneficios.dto';
import { Contacto } from '../../Entities/contacto.entity';

@Injectable()
export class EmpresaService {
  private readonly logger = new Logger(EmpresaService.name);

  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepository: Repository<EmpresaUsuario>,
    private readonly beneficioService: BeneficioService,
    private readonly dataSource: DataSource,
    private readonly hashService: HashService,
    private readonly invitacionesService: InvitacionesService,
  ) {}

  async findPaginated(
    page: number,
    limit: number,
    search: string,
    onlyEnabled: boolean,
  ): Promise<{ items: EmpresaResponseDTO[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const baseFilter: FindOptionsWhere<Empresa> = onlyEnabled
        ? { habilitada: true }
        : {};

      const where: FindOptionsWhere<Empresa>[] = search
        ? [
            { ...baseFilter, nombre_empresa: Like(`%${search}%`) },
            { ...baseFilter, razon_social: Like(`%${search}%`) },
          ]
        : [baseFilter];

      const [empresas, total] = await this.empresaRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: 'ASC' },
      });

      const items = empresas.map((emp) => this.mapToResponseDto(emp));

      return { items, total };
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

  async getEmpresaByUsuario(usuarioId: number): Promise<EmpresaResponseDTO> {
    try {
      const empresaUsuario = await this.empresaUsuarioRepository.findOne({
        where: {
          usuario: { id: usuarioId },
        },
        relations: ['empresa'],
      });

      if (!empresaUsuario) {
        throw new ErrorManager({
          type: 'FORBIDDEN',
          message: 'El usuario no gestiona ninguna empresa',
        });
      }

      return this.mapToResponseDto(empresaUsuario.empresa);
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

  async getCupones(
    usuarioid: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    try {
      const empresa = await this.getEmpresaByUsuario(usuarioid);

      return await this.beneficioService.findByEmpresaPaginated(
        empresa.id,
        page,
        limit,
      );
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

  async createCupon(
    usuarioId: number,
    dto: CreateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    try {
      const empresa = await this.getEmpresaByUsuario(usuarioId);

      return this.beneficioService.create(
        { ...dto, id_empresa: empresa.id },
        usuarioId,
      );
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

  async updateCupon(
    cuponId: number,
    dto: UpdateBeneficiosDTO,
    usuarioId: number,
  ): Promise<BeneficiosResponseDTO> {
    try {
      return this.beneficioService.update(cuponId, dto, usuarioId);
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

  async registrarEmpresa(dto: CreateEmpresaDTO): Promise<EmpresaResponseDTO> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const usuarioRepo = manager.getRepository(Usuario);
        const empresaRepo = manager.getRepository(Empresa);
        const empresaUsuarioRepo = manager.getRepository(EmpresaUsuario);
        const contactoRepo = manager.getRepository(Contacto);

        const cuitExistente = await empresaRepo.findOne({
          where: { cuit: dto.cuit_empresa },
        });
        if (cuitExistente) {
          throw new ErrorManager({
            type: 'CONFLICT',
            message: 'Ya existe una empresa con ese CUIT',
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
          where: [{ correo: dto.correo }, { correo: dto.correo_empresa }],
        });

        correosExistentes.forEach((c) => {
          if (c.correo === dto.correo) {
            throw new ErrorManager({
              type: 'CONFLICT',
              message: 'Ya existe un usuario con ese correo',
            });
          }

          if (c.correo === dto.correo_empresa) {
            throw new ErrorManager({
              type: 'CONFLICT',
              message: 'Ya existe una empresa con ese correo',
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

        const empresa = empresaRepo.create({
          cuit: dto.cuit_empresa,
          razon_social: dto.razon_social,
          nombre_empresa: dto.nombre_empresa,
          web: dto.web,
          contacto: {
            correo: dto.correo_empresa,
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

        const savedEmpresa = await empresaRepo.save(empresa);
        this.logger.log(`Empresa creada con ID ${savedEmpresa.id}`);

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

        const vinculo = empresaUsuarioRepo.create({
          usuario: { id: savedGestor.id },
          empresa: { id: savedEmpresa.id },
          activo: true,
          rol: RolSecundario.GESTOR,
        });

        await empresaUsuarioRepo.save(vinculo);
        this.logger.log(`Vínculo colaborador-empresa creado`);

        return this.mapToResponseDto(savedEmpresa);
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

  async update(
    usuarioId: number,
    updateDto: UpdateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    try {
      const empresaUsuario = await this.empresaUsuarioRepository.findOne({
        where: { usuario: { id: usuarioId } },
        relations: ['empresa', 'empresa.contacto', 'empresa.direccion'],
      });

      if (!empresaUsuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'El usuario no gestiona ninguna empresa',
        });
      }

      const empresaId = empresaUsuario.empresa.id;

      const empresaPreload = await this.empresaRepository.preload({
        id: empresaId,
        descripcion: updateDto.descripcion,
        rubro: updateDto.rubro,
        web: updateDto.web,
        logo: updateDto.logo,
        contacto: updateDto.contacto
          ? {
              ...empresaUsuario.empresa.contacto,
              ...updateDto.contacto,
            }
          : undefined,
        direccion: updateDto.direccion
          ? {
              ...empresaUsuario.empresa.direccion,
              ...updateDto.direccion,
            }
          : undefined,

        actualizado_por: { id: usuarioId },
      });

      if (!empresaPreload) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Empresa con ID ${empresaId} no encontrada`,
        });
      }

      const updated = await this.empresaRepository.save(empresaPreload);

      this.logger.log(`Empresa ${empresaId} actualizada`);

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

  async verify(id: number): Promise<EmpresaResponseDTO> {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id },
      });

      if (!empresa) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Empresa con ID ${id} no encontrada`,
        });
      }

      empresa.verificada = true;
      const updated = await this.empresaRepository.save(empresa);

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

  async delete(id: number): Promise<void> {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id },
      });

      if (!empresa) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Empresa con ID ${id} no encontrada`,
        });
      }

      await this.empresaRepository.update(id, { habilitada: false });
      this.logger.log(`Empresa ${id} deshabilitado`);
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

  async restore(id: number): Promise<void> {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id },
      });

      if (!empresa) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Empresa con ID ${id} no encontrada`,
        });
      }

      await this.empresaRepository.update(id, { habilitada: true });
      this.logger.log(`Empresa ${id} restaurado`);
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

  private mapToResponseDto(empresa: Empresa): EmpresaResponseDTO {
    const dto = new EmpresaResponseDTO();

    dto.id = empresa.id;
    dto.cuit = empresa.cuit;
    dto.razon_social = empresa.razon_social;
    dto.nombre_empresa = empresa.nombre_empresa;
    dto.descripcion = empresa.descripcion;
    dto.rubro = empresa.rubro ?? '';
    dto.web = empresa.web;
    dto.verificada = empresa.verificada;
    dto.habilitada = empresa.habilitada;
    dto.fecha_registro = empresa.fecha_registro;
    dto.ultimo_cambio = empresa.ultimo_cambio;

    dto.logo = empresa.logo
      ? SettingsService.getEmpresaImageUrl(empresa.logo)
      : '';

    if (empresa.contacto) {
      dto.contacto = {
        id: empresa.contacto.id,
        prefijo: empresa.contacto.prefijo,
        telefono: empresa.contacto.telefono,
        correo: empresa.contacto.correo,
      };
    }

    if (empresa.direccion) {
      dto.direccion = {
        id: empresa.direccion.id,
        calle: empresa.direccion.calle,
        numero: empresa.direccion.numero,
        provincia: empresa.direccion.provincia,
        ciudad: empresa.direccion.ciudad,
        codigo_postal: empresa.direccion.codigo_postal,
      };
    }

    dto.creado_por = empresa.creado_por
      ? {
          id: empresa.creado_por.id,
          nombre: empresa.creado_por.nombre,
          apellido: empresa.creado_por.apellido,
          email: empresa.creado_por.contacto?.correo,
        }
      : undefined;

    dto.actualizado_por = empresa.actualizado_por
      ? {
          id: empresa.actualizado_por.id,
          nombre: empresa.actualizado_por.nombre,
          apellido: empresa.actualizado_por.apellido,
          email: empresa.actualizado_por.contacto?.correo,
        }
      : undefined;

    return dto;
  }
}
