import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  RegisterUserDto,
  RegisterUsuarioDto,
  RegisterEmpresaDto,
  RegisterOrganizacionDto,
} from './dtos/dtos';

@ApiTags('auth') // Agrupa endpoints en Swagger UI bajo "auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== ENDPOINT PRINCIPAL ====================
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // 201 Created
  @ApiOperation({
    summary: 'Registrar cualquier tipo de usuario',
    description: `
      Registra un usuario según su tipo (usuario, empresa u organización).
      El sistema crea automáticamente:
      1. Un registro en la tabla 'users' con datos comunes
      2. Un registro en la tabla específica correspondiente
      3. Relación 1:1 entre ambas tablas
    `,
  })
  @ApiBody({
    type: RegisterUserDto,
    examples: {
      usuario: {
        summary: 'Registro de usuario individual',
        value: {
          tipo: 'usuario',
          datos: {
            correo: 'juan@email.com',
            clave: 'Password123',
            nombre: 'Juan',
            apellido: 'Pérez',
            documento: '30123456',
            calle: 'Av. Siempre Viva',
            numero: '742',
            ciudad: 'Buenos Aires',
            telefono: '+54 11 1234-5678',
          },
        },
      },
      empresa: {
        summary: 'Registro de empresa',
        value: {
          tipo: 'empresa',
          datos: {
            correo: 'empresa@corp.com',
            clave: 'SecurePass456',
            cuit: '30-12345678-1',
            razon_social: 'Mi Empresa S.A.',
            nombre_empresa: 'Supermercados Unidos',
            descripcion: 'Empresa dedicada a...',
            rubro: 'Supermercado',
            web: 'www.miempresa.com',
            calle: 'Calle Principal 123',
            ciudad: 'Córdoba',
            telefono: '+54 351 555-1234',
          },
        },
      },
      organizacion: {
        summary: 'Registro de organización',
        value: {
          tipo: 'organizacion',
          datos: {
            correo: 'ong@solidaria.org',
            clave: 'ONGpass789',
            cuit: '30-87654321-9',
            razon_social: 'Fundación Ayuda Solidaria',
            nombre_organizacion: 'Ayuda Solidaria',
            descripcion: 'ONG sin fines de lucro...',
            web: 'www.ayudasolidaria.org',
            mision: 'Ayudar a comunidades vulnerables',
            vision: 'Un mundo más justo',
            calle: 'Av. Solidaridad 456',
            ciudad: 'Mendoza',
            telefono: '+54 261 444-5678',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          usuario_id: 1,
          user_id: 1,
          tipo: 'usuario',
          correo: 'juan@email.com',
          nombre: 'Juan',
          apellido: 'Pérez',
          fecha_registro: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'correo debe ser un email válido',
          'clave debe tener al menos 8 caracteres',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflicto de datos únicos',
    schema: {
      example: {
        statusCode: 409,
        message: 'El correo juan@email.com ya está registrado',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor',
  })
  async register(@Body() registerDto: RegisterUserDto) {
    return await this.authService.register(registerDto);
  }

  @Post('register/usuario')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar usuario individual',
    description: 'Endpoint específico para registro de usuarios individuales',
  })
  @ApiBody({ type: RegisterUsuarioDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario individual registrado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de usuario inválidos',
  })
  async registerUsuario(@Body() dto: RegisterUsuarioDto) {
    return await this.authService.register({
      tipo: 'usuario',
      datos: dto,
    });
  }

  @Post('register/empresa')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar empresa',
    description: 'Endpoint específico para registro de empresas',
  })
  @ApiBody({ type: RegisterEmpresaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Empresa registrada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de empresa inválidos',
  })
  async registerEmpresa(@Body() dto: RegisterEmpresaDto) {
    return await this.authService.register({
      tipo: 'empresa',
      datos: dto,
    });
  }

  @Post('register/organizacion')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar organización',
    description: 'Endpoint específico para registro de organizaciones',
  })
  @ApiBody({ type: RegisterOrganizacionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organización registrada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de organización inválidos',
  })
  async registerOrganizacion(@Body() dto: RegisterOrganizacionDto) {
    return await this.authService.register({
      tipo: 'organizacion',
      datos: dto,
    });
  }
}
