import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DonacionEstado } from '../enum';

export class UpdateDonacionEstadoDto {
  @IsEnum(DonacionEstado)
  @Transform(({ value }) => parseInt(value, 10))
  estado: DonacionEstado;

  @IsOptional()
  @IsString()
  motivo?: string;
}
