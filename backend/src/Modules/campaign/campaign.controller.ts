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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { CampaignsService } from './campaign.service';
import { CreateCampaignsDto } from './dto/create_campaigns.dto';
import { UpdateCampaignsDto } from './dto/update_campaigns.dto';
import { ResponseCampaignsDto } from './dto/response_campaigns.dto';
import { ResponseCampaignDetalleDto } from './dto/response_campaignDetalle.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesArrayValidationPipe } from '../../common/pipes/mediaFilePipes';
import { SettingsService } from '../../common/settings/settings.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Controlador para gestionar las operaciones de las Campañas.
 * Proporciona endpoints para crear, leer actualizar y eliminar Campañas,
 * así como para obtener Campañas filtrados por organizaciones.
 */
@ApiTags('Campañas')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignService: CampaignsService) { }

  /**
   * Obtiene todas las Campañas disponibles.
   *
   * @returns {Promise<ResponseCampaignsDto[]>} Lista todas las Campañas activas.
   */
  @Get()
  @ApiOperation({ summary: 'Lista todas las Campañas Solidarias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Campañas Solidarias obtenidas exitosamente',
    type: ResponseCampaignsDto,
    isArray: true,
  })
  async findAll(): Promise<ResponseCampaignsDto[]> {
    return this.campaignService.findAll();
  }

  /**
   * Obtener una Campaña por ID.
   *
   * @param {number} id - ID de la Campaña a buscar
   * @returns {Promise<ResponseCampaignsDto>} Campaña encontrada
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

  @Get(':id/detalle')
  @ApiOperation({ summary: 'Obtener campaña por ID con detalle completo' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de campaña encontrado',
    type: ResponseCampaignDetalleDto,
  })
  async findOneDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseCampaignDetalleDto> {
    return this.campaignService.findOneDetail(id);
  }

  /**
   * Obtiene todas las Campañas paginadas pertenecientes a una misma Organización.
   *
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Campañas por página
   * @param {string} search - Término de busqueda
   * @returns
   */
  @Get('/list/paginated/')
  @ApiOperation({ summary: 'Listar campañas solidarias de la organizacion' })
  @ApiResponse({
    status: 200,
    type: ResponseCampaignsDto,
    isArray: true,
  })
  findPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.campaignService.findPaginated(page, limit, search);
  }

  /**
   * Crea una nueva Campaña en el sistema.
   *
   * @param {CreateCampaignsDto} createCampaignsDto - Datos de la Campaña a crear
   * @param {Express.Multer.File} files - Imagenes de la Campaña
   * @returns {Promise<ResponseCampaignsDto>} Campaña creada
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
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: 'C:/StaticResources/Solid/campaigns/',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async create(
    @Body() createCampaignsDto: CreateCampaignsDto,
    @UploadedFiles(new ImagesArrayValidationPipe())
    files: Express.Multer.File[],
  ): Promise<ResponseCampaignsDto> {
    const imagenes = files.map((x) =>
      SettingsService.getCampaignImageUrl(x.filename),
    );
    return this.campaignService.create(createCampaignsDto, imagenes);
  }

  /**
   * Actualiza una Campaña existente.
   *
   * @param {number} id - ID de la Campaña a actualizar
   * @param {UpdateCampaignsDto} updateCampaignsDto - Datos actualizados de la Campaña
   * @returns {Promise<ResponseCampaignsDto>} Campaña actualizada
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
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: 'C:/StaticResources/Solid/campaigns/',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
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
    return this.campaignService.update(id, updateCampaignsDto, imagenes);
  }

  /**
   * Eliminar una Campaña del sistema (hard delete)
   *
   * @param {number} id - ID de la Campaña a eliminar
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
