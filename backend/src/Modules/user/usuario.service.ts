import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  Like,
  MoreThan,
  Repository,
} from 'typeorm';
import { Rol, Usuario } from '../../Entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdatePuntosDto } from './dto/update_puntos_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { DonacionService } from '../donation/donacion.service';
import { BeneficioService } from '../benefit/beneficio.service';
import { CreateDonationDto } from '../donation/dto/create_donation.dto';
import { UpdateCredencialesDto } from './dto/panelUsuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { UsuarioBeneficioService } from './usuario-beneficio/usuario-beneficio.service';
import { HashService } from '../../common/bcryptService/hashService';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly donacionService: DonacionService,
    private readonly beneficioService: BeneficioService,
    private readonly usuarioBeneficioService: UsuarioBeneficioService,
    private readonly hashService: HashService,
  ) {}

  /**
   * Encuentra un usuario por correo y Rol
   */
  async findByEmailRol(correo: string, rol: Rol): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo: correo, rol: rol },
    });
  }

  /**
   * Encuentra un usuario por correo
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo: email },
    });
  }

  /**
   * Crea un nuevo usuario.
   */
  async create(
    createDto: CreateUsuarioDto,
    manager?: EntityManager,
  ): Promise<ResponseUsuarioDto> {
    const repo = manager
      ? manager.getRepository(Usuario)
      : this.usuarioRepository;

    const existente = await repo.findOne({
      where: { documento: createDto.documento },
    });

    if (existente) {
      throw new ConflictException('Ya existe este Usuario');
    }

    const usuario = repo.create({
      ...createDto,
      puntos: 0,
    });

    const saved = await repo.save(usuario);
    this.logger.log(`Usuario creado con ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  // ================ Panel Usuario ===================

  /**
   * Obtiene las donaciones del usuario
   */
  async getDonaciones(usuarioId: number, page: number, limit: number) {
    return this.donacionService.findAllPaginatedByUser(usuarioId, page, limit);
  }

  /**
   * Realiza la donacion
   */
  async donar(usuarioId: number, dto: CreateDonationDto) {
    return this.donacionService.create(usuarioId, dto);
  }

  async getMisCuponesCanjeados(usuarioId: number) {
    return this.usuarioBeneficioService.getByUsuario(usuarioId);
  }

  async usarCupon(usuarioBeneficioId: number) {
    return this.usuarioBeneficioService.usarBeneficio(usuarioBeneficioId);
  }

  /**
   * Canjea un cupon o varios
   */
  async canjearCupon(usuarioId: number, cuponId: number, cantidad: number) {
    return this.beneficioService.canjear(usuarioId, cuponId, cantidad);
  }

  /**
   * Actualiza las credenciales del usuario
   */
  async updateCredenciales(
    id: number,
    dto: UpdateCredencialesDto,
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (dto.passwordNueva) {
      if (!dto.passwordActual) {
        throw new BadRequestException('Debés ingresar la contraseña actual');
      }

      const coincide = await this.hashService.compare(
        dto.passwordActual,
        usuario.clave,
      );
      if (!coincide) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }

      usuario.clave = await this.hashService.hash(dto.passwordNueva);
    }

    if (dto.correo) {
      usuario.correo = dto.correo;
    }

    await this.usuarioRepository.save(usuario);
  }

  /**
   * Actualiza los datos del usuario
   */
  async updateUsuario(
    id: number,
    dto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    Object.assign(usuario, dto);

    await this.usuarioRepository.save(usuario);

    return this.mapToResponseDto(usuario);
  }

  /**
   * Actualiza los puntos del usuario
   */
  async updatePuntos(
    id: number,
    updateDto: UpdatePuntosDto,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    Object.assign(usuario, updateDto);

    const updated = await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario ${id} actualizado`);

    return this.mapToResponseDto(updated);
  }

  async actualizarUltimaConexion(id: number): Promise<void> {
    await this.usuarioRepository.update(id, {
      ultima_conexion: new Date(),
    });
  }

  /**
   * Obtiene los puntos de un usuario específico.
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

  // Panel Admin

  /**
   * Obtiene usuarios de forma paginada.
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: ResponseUsuarioDto[]; total: number }> {
    const skip = (page - 1) * limit;

    let whereConditions:
      | FindOptionsWhere<Usuario>
      | FindOptionsWhere<Usuario>[] = {};

    if (search) {
      whereConditions = [
        { nombre: Like(`%${search}%`) },
        { apellido: Like(`%${search}%`) },
        { correo: Like(`%${search}%`) },
        { documento: Like(`%${search}%`) },
      ];
    }

    const [usuarios, total] = await this.usuarioRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: {
        id: 'ASC',
      },
    });

    return {
      items: usuarios.map((usuario) => this.mapToResponseDto(usuario)),
      total,
    };
  }

  /**
   * Obtiene un usuario por su ID.
   */
  async findOne(id: number): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(usuario);
  }

  /**
   * Deshabilita un usuario (soft delete sobre la Cuenta).
   */
  async delete(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuarioRepository.update(id, { deshabilitado: true });
    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  /**
   * Restaura un usuario deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuarioRepository.update(id, { deshabilitado: false });
    this.logger.log(`Usuario ${id} restaurado`);
  }

  /**
   * Mapea la entidad PerfilUsuario al DTO de respuesta.
   */
  private mapToResponseDto(usuario: Usuario): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();

    dto.id = usuario.id;
    dto.documento = usuario.documento;
    dto.nombre = usuario.nombre;
    dto.apellido = usuario.apellido;
    dto.puntos = usuario.puntos;
    dto.correo = usuario.correo;
    dto.deshabilitado = usuario.deshabilitado;
    dto.verificada = usuario.verificada;
    dto.fecha_registro = usuario.fecha_registro;
    dto.ultimo_cambio = usuario.ultimo_cambio;
    dto.ultima_conexion = usuario.ultima_conexion;
    dto.calle = usuario.calle;
    dto.numero = usuario.numero;
    dto.departamento = usuario.departamento;
    dto.codigo_postal = usuario.codigo_postal;
    dto.ciudad = usuario.ciudad;
    dto.provincia = usuario.provincia;
    dto.prefijo = usuario.prefijo;
    dto.telefono = usuario.telefono;

    return dto;
  }

  async findByResetToken(token: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
  }

  async setResetToken(id: number, token: string, expires: Date): Promise<void> {
    await this.usuarioRepository.update(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async clearResetToken(id: number): Promise<void> {
    await this.usuarioRepository.update(id, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async resetPassword(id: number, newHashedPassword: string): Promise<void> {
    await this.usuarioRepository.update(id, {
      clave: newHashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }
}
