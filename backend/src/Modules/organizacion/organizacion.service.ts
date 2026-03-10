import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Organizacion } from '../../Entities/organizacion.entity';
import { CreateOrganizacionDto } from './dto/create_organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from './dto/response_organizacion.dto';
import { CampaignsService } from '../campaign/campaign.service';
import { DonacionService } from '../donation/donacion.service';
import { UsuarioService } from '../user/usuario.service';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../donation/dto/response_donation_paginatedByOrganizacion.dto';
import { CreateCampaignsDto } from '../campaign/dto/create_campaigns.dto';
import { ResponseCampaignsDto } from '../campaign/dto/response_campaigns.dto';
import { UpdateCampaignsDto } from '../campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../donation/dto/update_donation_estado.dto';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';

/**
 * ============================================================
 * OrganizationsService
 * ============================================================
 *
 * Servicio encargado de la lógica de negocio relacionada
 * con las Organizaciones del sistema.
 *
 * Responsabilidades:
 * - Gestión CRUD de organizaciones
 * - Paginación y búsqueda
 * - Soft delete y restauración
 * - Gestión de credenciales (email y contraseña)
 * - Generación de JWT actualizado
 * - Obtención de campañas asociadas
 *
 * Arquitectura:
 * Controller → Service → Repository (TypeORM)
 *
 * Dependencias:
 * - organizationRepository (TypeORM)
 * - CampaignsService (relación con campañas)
 * - JwtService (emisión de tokens)
 *
 * ============================================================
 */
@Injectable()
export class PerfilOrganizacionService {
  private readonly logger = new Logger(PerfilOrganizacionService.name);

  constructor(
    @InjectRepository(Organizacion)
    private readonly organizacionRepository: Repository<Organizacion>,
    private readonly campaignService: CampaignsService,
    private readonly donacionService: DonacionService,
    private readonly usuarioService: UsuarioService,
    @InjectRepository(OrganizacionUsuario)
    private readonly organizacionUsuarioRepository: Repository<OrganizacionUsuario>,
  ) {}

