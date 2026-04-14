import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Empresa } from './empresa.entity';
import { BeneficioEstado } from '../Modules/benefit/dto/enum/enum';
import { Usuario } from './usuario.entity';

@Entity('beneficios')
export class Beneficios {
  @ApiProperty({ example: 1, description: 'Id único del Beneficio' })
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

  @ApiPropertyOptional({
    description: 'Usuario que creó el beneficio',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por_id' })
  creado_por?: Usuario;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del ultimo cambio realizado al Beneficio',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  @ApiPropertyOptional({
    description: 'Usuario que realizó el último cambio en el beneficio',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizado_por?: Usuario;

  @ApiProperty({
    example: 100,
    description: 'El valor del Beneficio',
  })
  @Column({ type: 'int' })
  valor: number;

  @ApiProperty({
    example: 'pendiente',
    description: 'Estado del Beneficio',
  })
  @Column({ type: 'varchar', length: 20, default: BeneficioEstado.PENDIENTE })
  estado: BeneficioEstado;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Empresa' })
  @ManyToOne(() => Empresa, (empresa) => empresa.beneficios)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
