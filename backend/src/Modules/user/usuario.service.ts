import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../Entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';

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
