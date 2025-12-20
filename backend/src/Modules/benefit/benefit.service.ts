import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefits } from 'src/Entities/benefits.entity';
import { Companies } from 'src/Entities/companies.entity';
import { CreateBenefitsDTO } from './dto/create_benefits.dto';
import { UpdateBenefitsDTO } from './dto/update_benefits.dto';
import { BenefitsResponseDTO } from './dto/response_benefits.dto';
import { CompanySummaryDTO } from '../company/dto/summary_company.dto';

/**
 * Servicio que maneja la lógica de negocio de los Beneficios.
 */
@Injectable()
export class BenefitService {
    private readonly logger = new Logger(BenefitService.name);

    constructor(
        @InjectRepository(Benefits)
        private readonly benefitsRepository: Repository<Benefits>,

        @InjectRepository(Companies)
        private readonly companiesRepository: Repository<Companies>,
    ) { }

    /**
     * Obtiene todos los beneficios.
     */
    async findAll(): Promise<BenefitsResponseDTO[]> {
        const benefits = await this.benefitsRepository.find({
            relations: ['empresa'],
            where: { empresa: { deshabilitado: false } }, // Solo empresas activas
        });

        this.logger.log(`Se obtuvieron ${benefits.length} beneficios`);
        return benefits.map(this.mapToResponseDto);
    }

    /**
     * Obtiene un beneficio por ID.
     * @throws NotFoundException
     */
    async findOne(id: number): Promise<BenefitsResponseDTO> {
        const benefit = await this.benefitsRepository.findOne({
            where: { id },
            relations: ['empresa'],
        });

        if (!benefit) {
            throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
        }

        this.logger.log(`Beneficio ${id} obtenido`);
        return this.mapToResponseDto(benefit);
    }

    /**
     * Crea un nuevo beneficio.
     */
    async create(createDto: CreateBenefitsDTO): Promise<BenefitsResponseDTO> {
        // Validar que la empresa existe y está activa
        const empresa = await this.companiesRepository.findOne({
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
        const benefit = this.benefitsRepository.create({
            titulo: createDto.titulo,
            tipo: createDto.tipo,
            detalle: createDto.detalle,
            cantidad: createDto.cantidad,
            empresa,
        });

        const savedBenefit = await this.benefitsRepository.save(benefit);
        this.logger.log(`Beneficio creado con ID: ${savedBenefit.id}`);

        return this.mapToResponseDto(savedBenefit);
    }

    /**
     * Actualiza un beneficio existente.
     */
    async update(
        id: number,
        updateDto: UpdateBenefitsDTO,
    ): Promise<BenefitsResponseDTO> {
        const benefit = await this.benefitsRepository.findOne({
            where: { id },
            relations: ['empresa'],
        });

        if (!benefit) {
            throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
        }

        // Si se actualiza la empresa, validar que existe
        if (updateDto.id_empresa) {
            const empresa = await this.companiesRepository.findOne({
                where: { id: updateDto.id_empresa, deshabilitado: false },
            });

            if (!empresa) {
                throw new NotFoundException(
                    `Empresa con ID ${updateDto.id_empresa} no encontrada o está deshabilitada`,
                );
            }
            benefit.empresa = empresa;
        }

        // Actualizar campos
        Object.keys(updateDto).forEach((key) => {
            if (key !== 'id_empresa' && updateDto[key] !== undefined) {
                benefit[key] = updateDto[key];
            }
        });

        // Actualizar fecha de modificación
        benefit.ultimo_cambio = new Date();

        // Validar cantidad si se actualiza
        if (updateDto.cantidad !== undefined && updateDto.cantidad < 0) {
            throw new BadRequestException('La cantidad no puede ser negativa');
        }

        const updatedBenefit = await this.benefitsRepository.save(benefit);
        this.logger.log(`Beneficio ${id} actualizado`);

        return this.mapToResponseDto(updatedBenefit);
    }

    /**
     * Elimina un beneficio (hard delete).
     */
    async delete(id: number): Promise<void> {
        const benefit = await this.benefitsRepository.findOne({
            where: { id },
        });

        if (!benefit) {
            throw new NotFoundException(`Beneficio con ID ${id} no encontrado`);
        }

        await this.benefitsRepository.remove(benefit);
        this.logger.log(`Beneficio ${id} eliminado`);
    }

    private mapToResponseDto(benefit: Benefits): BenefitsResponseDTO {
        const companySummary: CompanySummaryDTO = {
            id: benefit.empresa.id,
            razon_social: benefit.empresa.razon_social,
            nombre_fantasia: benefit.empresa.nombre_fantasia,
            rubro: benefit.empresa.rubro,
            verificada: benefit.empresa.verificada,
            deshabilitado: benefit.empresa.deshabilitado,
        };

        return {
            id: benefit.id,
            titulo: benefit.titulo,
            tipo: benefit.tipo,
            detalle: benefit.detalle,
            cantidad: benefit.cantidad,
            fecha_registro: benefit.fecha_registro,
            ultimo_cambio: benefit.ultimo_cambio,
            empresa: companySummary,
        };
    }
}
