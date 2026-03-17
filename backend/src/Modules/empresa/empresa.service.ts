import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
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
import { Rol, Usuario } from '../../Entities/usuario.entity';
import { HashService } from '../../common/bcryptService/hashService';

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
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepository: Repository<EmpresaUsuario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly beneficioService: BeneficioService,
    private readonly dataSource: DataSource,
    private readonly hashService: HashService,
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
  async getEmpresaByUsuario(usuarioId: number): Promise<EmpresaResponseDTO> {
    const empresaUsuario = await this.empresaUsuarioRepository.findOne({
      where: {
        usuario: { id: usuarioId },
      },
      relations: ['empresa'],
    });

    if (!empresaUsuario) {
      throw new ForbiddenException('El usuario no gestiona ninguna empresa');
    }

    return this.mapToResponseDto(empresaUsuario.empresa);
  }

  async getCupones(
    usuarioid: number,
    page: number,
    limit: number,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    const empresa = await this.getEmpresaByUsuario(usuarioid);

    return await this.beneficioService.findByEmpresaPaginated(
      empresa.id,
      page,
      limit,
    );
  }

  async createCupon(usuarioId: number, dto: CreateBeneficiosDTO) {
    const empresa = await this.getEmpresaByUsuario(usuarioId);

    return this.beneficioService.create(
      { ...dto, id_empresa: empresa.id },
      usuarioId,
    );
  }

  async updateCupon(
    cuponId: number,
    dto: UpdateBeneficiosDTO,
    usuarioId: number,
  ) {
    return this.beneficioService.update(cuponId, dto, usuarioId);
  }

  async registrarEmpresa(dto: CreateEmpresaDTO): Promise<EmpresaResponseDTO> {
    return await this.dataSource.transaction(async (manager) => {
      const usuarioRepo = manager.getRepository(Usuario);
      const empresaRepo = manager.getRepository(Empresa);
      const empresaUsuarioRepo = manager.getRepository(EmpresaUsuario);

      const cuitExistente = await empresaRepo.findOne({
        where: { cuit: dto.cuit_empresa },
      });
      if (cuitExistente) {
        throw new ConflictException('Ya existe una empresa con ese CUIT');
      }

      const docExistente = await usuarioRepo.findOne({
        where: { documento: dto.documento },
      });
      if (docExistente) {
        throw new ConflictException('Ya existe un usuario con ese documento');
      }

      const correoExistente = await usuarioRepo.findOne({
        relations: ['contacto'],
        where: { contacto: { correo: dto.correo } },
      });
      if (correoExistente) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }

      const claveHash = await this.hashService.hash(dto.clave);

      const gestor = usuarioRepo.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        documento: dto.documento,
        clave: claveHash,
        rol: Rol.GESTOR,
        contacto: {
          correo: dto.correo,
          prefijo: dto.prefijo,
          telefono: dto.telefono,
        },
        direccion: {},
        puntos: 0,
        habilitado: true,
        verificado: false,
      });

      const savedGestor = await usuarioRepo.save(gestor);
      this.logger.log(`Gestor creado con ID ${savedGestor.id}`);

      const empresa = empresaRepo.create({
        cuit: dto.cuit_empresa,
        razon_social: dto.razon_social,
        nombre_empresa: dto.nombre_empresa,
        web: dto.web,
        contacto: {
          correo: dto.correo_empresa,
        },
        direccion: {
          calle: dto.calle,
          numero: dto.numero,
        },
        habilitada: true,
        verificada: false,

        creado_por: { id: savedGestor.id },
        actualizado_por: { id: savedGestor.id },
      });

      const savedEmpresa = await empresaRepo.save(empresa);
      this.logger.log(`Empresa creada con ID ${savedEmpresa.id}`);

      const vinculo = empresaUsuarioRepo.create({
        usuario: { id: savedGestor.id },
        empresa: { id: savedEmpresa.id },
        activo: true,
      });

      await empresaUsuarioRepo.save(vinculo);
      this.logger.log(`Vínculo gestor-empresa creado`);

      return this.mapToResponseDto(savedEmpresa);
    });
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
    usuarioId: number,
    updateDto: UpdateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    const empresaUsuario = await this.empresaUsuarioRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['empresa', 'empresa.contacto', 'empresa.direccion'],
    });

    if (!empresaUsuario) {
      throw new NotFoundException('El usuario no gestiona ninguna empresa');
    }

    const empresaId = empresaUsuario.empresa.id;

    const empresaPreload = await this.empresaRepository.preload({
      id: empresaId,
      descripcion: updateDto.descripcion,
      rubro: updateDto.rubro,
      web: updateDto.web,
      logo: updateDto.logo,
      contacto: updateDto.contacto
        ? {
            ...empresaUsuario.empresa.contacto,
            ...updateDto.contacto,
          }
        : undefined,
      direccion: updateDto.direccion
        ? {
            ...empresaUsuario.empresa.direccion,
            ...updateDto.direccion,
          }
        : undefined,

      actualizado_por: { id: usuarioId },
    });

    if (!empresaPreload) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }

    const updated = await this.empresaRepository.save(empresaPreload);

    this.logger.log(`Empresa ${empresaId} actualizada`);

    return this.mapToResponseDto(updated);
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
   * Deshabilita un empresa (soft delete sobre la Empresa).
   */
  async delete(id: number): Promise<void> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrado`);
    }

    await this.empresaRepository.update(id, { habilitada: false });
    this.logger.log(`Empresa ${id} deshabilitado`);
  }

  /**
   * Restaura un empresa deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
    });

    if (!empresa) {
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
    dto.verificada = empresa.verificada;
    dto.habilitada = empresa.habilitada;
    dto.fecha_registro = empresa.fecha_registro;
    dto.ultimo_cambio = empresa.ultimo_cambio;

    dto.logo = empresa.logo
      ? SettingsService.getEmpresaImageUrl(empresa.logo)
      : '';

    if (empresa.contacto) {
      dto.contacto = {
        id: empresa.contacto.id,
        prefijo: empresa.contacto.prefijo,
        telefono: empresa.contacto.telefono,
        correo: empresa.contacto.correo,
      };
    }

    if (empresa.direccion) {
      dto.direccion = {
        id: empresa.direccion.id,
        calle: empresa.direccion.calle,
        numero: empresa.direccion.numero,
        provincia: empresa.direccion.provincia,
        ciudad: empresa.direccion.ciudad,
        codigo_postal: empresa.direccion.codigo_postal,
      };
    }

    dto.creado_por = empresa.creado_por
      ? {
          id: empresa.creado_por.id,
          nombre: empresa.creado_por.nombre,
          apellido: empresa.creado_por.apellido,
          email: empresa.creado_por.contacto?.correo,
        }
      : undefined;

    dto.actualizado_por = empresa.actualizado_por
      ? {
          id: empresa.actualizado_por.id,
          nombre: empresa.actualizado_por.nombre,
          apellido: empresa.actualizado_por.apellido,
          email: empresa.actualizado_por.contacto?.correo,
        }
      : undefined;

    return dto;
  }
}
