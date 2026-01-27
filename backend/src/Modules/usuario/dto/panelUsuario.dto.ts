import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCredentialsDto {
  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  passwordActual: string;

  @IsOptional()
  @IsString()
  passwordNueva?: string;
}
