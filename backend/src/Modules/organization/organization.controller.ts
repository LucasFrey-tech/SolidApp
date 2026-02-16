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
  Query,
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

import { OrganizationsService } from './organization.service';
import { CreateOrganizationDto } from './dto/create_organization.dto';
import { UpdateOrganizationDto } from './dto/update_organization.dto';
import { ResponseOrganizationDto } from './dto/response_organization.dto';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';
import { ResponseOrganizationPaginatedDto } from './dto/response_organization_paginated.dto';
import { ResponseCampaignsPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';
import { PaginatedDonationsResponseDto } from '../donation/dto/response_donation_paginatedByOrganizacion.dto';

/**
 * Controlador encargado de gestionar las operaciones HTTP
 * relacionadas con las organizaciones.
 *
 * Permite:
 * - Crear organizaciones
 * - Listar organizaciones (simples y paginadas)
 * - Obtener organización por ID
 * - Actualizar datos
 * - Deshabilitar (soft delete)
 * - Restaurar organizaciones
 * - Actualizar credenciales
 *
 * Base path: /organizations
 */
@ApiTags('Organizaciones')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationsService) {}

  /**
   * Obtiene el listado completo de organizaciones activas.
   *
   * @returns Lista de organizaciones en formato ResponseOrganizationDto[]
   */
  @Get()
  @ApiOperation({ summary: 'Listar organizaciones activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de organizaciones',
    type: ResponseOrganizationDto,
    isArray: true,
  })
  findAll(): Promise<ResponseOrganizationDto[]> {
    return this.organizationService.findAll();
  }

  /**
   * Obtiene una organización específica por su ID.
   *
   * @param id ID numérico de la organización
   * @returns Organización encontrada
   * @throws NotFoundException si no existe
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 200,
    description: 'Organización encontrada',
    type: ResponseOrganizationDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseOrganizationDto> {
    return this.organizationService.findOne(id);
  }

  /**
   * Lista organizaciones de forma paginada.
   *
   * @param page Número de página (default: 1)
   * @param limit Cantidad de registros por página (default: 10)
   * @param search Texto opcional para búsqueda por razón social o nombre fantasía
   *
   * @returns Objeto con items y total de registros
   */
  @Get('/list/paginated/')
  @ApiOperation({ summary: 'Listar organizaciones paginadas' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de organizaciones',
    type: ResponseOrganizationPaginatedDto,
  })
  async findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ): Promise<ResponseOrganizationPaginatedDto> {
    return await this.organizationService.findPaginated(
      Number(page),
      Number(limit),
      search,
    );
  }

  /**
   * Obtiene las campañas asociadas a una organización
   * de manera paginada.
   *
   * @param organizacionId ID de la organización
   * @param page Número de página
   * @param limit Cantidad por página
   *
   * @returns Campañas paginadas de la organización
   */
  @Get(':id/campaigns/paginated/')
  @ApiOperation({
    summary: 'Listar campañas de la organización (paginado)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de campañas',
    type: ResponseCampaignsPaginatedDto,
  })
  async findOrganizationCampaignsPaginated(
    @Param('id', ParseIntPipe) organizacionId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ResponseCampaignsPaginatedDto> {
    return await this.organizationService.findOrganizationCampaignsPaginated(
      organizacionId,
      Number(page),
      Number(limit),
    );
  }

  /**
   * Obtiene las donaciones a una organización de manera paginada.
   *
   * @param organizacionId ID de la organización
   * @param page Número de página
   * @param limit Cantidad por página
   *
   * @returns Donaciones paginadas de la organización
   */
  @Get(':id/donaciones/paginated/')
  @ApiOperation({
    summary: 'Listar donaciones a la organización (paginado)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de donaciones',
    type: PaginatedDonationsResponseDto,
  })
  async findOrganizationDonatiosPaginated(
    @Param('id', ParseIntPipe) organizacionId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedDonationsResponseDto> {
    return await this.organizationService.findOrganizationDonationsPaginated(
      organizacionId,
      Number(page),
      Number(limit),
    );
  }

  /**
   * Crea una nueva organización.
   *
   * @param createDto Datos necesarios para la creación
   * @returns Organización creada
   * @throws ConflictException si ya existe
   */
  @Post()
  @ApiOperation({ summary: 'Crear una organización' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiResponse({
    status: 201,
    description: 'Organización creada correctamente',
    type: ResponseOrganizationDto,
  })
  create(
    @Body() createDto: CreateOrganizationDto,
  ): Promise<ResponseOrganizationDto> {
    return this.organizationService.create(createDto);
  }

  /**
   * Actualiza los datos de una organización existente.
   *
   * @param id ID de la organización
   * @param updateDto Datos a modificar
   * @returns Organización actualizada
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una organización' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiResponse({
    status: 200,
    description: 'Organización actualizada correctamente',
    type: ResponseOrganizationDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrganizationDto,
  ): Promise<ResponseOrganizationDto> {
    return this.organizationService.update(id, updateDto);
  }

  /**
   * Deshabilita una organización (soft delete).
   *
   * @param id ID de la organización
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deshabilitar una organización' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 204,
    description: 'Organización deshabilitada correctamente',
  })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.organizationService.delete(id);
  }

  /**
   * Restaura una organización previamente deshabilitada.
   *
   * @param id ID de la organización
   */
  @Patch(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restaurar una organización deshabilitada' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 204,
    description: 'Organización restaurada correctamente',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.organizationService.restore(id);
  }

  /**
   * Permite actualizar el correo y/o contraseña
   * de la organización.
   *
   * @param id ID de la organización
   * @param dto Datos de actualización de credenciales
   * @returns Usuario actualizado + nuevo token JWT
   */
  @Patch(':id/credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la organización',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiBody({ type: UpdateCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Credenciales actualizadas correctamente',
  })
  async updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return await this.organizationService.updateCredentials(id, dto);
  }
}
