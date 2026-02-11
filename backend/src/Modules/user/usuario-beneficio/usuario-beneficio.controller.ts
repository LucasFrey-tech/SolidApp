import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UsuarioBeneficioService } from './usuario-beneficio.service';

/**
 * =============================================================================
 * UsuarioBeneficioController
 * =============================================================================
 * Controlador encargado de exponer los endpoints HTTP relacionados
 * a los beneficios (cupones) de los usuarios.
 *
 * Base route: /usuarios-beneficios
 *
 * Permite:
 *  - Obtener beneficios de un usuario
 *  - Reclamar un beneficio
 *  - Usar un beneficio
 * =============================================================================
 */

@ApiTags('Usuarios - Beneficios')
@Controller('usuarios-beneficios')
export class UsuarioBeneficioController {
  constructor(
    private readonly usuarioBeneficioService: UsuarioBeneficioService,
  ) {}

  /**
   * ============================================================================
   * GET /usuarios-beneficios/usuario/:usuarioId
   * Obtiene todos los beneficios asociados a un usuario
   * ============================================================================
   *
   * @param usuarioId number → ID del usuario
   *
   * @returns {Promise<UsuarioBeneficio[]>}
   *   - Lista de beneficios reclamados por el usuario
   *   - Puede devolver array vacío si no tiene beneficios
   *
   * @response 200 Lista de beneficios del usuario
   */
  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Listar beneficios de un usuario' })
  @ApiParam({ name: 'usuarioId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de beneficios del usuario',
  })
  getByUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.usuarioBeneficioService.getByUsuario(usuarioId);
  }

  /**
   * ============================================================================
   * POST /usuarios-beneficios/usuario/:usuarioId/beneficio/:beneficioId
   * Reclamar un beneficio para un usuario
   * ============================================================================
   *
   * Comportamiento:
   *  - Si el beneficio ya está activo → incrementa cantidad
   *  - Si no existe → crea nuevo registro
   *
   * @param usuarioId number → ID del usuario
   * @param beneficioId number → ID del beneficio
   *
   * @returns {Promise<UsuarioBeneficio>}
   *   - Registro creado o actualizado
   *
   * @response 201 Beneficio reclamado correctamente
   */
  @Post('usuario/:usuarioId/beneficio/:beneficioId')
  @ApiOperation({ summary: 'Reclamar beneficio para un usuario' })
  @ApiParam({ name: 'usuarioId', type: Number })
  @ApiParam({ name: 'beneficioId', type: Number })
  @ApiResponse({
    status: 201,
    description: 'Beneficio reclamado correctamente',
  })
  reclamarBeneficio(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('beneficioId', ParseIntPipe) beneficioId: number,
  ) {
    return this.usuarioBeneficioService.reclamarBeneficio(
      usuarioId,
      beneficioId,
    );
  }

  /**
   * ============================================================================
   * POST /usuarios-beneficios/:id/usar
   * Usar un cupón disponible
   * ============================================================================
   *
   * Reglas:
   *  - Debe existir el registro
   *  - Debe estar en estado "activo"
   *  - Debe haber cantidad disponible
   *
   * @param id number → ID del registro UsuarioBeneficio
   *
   * @returns {Promise<UsuarioBeneficio>}
   *   - Registro actualizado
   *
   * @throws 404 Si el beneficio no existe
   * @throws 400 Si no está activo o no hay cupones disponibles
   *
   * @response 200 Beneficio utilizado correctamente
   */
  @Post(':id/usar')
  @ApiOperation({ summary: 'Usar un beneficio disponible' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Beneficio utilizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Beneficio no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Beneficio no activo o sin cupones disponibles',
  })
  usarBeneficio(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuarioBeneficioService.usarBeneficio(id);
  }
}
