// organization-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Cuenta } from './cuenta.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Campaigns } from './campaigns.entity';

@Entity()
export class PerfilOrganizacion {
  /**
   * ID único de la Organización
   * @type {number}
   */
  @ApiProperty({
    description: 'Identificador único del perfil de organización',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * CUIL de la Organización
   * @type {string}
   */
  @ApiProperty({
    description: 'CUIT único de la organización',
    example: '30-12345678-9',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  cuit: string;

  /**
   * Nombre Legal de la Organización
   * @type {string}
   */
  @ApiProperty({
    description: 'Razón social registrada de la organización',
    example: 'Fundación Ejemplo',
  })
  @Column({ type: 'varchar', length: 100 })
  razon_social: string;

  /**
   * Nombre Comercial de la Organización
   * @type {string}
   */
  @ApiProperty({
    description: 'Nombre de la organización',
    example: 'Fundación Esperanza',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre_organizacion: string;

  /**
   * Descripción de la Organización
   * @type {string}
   */
  @ApiProperty({
    description: 'Descripción breve de la organización',
    example: 'Organización sin fines de lucro dedicada a la educación.',
  })
  @Column({ type: 'varchar', length: 255, default: '' })
  descripcion: string;

  /**
   * Verificación
   * @type {boolean}
   */
  @ApiProperty({
    description: 'Indica si la organización está verificada',
    example: true,
    default: false,
  })
  @Column({ default: false })
  verificada: boolean;

  /**
   * Sitio Web de la Organización
   * @type {string}
   */
  @ApiProperty({
    description: 'Sitio web oficial de la organización',
    example: 'https://www.fundacion-ejemplo.org',
  })
  @Column({ type: 'varchar', length: 255, default: '' })
  web: string;

  /**
   * Informacion base del usuario
   * @type {Cuenta}
   */
  @ApiProperty({
    description: 'Cuenta asociada al perfil de organización',
    type: () => Cuenta,
  })
  @OneToOne(() => Cuenta)
  @JoinColumn()
  cuenta: Cuenta;

  /**
   * Campañas de la Organización
   * @type {Campaigns}
   */
  @ApiProperty({
    type: () => Campaigns,
    isArray: true,
    description: 'Campañas asociadas a la organización',
  })
  @OneToMany(() => Campaigns, (campaign) => campaign.organizacion)
  campaigns: Campaigns[];
}
