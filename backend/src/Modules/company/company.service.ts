import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Companies } from 'src/Entities/companies.entity';
import { CreateCompanyDTO } from './dto/create_company.dto';
import { UpdateCompanyDTO } from './dto/update_company.dto';
import { CompanyResponseDTO } from './dto/response_company.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Companies)
    private readonly companiesRepository: Repository<Companies>,
  ) {}

  /**
   *  Obtener todas las Empresas
   */
  async findAll(): Promise<CompanyResponseDTO[]> {
    const companies = await this.companiesRepository.find({
      where: { deshabilitado: false },
    });

    this.logger.log(`Se obtuvieron ${companies.length} Empresas`);
    return companies.map(this.mapToResponseDto);
  }

  /**
   * Obtiene una Empresa por ID
   */
  async findOne(id: number): Promise<CompanyResponseDTO> {
    const company = await this.companiesRepository.findOne({
      where: { id, deshabilitado: false },
    });

    if (!company) {
      throw new NotFoundException(`
        La Empresa con ID ${id} no encontrada  `);
    }

    this.logger.log(`La Empresa ${id} obtenida`);
    return this.mapToResponseDto(company);
  }

  /**
   * Crea una nueva Empresa
   */
  async create(createDto: CreateCompanyDTO): Promise<CompanyResponseDTO> {
    // Verificación de Empresa ya Registrada
    const existente = await this.companiesRepository.findOne({
      where: { nroDocumento: createDto.nroDocumento },
    });

    if (existente) {
      throw new ConflictException('La Empresa ya esta registrada');
    }

    // Creación de la Empresa
    const company = this.companiesRepository.create({
      ...createDto,
      verificada: false,
    });

    const savedCompany = await this.companiesRepository.save(company);
    return this.mapToResponseDto(savedCompany);
  }

  /**
   * Actualizar una Empresa
   */
  async update(
    id: number,
    updateDto: UpdateCompanyDTO,
  ): Promise<CompanyResponseDTO> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`
        Empresa con ID ${id} no encontrada`);
    }

    // Aplicación de cambios
    Object.assign(company, updateDto);

    const updatedCompany = await this.companiesRepository.save(company);
    this.logger.log(`Empresa ${id} actualizada`);

    return this.mapToResponseDto(updatedCompany);
  }

  async delete(id: number): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`La Empresa con ID ${id} no encontrada`);
    }

    // Soft delete
    company.deshabilitado = true;

    await this.companiesRepository.save(company);

    this.logger.log(`Empresa ${id} deshabilitada`);
  }

  async restore(id: number): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`La Empresa con ID ${id} no encontrada`);
    }

    if (!company.deshabilitado) {
      throw new BadRequestException('La empresa ya se encuentra activa');
    }

    // Restaurar empresa
    company.deshabilitado = false;

    await this.companiesRepository.save(company);

    this.logger.log(`Empresa ${id} restaurada`);
  }

  private readonly mapToResponseDto = (
    company: Companies,
  ): CompanyResponseDTO => {
    return {
      id: company.id,
      nroDocumento: company.nroDocumento,
      razon_social: company.razon_social,
      nombre_fantasia: company.nombre_fantasia,
      descripcion: company.descripcion,
      rubro: company.rubro,
      telefono: company.telefono,
      direccion: company.direccion,
      web: company.web,
      verificada: company.verificada,
      deshabilitado: company.deshabilitado,
      fecha_registro: company.fecha_registro,
      ultimo_cambio: company.ultimo_cambio,
    };
  };
}
