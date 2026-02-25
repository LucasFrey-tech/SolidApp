import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PerfilOrganizacion } from '../../Entities/perfil_organizacion.entity';
import { CreateOrganizacionDto } from './dto/create_organization.dto';
import { UpdateOrganizacionDto } from './dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from './dto/response_organizacion.dto';
import { JwtService } from '@nestjs/jwt';
import { CampaignsService } from '../campaign/campaign.service';
import { DonacionService } from '../donation/donacion.service';
import { CuentaService } from '../cuenta/cuenta.service';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../donation/dto/response_donation_paginatedByOrganizacion.dto';
import { CreateCampaignsDto } from '../campaign/dto/create_campaigns.dto';
import { ResponseCampaignsDto } from '../campaign/dto/response_campaigns.dto';
import { UpdateCampaignsDto } from '../campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../donation/dto/update_donation_estado.dto';

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
    @InjectRepository(PerfilOrganizacion)
    private readonly organizacionRepository: Repository<PerfilOrganizacion>,
    private readonly campaignService: CampaignsService,
    private readonly donacionService: DonacionService,
    private readonly cuentaService: CuentaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Obtiene todas las organizaciones.
   *
   * @returns {Promise<ResponseOrganizacionDto[]>}
   * Lista completa de organizaciones mapeadas a DTO.
   */
  async findAll(): Promise<ResponseOrganizacionDto[]> {
    const organizaciones = await this.organizacionRepository.find({
      relations: ['cuenta'],
      where: {
        cuenta: {
          deshabilitado: false,
        },
      },
    });

    return organizaciones.map((org) => this.mapToResponseDto(org));
  }

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
      .leftJoinAndSelect('perfil.cuenta', 'cuenta')
      .where('cuenta.deshabilitado = :deshabilitado', { deshabilitado: false });

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
  async findOne(id: number): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(organizacion);
  }

  async findByCuentaId(cuentaId: number): Promise<PerfilOrganizacion> {
    const perfil = await this.organizacionRepository.findOne({
      where: { cuenta: { id: cuentaId } },
      relations: ['cuenta'],
    });

    if (!perfil) {
      throw new NotFoundException(
        `Perfil de organización para cuenta ${cuentaId} no encontrado`,
      );
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
    cuentaId: number,
    manager?: EntityManager,
  ): Promise<ResponseOrganizacionDto> {
    const repo = manager
      ? manager.getRepository(PerfilOrganizacion)
      : this.organizacionRepository;

    const perfilExistente = await repo.findOne({
      where: { cuenta: { id: cuentaId } },
    });

    if (perfilExistente) {
      throw new ConflictException('Ya existe un perfil para esta cuenta');
    }

    const cuitExistente = await repo.findOne({
      where: { cuit: createDto.cuit_organizacion },
    });

    if (cuitExistente) {
      throw new ConflictException('La organización ya se encuentra registrada');
    }

    const organizacion = repo.create({
      cuit: createDto.cuit_organizacion,
      razon_social: createDto.razon_social,
      nombre_organizacion: createDto.nombre_organizacion,
      web: createDto.web,
      verificada: false,
      cuenta: { id: cuentaId },
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
    console.log('Datos que llegan al service del back: ', updateDto);

    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
      relations: ['cuenta'],
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

    const camposCuenta: (keyof UpdateOrganizacionDto)[] = [
      'prefijo',
      'telefono',
      'calle',
      'numero',
      'provincia',
      'ciudad',
      'codigo_postal',
    ];

    const cuentaUpdate = Object.fromEntries(
      Object.entries(updateDto).filter(
        ([k, v]) =>
          camposCuenta.includes(k as keyof UpdateOrganizacionDto) &&
          v !== undefined,
      ),
    );

    if (Object.keys(cuentaUpdate).length > 0) {
      await this.cuentaService.updateUsuario(
        organizacion.cuenta.id,
        cuentaUpdate,
      );
      Object.assign(organizacion.cuenta, cuentaUpdate);
    }

    const updated = await this.organizacionRepository.save(organizacion);
    this.logger.log(`Organización ${id} actualizada`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Actualiza las credenciales del usuario
   */
  async updateCredenciales(cuentaId: number, dto: UpdateCredencialesDto) {
    return this.cuentaService.updateCredenciales(cuentaId, dto);
  }

  /**
   * Marca una organización como verificada.
   */
  async verify(id: number): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    organizacion.verificada = true;
    const updated = await this.organizacionRepository.save(organizacion);

    return this.mapToResponseDto(updated);
  }

  /**
   * Deshabilita un usuario (soft delete sobre la Cuenta).
   */
  async delete(id: number): Promise<void> {
    const usuario = await this.organizacionRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.cuentaService.deshabilitar(usuario.cuenta.id);
    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  /**
   * Restaura un usuario deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const usuario = await this.organizacionRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.cuentaService.habilitar(usuario.cuenta.id);
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
    organizacion: PerfilOrganizacion,
  ): ResponseOrganizacionDto {
    const dto = new ResponseOrganizacionDto();

    // Datos del perfil
    dto.id = organizacion.id;
    dto.cuit_organizacion = organizacion.cuit;
    dto.razon_social = organizacion.razon_social;
    dto.nombre_organizacion = organizacion.nombre_organizacion;
    dto.descripcion = organizacion.descripcion;
    dto.web = organizacion.web;
    dto.verificada = organizacion.verificada;

    // Datos de la cuenta
    if (organizacion.cuenta) {
      dto.correo = organizacion.cuenta.correo;
      dto.deshabilitado = organizacion.cuenta.deshabilitado;
      dto.verificada = organizacion.cuenta.verificada;
      dto.fecha_registro = organizacion.cuenta.fecha_registro;
      dto.ultimo_cambio = organizacion.cuenta.ultimo_cambio;
      dto.ultima_conexion = organizacion.cuenta.ultima_conexion;
      dto.calle = organizacion.cuenta.calle;
      dto.numero = organizacion.cuenta.numero;
      dto.codigo_postal = organizacion.cuenta.codigo_postal;
      dto.ciudad = organizacion.cuenta.ciudad;
      dto.provincia = organizacion.cuenta.provincia;
      dto.prefijo = organizacion.cuenta.prefijo;
      dto.telefono = organizacion.cuenta.telefono;
    }

    return dto;
  }
}
