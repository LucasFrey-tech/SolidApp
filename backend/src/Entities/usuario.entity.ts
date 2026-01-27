import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('usuarios')
export class Usuario {
  @ApiProperty({ example: 1, description: 'Id Único del Usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Número de documento del usuario',
    example: '12345678',
  })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  documento: string;

  @ApiProperty({ example: 'Lucas', description: 'Nombre del Usuario' })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({ example: 'Frey', description: 'Apellido del Usuario' })
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @ApiProperty({
    example: 150,
    description: 'Puntos acumulados del usuario',
  })
  @Column({ type: 'int', default: 0 })
  puntos: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  usuario: User;
}
