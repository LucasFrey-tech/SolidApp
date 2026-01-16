import { Login } from "./class/login";
import { Users } from "./class/user";
import { RegisterService } from "./class/registro"; 

export class BaseApi {
    public readonly log: Login;
    public readonly users: Users;
    public readonly register: RegisterService;

    constructor(private token?:string){
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        this.log = new Login();
        this.register = new RegisterService(baseUrl);
        this.users = new Users(token);
    }
}