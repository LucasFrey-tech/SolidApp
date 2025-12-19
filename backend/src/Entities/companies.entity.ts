import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company_users } from './company_users.entity';

@Entity('empresas')
export class Companies {
  @ApiProperty({ example: 1, description: 'Id única de la Empresa' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '20-04856975-3', description: 'Cuil de la Empresa' })
  @Column({ type: 'varchar', length: 13 })
  nroDocumento: string;

  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'El nombre legal registrado de la empresa colaboradora',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_social: string;

  @ApiProperty({ example: 'INSERT-NOMBRE', description: '...' })
  @Column({ type: 'varchar', length: 50 })
  nombre_fantasia: string; // Hace falta realmente ¿? Reemplazar por mail ¿?

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
    example: '+54 11 4567-8900',
    description: 'Telefono de la Empresa',
  })
  @Column({ type: 'varchar', length: 25 })
  telefono: string;

  @ApiProperty({
    example: 'Calle falsa 123',
    description: 'La dirección donde reside la Empresa',
  })
  @Column({ type: 'varchar', length: 25 })
  direccion: string;

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
  @Column({ type: 'boolean', default: false })
  verificada: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si la Empresa esta deshabilitada en el sitio',
  })
  @Column({ type: 'boolean', default: false })
  deshabilitado: boolean;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del Registro de la Empresa en el sitio',
  })
  @CreateDateColumn({ type: 'timestamp', length: 50 })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del ultimo cambio de información de la Empresa',
  })
  @CreateDateColumn({ type: 'timestamp', length: 50 })
  ultimo_cambio: Date;

  @ApiProperty({
    type: () => Company_users,
    isArray: true,
    description: 'Usuarios asociados a la empresa',
  })
  @OneToMany(() => Company_users, (company) => company.empresa)
  companyUser: Company_users[];
}
