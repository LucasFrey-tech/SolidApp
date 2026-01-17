// /backend/src/auth/auth.service.ts
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioService } from '../user/usuario.service';
import { EmpresasService } from '../empresa/empresa.service'; // ← Cambiado a EmpresasService
import { OrganizationsService } from '../organization/organization.service'; // ← Cambiado a OrganizationsService
import {
  LoginRequestBody,
  RegisterUsuarioDto,
  RegisterEmpresaDto,
  RegisterOrganizacionDto,
} from './dto/auth.dto';
import { Usuario } from '../../Entities/usuario.entity';
import { Empresa } from '../../Entities/empresa.entity';
import { Organizations } from '../../Entities/organizations.entity'; // ← Cambiado a organizations.entity

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsuarioService,
    private readonly empresasService: EmpresasService, // ← Cambiado
    private readonly organizationsService: OrganizationsService, // ← Cambiado
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Organizations)
    private readonly organizacionRepository: Repository<Organizations>,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('AuthService inicializado');
  }

  async registerUsuario(dto: RegisterUsuarioDto) {
    this.logger.log('Registrando usuario tipo: Usuario');

    // Verificar si ya existe el email
    try {
      const existingUser = await this.usersService.findByEmail(dto.correo);
      if (existingUser) {
        throw new BadRequestException('El correo ya está registrado');
      }
    } catch (error) {
      // Si no encuentra usuario (NotFoundException), continuar
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Ignorar NotFoundException
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.clave, 10);

    // Crear usuario
    const user = await this.usersService.create({
      correo: dto.correo,
      clave: hashedPassword,
      nombre: dto.nombre,
      apellido: dto.apellido,
      rol: 'usuario',
      imagen: dto.imagen || '',
      direccion: dto.direccion || '',
    });

    this.logger.log(`Usuario creado con ID ${user.id}`);
    return user;
  }

  async registerEmpresa(dto: RegisterEmpresaDto) {
    this.logger.log('Registrando usuario tipo: Empresa');

    // 1. Verificar si ya existe el email en usuarios
    try {
      const existingUser = await this.usersService.findByEmail(dto.correo);
      if (existingUser) {
        throw new BadRequestException('El correo ya está registrado');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.clave, 10);

    // 3. Crear empresa
    const empresa = await this.empresasService.create({
      nroDocumento: dto.documento,
      razon_social: dto.razonSocial,
      nombre_fantasia: dto.nombreFantasia,
      descripcion: 'Empresa registrada recientemente',
      rubro: 'General',
      telefono: dto.telefono,
      direccion: dto.direccion,
      web: dto.web || '',
      verificada: false,
      correo: dto.correo,
      clave: hashedPassword,
    });

    return {
      usuario: dto.correo,
      empresa: empresa,
      message: 'Empresa registrada exitosamente',
    };
  }

  async registerOrganizacion(dto: RegisterOrganizacionDto) {
    this.logger.log('Registrando usuario tipo: Organización');

    // 1. Verificar si ya existe el email
    try {
      const existingUser = await this.usersService.findByEmail(dto.correo);
      if (existingUser) {
        throw new BadRequestException('El correo ya está registrado');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.clave, 10);

    // 4. Crear organización
    const organizacion = await this.organizationsService.create({
      nroDocumento: dto.documento,
      razonSocial: dto.razonSocial,
      nombreFantasia: dto.nombre,
      descripcion: 'Organización registrada recientemente',
      telefono: '',
      web: '',
      correo: dto.correo,
      clave: hashedPassword,
    });

    this.logger.log(
      `Organización creada con ID ${organizacion.id}, usuario ${dto.correo}`,
    );

    return {
      usuario: dto.correo,
      organizacion: organizacion,
      message: 'Organización registrada exitosamente',
    };
  }

  /** * Login de Usuario */
  async loginUsuario(requestBody: LoginRequestBody) {
    const user = await this.validateUser(requestBody.correo, requestBody.clave);
    if (user.rol !== 'usuario') {
      throw new UnauthorizedException('El correo no corresponde a un usuario');
    }
    if (user.deshabilitado) {
      throw new ForbiddenException(
        'Usuario bloqueado. Contacta al administrador.',
      );
    }
    const payload = { email: user.correo, sub: user.id, rol: user.rol };
    const token = this.jwtService.sign(payload);
    this.logger.log(`Usuario logueado con ID ${user.id}`);
    return { token };
  }

  /** * Login de Empresa */
  async loginEmpresa(requestBody: LoginRequestBody) {
    const user = await this.validateUser(requestBody.correo, requestBody.clave);
    if (user.rol !== 'empresa') {
      throw new UnauthorizedException('El correo no corresponde a una empresa');
    }
    if (user.deshabilitado) {
      throw new ForbiddenException(
        'Usuario bloqueado. Contacta al administrador.',
      );
    }
    const payload = { email: user.correo, sub: user.id, rol: user.rol };
    const token = this.jwtService.sign(payload);
    this.logger.log(`Empresa logueada con ID ${user.id}`);
    return { token };
  }

  /** * Login de Organización */ async loginOrganizacion(
    requestBody: LoginRequestBody,
  ) {
    const user = await this.validateUser(requestBody.correo, requestBody.clave);
    if (user.rol !== 'organizacion') {
      throw new UnauthorizedException(
        'El correo no corresponde a una organización',
      );
    }
    if (user.deshabilitado) {
      throw new ForbiddenException(
        'Usuario bloqueado. Contacta al administrador.',
      );
    }
    const payload = { email: user.correo, sub: user.id, rol: user.rol };
    const token = this.jwtService.sign(payload);
    this.logger.log(`Organización logueada con ID ${user.id}`);
    return { token };
  }

  async validateUser(email: string, pass: string): Promise<Usuario> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(pass, user.clave);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    return user;
  }
}
