import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
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
@ApiTags('Donaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  /**
   * Crear una Donación
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
   * Obtener todas las Donaciones
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
   * Ontener las Donaciones paginadas por Organizacion
   */
  @Get(':id/donations')
  async getOrganizationDonationsPaginated(
    @Param('id', ParseIntPipe) organizacionId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return await this.donationsService.findAllPaginatedByOrganizacion(
      organizacionId,
      Number(page),
      Number(limit),
    );
  }

  /**
   * Obtener las imagenes de las donaciones
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

  @Get('paginated')
  @ApiOperation({ summary: 'Listar donaciones paginadas' })
  findAllPaginated(@Query('page') page = 1, @Query('limit') limit = 6) {
    return this.donationsService.findAllPaginated(Number(page), Number(limit));
  }

  /**
   * Obtener una Donación por ID
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
}
