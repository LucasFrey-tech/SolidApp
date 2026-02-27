import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Beneficios } from '../../Entities/beneficio.entity';
import { PerfilEmpresa } from '../../Entities/perfil_empresa.entity';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';
import { EmpresaSummaryDTO } from '../empresa/dto/summary_empresa.dto';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';
import { PerfilUsuario } from '../../Entities/perfil_Usuario.entity';
import { UsuarioBeneficio } from '../../Entities/usuario-beneficio.entity';
import { SettingsService } from '../../common/settings/settings.service';
import { RolCuenta } from '../../Entities/cuenta.entity';
import { BeneficioEstado, BeneficiosUsuarioEstado } from './dto/enum/enum';

/**
 * Servicio que maneja la lógica de negocio para los Beneficios.
 */
@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name);

  constructor(
    @InjectRepository(Beneficios)
    private readonly beneficiosRepository: Repository<Beneficios>,

    @InjectRepository(PerfilEmpresa)
    private readonly empresasRepository: Repository<PerfilEmpresa>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todos los Beneficios disponibles.
   *
   * @returns {Promise<BeneficiosResponseDTO[]>} lista de todos los beneficios activos de las empresas.
   */
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    const beneficios = await this.beneficiosRepository.find({
      relations: ['empresa'],
      where: { empresa: { cuenta: { deshabilitado: false } } },
    });

    return beneficios.map(this.mapToResponseDto);
  }

  /**
   * Busca un Beneficio específico por ID.
   *
   * @param {number} id - ID del beneficio a buscar
   * @returns {Promise<BeneficiosResponseDTO>} DTO del Beneficio encontrado
   * @throws {NotFoundException} Si no encuentra ningún beneficio con el ID especificado
   */
  async findOne(id: number): Promise<BeneficiosResponseDTO> {
    const beneficio = await this.beneficiosRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(beneficio);
  }

  /**
   *
   * @param page
   * @param limit
   * @returns
   */
  async findAllPaginated(
    page = 1,
    limit = 10,
    search: string = '',
    onlyEnabled: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.beneficiosRepository
      .createQueryBuilder('beneficio')
      .leftJoinAndSelect('beneficio.empresa', 'empresa')
      .leftJoinAndSelect('empresa.cuenta', 'cuenta');

    if (onlyEnabled) {
      queryBuilder.andWhere('beneficio.estado = :estado', {
        estado: BeneficioEstado.APROBADO,
      });
      queryBuilder.andWhere('cuenta.deshabilitado = :deshabilitado', {
        deshabilitado: 0,
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
  }

  /**
   *
   * @param page
   * @param limit
   * @param search
   * @returns
   */
  async findPaginated(page: number, limit: number, search: string) {
    const startIndex = (page - 1) * limit;
    const [beneficios, total] = await this.beneficiosRepository.findAndCount({
      skip: startIndex,
      relations: ['empresa'],
      take: limit,
      order: { id: 'ASC' },
      where: [
        { titulo: Like(`%${search}%`) },
        { detalle: Like(`%${search}%`) },
      ],
    });

    return {
      items: beneficios.map(this.mapToResponseDto),
      total,
    };
  }

  /**
   * Obtiene todos los beneficios de una empresa específica
   *
   * @param {number} idEmpresa - ID de la empresa específica
   * @returns {Promise<BeneficiosResponseDTO[]>} Lista de Beneficios de una empresa especifica
   */
  async findByEmpresa(idEmpresa: number): Promise<BeneficiosResponseDTO[]> {
    const empresa = await this.empresasRepository.findOne({
      where: { id: idEmpresa, cuenta: { deshabilitado: false } },
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa con ID ${idEmpresa} no encontrada o deshabilitada`,
      );
    }

    const beneficios = await this.beneficiosRepository.find({
      where: { empresa: { id: idEmpresa } },
      relations: ['empresa'],
    });

    return beneficios.map(this.mapToResponseDto);
  }

  /**
   * Obtiene todos los Beneficios disponibles con paginación.
   *
   * @param {number} idEmpresa - ID de la empresa
   * @param {number} page Página solicitada
   * @param {number} limit Cantidad de Beneficios por página
   * @returns {Promise<PaginatedBeneficiosResponseDTO>} Lista de Beneficios paginados y total de registros
   */
  async findByEmpresaPaginated(
    idEmpresa: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    const [beneficios, total] = await this.beneficiosRepository.findAndCount({
      relations: ['empresa', 'empresa.cuenta'],
      where: { empresa: { id: idEmpresa, cuenta: { deshabilitado: false } } },
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha_registro: 'DESC' },
    });

    return {
      items: beneficios.map(this.mapToResponseDto),
      total: total,
    };
  }

  /**
   * Obtiene todos los Beneficios disponibles con paginación.
   *
   * @param {number} idEmpresa - ID de la empresa
   * @param {number} page Página solicitada
   * @param {number} limit Cantidad de Beneficios por página
   * @returns {Promise<PaginatedBeneficiosResponseDTO>} Lista de Beneficios paginados y total de registros
   */
  async findByUsuarioPaginated(
    idUsuario: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    const [beneficios, total] = await this.beneficiosRepository.findAndCount({
      relations: ['beneficio', 'beneficio.empresa'],
      where: {
        usuariosCanje: {
          id: idUsuario,
          usuario: { cuenta: { deshabilitado: false } },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha_registro: 'DESC' },
    });

    return {
      items: beneficios.map(this.mapToResponseDto),
      total: total,
    };
  }

  /**
   * Crea un nuevo Beneficio en el sistema
   *
   * @param {CreateBeneficiosDTO} createDto - Objeto de transferencia de datos con la información del beneficio a crear.
   * @returns {Promise<BeneficiosResponseDTO>} Promesa que resuelve con la entidad del beneficio recién creado.
   * @throws {NotFoundException}  Cuando alguna de las Empresas no se encuenta o esta deshabilitada.
   * @throws {BadRequestException} Cuando la cantidad o valor del beneficio es menor a 0 (cero)
   */
  async create(createDto: CreateBeneficiosDTO): Promise<BeneficiosResponseDTO> {
    const empresa = await this.empresasRepository.findOne({
      where: { id: createDto.id_empresa, cuenta: { deshabilitado: false } },
      relations: ['cuenta'],
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa con ID ${createDto.id_empresa} no encontrada o deshabilitada`,
      );
    }

    if (createDto.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    if (createDto.valor < 0) {
      throw new BadRequestException('El valor no puede ser negativo');
    }

    const beneficio = this.beneficiosRepository.create({
      titulo: createDto.titulo,
      tipo: createDto.tipo,
      detalle: createDto.detalle,
      cantidad: createDto.cantidad,
      valor: createDto.valor,
      estado: createDto.estado ?? BeneficioEstado.PENDIENTE,
      empresa,
    });

    const saved = await this.beneficiosRepository.save(beneficio);
    this.logger.log(`Beneficio creado ID ${saved.id}`);

    return this.mapToResponseDto({ ...saved, empresa });
  }

  /**
   * Canje de un Beneficio por puntos para un Usuario
   *
   * @param {number} beneficioId - ID del Beneficio canjeado
   * @param {number} userId - ID del Usuario que canjeó el Beneficio
   * @param {number} cantidad - Cantidad canjeada de un mismo Beneficio
   * @returns Resultado del canje con información del estado final
   *
   * @throws {NotFoundException} cuando:
   * - No se encontró el Beneficio deseado.
   * - No se encontró el Usuario.
   *
   * @throws {BadRequestException} cuando:
   * - No hay stock suficiente del beneficio.
   * - El usuario no tiene suficientes puntos.
   * - Si alguien que no sea un Usuario quiere realizar el canje.
   */
  async canjear(beneficioId: number, userId: number, cantidad: number) {
    return this.dataSource.transaction(async (manager) => {
      const beneficioRepo = manager.getRepository(Beneficios);
      const usuarioRepo = manager.getRepository(PerfilUsuario);
      const usuarioBeneficioRepo = manager.getRepository(UsuarioBeneficio);

      const beneficio = await beneficioRepo.findOne({
        where: { id: beneficioId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!beneficio) {
        throw new NotFoundException('Beneficio no encontrado');
      }

      if (beneficio.cantidad < cantidad) {
        throw new BadRequestException('Stock insuficiente');
      }

      const usuario = await usuarioRepo.findOne({
        where: { id: userId, cuenta: { deshabilitado: false } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (usuario.cuenta.role != RolCuenta.USUARIO) {
        throw new BadRequestException(
          'Solo los usuarios pueden canjear beneficios',
        );
      }

      const totalPuntos = beneficio.valor * cantidad;

      if (usuario.puntos < totalPuntos) {
        throw new BadRequestException('Puntos insuficientes');
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
          usuario: { id: userId } as PerfilUsuario,
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
  }

  /**
   * Actualiza un Beneficio en el sistema.
   *
   * @param {number} id - ID del Beneficio a actualizar
   * @param {UpdateBeneficiosDTO} updateDto - DTO con los nuevos datos para el Beneficio
   * @returns {Promise<BeneficiosResponseDTO>} Promesa que resuelve con el DTO de Beneficios actualizado
   *
   * @throws {NotFoundException} cuando no se encuentra el ID del beneficio deseado.
   *
   * @throws {BadRequestException} cuando:
   * - La cantidad del Beneficio es menor a 0 (cero).
   * - El valor del Beneficio es menor a 0 (cero).
   */
  async update(
    id: number,
    updateDto: UpdateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    const beneficio = await this.beneficiosRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    // Validaciones
    if (updateDto.cantidad !== undefined && updateDto.cantidad < 0) {
      throw new BadRequestException('La cantidad no puede ser negativa');
    }

    if (updateDto.valor !== undefined && updateDto.valor < 0) {
      throw new BadRequestException('El valor no puede ser negativo');
    }

    if (updateDto.titulo !== undefined) {
      beneficio.titulo = updateDto.titulo;
    }

    if (updateDto.tipo !== undefined) {
      beneficio.tipo = updateDto.tipo;
    }

    if (updateDto.detalle !== undefined) {
      beneficio.detalle = updateDto.detalle;
    }

    if (updateDto.cantidad !== undefined) {
      beneficio.cantidad = updateDto.cantidad;
    }

    if (updateDto.valor !== undefined) {
      beneficio.valor = updateDto.valor;
    }

    const updated = await this.beneficiosRepository.save(beneficio);
    this.logger.log(`Beneficio ${id} actualizado`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Actualiza el estado de un Beneficio
   *
   * @param {number} id - ID del Beneficio a actualizar
   * @param {string} estado - Nuevo Estado del Beneficio
   * @returns {Promise<BeneficiosResponseDTO>} Promesa que resuelve con el estado actualizado del Beneficio seleccionado.
   *
   * @throws {NotFoundException} cuando el Beneficio seleccionado no es encontrado.
   */
  async updateEstado(
    id: number,
    estado: BeneficioEstado,
  ): Promise<BeneficiosResponseDTO> {
    const beneficio = await this.beneficiosRepository.findOne({
      where: { id },
      relations: ['empresa', 'empresa.cuenta'],
    });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    beneficio.estado = estado;

    const updated = await this.beneficiosRepository.save(beneficio);

    this.logger.log(`Estado del beneficio ${id} actualizado a ${estado}`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Mapea una entidad Beneficios a su DTO de respuesta.
   *
   * @param {Beneficios} beneficio - Entidad Beneficios con la relación empresa cargada.
   * @returns {BeneficiosResponseDTO} DTO listo para ser enviado como respuesta de la API
   */
  private readonly mapToResponseDto = (
    beneficio: Beneficios,
  ): BeneficiosResponseDTO => {
    const empresaSummary: EmpresaSummaryDTO = {
      id: beneficio.empresa.id,
      razon_social: beneficio.empresa.razon_social,
      nombre_empresa: beneficio.empresa.nombre_empresa,
      rubro: beneficio.empresa.rubro,
      verificada: beneficio.empresa.verificada,
      deshabilitado: beneficio.empresa.cuenta.deshabilitado,
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
    };
  };
}
