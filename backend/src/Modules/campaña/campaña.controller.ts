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

import { CampañaService } from './campaña.service';
import { CreateCampañaDto } from './dto/create_campaña.dto';
import { UpdateCampañaDto } from './dto/update_campaña.dto';
import { ResponseCampañaDto } from './dto/response_campaña.dto';

/**
 * Controlador para gestionar las Campañas Solidarias.
 */

@ApiTags('Campañas')
@Controller('campañas')
export class CampañasController {
  constructor(private readonly campañaService: CampañaService) {}

  /**
   * Listar todas las Campañas Solidarias
   */
  @Get()
  @ApiOperation({ summary: 'Lista todas las Campañas Solidarias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Campañas Solidarias obtenidas exitosamente',
    type: ResponseCampañaDto,
    isArray: true,
  })
  async findAll(): Promise<ResponseCampañaDto[]> {
    return this.campañaService.findAll();
  }

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
    type: ResponseCampañaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña Solidaria no encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseCampañaDto> {
    return this.campañaService.findOne(id);
  }

  /**
   * Crea una Nueva Campaña Solidaria
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva Campaña Solidaria' })
  @ApiBody({
    type: CreateCampañaDto,
    description: 'Datos para crear una nueva Campaña Solidaria',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaña creada exitosamente',
    type: ResponseCampañaDto,
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
    @Body() createCampañasDto: CreateCampañaDto,
  ): Promise<ResponseCampañaDto> {
    return this.campañaService.create(createCampañasDto);
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
    type: UpdateCampañaDto,
    description: 'Datos para actualizar la campaña Solidaria',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaña Solidaria actualizada exitosamente',
    type: ResponseCampañaDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampañasDto: UpdateCampañaDto,
  ): Promise<ResponseCampañaDto> {
    return this.campañaService.update(id, updateCampañasDto);
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
    await this.campañaService.delete(id);
  }
}
