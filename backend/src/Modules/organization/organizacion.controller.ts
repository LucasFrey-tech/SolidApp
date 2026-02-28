import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { PerfilOrganizacionService } from './organizacion.service';
import { UpdateOrganizacionDto } from './dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from './dto/response_organizacion.dto';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { ResponseOrganizationPaginatedDto } from './dto/response_organizacion_paginated.dto';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { RolCuenta } from '../../Entities/cuenta.entity';
import { ResponseCampaignDetalleDto } from '../campaign/dto/response_campaignDetalle.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../campaign/dto/response_campaign_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../donation/dto/response_donation_paginatedByOrganizacion.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImagesArrayValidationPipe } from '../../common/pipes/mediaFilePipes';
import { SettingsService } from '../../common/settings/settings.service';
import { CreateCampaignsDto } from '../campaign/dto/create_campaigns.dto';
import { ResponseCampaignsDto } from '../campaign/dto/response_campaigns.dto';
import { UpdateCampaignsDto } from '../campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../donation/dto/update_donation_estado.dto';
import { Auth } from '../auth/decoradores/auth.decorador';

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
@Controller('organizaciones')
export class OrganizacionesController {
  constructor(
    private readonly organizacionService: PerfilOrganizacionService,
  ) {}

  // ================= PanelOrganizacion ===================

