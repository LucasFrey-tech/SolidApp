import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
  ) {}

  /**
   *  Obtener todas las Empresas
   */
  async findAll(): Promise<EmpresaResponseDTO[]> {
    const empresas = await this.empresasRepository.find({
      where: { deshabilitado: false },
    });

    this.logger.log(`Se obtuvieron ${empresas.length} Empresas`);
    return empresas.map(this.mapToResponseDto);
  }

  /**
   * Obtiene una Empresa por ID
   */
  async findOne(id: number): Promise<EmpresaResponseDTO> {
    const empresas = await this.empresasRepository.findOne({
      where: { id, deshabilitado: false },
    });

    if (!empresas) {
      throw new NotFoundException(`
        La Empresa con ID ${id} no encontrada  `);
    }

    this.logger.log(`La Empresa ${id} obtenida`);
    return this.mapToResponseDto(empresas);
  }

  /**
   * Crea una nueva Empresa
   */
  async create(createDto: CreateEmpresaDTO): Promise<EmpresaResponseDTO> {
    // Verificación de Empresa ya Registrada
    const existente = await this.empresasRepository.findOne({
      where: { nroDocumento: createDto.nroDocumento },
    });

    if (existente) {
      throw new ConflictException('La Empresa ya esta registrada');
    }

    // Creación de la Empresa
    const empresas = this.empresasRepository.create({
      ...createDto,
      verificada: false,
    });

    const savedEmpresa = await this.empresasRepository.save(empresas);
    return this.mapToResponseDto(savedEmpresa);
  }

  /**
   * Actualizar una Empresa
   */
  async update(
    id: number,
    updateDto: UpdateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    const empresas = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresas) {
      throw new NotFoundException(`
        Empresa con ID ${id} no encontrada`);
    }

    // Aplicación de cambios
    Object.assign(empresas, updateDto);

    const updatedEmpresa = await this.empresasRepository.save(empresas);
    this.logger.log(`Empresa ${id} actualizada`);

    return this.mapToResponseDto(updatedEmpresa);
  }

  async delete(id: number): Promise<void> {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`La Empresa con ID ${id} no encontrada`);
    }

    // Soft delete
    empresa.deshabilitado = true;

    await this.empresasRepository.save(empresa);

    this.logger.log(`Empresa ${id} deshabilitada`);
  }

  async restore(id: number): Promise<void> {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`La Empresa con ID ${id} no encontrada`);
    }

    if (!empresa.deshabilitado) {
      throw new BadRequestException('La empresa ya se encuentra activa');
    }

    // Restaurar empresa
    empresa.deshabilitado = false;

    await this.empresasRepository.save(empresa);

    this.logger.log(`Empresa ${id} restaurada`);
  }

  private readonly mapToResponseDto = (
    empresa: Empresa,
  ): EmpresaResponseDTO => {
    return {
      id: empresa.id,
      nroDocumento: empresa.nroDocumento,
      razon_social: empresa.razon_social,
      nombre_fantasia: empresa.nombre_fantasia,
      descripcion: empresa.descripcion,
      rubro: empresa.rubro,
      telefono: empresa.telefono,
      direccion: empresa.direccion,
      web: empresa.web,
      verificada: empresa.verificada,
      deshabilitado: empresa.deshabilitado,
      fecha_registro: empresa.fecha_registro,
      ultimo_cambio: empresa.ultimo_cambio,
    };
  };
}
