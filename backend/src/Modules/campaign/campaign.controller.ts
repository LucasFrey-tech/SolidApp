import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { CampaignsService } from './campaign.service';
import { ResponseCampaignsDto } from './dto/response_campaigns.dto';
import { ResponseCampaignDetalleDto } from './dto/response_campaignDetalle.dto';

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
   * Obtiene todas las Campañas disponibles.
   *
   * @returns {Promise<ResponseCampaignsDto[]>} Lista todas las Campañas activas.
   */
  @Get()
  @ApiOperation({ summary: 'Lista todas las Campañas Solidarias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Campañas Solidarias obtenidas exitosamente',
    type: ResponseCampaignsDto,
    isArray: true,
  })
  async findAll(): Promise<ResponseCampaignsDto[]> {
    return this.campaignService.findAll();
  }

  /**
   * Obtener una Campaña por ID.
   *
   * @param {number} id - ID de la Campaña a buscar
   * @returns {Promise<ResponseCampaignsDto>} Campaña encontrada
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener Campaña Solidaria por ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID de la Campaña Solidaria',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Campaña Solidaria encontrada',
    type: ResponseCampaignsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña Solidaria no encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseCampaignsDto> {
    return this.campaignService.findOne(id);
  }

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

  /**
   * Obtiene todas las Campañas paginadas pertenecientes a una misma Organización.
   *
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Campañas por página
   * @param {string} search - Término de busqueda
   * @returns
   */
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
  ) {
    return this.campaignService.findPaginated(page, limit, search);
  }

  /**
   * Eliminar una Campaña del sistema (hard delete)
   *
   * @param {number} id - ID de la Campaña a eliminar
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar Campaña Solidaria' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID de la Campaña Solidaria',
  })
  @ApiResponse({
    status: 204,
    description: 'Campaña Solidaria eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña Solidaria no encontrada',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.campaignService.delete(id);
  }
}
