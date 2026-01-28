import { Login } from "./class/login";
import { Users } from "./class/user";
import { RegisterService } from "./class/registro";
import { EmpresasService } from "./class/empresas";
import { OrganizacionesService } from "./class/organizaciones";
import { BeneficiosService } from "./class/beneficios";
import { RankingService } from "./class/ranking";
import { DonationsService } from "./class/donaciones";

export class BaseApi {
    public readonly log: Login;
    public readonly users: Users;
    public readonly empresa: EmpresasService;
    public readonly organizacion: OrganizacionesService
    public readonly register: RegisterService;
    public readonly beneficio: BeneficiosService;
    public readonly ranking: RankingService;
    public readonly donation: DonationsService;

    constructor(private token?:string){
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        this.register = new RegisterService(baseUrl);
        this.log = new Login();
        this.users = new Users(token);
        this.empresa = new EmpresasService(token);
        this.organizacion = new OrganizacionesService(token);
        this.beneficio = new BeneficiosService(token);
        this.ranking = new RankingService(token);
        this.donation = new DonationsService(token);
    }
}