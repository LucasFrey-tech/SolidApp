export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export abstract class Crud<T> {
    protected baseUrl: string;

    constructor(private token?: string) {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }

    abstract getAll(): Promise<T[]>;

    abstract getAllPaginated(page?: number, limit?: number): Promise<PaginatedResponse<T>>;

    abstract getOne(_id: number): Promise<T>;

    abstract create(_data: Partial<T>): Promise<T>;

    abstract update(_id: number, data: Partial<T>): Promise<T>;

    abstract delete(_id: number): Promise<void>;

    protected getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
}