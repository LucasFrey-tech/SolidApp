import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { RankingDonador } from "../../Entities/ranking.entity"
import { RankingDTO } from "./dto/ranking.dto"

@Injectable()
export class RankingService {
    private readonly logger = new Logger(RankingService.name);

    constructor(
        @InjectRepository(RankingDonador)
        private readonly puntosRepository: Repository<RankingDonador>,
    ) { }

    async getTop10(): Promise<RankingDTO[]> {
        const ranking = await this.puntosRepository
            .createQueryBuilder('ranking')
            .leftJoin('ranking.usuario', 'usuario')
            .select([
                'ranking.id_usuario',
                'ranking.puntos',
                'usuario.nombre',
                'usuario.apellido',
            ])
            .orderBy('ranking.puntos', 'DESC')
            .take(10)
            .getRawMany();

        this.logger.log(`Top 10 obtenido`);
        return ranking.map(r => ({
            id_usuario: r.ranking_id_usuario,
            puntos: r.ranking_puntos,
            nombre: r.usuario_nombre,
            apellido: r.usuario_apellido,
        }));
    }

    async sumarPuntos(userID: number, puntos: number): Promise<void> {
        const exists = await this.puntosRepository.findOne({
            where: { id_usuario: userID },
        });

        if (!exists) {
            await this.puntosRepository.save({
                id_usuario: userID,
                puntos: puntos,
            });
            return;
        }

        await this.puntosRepository.increment(
            { id_usuario: userID },
            'puntos',
            puntos,
        );
    }
}