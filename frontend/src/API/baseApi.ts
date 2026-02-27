import { Users } from "./class/user";
import { RegisterService } from "./class/registro";
import { EmpresasService } from "./class/empresas";
import { OrganizacionesService } from "./class/organizaciones";
import { BeneficiosService } from "./class/beneficios";
import { RankingService } from "./class/ranking";
import { campaignService } from "./class/campaigns";
import { AuthService } from "./class/auth";

export class BaseApi {
    public readonly auth: AuthService;
    public readonly users: Users;
    public readonly empresa: EmpresasService;
    public readonly organizacion: OrganizacionesService
    public readonly register: RegisterService;
    public readonly beneficio: BeneficiosService;
    public readonly ranking: RankingService;
    public readonly campaign: campaignService;

    constructor(){
        this.register = new RegisterService();
        this.auth = new AuthService();
        this.users = new Users();
        this.empresa = new EmpresasService();
        this.organizacion = new OrganizacionesService();
        this.beneficio = new BeneficiosService();
        this.ranking = new RankingService();
        this.campaign = new campaignService();
    }

}

export const baseApi = new BaseApi();