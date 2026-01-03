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
import { ApiProperty } from '@nestjs/swagger';
import { Organizations } from './organizations.entity';
import { Donations } from './donations.entity';

@Entity('campañas')
export class Campaigns {
  @ApiProperty({ example: 1, description: 'Id único de la Campaña' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Activa',
    description: 'Indica si la Campaña esta activa',
  })
  @Column({ type: 'varchar', length: 10 })
  estado: string;

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
  @CreateDateColumn({ type: 'date' })
  fecha_inicio: Date;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de Finalización de la Campaña Solidaria',
  })
  @CreateDateColumn({ type: 'date' })
  fecha_fin: Date;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Fecha de la Creación de la Campaña Solidaria',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiProperty({
    example: 50,
    description:
      'Objetivo a alcanzar para dar por finalizada la Campaña Solidaria',
  })
  @Column({ type: 'int', default: 0 })
  objetivo: number;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del Ultimo cambio realizado a la Campaña Solidaria',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  @ApiProperty({ example: 1, description: 'Clave Foranea de la Organización' })
  @ManyToOne(() => Organizations, (organization) => organization.campaigns)
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizations;

  @ApiProperty({
    type: () => Donations,
    isArray: true,
    description: 'Donaciones asociadas a la organización',
  })
  @OneToMany(() => Donations, (donation) => donation.campaña)
  donaciones: Donations[];
}
