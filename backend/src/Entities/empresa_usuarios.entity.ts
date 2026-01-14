import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
import { Empresa } from './empresa.entity';

@Entity('usuarios_empresa')
export class Empresa_usuarios {
  @ApiProperty({
    example: 1,
    description: 'Id única del Usuario de la Empresa',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => Usuario,
    description: 'Usuario asociado a la empresa',
  })
  @ManyToOne(() => Usuario, (usuario) => usuario.companyUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ApiProperty({
    type: () => Empresa,
    description: 'Empresa asociada al usuario',
  })
  @ManyToOne(() => Empresa, (empresa) => empresa.usuariosCompania, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
