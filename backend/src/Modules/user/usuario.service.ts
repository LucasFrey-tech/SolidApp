import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PerfilUsuario } from '../../Entities/perfil_Usuario.entity';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdatePuntosDto } from './dto/update_puntos_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { CuentaService } from '../cuenta/cuenta.service';
import { DonacionService } from '../donation/donacion.service';
import { BeneficioService } from '../benefit/beneficio.service';
import { CreateDonationDto } from '../donation/dto/create_donation.dto';
import { UpdateCredencialesDto } from './dto/panelUsuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { UsuarioBeneficioService } from './usuario-beneficio/usuario-beneficio.service';

@Injectable()
export class PerfilUsuarioService {
  private readonly logger = new Logger(PerfilUsuarioService.name);

  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly usuarioRepository: Repository<PerfilUsuario>,
    private readonly cuentaService: CuentaService,
    private readonly donacionService: DonacionService,
    private readonly beneficioService: BeneficioService,
    private readonly usuarioBeneficioService: UsuarioBeneficioService,
  ) {}

  /**
   * Crea un nuevo usuario.
   */
  async create(
    createDto: CreateUsuarioDto,
    cuentaId: number,
    manager?: EntityManager,
  ): Promise<ResponseUsuarioDto> {
    const repo = manager
      ? manager.getRepository(PerfilUsuario)
      : this.usuarioRepository;

    const existente = await repo.findOne({
      where: { cuenta: { id: cuentaId } },
    });

    if (existente) {
      throw new ConflictException('Ya existe un perfil para esta cuenta');
    }

    const usuario = repo.create({
      ...createDto,
      cuenta: { id: cuentaId },
      puntos: 0,
    });

    const saved = await repo.save(usuario);
    this.logger.log(`Usuario creado con ID ${saved.id}`);

    return this.mapToResponseDto(saved);
  }

  /**
   * Busca un perfil por ID de cuenta.
   */
  async findByCuentaId(cuentaId: number): Promise<PerfilUsuario> {
    const perfil = await this.usuarioRepository.findOne({
      where: { cuenta: { id: cuentaId } },
      relations: ['cuenta'],
    });

    if (!perfil) {
      throw new NotFoundException(
        `Perfil de usuario para cuenta ${cuentaId} no encontrado`,
      );
    }

    return perfil;
  }

  // ================ Panel Usuario ===================

  /**
   * Obtiene las donaciones del usuario
   */
  async getDonaciones(usuarioId: number, page: number, limit: number) {
    return this.donacionService.findAllPaginatedByUser(usuarioId, page, limit);
  }

  /**
   * Realiza la donacion
   */
  async donar(usuarioId: number, dto: CreateDonationDto) {
    return this.donacionService.create(usuarioId, dto);
  }

  async getMisCuponesCanjeados(usuarioId: number) {
    return this.usuarioBeneficioService.getByUsuario(usuarioId);
  }

  async usarCupon(usuarioBeneficioId: number) {
    return this.usuarioBeneficioService.usarBeneficio(usuarioBeneficioId);
  }

  /**
   * Canjea un cupon o varios
   */
  async canjearCupon(usuarioId: number, cuponId: number, cantidad: number) {
    return this.beneficioService.canjear(usuarioId, cuponId, cantidad);
  }

  /**
   * Actualiza las credenciales del usuario
   */
  async updateCredenciales(cuentaId: number, dto: UpdateCredencialesDto) {
    return this.cuentaService.updateCredenciales(cuentaId, dto);
  }

  /**
   * Actualiza los datos del usuario
   */
  async updateUsuario(
    userId: number,
    dto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
      relations: ['cuenta'],
    });

    if (!usuario)
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

    const { departamento, ...cuentaFields } = dto;

    await this.cuentaService.updateUsuario(usuario.cuenta.id, cuentaFields);
    Object.assign(usuario.cuenta, cuentaFields);

    if (departamento !== undefined) {
      usuario.departamento = departamento;
      await this.usuarioRepository.save(usuario);
    }

    return this.mapToResponseDto(usuario);
  }

  /**
   * Actualiza los puntos del usuario
   */
  async updatePuntos(
    id: number,
    updateDto: UpdatePuntosDto,
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

  /**
   * Obtiene los puntos de un usuario específico.
   */
  async getPoints(id: number): Promise<{ id: number; puntos: number }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'puntos'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return { id: usuario.id, puntos: usuario.puntos ?? 0 };
  }

  // Panel Admin

  /**
   * Obtiene usuarios de forma paginada.
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: ResponseUsuarioDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.cuenta', 'cuenta')
      .where('cuenta.deshabilitado = :deshabilitado', { deshabilitado: false });

    if (search) {
      queryBuilder.andWhere(
        '(perfil.nombre LIKE :search OR perfil.apellido LIKE :search OR cuenta.correo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [usuarios, total] = await queryBuilder
      .skip(skip)
      .take(limit) // ✅ corregido de .limit() a .take()
      .orderBy('perfil.id', 'ASC')
      .getManyAndCount();

    return {
      items: usuarios.map((usuario) => this.mapToResponseDto(usuario)),
      total,
    };
  }

  /**
   * Obtiene un usuario por su ID.
   */
  async findOne(id: number): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(usuario);
  }

  /**
   * Deshabilita un usuario (soft delete sobre la Cuenta).
   */
  async delete(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.cuentaService.deshabilitar(usuario.cuenta.id);
    this.logger.log(`Usuario ${id} deshabilitado`);
  }

  /**
   * Restaura un usuario deshabilitado.
   */
  async restore(id: number): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['cuenta'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.cuentaService.habilitar(usuario.cuenta.id);
    this.logger.log(`Usuario ${id} restaurado`);
  }

  /**
   * Mapea la entidad PerfilUsuario al DTO de respuesta.
   */
  private mapToResponseDto(perfil: PerfilUsuario): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();

    dto.id = perfil.id;
    dto.documento = perfil.documento;
    dto.nombre = perfil.nombre;
    dto.apellido = perfil.apellido;
    dto.puntos = perfil.puntos;

    if (perfil.cuenta) {
      dto.correo = perfil.cuenta.correo;
      dto.deshabilitado = perfil.cuenta.deshabilitado;
      dto.verificada = perfil.cuenta.verificada;
      dto.fechaRegistro = perfil.cuenta.fecha_registro;
      dto.ultimo_cambio = perfil.cuenta.ultimo_cambio;
      dto.ultima_conexion = perfil.cuenta.ultima_conexion;
      dto.calle = perfil.cuenta.calle;
      dto.numero = perfil.cuenta.numero;
      dto.departamento = perfil.departamento;
      dto.codigo_postal = perfil.cuenta.codigo_postal;
      dto.ciudad = perfil.cuenta.ciudad;
      dto.provincia = perfil.cuenta.provincia;
      dto.prefijo = perfil.cuenta.prefijo;
      dto.telefono = perfil.cuenta.telefono;
    }

    return dto;
  }
}