  /**
   * Obtiene una organización específica por su ID.
   *
   * @param id ID numérico de la organización
   * @returns Organización encontrada
   * @throws NotFoundException si no existe
   */
  @Auth(RolCuenta.ORGANIZACION)
  @Get('perfil')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiResponse({
    status: 200,
    description: 'Organización encontrada',
    type: ResponseOrganizacionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  getMiPerfil(@Req() req: RequestConUsuario): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.findOne(req.user.perfil.id);
  }

  @Auth(RolCuenta.ORGANIZACION)
  @Get('campanas')
  @ApiOperation({ summary: 'Obtener campañas de la organizacion' })
  @ApiResponse({
    status: 200,
    description: 'Campañas encontradas',
    type: ResponseCampaignDetalleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campañas no encontradas',
  })
  async getMisCampañas(
    @Req() req: RequestConUsuario,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ResponseCampaignsDetailPaginatedDto> {
    return await this.organizacionService.getCampaigns(
      req.user.perfil.id,
      page,
      limit,
    );
  }

  /**
   * Crea una nueva Campaña en el sistema.
   *
   * @param {CreateCampaignsDto} createCampaignsDto - Datos de la Campaña a crear
   * @param {Express.Multer.File} files - Imagenes de la Campaña
   * @returns {Promise<ResponseCampaignsDto>} Campaña creada
   */
  @Auth(RolCuenta.ORGANIZACION)
  @Post('campana')
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
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: 'C:/StaticResources/Solid/campaigns/',
        filename: (req, file, cb) => {
          const sanitizedName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.]/g, '_')
            .replace(/\s+/g, '_');

          cb(null, sanitizedName);
        },
      }),
    }),
  )
  async createMiCampaign(
    @Req() req: RequestConUsuario,
    @Body() createCampaignsDto: CreateCampaignsDto,
    @UploadedFiles(new ImagesArrayValidationPipe())
    files: Express.Multer.File[],
  ): Promise<ResponseCampaignsDto> {
    const imagenes = files.map((x) =>
      SettingsService.getCampaignImageUrl(x.filename),
    );
    return this.organizacionService.createCampaign(
      req.user.perfil.id,
      createCampaignsDto,
      imagenes,
    );
  }

  /**
   * Actualiza una Campaña existente.
   *
   * @param {number} id - ID de la Campaña a actualizar
   * @param {UpdateCampaignsDto} updateCampaignsDto - Datos actualizados de la Campaña
   * @returns {Promise<ResponseCampaignsDto>} Campaña actualizada
   */
  @Auth(RolCuenta.ORGANIZACION)
  @Patch('campana')
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
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: 'C:/StaticResources/Solid/campaigns/',
        filename: (req, file, cb) => {
          const sanitizedName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.]/g, '_')
            .replace(/\s+/g, '_');

          cb(null, sanitizedName);
        },
      }),
    }),
  )
  async updateMiCampaign(
    @Req() req: RequestConUsuario,
    @Body() updateCampaignsDto: UpdateCampaignsDto,
    @UploadedFiles(new ImagesArrayValidationPipe())
    files?: Express.Multer.File[],
  ): Promise<ResponseCampaignsDto> {
    let imagenes: string[] | undefined;
    if (files && files.length > 0) {
      imagenes = files.map((x) =>
        SettingsService.getCampaignImageUrl(x.filename),
      );
    }
    return this.organizacionService.updateCampaign(
      req.user.perfil.id,
      updateCampaignsDto,
      imagenes,
    );
  }

  @Auth(RolCuenta.ORGANIZACION)
  @Get('mis-donaciones')
  @ApiOperation({ summary: 'Obtener donaciones de la organizacion' })
  @ApiResponse({
    status: 200,
    description: 'Donaciones encontradas',
    type: ResponseCampaignDetalleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Donaciones no encontradas',
  })
  async getMisDonaciones(
    @Req() req: RequestConUsuario,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedOrganizationDonationsResponseDto> {
    return await this.organizacionService.getDonaciones(
      req.user.perfil.id,
      page,
      limit,
    );
  }

  /**
   * Actualiza el estado de una donación.
   *
   * Permite cambiar el estado de la donación (por ejemplo, a RECHAZADA)
   * y registrar información adicional como el motivo del rechazo.
   *
   * @param {number} id - ID de la donación a actualizar.
   * @param {string} motivo - Motivo del rechazo (opcional, requerido si estado=RECHAZADA).
   * @returns {Promise<void>} Resultado de la operación.
   */
  @Auth(RolCuenta.ORGANIZACION)
  @Patch('donaciones/:id')
  @ApiOperation({
    summary: 'Actualizar el estado de la donación',
    description: 'Modifica el estado de una donación (ej. RECHAZADA)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la donación a actualizar',
    example: 5,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          enum: ['ACEPTADA', 'RECHAZADA'],
          example: 'RECHAZADA',
        },
        motivo: {
          type: 'string',
          example: 'La imagen comprobante no es legible',
        },
      },
      required: ['estado'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Donación actualizada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Donación no encontrada.',
  })
  async actualizarEstadoDonación(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonacionEstadoDto,
  ) {
    return await this.organizacionService.confirmarDonacion(id, dto);
  }

  /**
   * Actualiza los datos de una organización existente.
   *
   * @param id ID de la organización
   * @param updateDto Datos a modificar
   * @returns Organización actualizada
   */
  @Auth(RolCuenta.ORGANIZACION)
  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar una organización' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la organización',
  })
  @ApiBody({ type: UpdateOrganizacionDto })
  @ApiResponse({
    status: 200,
    description: 'Organización actualizada correctamente',
    type: ResponseOrganizacionDto,
  })
  updateMiPerfil(
    @Req() req: RequestConUsuario,
    @Body() updateDto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    console.log('Datos que llegan al controller: ', updateDto);
    return this.organizacionService.update(req.user.perfil.id, updateDto);
  }

  /**
   * Permite actualizar el correo y/o contraseña
   * de la organización.
   *
   * @param id ID de la organización
   * @param dto Datos de actualización de credenciales
   * @returns Usuario actualizado + nuevo token JWT
   */
  @Auth(RolCuenta.ORGANIZACION)
  @Patch('credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la organización',
  })
  @ApiBody({ type: UpdateCredencialesDto })
  @ApiResponse({
    status: 200,
    description: 'Credenciales actualizadas correctamente',
  })
  async updateMisCredenciales(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateCredencialesDto,
  ) {
    return await this.organizacionService.updateCredenciales(
      req.user.cuenta.id,
      dto,
    );
  }

  // ====== Panel Admin ======

  /**
   * Obtiene el listado completo de organizaciones activas.
   *
   * @returns Lista de organizaciones en formato ResponseOrganizationDto[]
   */
  @Auth(RolCuenta.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar organizaciones activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de organizaciones',
    type: ResponseOrganizacionDto,
    isArray: true,
  })
  findAll(): Promise<ResponseOrganizacionDto[]> {
    return this.organizacionService.findAll();
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
  @Auth(RolCuenta.ADMIN)
  @Get('list')
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
    return await this.organizacionService.findPaginated(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Auth(RolCuenta.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener organización por ID (admin)' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.findOne(id);
  }

  @Auth(RolCuenta.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar organización (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.update(id, dto);
  }

  /**
   * Deshabilita una organización (soft delete).
   *
   * @param id ID de la organización
   */
  @Auth(RolCuenta.ADMIN)
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
    return this.organizacionService.delete(id);
  }

  /**
   * Restaura una organización previamente deshabilitada.
   *
   * @param id ID de la organización
   */
  @Auth(RolCuenta.ADMIN)
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
    return await this.organizacionService.restore(id);
  }
}
