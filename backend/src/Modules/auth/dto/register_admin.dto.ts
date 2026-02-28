import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({
    example: 'correo@email.com',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'Password123',
  })
  @IsString()
  @MinLength(6)
  clave: string;
}
