// /backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  //FileTypeValidator,
  HttpCode,
  //MaxFileSizeValidator,
  //ParseFilePipe,
  Post,
  //UploadedFile,
  //UseInterceptors,
} from '@nestjs/common';
import {
  LoginRequestBody,
  RegisterEmpresaDto,
  RegisterOrganizacionDto,
  RegisterUsuarioDto,
} from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  //ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
//import { FileInterceptor } from '@nestjs/platform-express';

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

// Ejemplo para subir imagenes
/**
   * Registra a un nuevo usuario en el sistema.
   *
   * @param {RegisterRequestBody} requestBody - Objeto con los datos necesarios para el registro del usuario.
   * @returns Un objeto con los datos del usuario registrado.
@Post('register')
@ApiOperation({ summary: 'Registro de Usuario' })
  @ApiParam({ name: 'requestBody', type: RegisterRequestBody })
  @ApiBody({ type: RegisterRequestBody })
  @ApiResponse({
    status: 201,
    description: 'Registro Exitoso',
    type: RegisterRequestBody,
  })
  @UseInterceptors(FileInterceptor('file'))
  async registerUser(@Body() requestBody: RegisterRequestBody, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000 }),
      new FileTypeValidator({ fileType: 'image/jpeg' }),
    ],
    errorHttpStatusCode: 415, // Unsupported Media Type
  }),) file: File) {
    console.log(file);
    return this.authService.register(requestBody);
  }
*/
