import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCredentialsDto } from './dto/panelUsuario.dto';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { AuthService } from '../PRUEBA REFACTOR/auth.service';

@ApiTags('Usuarios')
@Controller('users')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios activos' })
  @ApiResponse({
    status: 200,
    type: ResponseUsuarioDto,
    isArray: true,
  })
  async findAll(): Promise<ResponseUsuarioDto[]> {
    return await this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    type: ResponseUsuarioDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseUsuarioDto> {
    return await this.usuarioService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    type: ResponseUsuarioDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya existe (email o documento duplicado)',
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDto: CreateUsuarioDto,
    //@UploadedFile(new ImageValidationPipe()) file: File,
  ) {
    await this.authService.register({
      tipo: 'usuario',
      datos: createDto,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUsuarioDto,
    //@UploadedFile(new NullableImageValidationPipe()) file: File,
  ): Promise<ResponseUsuarioDto> {
    return await this.usuarioService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deshabilitar un usuario' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.usuarioService.delete(id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar un usuario' })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.usuarioService.restore(id);
  }

  @Patch(':id/credentials')
  @ApiOperation({
    summary: 'Actualizar correo y/o contraseña del usuario',
  })
  async updateCredentials(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return await this.usuarioService.updateCredentials(id, dto);
  }
}
