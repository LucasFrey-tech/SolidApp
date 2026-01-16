import { RegisterOrganizacionRequest} from "@/API/types/register";
import { RegisterService } from "../registro";
import { RegisterStrategy } from "@/API/interfaces/register";

export class RegisterOrganizacionStrategy
  implements RegisterStrategy<RegisterOrganizacionRequest> {

  constructor(private service: RegisterService) {}

  register(data: RegisterOrganizacionRequest) {
    return this.service.registerOrganizacion(data);
  }
}
