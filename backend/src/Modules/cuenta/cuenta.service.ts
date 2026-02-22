import { Injectable, Logger } from '@nestjs/common';
import { Cuenta } from '../../Entities/cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CuentaService {
  private readonly logger = new Logger(CuentaService.name);

  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
  ) {}

  async findByEmail(correo: string): Promise<Cuenta | null> {
    return this.cuentaRepository.findOne({ where: { correo } });
  }

  async create(data: Partial<Cuenta>): Promise<Cuenta> {
    const cuenta = this.cuentaRepository.create(data);
    return this.cuentaRepository.save(cuenta);
  }

  async actualizarUltimaConexion(id: number): Promise<void> {
    await this.cuentaRepository.update(id, {
      ultima_conexion: new Date(),
    });
  }

  async findById(id: number): Promise<Cuenta | null> {
    return this.cuentaRepository.findOne({ where: { id } });
  }

  async deshabilitar(id: number): Promise<void> {
    await this.cuentaRepository.update(id, { deshabilitado: true });
  }

  async habilitar(id: number): Promise<void> {
    await this.cuentaRepository.update(id, { deshabilitado: false });
  }
}
