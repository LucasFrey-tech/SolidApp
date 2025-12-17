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
  @ApiProperty({
    example: 1,
    description: 'Id única de la Imagen de la Campaña',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'imagen.jpg', description: 'Imagen de la Campaña' })
  @Column({ type: 'varchar', length: 255 })
  imagen: string;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Campaña' })
  @ManyToOne(() => Campaigns, (campaigns) => campaigns.Campaigns_images)
  @JoinColumn({ name: 'campañas_id' })
  id_campaña: Campaigns;
}
