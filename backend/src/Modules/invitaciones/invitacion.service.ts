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
import { Empresa } from '../../Entities/empresa.entity';
import { Organizacion } from '../../Entities/organizacion.entity';

/**
 * Servicio para gestionar las invitaciones a usuarios y entidades
 */
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

  /**
   * Crea invitaciones para usuarios a una empresa
   *
   * @param correos - Lista de correos a invitar
   * @param empresaId - ID de la empresa
   * @param usuarioInvitadorId - ID del usuario que invita
   * @returns Invitaciones creadas y listas de correos con problemas
   */
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
            empresa: { id: empresaId } as Empresa,
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

  /**
   * Crea invitaciones para usuarios a una organización
   *
   * @param correos - Lista de correos a invitar
   * @param organizacionId - ID de la organización
   * @param usuarioInvitadorId - ID del usuario que invita
   * @returns Invitaciones creadas y listas de correos con problemas
   *
   * @throws {ErrorManager} Si excede el límite de 5 invitaciones pendientes
   */
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
          organizacion: { id: organizacionId },
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
            organizacion: { id: organizacionId } as Organizacion,
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

  /**
   * Invita a una entidad (empresa u organización) a registrarse
   *
   * @param correos - Lista de correos a invitar
   * @param usuarioInvitadorId - ID del usuario que invita
   * @returns Invitaciones creadas y correos existentes
   */
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

  /**
   * Lista las invitaciones de entidades (sin empresa/organización asociada)
   *
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @returns Invitaciones paginadas
   */
  async listarInvitacionesEntidad(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: Invitacion[];
    total: number;
  }> {
    try {
      const [items, total] = await this.invitacionRepo.findAndCount({
        where: { empresa: IsNull(), organizacion: IsNull() },
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

  /**
   * Lista las invitaciones de una empresa
   *
   * @param empresaId - ID de la empresa
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @returns Invitaciones paginadas de la empresa
   */
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
        where: { empresa: { id: empresaId } },
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

  /**
   * Lista las invitaciones de una organización
   *
   * @param organizacionId - ID de la organización
   * @param page - Número de página
   * @param limit - Cantidad por página
   * @returns Invitaciones paginadas de la organización
   */
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
        where: { organizacion: { id: organizacionId } },
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

  /**
   * Valida un token de invitación para uso público
   *
   * @param token - Token de la invitación
   * @returns Datos de la invitación válida
   *
   * @throws {ErrorManager} Si el token es inválido
   * @throws {ErrorManager} Si la invitación expiró
   * @throws {ErrorManager} Si la invitación ya fue utilizada
   */
  async validarToken(token: string): Promise<{
    correo: string;
    organizacionId?: number;
    empresaId?: number;
    rol: RolSecundario;
  }> {
    try {
      const invitacion = await this.invitacionRepo.findOne({
        where: { token },
        relations: ['empresa', 'organizacion'],
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
        organizacionId: invitacion.organizacion?.id,
        empresaId: invitacion.empresa?.id,
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

  /**
   * Busca una invitación por su token
   *
   * @param token - Token de la invitación
   * @returns Invitación encontrada o null
   */
  private async buscarPorToken(token: string): Promise<Invitacion | null> {
    return this.invitacionRepo.findOne({
      where: { token },
    });
  }

  /**
   * Agrega un usuario a una organización
   *
   * @param usuarioId - ID del usuario
   * @param organizacionId - ID de la organización
   * @returns Relación creada
   */
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

  /**
   * Agrega un usuario a una empresa
   *
   * @param usuarioId - ID del usuario
   * @param empresaId - ID de la empresa
   * @returns Relación creada
   */
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

  /**
   * Marca una invitación como aceptada
   *
   * @param invitacionId - ID de la invitación
   * @param usuarioId - ID del usuario que acepta
   * @param manager - EntityManager para transacciones (opcional)
   * @returns Invitación actualizada
   *
   * @throws {ErrorManager} Si la invitación no existe
   */
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

  /**
   * Valida una invitación para el proceso de registro
   *
   * @param token - Token de la invitación
   * @param correo - Correo del usuario que acepta
   * @returns Invitación válida
   *
   * @throws {ErrorManager} Si el token es inválido
   * @throws {ErrorManager} Si el correo no coincide
   * @throws {ErrorManager} Si la invitación ya fue utilizada
   */
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

  /**
   * Procesa una invitación individual (valida existencia, expiración, etc.)
   *
   * @param correo - Correo a invitar
   * @param datos - Datos adicionales de la invitación
   * @param diasExpiracion - Días hasta expiración
   * @returns Resultado del procesamiento
   */
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
