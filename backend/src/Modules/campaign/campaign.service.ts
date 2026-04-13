import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaigns } from '../../Entities/campaigns.entity';
import { CreateCampaignsDto } from './dto/create_campaigns.dto';
import { UpdateCampaignsDto } from './dto/update_campaigns.dto';
import { ResponseCampaignsDto } from './dto/response_campaigns.dto';
import { OrganizacionSummaryDto } from '../organizacion/dto/summary_organizacion.dto';
import { Organizacion } from '../../Entities/organizacion.entity';
import { CampaignEstado } from './enum';
import { imagenes_campania } from '../../Entities/imagenes_campania.entity';
import { ResponseCampaignDetalleDto } from './dto/response_campaignDetalle.dto';
import * as path from 'path';
import { ResponseCampaignsDetailPaginatedDto } from './dto/response_campaign_paginated.dto';
import { Usuario } from '../../Entities/usuario.entity';
import { ErrorManager } from '../../common/errors/error.manager';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaigns)
    private readonly campaignsRepository: Repository<Campaigns>,

    @InjectRepository(Organizacion)
    private readonly organizacionRepository: Repository<Organizacion>,

    @InjectRepository(imagenes_campania)
    private readonly campaignsImagesRepository: Repository<imagenes_campania>,
  ) {}

  async findPaginated(
    page: number,
    limit: number,
    search: string,
    onlyEnabled: boolean = false,
  ): Promise<{
    items: ResponseCampaignDetalleDto[];
    total: number;
  }> {
    try {
      const query = this.campaignsRepository
        .createQueryBuilder('campaign')
        .leftJoinAndSelect('campaign.organizacion', 'organizacion')
        .leftJoinAndSelect('campaign.imagenes', 'imagenes')
        .leftJoin('organizacion.organizacionUsuarios', 'orgUsers')
        .leftJoin('orgUsers.usuario', 'usuario');

      query.andWhere('usuario.habilitado = :habilitado', { habilitado: true });
      query.andWhere('organizacion.habilitada = :habilitada', {
        habilitada: true,
      });

      if (onlyEnabled) {
        query.andWhere('campaign.estado = :estado', {
          estado: CampaignEstado.ACTIVA,
        });
        query.andWhere('campaign.objetivo > 0');
      }

      if (search) {
        query.andWhere(
          '(campaign.titulo LIKE :search OR campaign.descripcion LIKE :search)',
          { search: `%${search}%` },
        );
      }

      const [campaigns, total] = await query
        .orderBy('campaign.fecha_Registro', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        items: campaigns.map((c) => this.mapToDetailDto(c)),
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

  async findCampaignsPaginated(
    organizacionId: number,
    page: number,
    limit: number,
  ): Promise<ResponseCampaignsDetailPaginatedDto> {
    try {
      const [campaigns, total] = await this.campaignsRepository.findAndCount({
        where: { organizacion: { id: organizacionId } },
        relations: ['organizacion', 'imagenes'],
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        items: campaigns.map(this.mapToDetailDto),
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

  async findOneDetail(id: number): Promise<ResponseCampaignDetalleDto> {
    try {
      const campaign = await this.campaignsRepository.findOne({
        where: { id },
        relations: ['organizacion', 'imagenes'],
      });

      if (!campaign) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Campaña no encontrada',
        });
      }

      return this.mapToDetailDto(campaign);
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
    id: number,
    createDto: CreateCampaignsDto,
    imagenes: string[],
    usuarioId: number,
  ): Promise<ResponseCampaignsDto> {
    try {
      const organizacion = await this.organizacionRepository.findOne({
        where: {
          id: id,
          habilitada: true,
        },
      });

      if (!organizacion) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organización con ID ${id} no encontrada o está deshabilitada`,
        });
      }

      if (createDto.objetivo <= 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El objetivo tiene que ser mayor a 0',
        });
      }

      this.validarRangoFechas(createDto.fecha_Inicio, createDto.fecha_Fin);

      const campaign = this.campaignsRepository.create({
        titulo: createDto.titulo,
        descripcion: createDto.descripcion,
        fecha_Inicio: createDto.fecha_Inicio,
        fecha_Fin: createDto.fecha_Fin,
        objetivo: createDto.objetivo,
        puntos: createDto.puntos,
        estado: CampaignEstado.PENDIENTE,
        organizacion,
        creado_por: { id: usuarioId },
        actualizado_por: { id: usuarioId },
      });

      const saveCampaign = await this.campaignsRepository.save(campaign);
      this.logger.log(`Campaña creado con ID ${saveCampaign.id}`);

      await Promise.all(
        imagenes.map((imagen, index) => {
          const imagenCampania = new imagenes_campania();
          imagenCampania.esPortada = index === 0;
          imagenCampania.campaign = saveCampaign;
          imagenCampania.imagen = imagen;
          return this.campaignsImagesRepository.save(imagenCampania);
        }),
      );

      const campaignCompleta = await this.campaignsRepository.findOne({
        where: { id: saveCampaign.id },
        relations: [
          'creado_por',
          'actualizado_por',
          'organizacion',
          'imagenes',
        ],
      });

      if (!campaignCompleta) {
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Error al recuperar la campaña recién creada',
        });
      }

      return this.mapToResponseDto(campaignCompleta);
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
    organizacionId: number,
    campaignId: number,
    updateDto: UpdateCampaignsDto,
    usuarioId: number,
    imagenes?: string[],
  ): Promise<ResponseCampaignsDto> {
    try {
      const campaign = await this.campaignsRepository.findOne({
        where: { id: campaignId },
        relations: ['organizacion', 'creado_por', 'actualizado_por'],
      });

      if (!campaign) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Campaña con ID ${campaignId} no encontrada`,
        });
      }

      if (campaign.organizacion.id !== organizacionId) {
        throw new ErrorManager({
          type: 'FORBIDDEN',
          message: 'Esta campaña no pertenece a tu organización',
        });
      }

      const organizacion = await this.organizacionRepository.findOne({
        where: {
          id: organizacionId,
          habilitada: true,
        },
      });

      if (!organizacion) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Organización con ID ${organizacionId} no encontrada o está deshabilitada`,
        });
      }

      campaign.organizacion = organizacion;

      if (updateDto.objetivo !== undefined && updateDto.objetivo < 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El objetivo no puede ser negativo',
        });
      }

      Object.keys(updateDto).forEach((key) => {
        if (
          key !== 'id_organizacion' &&
          key !== 'imagenesExistentes' &&
          updateDto[key] !== undefined
        ) {
          campaign[key as keyof Omit<Campaigns, 'organizacion'>] = updateDto[
            key as keyof UpdateCampaignsDto
          ] as never;
        }
      });

      if (
        updateDto.estado === undefined &&
        updateDto.fecha_Inicio &&
        updateDto.fecha_Fin
      ) {
        campaign.estado = this.setEstado(
          updateDto.fecha_Inicio,
          updateDto.fecha_Fin,
        );
      }

      campaign.actualizado_por = { id: usuarioId } as Usuario;
      campaign.ultimo_cambio = new Date();

      const updatedCampaign = await this.campaignsRepository.save(campaign);
      this.logger.log(`Campaña Solidaria ${campaignId} actualizada`);

      const imagenesExistentesAConservar: string[] =
        updateDto.imagenesExistentes ?? [];
      const hayNuevasImagenes = imagenes && imagenes.length > 0;

      if (hayNuevasImagenes || updateDto.imagenesExistentes !== undefined) {
        const imagenesActuales = await this.campaignsImagesRepository.find({
          where: { campaign: { id: campaignId } },
        });

        const imagenesAEliminar = imagenesActuales.filter(
          (img) => !imagenesExistentesAConservar.includes(img.imagen),
        );

        if (imagenesAEliminar.length > 0) {
          await this.campaignsImagesRepository.remove(imagenesAEliminar);
        }

        if (hayNuevasImagenes) {
          const hayPortadaExistente =
            await this.campaignsImagesRepository.findOne({
              where: { campaign: { id: campaignId }, esPortada: true },
            });

          await Promise.all(
            imagenes.map((imagen, index) => {
              const newImage = new imagenes_campania();
              newImage.campaign = campaign;
              newImage.imagen = imagen;
              newImage.esPortada = !hayPortadaExistente && index === 0;
              return this.campaignsImagesRepository.save(newImage);
            }),
          );
        }
      }

      return this.mapToResponseDto(updatedCampaign);
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

  async updateEstado(id: number, estado: CampaignEstado): Promise<Campaigns> {
    try {
      const campaign = await this.campaignsRepository.findOne({
        where: { id },
      });

      if (!campaign) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Campaña con ID ${id} no encontrada`,
        });
      }

      campaign.estado = estado;

      return await this.campaignsRepository.save(campaign);
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
      const campaign = await this.campaignsRepository.findOne({
        where: { id },
      });

      if (!campaign) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Campaña con ID ${id} no encontrada`,
        });
      }

      await this.campaignsRepository.remove(campaign);
      this.logger.log(`Campaña Solidaria ${id} eliminada`);
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

  private readonly mapToResponseDto = (
    campaign: Campaigns,
  ): ResponseCampaignsDto => {
    const organizationSummary: OrganizacionSummaryDto = {
      id: campaign.organizacion.id,
      nombre_organizacion: campaign.organizacion.nombre_organizacion,
      verificada: campaign.organizacion.verificada,
    };

    const portada =
      campaign.imagenes?.find((img) => img.esPortada) ??
      campaign.imagenes?.[0] ??
      null;

    return {
      id: campaign.id,
      titulo: campaign.titulo,
      descripcion: campaign.descripcion,
      estado: campaign.estado,
      fecha_Registro: campaign.fecha_Registro,
      fecha_Inicio: campaign.fecha_Inicio,
      fecha_Fin: campaign.fecha_Fin,
      objetivo: campaign.objetivo,
      puntos: campaign.puntos,
      organizacion: organizationSummary,
      imagenPortada: portada ? portada.imagen : null,

      creado_por: campaign.creado_por
        ? {
            id: campaign.creado_por.id,
            nombre: campaign.creado_por.nombre,
            apellido: campaign.creado_por.apellido,
          }
        : undefined,

      actualizado_por: campaign.actualizado_por
        ? {
            id: campaign.actualizado_por.id,
            nombre: campaign.actualizado_por.nombre,
            apellido: campaign.actualizado_por.apellido,
          }
        : undefined,

      ultimo_cambio: campaign.ultimo_cambio,
    };
  };

  private readonly mapToDetailDto = (
    campaign: Campaigns,
  ): ResponseCampaignDetalleDto => {
    return {
      ...this.mapToResponseDto(campaign),

      imagenes:
        campaign.imagenes?.map((img) => ({
          id: img.id,
          nombre: path.parse(img.imagen).name,
          url: img.imagen,
          esPortada: img.esPortada,
        })) ?? [],
    };
  };

  private setEstado(inicio: Date, fin: Date): CampaignEstado {
    this.validarRangoFechas(inicio, fin);

    const hoy = new Date();

    if (hoy < inicio) return CampaignEstado.PENDIENTE;

    if (hoy > fin) return CampaignEstado.FINALIZADA;

    return CampaignEstado.ACTIVA;
  }

  private validarRangoFechas(inicio: Date, fin: Date): void {
    if (!inicio || !fin) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'Las fechas son obligatorias',
      });
    }

    if (isNaN(new Date(inicio).getTime()) || isNaN(new Date(fin).getTime())) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'Fechas inválidas',
      });
    }

    if (fin <= inicio) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      });
    }
  }
}
