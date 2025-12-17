import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Benefits } from './benefits.entity';

@Entity('imagenes_beneficio')
export class Benefits_images {
  @ApiProperty({
    example: 1,
    description: 'Id única de la Imagen del Beneficio',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'image.jpg', description: 'Imagen del Beneficio' })
  @Column({ type: 'varchar', length: 255 })
  imagen: string;

  @ApiProperty({ example: 1, description: 'Id Foranea del Beneficio' })
  @ManyToOne(() => Benefits, (benefits) => benefits.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'beneficios_id' })
  id_beneficio: Benefits;
}
