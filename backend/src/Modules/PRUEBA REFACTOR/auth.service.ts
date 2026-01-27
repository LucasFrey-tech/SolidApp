import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/dtos';
import { RegistrationFactory } from './registro.factory';

@Injectable()
export class AuthService {
  constructor(private readonly registrationFactory: RegistrationFactory) {}

  async register(registerDto: RegisterUserDto) {
    const { tipo, datos } = registerDto;

    const strategy = this.registrationFactory.getStrategy(tipo);
    await strategy.register(datos);
  }
}
