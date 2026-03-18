import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestConUsuario, UsuarioAutenticado } from '../interfaces/authenticated_request.interface';
import { InvitacionesService } from '../../invitaciones/invitacion.service';


@Injectable()
export class RelacionGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest<RequestConUsuario>();
  const usuario = request.user;

  console.log('USER COMPLETO:', usuario);
  console.log('CLAVES DEL USER:', Object.keys(usuario));
  console.log('empresaUsuario:', usuario.empresaUsuario);
  console.log('organizacionUsuario:', usuario.organizacionUsuario);

  if (!usuario) {
    throw new ForbiddenException('Usuario no autenticado');
  }

  const emp = usuario.empresaUsuario?.[0];

if (emp) {
  request.relacion = {
    rol: emp.rol,
    tipo: 'empresa',
    entidadId: emp.id_empresa,
  };
  return true;
}

const org = usuario.organizacionUsuario?.[0];

if (org) {
  request.relacion = {
    rol: org.rol,
    tipo: 'organizacion',
    entidadId: org.id_organizacion,
  };
  return true;
}

  throw new ForbiddenException('El usuario no pertenece a ninguna entidad');
}
}