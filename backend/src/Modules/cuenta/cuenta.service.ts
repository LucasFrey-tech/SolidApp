import { Injectable, Logger } from '@nestjs/common';
import { Cuenta } from '../../Entities/cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { UpdateUsuarioDto } from '../user/dto/update_usuario.dto';

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

  async create(
    data: Partial<Cuenta>,
    manager?: EntityManager,
  ): Promise<Cuenta> {
    const repo = manager
      ? manager.getRepository(Cuenta)
      : this.cuentaRepository;

    const cuenta = repo.create(data);
    return repo.save(cuenta);
  }

  async actualizarUltimaConexion(id: number): Promise<void> {
    await this.cuentaRepository.update(id, {
      ultima_conexion: new Date(),
    });
  }

  async updateUsuario(id: number, dto: UpdateUsuarioDto) {
    await this.cuentaRepository.update(id, dto);
  }

  async updateCredenciales(
    id: number,
    dto: UpdateCredencialesDto,
  ): Promise<void> {
    await this.cuentaRepository.update(id, {
      correo: dto.correo,
      clave: dto.passwordNueva,
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
