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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { EmpresasService } from './empresa.service';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { EmpresaImagenDTO } from './dto/lista_empresa_imagen.dto';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';

@ApiTags('Empresas')
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresasService: EmpresasService) {}

  /**
   * Obtener todas las empresas activas
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de empresas',
    type: EmpresaResponseDTO,
    isArray: true,
  })
  async findAll(): Promise<EmpresaResponseDTO[]> {
    return this.empresasService.findAll();
  }

  @Get('/list/paginated/')
  @ApiOperation({ summary: 'Listar usuarios paginados' })
  @ApiResponse({
    status: 200,
    type: EmpresaResponseDTO,
    isArray: true,
  })
  async findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return await this.empresasService.findPaginated(page, limit, search);
  }

  /**
   * Obtener las imagenes de las empresas
   */
  @Get('imagenes')
  @ApiOperation({ summary: 'Listar las imagenes de las empresas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de imagenes de empresas',
    type: EmpresaImagenDTO,
    isArray: true,
  })
  async findIMG(): Promise<EmpresaImagenDTO[]> {
    return this.empresasService.findIMG();
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
    type: EmpresaResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.findOne(id);
  }

  /**
   * Crear una nueva empresa
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiBody({ type: CreateEmpresaDTO })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada correctamente',
    type: EmpresaResponseDTO,
  })
  @ApiResponse({
    status: 409,
    description: 'La empresa ya existe',
  })
  async create(
    @Body() createDto: CreateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.create(createDto);
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
  @ApiBody({ type: UpdateEmpresaDTO })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada correctamente',
    type: EmpresaResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.update(id, updateDto);
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
    return this.empresasService.delete(id);
  }

  /**
   * Restaurar una empresa deshabilitada
   */
  @Patch(':id/restaurar')
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
    return await this.empresasService.restore(id);
  }

  @Patch(':id/credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la empresa',
  })
  async updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return await this.empresasService.updateCredentials(id, dto);
  }
}
