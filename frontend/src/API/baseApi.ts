import { Login } from "./class/login";
import { Users } from "./class/user";
import { RegisterService } from "./class/registro";
import { EmpresasService } from "./class/empresas";
import { BeneficiosService } from "./class/beneficios";

export class BaseApi {
    public readonly log: Login;
    public readonly users: Users;
    public readonly register: RegisterService;
    public readonly empresa: EmpresasService;
    public readonly beneficio: BeneficiosService;

    constructor(private token?:string){
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        this.log = new Login();
        this.users = new Users(token);
        this.register = new RegisterService(baseUrl);
        this.empresa = new EmpresasService(token);
        this.beneficio = new BeneficiosService(token);
    }
}