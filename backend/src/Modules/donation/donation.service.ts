import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donations } from '../../Entities/donations.entity';
import { Campaigns } from '../../Entities/campaigns.entity';
import { CreateDonationDto } from './dto/create_donation.dto';
import { ResponseDonationDto } from './dto/response_donation.dto';
import { DonorsService } from '../donor/donor.service';

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donations)
    private readonly donationsRepository: Repository<Donations>,
    @InjectRepository(Campaigns)
    private readonly campaignsRepository: Repository<Campaigns>,

    private readonly donorService: DonorsService,
  ) {}

  /**
   * Obtener todas las Donaciones
   */
  async findAll(): Promise<ResponseDonationDto[]> {
    const donations = await this.donationsRepository.find({
      relations: ['campaña', 'donador'],
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
      relations: ['campaña', 'donador'],
    });

    if (!donation) {
      throw new NotFoundException(`Donación con ID ${id} no encontrada`);
    }

    this.logger.log(`Donación ${id} obtenida`);
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

    const donor = await this.donorService.createIfNotExists(userId);

    const donation = this.donationsRepository.create({
      ...createDto,
      campaña: campaign,
      donador: donor,
    });

    const savedDonation = await this.donationsRepository.save(donation);

    this.logger.log(`Donación ${savedDonation.id} creada`);
    return this.mapToResponseDto(savedDonation);
  }

  private readonly mapToResponseDto = (
    donation: Donations,
  ): ResponseDonationDto => {
    return {
      id: donation.id,
      titulo: donation.titulo,
      detalle: donation.detalle,
      tipo: donation.tipo,
      cantidad: donation.cantidad,
      estado: donation.estado,
      fecha_registro: donation.fecha_registro,

      campaignId: donation.campaña?.id,
      donorId: donation.donador?.id,
    };
  };
}
