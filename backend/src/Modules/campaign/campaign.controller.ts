import {
  Controller,
  Get,
  Param,
  Body,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CampaignsService } from './campaign.service';
import { ResponseCampaignsDto } from './dto/response_campaigns.dto';
import { ResponseCampaignDetalleDto } from './dto/response_campaignDetalle.dto';
import { CampaignEstado } from './enum';
import { Auth, Public } from '../auth/decoradores/auth.decorador';
import { RolCuenta } from '../../Entities/cuenta.entity';

/**
 * Controlador para gestionar las operaciones de las Campañas.
 * Proporciona endpoints para crear, leer actualizar y eliminar Campañas,
 * así como para obtener Campañas filtrados por organizaciones.
 */
@ApiTags('Campañas')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignService: CampaignsService) {}

  /**
   * Obtiene todas las Campañas paginadas pertenecientes a una misma Organización.
   *
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Campañas por página
   * @param {string} search - Término de busqueda
   * @returns
   */
  @Public()
  @Get('/list/paginated/')
  @ApiOperation({ summary: 'Listar campañas solidarias de la organizacion' })
  @ApiResponse({
    status: 200,
    type: ResponseCampaignsDto,
    isArray: true,
  })
  findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('onlyEnabled') onlyEnabled: boolean,
  ) {
    return this.campaignService.findPaginated(page, limit, search, onlyEnabled);
  }

  @Public()
  @Get(':id/detalle')
  @ApiOperation({ summary: 'Obtener campaña por ID con detalle completo' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de campaña encontrado',
    type: ResponseCampaignDetalleDto,
  })
  async findOneDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseCampaignDetalleDto> {
    return this.campaignService.findOneDetail(id);
  }

  @Auth(RolCuenta.ADMIN)
  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de la organización' })
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: CampaignEstado,
  ) {
    await this.campaignService.updateEstado(id, estado);
  }
}
