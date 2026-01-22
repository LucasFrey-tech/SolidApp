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
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { UpdateCredentialsDto } from './dto/panelUsuario.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<ResponseUsuarioDto[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { deshabilitado: false },
    });

    return usuarios.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, deshabilitado: false },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(usuario);
  }

  async findByEmail(correo: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { correo },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return usuario;
  }

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

  async update(
    id: number,
    updateDto: UpdateUsuarioDto,
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

  async delete(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    usuario.deshabilitado = true;
    await this.usuarioRepository.save(usuario);

    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  async restore(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

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

  async updateCredentials(id: number, dto: UpdateCredentialsDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let cambiosRealizados = false;

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

    return this.mapToResponseDto(usuario);
  }

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
  });
}
