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

import { UsuarioService } from './usuario.service';

import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { CreateDonationDto } from '../donation/dto/create_donation.dto';

import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';

import { Rol } from '../../Entities/usuario.entity';
import { Auth } from '../auth/decoradores/auth.decorador';
import { UpdateCredencialesDto } from './dto/panelUsuario.dto';

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
  constructor(private readonly userService: UsuarioService) {}

  // Panel de Usuario

  @Auth(Rol.USUARIO, Rol.ADMIN)
  @Get('perfil')
  @ApiOperation({ summary: 'Obtener mi perfil completo' })
  async getMiPerfil(@Req() req: RequestConUsuario) {
    return this.userService.findOne(req.user.id);
  }

  @Auth(Rol.USUARIO, Rol.ADMIN)
  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar mis datos personales' })
  async updateMiPerfil(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return await this.userService.updateUsuario(req.user.id, dto);
  }

  @Patch('credenciales')
  @Auth(Rol.USUARIO)
  @ApiOperation({ summary: 'Actualizar mi email y/o contraseña' })
  async updateMisCredenciales(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateCredencialesDto,
  ) {
    return this.userService.updateCredenciales(req.user.id, dto);
  }

  @Auth(Rol.USUARIO)
  @Get('puntos')
  @ApiOperation({ summary: 'Obtener mis puntos' })
  async getMisPuntos(@Req() req: RequestConUsuario) {
    return this.userService.getPoints(req.user.id);
  }

  @Auth(Rol.USUARIO)
  @Get('donaciones')
  @ApiOperation({ summary: 'Obtener mis donaciones' })
  async getMisDonaciones(
    @Req() req: RequestConUsuario,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.userService.getDonaciones(req.user.id, page, limit);
  }

  @Auth(Rol.USUARIO)
  @Post('donaciones')
  @ApiOperation({ summary: 'Realizar una donación' })
  async donar(@Req() req: RequestConUsuario, @Body() dto: CreateDonationDto) {
    return this.userService.donar(req.user.id, dto);
  }

  @Auth(Rol.USUARIO)
  @Get('cupones')
  @ApiOperation({ summary: 'Obtener mis cupones canjeados' })
  async getMisCuponesCanjeados(@Req() req: RequestConUsuario) {
    return this.userService.getMisCuponesCanjeados(req.user.id);
  }

  @Auth(Rol.USUARIO)
  @Post('cupones/:id/')
  @ApiOperation({ summary: 'Usar un cupón canjeado' })
  async usarCupon(@Param('id', ParseIntPipe) id: number) {
    return this.userService.usarCupon(id);
  }

  @Auth(Rol.USUARIO)
  @Post('cupones/:cuponId/canjear')
  @ApiOperation({ summary: 'Canjear un cupón' })
  async canjearCupon(
    @Req() req: RequestConUsuario,
    @Param('cuponId', ParseIntPipe) cuponId: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
  ) {
    return this.userService.canjearCupon(req.user.id, cuponId, cantidad);
  }

  // Panel Admin

  @Auth(Rol.ADMIN)
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

  @Auth(Rol.ADMIN)
  @Get(':id/donaciones')
  @ApiOperation({ summary: 'Obtener donaciones de un usuario (admin)' })
  async getDonacionesDeUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.userService.getDonaciones(id, page, limit); // donacionService
  }

  @Auth(Rol.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Deshabilitar usuario (admin)' })
  async deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }

  @Auth(Rol.ADMIN)
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar usuario deshabilitado (admin)' })
  async restoreUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.restore(id);
  }
}
