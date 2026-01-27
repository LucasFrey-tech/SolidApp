import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../Entities/user.entity';
import { Organizacion } from '../../Entities/organizacion.entity';
import { UpdateOrganizacionDto } from './dto/update_organization.dto';
import { ResponseOrganizacionDto } from './dto/response_organization.dto';
import { UpdateCredentialsDto } from '../usuario/dto/panelUsuario.dto';
import bcrypt from 'bcrypt';
import { RegisterOrganizacionDto } from '../PRUEBA REFACTOR/dtos/dtos';
import { Empresa } from '../../Entities/empresa.entity';

@Injectable()
export class OrganizacionService {
  private readonly logger = new Logger(OrganizacionService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organizacion)
    private readonly organizacionRepository: Repository<Organizacion>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async findAll(): Promise<ResponseOrganizacionDto[]> {
    const organizaciones = await this.organizacionRepository.find({
      relations: ['users'],
      where: { usuario: { deshabilitado: false } },
    });

    return organizaciones.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      relations: ['users'],
      where: { id, usuario: { deshabilitado: false } },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(organizacion);
  }

  async findByEmail(correo: string): Promise<Organizacion> {
    const organizacion = await this.organizacionRepository.findOne({
      relations: ['users'],
      where: { usuario: { correo } },
    });

    if (!organizacion) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return organizacion;
  }

  async create(dto: RegisterOrganizacionDto): Promise<ResponseOrganizacionDto> {
    const emailExistente = await this.userRepository.findOne({
      where: { correo: dto.correo },
    });

    if (emailExistente) {
      throw new ConflictException(`El correo ${dto.correo} ya está registrado`);
    }

    // 2. Validar CUIT único (directamente)
    const [empresaConCuit, orgConCuit] = await Promise.all([
      this.empresaRepository.findOne({ where: { cuit: dto.cuit } }),
      this.organizacionRepository.findOne({ where: { cuit: dto.cuit } }),
    ]);

    if (empresaConCuit || orgConCuit) {
      throw new ConflictException(`El CUIT ${dto.cuit} ya está registrado`);
    }

    const user = this.userRepository.create({
      type: 'organizacion',
      correo: dto.correo,
      clave: await bcrypt.hash(dto.clave, 10),
      deshabilitado: false,
    });

    const savedUser = await this.userRepository.save(user);

    const empresa = this.organizacionRepository.create({
      usuario: savedUser,
      cuit: dto.cuit,
      razon_Social: dto.razon_Social,
      nombre_Organizacion: dto.nombre_Organizacion,
    });

    await this.organizacionRepository.save(empresa);
    return this.mapToResponseDto(empresa);
  }

  async update(
    id: number,
    updateDto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    const organizacion = await this.organizacionRepository.findOne({
      relations: ['users'],
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    Object.assign(organizacion, updateDto);

    await this.userRepository.save(organizacion.usuario);
    await this.organizacionRepository.save(organizacion);
    this.logger.log(`Organización ${id} actualizada`);

    return this.mapToResponseDto(organizacion);
  }

  async delete(id: number): Promise<void> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    organizacion.usuario.deshabilitado = true;
    await this.organizacionRepository.save(organizacion);

    this.logger.log(`Organización ${id} deshabilitada`);
  }

  async restore(id: number): Promise<void> {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    if (!organizacion.usuario.deshabilitado) {
      throw new BadRequestException('La organización ya está activa');
    }

    organizacion.usuario.deshabilitado = false;
    await this.organizacionRepository.save(organizacion);

    this.logger.log(`Organización ${id} restaurada`);
  }

  async updateCredentials(id: number, dto: UpdateCredentialsDto) {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException('Organización no encontrada');
    }

    let cambiosRealizados = false;

    if (dto.correo && dto.correo !== organizacion.usuario.correo) {
      const organizacionExistente = await this.organizacionRepository.findOne({
        where: { usuario: { correo: dto.correo } },
      });

      if (organizacionExistente && organizacionExistente.id !== id) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }

      organizacion.usuario.correo = dto.correo;
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
        organizacion.usuario.clave,
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const hash = await bcrypt.hash(dto.passwordNueva, 10);
      organizacion.usuario.clave = hash;
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      organizacion.usuario.ultimo_cambio = new Date();
      await this.organizacionRepository.save(organizacion);
    }

    return this.mapToResponseDto(organizacion);
  }

  private readonly mapToResponseDto = (
    organizacion: Organizacion,
  ): ResponseOrganizacionDto => ({
    id: organizacion.id,
    cuit: organizacion.cuit,
    razon_Social: organizacion.razon_Social,
    nombre_Organizacion: organizacion.nombre_Organizacion,
    descripcion: organizacion.descripcion,
    telefono: organizacion.usuario.telefono,
    web: organizacion.web,
    verificada: organizacion.verificada,
    deshabilitado: organizacion.usuario.deshabilitado,
    fechaRegistro: organizacion.usuario.fecha_registro,
    correo: organizacion.usuario.correo,
  });
}
