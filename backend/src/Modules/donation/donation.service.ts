import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donations } from '../../Entities/donations.entity';
import { Campaigns } from '../../Entities/campaigns.entity';
import { Usuario } from '../../Entities/usuario.entity';
import { CreateDonationDto } from './dto/create_donation.dto';
import { ResponseDonationDto } from './dto/response_donation.dto';

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

    // 👉 Crear donación
    const donation = this.donationsRepository.create({
      ...createDto,
      campaña: campaign,
      usuario: usuario,
    });

    const savedDonation = await this.donationsRepository.save(donation);

    // 👉 Sumar puntos (ejemplo simple)
    usuario.puntos += createDto.cantidad;
    await this.usuarioRepository.save(usuario);

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
  });
}
