import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Donations } from './donacion.entity';

@Entity('imagenes_donacion')
export class Donation_images {
  /**
   * ID único de la Imagen de la Donación
   * @type {number}
   */
  @ApiProperty({
    example: 1,
    description: 'Id Único de la Imagen de la Donación',
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Imagen de la Donación
   * @type {string}
   */
  @ApiProperty({ example: 'image.jpg', description: 'Imagen de la Donación' })
  @Column({ type: 'varchar', length: 255 })
  imagen: string;

  /**
   * Donación asociada
   * @type {Donations}
   */
  @ApiProperty({ example: 1, description: 'Clave Foranea de la Donación' })
  @ManyToOne(() => Donations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'donaciones_id' })
  id_donacion: Donations;
}
