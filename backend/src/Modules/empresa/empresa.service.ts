import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PerfilEmpresa } from '../../Entities/perfil_empresa.entity';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { SettingsService } from '../../common/settings/settings.service';
import { JwtService } from '@nestjs/jwt';
import { CuentaService } from '../cuenta/cuenta.service';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { PaginatedBeneficiosResponseDTO } from '../benefit/dto/response_paginated_beneficios';
import { BeneficioService } from '../benefit/beneficio.service';
import { CreateBeneficiosDTO } from '../benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../benefit/dto/update_beneficios.dto';

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
export class PerfilEmpresaService {
  private readonly logger = new Logger(PerfilEmpresaService.name);

  constructor(
    @InjectRepository(PerfilEmpresa)
    private readonly empresaRepository: Repository<PerfilEmpresa>,
    private readonly cuentaService: CuentaService,
    private readonly beneficioService: BeneficioService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Obtiene todas las empresas activas (no deshabilitadas).
   *
   * Flujo:
   * 1. Filtra por deshabilitado = false.
   * 2. Transforma entidades a DTO.
   * 3. Asigna imagen por defecto.
   *
   * @returns {Promise <EmpresaResponseDTO[]>}
   */
  async findAll(): Promise<EmpresaResponseDTO[]> {
    const empresas = await this.empresaRepository.find({
      relations: ['cuenta'],
      where: {
        cuenta: {
          deshabilitado: false,
        },
      },
    });

    this.logger.log(`Se obtuvieron ${empresas.length} Empresas`);

    const res = empresas.map((res) => this.mapToResponseDto(res));

    res.forEach(
      (empresa) =>
        (empresa.logo = SettingsService.getStaticResourceUrl('servo.png')),
    );

    return res;
  }

  /**
   * Obtiene empresas paginadas con búsqueda opcional.
   *
   * @param page Número de página.
   * @param limit Cantidad de registros por página.
   * @param search Texto opcional para filtrar por razón social o nombre fantasía.
   *
   * @returns { items: Empresa[], total: number }
   */
  async findPaginated(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.empresaRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.cuenta', 'cuenta')
      .where('cuenta.deshabilitado = :deshabilitado', { deshabilitado: false });

    if (search) {
      queryBuilder.andWhere(
        '(perfil.razon_social LIKE :search OR perfil.nombre_empresa LIKE :search OR cuenta.correo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [empresas, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('perfil.id', 'ASC')
      .getManyAndCount();

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
  async findOne(id: number): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findOne({
      where: { id, cuenta: { deshabilitado: false } },
      relations: ['cuenta'],
    });

    if (!empresa) {
      throw new NotFoundException(`La Empresa con ID ${id} no encontrada`);
    }

    this.logger.log(`La Empresa ${id} obtenida`);

    return this.mapToResponseDto(empresa);
  }

  /**
   * Busca un perfil por ID de cuenta.
   */
  async findByCuentaId(cuentaId: number): Promise<PerfilEmpresa> {
    const perfil = await this.empresaRepository.findOne({
      where: { cuenta: { id: cuentaId } },
      relations: ['cuenta'],
    });

    if (!perfil) {
      throw new NotFoundException(
        `Perfil de empresa para cuenta ${cuentaId} no encontrado`,
      );
    }

    return perfil;
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
    cuentaId: number,
    manager?: EntityManager,
  ): Promise<EmpresaResponseDTO> {
    const repo = manager
      ? manager.getRepository(PerfilEmpresa)
      : this.empresaRepository;

    const perfilExistente = await repo.findOne({
      where: { cuenta: { id: cuentaId } },
    });

    if (perfilExistente) {
      throw new ConflictException('Ya existe un perfil para esta cuenta');
    }

    const cuitExistente = await repo.findOne({
      where: { cuit: createDto.cuit_empresa },
    });

    if (cuitExistente) {
      throw new ConflictException('La Empresa ya está registrada');
    }

    const empresa = repo.create({
      cuit: createDto.cuit_empresa,
      razon_social: createDto.razon_social,
      nombre_empresa: createDto.nombre_empresa,
      web: createDto.web,
      verificada: false,
      cuenta: { id: cuentaId },
    });

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
    console.log('updateDto recibido:', updateDto);
    const empresa = await this.empresaRepository.findOne({
      where: { id },
      relations: ['cuenta'],
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

    const camposCuenta: (keyof UpdateEmpresaDTO)[] = [
      'telefono',
      'calle',
      'numero',
      'prefijo',
      'provincia',
      'ciudad',
      'codigo_postal',
    ];

    const cuentaUpdate = Object.fromEntries(
      Object.entries(updateDto).filter(
        ([k, v]) =>
          camposCuenta.includes(k as keyof UpdateEmpresaDTO) && v !== undefined,
      ),
    );

    if (Object.keys(cuentaUpdate).length > 0) {
      await this.cuentaService.updateUsuario(empresa.cuenta.id, cuentaUpdate);
      Object.assign(empresa.cuenta, cuentaUpdate);
    }

    console.log('cuentaUpdate:', cuentaUpdate);
    console.log('empresa.cuenta.id:', empresa.cuenta.id);

    const updatedEmpresa = await this.empresaRepository.save(empresa);

    this.logger.log(`Empresa ${id} actualizada`);

    return this.mapToResponseDto(updatedEmpresa);
  }

  /**
   * Actualiza las credenciales del usuario
   */
  async updateCredenciales(cuentaId: number, dto: UpdateCredencialesDto) {
    return this.cuentaService.updateCredenciales(cuentaId, dto);
  }

  /**
   * Marca una empresa como verificada.
   */
  async verify(id: number): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
      relations: ['cuenta'],
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
    const usuario = await this.empresaRepository.findOne({
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
   * Transforma la entidad Empresa en un DTO de respuesta.
   * Oculta datos sensibles como la contraseña.
   *
   * @param empresa Entidad Empresa.
   * @returns {EmpresaResponseDTO}
   */
  private mapToResponseDto(empresa: PerfilEmpresa): EmpresaResponseDTO {
    const dto = new EmpresaResponseDTO();

    // Datos del perfil
    dto.id = empresa.id;
    dto.cuit_empresa = empresa.cuit;
    dto.razon_social = empresa.razon_social;
    dto.nombre_empresa = empresa.nombre_empresa;
    dto.descripcion = empresa.descripcion;
    dto.rubro = empresa.rubro ?? '';
    dto.web = empresa.web;
    dto.logo = empresa.logo
      ? SettingsService.getEmpresaImageUrl(empresa.logo)
      : '';
    dto.verificada = empresa.verificada;

    if (empresa.cuenta) {
      dto.correo = empresa.cuenta.correo;
      dto.deshabilitado = empresa.cuenta.deshabilitado;
      dto.verificada = empresa.cuenta.verificada;
      dto.fecha_registro = empresa.cuenta.fecha_registro;
      dto.ultimo_cambio = empresa.cuenta.ultimo_cambio;
      dto.ultima_conexion = empresa.cuenta.ultima_conexion;
      dto.calle = empresa.cuenta.calle;
      dto.numero = empresa.cuenta.numero;
      dto.codigo_postal = empresa.cuenta.codigo_postal;
      dto.ciudad = empresa.cuenta.ciudad;
      dto.provincia = empresa.cuenta.provincia;
      dto.prefijo = empresa.cuenta.prefijo;
      dto.telefono = empresa.cuenta.telefono;
    }

    return dto;
  }
}
