import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Beneficios } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';
import { EmpresaSummaryDTO } from '../empresa/dto/summary_empresa.dto';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';
import { Usuario } from '../../Entities/usuario.entity';
import { UsuarioBeneficio } from '../../Entities/usuario-beneficio.entity';
import { SettingsService } from '../../common/settings/settings.service';

import { BeneficioEstado, BeneficiosUsuarioEstado } from './dto/enum/enum';
import { Rol } from '../user/enums/enums';
import { ErrorManager } from '../../common/errors/error.manager';
import { CanjearResponseDto } from './dto/canjear_response.dto';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name);

  constructor(
    @InjectRepository(Beneficios)
    private readonly beneficiosRepository: Repository<Beneficios>,

    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,

    private readonly dataSource: DataSource,
  ) {}

  async findAllPaginated(
    page = 1,
    limit = 10,
    search: string = '',
    onlyEnabled: boolean = false,
  ): Promise<{
    items: BeneficiosResponseDTO[];
    total: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.beneficiosRepository
        .createQueryBuilder('beneficio')
        .leftJoinAndSelect('beneficio.empresa', 'empresa')
        .leftJoinAndSelect('empresa.empresaUsuarios', 'empresaUsuario')
        .leftJoinAndSelect('empresaUsuario.usuario', 'usuario');

      if (onlyEnabled) {
        queryBuilder.andWhere('beneficio.estado = :estado', {
          estado: BeneficioEstado.APROBADO,
        });
        queryBuilder.andWhere('empresa.habilitada = :habilitada', {
          habilitada: true,
        });
        queryBuilder.andWhere('usuario.habilitado = :habilitado', {
          habilitado: true,
        });
      }

      if (search) {
        queryBuilder.andWhere('beneficio.titulo ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const [beneficios, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('beneficio.fecha_registro', 'DESC')
        .getManyAndCount();

      return {
        items: beneficios.map(this.mapToResponseDto),
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

  async findByEmpresaPaginated(
    idEmpresa: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    try {
      const [beneficios, total] = await this.beneficiosRepository.findAndCount({
        relations: {
          empresa: {
            empresaUsuarios: {
              usuario: true,
            },
          },
        },
        where: {
          empresa: {
            id: idEmpresa,
            empresaUsuarios: {
              usuario: {
                habilitado: true,
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        order: { fecha_registro: 'DESC' },
      });

      return {
        items: beneficios.map(this.mapToResponseDto),
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

  async create(
    createDto: CreateBeneficiosDTO,
    usuarioId: number,
  ): Promise<BeneficiosResponseDTO> {
    try {
      const empresa = await this.empresasRepository.findOne({
        where: {
          id: createDto.id_empresa,
          empresaUsuarios: { usuario: { habilitado: true } },
        },
        relations: {
          empresaUsuarios: {
            usuario: true,
          },
        },
      });

      if (!empresa) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Empresa con ID ${createDto.id_empresa} no encontrada o deshabilitada`,
        });
      }

      if (createDto.cantidad <= 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'La cantidad debe ser mayor a 0',
        });
      }

      if (createDto.valor < 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El valor no puede ser negativo',
        });
      }

      const beneficio = this.beneficiosRepository.create({
        titulo: createDto.titulo,
        tipo: createDto.tipo,
        detalle: createDto.detalle,
        cantidad: createDto.cantidad,
        valor: createDto.valor,
        estado: createDto.estado ?? BeneficioEstado.PENDIENTE,
        empresa,
        creado_por: { id: usuarioId } as Usuario,
        actualizado_por: { id: usuarioId } as Usuario,
      });

      const saved = await this.beneficiosRepository.save(beneficio);
      this.logger.log(`Beneficio creado ID ${saved.id}`);

      return this.mapToResponseDto({ ...saved, empresa });
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

  async canjear(
    beneficioId: number,
    userId: number,
    cantidad: number,
  ): Promise<CanjearResponseDto> {
    try {
      return this.dataSource.transaction(async (manager) => {
        const beneficioRepo = manager.getRepository(Beneficios);
        const usuarioRepo = manager.getRepository(Usuario);
        const usuarioBeneficioRepo = manager.getRepository(UsuarioBeneficio);

        const beneficio = await beneficioRepo.findOne({
          where: { id: beneficioId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!beneficio) {
          throw new ErrorManager({
            type: 'NOT_FOUND',
            message: 'Beneficio no encontrado',
          });
        }

        if (beneficio.cantidad < cantidad) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Stock insuficiente',
          });
        }

        const usuario = await usuarioRepo.findOne({
          where: { id: userId, habilitado: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!usuario) {
          throw new ErrorManager({
            type: 'NOT_FOUND',
            message: 'Usuario no encontrado',
          });
        }

        if (usuario.rol !== Rol.USUARIO) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Solo los usuarios pueden canjear beneficios',
          });
        }

        const totalPuntos = beneficio.valor * cantidad;

        if (usuario.puntos < totalPuntos) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Puntos insuficientes',
          });
        }

        usuario.puntos -= totalPuntos;
        beneficio.cantidad -= cantidad;

        await usuarioRepo.save(usuario);
        await beneficioRepo.save(beneficio);

        const existente = await usuarioBeneficioRepo.findOne({
          where: {
            usuario: { id: userId },
            beneficio: { id: beneficioId },
            estado: BeneficiosUsuarioEstado.ACTIVO,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (existente) {
          existente.cantidad += cantidad;
          await usuarioBeneficioRepo.save(existente);
        } else {
          const nuevo = usuarioBeneficioRepo.create({
            usuario: { id: userId } as Usuario,
            beneficio: { id: beneficioId } as Beneficios,
            cantidad,
            usados: 0,
            estado: BeneficiosUsuarioEstado.ACTIVO,
          });

          await usuarioBeneficioRepo.save(nuevo);
        }

        return {
          success: true,
          cantidadCanjeada: cantidad,
          puntosGastados: totalPuntos,
          puntosRestantes: usuario.puntos,
          stockRestante: beneficio.cantidad,
        };
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
    id: number,
    updateDto: UpdateBeneficiosDTO,
    usuarioId: number,
  ): Promise<BeneficiosResponseDTO> {
    try {
      const beneficio = await this.beneficiosRepository.findOne({
        where: {
          id,
          empresa: {
            empresaUsuarios: {
              usuario: { id: usuarioId },
              activo: true,
            },
          },
        },
        relations: {
          empresa: {
            empresaUsuarios: true,
          },
        },
      });

      if (!beneficio) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Beneficio con ID ${id} no encontrado`,
        });
      }

      this.validateBeneficioData(updateDto);

      const datosActualizar = Object.fromEntries(
        Object.entries(updateDto).filter(([_, valor]) => valor !== undefined),
      );

      Object.assign(beneficio, {
        ...datosActualizar,
        actualizado_por: { id: usuarioId } as Usuario,
      });

      await this.beneficiosRepository.save(beneficio);

      const updated = await this.beneficiosRepository.findOne({
        where: { id },
        relations: {
          empresa: true,
          creado_por: true,
          actualizado_por: true,
        },
      });

      if (!updated) {
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: `Error al recuperar el beneficio actualizado`,
        });
      }

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

  async updateEstado(
    id: number,
    estado: BeneficioEstado,
    usuarioId: number,
    rol: Rol,
  ): Promise<BeneficiosResponseDTO> {
    try {
      const whereCondition =
        rol === Rol.ADMIN
          ? { id }
          : {
              id,
              empresa: {
                empresaUsuarios: {
                  usuario: { id: usuarioId },
                  activo: true,
                },
              },
            };

      const beneficio = await this.beneficiosRepository.findOne({
        where: whereCondition,
        relations: {
          empresa: { empresaUsuarios: { usuario: true } },
        },
      });

      if (!beneficio) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Beneficio con ID ${id} no encontrado`,
        });
      }

      beneficio.estado = estado;
      beneficio.actualizado_por = { id: usuarioId } as Usuario;
      await this.beneficiosRepository.save(beneficio);

      const updated = await this.beneficiosRepository.findOne({
        where: { id },
        relations: {
          empresa: true,
          creado_por: true,
          actualizado_por: true,
        },
      });

      if (!updated) {
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Error al recuperar el beneficio actualizado',
        });
      }

      this.logger.log(`Estado del beneficio ${id} actualizado a ${estado}`);
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

  private validateBeneficioData(data: UpdateBeneficiosDTO): void {
    if (data.cantidad !== undefined && data.cantidad < 0) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'La cantidad no puede ser negativa',
      });
    }

    if (data.valor !== undefined && data.valor < 0) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'El valor no puede ser negativo',
      });
    }
  }

  private readonly mapToResponseDto = (
    beneficio: Beneficios,
  ): BeneficiosResponseDTO => {
    if (!beneficio.empresa) {
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'El beneficio no tiene empresa asociada',
      });
    }

    const empresaSummary: EmpresaSummaryDTO = {
      id: beneficio.empresa.id,
      razon_social: beneficio.empresa.razon_social,
      nombre_empresa: beneficio.empresa.nombre_empresa,
      rubro: beneficio.empresa.rubro,
      verificada: beneficio.empresa.verificada,
      habilitada: beneficio.empresa.habilitada,
      logo: beneficio.empresa.logo
        ? SettingsService.getEmpresaImageUrl(beneficio.empresa.logo)
        : null,
    };

    return {
      id: beneficio.id,
      titulo: beneficio.titulo,
      tipo: beneficio.tipo,
      detalle: beneficio.detalle,
      cantidad: beneficio.cantidad,
      valor: beneficio.valor,
      fecha_registro: beneficio.fecha_registro,
      ultimo_cambio: beneficio.ultimo_cambio,
      empresa: empresaSummary,
      estado: beneficio.estado,

      creado_por: beneficio.creado_por
        ? {
            id: beneficio.creado_por.id,
            nombre: beneficio.creado_por.nombre,
            apellido: beneficio.creado_por.apellido,
          }
        : undefined,

      actualizado_por: beneficio.actualizado_por
        ? {
            id: beneficio.actualizado_por.id,
            nombre: beneficio.actualizado_por.nombre,
            apellido: beneficio.actualizado_por.apellido,
          }
        : undefined,
    };
  };
}
