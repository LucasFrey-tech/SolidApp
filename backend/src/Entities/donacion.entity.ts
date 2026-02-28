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
import { PerfilUsuario } from './perfil_Usuario.entity';
import { DonacionEstado } from '../Modules/donation/enum';

@Entity('donaciones')
export class Donaciones {
  /**
   * ID único de la Donación
   * @type {number}
   */
  @ApiProperty({ example: 1, description: 'Id única de la Donación' })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Título de la Donación
   * @type {string}
   */
  @ApiProperty({
    example: 'Donación Solidaria de Lucas Frey', // Ver otras opciones de titulo
    description: 'Titulo de la Donación indicando el usuario que donó',
  })
  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  /**
   * Detalle de la Donación
   * @type {string}
   */
  @ApiProperty({
    example: 'INSERTE-DETALLE', // Ver opciones de Detalles
    description: 'Información sobre la Donación realizada por el Usuario',
  })
  @Column({ type: 'varchar', length: 255 })
  detalle: string;

  /**
   * Tipo del Artículo a Donar
   * @type {string}
   */
  @ApiProperty({ example: 'ROPA', description: 'El tipo de Articulo a Donar' })
  @Column({ type: 'varchar', length: 25, default: 'Articulo' })
  tipo?: string;

  /**
   * Cantidad del Artículo a Donar
   * @type {number}
   */
  @ApiProperty({ example: 5, description: 'Cantidad del Articulo a Donar' })
  @Column({ type: 'int' })
  cantidad: number;

  /**
   * Estado del Artículo de la Donación
   * @type {number}
   */
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

  /**
   * Fecha de Registro de la Donación
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de cuando se realizo la Donación',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  /**
   * Fecha de cuando cambio el estado
   */
  @Column({ type: 'datetime2', nullable: true })
  fecha_estado: Date;

  @ApiProperty({ example: 'Articulos dañados' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo_rechazo?: string | null;

  /**
   * Canpaña asociada
   * @type {Campaigns}
   */
  @ApiProperty({ example: 1, description: 'Clave Foranea de la Campaña' })
  @ManyToOne(() => Campaigns, (campaign) => campaign.donaciones)
  @JoinColumn({ name: 'id_campaña' })
  campaña: Campaigns;

  /**
   * Usuarios asociados
   * @type {Usuario}
   */
  @ManyToOne(() => PerfilUsuario, (user) => user.donaciones)
  usuario: PerfilUsuario;
}
