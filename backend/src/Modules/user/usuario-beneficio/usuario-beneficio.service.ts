import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';
import { BeneficiosUsuarioEstado } from '../../benefit/dto/enum/enum';
import { ErrorManager } from '../../../common/errors/error.manager';

/**
 * Servicio para gestionar los beneficios canjeados por los usuarios
 */
@Injectable()
export class UsuarioBeneficioService {
  private readonly logger = new Logger(UsuarioBeneficioService.name);

  constructor(
    @InjectRepository(UsuarioBeneficio)
    private readonly usuarioBeneficioRepo: Repository<UsuarioBeneficio>,
  ) {}

  /**
   * Obtiene todos los beneficios canjeados por un usuario
   *
   * @param usuarioId - ID del usuario
   * @returns Lista de beneficios canjeados por el usuario
   *
   * @throws {ErrorManager} Si falla la consulta a la base de datos
   */
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

  /**
   * Marca un beneficio como usado por el usuario
   *
   * @param id - ID del registro UsuarioBeneficio
   * @returns El registro actualizado
   *
   * @throws {ErrorManager} Si el beneficio no existe
   * @throws {ErrorManager} Si el beneficio no está activo
   * @throws {ErrorManager} Si no hay cupones disponibles
   * @throws {ErrorManager} Si falla la actualización
   */
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

  /**
   * Valida que el beneficio sea válido para ser usado
   *
   * @param registro - Registro UsuarioBeneficio a validar
   *
   * @throws {ErrorManager} Si el registro no existe
   * @throws {ErrorManager} Si el beneficio no está activo
   * @throws {ErrorManager} Si no hay cupones disponibles
   */
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
