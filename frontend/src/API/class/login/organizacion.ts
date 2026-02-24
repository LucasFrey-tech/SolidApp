import { LoginStrategy } from "@/API/interfaces/login";
import { LoginRequestBody } from "@/API/types/auth";
import { Login } from "../login";
import { RolCuenta } from "@/API/types/register";

export class LoginOrganizacionStrategy implements LoginStrategy<LoginRequestBody> {
    constructor(private service: Login) {}

    login(data: LoginRequestBody) {
        return this.service.login({...data, rol: RolCuenta.ORGANIZACION});
    }
}