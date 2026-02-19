import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Donations } from '../../Entities/donations.entity';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { Donation_images } from '../../Entities/donation_images.entity';
import { DonacionImagenDTO } from './dto/lista_donacion_imagen.dto';
import { CreateDonationDto } from './dto/create_donation.dto';
import { ResponseDonationDto } from './dto/response_donation.dto';
import { RankingService } from '../ranking/ranking.service';
import { DonacionEstado } from './enum';
import { PaginatedDonationsResponseDto } from './dto/response_donation_paginatedByOrganizacion.dto';
import { OrganizationDonationItemDto } from './dto/donation_item.dto';

/**
 * Servicio que maneja la lógica de negocio para las Donaciones.
 */
@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donations)
    private readonly donationsRepository: Repository<Donations>,

    @InjectRepository(Campaigns)
    private readonly campaignsRepository: Repository<Campaigns>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Donation_images)
    private readonly donationImagenRepository: Repository<Donation_images>,

    private readonly rankingService: RankingService,
  ) {}

  /**
   * Obtiene todas las Donaciones disponibles.
   *
   * @returns {Promise<ResponseDonationDto[]>} Lista de todas las Donaciones activas
   */
  async findAll(): Promise<ResponseDonationDto[]> {
    const donations = await this.donationsRepository.find({
      relations: ['campaña', 'usuario'],
    });

    this.logger.log(`Se obtuvieron ${donations.length} Donaciones`);
    return donations.map(this.mapToResponseDto);
  }

  /**
   * Obtiene la imagen de las Donaciones.
   *
   * @returns {Promise<DonacionImagenDTO[]>} Lista de las Imágenes de las Donaciones
   */
  async findIMG(): Promise<DonacionImagenDTO[]> {
    const images = await this.donationImagenRepository.find({
      relations: ['id_donacion'],
    });

    this.logger.log(
      `Se obtuvieron ${images.length} imagenes de las donaciones`,
    );

    return images.map((img) => ({
      id_donacion: img.id_donacion.id,
      nombre: img.id_donacion.campaña.titulo,
      logo: img.imagen,
    }));
  }

  /**
   * Busca una Donacion específica por ID.
   *
   * @param {number} id - ID de la Donación a buscar
   * @returns {Promise<ResponseDonationDto>} DTO de la Donación encontrada
   * @throws {NotFoundException} cuando no encuentra ninguna Donación con el ID específico
   */
  async findOne(id: number): Promise<ResponseDonationDto> {
    const donation = await this.donationsRepository.findOne({
      where: { id },
      relations: ['campaña', 'usuario'],
    });

    if (!donation) {
      throw new NotFoundException(`Donación con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(donation);
  }

  /**
   * Obtiene todas las Donaciones paginadas.
   *
   * @param {number} page - Página solicitada
   * @param {number} limit - Cantidad de Donaciones por página
   * @returns Lsita de Donaciones paginadas
   */
  async findAllPaginated(
    page = 1,
    limit = 6,
  ): Promise<{
    data: ResponseDonationDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [donations, total] = await this.donationsRepository.findAndCount({
      relations: ['campaña', 'usuario'],
      order: { fecha_registro: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    this.logger.log(
      `Se obtuvieron ${donations.length} donaciones (page ${page})`,
    );

    return {
      data: donations.map(this.mapToResponseDto),
      total,
      page,
      limit,
    };
  }

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
  ): Promise<PaginatedDonationsResponseDto> {
    const startIndex = (page - 1) * limit;
    const [donations, total] = await this.donationsRepository.findAndCount({
      where: {
        campaña: {
          organizacion: { id: organizacionId },
        },
      },
      relations: { campaña: true, usuario: true },
      order: { fecha_registro: 'DESC' },
      skip: startIndex,
      take: limit,
    });

    return {
      items: donations.map((d) => this.mapToDonationsResponse(d)),
      total,
    };
  }

  /**
   * Crear una Donación
   */
  async create(createDto: CreateDonationDto): Promise<ResponseDonationDto> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: createDto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: createDto.userId, deshabilitado: false },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear donación
    const donation = this.donationsRepository.create({
      titulo: `Donación Solidaria de ${usuario.nombre} ${usuario.apellido}`,
      detalle: createDto.detalle,
      cantidad: createDto.cantidad,
      usuario: usuario,
      campaña: campaign,
      estado: DonacionEstado.PENDIENTE,
      puntos: createDto.puntos,
      fecha_estado: new Date(),
    });

    const savedDonation = await this.donationsRepository.save(donation);

    await this.usuarioRepository.save(usuario);

    this.logger.log(
      `Donación ${savedDonation.id} creada | Usuario ${usuario.id} +${createDto.cantidad} puntos`,
    );

    return this.mapToResponseDto(savedDonation);
  }

  async confirmarDonacion(
    id: number,
    nuevoEstado: DonacionEstado,
    motivo?: string,
  ): Promise<ResponseDonationDto> {
    return await this.donationsRepository.manager.transaction(
      async (manager) => {
        const donacion = await manager.findOne(Donations, {
          where: { id: id },
          relations: ['usuario'],
        });

        if (!donacion) {
          throw new NotFoundException('Donación no encontrada');
        }

        this.validarTransicion(donacion.estado, nuevoEstado);

        if (
          donacion.estado === DonacionEstado.RECHAZADA &&
          nuevoEstado === DonacionEstado.APROBADA
        ) {
          this.validarVentanaReversion(donacion.fecha_estado);
        }

        await this.aplicarEfectosDeEstado(manager, donacion, nuevoEstado);

        donacion.estado = nuevoEstado;
        donacion.fecha_estado = new Date();
        donacion.motivo_rechazo = motivo ?? '';

        await manager.save(donacion);

        return this.mapToResponseDto(donacion);
      },
    );
  }

  private validarTransicion(
    estadoActual: DonacionEstado,
    nuevoEstado: DonacionEstado,
  ) {
    if (estadoActual === nuevoEstado) {
      throw new BadRequestException('La donación ya tiene ese estado');
    }

    if (estadoActual === DonacionEstado.APROBADA) {
      throw new BadRequestException(
        'Una donación aprobada no puede cambiar de estado',
      );
    }

    if (
      estadoActual === DonacionEstado.PENDIENTE &&
      ![DonacionEstado.APROBADA, DonacionEstado.RECHAZADA].includes(nuevoEstado)
    ) {
      throw new BadRequestException('Transición de estado no válida');
    }

    if (
      estadoActual === DonacionEstado.RECHAZADA &&
      nuevoEstado !== DonacionEstado.APROBADA
    ) {
      throw new BadRequestException('Transición de estado no válida');
    }
  }

  private validarVentanaReversion(fechaEstado: Date) {
    const REVERSAL_WINDOWS_HOURS = 48;

    const ahora = new Date();
    const diffHoras =
      (ahora.getTime() - fechaEstado.getTime()) / (1000 * 60 * 60);

    if (diffHoras > REVERSAL_WINDOWS_HOURS) {
      throw new BadRequestException(
        'El plazo para revertir la donación ha expirada',
      );
    }
  }

  private async aplicarEfectosDeEstado(
    manager: EntityManager,
    donacion: Donations,
    nuevoEstado: DonacionEstado,
  ) {
    const usuario = donacion.usuario;

    if (nuevoEstado === DonacionEstado.APROBADA) {
      usuario.puntos += donacion.puntos;

      await manager.save(usuario);

      await this.rankingService.ajustarPuntos(
        usuario.id,
        donacion.puntos,
        manager,
      );
    }
  }

  private readonly mapToResponseDto = (
    donation: Donations,
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

  private mapToDonationsResponse(
    donation: Donations,
  ): OrganizationDonationItemDto {
    return {
      id: donation.id,
      puntos: donation.puntos,
      descripcion: donation.detalle,
      estado: donation.estado,

      userId: donation.usuario.id,
      correo: donation.usuario.correo,

      campaignId: donation.campaña.id,
      campaignTitulo: donation.campaña.titulo,
    };
  }
}
