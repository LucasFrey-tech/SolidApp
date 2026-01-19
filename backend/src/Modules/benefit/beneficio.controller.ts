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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';

/**
 * Controlador para gestionar los Beneficios.
 */

@ApiTags('Beneficios')
@Controller('beneficios')
export class BeneficioController {
  constructor(private readonly beneficiosService: BeneficioService) { }

  /**
   * Lista todos los beneficios.
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los Beneficios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Beneficios obtenida exitosamente',
    type: BeneficiosResponseDTO,
    isArray: true,
  })
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findAll();
  }

  /**
 * Lista beneficios por empresa
 */
  @Get('empresa/:idEmpresa')
  @ApiOperation({ summary: 'Listar Beneficios por Empresa' })
  @ApiParam({
    name: 'idEmpresa',
    description: 'ID de la empresa',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de beneficios de la empresa',
    type: BeneficiosResponseDTO,
    isArray: true,
  })
  async findByEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findByEmpresa(idEmpresa);
  }


  /**
   * Obtiene un beneficio por ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener Beneficio por ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del beneficio',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Beneficio encontrado',
    type: BeneficiosResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Beneficio no encontrado',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.findOne(id);
  }

  @Get()
  async findAllPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.beneficiosService.findAllPaginated(
      Number(page),
      Number(limit),
    );
  }

  /**
   * Crea un nuevo beneficio.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Beneficio' })
  @ApiBody({
    type: CreateBeneficiosDTO,
    description: 'Datos para crear un nuevo beneficio',
  })
  @ApiResponse({
    status: 201,
    description: 'Beneficio creado exitosamente',
    type: BeneficiosResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async create(
    @Body() createBeneficiosDto: CreateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.create(createBeneficiosDto);
  }

  /**
   * Actualiza un beneficio existente.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar Beneficio existente' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del beneficio a actualizar',
    type: Number,
  })
  @ApiBody({
    type: UpdateBeneficiosDTO,
    description: 'Datos para actualizar el beneficio',
  })
  @ApiResponse({
    status: 200,
    description: 'Beneficio actualizado exitosamente',
    type: BeneficiosResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Beneficio no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBeneficiosDto: UpdateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.update(id, updateBeneficiosDto);
  }

  /**
   * Elimina un beneficio.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar Beneficio' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID del beneficio a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Beneficio eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Beneficio no encontrado',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.beneficiosService.delete(id);
  }
}
