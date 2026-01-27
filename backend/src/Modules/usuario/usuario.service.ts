import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../Entities/usuario.entity';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { UpdateCredentialsDto } from './dto/panelUsuario.dto';
import bcrypt from 'bcrypt';
import { User } from '../../Entities/user.entity';
import { RegisterUsuarioDto } from '../PRUEBA REFACTOR/dtos/dtos';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<ResponseUsuarioDto[]> {
    const usuarios = await this.usuarioRepository.find({
      relations: ['users'],
      where: { usuario: { deshabilitado: false } },
    });

    return usuarios.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      relations: ['users'],
      where: { id, usuario: { deshabilitado: false } },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(usuario);
  }

  async findByEmail(correo: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      relations: ['users'],
      where: { usuario: { correo } },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return usuario;
  }

  async create(dto: RegisterUsuarioDto): Promise<ResponseUsuarioDto> {
    const correoExistente = await this.userRepository.findOne({
      where: { correo: dto.correo },
    });

    if (correoExistente) {
      throw new ConflictException(`El correo ${dto.correo} ya está registrado`);
    }

    const user = this.userRepository.create({
      correo: dto.correo,
      clave: await bcrypt.hash(dto.clave, 10),
      type: 'usuario',
      deshabilitado: false,
    });

    const savedUser = await this.userRepository.save(user);

    const usuario = this.usuarioRepository.create({
      usuario: savedUser,
      documento: dto.documento,
      nombre: dto.nombre,
      apellido: dto.apellido,
    });

    await this.usuarioRepository.save(usuario);
    return this.mapToResponseDto(usuario);
  }

  async update(
    id: number,
    updateDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      relations: ['users'],
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    Object.assign(usuario, updateDto);

    await this.userRepository.save(usuario.usuario);
    await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario ${id} actualizado`);

    return this.mapToResponseDto(usuario);
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      relations: ['users'],
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    usuario.usuario.deshabilitado = true;
    await this.usuarioRepository.save(usuario.usuario);

    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  async restore(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      relations: ['users'],
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!usuario.usuario.deshabilitado) {
      throw new BadRequestException('El usuario ya está activo');
    }

    usuario.usuario.deshabilitado = false;
    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} restaurado`);
  }

  async updateCredentials(id: number, dto: UpdateCredentialsDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let cambiosRealizados = false;

    if (dto.correo && dto.correo !== usuario.usuario.correo) {
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { usuario: { correo: dto.correo } },
      });

      if (usuarioExistente && usuarioExistente.id !== id) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }

      usuario.usuario.correo = dto.correo;
      cambiosRealizados = true;
    }

    if (dto.passwordNueva) {
      if (!dto.passwordActual) {
        throw new UnauthorizedException(
          'Para cambiar la contraseña debés ingresar la contraseña actual',
        );
      }

      const passwordValida = await bcrypt.compare(
        dto.passwordActual,
        usuario.usuario.clave,
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const hash = await bcrypt.hash(dto.passwordNueva, 10);
      usuario.usuario.clave = hash;
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      usuario.usuario.ultimo_cambio = new Date();
      await this.usuarioRepository.save(usuario);
    }

    return this.mapToResponseDto(usuario);
  }

  private readonly mapToResponseDto = (
    usuario: Usuario,
  ): ResponseUsuarioDto => ({
    id: usuario.id,
    documento: usuario.documento,
    correo: usuario.usuario.correo,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    calle: usuario.usuario.calle,
    numero: usuario.usuario.numero,
    rol: usuario.usuario.type,
    deshabilitado: usuario.usuario.deshabilitado,
    fechaRegistro: usuario.usuario.fecha_registro,
    codigoPostal: usuario.usuario.codigoPostal,
    provincia: usuario.usuario.provincia,
    ciudad: usuario.usuario.ciudad,
    prefijo: usuario.usuario.prefijo,
    telefono: usuario.usuario.telefono,
    puntos: usuario.puntos,
  });
}
