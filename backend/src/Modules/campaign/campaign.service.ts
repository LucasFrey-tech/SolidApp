import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
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

/**
 * Servicio que maneja la lógica de negocio de las Campañas Solidarias
 */
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

  /**
   * Obtiene todas las Campañas paginadas activas, incluyendo imagenes.
   *
   * @param {number} page - Página solicitada
   * @param {number} limit - Cantidad de Campañas por página
   * @param {string} search - Término de busqueda
   * @returns Lista de Campañas paginadas
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
    onlyEnabled: boolean = false,
  ) {
    const query = this.campaignsRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.organizacion', 'organizacion')
      .leftJoinAndSelect('campaign.imagenes', 'imagenes')
      .leftJoin('organizacion.organizacionUsuarios', 'orgUsers')
      .leftJoin('orgUsers.usuario', 'usuario');

    query.andWhere('usuario.habilitado = :habilitado', { habilitado: 1 });
    query.andWhere('organizacion.habilitada = :habilitada', { habilitada: 1 });

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
  }

  /**
   * Obtiene todas las Campañas paginadas de una Organizacion específica.
   *
   * @param {number} organizacionId - ID de la Organización
   * @param {number} page - Página solicitada
   * @param {number} limit - Cantidad de Campañas por página
   * @returns  Lista de Campañas paginadas
   */
  async findCampaignsPaginated(
    organizacionId: number,
    page: number,
    limit: number,
  ): Promise<ResponseCampaignsDetailPaginatedDto> {
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
  }

  /**
   * Obtiene una Campaña específica, incluyendo imagenes.
   *
   * @param {number} id - ID de la Campaña a buscar
   * @returns {Promise<ResponseCampaignDetalleDto>} DTO de la Campaña encontrada, incluyendo las imagenes.
   * @throws {NotFoundException} Si no encuentra ninguna campaña con el ID especificado
   */
  async findOneDetail(id: number): Promise<ResponseCampaignDetalleDto> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['organizacion', 'imagenes'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }

    return this.mapToDetailDto(campaign);
  }

  /**
   * Crea una nueva Campaña en el sistema.
   *
   * @param {CreateCampaignsDto} createDto - DTO con los datos de la campaña
   * @param {string} imagenes - Imagenes de la Campaña
   * @returns {Promise<CreateCampaignsDto>} Promesa que resuelve con la entidad de la campaña recién creada.
   * @throws {NotFoundException} Cuando la Organizacion no se encuentra o esta deshabilitada
   * @throws {BadRequestException} Cuando el objetivo es menor a 0 (cero)
   */
  async create(
    id: number,
    createDto: CreateCampaignsDto,
    imagenes: string[],
    usuarioId: number,
  ): Promise<ResponseCampaignsDto> {
    const organizacion = await this.organizacionRepository.findOne({
      where: {
        id: id,
        habilitada: true,
      },
    });

    if (!organizacion) {
      throw new NotFoundException(
        `Organización con ID ${id} no encontrada o está deshabilitada`,
      );
    }

    if (createDto.objetivo <= 0) {
      throw new BadRequestException('El Objetivo tiene que ser mayor a 0');
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

    for (let index = 0; index < imagenes.length; index++) {
      const element = imagenes[index];
      const imagenesCampania = new imagenes_campania();
      if (index === 0) {
        imagenesCampania.esPortada = true;
      }
      imagenesCampania.campaign = saveCampaign;
      imagenesCampania.imagen = element;
      await this.campaignsImagesRepository.save(imagenesCampania);
    }

    const campaignCompleta = await this.campaignsRepository.findOne({
      where: { id: saveCampaign.id },
      relations: ['creado_por', 'actualizado_por', 'organizacion', 'imagenes'],
    });

    if (!campaignCompleta) {
      throw new InternalServerErrorException(
        'Error al recuperar la campaña recién creada',
      );
    }

    return this.mapToResponseDto(campaignCompleta);
  }

  /**
   * Actualiza los datos de una Campaña del sistema.
   *
   * @param {number} id - ID de la Campaña a actualizar
   * @param {UpdateCampaignsDto} updateDto - DTO con la informacion actualizada de la Campaña
   * @returns {Promise<ResponseCampaignsDto>} Promesa que resuelve con el DTO actualizado
   *
   * @throws {NotFoundException} cuando:
   * - No se encuentra el ID de la Campaña solicitada
   * - No se encuentra el ID de la Organización solicitada
   *
   * @throws {BadRequestException} cuando el objetivo de la Campaña es menor a 0
   */
  async update(
    id: number,
    updateDto: UpdateCampaignsDto,
    usuarioId: number,
    imagenes?: string[],
  ): Promise<ResponseCampaignsDto> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: id },
      relations: ['organizacion', 'creador_por', 'actualizado_por'],
    });

    if (!campaign) {
      throw new NotFoundException(
        `Campaña Solidaria con ID ${id} no encontrada`,
      );
    }

    if (campaign.organizacion.id !== id) {
      throw new ForbiddenException(
        'Esta campaña no pertenece a tu organización',
      );
    }

    const organizacion = await this.organizacionRepository.findOne({
      where: {
        id: id,
        habilitada: true,
      },
    });

    if (!organizacion) {
      throw new NotFoundException(
        `Organización con ID ${id} no encontrada o está deshabilitada`,
      );
    }

    campaign.organizacion = organizacion;

    if (updateDto.objetivo !== undefined && updateDto.objetivo < 0) {
      throw new BadRequestException('El objetivo no puede ser negativo');
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
    this.logger.log(`Campaña Solidaria ${id} actualizada`);

    const imagenesExistentesAConservar: string[] =
      updateDto.imagenesExistentes ?? [];
    const hayNuevasImagenes = imagenes && imagenes.length > 0;

    if (hayNuevasImagenes || updateDto.imagenesExistentes !== undefined) {
      const imagenesActuales = await this.campaignsImagesRepository.find({
        where: { campaign: { id } },
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
            where: { campaign: { id }, esPortada: true },
          });

        for (let index = 0; index < imagenes.length; index++) {
          const newImage = new imagenes_campania();
          newImage.campaign = campaign;
          newImage.imagen = imagenes[index];
          newImage.esPortada = !hayPortadaExistente && index === 0;
          await this.campaignsImagesRepository.save(newImage);
        }
      }
    }

    return this.mapToResponseDto(updatedCampaign);
  }

  async updateEstado(id: number, estado: CampaignEstado) {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(
        `Campaña Solidaria con ID ${id} no encontrada`,
      );
    }

    campaign.estado = estado;

    await this.campaignsRepository.save(campaign);
  }

  /**
   * Elimina una Campaña específica del sistema (hard delete).
   *
   * @param {number} id - ID de la campaña a eliminar
   *
   * @throws {NotFoundException} cuando no se encuentra el ID de la campaña solicitada
   */
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

  /**
   * Mapea una entidad Campaña a su DTO de respuesta.
   *
   * @param {Campaigns} campaign - Entidad Campaña con la relación organización cargada
   * @returns {ResponseCampaignsDto} DTO listo para ser enviado como respuesta de la API
   */
  private readonly mapToResponseDto = (
    campaign: Campaigns,
  ): ResponseCampaignsDto => {
    const organizationSummary: OrganizacionSummaryDto = {
      id: campaign.organizacion.id,
      nombre_organizacion: campaign.organizacion.nombre_organizacion,
      verificada: campaign.organizacion.verificada,
    };

    const portada = campaign.imagenes?.[0] ?? null;

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
    if (!inicio || !fin) {
      throw new BadRequestException('Las fechas son obligatorias');
    }

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }

    if (fin <= inicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    const hoy = new Date();

    if (hoy < inicio) return CampaignEstado.PENDIENTE;

    if (hoy > fin) return CampaignEstado.FINALIZADA;

    return CampaignEstado.ACTIVA;
  }

  private validarRangoFechas(inicio: Date, fin: Date): boolean {
    if (!inicio || !fin) {
      throw new BadRequestException('Las fechas son obligatorias');
    }

    if (fin <= inicio) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    }

    return true;
  }
}
