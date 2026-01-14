import {
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Empresa } from './empresa.entity';

@Entity('imagenes_empresa')
export class Company_images {
  @ApiProperty({
    example: 1,
    description: 'Id única de la Imagen de la Empresa',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'logo.png', description: 'Logo de la Empresa' })
  @Column({ type: 'varchar', length: 255 })
  logo: string;

  @ApiProperty({
    example: 'banner.png',
    description: 'Imagen de portada de la Empresa',
  })
  @Column({ type: 'varchar', length: 255 })
  banner: string;

  @ApiProperty({ example: 1, description: 'Id Foranea de la Empresa' })
  @ManyToOne(() => Empresa, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empresas_id' })
  id_empresa: Empresa;
}
