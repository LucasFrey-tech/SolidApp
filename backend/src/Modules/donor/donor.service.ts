import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from 'src/Entities/donor.entity';
import { DonationsService } from '../donation/donation.service';
import { TopDonorResponseDto } from './dto/top_donor_response.dto';

interface TopDonorRaw {
  id: number;
  nombre: string;
  totalDonado: string;
}

@Injectable()
export class DonorsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donor)
    private readonly donorRepository: Repository<Donor>,
  ) {}

  /**
   * Crea el donador a partir del usuario sino existe.
   */
  async createIfNotExists(userId: number): Promise<Donor> {
    const donor = await this.donorRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['usuario'],
    });

    if (donor) {
      return donor;
    }

    const newDonor = this.donorRepository.create({
      usuario: { id: userId },
    });

    const savedDonor = await this.donorRepository.save(newDonor);

    this.logger.log(`El usuario ${userId} es donador`);
    return savedDonor;
  }

  /**
   * Busca al donador por el id de usuario
   */
  async findByUserId(userId: number): Promise<Donor | null> {
    return this.donorRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['user'],
    });
  }

  /**
   * Obtiene los donadores con mayor monto total donado
   */
  async getTopDonors(limit: number): Promise<TopDonorResponseDto[]> {
    const result = await this.donorRepository
      .createQueryBuilder('donador')
      .leftJoin('donador.usuario', 'usuario')
      .select('donador.id', 'id')
      .addSelect('usuario.nombre', 'nombre')
      .addSelect('COUNT(donacion.id)', 'totalDonado')
      .groupBy('donador.id')
      .addGroupBy('usuario.nombre')
      .orderBy('totalDonated', 'DESC')
      .limit(limit)
      .getRawMany<TopDonorRaw>();

    return result.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      totalDonado: Number(row.totalDonado),
    }));
  }
}
