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
  Req,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { EmpresaService } from './empresa.service';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { NullableImageValidationPipe } from '../../common/pipes/mediaFilePipes';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { Rol } from '../../Entities/usuario.entity';
import { PaginatedBeneficiosResponseDTO } from '../benefit/dto/response_paginated_beneficios';
import { UpdateBeneficiosDTO } from '../benefit/dto/update_beneficios.dto';
import { CreateBeneficiosDTO } from '../benefit/dto/create_beneficios.dto';
import { Auth, Public } from '../auth/decoradores/auth.decorador';

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
  constructor(private readonly empresasService: EmpresaService) {}

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
  @Public()
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
    @Query('enabled') enabled: boolean,
  ) {
    return await this.empresasService.findPaginated(
      page,
      limit,
      search,
      enabled,
    );
  }

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
  @Auth(Rol.GESTOR)
  @Get('perfil')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
    type: EmpresaResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada',
  })
  async getDatosEmpresa(
    @Req() req: RequestConUsuario,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.getEmpresaByUsuario(req.user.id);
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
  @Auth(Rol.GESTOR)
  @Patch('perfil')
  @ApiOperation({ summary: 'Actualizar una empresa' })
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

    return this.empresasService.update(req.user.id, updateDto ?? {});
  }

  @Auth(Rol.GESTOR)
  @Get('cupones')
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
    return this.empresasService.getCupones(req.user.id, page, limit);
  }

  @Auth(Rol.GESTOR)
  @Post('cupones')
  async createCupon(
    @Req() req: RequestConUsuario,
    @Body() dto: CreateBeneficiosDTO,
  ) {
    return await this.empresasService.createCupon(req.user.id, dto);
  }

  @Auth(Rol.GESTOR)
  @Patch('cupones/:cuponId')
  async updateCupon(
    @Param('cuponId', ParseIntPipe) cuponId: number,
    @Body() dto: UpdateBeneficiosDTO,
  ) {
    return await this.empresasService.updateCupon(cuponId, dto);
  }

  // =====Panel Admin=====

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
  @Auth(Rol.ADMIN)
  @Delete(':id/borrar')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @Auth(Rol.ADMIN)
  @Patch(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restaurar una empresa deshabilitada' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.empresasService.restore(id);
  }
}
