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
        const top10 = await this.puntosRepository.find({
            select: ['id_usuario', 'puntos'],
            order: { puntos: 'DESC' },
            take: 10,
        });

        this.logger.log(`Top 10 obtenido`);
        return top10;
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