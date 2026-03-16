import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { Invitacion } from '../../Entities/invitacion.entity';
import { Contacto } from '../../Entities/contacto.entity';

@Injectable()
export class InvitacionesService {
  constructor(
    @InjectRepository(Invitacion)
    private invitacionRepo: Repository<Invitacion>,

    @InjectRepository(Contacto)
    private contactoRepo: Repository<Contacto>,
  ) {}

  // ================================
  // CREAR INVITACIONES PARA EMPRESA
  // ================================
  async crearInvitacionesEmpresa(
    correos: string[],
    empresaId: number,
    usuarioInvitadorId: number,
  ) {
    const invitaciones: Invitacion[] = [];
    const correosExistentes: string[] = [];
    const correosYaInvitados: string[] = [];

    for (const correo of correos) {

      // verificar si el usuario ya existe
      const existe = await this.contactoRepo.findOne({
        where: { correo },
      });

      if (existe) {
        correosExistentes.push(correo);
        continue;
      }

      // verificar si ya tiene invitación
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

        // si expiró → reenviar
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
        rol: 'MIEMBRO',
        expirada: false,
        fecha_expiracion: fechaExpiracion,
      });

      invitaciones.push(invitacion);
    }

    const guardadas = await this.invitacionRepo.save(invitaciones);

    return {
      invitaciones: guardadas,
      correosExistentes,
      correosYaInvitados,
    };
  }

  // ================================
  // CREAR INVITACIONES ORGANIZACION
  // ================================
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
      throw new Error(
        'No se pueden enviar más de 5 invitaciones pendientes.',
      );
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
        rol: 'MIEMBRO',
        expirada: false,
        fecha_expiracion: fechaExpiracion,
      });

      invitaciones.push(invitacion);
    }

    const guardadas = await this.invitacionRepo.save(invitaciones);

    return {
      invitaciones: guardadas,
      correosExistentes,
      correosYaInvitados,
    };
  }

  // ================================
  // LISTAR INVITACIONES EMPRESA
  // ================================
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

  // ================================
  // LISTAR INVITACIONES ORGANIZACION
  // ================================
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
}