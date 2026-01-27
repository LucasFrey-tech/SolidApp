// registration.strategy.ts
import { RegisterUsuarioDto } from './dtos/dtos';
import { RegisterEmpresaDto } from './dtos/dtos';
import { RegisterOrganizacionDto } from './dtos/dtos';

export type RegisterDtoType =
  | RegisterUsuarioDto
  | RegisterEmpresaDto
  | RegisterOrganizacionDto;

export interface RegistrationStrategy {
  register(dto: RegisterDtoType): Promise<any>;
  supports(type: string): boolean;
  getType(): string;
}
