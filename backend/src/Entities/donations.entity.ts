import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Campaigns } from './campaigns.entity';
import { Usuario } from './usuario.entity';
import { DonacionEstado } from '../Modules/donation/enum';

@Entity('donaciones')
export class Donations {
  @ApiProperty({ example: 1, description: 'Id única de la Donación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Donación Solidaria de Lucas Frey', // Ver otras opciones de titulo
    description: 'Titulo de la Donación indicando el usuario que donó',
  })
  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  @ApiProperty({
    example: 'INSERTE-DETALLE', // Ver opciones de Detalles
    description: 'Información sobre la Donación realizada por el Usuario',
  })
  @Column({ type: 'varchar', length: 255 })
  detalle: string;

  @ApiProperty({ example: 'ROPA', description: 'El tipo de Articulo a Donar' })
  @Column({ type: 'varchar', length: 25 })
  tipo: string;

  @ApiProperty({ example: 5, description: 'Cantidad del Articulo a Donar' })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({
    example: 'APROBADA',
    description: 'Indicador del estado del Articulo',
  })
  @Column({ type: 'varchar', enum: DonacionEstado })
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

  @ApiProperty({ example: 1, description: 'Clave Foranea de la Campaña' })
  @ManyToOne(() => Campaigns, (campaign) => campaign.donaciones)
  @JoinColumn({ name: 'id_campaña' })
  campaña: Campaigns;

  @ManyToOne(() => Usuario)
  usuario: Usuario;
}
