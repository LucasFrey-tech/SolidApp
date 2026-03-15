// invitacion.service.ts
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitacion } from '../../Entities/invitacion.entity';

@Injectable()
export class InvitacionesService {
  constructor(
    @InjectRepository(Invitacion)
    private invitacionRepo: Repository<Invitacion>,
  ) {}

  // ================================
  // INVITAR A EMPRESA
  // ================================
  async crearInvitacionesEmpresa(
    correos: string[],
    empresaId: number,
    usuarioInvitadorId: number,
  ) {
    const invitaciones: Invitacion[] = [];

    for (const correo of correos) {
      const token = randomBytes(32).toString('hex');

      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 2);

      const invitacion = this.invitacionRepo.create({
        correo,
        token,
        empresaId,
        invitadorID: usuarioInvitadorId,
        rol: 'MIEMBRO',
        fecha_expiracion: fechaExpiracion,
      });

      invitaciones.push(invitacion);
    }

    return await this.invitacionRepo.save(invitaciones);
  }

  // ================================
  // INVITAR A ORGANIZACION
  // ================================
  async crearInvitacionesOrganizacion(
    correos: string[],
    organizacionId: number,
    usuarioInvitadorId: number,
  ) {
    // validar máximo 5 pendientes
    const pendientes = await this.invitacionRepo.count({
      where: {
        organizacionId,
        usada: false,
        cancelada: false,
      },
    });

    if (pendientes + correos.length > 5) {
      throw new Error(
        'No se pueden enviar más de 5 invitaciones pendientes.',
      );
    }

    const invitaciones: Invitacion[] = [];

    for (const correo of correos) {
      const token = randomBytes(32).toString('hex');

      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 2);

      const invitacion = this.invitacionRepo.create({
        correo,
        token,
        organizacionId,
        invitadorID: usuarioInvitadorId,
        rol: 'MIEMBRO',
        fecha_expiracion: fechaExpiracion,
      });

      invitaciones.push(invitacion);
    }

    return await this.invitacionRepo.save(invitaciones);
  }

  // ================================
  // LISTAR INVITACIONES POR EMPRESA
  // ================================
  async listarInvitacionesEmpresa(
    empresaId: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const ahora = new Date();

    // cancelar invitaciones expiradas
    await this.invitacionRepo
      .createQueryBuilder()
      .update(Invitacion)
      .set({ cancelada: true })
      .where('empresaId = :empresaId', { empresaId })
      .andWhere('fecha_expiracion < :ahora', { ahora })
      .andWhere("cancelada = 0")
      .andWhere("usada = 0")
      .execute();

    const [items, total] = await this.invitacionRepo.findAndCount({
      where: { empresaId },
      order: { fecha_creacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  // ================================
  // LISTAR INVITACIONES POR ORGANIZACION
  // ================================
  async listarInvitacionesOrganizacion(
    organizacionId: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const ahora = new Date();

    // cancelar invitaciones expiradas
    await this.invitacionRepo
      .createQueryBuilder()
      .update(Invitacion)
      .set({ cancelada: true })
      .where('organizacionId = :organizacionId', { organizacionId })
      .andWhere('fecha_expiracion < :ahora', { ahora })
      .andWhere("cancelada = 0")
      .andWhere("usada = 0")
      .execute();

    const [items, total] = await this.invitacionRepo.findAndCount({
      where: { organizacionId },
      order: { fecha_creacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }
}