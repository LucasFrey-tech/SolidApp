import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Campaigns } from './campaigns.entity';
import { Usuario } from './usuario.entity';
import { DonacionEstado } from '../Modules/donation/enum';

@Entity('donaciones')
export class Donaciones {
  @ApiProperty({ example: 1, description: 'Id única de la Donación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Donación Solidaria de Lucas Frey',
    description: 'Titulo de la Donación indicando el usuario que donó',
  })
  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  @ApiProperty({
    example: 'INSERTE-DETALLE',
    description: 'Información sobre la Donación realizada por el Usuario',
  })
  @Column({ type: 'varchar', length: 255 })
  detalle: string;

  @ApiProperty({ example: 'ROPA', description: 'El tipo de Articulo a Donar' })
  @Column({ type: 'varchar', length: 25, default: 'Articulo' })
  tipo?: string;

  @ApiProperty({ example: 5, description: 'Cantidad del Articulo a Donar' })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({
    example: 0,
    description:
      'Estado de la donación (0: PENDIENTE, 1: APROBADA, 2: RECHAZADA)',
    enum: DonacionEstado,
  })
  @Column({
    type: 'int',
    default: DonacionEstado.PENDIENTE,
  })
  estado: DonacionEstado;

  @ApiProperty({
    example: 500,
    description: 'Puntos que otorga la donación',
  })
  @Column({ type: 'int', nullable: true })
  puntos: number;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de cuando se realizo la Donación',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiPropertyOptional({
    description: 'Usuario que creó la donación',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por_id' })
  creado_por?: Usuario;

  @ApiPropertyOptional({
    description: 'Usuario que aprobó la donación',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'aprobado_por_id' })
  aprobado_por?: Usuario;

  @ApiPropertyOptional({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha en que fue aprobada la donación',
  })
  @Column({ type: 'datetime2', nullable: true })
  fecha_aprobacion?: Date;

  @ApiPropertyOptional({
    description: 'Usuario que rechazó la donación',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'rechazado_por_id' })
  rechazado_por?: Usuario;

  @ApiPropertyOptional({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha en que fue rechazada la donación',
  })
  @Column({ type: 'datetime2', nullable: true })
  fecha_rechazo?: Date;

  @ApiProperty({ example: 'Articulos dañados' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo_rechazo?: string | null;

  @ApiProperty({ example: 1, description: 'Clave Foranea de la Campaña' })
  @ManyToOne(() => Campaigns, (campaign) => campaign.donaciones)
  @JoinColumn({ name: 'id_campaña' })
  campaña: Campaigns;

  @ManyToOne(() => Usuario, (user) => user.donaciones)
  usuario: Usuario;
}
