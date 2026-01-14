import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
import { Donations } from './donations.entity';

@Entity('donador')
export class Donor {
  @ApiProperty({ example: '1', description: 'Id única del Donador' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 500, description: 'Puntos del Donador' })
  @Column({ type: 'int', nullable: false })
  puntos: number;

  @ApiProperty({ example: 1, description: 'Id Foranea del Usuario' })
  @OneToOne(() => Usuario, (usuario) => usuario.donor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToMany(() => Donations, (donation) => donation.donador)
  donaciones: Donations[];
}
