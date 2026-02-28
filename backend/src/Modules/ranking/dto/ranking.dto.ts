import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object (DTO) para el Ranking de Ussuarios.
 * Se usa para validar y transformar datos entre el cliente y el servidor.
 */

export class RankingDTO {
  /** ID del Usuario */
  @ApiProperty({ example: 1 })
  id_usuario: number;

  /** Cantidad de Puntos */
  @ApiProperty({ example: 1500 })
  puntos: number;

  /** Nombre del Usuario */
  @ApiProperty({ example: 'Pepe' })
  nombre: string;

  /** Apellido del Usuario */
  @ApiProperty({ example: 'Argento' })
  apellido: string;
}
