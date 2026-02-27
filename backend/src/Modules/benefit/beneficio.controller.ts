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
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';
import { PaginatedBeneficiosResponseDTO } from './dto/response_paginated_beneficios';

import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decoradores/roles.decorador';
import { RolCuenta } from '../../Entities/cuenta.entity';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { BeneficioEstado } from './dto/enum/enum';

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
   * Obtiene todos los Beneficios disponibles.
   *
   * @returns {Promise<BeneficiosResponseDTO[]>} Lista de todos los beneficios activos
   */
  @Get()
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findAll();
  }

  /**
   * Obtiene todos los Beneficios disponibles con paginación.
   *
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Beneficios por página
   * @returns Lista de Beneficios paginados.
   */
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
   * Obtiene todos beneficios que hayan sido canjeados por un mismo usuario.
   *
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Beneficios por página
   * @param {string} search - Término de busqueda.
   * @returns Lista paginada de Beneficios canjeados por un mismo usuario
   */
  @Get('list')
  @ApiOperation({
    summary: 'Listar cupones canjeados por un mismo usuario paginados',
  })
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

  /**
   * Obtiene todos los beneficios paginados pertenecientes a una misma empresa
   *
   * @param {number} idEmpresa - ID de la empresa a filtrar
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Beneficios por página
   * @returns {Promise<PaginatedBeneficiosResponseDTO>} Lista de Beneficios paginados.
   */
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
   * Obtiene un Beneficio específico por su ID.
   *
   * @param {number} id - ID del Beneficio a buscar
   * @returns {Promise<BeneficiosResponseDTO>} Beneficio encontrado.
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.findOne(id);
  }

  /**
   * Crea un nuevo Beneficio en el sistema.
   *
   * @param {CreateBeneficiosDTO} dto - Datos del Beneficio a crear
   * @returns {Promise<BeneficiosResponseDTO>} Beneficio creado
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.create(dto);
  }

  /**
   * Canjea un Beneficio por puntos para un usuario.
   *
   * @param {number} id - ID del beneficio
   * @param {CanjearBeneficioDto} dto - Datos del canje (ID del usuario y cantidad a canjear)
   * @returns Resultado del canje con información del estado final
   */
  @Post(':id/canjear')
  @UseGuards(AuthGuard('jwt'))
  @Roles(RolCuenta.USUARIO)
  @ApiOperation({ summary: 'Canjear beneficio por puntos' })
  @ApiParam({ name: 'id', type: Number })
  canjear(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestConUsuario,
    @Query('cantidad') cantidad = 1,
  ) {
    return this.beneficiosService.canjear(id, req.user.perfil.id, cantidad);
  }

  /**
   * Actualiza un Beneficio existente.
   *
   * @param {number} id - ID del Beneficio a actualizar
   * @param {UpdateBeneficiosDTO} dto - Datos actualizados del beneficio
   * @returns {Promise<BeneficiosResponseDTO>} Beneficio actualizado
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.update(id, dto);
  }

  /**
   * Actualiza el estado del Beneficio.
   *
   * @param {number} id - ID del Beneficio a actualizar
   * @param {BeneficioEstado} estado - Estado actualizado del Beneficio
   * @returns Beneficio actualizado
   */
  @Patch(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: BeneficioEstado,
  ) {
    return this.beneficiosService.updateEstado(id, estado);
  }
}
