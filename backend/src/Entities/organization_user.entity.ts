import { Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
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
  @OneToOne(() => Usuario, (user) => user.organizationsUser)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Organización' })
  @OneToOne(() => Organizations, (organization) => organization.user)
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizations;
}
