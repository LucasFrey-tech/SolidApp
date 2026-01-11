import { Login } from "./class/login";
import { Users } from "./class/user";
import { RegisterService } from "./class/registro"; 

export class BaseApi {
    public readonly log: Login;
    public readonly users: Users;
    public readonly register: RegisterService;

    constructor(private token?:string){
        this.log = new Login();
        this.register = new RegisterService();
        this.users = new Users(token);
    }
}