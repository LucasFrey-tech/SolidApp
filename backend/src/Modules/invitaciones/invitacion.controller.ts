import { Controller, Post, Get, Body, Param, ParseIntPipe, Req, UseGuards, Query } from '@nestjs/common';
import { InvitacionesService } from './invitacion.service';
import { CreateInvitacionDto } from './dto/crear_invitacion.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthRelacion } from '../auth/decoradores/auth-relacion.decorator';
import { RolSecundario } from '../user/enums/enums';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';

@Controller('invitaciones')
export class InvitacionesController {
  constructor(private readonly invitacionesService: InvitacionesService) { }

  // ==============================
  // CREAR invitaciones para empresa
  // ==============================
  @Post('empresa/:empresaId')
  @AuthRelacion(RolSecundario.GESTOR)
  crearInvitacionesEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body() dto: CreateInvitacionDto,
    @Req() req: RequestConUsuario,
  ) {
    const usuarioInvitadorId = req.user.id;
    return this.invitacionesService.crearInvitacionesEmpresa(
      dto.correos,
      empresaId,
      usuarioInvitadorId,
    );
  }

  // ==============================
  // LISTAR invitaciones de empresa
  // ==============================
  @Get('empresa/:empresaId')
  @AuthRelacion(RolSecundario.GESTOR)
  getInvitacionesEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log("ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", empresaId)
    return this.invitacionesService.listarInvitacionesEmpresa(
      empresaId,
      page,
      limit,
    );
  }
  // ==============================
  // CREAR invitaciones para organización
  // ==============================
  @Post('organizacion/:organizacionId')
  @AuthRelacion(RolSecundario.GESTOR)
  crearInvitacionesOrganizacion(
    @Param('organizacionId', ParseIntPipe) organizacionId: number,
    @Body() dto: CreateInvitacionDto,
    @Req() req: RequestConUsuario,
  ) {
    const usuarioInvitadorId = req.user.id;
    return this.invitacionesService.crearInvitacionesOrganizacion(
      dto.correos,
      organizacionId,
      usuarioInvitadorId,
    );
  }

  // ==============================
  // LISTAR invitaciones de organización
  // ==============================
  @Get('organizacion/:organizacionId')
  @AuthRelacion(RolSecundario.GESTOR)
  getInvitacionesOrganizacion(
    @Param('organizacionId', ParseIntPipe) organizacionId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log("ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",organizacionId)
    return this.invitacionesService.listarInvitacionesOrganizacion(
      organizacionId,
      page,
      limit,
    );
  }
  // ==============================
  // VALIDAR TOKEN DE INVITACIÓN
  // ==============================

  @Get('validar/:token')
  async validarToken(@Param('token') token: string) {

    const invitacion = await this.invitacionesService.validarToken(token);

    return {
      valido: true,
      correo: invitacion.correo,
      empresaId: invitacion.empresaId,
      organizacionId: invitacion.organizacionId,
      rol: invitacion.rol,
    };

  }
}