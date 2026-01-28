import { ApiProperty } from '@nestjs/swagger';

export class RankingDTO {
  @ApiProperty({ example: 1 })
  id_usuario: number;

  @ApiProperty({ example: 1500 })
  puntos: number;

  @ApiProperty({ example: "Pepe" })
  nombre: string;

  @ApiProperty({ example: "Argento" })
  apellido: string;
}
