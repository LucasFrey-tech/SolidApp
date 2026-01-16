// /backend/src/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  LoginRequestBody,
  RegisterEmpresaDto,
  RegisterOrganizacionDto,
  RegisterUsuarioDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Autorización')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(202)
  @ApiOperation({ summary: 'Iniciar Sesión' })
  @ApiBody({ type: LoginRequestBody })
  @ApiResponse({
    status: 200,
    description: 'Login Exitoso',
    type: LoginRequestBody,
  })
  async login(@Body() LoginRequestBody: LoginRequestBody) {
    return this.authService.login(LoginRequestBody);
  }

  // Endpoint específico para usuario
  @Post('register/usuario')
  @ApiOperation({ summary: 'Registro de Usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correo: { type: 'string', example: 'ejemplo@email.com' },
        clave: { type: 'string', example: 'password123' },
        nombre: { type: 'string', example: 'Juan' },
        apellido: { type: 'string', example: 'Pérez' },
      },
      required: ['correo', 'clave', 'nombre', 'apellido'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro Exitoso',
  })
  async registerUsuario(@Body() data: RegisterUsuarioDto) {
    return await this.authService.registerUsuario(data);
  }

  // Endpoint específico para empresa
  @Post('register/empresa')
  @ApiOperation({ summary: 'Registro de Empresa' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'string', example: '30-12345678-9' },
        razonSocial: { type: 'string', example: 'Empresa S.A.' },
        nombreFantasia: { type: 'string', example: 'Mi Empresa' },
        clave: { type: 'string', example: 'password123' },
        telefono: { type: 'string', example: '+54 11 1234-5678' },
        direccion: { type: 'string', example: 'Calle 123' },
        correo: { type: 'string', example: 'empresa@email.com' },
        web: {
          type: 'string',
          example: 'https://empresa.com',
        },
      },
      required: [
        'documento',
        'razonSocial',
        'nombreFantasia',
        'clave',
        'telefono',
        'direccion',
        'correo',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro Exitoso',
  })
  async registerEmpresa(@Body() data: RegisterEmpresaDto) {
    return await this.authService.registerEmpresa(data);
  }

  // Endpoint específico para organización
  @Post('register/organizacion')
  @ApiOperation({ summary: 'Registro de Organización' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documento: { type: 'string', example: '12345' },
        razonSocial: {
          type: 'string',
          example: 'Organización Sin Fines de Lucro',
        },
        nombre: { type: 'string', example: 'Mi Organización' },
        clave: { type: 'string', example: 'password123' },
        correo: { type: 'string', example: 'organizacion@email.com' },
      },
      required: ['documento', 'razonSocial', 'nombre', 'clave', 'correo'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro Exitoso',
  })
  async registerOrganizacion(@Body() data: RegisterOrganizacionDto) {
    return await this.authService.registerOrganizacion(data);
  }
}
