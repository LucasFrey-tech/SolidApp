import { Body, Controller, FileTypeValidator, HttpCode, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { LoginRequestBody, RegisterRequestBody } from './dto/auth.dto';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Controlador para gestionar las operaciones de de Autenticación.
 * Proporciona endpoints para el inicio de sesión y el registro de usuarios.
 */
@ApiTags('Autorización')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicia sesión de un usuario y devuelve un token de acceso.
   *
   * @param {LoginRequestBody} LoginRequestBody - Objeto con las credenciales del usuario (email y contraseña).
   * @returns Un objeto con el token de acceso.
   */
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

  /**
   * Registra a un nuevo usuario en el sistema.
   *
   * @param {RegisterRequestBody} requestBody - Objeto con los datos necesarios para el registro del usuario.
   * @returns Un objeto con los datos del usuario registrado.
   */
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
}