  /**
   * Obtiene organizaciones paginadas con búsqueda opcional.
   *
   * @param page - Número de página.
   * @param limit - Cantidad de registros por página.
   * @param search - Texto para búsqueda por razón social o nombre fantasía.
   *
   * @returns {Promise<{ items: ResponseOrganizacionDto[]; total: number }>}
   * Objeto con listado paginado y total de registros.
   */
  async findPaginated(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.organizacionRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.cuenta', 'cuenta');

    if (search) {
      queryBuilder.andWhere(
        '(perfil.razon_social LIKE :search OR perfil.nombre_organizacion LIKE :search OR cuenta.correo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [organizaciones, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('perfil.id', 'ASC')
      .getManyAndCount();

    return {
      items: organizaciones.map((org) => this.mapToResponseDto(org)),
      total,
    };
  }

  /**
   * Obtiene una organización por ID.
   *
   * @param id ID de la organización.
   *
   * @returns {Promise<ResponseOrganizacionDto>}
   *
   * @throws NotFoundException
   * Si la organización no existe.
   */

  async getOrganizacionByUsuario(usuarioId: number): Promise<Organizacion> {
    const organizacionUsuario =
      await this.organizacionUsuarioRepository.findOne({
        where: {
          usuario: { id: usuarioId },
        },
        relations: ['organizacion'],
      });

    if (!organizacionUsuario) {
      throw new ForbiddenException(
        'El usuario no gestiona ninguna organizacion',
      );
    }

    return organizacionUsuario.organizacion;
  }

  async findById(id: number): Promise<Organizacion> {
    const perfil = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!perfil) {
      throw new NotFoundException(`Organización ${id} no encontrado`);
    }

    return perfil;
  }

  async getCampaigns(
    id: number,
    page: number,
    limit: number,
  ): Promise<ResponseCampaignsDetailPaginatedDto> {
    return this.campaignService.findCampaignsPaginated(id, page, limit);
  }

  async getDonaciones(
    id: number,
    page: number,
    limit: number,
  ): Promise<PaginatedOrganizationDonationsResponseDto> {
    return this.donacionService.findAllPaginatedByOrganizacion(id, page, limit);
  }

  async confirmarDonacion(id: number, dto: UpdateDonacionEstadoDto) {
    return await this.donacionService.confirmarDonacion(id, dto);
  }

  async createCampaign(
    id: number,
    createDto: CreateCampaignsDto,
    imagenes: string[],
  ): Promise<ResponseCampaignsDto> {
    return await this.campaignService.create(id, createDto, imagenes);
  }

  async updateCampaign(
    id: number,
    updateDto: UpdateCampaignsDto,
    imagenes?: string[],
  ): Promise<ResponseCampaignsDto> {
    return await this.campaignService.update(id, updateDto, imagenes);
  }

  /**
   * Crea una nueva organización.
   *
   * @param createDto Datos necesarios para la creación.
   *
   * @returns {Promise<ResponseOrganizacionDto>}
   *
   * @throws ConflictException
   * Si la organización ya está registrada.
   */
  async create(
    createDto: CreateOrganizacionDto,
    //usuarioId: number,
    manager?: EntityManager,
  ): Promise<ResponseOrganizacionDto> {
    const repo = manager
      ? manager.getRepository(Organizacion)
      : this.organizacionRepository;

    const existente = await repo.findOne({
      where: { cuit: createDto.cuit },
    });

    if (existente) {
      throw new ConflictException('La organización ya se encuentra registrada');
    }

    const organizacion = repo.create({
      cuit: createDto.cuit,
      razon_social: createDto.razon_social,
      nombre_organizacion: createDto.nombre_organizacion,
      web: createDto.web,
      verificada: false,
    });

    const saved = await repo.save(organizacion);
    this.logger.log(`Organización creada con ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  /**
   * Actualiza una organización existente.
   *
   * @param id ID de la organización.
   * @param updateDto Datos a modificar.
   *
   * @returns {Promise<ResponseOrganizacionDto>}
   *
   * @throws NotFoundException
   * Si la organización no existe.
   */
  async update(
    id: number,
    updateDto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    const camposOrganizacion: (keyof UpdateOrganizacionDto)[] = [
      'descripcion',
      'web',
    ];
    Object.assign(
      organizacion,
      Object.fromEntries(
        Object.entries(updateDto).filter(
          ([k, v]) =>
            camposOrganizacion.includes(k as keyof UpdateOrganizacionDto) &&
            v !== undefined,
        ),
      ),
    );

    const updated = await this.organizacionRepository.save(organizacion);
    this.logger.log(`Organización ${id} actualizada`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Actualiza las credenciales del usuario
   */
  async updateCredenciales(cuentaId: number, dto: UpdateCredencialesDto) {
    return this.usuarioService.updateCredenciales(cuentaId, dto);
  }

  /**
   * Marca una organización como verificada.
   */
  async verify(id: number): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    organizacion.verificada = true;
    const updated = await this.organizacionRepository.save(organizacion);

    return this.mapToResponseDto(updated);
  }

  /**
   * Deshabilita un organizacion (soft delete sobre la Cuenta).
   */
  async delete(id: number): Promise<void> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`organizacion con ID ${id} no encontrado`);
    }

    await this.organizacionRepository.delete(organizacion.id);
    this.logger.log(`organizacion ${id} deshabilitado`);
  }

  /**
   * Restaura un organizacion deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`organizacion con ID ${id} no encontrado`);
    }

    await this.organizacionRepository.restore(organizacion.id);
    this.logger.log(`Usuario ${id} restaurado`);
  }

  /**
   * Mapea la entidad Organizations a ResponseOrganizacionDto.
   *
   * @param organization Entidad Organization.
   *
   * @returns {ResponseOrganizacionDto}
   */
  private mapToResponseDto(
    organizacion: Organizacion,
  ): ResponseOrganizacionDto {
    const dto = new ResponseOrganizacionDto();

    dto.id = organizacion.id;
    dto.cuit = organizacion.cuit;
    dto.razon_social = organizacion.razon_social;
    dto.nombre_organizacion = organizacion.nombre_organizacion;
    dto.descripcion = organizacion.descripcion;
    dto.web = organizacion.web;
    dto.verificada = organizacion.verificada;

    return dto;
  }
}
