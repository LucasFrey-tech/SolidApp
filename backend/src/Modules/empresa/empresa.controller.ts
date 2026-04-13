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

import { PaginatedBeneficiosResponseDTO } from '../benefit/dto/response_paginated_beneficios';
import { UpdateBeneficiosDTO } from '../benefit/dto/update_beneficios.dto';
import { CreateBeneficiosDTO } from '../benefit/dto/create_beneficios.dto';
import { Auth, Public } from '../auth/decoradores/auth.decorador';
import { CreateEmpresaDTO } from './dto/create_empresa.dto';
import { Rol, RolSecundario } from '../user/enums/enums';
import { AuthRelacion } from '../auth/decoradores/auth-relacion.decorator';
import { BeneficiosResponseDTO } from '../benefit/dto/response_beneficios.dto';

@ApiTags('Empresas')
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresasService: EmpresaService) {}

  @Get('empresas')
  @Public()
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
  ): Promise<{ items: EmpresaResponseDTO[]; total: number }> {
    return await this.empresasService.findPaginated(
      page,
      limit,
      search,
      enabled,
    );
  }

  // =====Panel Organizacion=====

  @Get('perfil')
  @Auth(Rol.COLABORADOR)
  @AuthRelacion(RolSecundario.GESTOR, RolSecundario.MIEMBRO)
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

  @Post('empresas')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nueva empresa con su colaborador' })
  @ApiBody({ type: CreateEmpresaDTO })
  @ApiResponse({
    status: 201,
    description: 'Empresa y colaborador creados',
    type: EmpresaResponseDTO,
  })
  @ApiResponse({ status: 409, description: 'CUIT o correo ya registrado' })
  async registrarEmpresa(
    @Body() dto: CreateEmpresaDTO,
  ): Promise<EmpresaResponseDTO> {
    return this.empresasService.registrarEmpresa(dto);
  }

  @Patch('perfil')
  @Auth(Rol.COLABORADOR)
  @AuthRelacion(RolSecundario.GESTOR)
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

  @Get('cupones')
  @Auth(Rol.COLABORADOR)
  @AuthRelacion(RolSecundario.GESTOR, RolSecundario.MIEMBRO)
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

  @Post('cupones')
  @Auth(Rol.COLABORADOR)
  @AuthRelacion(RolSecundario.GESTOR, RolSecundario.MIEMBRO)
  async createCupon(
    @Req() req: RequestConUsuario,
    @Body() dto: CreateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return await this.empresasService.createCupon(req.user.id, dto);
  }

  @Patch('cupones/:cuponId')
  @Auth(Rol.COLABORADOR)
  @AuthRelacion(RolSecundario.GESTOR, RolSecundario.MIEMBRO)
  async updateCupon(
    @Param('cuponId', ParseIntPipe) cuponId: number,
    @Body() dto: UpdateBeneficiosDTO,
    @Req() req: RequestConUsuario,
  ): Promise<BeneficiosResponseDTO> {
    return await this.empresasService.updateCupon(cuponId, dto, req.user.id);
  }

  // =====Panel Admin=====

  @Delete('empresas/:id')
  @Auth(Rol.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deshabilitar una empresa' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empresasService.delete(id);
  }

  @Patch('empresas/:id')
  @Auth(Rol.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restaurar una empresa deshabilitada' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.empresasService.restore(id);
  }
}
