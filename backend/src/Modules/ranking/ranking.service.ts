import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RankingDonador } from '../../Entities/ranking.entity';
import { RankingDTO } from './dto/ranking.dto';

/**
 * Servicio que maneja la lÃ³gica de negocio para el Ranking
 */
@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @InjectRepository(RankingDonador)
    private readonly puntosRepository: Repository<RankingDonador>,
  ) {}

  /**
   * Obtiene los diez Usuarios con mayor puntaje acumulado
   *
   * @returns {Promise<RankingDTO[]>} Lista de los Usuarios ordenada descendentemente.
   */
  async getTop10(): Promise<RankingDTO[]> {
    const ranking = await this.puntosRepository
      .createQueryBuilder('ranking')
      .leftJoin('ranking.usuario', 'perfil_usuario')
      .select([
        'ranking.id_usuario',
        'ranking.puntos',
        'perfil_usuario.nombre',
        'perfil_usuario.apellido',
      ])
      .orderBy('ranking.puntos', 'DESC')
      .take(10)
      .getRawMany();

    this.logger.log(`Top 10 obtenido`);
    return ranking.map((r) => ({
      id_usuario: r.ranking_id_usuario,
      puntos: r.ranking_puntos,
      nombre: r.perfil_usuario_nombre,
      apellido: r.perfil_usuario_apellido,
    }));
  }

  /**
   * Funcion para Sumar y acumular los puntos obtenidos a los Usuarios
   *
   * @param {number} userID - ID del usuario
   * @param {number} puntos - cantidad de puntos a sumar
   */
  async ajustarPuntos(
    userID: number,
    puntos: number,
    manager: EntityManager,
  ): Promise<void> {
    const repo = manager.getRepository(RankingDonador);

    const exists = await this.puntosRepository.findOne({
      where: { id_usuario: userID },
    });

    if (!exists) {
      await repo.save({
        id_usuario: userID,
        puntos: puntos,
      });
      return;
    }

    if (exists.puntos + puntos < 0) {
      throw new Error('No se puede dejar el ranking en negativo');
    }

    await repo.increment({ id_usuario: userID }, 'puntos', puntos);
  }
}
