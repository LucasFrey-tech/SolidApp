import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Empresa } from './empresa.entity';

@Entity('beneficios')
export class Beneficios {
  @ApiProperty({ example: 1, description: 'Id única del Beneficio' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Descuento del 15!!',
    description: 'Titulo del Beneficio',
  })
  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @ApiProperty({ example: 'Discount', description: 'Tipo del Beneficio' })
  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @ApiProperty({
    example: 'Descuento en articulos de Supermecado',
    description: 'Información detallada del Beneficio',
  })
  @Column({ type: 'varchar', length: 255 })
  detalle: string;

  @ApiProperty({
    example: 50,
    description: 'La cantidad del Beneficio disponible',
  })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de Creación del Beneficio',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del ultimo cambio realizado al Beneficio',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Empresa' })
  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
