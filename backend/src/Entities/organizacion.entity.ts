import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Campañas } from './campañas.entity';
import { User } from './user.entity';

@Entity('organizaciones')
export class Organizacion {
  @ApiProperty({ example: 1, description: 'Id único de la Organización' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '20-04856975-3',
    description: 'Cuil de la Organización',
  })
  @Column({ type: 'varchar', length: 13 })
  cuit: string;

  @ApiProperty({
    example: true,
    description: 'Representa si la Organización es legítima',
  })
  @Column({ type: 'bit', default: false })
  verificada: boolean;

  @ApiProperty({
    example: 'Fundación Ayuda Solidaria',
    description: 'El nombre legal registrado de la organización',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_Social: string;

  @ApiProperty({ example: 'INSERT-NOMBRE', description: '...' })
  @Column({ type: 'varchar', length: 50 })
  nombre_Organizacion: string;

  @ApiProperty({
    example:
      'La Fundación Ayuda Solidaria es una organización sin fines de lucro dedicada a mejorar la calidad de vida de personas en situación de vulnerabilidad',
    description: 'La Descripción de la Organización',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({
    example: 'www.fundacionayudasolidaria.org.ar',
    description: 'Sitio Web de la Organización',
  })
  @Column({ type: 'varchar', length: 255 })
  web: string;

  @ApiProperty({
    type: () => Campañas,
    isArray: true,
    description: 'Campañas asociadas a la organización',
  })
  @OneToMany(() => Campañas, (campaign) => campaign.organizacion)
  campaigns: Campañas[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  usuario: User;
}
