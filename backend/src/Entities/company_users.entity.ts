import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Companies } from './companies.entity';

@Entity('usuarios_empresa')
export class Company_users {
  @ApiProperty({
    example: 1,
    description: 'Id única del Usuario de la Empresa',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => User,
    description: 'Usuario asociado a la empresa',
  })
  @ManyToOne(() => User, (user) => user.companyUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @ApiProperty({
    type: () => Companies,
    description: 'Empresa asociada al usuario',
  })
  @ManyToOne(() => Companies, (company) => company.usuariosCompania, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_empresa' })
  empresa: Companies;
}
