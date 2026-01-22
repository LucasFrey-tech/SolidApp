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
import { Organizations } from '../../Entities/organizations.entity';
import { CreateOrganizationDto } from './dto/create_organization.dto';
import { UpdateOrganizationDto } from './dto/update_organization.dto';
import { ResponseOrganizationDto } from './dto/response_organization.dto';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
  ) {}

  async findAll(): Promise<ResponseOrganizationDto[]> {
    const organizations = await this.organizationRepository.find({
      where: { deshabilitado: false },
    });

    return organizations.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<ResponseOrganizationDto> {
    const organization = await this.organizationRepository.findOne({
      where: { id, deshabilitado: false },
    });

    if (!organization) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(organization);
  }

  async findByEmail(correo: string): Promise<Organizations> {
    const organizacion = await this.organizationRepository.findOne({
      where: { correo },
    });

    if (!organizacion) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return organizacion;
  }

  async create(
    createDto: CreateOrganizationDto,
  ): Promise<ResponseOrganizationDto> {
    const existente = await this.organizationRepository.findOne({
      where: { nroDocumento: createDto.nroDocumento },
    });

    if (existente) {
      throw new ConflictException('La organización ya se encuentra registrada');
    }

    const organization = this.organizationRepository.create({
      ...createDto,
      razon_social: createDto.razonSocial,
      nombre_fantasia: createDto.nombreFantasia,
      direccion: '',
      verificada: false,
      deshabilitado: false,
    });

    const saved = await this.organizationRepository.save(organization);
    this.logger.log(`Organización creada con ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  async update(
    id: number,
    updateDto: UpdateOrganizationDto,
  ): Promise<ResponseOrganizationDto> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    Object.assign(organization, updateDto);

    const updated = await this.organizationRepository.save(organization);
    this.logger.log(`Organización ${id} actualizada`);

    return this.mapToResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    organization.deshabilitado = true;
    await this.organizationRepository.save(organization);

    this.logger.log(`Organización ${id} deshabilitada`);
  }

  async restore(id: number): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    if (!organization.deshabilitado) {
      throw new BadRequestException('La organización ya está activa');
    }

    organization.deshabilitado = false;
    await this.organizationRepository.save(organization);

    this.logger.log(`Organización ${id} restaurada`);
  }

  async updateCredentials(id: number, dto: UpdateCredentialsDto) {
    const organizacion = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organizacion) {
      throw new NotFoundException('Organización no encontrada');
    }

    const passwordValida = await bcrypt.compare(
      dto.passwordActual,
      organizacion.clave,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    if (dto.correo) {
      organizacion.correo = dto.correo;
    }

    if (dto.passwordNueva) {
      organizacion.clave = await bcrypt.hash(dto.passwordNueva, 10);
    }

    return this.organizationRepository.save(organizacion);
  }

  private readonly mapToResponseDto = (
    organization: Organizations,
  ): ResponseOrganizationDto => ({
    id: organization.id,
    nroDocumento: organization.nroDocumento,
    razonSocial: organization.razon_social,
    nombreFantasia: organization.nombre_fantasia,
    descripcion: organization.descripcion,
    telefono: organization.telefono,
    web: organization.web,
    verificada: organization.verificada,
    deshabilitado: organization.deshabilitado,
    fechaRegistro: organization.fecha_registro,
    correo: organization.correo,
  });
}
