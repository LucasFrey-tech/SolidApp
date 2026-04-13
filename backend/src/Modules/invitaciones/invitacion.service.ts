import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan, EntityManager } from 'typeorm';
import { Invitacion } from '../../Entities/invitacion.entity';
import { Contacto } from '../../Entities/contacto.entity';
import { EmpresaUsuario } from '../../Entities/empresa_usuario.entity';
import { OrganizacionUsuario } from '../../Entities/organizacion_usuario.entity';
import { EmailService } from '../email/email.service';
import { RolSecundario } from '../user/enums/enums';
import { ErrorManager } from '../../common/errors/error.manager';
import { ResultadoProcesamiento } from './type/resultadoProcesamiento';

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
  ): Promise<{
    invitaciones: Invitacion[];
    correosExistentes: string[];
    correosYaInvitados: string[];
  }> {
    try {
      const invitaciones: Invitacion[] = [];
      const correosExistentes: string[] = [];
      const correosYaInvitados: string[] = [];

      for (const correo of correos) {
        const resultado = await this.procesarInvitacion(
          correo,
          {
            empresaId,
            invitadorID: usuarioInvitadorId,
            rol: RolSecundario.MIEMBRO,
          },
          2,
        );

        if (resultado.tipo === 'CORREO_EXISTENTE') {
          correosExistentes.push(correo);
        } else if (resultado.tipo === 'YA_INVITADO') {
          correosYaInvitados.push(correo);
        } else {
          invitaciones.push(resultado.invitacion);
        }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async crearInvitacionesOrganizacion(
    correos: string[],
    organizacionId: number,
    usuarioInvitadorId: number,
  ): Promise<{
    invitaciones: Invitacion[];
    correosExistentes: string[];
    correosYaInvitados: string[];
  }> {
    try {
      const pendientes = await this.invitacionRepo.count({
        where: {
          organizacionId,
          fecha_expiracion: MoreThan(new Date()),
          expirada: false,
        },
      });

      if (pendientes + correos.length > 5) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pueden enviar más de 5 invitaciones pendientes',
        });
      }

      const invitaciones: Invitacion[] = [];
      const correosExistentes: string[] = [];
      const correosYaInvitados: string[] = [];

      for (const correo of correos) {
        const resultado = await this.procesarInvitacion(
          correo,
          {
            organizacionId,
            invitadorID: usuarioInvitadorId,
            rol: RolSecundario.MIEMBRO,
          },
          2,
        );

        if (resultado.tipo === 'CORREO_EXISTENTE') {
          correosExistentes.push(correo);
        } else if (resultado.tipo === 'YA_INVITADO') {
          correosYaInvitados.push(correo);
        } else {
          invitaciones.push(resultado.invitacion);
        }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async invitarEntidad(
    correos: string[],
    usuarioInvitadorId: number,
  ): Promise<{ invitaciones: Invitacion[]; correosExistentes: string[] }> {
    try {
      const correosExistentes: string[] = [];
      const invitaciones: Invitacion[] = [];

      for (const correo of correos) {
        const existe = await this.contactoRepo.findOne({ where: { correo } });

        if (existe) {
          correosExistentes.push(correo);
          continue;
        }

        const token = randomBytes(32).toString('hex');
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        const invitacion = this.invitacionRepo.create({
          correo,
          token,
          invitadorID: usuarioInvitadorId,
          rol: RolSecundario.ENTIDAD,
          expirada: false,
          fecha_expiracion: fechaExpiracion,
        });

        invitaciones.push(invitacion);
      }

      const guardadas = await this.invitacionRepo.save(invitaciones);

      for (const inv of guardadas) {
        await this.emailService.sendEntidadInvitationEmail(
          inv.correo,
          inv.token,
        );
      }

      return { invitaciones: guardadas, correosExistentes };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async listarInvitacionesEntidad(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: Invitacion[];
    total: number;
  }> {
    try {
      const [items, total] = await this.invitacionRepo.findAndCount({
        where: { empresaId: IsNull(), organizacionId: IsNull() },
        order: { fecha_creacion: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        items: items.map((inv) => ({ ...inv, estado: inv.estado })),
        total,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async listarInvitacionesEmpresa(
    empresaId: number,
    page: number = 1,
    limit: number = 5,
  ): Promise<{
    items: Invitacion[];
    total: number;
  }> {
    try {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async listarInvitacionesOrganizacion(
    organizacionId: number,
    page: number = 1,
    limit: number = 5,
  ): Promise<{
    items: Invitacion[];
    total: number;
  }> {
    try {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async validarToken(token: string): Promise<{
    correo: string;
    organizacionId?: number;
    empresaId?: number;
    rol: RolSecundario;
  }> {
    try {
      const invitacion = await this.invitacionRepo.findOne({
        where: { token },
      });

      if (!invitacion) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Invitación inválida',
        });
      }

      if (
        invitacion.fecha_expiracion &&
        invitacion.fecha_expiracion < new Date()
      ) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Invitación expirada',
        });
      }

      if (invitacion.expirada) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Invitación ya utilizada',
        });
      }

      return {
        correo: invitacion.correo,
        organizacionId: invitacion.organizacionId,
        empresaId: invitacion.empresaId,
        rol: invitacion.rol,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  private async buscarPorToken(token: string): Promise<Invitacion | null> {
    return this.invitacionRepo.findOne({
      where: { token },
    });
  }

  async agregarUsuarioAOrganizacion(
    usuarioId: number,
    organizacionId: number,
  ): Promise<OrganizacionUsuario> {
    try {
      const relacion = this.organizacionUsuarioRepo.create({
        usuario: { id: usuarioId },
        organizacion: { id: organizacionId },
        rol: RolSecundario.MIEMBRO,
        activo: true,
      });

      return this.organizacionUsuarioRepo.save(relacion);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async agregarUsuarioAEmpresa(
    usuarioId: number,
    empresaId: number,
  ): Promise<EmpresaUsuario> {
    try {
      const relacion = this.empresaUsuarioRepo.create({
        usuario: { id: usuarioId },
        empresa: { id: empresaId },
        rol: RolSecundario.MIEMBRO,
        activo: true,
      });

      return this.empresaUsuarioRepo.save(relacion);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async marcarAceptada(
    invitacionId: number,
    usuarioId: number,
    manager?: EntityManager,
  ): Promise<Invitacion> {
    try {
      const repo = manager
        ? manager.getRepository(Invitacion)
        : this.invitacionRepo;

      const invitacion = await repo.findOne({
        where: { id: invitacionId },
      });

      if (!invitacion) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Invitación no encontrada',
        });
      }

      invitacion.usuarioId = usuarioId;
      invitacion.expirada = true;

      return repo.save(invitacion);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error desconocido',
      });
    }
  }

  async validarInvitacion(token: string, correo: string): Promise<Invitacion> {
    const invitacion = await this.buscarPorToken(token);

    if (!invitacion) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'Invitación inválida',
      });
    }

    if (invitacion.correo !== correo) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'El correo no coincide con la invitación',
      });
    }

    if (invitacion.expirada) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'La invitación ya fue utilizada',
      });
    }

    return invitacion;
  }

  private async procesarInvitacion(
    correo: string,
    datos: Partial<Invitacion>,
    diasExpiracion: number,
  ): Promise<ResultadoProcesamiento> {
    const existe = await this.contactoRepo.findOne({
      where: { correo },
    });

    if (existe) return { tipo: 'CORREO_EXISTENTE' };

    const invitacionExistente = await this.invitacionRepo.findOne({
      where: { correo },
      order: { fecha_creacion: 'DESC' },
    });

    if (invitacionExistente && !invitacionExistente.expirada) {
      const ahora = new Date();

      if (
        invitacionExistente.fecha_expiracion &&
        invitacionExistente.fecha_expiracion > ahora
      ) {
        return { tipo: 'YA_INVITADO' };
      }

      invitacionExistente.token = randomBytes(32).toString('hex');
      const nuevaFecha = new Date();
      nuevaFecha.setDate(nuevaFecha.getDate() + diasExpiracion);
      invitacionExistente.fecha_expiracion = nuevaFecha;

      return { tipo: 'INVITACION', invitacion: invitacionExistente };
    }

    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + diasExpiracion);

    return {
      tipo: 'INVITACION',
      invitacion: this.invitacionRepo.create({
        correo,
        token: randomBytes(32).toString('hex'),
        expirada: false,
        fecha_expiracion: fechaExpiracion,
        ...datos,
      }),
    };
  }
}
