import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';
import { BeneficiosUsuarioEstado } from '../../benefit/dto/enum/enum';
import { ErrorManager } from '../../../common/errors/error.manager';

/**
 * =============================================================================
 * UsuarioBeneficioService
 * =============================================================================
 * Servicio encargado de gestionar los beneficios (cupones) asociados
 * a los usuarios del sistema.
 *
 * Funcionalidades:
 *  - Obtener beneficios de un usuario
 *  - Reclamar un beneficio (crear o acumular)
 *  - Usar un beneficio disponible
 *
 * Todas las operaciones interactúan con la entidad UsuarioBeneficio.
 * =============================================================================
 */
@Injectable()
export class UsuarioBeneficioService {
  private readonly logger = new Logger(UsuarioBeneficioService.name);

  constructor(
    @InjectRepository(UsuarioBeneficio)
    private readonly usuarioBeneficioRepo: Repository<UsuarioBeneficio>,
  ) {}

  async getByUsuario(usuarioId: number): Promise<UsuarioBeneficio[]> {
    try {
      return await this.usuarioBeneficioRepo.find({
        where: { usuario: { id: usuarioId } },
        relations: ['beneficio'],
        order: { fecha_reclamo: 'DESC' },
      });
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

  async usarBeneficio(id: number): Promise<UsuarioBeneficio> {
    try {
      const registro = await this.usuarioBeneficioRepo.findOne({
        where: { id },
        relations: ['beneficio', 'usuario'],
      });

      this.validarBeneficio(registro);

      registro.usados += 1;

      if (registro.usados === registro.cantidad) {
        registro.estado = BeneficiosUsuarioEstado.USADO;
        registro.fecha_uso = new Date();
      }

      const updated = await this.usuarioBeneficioRepo.save(registro);

      this.logger.log(
        `Usuario ${registro.usuario?.id} usó beneficio ${registro.beneficio?.id}. Usados: ${updated.usados}/${updated.cantidad}`,
      );

      return updated;
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

  private validarBeneficio(
    registro: UsuarioBeneficio | null,
  ): asserts registro is UsuarioBeneficio {
    if (!registro) {
      throw new ErrorManager({
        type: 'NOT_FOUND',
        message: 'Beneficio no encontrado',
      });
    }

    if (registro.estado !== BeneficiosUsuarioEstado.ACTIVO) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'El beneficio no está activo',
      });
    }

    if (registro.usados >= registro.cantidad) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No hay cupones disponibles',
      });
    }
  }
}
