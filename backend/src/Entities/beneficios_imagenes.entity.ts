import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Beneficios } from './beneficio.entity';

@Entity('imagenes_beneficio')
export class Beneficios_imagenes {
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
  @ManyToOne(() => Beneficios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_beneficio' })
  beneficio: Beneficios;
}
