import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioBeneficio } from '../../../Entities/usuario-beneficio.entity';
import { BeneficiosUsuarioEstado } from '../../benefit/dto/enum/enum';

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

  /**  ===========================================================================
     OBTENER BENEFICIOS DEL USUARIO
     ---------------------------------------------------------------------------
     Devuelve todos los beneficios asociados a un usuario específico,
     ordenados por fecha de reclamo descendente.

     @param usuarioId number → ID del usuario
     @returns {Promise<UsuarioBeneficio[]>} - Obtiene el array con los cupones del usuario

    ** Si el usuario no tiene beneficios → retorna []
  =========================================================================== */
  async getByUsuario(usuarioId: number): Promise<UsuarioBeneficio[]> {
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

  /** ===========================================================================
     RECLAMAR BENEFICIO
     ---------------------------------------------------------------------------
     Permite que un usuario reclame un beneficio.

     Lógica:
       - Si ya existe un beneficio ACTIVO del mismo tipo:
           → incrementa cantidad (+1)
       - Si no existe:
           → crea nuevo registro con cantidad = 1

     @param usuarioId number → ID del usuario
     @param beneficioId number → ID del beneficio

     @returns {Promise<UsuarioBeneficio>}  - Actualiza los cupones del usuario
     
     No lanza excepciones actualmente (se asume existencia de usuario/beneficio).
  =========================================================================== */
  async reclamarBeneficio(
    usuarioId: number,
    beneficioId: number,
  ): Promise<UsuarioBeneficio> {
    const existing = await this.usuarioBeneficioRepo.findOne({
      where: {
        usuario: { id: usuarioId },
        beneficio: { id: beneficioId },
        estado: BeneficiosUsuarioEstado.ACTIVO,
      },
    });

    if (existing) {
      existing.cantidad += 1;

      const updated = await this.usuarioBeneficioRepo.save(existing);

      this.logger.log(
        `Usuario ${usuarioId} acumuló beneficio ${beneficioId}. Nueva cantidad: ${updated.cantidad}`,
      );

      return updated;
    }

    const nuevo = this.usuarioBeneficioRepo.create({
      usuario: { id: usuarioId },
      beneficio: { id: beneficioId },
      cantidad: 1,
      usados: 0,
      estado: BeneficiosUsuarioEstado.ACTIVO,
      fecha_reclamo: new Date(),
    });

    const saved = await this.usuarioBeneficioRepo.save(nuevo);

    this.logger.log(
      `Usuario ${usuarioId} reclamó nuevo beneficio ${beneficioId}`,
    );

    return saved;
  }

  /** ===========================================================================
     USAR BENEFICIO
     ---------------------------------------------------------------------------
     Permite consumir un cupón disponible.

     Reglas:
       - El registro debe existir
       - Debe estar en estado "activo"
       - Debe tener cupones disponibles (usados < cantidad)

     Lógica:
       - Incrementa "usados"
       - Si usados === cantidad:
           → estado = "usado"
           → fecha_uso = ahora

     @param id number → ID del UsuarioBeneficio

     @returns {Promise<UsuarioBeneficio>} - Actualiza la cantidad de cupones del usuario.

     @throws NotFoundException
       - Si el registro no existe

     @throws BadRequestException
       - Si el beneficio no está activo
       - Si no hay cupones disponibles
  =========================================================================== */
  async usarBeneficio(id: number): Promise<UsuarioBeneficio> {
    const registro = await this.usuarioBeneficioRepo.findOne({
      where: { id },
      relations: ['beneficio', 'usuario'],
    });

    if (!registro) {
      throw new NotFoundException('Beneficio no encontrado');
    }

    if (registro.estado !== BeneficiosUsuarioEstado.ACTIVO) {
      throw new BadRequestException('El beneficio no está activo');
    }

    if (registro.usados >= registro.cantidad) {
      throw new BadRequestException('No hay cupones disponibles');
    }

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
  }
}
