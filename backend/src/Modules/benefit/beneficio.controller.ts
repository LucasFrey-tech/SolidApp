import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';
import { CanjearBeneficioDto } from './dto/canjear_beneficio.dto';
import { UpdateEstadoBeneficioDTO } from './dto/update_estado_beneficio.dto';

@ApiTags('Beneficios')
@Controller('beneficios')
export class BeneficioController {
  constructor(private readonly beneficiosService: BeneficioService) {}

  @Get()
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findAll();
  }

  @Get('paginated')
  async findAllPaginated(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.beneficiosService.findAllPaginated(Number(page), Number(limit));
  }

  @Get('/list/paginated/')
  @ApiOperation({ summary: 'Listar usuarios paginados' })
  @ApiResponse({
    status: 200,
    type: BeneficiosResponseDTO,
    isArray: true,
  })
  async findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return await this.beneficiosService.findPaginated(page, limit, search);
  }

  @Get('empresa/:idEmpresa/paginated')
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

  @Get('empresa/:idEmpresa')
  async findByEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findByEmpresa(idEmpresa);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.create(dto);
  }

  @Post(':id/canjear')
  @ApiOperation({ summary: 'Canjear beneficio por puntos' })
  @ApiParam({ name: 'id', type: Number })
  canjear(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CanjearBeneficioDto,
  ) {
    return this.beneficiosService.canjear(id, dto.userId, dto.cantidad);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.update(id, dto);
  }

  @Patch(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoBeneficioDTO,
  ) {
    return this.beneficiosService.updateEstado(id, dto.estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.beneficiosService.delete(id);
  }
}
