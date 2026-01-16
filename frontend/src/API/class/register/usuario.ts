import { RegisterStrategy } from "@/API/interfaces/register";
import { RegisterService } from "../registro";
import { RegisterUsuarioRequest } from "@/API/types/register";

export class RegisterUsuarioStrategy
  implements RegisterStrategy<RegisterUsuarioRequest> {

  constructor(private service: RegisterService) {}

  register(data: RegisterUsuarioRequest) {
    return this.service.registerUser(data);
  }
}
