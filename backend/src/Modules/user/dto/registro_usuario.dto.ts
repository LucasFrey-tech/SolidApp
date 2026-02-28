import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroUsuarioDto {
  @ApiProperty({ example: '11223322' })
  @IsString()
  documento: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  apellido: string;
}
