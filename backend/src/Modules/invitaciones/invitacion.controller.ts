import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Req,
  Query,
} from '@nestjs/common';
import { InvitacionesService } from './invitacion.service';
import { CreateInvitacionDto } from './dto/crear_invitacion.dto';
import { AuthRelacion } from '../auth/decoradores/auth-relacion.decorator';
import { Rol, RolSecundario } from '../user/enums/enums';
import { RequestConUsuario } from '../auth/interfaces/authenticated_request.interface';
import { Auth } from '../auth/decoradores/auth.decorador';

@Controller('invitaciones')
export class InvitacionesController {
  constructor(private readonly invitacionesService: InvitacionesService) { }

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

  @Get('empresa/:empresaId')
  @AuthRelacion(RolSecundario.GESTOR)
  getInvitacionesEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log('ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', empresaId);
    return this.invitacionesService.listarInvitacionesEmpresa(
      empresaId,
      page,
      limit,
    );
  }

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

  @Post('entidad')
  @Auth(Rol.ADMIN)
  invitarEntidad(
    @Body() dto: CreateInvitacionDto,
    @Req() req: RequestConUsuario,
  ) {
    return this.invitacionesService.invitarEntidad(
      dto.correos,
      req.user.id,
    );
  }

  @Get('entidad')
  @Auth(Rol.ADMIN)
  getInvitacionesEntidad(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.invitacionesService.listarInvitacionesEntidad(page, limit);
  }

  @Get('organizacion/:organizacionId')
  @AuthRelacion(RolSecundario.GESTOR)
  getInvitacionesOrganizacion(
    @Param('organizacionId', ParseIntPipe) organizacionId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log('ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', organizacionId);
    return this.invitacionesService.listarInvitacionesOrganizacion(
      organizacionId,
      page,
      limit,
    );
  }

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
