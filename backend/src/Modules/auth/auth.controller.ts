// /backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import {
  LoginRequestBody,
  RegisterEmpresaDto,
  RegisterOrganizacionDto,
  RegisterUsuarioDto,
  AuthResponse,
} from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

/**
 * Controlador para gestionar las operaciones de de Autenticación.
 * Proporciona endpoints para el inicio de sesión y el registro de usuarios.
 */
@ApiTags('Autorización')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Inicio sesión de un usuario y devuelve un token de acceso.
   * 
   * @param {LoginRequestBody} data - Objeto con las credenciales del Usuario (email y contraseña).
   * @returns Un objeto con los datos del Usuario.
   */

  // Endpoint específico para login de usuario
  @Post('login/usuario')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login de Usuario' })
  @ApiBody({ type: LoginRequestBody })
  @ApiResponse({
    status: 200,
    description: 'Login de Usuario Exitoso',
    type: AuthResponse,
  })
  async loginUsuario(@Body() data: LoginRequestBody) {
    return await this.authService.loginUsuario(data);
  }

  /**
   * Inicio sesión de una Empresa y devuelve un token de acceso.
   * 
   * @param {LoginRequestBody} data - Objeto con las credenciales de la Empresa (email y contraseña).
   * @returns Un objeto con los datos de la Empresa.
  */
  // Endpoint específico para login de empresa
  @Post('login/empresa')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login de Empresa' })
  @ApiBody({ type: LoginRequestBody })
  @ApiResponse({
    status: 200,
    description: 'Login de Empresa Exitoso',
    type: AuthResponse,
  })
  async loginEmpresa(@Body() data: LoginRequestBody) {
    return await this.authService.loginEmpresa(data);
  }

  /**
   * Icicio de sesión de una Organización y devuelve un token de acceso.
   * 
   * @param {LoginRequestBody} data - Objeto con las credenciales de la Organización (email y contraseña).
   * @returns Un objeto con los datos de la Organización.
   */
  // Endpoint específico para login de organización
  @Post('login/organizacion')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login de Organización' })
  @ApiBody({ type: LoginRequestBody })
  @ApiResponse({
    status: 200,
    description: 'Login de Organización Exitoso',
    type: AuthResponse,
  })
  async loginOrganizacion(@Body() data: LoginRequestBody) {
    return await this.authService.loginOrganizacion(data);
  }

  /**
   * Registro de un nuevo Usuario en el sistema.
   * 
   * @param {RegisterUsuarioDto} data - Objeto con los datos necesarios para el registro del Usuario.
   * @returns Un objeto con los datos del Usuario registrado.
   */
  // Endpoint específico para registrar usuario
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

  /**
   * Registro de una nueva Empresa en el sistema.
   * 
   * @param {RegisterEmpresaDto} data - Objeto con los datos necesarios para el registro de la Empresa.
   * @returns Un objeto con los datos de la Empresa registrada.
   */
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

  /**
   * Registro de una nueva Organización en el sistema.
   * 
   * @param {RegisterOrganizacionDto} data - Objeto con los datos necesarios para el registro de la Organización.
   * @returns Un objeto con los datos de la Organización registrada.
   */
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
