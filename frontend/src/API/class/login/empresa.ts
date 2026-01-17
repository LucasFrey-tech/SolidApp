import { LoginStrategy } from "@/API/interfaces/login";
import { LoginRequestBody } from "@/API/types/auth";
import { Login } from "../login";

export class LoginEmpresaStrategy implements LoginStrategy<LoginRequestBody> {
    constructor(private service: Login) {}

    login(data: LoginRequestBody) {
        return this.service.loginEmpresa(data);
    }
}