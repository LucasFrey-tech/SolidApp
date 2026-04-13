import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';

import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { BeneficioEstado } from './dto/enum/enum';
import { Auth, Public } from '../auth/decoradores/auth.decorador';
import { Rol } from '../user/enums/enums';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';

/**
 * Controlador para gestionar las operaciones de los Beneficios.
 * Proporciona endpoints para crear, leer actualizar y eliminar beneficios,
 * así como para obtener beneficios filtrados por empresas.
 */
@ApiTags('Beneficios')
@Controller('beneficios')
export class BeneficioController {
  constructor(private readonly beneficiosService: BeneficioService) {}

  @Public()
  @Get('cupones')
  async findAllPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('onlyEnabled') onlyEnabled: boolean,
  ): Promise<{
    items: BeneficiosResponseDTO[];
    total: number;
  }> {
    return this.beneficiosService.findAllPaginated(
      Number(page),
      Number(limit),
      search,
      onlyEnabled,
    );
  }

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

  @Auth(Rol.COLABORADOR, Rol.ADMIN)
  @Patch(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: BeneficioEstado,
    @Req() req: RequestConUsuario,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.updateEstado(
      id,
      estado,
      req.user.id,
      req.user.rol,
    );
  }
}
