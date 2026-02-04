import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donations } from '../../Entities/donations.entity';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { Donation_images } from '../../Entities/donation_images.entity';
import { DonacionImagenDTO } from './dto/lista_donacion_imagen.dto';
import { CreateDonationDto } from './dto/create_donation.dto';
import { ResponseDonationDto } from './dto/response_donation.dto';
import { RankingService } from '../ranking/ranking.service';

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
   * Obtener todas las Donaciones
   */
  async findAll(): Promise<ResponseDonationDto[]> {
    const donations = await this.donationsRepository.find({
      relations: ['campaña', 'usuario'],
    });

    this.logger.log(`Se obtuvieron ${donations.length} Donaciones`);
    return donations.map(this.mapToResponseDto);
  }

  /**
   * Obtengo las Imagenes de cada donacion
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
   * Obtener una Donación por ID
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
   * Paginar las Donaciones por Organización
   */
  async findAllPaginatedByOrganizacion(
    organizacionId: number,
    page = 1,
    limit = 10,
  ) {
    const startIndex = (page - 1) * limit;
    const [donations, total] = await this.donationsRepository.findAndCount({
      where: {
        campaña: {
          organizacion: { id: organizacionId },
        },
      },
      relations: { campaña: true, usuario: true },
      order: { id: 'DESC' },
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
  async create(
    createDto: CreateDonationDto,
    userId: number,
  ): Promise<ResponseDonationDto> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: createDto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId, deshabilitado: false },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear donación
    const donation = this.donationsRepository.create({
      ...createDto,
      campaña: campaign,
      usuario: usuario,
    });

    const savedDonation = await this.donationsRepository.save(donation);

    // Sumar puntos (ejemplo simple)
    usuario.puntos += createDto.cantidad;
    await this.usuarioRepository.save(usuario);

    await this.rankingService.sumarPuntos(usuario.id, createDto.cantidad);

    this.logger.log(
      `Donación ${savedDonation.id} creada | Usuario ${usuario.id} +${createDto.cantidad} puntos`,
    );

    return this.mapToResponseDto(savedDonation);
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
    fecha_registro: donation.fecha_registro,
    campaignId: donation.campaña?.id,
    userId: donation.usuario?.id,
    imagen: '',
  });

  private mapToDonationsResponse(donation: Donations) {
    return {
      id: donation.id,
      //puntos: donation.puntos,
      descripcion: donation.detalle,

      usuario: {
        id: donation.usuario.id,
        nombre: donation.usuario.nombre,
        correo: donation.usuario.correo,
      },

      campaña: {
        id: donation.campaña.id,
        titulo: donation.campaña.titulo,
      },
    };
  }
}
