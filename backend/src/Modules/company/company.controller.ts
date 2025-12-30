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

import { CompaniesService } from './company.service';
import { CreateCompanyDTO } from './dto/create_company.dto';
import { UpdateCompanyDTO } from './dto/update_company.dto';
import { CompanyResponseDTO } from './dto/response_company.dto';

@ApiTags('Empresas')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * Obtener todas las empresas activas
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de empresas',
    type: CompanyResponseDTO,
    isArray: true,
  })
  async findAll(): Promise<CompanyResponseDTO[]> {
    return this.companiesService.findAll();
  }

  /**
   * Obtener empresa por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
    type: CompanyResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyResponseDTO> {
    return this.companiesService.findOne(id);
  }

  /**
   * Crear una nueva empresa
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiBody({ type: CreateCompanyDTO })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada correctamente',
    type: CompanyResponseDTO,
  })
  @ApiResponse({
    status: 409,
    description: 'La empresa ya existe',
  })
  async create(
    @Body() createDto: CreateCompanyDTO,
  ): Promise<CompanyResponseDTO> {
    return this.companiesService.create(createDto);
  }

  /**
   * Actualizar una empresa existente
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una empresa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la empresa',
  })
  @ApiBody({ type: UpdateCompanyDTO })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada correctamente',
    type: CompanyResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCompanyDTO,
  ): Promise<CompanyResponseDTO> {
    return this.companiesService.update(id, updateDto);
  }

  /**
   * Deshabilitar una empresa (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deshabilitar una empresa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la empresa',
  })
  @ApiResponse({
    status: 204,
    description: 'Empresa deshabilitada',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.companiesService.delete(id);
  }

  /**
   * Restaurar una empresa deshabilitada
   */
  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restaurar una empresa deshabilitada' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la empresa',
  })
  @ApiResponse({
    status: 204,
    description: 'Empresa restaurada',
  })
  @ApiResponse({
    status: 400,
    description: 'La empresa ya está activa',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.companiesService.restore(id);
  }
}
