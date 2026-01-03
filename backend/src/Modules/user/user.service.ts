import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../Entities/user.entity';
import { CreateUserDto } from './dto/create_user.dto';
import { UpdateUserDto } from './dto/update_user.dto';
import { ResponseUserDto } from './dto/response_user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<ResponseUserDto[]> {
    const users = await this.userRepository.find({
      where: { deshabilitado: false },
    });

    return users.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<ResponseUserDto> {
    const user = await this.userRepository.findOne({
      where: { id, deshabilitado: false },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(user);
  }

  async findByEmail(correo: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { correo },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return user;
  }

  async create(createDto: CreateUserDto): Promise<ResponseUserDto> {
    const existente = await this.userRepository.findOne({
      where: { correo: createDto.correo },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const user = this.userRepository.create({
      ...createDto,
      deshabilitado: false,
    });

    const saved = await this.userRepository.save(user);
    this.logger.log(`Usuario creado con ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<ResponseUserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    Object.assign(user, updateDto);

    const updated = await this.userRepository.save(user);
    this.logger.log(`Usuario ${id} actualizado`);

    return this.mapToResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    user.deshabilitado = true;
    await this.userRepository.save(user);

    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  async restore(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (!user.deshabilitado) {
      throw new BadRequestException('El usuario ya está activo');
    }

    user.deshabilitado = false;
    await this.userRepository.save(user);

    this.logger.log(`Usuario ${id} restaurado`);
  }

  private readonly mapToResponseDto = (user: User): ResponseUserDto => ({
    id: user.id,
    correo: user.correo,
    nombre: user.nombre,
    apellido: user.apellido,
    imagen: user.imagen,
    direccion: user.direccion,
    rol: user.rol,
    deshabilitado: user.deshabilitado,
    fechaRegistro: user.fecha_registro,
  });
}
