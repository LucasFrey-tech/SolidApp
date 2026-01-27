import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Campañas } from './campañas.entity';

@Entity('imagenes_campaña')
export class Campañas_imagenes {
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
  @ManyToOne(() => Campañas)
  @JoinColumn({ name: 'campañas_id' })
  id_campaña: Campañas;
}
