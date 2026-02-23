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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { PerfilUsuarioService } from './usuario.service';

import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { UpdateCredencialesDto } from './dto/panelUsuario.dto';
import { CreateDonationDto } from '../donation/dto/create_donation.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';

import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';

import { Roles } from '../auth/decoradores/roles.decorador';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolCuenta } from '../../Entities/cuenta.entity';

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
 * - Actualizar credenciales (correo / contraseña)
 * -----------------------------------------------------------------------------
 */

@ApiTags('Usuarios')
@Controller('users')
export class UsuarioController {
  constructor(private readonly userService: PerfilUsuarioService) {}

  // Panel de Usuario

  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener mi perfil completo' })
  async getMiPerfil(
    @Req() req: RequestConUsuario,
  ): Promise<ResponseUsuarioDto> {
    return this.userService.findOne(req.user.perfil.id);
  }

  @Patch('perfil')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar mis datos personales' })
  async updateMiPerfil(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return await this.userService.updateUsuario(req.user.perfil.id, dto);
  }

  @Patch('credenciales')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar mi email y/o contraseña' })
  async updateMisCredenciales(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateCredencialesDto,
  ) {
    return this.userService.updateCredenciales(req.user.cuenta.id, dto);
  }

  @Get('puntos')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener mis puntos' })
  async getMisPuntos(@Req() req: RequestConUsuario) {
    return this.userService.getPoints(req.user.perfil.id);
  }

  @Get('donaciones')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener mis donaciones' })
  async getMisDonaciones(
    @Req() req: RequestConUsuario,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.userService.getDonaciones(req.user.perfil.id, page, limit);
  }

  @Post('donaciones')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Realizar una donación' })
  async donar(@Req() req: RequestConUsuario, @Body() dto: CreateDonationDto) {
    return this.userService.donar(req.user.perfil.id, dto);
  }

  @Get('cupones')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener mis cupones disponibles' })
  async getMisCupones(@Req() req: RequestConUsuario) {
    return this.userService.getCupones(req.user.perfil.id);
  }

  @Post('cupones/:cuponId/canjear')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Canjear un cupón' })
  async canjearCupon(
    @Req() req: RequestConUsuario,
    @Param('cuponId', ParseIntPipe) cuponId: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
  ) {
    return this.userService.canjearCupon(req.user.perfil.id, cuponId, cantidad); // beneficioService
  }

  // Panel Admin

  @Get('users/admin/list')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @Get('users/:id/admin/')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Obtener cualquier usuario por ID (admin)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get(':id/donaciones')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Obtener donaciones de un usuario (admin)' })
  async getDonacionesDeUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.userService.getDonaciones(id, page, limit); // donacionService
  }

  @Get(':id/cupones')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Obtener cupones de un usuario (admin)' })
  async getCuponesDeUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getCupones(id);
  }

  @Delete(':id')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Deshabilitar usuario (admin)' })
  async deleteUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }

  @Patch(':id/restaurar')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Restaurar usuario deshabilitado (admin)' })
  async restoreUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.userService.restore(id);
  }
}
