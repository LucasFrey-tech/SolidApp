import { LoginStrategy } from "@/API/interfaces/login";
import { LoginRequestBody } from "@/API/types/auth";
import { Login } from "../login";

export class LoginUsuarioStrategy implements LoginStrategy<LoginRequestBody> {
    constructor(private service: Login) {}

    login(data: LoginRequestBody){
        return this.service.loginUser(data);
    }
}