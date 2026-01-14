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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';
import { ResponseUsuarioDto } from './dto/response_usuario.dto';

@ApiTags('Usuarios')
@Controller('users')
export class UsuarioController {
  constructor(private readonly userService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios activos' })
  @ApiResponse({
    status: 200,
    type: ResponseUsuarioDto,
    isArray: true,
  })
  findAll(): Promise<ResponseUsuarioDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    type: ResponseUsuarioDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseUsuarioDto> {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({
    status: 201,
    type: ResponseUsuarioDto,
  })
  create(@Body() createDto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.userService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deshabilitar un usuario' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.delete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un usuario' })
  restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.restore(id);
  }
}
