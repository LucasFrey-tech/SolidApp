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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrganizacionService } from './organizacion.service';
import { CreateOrganizacionDto } from './dto/create_organization.dto';
import { UpdateOrganizacionDto } from './dto/update_organization.dto';
import { ResponseOrganizacionDto } from './dto/response_organization.dto';
import { UpdateCredentialsDto } from '../usuario/dto/panelUsuario.dto';
import { AuthService } from '../PRUEBA REFACTOR/auth.service';

@ApiTags('Organizaciones')
@Controller('organizacion')
export class OrganizacionController {
  constructor(
    private readonly organizacionService: OrganizacionService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar organizaciones activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de organizaciones',
    type: ResponseOrganizacionDto,
    isArray: true,
  })
  async findAll(): Promise<ResponseOrganizacionDto[]> {
    return await this.organizacionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Organización encontrada',
    type: ResponseOrganizacionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseOrganizacionDto> {
    return await this.organizacionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una organización' })
  @ApiResponse({
    status: 201,
    description: 'Organización creada correctamente',
    type: ResponseOrganizacionDto,
  })
  @ApiResponse({
    status: 409,
    description: 'La organización ya existe (email o CUIT duplicado)',
  })
  async create(@Body() createDto: CreateOrganizacionDto) {
    await this.authService.register({
      tipo: 'organizacion',
      datos: createDto,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una organización' })
  @ApiResponse({
    status: 200,
    description: 'Organización actualizada correctamente',
    type: ResponseOrganizacionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    return await this.organizacionService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deshabilitar una organización (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Organización deshabilitada',
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.organizacionService.delete(id);
  }

  @Patch(':id/restaurar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restaurar una organización deshabilitada' })
  @ApiResponse({
    status: 204,
    description: 'Organización restaurada',
  })
  @ApiResponse({
    status: 400,
    description: 'La organización ya está activa',
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.organizacionService.restore(id);
  }

  @Patch(':id/credenciales')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña de la organización',
  })
  @ApiResponse({
    status: 200,
    description: 'Credenciales actualizadas correctamente',
    type: ResponseOrganizacionDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Contraseña actual incorrecta',
  })
  @ApiResponse({
    status: 404,
    description: 'Organización no encontrada',
  })
  async updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return await this.organizacionService.updateCredentials(id, dto);
  }
}
