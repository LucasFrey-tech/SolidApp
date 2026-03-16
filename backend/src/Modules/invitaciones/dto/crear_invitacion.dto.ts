import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail } from 'class-validator';

/**
 * DTO para crear invitaciones
 */
export class CreateInvitacionDto {
  @ApiProperty({
    example: ['a@mail.com', 'b@mail.com'],
    description: 'Lista de correos a los que se enviará la invitación',
  })
  @IsArray()
  @IsEmail({}, { each: true })
  correos: string[];
}