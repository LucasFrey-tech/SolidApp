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
export class Empresa_imagenes {
  
  /**
   * ID único de la Imagen de la Empresa
   * @type {number}
   */
  @ApiProperty({
    example: 1,
    description: 'Id única de la Imagen de la Empresa',
  })
  @PrimaryGeneratedColumn()
  id: number;
  
  /**
   * Logo de la Empresa
   * @type {string}
   */
  @ApiProperty({ example: 'logo.png', description: 'Logo de la Empresa' })
  @Column({ type: 'varchar', length: 255 })
  logo: string;
  
  /**
   * Imagen de Portada de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: 'banner.png',
    description: 'Imagen de portada de la Empresa',
  })
  @Column({ type: 'varchar', length: 255 })
  banner: string;
  
  /**
   * Empresa asociada
   * @type {Empresa}
   */
  @ApiProperty({ example: 1, description: 'Id Foranea de la Empresa' })
  @ManyToOne(() => Empresa, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empresas_id' })
  id_empresa: Empresa;
}
