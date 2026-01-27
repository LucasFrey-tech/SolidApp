import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organizacion } from './organizacion.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('imagenes_organizacion')
export class Organizacion_imagenes {
  @ApiProperty({
    example: 1,
    description: 'Id única de la imagen de la Organización',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'logo.png', description: 'Logo de la Organización' })
  @Column({ type: 'varchar', length: 255 })
  logo: string;

  @ApiProperty({
    example: 'banner.png',
    description: 'Imagen de Portada de la Organización',
  })
  @Column({ type: 'varchar', length: 255 })
  banner: string;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Organización' })
  @ManyToOne(() => Organizacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizaciones_id' })
  organizacion: Organizacion;
}
