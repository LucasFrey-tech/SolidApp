import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DonacionEstado } from '../enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDonacionEstadoDto {
  @IsEnum(DonacionEstado)
  @Transform(({ value }) => parseInt(value, 10))
  estado: DonacionEstado;

  @ApiPropertyOptional({
    example: 'Articulos en mal estado',
    description: 'Motivo del rechazo',
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}
