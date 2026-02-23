import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class UpdateUsuarioDto {
  @ApiProperty({
    description: 'Nombre de la calle del domicilio (opcional)',
    example: 'Av. Libertador',
    required: false,
  })
  @Column({ type: 'varchar', length: 80, nullable: true })
  calle: string;

  @ApiProperty({
    description: 'Número de la dirección (opcional)',
    example: '742',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  numero: string;
  @ApiProperty({
    description: 'Código postal (opcional)',
    example: 'B1638',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo_postal: string;

  @ApiProperty({
    description: 'Ciudad de residencia (opcional)',
    example: 'Villa Ballester',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ciudad: string;

  @ApiProperty({
    description: 'Provincia de residencia (opcional)',
    example: 'Buenos Aires',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  provincia: string;

  @ApiProperty({
    description: 'Prefijo telefónico (opcional)',
    example: '+54',
    required: false,
  })
  @Column({ type: 'varchar', length: 5, nullable: true })
  prefijo: string;

  @ApiProperty({
    description: 'Número de teléfono (opcional)',
    example: '11-4444-5555',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;
}
