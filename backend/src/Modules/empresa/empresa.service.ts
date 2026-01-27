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
import { Empresa } from '../../Entities/empresa.entity';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { EmpresaImagenDTO } from './dto/lista_empresa_imagen.dto';
import { Empresa_imagenes } from '../../Entities/empresa_imagenes.entity';
import { SettingsService } from '../../common/settings/settings.service';
import { UpdateCredentialsDto } from '../usuario/dto/panelUsuario.dto';
import bcrypt from 'bcrypt';
import { User } from '../../Entities/user.entity';
import { RegisterEmpresaDto } from '../PRUEBA REFACTOR/dtos/dtos';
import { Organizacion } from '../../Entities/organizacion.entity';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
    @InjectRepository(Empresa_imagenes)
    private readonly empresasImagenRepository: Repository<Empresa_imagenes>,
    @InjectRepository(Organizacion)
    private readonly organizacionRepository: Repository<Organizacion>,
  ) {}

  /**
   *  Obtener todas las Empresas
   */
  async findAll(): Promise<EmpresaResponseDTO[]> {
    const empresas = await this.empresasRepository.find({
      relations: ['users'],
      where: { usuario: { deshabilitado: false } },
    });

    /*const imagen = await this.empresasImagenRepository.find({
      relations: ['users'],
      where: { id_empresa: { id: empresas[0].id } },
    });*/

    this.logger.log(`Se obtuvieron ${empresas.length} Empresas`);
    const res = empresas.map(this.mapToResponseDto);
    // res.forEach((empresa) => empresa.imagen = imagen[0].logo);
    res.forEach(
      (empresa) =>
        (empresa.imagen = SettingsService.getStaticResourceUrl('servo.png')),
    );
    return res;
  }

  /**
   * Obtengo las Imagenes de cada empresa
   */
  async findIMG(): Promise<EmpresaImagenDTO[]> {
    const images = await this.empresasImagenRepository.find({
      relations: ['id_empresa', 'users'],
      where: {
        id_empresa: {
          usuario: {
            deshabilitado: false,
          },
        },
      },
    });

    this.logger.log(`Se obtuvieron ${images.length} imágenes de empresas`);

    return images.map((img) => ({
      id_empresa: img.id_empresa.id,
      nombre: img.id_empresa.razon_Social,
      logo: img.logo,
    }));
  }

  /**
   * Obtiene una Empresa por ID
   */
  async findOne(id: number): Promise<EmpresaResponseDTO> {
    const empresas = await this.empresasRepository.findOne({
      relations: ['users'],
      where: { id, usuario: { deshabilitado: false } },
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
      relations: ['users'],
      where: { usuario: { correo, deshabilitado: false } },
    });

    if (!empresa) {
      throw new NotFoundException(`Usuario con email ${correo} no encontrado`);
    }

    return empresa;
  }

  async create(dto: RegisterEmpresaDto): Promise<EmpresaResponseDTO> {
    const emailExistente = await this.userRepository.findOne({
      where: { correo: dto.correo },
    });

    if (emailExistente) {
      throw new ConflictException(`El correo ${dto.correo} ya está registrado`);
    }

    // 2. Validar CUIT único (directamente)
    const [empresaConCuit, orgConCuit] = await Promise.all([
      this.empresasRepository.findOne({ where: { cuit: dto.cuit } }),
      this.organizacionRepository.findOne({ where: { cuit: dto.cuit } }),
    ]);

    if (empresaConCuit || orgConCuit) {
      throw new ConflictException(`El CUIT ${dto.cuit} ya está registrado`);
    }

    const user = this.userRepository.create({
      type: 'empresa',
      correo: dto.correo,
      clave: await bcrypt.hash(dto.clave, 10),
      telefono: dto.telefono,
      calle: dto.calle,
      numero: dto.numero,
      deshabilitado: false,
    });

    const savedUser = await this.userRepository.save(user);

    const empresa = this.empresasRepository.create({
      usuario: savedUser,
      cuit: dto.cuit,
      razon_Social: dto.razon_Social,
      nombre_Empresa: dto.nombre_Empresa,
      web: dto.web,
    });

    await this.empresasRepository.save(empresa);
    return this.mapToResponseDto(empresa);
  }

  /**
   * Actualizar una Empresa
   */
  async update(
    id: number,
    updateDto: UpdateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresasRepository.findOne({
      relations: ['users'],
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`
        Empresa con ID ${id} no encontrada`);
    }

    // Aplicación de cambios
    Object.assign(empresa, updateDto);

    await this.userRepository.save(empresa);
    await this.empresasRepository.save(empresa);
    this.logger.log(`Empresa ${id} actualizada`);

    return this.mapToResponseDto(empresa);
  }

  async delete(id: number): Promise<void> {
    const empresa = await this.empresasRepository.findOne({
      relations: ['users'],
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`La Empresa con ID ${id} no encontrada`);
    }

    // Soft delete
    empresa.usuario.deshabilitado = true;

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

    if (!empresa.usuario.deshabilitado) {
      throw new BadRequestException('La empresa ya se encuentra activa');
    }

    // Restaurar empresa
    empresa.usuario.deshabilitado = false;

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

    if (dto.correo && dto.correo !== empresa.usuario.correo) {
      const empresaExistente = await this.empresasRepository.findOne({
        where: { usuario: { correo: dto.correo } },
      });

      if (empresaExistente && empresaExistente.id !== id) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }

      empresa.usuario.correo = dto.correo;
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
        empresa.usuario.clave,
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const hash = await bcrypt.hash(dto.passwordNueva, 10);
      empresa.usuario.clave = hash;
      cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      empresa.usuario.ultimo_cambio = new Date();
      return this.empresasRepository.save(empresa);
    }

    return this.mapToResponseDto(empresa);
  }

  private readonly mapToResponseDto = (
    empresa: Empresa,
  ): EmpresaResponseDTO => {
    return {
      id: empresa.id,
      cuit: empresa.cuit,
      razon_Social: empresa.razon_Social,
      nombre_Empresa: empresa.nombre_Empresa,
      descripcion: empresa.descripcion,
      rubro: empresa.rubro,
      telefono: empresa.usuario.telefono,
      calle: empresa.usuario.calle,
      numero: empresa.usuario.numero,
      web: empresa.web,
      verificada: empresa.verificada,
      deshabilitado: empresa.usuario.deshabilitado,
      fecha_registro: empresa.usuario.fecha_registro,
      ultimo_cambio: empresa.usuario.ultimo_cambio,
      imagen: '',
      correo: empresa.usuario.correo,
    };
  };
}
