// organizations.entity.ts
import { Entity, ChildEntity, Column, OneToMany } from 'typeorm';
import { Campaigns } from './campaigns.entity';
import { BaseAccount } from './cuenta_base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('organizaciones')
@ChildEntity('organizacion')
export class Organizations extends BaseAccount {
  @ApiProperty({
    description: 'CUIT único de la organización',
    example: '30-98765432-1',
  })
  @Column({ type: 'varchar', length: 13, unique: true })
  cuit_organizacion: string;

  @ApiProperty({
    description: 'Razón social registrada de la organización',
    example: 'Fundación Ejemplo',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_social: string;

  @ApiProperty({
    description: 'Nombre de fantasía o comercial de la organización',
    example: 'Fundación Esperanza',
  })
  @Column({ type: 'varchar', length: 50 })
  nombre_fantasia: string;

  @ApiProperty({
    description: 'Descripción breve de la organización',
    example: 'Organización sin fines de lucro dedicada a la educación.',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({
    description: 'Teléfono de contacto de la organización',
    example: '+54 11 5555-6666',
  })
  @Column({ type: 'varchar', length: 25 })
  telefono: string;

  @ApiProperty({
    description: 'Dirección física de la organización',
    example: 'Calle Falsa 123, Buenos Aires',
  })
  @Column({ type: 'varchar', length: 25 })
  direccion: string;

  @ApiProperty({
    description: 'Sitio web oficial de la organización',
    example: 'https://www.fundacion-ejemplo.org',
  })
  @Column({ type: 'varchar', length: 255 })
  web: string;

  @ApiProperty({
    description: 'Campañas asociadas a la organización',
    type: () => [Campaigns],
    required: false,
  })
  @OneToMany(() => Campaigns, (campaign) => campaign.organizacion)
  campaigns: Campaigns[];
}
