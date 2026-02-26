import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cuenta, RolCuenta } from '../../Entities/cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThan, Repository } from 'typeorm';
import { UpdateCredencialesDto } from '../user/dto/panelUsuario.dto';
import { UpdateUsuarioDto } from '../user/dto/update_usuario.dto';
import { HashService } from '../../common/bcryptService/hashService';

@Injectable()
export class CuentaService {
  private readonly logger = new Logger(CuentaService.name);

  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    private readonly hashService: HashService,
  ) {}

  async findByEmailRol(correo: string, rol: RolCuenta): Promise<Cuenta | null> {
    return this.cuentaRepository.findOne({
      where: { correo: correo, role: rol },
    });
  }

  async findByEmail(email: string): Promise<Cuenta | null> {
    return this.cuentaRepository.findOne({
      where: { correo: email },
    });
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
    const cuenta = await this.cuentaRepository.findOne({ where: { id } });

    if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

    if (dto.passwordNueva) {
      if (!dto.passwordActual) {
        throw new BadRequestException('Debés ingresar la contraseña actual');
      }

      const coincide = await this.hashService.compare(
        dto.passwordActual,
        cuenta.clave,
      );
      if (!coincide) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }

      cuenta.clave = await this.hashService.hash(dto.passwordNueva);
    }

    if (dto.correo) {
      cuenta.correo = dto.correo;
    }

    await this.cuentaRepository.save(cuenta);
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

  async findByResetToken(token: string): Promise<Cuenta | null> {
    return this.cuentaRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
  }

  async setResetToken(id: number, token: string, expires: Date): Promise<void> {
    await this.cuentaRepository.update(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async clearResetToken(id: number): Promise<void> {
    await this.cuentaRepository.update(id, {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async resetPassword(id: number, newHashedPassword: string): Promise<void> {
    await this.cuentaRepository.update(id, {
      clave: newHashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
