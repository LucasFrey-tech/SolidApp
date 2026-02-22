import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from '../../Entities/perfil_Usuario.entity';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { JwtService } from '@nestjs/jwt';
import { CuentaService } from '../cuenta/cuenta.service';
import { RolCuenta } from '../../Entities/cuenta.entity';

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
export class PerfilUsuarioService {
  private readonly logger = new Logger(PerfilUsuarioService.name);

  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly usuarioRepository: Repository<PerfilUsuario>,
    private readonly cuentaService: CuentaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Obtiene todos los usuarios activos (no deshabilitados).
   *
   * @returns {Promise<ResponseUsuarioDto[]>} - Lista de usuarios activos
   */
  async findAll(): Promise<ResponseUsuarioDto[]> {
    const usuario = await this.usuarioRepository.find({
      relations: ['cuenta'],
      where: {
        cuenta: {
          deshabilitado: false,
        },
      },
    });

    return usuario.map((usuario) => this.mapToResponseDto(usuario));
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

    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.cuenta', 'cuenta')
      .where('cuenta.deshabilitado = :deshabilitado', { deshabilitado: false });

    if (search) {
      queryBuilder.andWhere(
        '(perfil.nombre LIKE :search OR perfil.apellido LIKE :search OR cuenta.correo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [usuarios, total] = await queryBuilder
      .skip(skip)
      .limit(limit)
      .orderBy('perfil.id', 'ASC')
      .getManyAndCount();

    return {
      items: usuarios.map((usuario) => this.mapToResponseDto(usuario)),
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
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(usuario);
  }

  /**
   * Busca un perfil por ID de cuenta.
   */
  async findByCuentaId(cuentaId: number): Promise<PerfilUsuario> {
    const perfil = await this.usuarioRepository.findOne({
      where: { cuenta: { id: cuentaId } },
      relations: ['cuenta'],
    });

    if (!perfil) {
      throw new NotFoundException(
        `Perfil de usuario para cuenta ${cuentaId} no encontrado`,
      );
    }

    return perfil;
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
  async create(
    createDto: CreateUsuarioDto,
    cuentaId: number,
  ): Promise<ResponseUsuarioDto> {
    const cuenta = await this.cuentaService.findById(cuentaId);

    if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

    if (cuenta.role !== RolCuenta.USUARIO) {
      throw new ConflictException('La cuenta no es de tipo USUARIO');
    }

    const existente = await this.usuarioRepository.findOne({
      where: { cuenta: { id: cuentaId } },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const usuario = this.usuarioRepository.create({
      ...createDto,
      cuenta,
      puntos: 0,
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
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

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

    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  /**
   * Mapea la entidad Usuario al DTO de respuesta.
   *
   * @param usuario Entidad Usuario
   * @returns {ResponseUsuarioDto}
   */
  private mapToResponseDto(perfil: PerfilUsuario): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();

    dto.id = perfil.id;
    dto.documento = perfil.documento;
    dto.nombre = perfil.nombre;
    dto.apellido = perfil.apellido;
    dto.puntos = perfil.puntos;

    if (perfil.cuenta) {
      dto.correo = perfil.cuenta.correo;
      dto.deshabilitado = perfil.cuenta.deshabilitado;
      dto.verificada = perfil.cuenta.verificada;
      dto.fechaRegistro = perfil.cuenta.fecha_registro;
      dto.ultimo_cambio = perfil.cuenta.ultimo_cambio;
      dto.ultima_conexion = perfil.cuenta.ultima_conexion;
      dto.calle = perfil.cuenta.calle;
      dto.numero = perfil.cuenta.numero;
      dto.codigoPostal = perfil.cuenta.codigo_postal;
      dto.ciudad = perfil.cuenta.ciudad;
      dto.provincia = perfil.cuenta.provincia;
      dto.prefijo = perfil.cuenta.prefijo;
      dto.telefono = perfil.cuenta.telefono;
    }

    return dto;
  }
}
