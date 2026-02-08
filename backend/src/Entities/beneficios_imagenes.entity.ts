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
  
  /**
   * Id único de la Imagen del Beneficio
   * @type {number}
   */
  @ApiProperty({
    example: 1,
    description: 'Id único de la Imagen del Beneficio',
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Imagen del Beneficio
   * @type {string}
   */
  @ApiProperty({ example: 'image.jpg', description: 'Imagen del Beneficio' })
  @Column({ type: 'varchar', length: 255 })
  imagen: string;

  
  /**
   * Beneficio asociado
   * @type {Beneficios}
   */
  @ApiProperty({ example: 1, description: 'Id Foranea del Beneficio' })
  @ManyToOne(() => Beneficios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_beneficio' })
  beneficio: Beneficios;
}
