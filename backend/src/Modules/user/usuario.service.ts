import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, MoreThan, Repository } from 'typeorm';
import { Usuario } from '../../Entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdatePuntosDto } from './dto/update_puntos_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { DonacionService } from '../donation/donacion.service';
import { BeneficioService } from '../benefit/beneficio.service';
import { CreateDonationDto } from '../donation/dto/create_donation.dto';
import { UpdateCredencialesDto } from './dto/panelUsuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { UsuarioBeneficioService } from './usuario-beneficio/usuario-beneficio.service';
import { HashService } from '../../common/bcryptService/hashService';
import { JwtService } from '@nestjs/jwt';
import { GestionTipo } from '../auth/dto/gestion.enum';
import { ErrorManager } from '../../common/errors/error.manager';
import { PaginatedUserDonationsResponseDto } from '../donation/dto/response_donation_paginatedByUser.dto';
import { ResponseDonationDto } from '../donation/dto/response_donation.dto';
import { UsuarioBeneficio } from '../../Entities/usuario-beneficio.entity';
import { CanjearResponseDto } from '../benefit/dto/canjear_response.dto';

/**
 * Servicio para gestionar los usuarios del sistema
 */
@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly donacionService: DonacionService,
    private readonly beneficioService: BeneficioService,
    private readonly usuarioBeneficioService: UsuarioBeneficioService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Busca un usuario por su correo electrónico
   *
   * @param email - Correo electrónico del usuario
   * @returns Usuario encontrado o null
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      relations: [
        'contacto',
        'direccion',
        'empresaUsuario',
        'organizacionUsuario',
      ],
      where: { contacto: { correo: email } },
    });
  }

  /**
   * Crea un nuevo usuario en el sistema
   *
   * @param createDto - Datos de creación del usuario
   * @returns Usuario creado
   *
   * @throws {ErrorManager} Si el usuario ya existe
   */
  async create(createDto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    try {
      const existente = await this.usuarioRepository.findOne({
        relations: ['contacto', 'direccion'],
        where: { documento: createDto.documento },
      });

      if (existente) {
        throw new ErrorManager({
          type: 'CONFLICT',
          message: 'Ya existe este Usuario',
        });
      }

      const { correo, ...dto } = createDto;

      this.logger.log(`CORREO: ${correo}`);

      const usuario = this.usuarioRepository.create({
        ...dto,
        contacto: {
          correo: correo,
        },
        direccion: {},
        puntos: 0,
      });

      const saved = await this.usuarioRepository.save(usuario);
      this.logger.log(`Usuario creado con ID ${saved.id}`);

      return this.mapToResponseDto(saved);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  // ================ Panel Usuario ===================

  /**
   * Obtiene las donaciones de un usuario (paginado)
   *
   * @param usuarioId - ID del usuario
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @returns Donaciones paginadas del usuario
   */
  async getDonaciones(
    usuarioId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedUserDonationsResponseDto> {
    return this.donacionService.findAllPaginatedByUser(usuarioId, page, limit);
  }

  /**
   * Realiza una donación
   *
   * @param usuarioId - ID del usuario
   * @param dto - Datos de la donación
   * @returns Donación creada
   */
  async donar(
    usuarioId: number,
    dto: CreateDonationDto,
  ): Promise<ResponseDonationDto> {
    return this.donacionService.create(usuarioId, dto);
  }

  /**
   * Obtiene los cupones canjeados por el usuario
   *
   * @param usuarioId - ID del usuario
   * @returns Lista de cupones canjeados
   */
  async getMisCuponesCanjeados(usuarioId: number): Promise<UsuarioBeneficio[]> {
    return this.usuarioBeneficioService.getByUsuario(usuarioId);
  }

  /**
   * Marca un cupón como usado
   *
   * @param usuarioBeneficioId - ID del registro UsuarioBeneficio
   * @returns Cupón actualizado
   */
  async usarCupon(usuarioBeneficioId: number): Promise<UsuarioBeneficio> {
    return this.usuarioBeneficioService.usarBeneficio(usuarioBeneficioId);
  }

  /**
   * Canjea un cupón por puntos
   *
   * @param usuarioId - ID del usuario
   * @param cuponId - ID del cupón
   * @param cantidad - Cantidad a canjear
   * @returns Resultado del canje
   */
  async canjearCupon(
    usuarioId: number,
    cuponId: number,
    cantidad: number,
  ): Promise<CanjearResponseDto> {
    return this.beneficioService.canjear(cuponId, usuarioId, cantidad);
  }

  /**
   * Actualiza las credenciales del usuario (email y/o contraseña)
   *
   * @param id - ID del usuario
   * @param dto - Datos de actualización
   * @returns Nuevo token JWT
   *
   * @throws {ErrorManager} Si el usuario no existe
   * @throws {ErrorManager} Si la contraseña actual es incorrecta
   */
  async updateCredenciales(
    id: number,
    dto: UpdateCredencialesDto,
  ): Promise<{ token: string }> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        relations: ['contacto', 'empresaUsuario', 'organizacionUsuario'],
        where: { id },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      }

      if (dto.passwordNueva) {
        if (!dto.passwordActual) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debés ingresar la contraseña actual',
          });
        }

        const coincide = await this.hashService.compare(
          dto.passwordActual,
          usuario.clave,
        );

        if (!coincide) {
          throw new ErrorManager({
            type: 'UNAUTHORIZED',
            message: 'La contraseña actual es incorrecta',
          });
        }

        usuario.clave = await this.hashService.hash(dto.passwordNueva);
      }

      if (dto.correo) {
        usuario.contacto.correo = dto.correo;
      }

      const updated = await this.usuarioRepository.save(usuario);

      let gestion: GestionTipo | null = null;
      let gestionId: number | null = null;

      if (updated.empresaUsuario) {
        gestion = GestionTipo.EMPRESA;
        gestionId = updated.empresaUsuario.id;
      } else if (updated.organizacionUsuario) {
        gestion = GestionTipo.ORGANIZACION;
        gestionId = updated.organizacionUsuario.id;
      }

      const payload = {
        sub: updated.id,
        email: updated.contacto.correo,
        rol: updated.rol,
        gestion,
        gestionId,
      };

      const newToken = this.jwtService.sign(payload);

      return { token: newToken };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Actualiza los datos personales del usuario
   *
   * @param id - ID del usuario
   * @param dto - Datos a actualizar
   * @returns Usuario actualizado
   *
   * @throws {ErrorManager} Si el usuario no existe
   */
  async updateUsuario(
    id: number,
    dto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        relations: ['contacto', 'direccion'],
        where: { id },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Usuario con ID ${id} no encontrado`,
        });
      }

      this.usuarioRepository.merge(usuario, dto);

      Object.assign(usuario.contacto ?? {}, dto.contacto);
      Object.assign(usuario.direccion ?? {}, dto.direccion);

      await this.usuarioRepository.save(usuario);

      return this.mapToResponseDto(usuario);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Actualiza los puntos del usuario
   *
   * @param id - ID del usuario
   * @param updateDto - Nuevos puntos
   * @returns Usuario actualizado
   *
   * @throws {ErrorManager} Si el usuario no existe
   */
  async updatePuntos(
    id: number,
    updateDto: UpdatePuntosDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Usuario con ID ${id} no encontrado`,
        });
      }

      Object.assign(usuario, updateDto);

      const updated = await this.usuarioRepository.save(usuario);
      this.logger.log(`Usuario ${id} actualizado`);

      return this.mapToResponseDto(updated);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Actualiza la fecha de última conexión del usuario
   *
   * @param id - ID del usuario
   */
  async actualizarUltimaConexion(id: number): Promise<void> {
    await this.usuarioRepository.update(id, {
      ultima_conexion: new Date(),
    });
  }

  /**
   * Obtiene los puntos del usuario
   *
   * @param id - ID del usuario
   * @returns ID y puntos del usuario
   *
   * @throws {ErrorManager} Si el usuario no existe
   */
  async getPoints(id: number): Promise<{ id: number; puntos: number }> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
        select: ['id', 'puntos'],
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Usuario con ID ${id} no encontrado`,
        });
      }

      return { id: usuario.id, puntos: usuario.puntos ?? 0 };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  // ================ Panel Admin ================

  /**
   * Obtiene usuarios de forma paginada (para administrador)
   *
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @param search - Búsqueda por nombre, apellido, email o documento
   * @returns Usuarios paginados
   */
  async findPaginated(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: ResponseUsuarioDto[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      let whereConditions:
        | FindOptionsWhere<Usuario>
        | FindOptionsWhere<Usuario>[] = {};

      if (search) {
        whereConditions = [
          { nombre: Like(`%${search}%`) },
          { apellido: Like(`%${search}%`) },
          { contacto: { correo: Like(`%${search}%`) } },
          { documento: Like(`%${search}%`) },
        ];
      }

      const [usuarios, total] = await this.usuarioRepository.findAndCount({
        where: whereConditions,
        relations: ['contacto'],
        skip,
        take: limit,
        order: {
          id: 'ASC',
        },
      });

      return {
        items: usuarios.map((usuario) => this.mapToResponseDto(usuario)),
        total,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Obtiene un usuario por su ID
   *
   * @param id - ID del usuario
   * @returns Usuario encontrado
   *
   * @throws {ErrorManager} Si el usuario no existe
   */
  async findOne(id: number): Promise<ResponseUsuarioDto> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        relations: [
          'contacto',
          'direccion',
          'empresaUsuario',
          'empresaUsuario.empresa',
          'organizacionUsuario',
          'organizacionUsuario.organizacion',
        ],
        where: { id },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Usuario con ID ${id} no encontrado`,
        });
      }

      return this.mapToResponseDto(usuario);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Deshabilita un usuario (soft delete)
   *
   * @param id - ID del usuario
   *
   * @throws {ErrorManager} Si el usuario no existe
   */
  async delete(id: number): Promise<void> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Usuario con ID ${id} no encontrado`,
        });
      }

      await this.usuarioRepository.update(id, { habilitado: false });
      this.logger.log(`Usuario ${id} deshabilitado`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Restaura un usuario deshabilitado
   *
   * @param id - ID del usuario
   *
   * @throws {ErrorManager} Si el usuario no existe
   */
  async restore(id: number): Promise<void> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: `Usuario con ID ${id} no encontrado`,
        });
      }

      await this.usuarioRepository.update(id, { habilitado: true });
      this.logger.log(`Usuario ${id} restaurado`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  /**
   * Mapea una entidad Usuario a ResponseUsuarioDto
   *
   * @param usuario - Entidad Usuario
   * @returns DTO de respuesta para usuario
   */
  private mapToResponseDto(usuario: Usuario): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();

    dto.id = usuario.id;
    dto.documento = usuario.documento;
    dto.nombre = usuario.nombre;
    dto.apellido = usuario.apellido;
    dto.rol = usuario.rol;
    dto.puntos = usuario.puntos;

    dto.contacto = usuario.contacto;
    dto.direccion = usuario.direccion;

    dto.habilitado = usuario.habilitado;
    dto.verificado = usuario.verificado;
    dto.fecha_registro = usuario.fecha_registro;
    dto.ultimo_cambio = usuario.ultimo_cambio;
    dto.ultima_conexion = usuario.ultima_conexion;
    dto.empresaUsuario = usuario.empresaUsuario;
    dto.organizacionUsuario = usuario.organizacionUsuario;
    return dto;
  }

  /**
   * Busca un usuario por token de recuperación de contraseña
   *
   * @param token - Token de recuperación
   * @returns Usuario encontrado o null
   */
  async findByResetToken(token: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
  }

  /**
   * Establece el token de recuperación de contraseña
   *
   * @param id - ID del usuario
   * @param token - Token de recuperación
   * @param expires - Fecha de expiración
   */
  async setResetToken(id: number, token: string, expires: Date): Promise<void> {
    await this.usuarioRepository.update(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  /**
   * Resetea la contraseña del usuario
   *
   * @param id - ID del usuario
   * @param newHashedPassword - Nueva contraseña hasheada
   */
  async resetPassword(id: number, newHashedPassword: string): Promise<void> {
    await this.usuarioRepository.update(id, {
      clave: newHashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }
}
