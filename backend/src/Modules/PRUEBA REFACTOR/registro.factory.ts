import { Injectable, NotFoundException } from '@nestjs/common';
import { RegistrationStrategy } from './registro.strategy';

@Injectable()
export class RegistrationFactory {
  private strategies = new Map<string, RegistrationStrategy>();

  registerStrategy(type: string, strategy: RegistrationStrategy) {
    this.strategies.set(type, strategy);
  }

  getStrategy(type: string): RegistrationStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new NotFoundException(`Tipo de usuario no soportado: ${type}`);
    }
    return strategy;
  }
}
