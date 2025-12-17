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

  @ApiProperty({ example: 1, description: 'Id Foranea del Usuario' })
  @ManyToOne(() => User, (users) => users.companyUsers)
  @JoinColumn({ name: 'usuarios_id' })
  id_usuario: User;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Empresa' })
  @ManyToOne(() => Companies, (companies) => companies.companyUsers)
  @JoinColumn({ name: 'empresas_id' })
  id_empresa: Companies;
}
