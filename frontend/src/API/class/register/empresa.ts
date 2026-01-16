import { RegisterStrategy } from "@/API/interfaces/register";
import { RegisterEmpresaRequest } from "@/API/types/register";
import { RegisterService } from "../registro";

export class RegisterEmpresaStrategy
  implements RegisterStrategy<RegisterEmpresaRequest> {

  constructor(private service: RegisterService) {}

  register(data: RegisterEmpresaRequest) {
    return this.service.registerEmpresa(data);
  }
}
