import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, MaxLength, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBeneficiosDTO {
  @ApiProperty({ example: 'Descuento del 15%' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({ example: 'Discount' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipo: string;

  @ApiProperty({ example: 'Descuento en supermercado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  detalle: string;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id_empresa: number;

  @ApiProperty({ example: 'pendiente', enum: ['pendiente','aprobado','rechazado'], required: false })
  @IsString()
  @IsIn(['pendiente','aprobado','rechazado'])
  @IsOptional()
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
}
