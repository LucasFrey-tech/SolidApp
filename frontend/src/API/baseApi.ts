import { Usuario } from "./class/user";
import { RegisterService } from "./class/registro";
import { EmpresasService } from "./class/empresas";
import { OrganizacionesService } from "./class/organizaciones";
import { BeneficiosService } from "./class/beneficios";
import { RankingService } from "./class/ranking";
import { campaignService } from "./class/campaigns";
import { AuthService } from "./class/auth";
import { InvitacionesOrganizacionService } from "./class/invitacionesOrganizacion";
import { InvitacionesEmpresaService } from "./class/invitacionesEmpresa";

export class BaseApi {
    public readonly auth: AuthService;
    public readonly usuario: Usuario;
    public readonly empresa: EmpresasService;
    public readonly organizacion: OrganizacionesService
    public readonly register: RegisterService;
    public readonly beneficio: BeneficiosService;
    public readonly ranking: RankingService;
    public readonly campaign: campaignService;
     public readonly invitacionesOrg: InvitacionesOrganizacionService;
    public readonly invitacionesEmp: InvitacionesEmpresaService;

    constructor(){
        this.register = new RegisterService();
        this.auth = new AuthService();
        this.usuario = new Usuario();
        this.empresa = new EmpresasService();
        this.organizacion = new OrganizacionesService();
        this.beneficio = new BeneficiosService();
        this.ranking = new RankingService();
        this.campaign = new campaignService();
        this.invitacionesOrg = new InvitacionesOrganizacionService();
        this.invitacionesEmp = new InvitacionesEmpresaService();
    }

}

export const baseApi = new BaseApi();