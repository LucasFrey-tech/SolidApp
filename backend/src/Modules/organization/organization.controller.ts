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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organization.service';
import { CreateOrganizationDto } from './dto/create_organization.dto';
import { UpdateOrganizationDto } from './dto/update_organization.dto';
import { ResponseOrganizationDto } from './dto/response_organization.dto';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';
import { JwtService } from '@nestjs/jwt';
import { ResponseOrganizationPaginatedDto } from './dto/response_organization_paginated.dto';
import { ResponseCampaignsPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';

@ApiTags('Organizaciones')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationService: OrganizationsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar organizaciones activas' })
  @ApiResponse({
    status: 200,
    type: ResponseOrganizationDto,
    isArray: true,
  })
  findAll(): Promise<ResponseOrganizationDto[]> {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    type: ResponseOrganizationDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseOrganizationDto> {
    return this.organizationService.findOne(id);
  }

  @Get('/list/paginated/')
  @ApiOperation({ summary: 'Listar organizaciones paginadas' })
  @ApiResponse({
    status: 200,
    type: ResponseOrganizationPaginatedDto,
    isArray: true,
  })
  async findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return await this.organizationService.findPaginated(page, limit, search);
  }

  @Get(':id/campaigns/paginated/')
  @ApiOperation({ summary: 'Listar campañas de la organizacion' })
  @ApiResponse({
    status: 200,
    type: ResponseCampaignsPaginatedDto,
  })
  async findOrganizationCampaignsPaginated(
    @Param('id') organizacionId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.organizationService.findOrganizationCampaignsPaginated(
      organizacionId,
      page,
      limit,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear una organización' })
  @ApiResponse({
    status: 201,
    type: ResponseOrganizationDto,
  })
  create(
    @Body() createDto: CreateOrganizationDto,
  ): Promise<ResponseOrganizationDto> {
    return this.organizationService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una organización' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrganizationDto,
  ): Promise<ResponseOrganizationDto> {
    return this.organizationService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deshabilitar una organización' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.organizationService.delete(id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar una organización' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.organizationService.restore(id);
  }

  @Patch(':id/credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la organización',
  })
  async updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return await this.organizationService.updateCredentials(id, dto);
  }
}
