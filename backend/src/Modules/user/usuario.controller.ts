import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { PerfilUsuarioService } from './usuario.service';

import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { CreateDonationDto } from '../donation/dto/create_donation.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';

import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';

import { RolCuenta } from '../../Entities/cuenta.entity';
import { Auth } from '../auth/decoradores/auth.decorador';

/**
 * -----------------------------------------------------------------------------
 * UsuarioController
 * -----------------------------------------------------------------------------
 * Controlador encargado de exponer los endpoints HTTP relacionados
 * a la gestión de usuarios.
 *
 * Base route: /users
 *
 * Funcionalidades:
 * - Listar usuarios
 * - Obtener usuario por ID
 * - Paginación para panel admin
 * - Crear usuario
 * - Actualizar usuario
 * - Deshabilitar / Restaurar usuario
 * - Obtener puntos
 * -----------------------------------------------------------------------------
 */

@ApiTags('Usuarios')
@Controller('users')
export class UsuarioController {
  constructor(private readonly userService: PerfilUsuarioService) {}

  // Panel de Usuario

  @Auth(RolCuenta.USUARIO)
  @Get('perfil')
  @ApiOperation({ summary: 'Obtener mi perfil completo' })
  async getMiPerfil(
    @Req() req: RequestConUsuario,
  ): Promise<ResponseUsuarioDto> {
    return this.userService.findOne(req.user.perfil.id);
  }

  @Auth(RolCuenta.USUARIO)
  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar mis datos personales' })
  async updateMiPerfil(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return await this.userService.updateUsuario(req.user.perfil.id, dto);
  }

  @Auth(RolCuenta.USUARIO)
  @Get('puntos')
  @ApiOperation({ summary: 'Obtener mis puntos' })
  async getMisPuntos(@Req() req: RequestConUsuario) {
    return this.userService.getPoints(req.user.perfil.id);
  }

  @Auth(RolCuenta.USUARIO)
  @Get('donaciones')
  @ApiOperation({ summary: 'Obtener mis donaciones' })
  async getMisDonaciones(
    @Req() req: RequestConUsuario,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.userService.getDonaciones(req.user.perfil.id, page, limit);
  }

  @Auth(RolCuenta.USUARIO)
  @Post('donaciones')
  @ApiOperation({ summary: 'Realizar una donación' })
  async donar(@Req() req: RequestConUsuario, @Body() dto: CreateDonationDto) {
    console.log('📦 DTO recibido:', dto);
    console.log('👤 Usuario ID:', req.user.perfil.id);
    return this.userService.donar(req.user.perfil.id, dto);
  }

  @Auth(RolCuenta.USUARIO)
  @Get('cupones')
  @ApiOperation({ summary: 'Obtener mis cupones canjeados' })
  async getMisCuponesCanjeados(@Req() req: RequestConUsuario) {
    return this.userService.getMisCuponesCanjeados(req.user.perfil.id);
  }

  @Auth(RolCuenta.USUARIO)
  @Post('cupones/:id/')
  @ApiOperation({ summary: 'Usar un cupón canjeado' })
  async usarCupon(@Param('id', ParseIntPipe) id: number) {
    return this.userService.usarCupon(id);
  }

  @Auth(RolCuenta.USUARIO)
  @Post('cupones/:cuponId/canjear')
  @ApiOperation({ summary: 'Canjear un cupón' })
  async canjearCupon(
    @Req() req: RequestConUsuario,
    @Param('cuponId', ParseIntPipe) cuponId: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
  ) {
    return this.userService.canjearCupon(req.user.perfil.id, cuponId, cantidad);
  }

  // Panel Admin

  @Auth(RolCuenta.ADMIN)
  @Get('users/admin/list')
  @ApiOperation({ summary: 'Listar todos los usuarios (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.userService.findPaginated(page, limit, search);
  }

  @Auth(RolCuenta.ADMIN)
  @Get('users/:id/admin/')
  @ApiOperation({ summary: 'Obtener cualquier usuario por ID (admin)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Auth(RolCuenta.ADMIN)
  @Get(':id/donaciones')
  @ApiOperation({ summary: 'Obtener donaciones de un usuario (admin)' })
  async getDonacionesDeUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.userService.getDonaciones(id, page, limit); // donacionService
  }

  @Auth(RolCuenta.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Deshabilitar usuario (admin)' })
  async deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }

  @Auth(RolCuenta.ADMIN)
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar usuario deshabilitado (admin)' })
  async restoreUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.restore(id);
  }
}
