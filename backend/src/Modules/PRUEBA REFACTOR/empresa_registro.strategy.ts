import { Injectable } from '@nestjs/common';
import { RegisterEmpresaDto } from './dtos/dtos';
import { RegistrationStrategy } from './registro.strategy';
import { EmpresasService } from '../empresa/empresa.service';
import { EmpresaResponseDTO } from '../empresa/dto/response_empresa.dto';

@Injectable()
export class EmpresaRegistrationStrategy implements RegistrationStrategy {
  constructor(private readonly empresaService: EmpresasService) {}

  supports(type: string): boolean {
    return type === 'empresa';
  }

  getType(): string {
    return 'empresa';
  }

  async register(dto: RegisterEmpresaDto): Promise<EmpresaResponseDTO> {
    return this.empresaService.create(dto);
  }
}
