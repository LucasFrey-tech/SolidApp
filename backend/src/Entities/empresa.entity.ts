import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Beneficios } from './beneficio.entity';
import { User } from './user.entity';

@Entity('empresas')
export class Empresa {
  @ApiProperty({ example: 1, description: 'Id única de la Empresa' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '20-04856975-3', description: 'Cuil de la Empresa' })
  @Column({ type: 'varchar', length: 13 })
  cuit: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'El nombre legal registrado de la empresa colaboradora',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_Social: string;

  @ApiProperty({ example: 'INSERT-NOMBRE', description: '...' })
  @Column({ type: 'varchar', length: 50 })
  nombre_Empresa: string;

  @ApiProperty({
    example:
      'Supermercados Unidos S.A. impulsa la solidaridad mediante bonificaciones a clientes que donan a causas sociales.',
    description:
      'Descripción de la empresa colaboradora y su rol en la iniciativa de donaciones',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({ example: 'Supermercado', description: 'Rubro de la Empresa' })
  @Column({ type: 'varchar', length: 15 })
  rubro: string;

  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio Web de la Empresa',
  })
  @Column({ type: 'varchar', length: 255 })
  web: string;

  @ApiProperty({
    example: true,
    description: 'Representa si la Empresa es legítima',
  })
  @Column({ type: 'bit', default: false })
  verificada: boolean;

  @ApiProperty({
    type: () => Beneficios,
    isArray: true,
    description: 'Cupones asociadas a la organización',
  })
  @OneToMany(() => Beneficios, (cupon) => cupon.empresa)
  cupones: Beneficios[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  usuario: User;
}
