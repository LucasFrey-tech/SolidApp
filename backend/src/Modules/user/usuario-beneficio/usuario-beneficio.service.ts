import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';

@Injectable()
export class UsuarioBeneficioService {
  constructor(
    @InjectRepository(UsuarioBeneficio)
    private readonly usuarioBeneficioRepo: Repository<UsuarioBeneficio>,
  ) {}

  /* ===============================
     OBTENER CUPONES DEL USUARIO
  ================================ */
  async getByUsuario(usuarioId: number) {
    return this.usuarioBeneficioRepo.find({
      where: {
        usuario: { id: usuarioId },
      },
      relations: ['beneficio'],
      order: {
        fecha_reclamo: 'DESC',
      },
    });
  }

  /* ===============================
     RECLAMAR BENEFICIO (Seguro)
  ================================ */
  async reclamarBeneficio(usuarioId: number, beneficioId: number) {
    // Intentamos actualizar la cantidad si ya existe
    const existing = await this.usuarioBeneficioRepo.findOne({
      where: {
        usuario: { id: usuarioId },
        beneficio: { id: beneficioId },
        estado: 'activo',
      },
    });

    if (existing) {
      existing.cantidad += 1; // sumamos 1 cupón
      return this.usuarioBeneficioRepo.save(existing);
    }

    // Si no existe, creamos un nuevo registro
    const nuevo = this.usuarioBeneficioRepo.create({
      usuario: { id: usuarioId } as any,
      beneficio: { id: beneficioId } as any,
      cantidad: 1,
      usados: 0,
      estado: 'activo',
    });

    return this.usuarioBeneficioRepo.save(nuevo);
  }

  /* ===============================
     USAR BENEFICIO
  ================================ */
  async usarBeneficio(id: number) {
    const registro = await this.usuarioBeneficioRepo.findOne({
      where: { id },
      relations: ['beneficio'],
    });

    if (!registro) {
      throw new NotFoundException('Beneficio no encontrado');
    }

    if (registro.usados >= registro.cantidad) {
      throw new BadRequestException('No hay cupones disponibles');
    }

    registro.usados += 1;

    if (registro.usados === registro.cantidad) {
      registro.estado = 'usado';
      registro.fecha_uso = new Date();
    }

    return this.usuarioBeneficioRepo.save(registro);
  }
}
