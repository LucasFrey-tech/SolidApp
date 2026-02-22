// empresa.entity.ts
import { Entity, ChildEntity, Column } from 'typeorm';
import { BaseAccount } from './cuenta_base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('empresas')
@ChildEntity('empresa')
export class Empresa extends BaseAccount {
  @ApiProperty({
    description: 'CUIT único de la empresa',
    example: '30-12345678-9',
  })
  @Column({ type: 'varchar', length: 13, unique: true })
  cuit_empresa: string;

  @ApiProperty({
    description: 'Razón social registrada de la empresa',
    example: 'Comercializadora Ejemplo S.A.',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_social: string;

  @ApiProperty({
    description: 'Nombre de fantasía o comercial de la empresa',
    example: 'Ejemplo Market',
  })
  @Column({ type: 'varchar', length: 50 })
  nombre_fantasia: string;

  @ApiProperty({
    description: 'Descripción breve de la empresa',
    example: 'Empresa dedicada a la venta de productos tecnológicos.',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({
    description: 'Rubro o sector económico de la empresa',
    example: 'Tecnología',
  })
  @Column({ type: 'varchar', length: 15 })
  rubro: string;

  @ApiProperty({
    description: 'Teléfono de contacto de la empresa',
    example: '+54 11 4444-5555',
  })
  @Column({ type: 'varchar', length: 25 })
  telefono: string;

  @ApiProperty({
    description: 'Dirección física de la empresa',
    example: 'Av. Siempre Viva 742, Buenos Aires',
  })
  @Column({ type: 'varchar', length: 150 })
  direccion: string;

  @ApiProperty({
    description: 'Sitio web oficial de la empresa',
    example: 'https://www.ejemplo.com',
  })
  @Column({ type: 'varchar', length: 255 })
  web: string;

  @ApiProperty({
    description: 'Logo de la empresa en formato URL (opcional)',
    example: 'https://cdn.ejemplo.com/logo.png',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string;
}
