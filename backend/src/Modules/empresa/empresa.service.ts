import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { EmpresaImagenDTO } from './dto/lista_empresa_imagen.dto';
import { Empresa_imagenes } from '../../Entities/empresa_imagenes.entity';
import { SettingsService } from '../../common/settings/settings.service';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,

    @InjectRepository(Empresa_imagenes)
    private readonly empresasImagenRepository: Repository<Empresa_imagenes>,

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
    const empresas = await this.empresasRepository.find({
      where: { deshabilitado: false },
    });

    this.logger.log(`Se obtuvieron ${empresas.length} Empresas`);

    const res = empresas.map(this.mapToResponseDto);

    res.forEach(
      (empresa) =>
        (empresa.imagen =
          SettingsService.getStaticResourceUrl('servo.png')),
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
    const startIndex = (page - 1) * limit;

    const where = search
      ? [
          { razon_social: Like(`%${search}%`) },
          { nombre_fantasia: Like(`%${search}%`) },
        ]
      : {};

    const [empresas, total] =
      await this.empresasRepository.findAndCount({
        skip: startIndex,
        take: limit,
        order: { id: 'ASC' },
        where,
      });

    return { items: empresas, total };
  }

  /**
   * Obtiene las imágenes asociadas a empresas activas.
   *
   * Incluye la relación con la entidad Empresa.
   *
   * @returns {Promise EmpresaImagenDTO[]}
   */
  async findIMG(): Promise<EmpresaImagenDTO[]> {
    const images = await this.empresasImagenRepository.find({
      relations: ['id_empresa'],
      where: {
        id_empresa: {
          deshabilitado: false,
        },
      },
    });

    this.logger.log(
      `Se obtuvieron ${images.length} imágenes de empresas`,
    );

    return images.map((img) => ({
      id_empresa: img.id_empresa.id,
      nombre: img.id_empresa.razon_social,
      logo: img.logo,
    }));
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
    const empresa = await this.empresasRepository.findOne({
      where: { id, deshabilitado: false },
    });

    if (!empresa) {
      throw new NotFoundException(
        `La Empresa con ID ${id} no encontrada`,
      );
    }

    this.logger.log(`La Empresa ${id} obtenida`);

    return this.mapToResponseDto(empresa);
  }

  /**
   * Busca una empresa por correo electrónico.
   *
   * @param correo Email de la empresa.
   * @throws NotFoundException si no existe.
   *
   * @returns {Promise<Empresa>}
   */
  async findByEmail(correo: string): Promise<Empresa> {
    const empresa = await this.empresasRepository.findOne({
      where: { correo },
    });

    if (!empresa) {
      throw new NotFoundException(
        `Usuario con email ${correo} no encontrado`,
      );
    }

    return empresa;
  }

  /**
   * Crea una nueva empresa.
   *
   * Validaciones:
   * - Verifica que no exista otra empresa con el mismo nroDocumento.
   *
   * @param createDto Datos de creación.
   * @throws ConflictException si ya existe.
   *
   * @returns {Promise<EmpresaResponseDTO>}
   */
  async create(
    createDto: CreateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    const existente = await this.empresasRepository.findOne({
      where: { nroDocumento: createDto.nroDocumento },
    });

    if (existente) {
      throw new ConflictException(
        'La Empresa ya está registrada',
      );
    }

    const empresa = this.empresasRepository.create({
      ...createDto,
      verificada: false,
    });

    const savedEmpresa =
      await this.empresasRepository.save(empresa);

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
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa con ID ${id} no encontrada`,
      );
    }

    Object.assign(empresa, updateDto);

    const updatedEmpresa =
      await this.empresasRepository.save(empresa);

    this.logger.log(`Empresa ${id} actualizada`);

    return this.mapToResponseDto(updatedEmpresa);
  }

  /**
   * Realiza un borrado lógico (soft delete).
   * Marca la empresa como deshabilitada.
   *
   * @param id ID de la empresa.
   * @throws NotFoundException si no existe.
   */
  async delete(id: number): Promise<void> {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(
        `La Empresa con ID ${id} no encontrada`,
      );
    }

    empresa.deshabilitado = true;
    await this.empresasRepository.save(empresa);

    this.logger.log(`Empresa ${id} deshabilitada`);
  }

  /**
   * Restaura una empresa previamente deshabilitada.
   *
   * @param id ID de la empresa.
   * @throws NotFoundException si no existe la empresa.
   * @throws BadRequestException si ya está activa la empresa.
   */
  async restore(id: number): Promise<void> {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(
        `La Empresa con ID ${id} no encontrada`,
      );
    }

    if (!empresa.deshabilitado) {
      throw new BadRequestException(
        'La empresa ya se encuentra activa',
      );
    }

    empresa.deshabilitado = false;
    await this.empresasRepository.save(empresa);

    this.logger.log(`Empresa ${id} restaurada`);
  }

  /**
   * Actualiza credenciales (correo y/o contraseña).
   *
   * Reglas:
   * - El email no puede estar en uso por otra empresa.
   * - Para cambiar contraseña se debe validar la actual.
   * - Se genera un nuevo JWT tras cambios.
   *
   * @param id ID de la empresa.
   * @param dto Datos de actualización.
   *
   * @returns { user: Empresa, token: string }
   */
  async updateCredentials(
    id: number,
    dto: UpdateCredentialsDto,
  ) {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    let cambiosRealizados = false;

    if (dto.correo && dto.correo !== empresa.correo) {
      const empresaExistente =
        await this.empresasRepository.findOne({
          where: { correo: dto.correo },
        });

      if (empresaExistente && empresaExistente.id !== id) {
        throw new ConflictException(
          'El email ya está en uso por otro usuario',
        );
      }

      empresa.correo = dto.correo;
      cambiosRealizados = true;
    }

    if (dto.passwordNueva) {
      const passwordValida = await bcrypt.compare(
        dto.passwordActual,
        empresa.clave,
      );

      if (!passwordValida) {
        throw new UnauthorizedException(
          'Contraseña actual incorrecta',
        );
      }

      const hash = await bcrypt.hash(dto.passwordNueva, 10);
      empresa.clave = hash;
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      empresa.ultimo_cambio = new Date();
      await this.empresasRepository.save(empresa);
    }

    const payload = {
      sub: empresa.id,
      email: empresa.correo,
      userType: 'empresa',
    };

    const newToken = this.jwtService.sign(payload);

    return {
      user: empresa,
      token: newToken,
    };
  }

  /**
   * Transforma la entidad Empresa en un DTO de respuesta.
   * Oculta datos sensibles como la contraseña.
   *
   * @param empresa Entidad Empresa.
   * @returns {EmpresaResponseDTO}
   */
  private readonly mapToResponseDto = (
    empresa: Empresa,
  ): EmpresaResponseDTO => {
    return {
      id: empresa.id,
      nroDocumento: empresa.nroDocumento,
      razon_social: empresa.razon_social,
      nombre_fantasia: empresa.nombre_fantasia,
      descripcion: empresa.descripcion,
      rubro: empresa.rubro,
      telefono: empresa.telefono,
      direccion: empresa.direccion,
      web: empresa.web,
      verificada: empresa.verificada,
      deshabilitado: empresa.deshabilitado,
      fecha_registro: empresa.fecha_registro,
      ultimo_cambio: empresa.ultimo_cambio,
      imagen: '',
      correo: empresa.correo,
    };
  };
}
