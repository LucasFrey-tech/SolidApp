import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Donaciones } from './donaciones.entity';

@Entity('imagenes_donacion')
export class Donaciones_imagenes {
  @ApiProperty({
    example: 1,
    description: 'Id Único de la Imagen de la Donación',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'image.jpg', description: 'Imagen de la Donación' })
  @Column({ type: 'varchar', length: 255 })
  imagen: string;

  @ApiProperty({ example: 1, description: 'Clave Foranea de la Donación' })
  @ManyToOne(() => Donaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'donaciones_id' })
  id_donacion: Donaciones;
}
