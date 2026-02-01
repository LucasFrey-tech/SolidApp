import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Empresa } from '../../Entities/empresa.entity';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { EmpresaImagenDTO } from './dto/lista_empresa_imagen.dto';
import { Empresa_imagenes } from '../../Entities/empresa_imagenes.entity';
import { SettingsService } from '../../common/settings/settings.service';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,

    @InjectRepository(Empresa_imagenes)
    private readonly empresasImagenRepository: Repository<Empresa_imagenes>,

    private readonly jwtService: JwtService,
  ) { }

  /**
   *  Obtener todas las Empresas
   */
  async findAll(): Promise<EmpresaResponseDTO[]> {
    const empresas = await this.empresasRepository.find({
      where: { deshabilitado: false },
    });

    const imagen = await this.empresasImagenRepository.find({
      where: { id_empresa: { id: empresas[0].id } },
    });

    this.logger.log(`Se obtuvieron ${empresas.length} Empresas`);
    let res = empresas.map(this.mapToResponseDto);
    // res.forEach((empresa) => empresa.imagen = imagen[0].logo);
    res.forEach(
      (empresa) =>
        (empresa.imagen = SettingsService.getStaticResourceUrl('servo.png')),
    );
    return res;
  }

  async findPaginated(page: number, limit: number, search: string) {
    const startIndex = (page - 1) * limit;
    const [empresas, total] = await this.empresasRepository.findAndCount({
      skip: startIndex,
      take: limit,
      order: { id: 'ASC' },
      where: [
        { razon_social: Like(`%${search}%`), deshabilitado: false },
        { nombre_fantasia: Like(`%${search}%`), deshabilitado: false }
      ],
    });


    return {
      items: empresas.map(this.mapToResponseDto),
      total
    };
  }

  /**
   * Obtengo las Imagenes de cada empresa
   */
  async findIMG(): Promise<EmpresaImagenDTO[]> {
    const images = await this.empresasImagenRepository.find({
      relations: ['id_empresa'],
      where: {
        id_empresa: {
          deshabilitado: false,
        },
      },
    });

    this.logger.log(`Se obtuvieron ${images.length} imágenes de empresas`);

    return images.map((img) => ({
      id_empresa: img.id_empresa.id,
      nombre: img.id_empresa.razon_social,
      logo: img.logo,
    }));
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
   * Obtiene una Empresa por Correo
   */

  async findByEmail(correo: string): Promise<Empresa> {
    const empresa = await this.empresasRepository.findOne({
      where: { correo },
    });

    if (!empresa) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return empresa;
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

  async updateCredentials(id: number, dto: UpdateCredentialsDto) {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    let cambiosRealizados = false;

    if (dto.correo && dto.correo !== empresa.correo) {
      const empresaExistente = await this.empresasRepository.findOne({
        where: { correo: dto.correo },
      });

      if (empresaExistente && empresaExistente.id !== id) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }

      empresa.correo = dto.correo;
      cambiosRealizados = true;
    }

    if (dto.passwordNueva) {
      if (!dto.passwordNueva) {
        throw new UnauthorizedException(
          'Para cambiar la contraseña debés ingresar la contraseña actual',
        );
      }

      const passwordValida = await bcrypt.compare(
        dto.passwordActual,
        empresa.clave,
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const hash = await bcrypt.hash(dto.passwordNueva, 10);
      empresa.clave = hash;
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      empresa.ultimo_cambio = new Date();
      await this.empresasRepository.save(empresa);
    }

    const updated = await this.empresasRepository.save(empresa);

    const payload = {
      sub: updated.id,
      email: updated.correo,
      userType: 'empresa',
    };

    const newToken = this.jwtService.sign(payload);

    return {
      user: updated,
      token: newToken,
    };
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
      imagen: '',
      correo: empresa.correo,
    };
  };
}
