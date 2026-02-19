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
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { EmpresasService } from './empresa.service';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { UpdateEmpresaDTO } from './dto/update_empresa.dto';
import { EmpresaResponseDTO } from './dto/response_empresa.dto';
import { UpdateCredentialsDto } from '../user/dto/panelUsuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NullableImageValidationPipe } from '../../common/pipes/mediaFilePipes';

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
  constructor(private readonly empresasService: EmpresasService) {}

  /**
   * GET /empresas
   *
   * Obtiene todas las empresas activas (no deshabilitadas).
   *
   * @returns Promise<EmpresaResponseDTO[]>
   * Lista de empresas activas.
   */
  @Get()
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

  /**
   * GET /empresas/list/paginated
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
  @Get('/list/paginated/')
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
  @Get(':id')
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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.findOne(id);
  }

  /**
   * POST /empresas
   *
   * Crea una nueva empresa en el sistema.
   *
   * @param createDto Datos necesarios para la creación.
   *
   * @returns Promise<EmpresaResponseDTO>
   * Empresa creada correctamente.
   *
   * @throws ConflictException
   * Si la empresa ya existe.
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiBody({ type: CreateEmpresaDTO })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada correctamente',
    type: EmpresaResponseDTO,
  })
  @ApiResponse({
    status: 409,
    description: 'La empresa ya existe',
  })
  async create(
    @Body() createDto: CreateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.create(createDto);
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
  @Put(':id')
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
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: 'C:/StaticResources/Solid/empresas/',
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
    @UploadedFile(new NullableImageValidationPipe())
    file?: Express.Multer.File,
    @Body() body?: any,
  ): Promise<EmpresaResponseDTO> {
    let updateDto: UpdateEmpresaDTO;

    // 🔹 Caso 1: Viene FormData (body.data existe)
    if (body?.data) {
      updateDto = JSON.parse(body.data);
    }
    // 🔹 Caso 2: Viene JSON normal
    else {
      updateDto = body;
    }

    // 🔹 Si hay imagen, agregamos el logo
    if (file) {
      updateDto.logo = `empresas/${file.filename}`;
    }

    return this.empresasService.update(id, updateDto);
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
  @ApiOperation({ summary: 'Restaurar una empresa deshabilitada' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.empresasService.restore(id);
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
  @Patch(':id/credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la empresa',
  })
  async updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return await this.empresasService.updateCredentials(id, dto);
  }
}
