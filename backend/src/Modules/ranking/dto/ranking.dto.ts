import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object (DTO) para el Ranking de Ussuarios.
 * Se usa para validar y transformar datos entre el cliente y el servidor.
 */

export class RankingDTO {
  @ApiProperty({ example: 1 })
  id_usuario: number;

  @ApiProperty({ example: 1500 })
  puntos: number;

  @ApiProperty({ example: 'Pepe' })
  nombre: string;

  @ApiProperty({ example: 'Argento' })
  apellido: string;
}
