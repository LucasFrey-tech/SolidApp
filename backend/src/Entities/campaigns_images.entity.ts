import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Campaigns } from './campaigns.entity';

@Entity('imagenes_campaña')
export class Campaigns_images {
  
  /**
   * Id única de la Imagen de la Campaña
   * @type {number}
   */
  @ApiProperty({
    example: 1,
    description: 'Id única de la Imagen de la Campaña',
  })
  @PrimaryGeneratedColumn()
  id: number;
  
  /**
   * Imagen de la Campaña
   * @type {string}
   */
  @ApiProperty({ example: 'imagen.jpg', description: 'Imagen de la Campaña' })
  @Column({ type: 'varchar', length: 255 })
  imagen: string;
  
  /**
   * Campaña asociada
   * @type {Campaigns}
   */
  @ApiProperty({ example: 1, description: 'Id Foranea de la Campaña' })
  @ManyToOne(() => Campaigns)
  @JoinColumn({ name: 'campañas_id' })
  id_campaña: Campaigns;
}
