import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from './decoradores/auth.decorador';

/**
 * Controlador para gestionar las operaciones de de Autenticación.
 * Proporciona endpoints para el inicio de sesión y el registro de usuarios.
 */
@ApiTags('Autorización')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({
    description: 'Datos necesarios para registrar un nuevo usuario',
    type: RegisterDto,
  })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para el registro' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiBody({
    description: 'Credenciales necesarias para iniciar sesión',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso, devuelve token de acceso',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.authService.resetPassword(token, newPassword);
  }
}
