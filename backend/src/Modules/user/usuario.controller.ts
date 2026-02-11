import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { UpdateCredentialsDto } from './dto/panelUsuario.dto';

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
  constructor(private readonly userService: UsuarioService) {}

  /**
   * ---------------------------------------------------------------------------
   * GET /users
   * Listar todos los usuarios activos (no deshabilitados)
   * ---------------------------------------------------------------------------
   */
  @Get()
  @ApiOperation({ summary: 'Listar usuarios activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios activos',
    type: ResponseUsuarioDto,
    isArray: true,
  })
  findAll(): Promise<ResponseUsuarioDto[]> {
    return this.userService.findAll();
  }

  /**
   * ---------------------------------------------------------------------------
   * GET /users/list/paginated
   * Listado paginado para panel administrativo
   * ---------------------------------------------------------------------------
   */
  @Get('list/paginated')
  @ApiOperation({ summary: 'Listar usuarios paginados (admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'juan' })
  findPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.userService.findPaginated(
      Number(page),
      Number(limit),
      search,
    );
  }

  /**
   * ---------------------------------------------------------------------------
   * GET /users/:id
   * Obtener usuario por ID
   * ---------------------------------------------------------------------------
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: ResponseUsuarioDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseUsuarioDto> {
    return this.userService.findOne(id);
  }

  /**
   * ---------------------------------------------------------------------------
   * GET /users/:id/points
   * Obtener puntos del usuario
   * ---------------------------------------------------------------------------
   */
  @Get(':id/points')
  @ApiOperation({ summary: 'Obtener puntos del usuario' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el ID y la cantidad de puntos',
    schema: {
      example: {
        id: 1,
        puntos: 150,
      },
    },
  })
  getPoints(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getPoints(id);
  }

  /**
   * ---------------------------------------------------------------------------
   * POST /users
   * Crear un nuevo usuario
   * ---------------------------------------------------------------------------
   */
  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente',
    type: ResponseUsuarioDto,
  })
  @UseInterceptors(FileInterceptor('file')) // Preparado para futura subida de imagen
  create(
    @Body() createDto: CreateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.userService.create(createDto);
  }

  /**
   * ---------------------------------------------------------------------------
   * PUT /users/:id
   * Actualizar datos generales del usuario
   * ---------------------------------------------------------------------------
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.userService.update(id, updateDto);
  }

  /**
   * ---------------------------------------------------------------------------
   * DELETE /users/:id
   * Deshabilitar usuario (borrado lógico)
   * ---------------------------------------------------------------------------
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Deshabilitar un usuario' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.delete(id);
  }

  /**
   * ---------------------------------------------------------------------------
   * PATCH /users/:id/restaurar
   * Restaurar usuario deshabilitado
   * ---------------------------------------------------------------------------
   */
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar un usuario deshabilitado' })
  restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.restore(id);
  }

  /**
   * ---------------------------------------------------------------------------
   * PATCH /users/:id/credenciales
   * Actualizar correo y/o contraseña.
   * Devuelve nuevo JWT si se modifican datos sensibles.
   * ---------------------------------------------------------------------------
   */
  @Patch(':id/credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña del usuario',
  })
  updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return this.userService.updateCredentials(id, dto);
  }
}
