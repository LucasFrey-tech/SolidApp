import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RankingDonador } from '../../Entities/ranking.entity';
import { RankingDTO } from './dto/ranking.dto';
import { ErrorManager } from '../../common/errors/error.manager';

/**
 * Servicio para gestionar el ranking de usuarios
 */
@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @InjectRepository(RankingDonador)
    private readonly puntosRepository: Repository<RankingDonador>,
  ) {}

  /**
   * Obtiene los 10 usuarios con más puntos
   *
   * @returns Lista de usuarios ordenada por puntaje descendente
   */
  async getTop10(): Promise<RankingDTO[]> {
    const ranking = await this.puntosRepository
      .createQueryBuilder('ranking')
      .leftJoinAndSelect('ranking.usuario', 'perfil_usuario')
      .select([
        'ranking.id_usuario',
        'ranking.puntos',
        'perfil_usuario.nombre',
        'perfil_usuario.apellido',
      ])
      .orderBy('ranking.puntos', 'DESC')
      .take(10)
      .getMany();

    this.logger.log(`Top 10 obtenido`);
    return ranking.map((r) => ({
      id_usuario: r.id_usuario,
      puntos: r.puntos,
      nombre: r.usuario.nombre,
      apellido: r.usuario.apellido,
    }));
  }

  /**
   * Suma puntos a un usuario en el ranking
   *
   * @param userID - ID del usuario
   * @param puntos - Puntos a sumar (debe ser > 0)
   * @param manager - EntityManager para transacciones
   */
  async ajustarPuntos(
    userID: number,
    puntos: number,
    manager: EntityManager,
  ): Promise<void> {
    const repo = manager.getRepository(RankingDonador);

    if (puntos <= 0) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'Los puntos a sumar deben ser mayores a 0',
      });
    }

    const exists = await repo.findOne({
      where: { id_usuario: userID },
    });

    if (!exists) {
      await repo.save({
        id_usuario: userID,
        puntos,
      });
      return;
    }

    await repo.increment({ id_usuario: userID }, 'puntos', puntos);
  }
}
