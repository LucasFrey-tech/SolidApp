import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Beneficios } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';
import { EmpresaSummaryDTO } from '../empresa/dto/summary_empresa.dto';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';
import { Usuario } from '../../Entities/usuario.entity';
import { UsuarioBeneficio } from '../../Entities/usuario-beneficio.entity';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name);

  constructor(
    @InjectRepository(Beneficios)
    private readonly beneficiosRepository: Repository<Beneficios>,

    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,

    private readonly dataSource: DataSource,
  ) { }

  // ===============================
  // LISTAR TODOS
  // ===============================
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    const beneficios = await this.beneficiosRepository.find({
      relations: ['empresa'],
      where: { empresa: { deshabilitado: false } },
    });

    return beneficios.map(this.mapToResponseDto);
  }

  // ===============================
  // OBTENER UNO
  // ===============================
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

  // ===============================
  // PAGINADO
  // ===============================
  async findAllPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [beneficios, total] = await this.beneficiosRepository.findAndCount({
      relations: ['empresa'],
      where: { empresa: { deshabilitado: false } },
      skip,
      take: limit,
      order: { fecha_registro: 'DESC' },
    });

    return {
      items: beneficios.map(this.mapToResponseDto),
      total,
    };
  }

  async findPaginated(page: number, limit: number, search: string) {
    const startIndex = (page - 1) * limit;
    const [beneficios, total] = await this.beneficiosRepository.findAndCount({
      skip: startIndex,
      take: limit,
      order: { id: 'ASC' },
      where: [
        { titulo: Like(`%${search}%`)},
        { detalle: Like(`%${search}%`)}
      ],
    });


    return {
      items: beneficios.map(this.mapToResponseDto),
      total
    };
  }

  async findByEmpresaPaginated(
    idEmpresa: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    const [beneficios, total] = await this.beneficiosRepository.findAndCount({
      relations: ['empresa'],
      where: { empresa: { id: idEmpresa, deshabilitado: false } },
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha_registro: 'DESC' },
    });

    return {
      items: beneficios.map(this.mapToResponseDto),
      total: total,
    };
  }

  // ===============================
  // CREAR
  // ===============================
  async create(createDto: CreateBeneficiosDTO): Promise<BeneficiosResponseDTO> {
    const empresa = await this.empresasRepository.findOne({
      where: { id: createDto.id_empresa, deshabilitado: false },
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
      ...createDto,
      empresa,
    });

    const saved = await this.beneficiosRepository.save(beneficio);
    this.logger.log(`Beneficio creado ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  // ===============================
  // POR EMPRESA
  // ===============================
  async findByEmpresa(idEmpresa: number): Promise<BeneficiosResponseDTO[]> {
    const empresa = await this.empresasRepository.findOne({
      where: { id: idEmpresa, deshabilitado: false },
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

  // ===============================
  // CANJEAR PUNTOS
  // ===============================
  async canjear(
    beneficioId: number,
    userId: number,
    cantidad: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const beneficioRepo = manager.getRepository(Beneficios);
      const usuarioRepo = manager.getRepository(Usuario);
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
        where: { id: userId, deshabilitado: false },
        lock: { mode: 'pessimistic_write' },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (usuario.rol !== 'usuario') {
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
          estado: 'activo',
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
          estado: 'activo',
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

  // ===============================
  // UPDATE
  // ===============================
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

    // 👇 asignamos SOLO campos simples
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


  // ===============================
  // DELETE
  // ===============================
  async delete(id: number): Promise<void> {
    const beneficio = await this.beneficiosRepository.findOne({
      where: { id },
    });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    await this.beneficiosRepository.remove(beneficio);
  }

  // ===============================
  // MAPPER
  // ===============================
  private readonly mapToResponseDto = (
    beneficio: Beneficios,
  ): BeneficiosResponseDTO => {
    const empresaSummary: EmpresaSummaryDTO = {
      id: beneficio.empresa.id,
      razon_social: beneficio.empresa.razon_social,
      nombre_fantasia: beneficio.empresa.nombre_fantasia,
      rubro: beneficio.empresa.rubro,
      verificada: beneficio.empresa.verificada,
      deshabilitado: beneficio.empresa.deshabilitado,
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
    };
  };
}
