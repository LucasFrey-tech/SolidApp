import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { PerfilOrganizacionService } from './organizacion.service';
import { UpdateOrganizacionDto } from './dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from './dto/response_organizacion.dto';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { ResponseOrganizationPaginatedDto } from './dto/response_organizacion_paginated.dto';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { AuthGuard } from '@nestjs/passport';
import { RolCuenta } from '../../Entities/cuenta.entity';
import { Roles } from '../auth/decoradores/roles.decorador';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Controlador encargado de gestionar las operaciones HTTP
 * relacionadas con las organizaciones.
 *
 * Permite:
 * - Crear organizaciones
 * - Listar organizaciones (simples y paginadas)
 * - Obtener organización por ID
 * - Actualizar datos
 * - Deshabilitar (soft delete)
 * - Restaurar organizaciones
 * - Actualizar credenciales
 *
 * Base path: /organizations
 */
@ApiTags('Organizaciones')
@Controller('organizaciones')
export class OrganizacionesController {
  constructor(
    private readonly organizacionService: PerfilOrganizacionService,
  ) {}

  // ================= PanelOrganizacion ===================

  /**
   * Obtiene una organización específica por su ID.
   *
   * @param id ID numérico de la organización
   * @returns Organización encontrada
   * @throws NotFoundException si no existe
   */
  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 200,
    description: 'Organización encontrada',
    type: ResponseOrganizacionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  getMiPerfil(@Req() req: RequestConUsuario): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.findOne(req.user.perfil.id);
  }

  /**
   * Actualiza los datos de una organización existente.
   *
   * @param id ID de la organización
   * @param updateDto Datos a modificar
   * @returns Organización actualizada
   */
  @Patch('perfil')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar una organización' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiBody({ type: UpdateOrganizacionDto })
  @ApiResponse({
    status: 200,
    description: 'Organización actualizada correctamente',
    type: ResponseOrganizacionDto,
  })
  updateMiPerfil(
    @Req() req: RequestConUsuario,
    @Body() updateDto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    console.log('Datos que llegan al controller: ', updateDto);
    return this.organizacionService.update(req.user.perfil.id, updateDto);
  }

  /**
   * Permite actualizar el correo y/o contraseña
   * de la organización.
   *
   * @param id ID de la organización
   * @param dto Datos de actualización de credenciales
   * @returns Usuario actualizado + nuevo token JWT
   */
  @Patch(':id/credenciales')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la organización',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiBody({ type: UpdateCredencialesDto })
  @ApiResponse({
    status: 200,
    description: 'Credenciales actualizadas correctamente',
  })
  async updateMisCredenciales(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateCredencialesDto,
  ) {
    return await this.organizacionService.updateCredenciales(
      req.user.cuenta.id,
      dto,
    );
  }

  // ====== Panel Admin ======

  /**
   * Obtiene el listado completo de organizaciones activas.
   *
   * @returns Lista de organizaciones en formato ResponseOrganizationDto[]
   */
  @Get()
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Listar organizaciones activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de organizaciones',
    type: ResponseOrganizacionDto,
    isArray: true,
  })
  findAll(): Promise<ResponseOrganizacionDto[]> {
    return this.organizacionService.findAll();
  }

  /**
   * Lista organizaciones de forma paginada.
   *
   * @param page Número de página (default: 1)
   * @param limit Cantidad de registros por página (default: 10)
   * @param search Texto opcional para búsqueda por razón social o nombre fantasía
   *
   * @returns Objeto con items y total de registros
   */
  @Get('list')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Listar organizaciones paginadas' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de organizaciones',
    type: ResponseOrganizationPaginatedDto,
  })
  async findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ): Promise<ResponseOrganizationPaginatedDto> {
    return await this.organizacionService.findPaginated(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get(':id')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Obtener organización por ID (admin)' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Actualizar organización (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.update(id, dto);
  }

  /**
   * Deshabilita una organización (soft delete).
   *
   * @param id ID de la organización
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deshabilitar una organización' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 204,
    description: 'Organización deshabilitada correctamente',
  })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.organizacionService.delete(id);
  }

  /**
   * Restaura una organización previamente deshabilitada.
   *
   * @param id ID de la organización
   */
  @Patch(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restaurar una organización deshabilitada' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 204,
    description: 'Organización restaurada correctamente',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.organizacionService.restore(id);
  }
}
