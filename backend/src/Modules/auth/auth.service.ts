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
import { EmpresasService } from '../empresa/empresa.service';
import { OrganizationsService } from '../organization/organization.service';

import {
  LoginRequestBody,
  RegisterUsuarioDto,
  RegisterEmpresaDto,
  RegisterOrganizacionDto,
} from './dto/auth.dto';

import { Usuario } from '../../Entities/usuario.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { Organizations } from '../../Entities/organizations.entity';

/**
 * Servicio que maneja la lógica de negocio para el Sistema de Autenticación
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsuarioService,
    private readonly empresasService: EmpresasService,
    private readonly organizationsService: OrganizationsService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  private async hashPassword(clave: string): Promise<string> {
    return bcrypt.hash(clave, 10);
  }

  private async verifyPassword(clave: string, hash: string): Promise<void> {
    const coincidencia = await bcrypt.compare(clave, hash);
    if (!coincidencia) throw new UnauthorizedException('Contraseña incorrecta');
  }

  private buildToken(payload: Record<string, any>): { token: string } {
    return { token: this.jwtService.sign(payload) };
  }

  private checkDeshabilitado(deshabilitado: boolean): void {
    if (deshabilitado)
      throw new ForbiddenException(
        'Usuario bloqueado. Contacto al administrador.',
      );
  }

  /**
   * Registra un nuevo Usuario en el sistema.
   *
   * @param {RegisterUsuarioDto} dto - Datos de registro del Usuario.
   * @returns Devuelve los datos del usuario creado (sin contraseña).
   * @throws {BadRequestException} En estos casos:
   * - Si el email ya esta registrado
   */
  async registerUsuario(dto: RegisterUsuarioDto) {
    this.logger.log('Registrando usuario tipo: Usuario');

    const existe = await this.usersService.findByEmail(dto.correo);

    if (existe) throw new BadRequestException('El correo ya esta registrado');

    const clave = await this.hashPassword(dto.clave);

    const user = await this.usersService.create({
      documento: dto.documento,
      correo: dto.correo,
      clave: clave,
      nombre: dto.nombre,
      apellido: dto.apellido,
      rol: 'usuario',
    });

    this.logger.log(`Usuario creado con ID ${user.id}`);
    return user;
  }

  /**
   * Registra una nueva Empresa en el sistema.
   *
   * @param {RegisterEmpresaDto} dto - Datos de registro de la Empresa.
   * @returns Devuelve los datos de la empresa creada (sin contraseña).
   * @throws {BadRequestException} En estos casos:
   * - Si el email ya esta registrado
   */
  async registerEmpresa(dto: RegisterEmpresaDto) {
    this.logger.log('Registrando usuario tipo: Empresa');

    const existe = await this.empresasService.findByEmail(dto.correo);
    if (existe) throw new BadRequestException('El correo ya está registrado');

    const clave = await this.hashPassword(dto.clave);

    const empresa = await this.empresasService.create({
      nroDocumento: dto.documento,
      razon_social: dto.razonSocial,
      nombre_fantasia: dto.nombreFantasia,
      descripcion: 'Empresa registrada recientemente',
      telefono: dto.telefono,
      direccion: dto.direccion,
      web: dto.web || '',
      rubro: '',
      verificada: false,
      correo: dto.correo,
      clave: clave,
    });

    return {
      usuario: dto.correo,
      empresa,
      message: 'Empresa registrada exitosamente',
    };
  }

  /**
   * Registra una nueva Organización en el sistema.
   *
   * @param {RegisterOrganizacionDto} dto - Datos de registro de la Organización.
   * @returns Devuelve los datos de la Organización creada (sin contraseña).
   * @throws {BadRequestException} En estos casos:
   * - Si el email ya esta registrado
   */
  async registerOrganizacion(dto: RegisterOrganizacionDto) {
    this.logger.log('Registrando usuario tipo: Organización');

    const existe = await this.organizationsService.findByEmail(dto.correo);

    if (existe) throw new BadRequestException('El correo ya esta registrado');

    const clave = await this.hashPassword(dto.clave);

    // Crear usuario con contraseña hasheada
    const organizacion = await this.organizationsService.create({
      nroDocumento: dto.documento,
      razonSocial: dto.razonSocial,
      nombreFantasia: dto.nombreFantasia,
      descripcion: 'Organización registrada recientemente',
      telefono: '',
      web: '',
      correo: dto.correo,
      clave: clave,
    });

    this.logger.log(`Organización creada con ID ${organizacion.id}`);

    return {
      usuario: dto.correo,
      organizacion,
      message: 'Organización registrada exitosamente',
    };
  }

  /**
   * Autentica a un usuario y genera un token JWT
   *
   * @param {LoginRequestBody} requestBody - Objeto que contiene las credenciales del Usuario.
   * @returns Un objeto con el tocken de acceso.
   * @throws {UnauthorizedException} Si las credenciales son incorrectas
   * @throws {ForbiddenException} Si el usuario está desabilitado
   */
  // Login Usuario
  async loginUsuario(requestBody: LoginRequestBody) {
    // Validamos el usuario y la contraseña
    const user = await this.validateUser(requestBody.correo, requestBody.clave);

    if (!['usuario', 'admin'].includes(user.rol)) {
      throw new UnauthorizedException(
        'El correo no corresponde a un usuario válido',
      );
    }

    this.checkDeshabilitado(user.deshabilitado);

    return this.buildToken({
      email: user.correo,
      sub: user.id,
      rol: user.rol,
      userType: 'usuario',
    });
  }

  /**
   * Autentica a una empresa y genera un token JWT
   *
   * @param {LoginRequestBody} requestBody - Objeto que contiene las credenciales de la Empresa.
   * @returns Un objeto con el tocken de acceso.
   * @throws {ForbiddenException} Si el usuario de la Empresa está desabilitado
   */
  // Login Empresa
  async loginEmpresa(requestBody: LoginRequestBody) {
    const user = await this.validateEmpresa(
      requestBody.correo,
      requestBody.clave,
    );

    this.checkDeshabilitado(user.deshabilitado);

    return this.buildToken({
      email: user.correo,
      sub: user.id,
      userType: 'empresa',
    });
  }

  /**
   * Autentica a una organizacion y genera un token JWT
   *
   * @param {LoginRequestBody} requestBody - Objeto que contiene las credenciales de la Organización.
   * @returns Un objeto con el tocken de acceso.
   * @throws {ForbiddenException} Si el usuario de la Organización está desabilitado
   */
  // Login Organizacion
  async loginOrganizacion(requestBody: LoginRequestBody) {
    const user = await this.validateOrganizacion(
      requestBody.correo,
      requestBody.clave,
    );

    this.checkDeshabilitado(user.deshabilitado);

    return this.buildToken({
      email: user.correo,
      sub: user.id,
      userType: 'organizacion',
    });
  }

  async validateUser(email: string, pass: string): Promise<Usuario> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(pass, user.clave);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }

  async validateEmpresa(email: string, pass: string): Promise<Empresa> {
    const empresa = await this.empresasService.findByEmail(email);
    if (!empresa) throw new UnauthorizedException('Empresa no encontrada');

    const isMatch = await bcrypt.compare(pass, empresa.clave);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    return empresa;
  }

  async validateOrganizacion(
    email: string,
    pass: string,
  ): Promise<Organizations> {
    const organizacion = await this.organizationsService.findByEmail(email);
    if (!organizacion) {
      throw new UnauthorizedException('Organización no encontrada');
    }

    const isMatch = await bcrypt.compare(pass, organizacion.clave);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    return organizacion;
  }
}
