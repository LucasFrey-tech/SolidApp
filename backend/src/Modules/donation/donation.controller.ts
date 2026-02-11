import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DonationsService } from './donation.service';
import { CreateDonationDto } from './dto/create_donation.dto';
import { ResponseDonationDto } from './dto/response_donation.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { DonacionImagenDTO } from './dto/lista_donacion_imagen.dto';
import { PaginatedDonationsResponseDto } from './dto/response_donation_paginatedByOrganizacion.dto';

/**
 * Controlador para gestionar las operaciones de las Donaciones.
 * Proporciana endpoints para crear, leer, actualizar y eleiminar donaciones,
 * así como para obtener donaciones filtradas por Organizaciones
 */
@ApiTags('Donaciones')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) { }

  /**
   * Obtiene todas las Donaciones disponibles.
   * 
   * @returns {Promise<ResponseDonationDto[]} Lista de todas las donaciones activas
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas las donaciones' })
  @ApiResponse({
    status: 200,
    description: 'Listado de donaciones',
    type: ResponseDonationDto,
    isArray: true,
  })
  findAll(): Promise<ResponseDonationDto[]> {
    return this.donationsService.findAll();
  }

  /**
   * Obtiene todas las Donaciones paginadas disponibles
   * 
   * @param {number} page - Página solicitada (basada en 1)
   * @param {number} limit - Cantidad de Donaciones por página
   * @returns Lista de Donaciones paginadas
   */
  @Get('paginated')
  @ApiOperation({ summary: 'Listar donaciones paginadas' })
  findAllPaginated(@Query('page') page = 1, @Query('limit') limit = 6) {
    return this.donationsService.findAllPaginated(Number(page), Number(limit));
  }

  /**
   * Obtiene todas las Donaciones paginadas pertenecientes a una misma Organización
   * 
   * @param {number} organizacionId - ID de la Organización a filtrar
   * @param {number} page - Página solicitada
   * @param {number} limit - Cantidad de Donaciones por página
   * @returns {Promise<PaginatedDonationsResponseDto>} Lista paginada de Donaciones
   */
  @Get(':id/donations')
  async getOrganizationDonationsPaginated(
    @Param('id', ParseIntPipe) organizacionId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginatedDonationsResponseDto> {
    return await this.donationsService.findAllPaginatedByOrganizacion(
      organizacionId,
      Number(page),
      Number(limit),
    );
  }

  /**
   * Obtiene las Imagenes de las Donaciones.
   * 
   * @returns {Promise<DonacionImagenDTO[]} Lista de imágenes de las Donaciones
   */
  @Get('imagenes')
  @ApiOperation({ summary: 'Listar las imagenes de las campañas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de imagenes de campañas',
    type: DonacionImagenDTO,
    isArray: true,
  })
  async findIMG(): Promise<DonacionImagenDTO[]> {
    return this.donationsService.findIMG();
  }

  /**
   * Obtiene una Donacíon específica.
   * 
   * @param {number} id - ID de la Donación a buscar
   * @returns {Promise<ResponseDonationDto>} Donación encontrada
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una donación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la donación',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Donación encontrada',
    type: ResponseDonationDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Donación no encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseDonationDto> {
    return this.donationsService.findOne(id);
  }

  /**
 * Crea una Donación nueva en el sistema.
 * 
 * @param {CreateDonationDto} createDto - Datos de la Donación a crear
 * @param {JwtPayload} user - ID de la Organización que crea la Donación
 * @returns {Promise<ResponseDonationDto>} Donación creada.
 */
  @Post(':campaignId')
  @ApiOperation({
    summary: 'Crear una donación',
    description:
      'Permite a un usuario autenticado realizar una donación a una campaña',
  })
  @ApiParam({
    name: 'campaignId',
    description: 'ID de la campaña a la que se dona',
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: 'Donación creada exitosamente',
    type: ResponseDonationDto,
  })
  create(
    @Body() createDto: CreateDonationDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ResponseDonationDto> {
    return this.donationsService.create(createDto, user.id);
  }

  /**
   * Confirma la Donación pendiente.
   * 
   * @param {number} id - ID de la Donación a confirmar
   * @returns Donación confirmada
   */
  @Patch(':id/confirmar')
  confirmarDonacion(@Param('id') id: number) {
    return this.donationsService.confirmarDonacion(id);
  }
}
