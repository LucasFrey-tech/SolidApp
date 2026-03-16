import { Controller, Post, Get, Body, Param, ParseIntPipe, Req, UseGuards, Query } from '@nestjs/common';
import { InvitacionesService } from './invitacion.service';
import { CreateInvitacionDto } from './dto/crear_invitacion.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('invitaciones')
export class InvitacionesController {
  constructor(private readonly invitacionesService: InvitacionesService) { }

  // ==============================
  // CREAR invitaciones para empresa
  // ==============================
  @Post('empresa/:empresaId')
  @UseGuards(AuthGuard('jwt'))
  crearInvitacionesEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body() dto: CreateInvitacionDto,
    @Req() req: Request,
  ) {
    console.log(req.user);
    const usuarioInvitadorId = (req.user as any).id;
    console.log("Usuario invitador ID:", usuarioInvitadorId);
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
  getInvitacionesEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
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
  @UseGuards(AuthGuard('jwt'))
  crearInvitacionesOrganizacion(
    @Param('organizacionId', ParseIntPipe) organizacionId: number,
    @Body() dto: CreateInvitacionDto,
    @Req() req: Request,
  ) {
    console.log(req.user);
    const usuarioInvitadorId = (req.user as any).id;

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
  getInvitacionesOrganizacion(
    @Param('organizacionId', ParseIntPipe) organizacionId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.invitacionesService.listarInvitacionesOrganizacion(
      organizacionId,
      page,
      limit,
    );
  }
}