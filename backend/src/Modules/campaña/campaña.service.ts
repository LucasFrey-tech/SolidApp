import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campañas } from '../../Entities/campañas.entity';
import { CreateCampañaDto } from './dto/create_campaña.dto';
import { UpdateCampañaDto } from './dto/update_campaña.dto';
import { ResponseCampañaDto } from './dto/response_campaña.dto';
import { OrganizacionSummaryDto } from '../organizacion/dto/summary_organization.dto';
import { Organizacion } from '../../Entities/organizacion.entity';

/**
 * Servicio que maneja la lógica de negocio de las Campañas Solidarias
 */

@Injectable()
export class CampañaService {
  private readonly logger = new Logger(CampañaService.name);

  constructor(
    @InjectRepository(Campañas)
    private readonly CampañaRepository: Repository<Campañas>,

    @InjectRepository(Organizacion)
    private readonly organizationsRepository: Repository<Organizacion>,
  ) {}

  /**
   * Obtiene todas las Campañas Solidarias
   */
  async findAll(): Promise<ResponseCampañaDto[]> {
    const Campaña = await this.CampañaRepository.find({
      relations: ['organizacion'],
      where: { organizacion: { usuario: { deshabilitado: false } } }, // Solo organizaciones activas
    });

    this.logger.log(`Se obtuvieron ${Campaña.length} Campañas Solidarias`);
    return Campaña.map(this.mapToResponseDto);
  }

  /**
   * Obtiene una campaña por ID
   */
  async findOne(id: number): Promise<ResponseCampañaDto> {
    const campaign = await this.CampañaRepository.findOne({
      where: { id },
      relations: ['organizacion'],
    });

    if (!campaign) {
      throw new NotFoundException(`
        La Campaña Solidaria con ID ${id} no encontrada`);
    }

    this.logger.log(`Campaña Solidaria ${id} obtenida`);
    return this.mapToResponseDto(campaign);
  }

  /**
   * Crea una nueva Campaña Solidaria
   */
  async create(createDto: CreateCampañaDto): Promise<ResponseCampañaDto> {
    // Validar que la organización existe y esta activa
    const organizacion = await this.organizationsRepository.findOne({
      where: {
        id: createDto.id_organizacion,
        usuario: { deshabilitado: false },
      },
    });

    if (!organizacion) {
      throw new NotFoundException(
        `Organización con ID ${createDto.id_organizacion} no encontrada o está deshabilitada`,
      );
    }

    // Validar que el Objetivo sea mayor a 0
    if (createDto.objetivo <= 0) {
      throw new BadRequestException('El Objetivo tiene que ser mayor a 0');
    }

    // Creación de la Campaña Solidaria
    const campaign = this.CampañaRepository.create({
      titulo: createDto.titulo,
      estado: createDto.estado,
      descripcion: createDto.description,
      objetivo: createDto.objetivo,
      organizacion,
    });

    const saveCampaign = await this.CampañaRepository.save(campaign);
    this.logger.log(`Campaña creado con ID ${saveCampaign.id}`);

    return this.mapToResponseDto(saveCampaign);
  }

  /**
   * Actualiza un Campaña Solidaria existente
   */
  async update(
    id: number,
    updateDto: UpdateCampañaDto,
  ): Promise<ResponseCampañaDto> {
    const campaign = await this.CampañaRepository.findOne({
      where: { id },
      relations: ['organizacion'],
    });

    if (!campaign) {
      throw new NotFoundException(`
        Campaña Solidaria con ID ${id} no encontrada`);
    }

    // Si se actualiza la organizacion, validar que existe
    if (updateDto.id_organizacion) {
      const organizacion = await this.organizationsRepository.findOne({
        where: {
          id: updateDto.id_organizacion,
          usuario: { deshabilitado: false },
        },
      });

      if (!organizacion) {
        throw new NotFoundException(
          `Organización con ID ${updateDto.id_organizacion} no encontrada o está deshabilitada`,
        );
      }

      campaign.organizacion = organizacion;
    }

    // Actualizar campos
    Object.keys(updateDto).forEach((key) => {
      if (key !== 'id_organizacion' && updateDto[key] !== undefined) {
        campaign[key as keyof Omit<Campañas, 'organizacion'>] = updateDto[
          key as keyof CreateCampañaDto
        ] as never;
      }
    });

    // Actualizar fecha de modificación
    campaign.ultimo_cambio = new Date();

    // Validar cantidad si se actualiza
    if (updateDto.objetivo != undefined && updateDto.objetivo < 0) {
      throw new BadRequestException('El objetivo no puede ser negativo');
    }

    const updatedCampaign = await this.CampañaRepository.save(campaign);
    this.logger.log(`Campaña Solidaria ${id} actualizada`);

    return this.mapToResponseDto(updatedCampaign);
  }

  async delete(id: number): Promise<void> {
    const campaign = await this.CampañaRepository.findOne({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(
        `Campaña Solidaria con ID ${id} no encontrada`,
      );
    }

    await this.CampañaRepository.remove(campaign);
    this.logger.log(`Campaña Solidaria ${id} eliminada`);
  }

  private readonly mapToResponseDto = (
    campaña: Campañas,
  ): ResponseCampañaDto => {
    const organizacionSummary: OrganizacionSummaryDto = {
      id: campaña.organizacion.id,
      nombre_Organizacion: campaña.organizacion.nombre_Organizacion,
      verificada: campaña.organizacion.verificada,
    };

    return {
      id: campaña.id,
      titulo: campaña.titulo,
      description: campaña.descripcion,
      estado: campaña.estado,
      fechaRegistro: campaña.fecha_registro,
      fechaInicio: campaña.fecha_inicio,
      fechaFin: campaña.fecha_fin,
      objetivo: campaña.objetivo,
      organizacion: organizacionSummary,
    };
  };
}
