import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organizacion } from './organizacion.entity';
import { Donaciones } from './donacion.entity';
import { CampaignEstado } from '../Modules/campaign/enum';
import { imagenes_campania } from './imagenes_campania.entity';
import { Usuario } from './usuario.entity';

@Entity('campañas')
export class Campaigns {
  @ApiProperty({ example: 1, description: 'Id único de la Campaña' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Activa',
    description: 'Indica si la Campaña esta activa',
  })
  @Column({ type: 'varchar', length: 20 })
  estado?: CampaignEstado;

  @ApiProperty({
    example: 'Doná y Ganá: Tu Compra se Convierte en Ayuda',
    description: 'Titulo de la Campaña Solidaria',
  })
  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @ApiProperty({
    example: 'Doná hoy y ayudá a quienes más lo necesitan',
    description: 'Descripción de la Campaña Solidaria',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de Inicio de la Campaña Solidaria',
  })
  @Column({ type: 'date' })
  fecha_Inicio: Date;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de Finalización de la Campaña Solidaria',
  })
  @Column({ type: 'date' })
  fecha_Fin: Date;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de la Creación de la Campaña Solidaria',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_Registro: Date;

  @ApiPropertyOptional({
    description: 'Usuario que creó la campaña',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por_id' })
  creado_por?: Usuario;

  @ApiProperty({
    example: 50,
    description:
      'Objetivo a alcanzar para dar por finalizada la Campaña Solidaria',
  })
  @Column({ type: 'int', default: 0 })
  objetivo: number;

  @ApiProperty({
    example: '50',
    description: 'Puntos que se van a otorgar por donación',
  })
  @Column({ type: 'int', default: 0 })
  puntos: number;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del Ultimo cambio realizado a la Campaña Solidaria',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  @ApiPropertyOptional({
    description: 'Usuario que realizó el último cambio en la campaña',
  })
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizado_por?: Usuario;

  @ApiProperty({ example: 1, description: 'Clave Foranea de la Organización' })
  @ManyToOne(() => Organizacion, (organizacion) => organizacion.campaign)
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizacion;

  @ApiProperty({
    type: () => Donaciones,
    isArray: true,
    description: 'Donaciones asociadas a la organización',
  })
  @OneToMany(() => Donaciones, (donation) => donation.campaña)
  donaciones: Donaciones[];

  @ApiPropertyOptional({
    type: () => imagenes_campania,
    isArray: true,
    description: 'Imagenes asociadas a la campaña',
  })
  @OneToMany(() => imagenes_campania, (imagen) => imagen.campaign)
  imagenes?: imagenes_campania[];
}
