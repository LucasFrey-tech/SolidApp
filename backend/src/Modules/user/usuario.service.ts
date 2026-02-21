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
import { Usuario } from '../../Entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { UpdateCredentialsDto } from './dto/panelUsuario.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

/**
 * Servicio encargado de la lógica de negocio
 * relacionada con los usuarios del sistema.
 *
 * Responsabilidades:
 * - CRUD de usuarios
 * - Soft delete y restauración
 * - Paginación y búsqueda
 * - Gestión de credenciales
 * - Generación de JWT al actualizar credenciales
 */
@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Obtiene todos los usuarios activos (no deshabilitados).
   *
   * @returns {Promise<ResponseUsuarioDto[]>} - Lista de usuarios activos
   */
  async findAll(): Promise<ResponseUsuarioDto[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { deshabilitado: false },
    });

    return usuarios.map(this.mapToResponseDto);
  }

  /**
   * Obtiene usuarios de forma paginada.
   * Incluye activos y deshabilitados (uso administrativo).
   *
   * @param page Número de página
   * @param limit Cantidad de registros por página
   * @param search Texto opcional para búsqueda
   *
   * @returns {ResponseUsuarioDto[]}
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: ResponseUsuarioDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [usuarios, total] = await this.usuarioRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'ASC' },
      where: search
        ? [
            { nombre: Like(`%${search}%`) },
            { apellido: Like(`%${search}%`) },
            { correo: Like(`%${search}%`) },
          ]
        : undefined,
    });

    return {
      items: usuarios.map(this.mapToResponseDto),
      total,
    };
  }

  /**
   * Obtiene un usuario por su ID.
   *
   * @param id ID del usuario
   * @returns {Promise<ResponseUsuarioDto>} - Usuario encontrado
   * @throws NotFoundException si no existe
   */
  async findOne(id: number): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(usuario);
  }

  /**
   * Busca un usuario por correo electrónico.
   *
   * @param correo Email del usuario
   * @returns {Promise<Usuario>}
   * @throws NotFoundException si no existe
   */
  async findByEmail(correo: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { correo } });

    return usuario || null;
  }

  /**
   * Obtiene los puntos de un usuario específico.
   *
   * @param id ID del usuario
   * @returns {Promise<{ id: number; puntos: number }>} - Objeto con id y puntos
   */
  async getPoints(id: number): Promise<{ id: number; puntos: number }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'puntos'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return { id: usuario.id, puntos: usuario.puntos ?? 0 };
  }

  /**
   * Crea un nuevo usuario.
   *
   * @param createDto Datos necesarios para creación
   * @returns {Promise<ResponseUsuarioDto>} - Usuario creado
   * @throws ConflictException si el email ya existe
   */
  async create(createDto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    const existente = await this.usuarioRepository.findOne({
      where: { correo: createDto.correo },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const usuario = this.usuarioRepository.create({
      ...createDto,
      deshabilitado: false,
    });

    const saved = await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario creado con ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  /**
   * Actualiza los datos de un usuario existente.
   *
   * @param id ID del usuario
   * @param updateDto Datos a modificar
   * @returns {Promise<ResponseUsuarioDto>} - Usuario actualizado
   */
  async update(
    id: number,
    updateDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    Object.assign(usuario, updateDto);

    const updated = await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario ${id} actualizado`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Deshabilita un usuario (soft delete).
   *
   * @param id - ID del usuario
   */
  async delete(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    usuario.deshabilitado = true;
    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  /**
   * Restaura un usuario previamente deshabilitado.
   *
   * @param id - ID del usuario
   * @throws BadRequestException si ya está activo
   */
  async restore(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!usuario.deshabilitado) {
      throw new BadRequestException('El usuario ya está activo');
    }

    usuario.deshabilitado = false;
    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} restaurado`);
  }

  /**
   * Actualiza el correo y/o contraseña del usuario.
   * Si hay cambios, genera un nuevo token JWT.
   *
   * @param id ID del usuario
   * @param dto Datos de actualización de credenciales
   *
   * @returns {Promise<{ user: Usuario; token: string }>} - Usuario actualizado + nuevo token JWT
   */
  async updateCredentials(
    id: number,
    dto: UpdateCredentialsDto,
  ): Promise<{ user: Usuario; token: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let cambiosRealizados = false;

    // Cambio de email
    if (dto.correo && dto.correo !== usuario.correo) {
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { correo: dto.correo },
      });

      if (usuarioExistente && usuarioExistente.id !== id) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }

      usuario.correo = dto.correo;
      cambiosRealizados = true;
    }

    // Cambio de contraseña
    if (dto.passwordNueva) {
      if (!dto.passwordActual) {
        throw new UnauthorizedException(
          'Para cambiar la contraseña debés ingresar la contraseña actual',
        );
      }

      const passwordValida = await bcrypt.compare(
        dto.passwordActual,
        usuario.clave,
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const hash = await bcrypt.hash(dto.passwordNueva, 10);
      usuario.clave = hash;
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      usuario.ultimo_cambio = new Date();
      await this.usuarioRepository.save(usuario);
    }

    const updated = await this.usuarioRepository.save(usuario);

    const payload = {
      sub: updated.id,
      email: updated.correo,
      userType: 'usuario',
    };

    const newToken = this.jwtService.sign(payload);

    return { user: updated, token: newToken };
  }

  /**
   * Mapea la entidad Usuario al DTO de respuesta.
   *
   * @param usuario Entidad Usuario
   * @returns {ResponseUsuarioDto}
   */
  private readonly mapToResponseDto = (
    usuario: Usuario,
  ): ResponseUsuarioDto => ({
    id: usuario.id,
    documento: usuario.documento,
    correo: usuario.correo,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    imagen: usuario.imagen,
    calle: usuario.calle,
    numero: usuario.numero,
    rol: usuario.rol,
    deshabilitado: usuario.deshabilitado,
    fechaRegistro: usuario.fecha_registro,
    departamento: usuario.departamento,
    codigoPostal: usuario.codigoPostal,
    provincia: usuario.provincia,
    ciudad: usuario.ciudad,
    prefijo: usuario.prefijo,
    telefono: usuario.telefono,
    puntos: usuario.puntos,
  });
}
