import { Injectable } from '@nestjs/common';
import { RegisterUsuarioDto } from './dtos/dtos';
import { RegistrationStrategy } from './registro.strategy';
import { UsuarioService } from '../usuario/usuario.service';
import { ResponseUsuarioDto } from '../usuario/dto/response_usuario.dto';

@Injectable()
export class UsuarioRegistrationStrategy implements RegistrationStrategy {
  constructor(private readonly usuarioService: UsuarioService) {}

  supports(type: string): boolean {
    return type === 'usuario';
  }

  getType(): string {
    return 'usuario';
  }

  async register(dto: RegisterUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.usuarioService.create(dto);
  }
}
