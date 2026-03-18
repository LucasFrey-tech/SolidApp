import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { Invitacion } from '../../Entities/invitacion.entity';
import { Contacto } from '../../Entities/contacto.entity';
import { EmpresaUsuario } from '../../Entities/empresa_usuario.entity';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';
import { EmailService } from '../email/email.service';
import { RolSecundario } from '../user/enums/enums';
@Injectable()
export class InvitacionesService {
  constructor(
    @InjectRepository(Invitacion)
    private invitacionRepo: Repository<Invitacion>,

    @InjectRepository(Contacto)
    private contactoRepo: Repository<Contacto>,
    @InjectRepository(EmpresaUsuario)
    private empresaUsuarioRepo: Repository<EmpresaUsuario>,

    @InjectRepository(OrganizacionUsuario)
    private organizacionUsuarioRepo: Repository<OrganizacionUsuario>,

    private readonly emailService: EmailService,
  ) {}

  async crearInvitacionesEmpresa(
    correos: string[],
    empresaId: number,
    usuarioInvitadorId: number,
  ) {
    const invitaciones: Invitacion[] = [];
    const correosExistentes: string[] = [];
    const correosYaInvitados: string[] = [];

    for (const correo of correos) {
      const existe = await this.contactoRepo.findOne({
        where: { correo },
      });

      if (existe) {
        correosExistentes.push(correo);
        continue;
      }

      const invitacionExistente = await this.invitacionRepo.findOne({
        where: { correo },
        order: { fecha_creacion: 'DESC' },
      });

      if (invitacionExistente && !invitacionExistente.fecha_registro) {
        const ahora = new Date();

        if (
          invitacionExistente.fecha_expiracion &&
          invitacionExistente.fecha_expiracion > ahora
        ) {
          correosYaInvitados.push(correo);
          continue;
        }

        invitacionExistente.token = randomBytes(32).toString('hex');

        const nuevaFecha = new Date();
        nuevaFecha.setDate(nuevaFecha.getDate() + 2);

        invitacionExistente.fecha_expiracion = nuevaFecha;

        invitaciones.push(invitacionExistente);
        continue;
      }

      const token = randomBytes(32).toString('hex');

      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 2);

      const invitacion = this.invitacionRepo.create({
        correo,
        token,
        empresaId,
        invitadorID: usuarioInvitadorId,
        rol: RolSecundario.MIEMBRO,
        expirada: false,
        fecha_expiracion: fechaExpiracion,
      });

      invitaciones.push(invitacion);
    }

    const guardadas = await this.invitacionRepo.save(invitaciones);

    for (const inv of guardadas) {
      await this.emailService.sendInvitationEmail(inv.correo, inv.token);
    }

    return {
      invitaciones: guardadas,
      correosExistentes,
      correosYaInvitados,
    };
  }

  async crearInvitacionesOrganizacion(
    correos: string[],
    organizacionId: number,
    usuarioInvitadorId: number,
  ) {
    const pendientes = await this.invitacionRepo.count({
      where: {
        organizacionId,
        fecha_registro: IsNull(),
        fecha_expiracion: MoreThan(new Date()),
        expirada: false,
      },
    });

    if (pendientes + correos.length > 5) {
      throw new Error('No se pueden enviar más de 5 invitaciones pendientes.');
    }

    const invitaciones: Invitacion[] = [];
    const correosExistentes: string[] = [];
    const correosYaInvitados: string[] = [];

    for (const correo of correos) {
      const existe = await this.contactoRepo.findOne({
        where: { correo },
      });

      if (existe) {
        correosExistentes.push(correo);
        continue;
      }

      const invitacionExistente = await this.invitacionRepo.findOne({
        where: { correo },
        order: { fecha_creacion: 'DESC' },
      });

      if (invitacionExistente && !invitacionExistente.fecha_registro) {
        const ahora = new Date();

        if (
          invitacionExistente.fecha_expiracion &&
          invitacionExistente.fecha_expiracion > ahora
        ) {
          correosYaInvitados.push(correo);
          continue;
        }

        invitacionExistente.token = randomBytes(32).toString('hex');

        const nuevaFecha = new Date();
        nuevaFecha.setDate(nuevaFecha.getDate() + 2);

        invitacionExistente.fecha_expiracion = nuevaFecha;

        invitaciones.push(invitacionExistente);
        continue;
      }

      const token = randomBytes(32).toString('hex');

      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 2);

      const invitacion = this.invitacionRepo.create({
        correo,
        token,
        organizacionId,
        invitadorID: usuarioInvitadorId,
        rol: RolSecundario.MIEMBRO,
        expirada: false,
        fecha_expiracion: fechaExpiracion,
      });

      invitaciones.push(invitacion);
    }

    const guardadas = await this.invitacionRepo.save(invitaciones);

    for (const inv of guardadas) {
      await this.emailService.sendInvitationEmail(inv.correo, inv.token);
    }

    return {
      invitaciones: guardadas,
      correosExistentes,
      correosYaInvitados,
    };
  }

  async listarInvitacionesEmpresa(
    empresaId: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const [items, total] = await this.invitacionRepo.findAndCount({
      where: { empresaId },
      order: { fecha_creacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const itemsConEstado = items.map((inv) => ({
      ...inv,
      estado: inv.estado,
    }));

    return { items: itemsConEstado, total };
  }

  async listarInvitacionesOrganizacion(
    organizacionId: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const [items, total] = await this.invitacionRepo.findAndCount({
      where: { organizacionId },
      order: { fecha_creacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const itemsConEstado = items.map((inv) => ({
      ...inv,
      estado: inv.estado,
    }));

    return { items: itemsConEstado, total };
  }

  async validarToken(token: string) {
    const invitacion = await this.invitacionRepo.findOne({
      where: { token },
    });

    if (!invitacion) {
      throw new Error('Invitación inválida');
    }

    if (
      invitacion.fecha_expiracion &&
      invitacion.fecha_expiracion < new Date()
    ) {
      throw new Error('Invitación expirada');
    }

    if (invitacion.expirada) {
      throw new Error('Invitación ya utilizada');
    }

    return {
      correo: invitacion.correo,
      organizacionId: invitacion.organizacionId,
      empresaId: invitacion.empresaId,
      rol: invitacion.rol,
    };
  }

  async buscarPorToken(token: string) {
    return this.invitacionRepo.findOne({
      where: { token },
    });
  }

  async agregarUsuarioAOrganizacion(usuarioId: number, organizacionId: number) {
    const relacion = this.organizacionUsuarioRepo.create({
      id_usuario: usuarioId,
      id_organizacion: organizacionId,
      rol: RolSecundario.MIEMBRO,
      activo: true,
    });

    return this.organizacionUsuarioRepo.save(relacion);
  }
  async agregarUsuarioAEmpresa(usuarioId: number, empresaId: number) {
    const relacion = this.empresaUsuarioRepo.create({
      id_usuario: usuarioId,
      id_empresa: empresaId,
      rol: RolSecundario.MIEMBRO,
      activo: true,
    });

    return this.empresaUsuarioRepo.save(relacion);
  }
  async marcarAceptada(invitacionId: number) {
    const invitacion = await this.invitacionRepo.findOne({
      where: { id: invitacionId },
    });

    if (!invitacion) return;

    invitacion.expirada = true;

    return this.invitacionRepo.save(invitacion);
  }
}
