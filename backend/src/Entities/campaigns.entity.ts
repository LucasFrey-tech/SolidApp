import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organizations } from './organizations.entity';
import { Donations } from './donations.entity';
import { CampaignEstado } from '../Modules/campaign/enum';
import { Campaigns_images } from './campaigns_images.entity';

@Entity('campañas')
export class Campaigns {
  /**
   * Id único de la Campaña
   * @type {number}
   */
  @ApiProperty({ example: 1, description: 'Id único de la Campaña' })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Estado de la Campaña
   * @type {CampaignEstado}
   */
  @ApiProperty({
    example: 'Activa',
    description: 'Indica si la Campaña esta activa',
  })
  @Column({ type: 'varchar', length: 20 })
  estado?: CampaignEstado;

  /**
   * Título de la Campaña
   * @type {string}
   */
  @ApiProperty({
    example: 'Doná y Ganá: Tu Compra se Convierte en Ayuda',
    description: 'Titulo de la Campaña Solidaria',
  })
  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  /**
   * Descripción de la Campaña
   * @type {string}
   */
  @ApiProperty({
    example: 'Doná hoy y ayudá a quienes más lo necesitan',
    description: 'Descripción de la Campaña Solidaria',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  /**
   * Fecha de Inicio de la Campaña
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de Inicio de la Campaña Solidaria',
  })
  @Column({ type: 'date' })
  fecha_Inicio: Date;

  /**
   * Fecha de Finalizacion de la Campaña
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de Finalización de la Campaña Solidaria',
  })
  @Column({ type: 'date' })
  fecha_Fin: Date;

  /**
   * Fecha de Registro de la Campaña
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de la Creación de la Campaña Solidaria',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_Registro: Date;

  /**
   * Objetivo de la Campaña
   * @type {number}
   */
  @ApiProperty({
    example: 50,
    description:
      'Objetivo a alcanzar para dar por finalizada la Campaña Solidaria',
  })
  @Column({ type: 'int', default: 0 })
  objetivo: number;

  @ApiProperty({
    example: '50',
    description: 'Puntos que se van a otorgar por donación',
  })
  @Column({ type: 'int', default: 0 })
  puntos: number;

  /**
   * Fecha del Ultimo cambio de la Campaña
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del Ultimo cambio realizado a la Campaña Solidaria',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  /**
   * Organización asociadas
   * @type {Organizations}
   */
  @ApiProperty({ example: 1, description: 'Clave Foranea de la Organización' })
  @ManyToOne(() => Organizations, (organization) => organization.campaigns)
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizations;

  /**
   * Donaciones asociadas a la organización
   * @type {Donations}
   */
  @ApiProperty({
    type: () => Donations,
    isArray: true,
    description: 'Donaciones asociadas a la organización',
  })
  @OneToMany(() => Donations, (donation) => donation.campaña)
  donaciones: Donations[];

  /**
   * Imagenes relacionadas a la campaña
   * @type {Campaigns_images}
   */
  @ApiPropertyOptional({
    type: () => Campaigns_images,
    isArray: true,
    description: 'Imagenes asociadas a la campaña',
  })
  @OneToMany(() => Campaigns_images, (imagen) => imagen.id_campaign)
  imagenes?: Campaigns_images[];
}
