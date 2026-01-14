import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UsuarioService } from '../user/usuario.service';
import { LoginRequestBody, RegisterRequestBody } from './dto/auth.dto';
import { Usuario } from '../../Entities/usuario.entity';
import { ResponseUsuarioDto } from '../user/dto/response_usuario.dto';

/**
 * Servicio que maneja la lógica de negocio para el Sistema de Autenticación
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param {RegisterRequestBody} requestBody - Datos de registro del usuario
   * @returns {Promise<ResponseUsuarioDto>} Promesa que resuelve con los datos del usuario creado (sin contraseña)
   * @throws {BadRequestException} En estos casos:
   * - Si el email y nombre de usuario ya existen
   * - Si el email ya está registrado
   * - Si el nombre de usuario ya existe
   */
  // REGISTRO
  async register(requestBody: RegisterRequestBody): Promise<ResponseUsuarioDto> {
    // Verificar si ya existe el usuario por email
    const existingUserEmail = await this.usersService.findByEmail(
      requestBody.correo,
    );

    if (existingUserEmail) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(requestBody.clave, 10);

    // Crear usuario con contraseña hasheada
    const user = await this.usersService.create({
      ...requestBody,
      clave: hashedPassword,
    });

    this.logger.log('Usuario Creado');
    return user;
  }

  /**
   * Autentica a un usuario y genera un token JWT
   *
   * @param {LoginRequestBody} requestBody - Objeto que contiene las credenciales del usuario
   * @returns - Un objeto con el token de acceso.
   * @throws {UnauthorizedException} Si las credenciales son incorrectas
   * @throws {ForbiddenException} Si el usuario está desabilidato
   */

  // LOGIN
  async login(requestBody: LoginRequestBody) {
    // Validamos el usuario y la contraseña
    const user = await this.validateUser(requestBody.correo, requestBody.clave);

    if (user.deshabilitado) {
      throw new ForbiddenException(
        'Usuario bloqueado. Contacta al administrador.',
      );
    }

    // Creamos el payload del JWT (puedes agregar más info si querés)
    const payload = {
      email: user.correo,
      sub: user.id,
      rol: user.rol,
    }; //agregamos el username al payload para usarlo en el login

    // Firmamos el token
    const access_token = this.jwtService.sign(payload);

    // Devolvemos el token
    this.logger.log('Usuario logueado');
    return { access_token };
  }

  async validateUser(email: string, pass: string): Promise<Usuario> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(pass, user.clave);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }
}
