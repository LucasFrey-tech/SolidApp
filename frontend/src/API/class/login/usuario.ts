import { LoginStrategy } from "@/API/interfaces/login";
import { LoginRequestBody } from "@/API/types/auth";
import { AuthService } from "../auth";
import { RolCuenta } from "@/API/types/auth";

export class LoginUsuarioStrategy implements LoginStrategy<LoginRequestBody> {
    constructor(private service: AuthService) {}

    login(data: LoginRequestBody){
        return this.service.login({...data, rol: RolCuenta.USUARIO});
    }
}