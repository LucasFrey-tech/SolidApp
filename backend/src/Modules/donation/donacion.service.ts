import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Donaciones } from '../../Entities/donacion.entity';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { CreateDonationDto } from './dto/create_donation.dto';
import { ResponseDonationDto } from './dto/response_donation.dto';
import { RankingService } from '../ranking/ranking.service';
import { DonacionEstado } from './enum';
import { PaginatedOrganizationDonationsResponseDto } from './dto/response_donation_paginatedByOrganizacion.dto';
import { OrganizationDonationItemDto } from './dto/organization_donation_item.dto';
import { UpdateDonacionEstadoDto } from './dto/update_donation_estado.dto';
import { PaginatedUserDonationsResponseDto } from './dto/response_donation_paginatedByUser.dto';
import { UserDonationItemDto } from './dto/usuario_donation_item.dto';
import { CampaignEstado } from '../campaign/enum';
import { ErrorManager } from '../../common/errors/error.manager';

/**
 * Servicio que maneja la lógica de negocio para las Donaciones.
 */
@Injectable()
export class DonacionService {
  private readonly logger = new Logger(DonacionService.name);

  constructor(
    @InjectRepository(Donaciones)
    private readonly donacionRepository: Repository<Donaciones>,

    @InjectRepository(Campaigns)
    private readonly campaignsRepository: Repository<Campaigns>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly rankingService: RankingService,
  ) {}

