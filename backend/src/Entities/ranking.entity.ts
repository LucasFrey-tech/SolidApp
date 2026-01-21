import {
    Entity,
    Column,
    PrimaryColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';

@Entity('ranking_donador')
export class RankingDonador {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  @PrimaryColumn({ type: 'int' })
  id_usuario: number;

  @ApiProperty({ example: 1500, description: 'Puntaje del usuario' })
  @Column({ type: 'int' })
  puntos: number;
  
  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}