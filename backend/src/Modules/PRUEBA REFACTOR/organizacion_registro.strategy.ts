import { Injectable } from '@nestjs/common';
import { RegisterOrganizacionDto } from './dtos/dtos';
import { RegistrationStrategy } from './registro.strategy';
import { ResponseOrganizacionDto } from '../organizacion/dto/response_organization.dto';
import { OrganizacionService } from '../organizacion/organizacion.service';

@Injectable()
export class OrganizacionRegistrationStrategy implements RegistrationStrategy {
  constructor(private readonly organizacionService: OrganizacionService) {}

  supports(type: string): boolean {
    return type === 'organizacion';
  }

  getType(): string {
    return 'organizacion';
  }

  async register(
    dto: RegisterOrganizacionDto,
  ): Promise<ResponseOrganizacionDto> {
    return this.organizacionService.create(dto);
  }
}
