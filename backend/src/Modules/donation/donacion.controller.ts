import {
  Controller,
  Get,
  Param,
  Body,
  ParseIntPipe,
  //UseGuards,
  Query,
  Patch,
  Req,
} from '@nestjs/common';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { DonacionService } from './donacion.service';
import { ResponseDonationDto } from './dto/response_donation.dto';
import { DonacionImagenDTO } from './dto/lista_donacion_imagen.dto';
import { PaginatedOrganizationDonationsResponseDto } from './dto/response_donation_paginatedByOrganizacion.dto';
import { UpdateDonacionEstadoDto } from './dto/update_donation_estado.dto';
import { PaginatedUserDonationsResponseDto } from './dto/response_donation_paginatedByUser.dto';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';

/**
 * Controlador para gestionar las operaciones de las Donaciones.
 * Proporciana endpoints para crear, leer, actualizar y eleiminar donaciones,
 * así como para obtener donaciones filtradas por Organizaciones
 */
@ApiTags('Donaciones')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('donaciones')
export class DonacionesController {
  constructor(private readonly donationsService: DonacionService) {}

  /**
   * Obtiene todas las Donaciones disponibles.
   *
   * @returns {Promise<ResponseDonationDto[]>} Lista de todas las donaciones activas
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
   * @returns {Promise<PaginatedDonationsResponseDto>} - Lista paginada de Donaciones
   */
  @Get('organizacion/:organizacionId')
  async getOrganizationDonationsPaginated(
    @Param('organizacionId', ParseIntPipe) organizacionId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedOrganizationDonationsResponseDto> {
    return await this.donationsService.findAllPaginatedByOrganizacion(
      organizacionId,
      Number(page),
      Number(limit),
    );
  }

  /**
   * @param {number} userId - Id del usuario a filtrar
   * @param {number} page - Página solicitada
   * @param {number} limit - Cantidad de Donaciones por página
   * @returns {Promise<PaginatedUserDonationsResponseDto>} - Lista paginada de Donaciones
   */
  @Get('donaciones')
  @ApiOperation({ summary: 'Obtener donaciones de un usuario' })
  async getDonacionesByUser(
    @Req() req: RequestConUsuario,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedUserDonationsResponseDto> {
    return this.donationsService.findAllPaginatedByUser(
      req.user.perfil.id,
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
   * Actualiza el estado de una donación.
   *
   * Permite cambiar el estado de la donación (por ejemplo, a RECHAZADA)
   * y registrar información adicional como el motivo del rechazo.
   *
   * @param {number} id - ID de la donación a actualizar.
   * @param {string} motivo - Motivo del rechazo (opcional, requerido si estado=RECHAZADA).
   * @returns {Promise<void>} Resultado de la operación.
   */
  @Patch(':id')
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
    return this.donationsService.confirmarDonacion(id, dto);
  }
}
