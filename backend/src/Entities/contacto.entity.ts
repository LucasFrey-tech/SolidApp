import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidad Contacto
 * Almacena información de contacto reutilizable para Usuarios, Empresas y Organizaciones
 */
@Entity('contacto')
export class Contacto {
  @ApiProperty({
    example: 1,
    description: 'ID único del contacto (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'contacto@example.com',
    description: 'Email de contacto (único)',
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  correo: string;

  @ApiPropertyOptional({
    example: '11',
    description: 'Prefijo telefónico (código de área)',
  })
  @Column({ type: 'varchar', length: 5, nullable: true })
  prefijo?: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Número de teléfono',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;
}
