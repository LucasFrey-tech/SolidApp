import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Campaigns } from './campaigns.entity';

@Entity('organizaciones')
export class Organizations {
  @ApiProperty({ example: 1, description: 'Id único de la Organización' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '20-04856975-3',
    description: 'Cuil de la Organización',
  })
  @Column({ type: 'varchar', length: 13 })
  nroDocumento: string;

  @ApiProperty({
    example: true,
    description: 'Representa si la Organización es legítima',
  })
  @Column({ type: 'bit', default: false })
  verificada: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si la Organización esta deshabilitada en el sitio',
  })
  @Column({ type: 'bit', default: false })
  deshabilitado: boolean;

  @ApiProperty({
    example: 'Fundación Ayuda Solidaria',
    description: 'El nombre legal registrado de la organización',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_social: string;

  @ApiProperty({ example: 'INSERT-NOMBRE', description: '...' })
  @Column({ type: 'varchar', length: 50 })
  nombre_fantasia: string; // Hace falta realmente ¿? Reemplazar por mail ¿?

  @ApiProperty({
    example:
      'La Fundación Ayuda Solidaria es una organización sin fines de lucro dedicada a mejorar la calidad de vida de personas en situación de vulnerabilidad',
    description: 'La Descripción de la Organización',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({
    example: '+54 9 11 1234-5678',
    description: 'Telefono de la Organización',
  })
  @Column({ type: 'varchar', length: 25 })
  telefono: string;

  @ApiProperty({
    example: 'Calle falsa 123',
    description: 'La dirección donde reside la Organización',
  })
  @Column({ type: 'varchar', length: 25 })
  direccion: string;

  @ApiProperty({
    example: 'www.fundacionayudasolidaria.org.ar',
    description: 'Sitio Web de la Organización',
  })
  @Column({ type: 'varchar', length: 255 })
  web: string;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del Registro de la Organización en el sitio',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del ultimo cambio de información de la Organización',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  @ApiProperty({
    type: () => Campaigns,
    isArray: true,
    description: 'Campañas asociadas a la organización',
  })
  @OneToMany(() => Campaigns, (campaign) => campaign.organizacion)
  campaigns: Campaigns[];

  @ApiProperty({
    example: 'correo@dominio.com',
    description: 'correo electronico del usuario de la empresa.',
  })
  @Column({ type: 'varchar', length: 255 })
  correo: string;

  @ApiProperty({
    example: 'password123',
    description: 'contraseña del usuario de la empresa.',
  })
  @Column({ type: 'varchar', length: 255 })
  clave: string;
}
