import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidad Direccion
 * Almacena información de ubicación física reutilizable para Usuarios, Empresas y Organizaciones
 */
@Entity('direcciones')
export class Direccion {
  @ApiProperty({
    example: 1,
    description: 'ID único de la dirección (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    example: 'Av. Corrientes',
    description: 'Nombre de la calle',
  })
  @Column({ type: 'varchar', length: 80, nullable: true })
  calle?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Número de la calle',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  numero?: string;

  @ApiPropertyOptional({
    example: 'Piso 5, Dpto B',
    description: 'Información adicional (piso, departamento, oficina, etc.)',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  adicional?: string;

  @ApiPropertyOptional({
    example: 'C1043',
    description: 'Código postal',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_postal?: string;

  @ApiPropertyOptional({
    example: 'Buenos Aires',
    description: 'Ciudad',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ciudad?: string;

  @ApiPropertyOptional({
    example: 'CABA',
    description: 'Provincia o estado',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  provincia?: string;
}
