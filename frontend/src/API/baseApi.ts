import { Login } from "./class/login";
import { Users } from "./class/user";
import { RegisterService } from "./class/registro";
import { EmpresasService } from "./class/empresas";
import { OrganizacionesService } from "./class/organizaciones";
import { BeneficiosService } from "./class/beneficios";
import { RankingService } from "./class/ranking";
import { DonationsService } from "./class/donaciones";
import { campaignService } from "./class/campaigns";

export class BaseApi {
    public readonly log: Login;
    public readonly users: Users;
    public readonly empresa: EmpresasService;
    public readonly organizacion: OrganizacionesService
    public readonly register: RegisterService;
    public readonly beneficio: BeneficiosService;
    public readonly ranking: RankingService;
    public readonly donation: DonationsService;
    public readonly campaign: campaignService;

    constructor(private token?:string){
        this.register = new RegisterService();
        this.log = new Login();
        this.users = new Users();
        this.empresa = new EmpresasService();
        this.organizacion = new OrganizacionesService();
        this.beneficio = new BeneficiosService();
        this.ranking = new RankingService();
        this.donation = new DonationsService();
        this.campaign = new campaignService();
    }

}

export const baseApi = new BaseApi();