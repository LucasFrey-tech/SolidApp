import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCredencialesDto {
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
