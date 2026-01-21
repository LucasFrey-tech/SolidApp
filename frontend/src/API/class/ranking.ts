import { RankingItem } from "../types/ranking";
import { Crud, PaginatedResponse } from "../service";

export class RankingService extends Crud<RankingItem> {
    getAll(): Promise<RankingItem[]> {
        throw new Error("Method not implemented.");
    }
    getAllPaginated(page?: number, limit?: number): Promise<PaginatedResponse<RankingItem>> {
        throw new Error("Method not implemented.");
    }
    getOne(_id: number): Promise<RankingItem> {
        throw new Error("Method not implemented.");
    }
    create(_data: Partial<RankingItem>): Promise<RankingItem> {
        throw new Error("Method not implemented.");
    }
    update(_id: number, data: Partial<RankingItem>): Promise<RankingItem> {
        throw new Error("Method not implemented.");
    }
    delete(_id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private endPoint: string;

    constructor(token?: string) {
        super(token);
        this.endPoint = 'ranking';
    }

    async getTop10(): Promise<RankingItem[]> {
        const res = await fetch(`${this.baseUrl}/${this.endPoint}/top10`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!res.ok) {
            const errorDetails = await res.text();
            throw new Error(
                `Error al obtener ranking top 10 (${res.status}): ${errorDetails}`,
            );
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
            throw new Error('La respuesta del ranking no es un arreglo');
        }

        return data;
    }
}