import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';

import { RolCuenta } from '../../Entities/cuenta.entity';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { BeneficioEstado } from './dto/enum/enum';
import { Auth, Public } from '../auth/decoradores/auth.decorador';
import { CanjearBeneficioDto } from './dto/canjear_beneficio.dto';

/**
 * Controlador para gestionar las operaciones de los Beneficios.
 * Proporciona endpoints para crear, leer actualizar y eliminar beneficios,
 * así como para obtener beneficios filtrados por empresas.
 */
@ApiTags('Beneficios')
@Controller('beneficios')
export class BeneficioController {
  constructor(private readonly beneficiosService: BeneficioService) {}

  /**
   * Obtiene todos los Beneficios disponibles con paginación.
   *
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Beneficios por página
   * @returns Lista de Beneficios paginados.
   */
  @Public()
  @Get('cupones')
  async findAllPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('onlyEnabled') onlyEnabled: boolean,
  ) {
    return this.beneficiosService.findAllPaginated(
      Number(page),
      Number(limit),
      search,
      onlyEnabled,
    );
  }

  /**
   * Obtiene todos los beneficios paginados pertenecientes a una misma empresa
   *
   * @param {number} idEmpresa - ID de la empresa a filtrar
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Beneficios por página
   * @returns {Promise<PaginatedBeneficiosResponseDTO>} Lista de Beneficios paginados.
   */
  @Public()
  @Get('empresa/:idEmpresa/cupones')
  async findByEmpresaPaginated(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    return await this.beneficiosService.findByEmpresaPaginated(
      idEmpresa,
      page,
      limit,
    );
  }

  /**
   * Canjea un Beneficio por puntos para un usuario.
   *
   * @param {number} id - ID del beneficio
   * @param {CanjearBeneficioDto} dto - Datos del canje (ID del usuario y cantidad a canjear)
   * @returns Resultado del canje con información del estado final
   */
  @Auth(RolCuenta.USUARIO)
  @Post(':id/canjear')
  @ApiOperation({ summary: 'Canjear beneficio por puntos' })
  @ApiParam({ name: 'id', type: Number })
  canjear(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestConUsuario,
    @Body() dto: CanjearBeneficioDto,
  ) {
    return this.beneficiosService.canjear(id, req.user.perfil.id, dto.cantidad);
  }

  /**
   * Actualiza el estado del Beneficio.
   *
   * @param {number} id - ID del Beneficio a actualizar
   * @param {BeneficioEstado} estado - Estado actualizado del Beneficio
   * @returns Beneficio actualizado
   */
  @Auth(RolCuenta.EMPRESA, RolCuenta.ADMIN)
  @Patch(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: BeneficioEstado,
  ) {
    return this.beneficiosService.updateEstado(id, estado);
  }
}
