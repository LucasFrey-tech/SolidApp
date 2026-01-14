import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficios } from '../../Entities/beneficio.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';
import { EmpresaSummaryDTO } from '../empresa/dto/summary_empresa.dto';

/**
 * Servicio que maneja la lógica de negocio de los Beneficios.
 */
@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name);

  constructor(
    @InjectRepository(Beneficios)
    private readonly beneficiosRepository: Repository<Beneficios>,

    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
  ) {}

  /**
   * Obtiene todos los beneficios.
   */
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    const beneficios = await this.beneficiosRepository.find({
      relations: ['empresa'],
      where: { empresa: { deshabilitado: false } }, // Solo empresas activas
    });

    this.logger.log(`Se obtuvieron ${beneficios.length} beneficios`);
    return beneficios.map(this.mapToResponseDto);
  }

  /**
   * Obtiene un beneficio por ID.
   * @throws NotFoundException
   */
  async findOne(id: number): Promise<BeneficiosResponseDTO> {
    const beneficio = await this.beneficiosRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    this.logger.log(`Beneficio ${id} obtenido`);
    return this.mapToResponseDto(beneficio);
  }

  /**
   * Crea un nuevo beneficio.
   */
  async create(createDto: CreateBeneficiosDTO): Promise<BeneficiosResponseDTO> {
    // Validar que la empresa existe y está activa
    const empresa = await this.empresasRepository.findOne({
      where: { id: createDto.id_empresa, deshabilitado: false },
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa con ID ${createDto.id_empresa} no encontrada o está deshabilitada`,
      );
    }

    // Validar que la cantidad sea positiva
    if (createDto.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    // Crear el beneficio
    const beneficio = this.beneficiosRepository.create({
      titulo: createDto.titulo,
      tipo: createDto.tipo,
      detalle: createDto.detalle,
      cantidad: createDto.cantidad,
      empresa,
    });

    const savedBenefit = await this.beneficiosRepository.save(beneficio);
    this.logger.log(`Beneficio creado con ID: ${savedBenefit.id}`);

    return this.mapToResponseDto(savedBenefit);
  }

  /**
   * Actualiza un beneficio existente.
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

    // Si se actualiza la empresa, validar que existe
    if (updateDto.id_empresa) {
      const empresa = await this.empresasRepository.findOne({
        where: { id: updateDto.id_empresa, deshabilitado: false },
      });

      if (!empresa) {
        throw new NotFoundException(
          `Empresa con ID ${updateDto.id_empresa} no encontrada o está deshabilitada`,
        );
      }
      beneficio.empresa = empresa;
    }

    // Actualizar campos
    Object.keys(updateDto).forEach((key) => {
      if (key !== 'id_empresa' && updateDto[key] !== undefined) {
        beneficio[key as keyof Omit<Beneficios, 'empresa'>] = updateDto[
          key as keyof UpdateBeneficiosDTO
        ] as never;
      }
    });

    // Actualizar fecha de modificación
    beneficio.ultimo_cambio = new Date();

    // Validar cantidad si se actualiza
    if (updateDto.cantidad !== undefined && updateDto.cantidad < 0) {
      throw new BadRequestException('La cantidad no puede ser negativa');
    }

    const updatedBenefit = await this.beneficiosRepository.save(beneficio);
    this.logger.log(`Beneficio ${id} actualizado`);

    return this.mapToResponseDto(updatedBenefit);
  }

  /**
   * Elimina un beneficio (hard delete).
   */
  async delete(id: number): Promise<void> {
    const beneficio = await this.beneficiosRepository.findOne({
      where: { id },
    });

    if (!beneficio) {
      throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
    }

    await this.beneficiosRepository.remove(beneficio);
    this.logger.log(`Beneficio ${id} eliminado`);
  }

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
      fecha_registro: beneficio.fecha_registro,
      ultimo_cambio: beneficio.ultimo_cambio,
      empresa: empresaSummary,
    };
  };
}
