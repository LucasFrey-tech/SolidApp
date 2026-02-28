import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from './perfil_Usuario.entity';

@Entity('ranking_donador')
export class RankingDonador {
  /**
   * ID del Usuario del Ranking
   * @type {number}
   */
  @ApiProperty({ example: 1, description: 'ID del usuario del Ranking' })
  @PrimaryColumn({ type: 'int' })
  id_usuario: number;

  /**
   * Puntaje del Usuario
   * @type {number}
   */
  @ApiProperty({ example: 1500, description: 'Puntaje del usuario' })
  @Column({ type: 'int' })
  puntos: number;

  /**
   * Usuarios asociados
   * @type {PerfilUsuario}
   */
  @OneToOne(() => PerfilUsuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: PerfilUsuario;
}
