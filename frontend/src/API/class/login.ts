import { Crud, PaginatedResponse } from "../service";
import { LoginRequestBody, AuthResponse } from "../types/auth";

export class Login extends Crud<LoginRequestBody>{
    getAllPaginated(page?: number, limit?: number): Promise<PaginatedResponse<LoginRequestBody>> {
        throw new Error("Method not implemented.");
    }
    private endPoint: string;
    constructor(token?: string){
        super(token);
        this.endPoint = 'auth';
    }

    async getAll(): Promise<never[]> {
        throw new Error('Method getAll not supported for Auth');
    }

    async getOne(_id: number): Promise<never> {
        throw new Error('Method getOne not supported for Auth');
    }

    async create(_data: Partial<LoginRequestBody>): Promise<LoginRequestBody> {
        throw new Error('Method create not supported for Auth');
    }

    async update(_id: number, _data: Partial<never>): Promise<never> {
        throw new Error('Method update not supported for Auth');
    }

    async delete(_id: number): Promise<void> {
        throw new Error('Method delete not supported for Auth');
    }

    async login(credentials: LoginRequestBody): Promise<{ success: true, data: AuthResponse} | {
      status: number; success: false, error: string 
    }> {
        try{
            const res = await fetch(`${this.baseUrl}/${this.endPoint}/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(credentials),
            });
            const body = await res.json();

            if (!res.ok) {
                if(res.status === 403) {

                return {status:403, success: false, error:"Usuario bloqueado" };
                }
                return {status:body.status, success: false, error:"Error al iniciar sesión" };
            }
            return { success: true, data: body};
        }catch (error){

            return {
                status:500,
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido"
            };
        }
    
    }

    async loginUser(credentials: LoginRequestBody): Promise<AuthResponse> {
        return this.post("/auth/login/usuario", credentials);
    }

    async loginEmpresa(credentials: LoginRequestBody): Promise<AuthResponse> {
        return this.post("/auth/login/empresa", credentials);
    }

    async loginOrganizacion(credentials: LoginRequestBody): Promise<AuthResponse> {
        return this.post("/auth/login/organizacion", credentials);
    }

    private async post(path: string, data: LoginRequestBody): Promise<AuthResponse> {
        const url = `${this.baseUrl}${path}`;
        console.log("POST a:", url);
        console.log("Con:", data); 


        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            let errorMessage = "Error desconocido"; 
            if (res.status === 401) { 
                errorMessage = "Credenciales inválidas. Error al iniciar sesión."; } 
            else if (res.status === 403) { 
                errorMessage = "Usuario bloqueado. Contacte al administrador."; 
            } else if (res.status === 404) { 
                errorMessage = `Endpoint no encontrado: ${url}`; 
            } else if (res.status >= 500) { 
                errorMessage = "Error interno del servidor. Intente más tarde."; 
            }

            throw new Error(errorMessage);
        }
        const json = await res.json();
        return json as AuthResponse;
    }
}