import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Like, Repository } from 'typeorm';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { SettingsService } from '../../common/settings/settings.service';
import { PaginatedBeneficiosResponseDTO } from '../benefit/dto/response_paginated_beneficios';
import { BeneficioService } from '../benefit/beneficio.service';
import { CreateBeneficiosDTO } from '../benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../benefit/dto/update_beneficios.dto';
import { EmpresaUsuario } from '../../Entities/empresa_usuario.entity';

/**
 * ============================================================
 * EmpresasService
 * ============================================================
 * Servicio encargado de la lógica de negocio relacionada
 * a las Empresas dentro del sistema.
 *
 * Responsabilidades principales:
 * - CRUD de empresas
 * - Soft delete (deshabilitar / restaurar)
 * - Paginación y búsqueda
 * - Gestión de credenciales (correo y contraseña)
 * - Manejo de imágenes asociadas
 * - Generación de JWT tras cambios sensibles
 *
 * Seguridad implementada:
 * - Hash de contraseñas con bcrypt
 * - Validación de contraseña actual antes de modificarla
 * - Emisión de nuevo token JWT tras actualización de credenciales
 *
 * Arquitectura:
 * - Patrón Service + Repository (TypeORM)
 * - Uso de DTOs para estandarizar respuestas
 * - Manejo explícito de excepciones HTTP
 * ============================================================
 */
@Injectable()
export class EmpresaService {
  private readonly logger = new Logger(EmpresaService.name);

  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly beneficioService: BeneficioService,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepository: Repository<EmpresaUsuario>,
  ) {}

  /**
   * Obtiene empresas paginadas con búsqueda opcional.
   *
   * @param page Número de página.
   * @param limit Cantidad de registros por página.
   * @param search Texto opcional para filtrar por razón social o nombre fantasía.
   *
   * @returns { items: Empresa[], total: number }
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
    onlyEnabled: boolean,
  ): Promise<{ items: EmpresaResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;

    const baseFilter: FindOptionsWhere<Empresa> = onlyEnabled
      ? { habilitada: true }
      : {};

    const where: FindOptionsWhere<Empresa>[] = search
      ? [
          { ...baseFilter, nombre_empresa: Like(`%${search}%`) },
          { ...baseFilter, razon_social: Like(`%${search}%`) },
        ]
      : [baseFilter];

    const [empresas, total] = await this.empresaRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    const items = empresas.map((emp) => this.mapToResponseDto(emp));

    return { items, total };
  }

  /**
   * Obtiene una empresa por ID.
   *
   * @param id Identificador de la empresa.
   * @throws NotFoundException si no existe o está deshabilitada.
   *
   * @returns {Promise<EmpresaResponseDTO>}
   */
  async getEmpresaByUsuario(usuarioId: number): Promise<Empresa> {
    const empresaUsuario = await this.empresaUsuarioRepository.findOne({
      where: {
        usuario: { id: usuarioId },
      },
      relations: ['empresa'],
    });

    if (!empresaUsuario) {
      throw new ForbiddenException('El usuario no gestiona ninguna empresa');
    }

    return empresaUsuario.empresa;
  }

  async getCupones(
    id: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    return await this.beneficioService.findByEmpresaPaginated(id, page, limit);
  }

  async createCupon(id_empresa: number, dto: CreateBeneficiosDTO) {
    return this.beneficioService.create({ ...dto, id_empresa });
  }

  async updateCupon(cuponId: number, dto: UpdateBeneficiosDTO) {
    return this.beneficioService.update(cuponId, dto);
  }

  /**
   * Crea una nueva empresa.
   *
   * Validaciones:
   * - Verifica que no exista otra empresa con el mismo cuit.
   *
   * @param createDto Datos de creación.
   * @throws ConflictException si ya existe.
   *
   * @returns {Promise<EmpresaResponseDTO>}
   */
  async create(
    createDto: CreateEmpresaDTO,
    //id: number,
    manager?: EntityManager,
  ): Promise<EmpresaResponseDTO> {
    const repo = manager
      ? manager.getRepository(Empresa)
      : this.empresaRepository;

    const cuitExistente = await repo.findOne({
      where: { cuit: createDto.cuit_empresa },
    });

    if (cuitExistente) {
      throw new ConflictException('La Empresa ya está registrada');
    }

    const empresa = repo.create(createDto);

    const savedEmpresa = await repo.save(empresa);

    return this.mapToResponseDto(savedEmpresa);
  }

  /**
   * Actualiza los datos generales de una empresa.
   *
   * @param id ID de la empresa.
   * @param updateDto Datos a modificar.
   *
   * @throws NotFoundException si no existe.
   *
   * @returns {Promise<EmpresaResponseDTO>}-> Actualiza a la empresa
   */
  async update(
    id: number,
    updateDto: UpdateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    const camposEmpresa: (keyof UpdateEmpresaDTO)[] = [
      'descripcion',
      'rubro',
      'web',
      'logo',
    ];

    Object.assign(
      empresa,
      Object.fromEntries(
        Object.entries(updateDto).filter(
          ([k, v]) =>
            camposEmpresa.includes(k as keyof UpdateEmpresaDTO) &&
            v !== undefined,
        ),
      ),
    );

    const updatedEmpresa = await this.empresaRepository.save(empresa);

    this.logger.log(`Empresa ${id} actualizada`);

    return this.mapToResponseDto(updatedEmpresa);
  }

  /**
   * Marca una empresa como verificada.
   */
  async verify(id: number): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    empresa.verificada = true;
    const updated = await this.empresaRepository.save(empresa);

    return this.mapToResponseDto(updated);
  }

  /**
   * Deshabilita un usuario (soft delete sobre la Cuenta).
   */
  async delete(id: number): Promise<void> {
    const usuario = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrado`);
    }

    await this.empresaRepository.update(id, { habilitada: false });
    this.logger.log(`Empresa ${id} deshabilitado`);
  }

  /**
   * Restaura un usuario deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const usuario = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrado`);
    }

    await this.empresaRepository.update(id, { habilitada: true });
    this.logger.log(`Empresa ${id} restaurado`);
  }

  /**
   * Transforma la entidad Empresa en un DTO de respuesta.
   * Oculta datos sensibles como la contraseña.
   *
   * @param empresa Entidad Empresa.
   * @returns {EmpresaResponseDTO}
   */
  private mapToResponseDto(empresa: Empresa): EmpresaResponseDTO {
    const dto = new EmpresaResponseDTO();

    dto.id = empresa.id;
    dto.cuit = empresa.cuit;
    dto.razon_social = empresa.razon_social;
    dto.nombre_empresa = empresa.nombre_empresa;
    dto.descripcion = empresa.descripcion;
    dto.rubro = empresa.rubro ?? '';
    dto.web = empresa.web;
    dto.logo = empresa.logo
      ? SettingsService.getEmpresaImageUrl(empresa.logo)
      : '';
    dto.verificada = empresa.verificada;
    return dto;
  }
}
