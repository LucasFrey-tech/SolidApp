import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Campaigns } from 'src/Entities/campaigns.entity';
import { CreateCampaignsDto } from './dto/create_campaigns.dto';
import { UpdateCampaignsDto } from './dto/update_campaigns.dto';
import { ResponseCampaignsDto } from './dto/response_campaigns.dto';
import { OrganizationSummaryDto } from '../organization/dto/summary_organization.dto';
import { Organizations } from 'src/Entities/organizations.entity';

/**
 * Servicio que maneja la lógica de negocio de las Campañas Solidarias
 */

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectRepository(Campaigns)
    private readonly campaignsRepository: Repository<Campaigns>,

    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
  ) {}

  /**
   * Obtiene todas las Campañas Solidarias
   */
  async findAll(): Promise<ResponseCampaignsDto[]> {
    const campaigns = await this.campaignsRepository.find({
      relations: ['organization'],
      where: { organizacion: { deshabilitado: false } }, // Solo organizaciones activas
    });

    this.logger.log(`Se obtuvieron ${campaigns.length} Campañas Solidarias`);
    return campaigns.map(this.mapToResponseDto);
  }

  /**
   * Obtiene una campaña por ID
   */
  async findOne(id: number): Promise<ResponseCampaignsDto> {
    const campaign = await this.campaignsRepository.findOne({
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
  async create(createDto: CreateCampaignsDto): Promise<ResponseCampaignsDto> {
    // Validar que la organización existe y esta activa
    const organizacion = await this.organizationsRepository.findOne({
      where: { id: createDto.id_organizacion, deshabilitado: false },
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
    const campaign = this.campaignsRepository.create({
      titulo: createDto.titulo,
      estado: createDto.estado,
      descripcion: createDto.description,
      objetivo: createDto.objetivo,
      organizacion,
    });

    const saveCampaign = await this.campaignsRepository.save(campaign);
    this.logger.log(`Campaña creado con ID ${saveCampaign.id}`);

    return this.mapToResponseDto(saveCampaign);
  }

  /**
   * Actualiza un Campaña Solidaria existente
   */
  async update(
    id: number,
    updateDto: UpdateCampaignsDto,
  ): Promise<ResponseCampaignsDto> {
    const campaign = await this.campaignsRepository.findOne({
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
        where: { id: updateDto.id_organizacion, deshabilitado: false },
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
        campaign[key as keyof Omit<Campaigns, 'organizacion'>] = updateDto[
          key as keyof UpdateCampaignsDto
        ] as never;
      }
    });

    // Actualizar fecha de modificación
    campaign.ultimo_cambio = new Date();

    // Validar cantidad si se actualiza
    if (updateDto.objetivo != undefined && updateDto.objetivo < 0) {
      throw new BadRequestException('El objetivo no puede ser negativo');
    }

    const updatedCampaign = await this.campaignsRepository.save(campaign);
    this.logger.log(`Campaña Solidaria ${id} actualizada`);

    return this.mapToResponseDto(updatedCampaign);
  }

  async delete(id: number): Promise<void> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(
        `Campaña Solidaria con ID ${id} no encontrada`,
      );
    }

    await this.campaignsRepository.remove(campaign);
    this.logger.log(`Campaña Solidaria ${id} eliminada`);
  }

  private readonly mapToResponseDto = (
    campaign: Campaigns,
  ): ResponseCampaignsDto => {
    const organizationSummary: OrganizationSummaryDto = {
      id: campaign.organizacion.id,
      nombreFantasia: campaign.organizacion.nombre_fantasia,
      verificada: campaign.organizacion.verificada,
    };

    return {
      id: campaign.id,
      titulo: campaign.titulo,
      description: campaign.descripcion,
      estado: campaign.estado,
      fechaRegistro: campaign.fecha_registro,
      fechaInicio: campaign.fecha_inicio,
      fechaFin: campaign.fecha_fin,
      objetivo: campaign.objetivo,
      organizacion: organizationSummary,
    };
  };
}
