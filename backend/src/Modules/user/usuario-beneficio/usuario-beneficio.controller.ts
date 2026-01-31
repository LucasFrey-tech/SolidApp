import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuarioBeneficioService } from './usuario-beneficio.service';

@Controller('usuarios-beneficios')
export class UsuarioBeneficioController {
  constructor(
    private readonly usuarioBeneficioService: UsuarioBeneficioService,
  ) {}

  /* ===============================
     LISTAR CUPONES DEL USUARIO
  ================================ */
  @Get('usuario/:usuarioId')
  getByUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.usuarioBeneficioService.getByUsuario(usuarioId);
  }

  /* ===============================
     ASIGNAR / RECLAMAR CUPÓN
  ================================ */
  @Post('usuario/:usuarioId/beneficio/:beneficioId')
  reclamarBeneficio(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('beneficioId', ParseIntPipe) beneficioId: number,
  ) {
    return this.usuarioBeneficioService.reclamarBeneficio(
      usuarioId,
      beneficioId,
    );
  }

  /* ===============================
     USAR CUPÓN
  ================================ */
  @Post(':id/usar')
  usarBeneficio(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuarioBeneficioService.usarBeneficio(id);
  }
}
