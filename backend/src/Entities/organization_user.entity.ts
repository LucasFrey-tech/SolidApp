import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Organizations } from './organizations.entity';

@Entity('usuarios_organizacion')
export class Organizations_user {
  @ApiProperty({
    example: 1,
    description: 'Id única del Usuario de la Organización',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'Id Foranea del Usuario' })
  @ManyToOne(() => User, (users) => users.organizationsUser)
  @JoinColumn({ name: 'usuarios_id' })
  id_usuario: number;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Organización' })
  @ManyToOne(
    () => Organizations,
    (organizations) => organizations.organizationsUser)
  @JoinColumn({ name: 'organizaciones_id' })
  id_organizacion: Organizations;
}
