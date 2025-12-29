import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { CampaignService } from './campaign.service';
import { CreateCampaignsDto } from './dto/create_campaigns.dto';
import { UpdateCampaignsDto } from './dto/update_campaigns.dto';
import { ResponseCampaignsDto } from './dto/response_campaigns.dto';

/**
 * Controlador para gestionar las Campañas Solidarias.
 */

@ApiTags('Campañas')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  /**
   * Listar todas las Campañas Solidarias
   */
  @Get()
  @ApiOperation({ summary: 'Lista todas las Campañas Solidarias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Campañas Solidarias obtenidas exitosamente',
    type: ResponseCampaignsDto,
    isArray: true,
  })

  /**
   * Obtener una Campaña Solidaria por ID
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

  /**
   * Crea una Nueva Campaña Solidaria
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva Campaña Solidaria' })
  @ApiBody({
    type: CreateCampaignsDto,
    description: 'Datos para crear una nueva Campaña Solidaria',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaña creada exitosamente',
    type: ResponseCampaignsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos Invalidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña Solidaria no Encontrada',
  })
  async create(
    @Body() createCampaignsDto: CreateCampaignsDto,
  ): Promise<ResponseCampaignsDto> {
    return this.campaignService.create(createCampaignsDto);
  }

  /**
   * Actualiza una Campaña Solidaria Existente
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar Campaña Solidaria existente' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id de la Campaña Solidaria',
    type: Number,
  })
  @ApiBody({
    type: UpdateCampaignsDto,
    description: 'Datos para actualizar la campaña Solidaria',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaña Solidaria actualizada exitosamente',
    type: ResponseCampaignsDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampaignsDto: UpdateCampaignsDto,
  ): Promise<ResponseCampaignsDto> {
    return this.campaignService.update(id, updateCampaignsDto);
  }

  /**
   * Eliminar una Campaña Solidaria
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