  /**
   * Obtiene
   *
   * @param organizacionId
   * @param page
   * @param limit
   * @returns
   */
  async findAllPaginatedByOrganizacion(
    organizacionId: number,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedOrganizationDonationsResponseDto> {
    try {
      const startIndex = (page - 1) * limit;

      const query = this.donacionRepository
        .createQueryBuilder('donacion')
        .leftJoinAndSelect('donacion.campaña', 'campaña')
        .leftJoinAndSelect('campaña.organizacion', 'organizacion')
        .leftJoinAndSelect('donacion.usuario', 'usuario')
        .leftJoinAndSelect('usuario.contacto', 'contacto')
        .where('organizacion.id = :organizacionId', { organizacionId });

      if (search) {
        query.andWhere('LOWER(contacto.correo) LIKE LOWER(:search)', {
          search: `%${search}%`,
        });
      }

      query
        .orderBy('donacion.estado', 'ASC')
        .addOrderBy('donacion.fecha_registro', 'DESC')
        .skip(startIndex)
        .take(limit);

      const [donations, total] = await query.getManyAndCount();

      return {
        items: donations.map((d) => this.mapToOrganizationDonationsResponse(d)),
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
   * Obtiene
   *
   * @param userId
   * @param page
   * @param limit
   * @returns
   */
  async findAllPaginatedByUser(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedUserDonationsResponseDto> {
    try {
      const startIndex = (page - 1) * limit;
      const [donations, total] = await this.donacionRepository.findAndCount({
        where: {
          usuario: { id: userId },
        },
        relations: ['campaña', 'campaña.organizacion'],
        order: {
          estado: 'ASC',
          fecha_registro: 'DESC',
        },
        skip: startIndex,
        take: limit,
      });

      return {
        items: donations.map((d) => this.mapToUserDonationResponse(d)),
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
   * Crear una Donación
   */
  async create(
    usuarioId: number,
    createDto: CreateDonationDto,
  ): Promise<ResponseDonationDto> {
    try {
      const campaign = await this.campaignsRepository.findOne({
        where: { id: createDto.campaignId },
      });

      if (!campaign) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Campaña no encontrada',
        });
      }

      if (createDto.cantidad > campaign.objetivo) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `La cantidad no puede superar el objetivo de la campaña (${campaign.objetivo})`,
        });
      }

      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId, habilitado: true },
      });

      if (!usuario) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Usuario no encontrado',
        });
      }

      const cantidadFinal = Math.min(createDto.cantidad, campaign.objetivo);

      const puntosFinales = cantidadFinal * campaign.puntos;

      const donation = this.donacionRepository.create({
        titulo: `Donación Solidaria de ${usuario.nombre} ${usuario.apellido}`,
        detalle: createDto.detalle,
        cantidad: cantidadFinal,
        usuario: usuario,
        campaña: campaign,
        estado: DonacionEstado.PENDIENTE,
        puntos: puntosFinales,
        creado_por: { id: usuarioId },
      });

      const savedDonation = await this.donacionRepository.save(donation);

      this.logger.log(
        `Donación ${savedDonation.id} creada | Usuario ${usuario.id} +${createDto.cantidad} puntos`,
      );

      return this.mapToResponseDto(savedDonation);
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

  async confirmarDonacion(
    id: number,
    dto: UpdateDonacionEstadoDto,
    gestorId: number,
  ): Promise<ResponseDonationDto> {
    try {
      return await this.donacionRepository.manager.transaction(
        async (manager) => {
          const donacion = await manager.findOne(Donaciones, {
            where: { id: id },
            relations: ['usuario', 'campaña'],
          });

          if (!donacion) {
            throw new ErrorManager({
              type: 'NOT_FOUND',
              message: 'Donación no encontrada',
            });
          }

          this.validarTransicion(donacion.estado, dto.estado);

          if (
            donacion.estado === DonacionEstado.RECHAZADA &&
            dto.estado === DonacionEstado.APROBADA
          ) {
            if (!donacion.fecha_rechazo) {
              throw new ErrorManager({
                type: 'BAD_REQUEST',
                message: 'La donación no tiene fecha de rechazo',
              });
            }
            this.validarVentanaReversion(donacion.fecha_rechazo);
          }

          if (dto.estado === DonacionEstado.APROBADA) {
            donacion.aprobado_por = { id: gestorId } as Usuario;
            donacion.fecha_aprobacion = new Date();

            this.logger.log(
              `Donación ${id} aprobada por colaborador ${gestorId}`,
            );
          } else if (dto.estado === DonacionEstado.RECHAZADA) {
            donacion.rechazado_por = { id: gestorId } as Usuario;
            donacion.fecha_rechazo = new Date();
            donacion.motivo_rechazo = dto.motivo ?? '';

            donacion.aprobado_por = undefined;
            donacion.fecha_aprobacion = undefined;

            this.logger.log(
              `Donación ${id} rechazada por colaborador ${gestorId} - Motivo: ${dto.motivo}`,
            );
          }

          await this.aplicarEfectosDeEstado(manager, donacion, dto.estado);

          donacion.estado = dto.estado;

          await manager.save(donacion);

          return this.mapToResponseDto(donacion);
        },
      );
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

  private validarTransicion(
    estadoActual: DonacionEstado,
    nuevoEstado: DonacionEstado,
  ): void {
    if (estadoActual === nuevoEstado) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'La donación ya tiene ese estado',
      });
    }

    const transicionesValidas: Record<DonacionEstado, DonacionEstado[]> = {
      [DonacionEstado.PENDIENTE]: [
        DonacionEstado.APROBADA,
        DonacionEstado.RECHAZADA,
      ],
      [DonacionEstado.RECHAZADA]: [DonacionEstado.APROBADA],
      [DonacionEstado.APROBADA]: [],
    };

    const transicionesPermitidas = transicionesValidas[estadoActual];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'Transición de estado no válida',
      });
    }
  }

  private validarVentanaReversion(fechaEstado: Date): void {
    const REVERSAL_WINDOWS_HOURS = 48;

    const ahora = new Date();
    const diffHoras =
      (ahora.getTime() - fechaEstado.getTime()) / (1000 * 60 * 60);

    if (diffHoras > REVERSAL_WINDOWS_HOURS) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'El plazo para revertir la donación ha expirado',
      });
    }
  }

  private async aplicarEfectosDeEstado(
    manager: EntityManager,
    donacion: Donaciones,
    nuevoEstado: DonacionEstado,
  ): Promise<Campaigns | null> {
    if (nuevoEstado !== DonacionEstado.APROBADA) return null;

    const usuario = donacion.usuario;
    usuario.puntos += donacion.puntos;
    await manager.save(usuario);

    await this.rankingService.ajustarPuntos(
      usuario.id,
      donacion.puntos,
      manager,
    );

    const campaign = await manager.findOne(Campaigns, {
      where: { id: donacion.campaña.id },
    });

    if (!campaign) {
      throw new ErrorManager({
        type: 'NOT_FOUND',
        message: 'Campaña asociada no encontrada',
      });
    }

    campaign.objetivo -= donacion.cantidad;

    if (campaign.objetivo <= 0) {
      campaign.objetivo = 0;
      campaign.estado = CampaignEstado.FINALIZADA;
    }

    return await manager.save(campaign);
  }

  private readonly mapToResponseDto = (
    donation: Donaciones,
  ): ResponseDonationDto => ({
    id: donation.id,
    titulo: donation.titulo,
    detalle: donation.detalle,
    tipo: donation.tipo,
    cantidad: donation.cantidad,
    estado: donation.estado,
    puntos: donation.puntos,
    fecha_registro: donation.fecha_registro,
    campaignId: donation.campaña?.id,
    userId: donation.usuario?.id,
    imagen: '',
  });

  private mapToOrganizationDonationsResponse(
    donation: Donaciones,
  ): OrganizationDonationItemDto {
    if (!donation.usuario) {
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'La donación no tiene usuario asociado',
      });
    }

    if (!donation.campaña) {
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'La donación no tiene campaña asociada',
      });
    }

    return {
      id: donation.id,
      puntos: donation.puntos,
      descripcion: donation.detalle,
      estado: donation.estado,
      userId: donation.usuario.id,
      correo: donation.usuario.contacto.correo,
      campaignId: donation.campaña.id,
      campaignTitulo: donation.campaña.titulo,
      cantidad: donation.cantidad,

      creado_por: donation.creado_por
        ? {
            id: donation.creado_por.id,
            nombre: donation.creado_por.nombre,
            apellido: donation.creado_por.apellido,
          }
        : undefined,

      aprobado_por: donation.aprobado_por
        ? {
            id: donation.aprobado_por.id,
            nombre: donation.aprobado_por.nombre,
            apellido: donation.aprobado_por.apellido,
          }
        : undefined,

      fecha_aprobacion: donation.fecha_aprobacion,

      rechazado_por: donation.rechazado_por
        ? {
            id: donation.rechazado_por.id,
            nombre: donation.rechazado_por.nombre,
            apellido: donation.rechazado_por.apellido,
          }
        : undefined,

      fecha_rechazo: donation.fecha_rechazo,
      motivo_rechazo: donation.motivo_rechazo ?? undefined,
    };
  }

  private mapToUserDonationResponse(donation: Donaciones): UserDonationItemDto {
    if (!donation.campaña) {
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'La donación no tiene campaña asociada',
      });
    }

    return {
      id: donation.id,
      detalle: donation.detalle,
      cantidad: donation.cantidad,
      puntos: donation.puntos,
      estado: donation.estado,
      fecha_registro: donation.fecha_registro,
      nombre_organizacion: donation.campaña.organizacion.nombre_organizacion,
      calle: donation.campaña.organizacion.direccion.calle,
      numero: donation.campaña.organizacion.direccion.numero,
      organizacionId: donation.campaña.organizacion.id,
      titulo_campaña: donation.campaña.titulo,
      motivo_rechazo: donation.motivo_rechazo || '',
      fecha_aprobacion: donation.fecha_aprobacion,
      fecha_rechazo: donation.fecha_rechazo,
    };
  }
}
