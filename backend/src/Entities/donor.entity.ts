import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('donador')
export class Donor {
  @ApiProperty({ example: '1', description: 'Id única del Donador' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 500, description: 'Puntos del Donador' })
  @Column({ type: 'number', nullable: false })
  puntos: number;

  @ApiProperty({ example: 1, description: 'Id Foranea del Usuario' })
  @ManyToOne(() => User, (users) => users.donorUsers)
  @JoinColumn({ name: 'usuarios_id' })
  id_usuario: User;
}
