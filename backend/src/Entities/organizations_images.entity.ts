import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organizations } from './organizations.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('imagenes_organizacion')
export class Organizations_images {
      
  /**
   * ID único de la Imagen de la Organización
   * @type {number}
   */
  @ApiProperty({
    example: 1,
    description: 'Id única de la imagen de la Organización',
  })
  @PrimaryGeneratedColumn()
  id: number;
    
  /**
   * Logo de la Organización
   * @type {string}
   */
  @ApiProperty({ example: 'logo.png', description: 'Logo de la Organización' })
  @Column({ type: 'varchar', length: 255 })
  logo: string;
    
  /**
   * Imagen de Portada de la Organización
   * @type {string}
   */
  @ApiProperty({
    example: 'banner.png',
    description: 'Imagen de Portada de la Organización',
  })
  @Column({ type: 'varchar', length: 255 })
  banner: string;
    
  /**
   * Organización asociada
   * @type {Organizations}
   */
  @ApiProperty({ example: 1, description: 'Id Foranea de la Organización' })
  @ManyToOne(() => Organizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizaciones_id' })
  organizacion: Organizations;
}
