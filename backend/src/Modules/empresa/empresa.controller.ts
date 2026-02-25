import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { PerfilEmpresaService } from './empresa.service';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { NullableImageValidationPipe } from '../../common/pipes/mediaFilePipes';
import { AuthGuard } from '@nestjs/passport';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { Roles } from '../auth/decoradores/roles.decorador';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolCuenta } from '../../Entities/cuenta.entity';
import { PaginatedBeneficiosResponseDTO } from '../benefit/dto/response_paginated_beneficios';
import { UpdateBeneficiosDTO } from '../benefit/dto/update_beneficios.dto';
import { CreateBeneficiosDTO } from '../benefit/dto/create_beneficios.dto';

/**
 * ============================================================
 * EmpresaController
 * ============================================================
 *
 * Controlador encargado de exponer los endpoints REST para la
 * gestión de Empresas dentro del sistema.
 *
 * Responsabilidades:
 * - Listar empresas activas
 * - Listar empresas paginadas con búsqueda
 * - Obtener imágenes asociadas
 * - Obtener empresa por ID
 * - Crear empresa
 * - Actualizar empresa
 * - Deshabilitar (Soft Delete)
 * - Restaurar empresa
 * - Actualizar credenciales
 *
 * Arquitectura:
 * Controller → Service → Repository (TypeORM)
 *
 * Todas las reglas de negocio están delegadas en EmpresasService.
 * ============================================================
 */
@ApiTags('Empresas')
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresasService: PerfilEmpresaService) {}

  // =====Panel Organizacion=====

  /**
   * GET /empresas/:id
   *
   * Obtiene una empresa específica por su ID.
   *
   * @param id ID numérico de la empresa.
   *
   * @returns Promise<EmpresaResponseDTO>
   * Empresa encontrada.
   *
   * @throws NotFoundException
   * Si la empresa no existe.
   */
  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
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
  async getMiPerfil(
    @Req() req: RequestConUsuario,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.findOne(req.user.perfil.id);
  }

  /**
   * PUT /empresas/:id
   *
   * Actualiza los datos de una empresa existente.
   *
   * @param id ID de la empresa.
   * @param updateDto Datos a modificar.
   *
   * @returns Promise<EmpresaResponseDTO>
   * Empresa actualizada.
   *
   * @throws NotFoundException
   * Si la empresa no existe.
   */
  @Patch('perfil')
  @UseGuards(AuthGuard('jwt'))
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
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: 'C:/StaticResources/Solid/empresas/',
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
  async updateMiPerfil(
    @Req() req: RequestConUsuario,
    @UploadedFile(new NullableImageValidationPipe())
    file?: Express.Multer.File,
    @Body('data') data?: string,
  ): Promise<EmpresaResponseDTO> {
    let updateDto: UpdateEmpresaDTO = {};

    if (data) {
      updateDto = JSON.parse(data) as UpdateEmpresaDTO;
    }

    if (file) {
      updateDto.logo = file.filename;
    }

    return this.empresasService.update(req.user.perfil.id, updateDto ?? {});
  }

  @Get('cupones')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener los cupones paginados de una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Cupones encontrados',
    type: EmpresaResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Cupones no encontrados',
  })
  async getMisCupones(
    @Req() req: RequestConUsuario,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedBeneficiosResponseDTO> {
    return this.empresasService.getCupones(req.user.perfil.id, page, limit);
  }

  @Post('cupones')
  @UseGuards(AuthGuard('jwt'))
  async createCupon(
    @Req() req: RequestConUsuario,
    @Body() dto: CreateBeneficiosDTO,
  ) {
    return await this.empresasService.createCupon(req.user.perfil.id, dto);
  }

  @Patch('cupones/:cuponId')
  @UseGuards(AuthGuard('jwt'))
  async updateCupon(
    @Param('cuponId', ParseIntPipe) cuponId: number,
    @Body() dto: UpdateBeneficiosDTO,
  ) {
    return await this.empresasService.updateCupon(cuponId, dto);
  }

  /**
   * PATCH /empresas/:id/credenciales
   *
   * Permite actualizar el correo electrónico y/o contraseña
   * de la empresa.
   *
   * @param id ID de la empresa.
   * @param dto Datos para actualizar credenciales.
   *
   * @returns {Promise user: Empresa; token: string }
   * Devuelve la empresa actualizada junto con un nuevo JWT.
   *
   * @throws NotFoundException
   * Si la empresa no existe.
   *
   * @throws ConflictException
   * Si el correo ya está en uso.
   *
   * @throws UnauthorizedException
   * Si la contraseña actual es incorrecta.
   */
  @Patch('credenciales')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la empresa',
  })
  async updateCredentials(
    @Req() req: RequestConUsuario,
    @Body() dto: UpdateCredencialesDto,
  ) {
    return await this.empresasService.updateCredenciales(
      req.user.cuenta.id,
      dto,
    );
  }

  /**
   * GET /list
   *
   * Devuelve empresas de manera paginada con opción de búsqueda.
   *
   * @param page Número de página (default: 1)
   * @param limit Cantidad de registros por página (default: 10)
   * @param search Texto opcional para filtrar por razón social o nombre fantasía
   *
   * @returns Promise<{ items: EmpresaResponseDTO[], total: number }>
   * Objeto con:
   * - items: lista de empresas
   * - total: cantidad total de registros
   */
  @Get('list')
  @ApiOperation({ summary: 'Listar empresas paginadas' })
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

  // =====Panel Admin=====

  /**
   * GET /empresas
   *
   * Obtiene todas las empresas activas (no deshabilitadas).
   *
   * @returns Promise<EmpresaResponseDTO[]>
   * Lista de empresas activas.
   */
  @Get()
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @Get(':id')
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Obtener empresa por ID (admin)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EmpresaResponseDTO> {
    return this.empresasService.findOne(id);
  }

  /**
   * DELETE /empresas/:id
   *
   * Realiza un Soft Delete de la empresa.
   * No elimina el registro físicamente, solo lo marca como deshabilitado.
   *
   * @param id ID de la empresa.
   *
   * @returns Promise<void>
   *
   * @throws NotFoundException
   * Si la empresa no existe.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolCuenta.ADMIN)
  @ApiOperation({ summary: 'Deshabilitar una empresa' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empresasService.delete(id);
  }

  /**
   * PATCH /empresas/:id/restaurar
   *
   * Restaura una empresa previamente deshabilitada.
   *
   * @param id ID de la empresa.
   *
   * @returns Promise<void>
   *
   * @throws NotFoundException
   * Si la empresa no existe.
   *
   * @throws BadRequestException
   * Si la empresa ya está activa.
   */
  @Patch(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RolCuenta.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Restaurar una empresa deshabilitada' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.empresasService.restore(id);
  }
}
