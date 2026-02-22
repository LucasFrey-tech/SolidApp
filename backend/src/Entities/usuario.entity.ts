// usuario.entity.ts
import {
  Entity,
  ChildEntity,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BaseAccount } from './cuenta_base.entity';
import { Donations } from './donations.entity';
import { UsuarioBeneficio } from './usuario-beneficio.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('usuarios')
@ChildEntity('usuario')
export class Usuario extends BaseAccount {
  @ApiProperty({
    description: 'Documento único del usuario (DNI, pasaporte, etc.)',
    example: '12345678',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  documento: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Lucas',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @ApiProperty({
    description: 'Rol del usuario dentro del sistema',
    example: 'beneficiario',
  })
  @Column({ type: 'varchar', length: 50 })
  rol: string;

  @ApiProperty({
    description: 'Cantidad de puntos acumulados por el usuario',
    example: 120,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  puntos: number;

  @ApiProperty({
    description: 'Nombre de la calle del domicilio (opcional)',
    example: 'Av. Libertador',
    required: false,
  })
  @Column({ type: 'varchar', length: 80, nullable: true })
  calle?: string;

  @ApiProperty({
    description: 'Número de la dirección (opcional)',
    example: '742',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  numero?: string;

  @ApiProperty({
    description: 'Departamento o piso (opcional)',
    example: '3B',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  departamento?: string;

  @ApiProperty({
    description: 'Código postal (opcional)',
    example: 'B1638',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigoPostal?: string;

  @ApiProperty({
    description: 'Ciudad de residencia (opcional)',
    example: 'Villa Adelina',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ciudad?: string;

  @ApiProperty({
    description: 'Prefijo telefónico (opcional)',
    example: '+54',
    required: false,
  })
  @Column({ type: 'varchar', length: 5, nullable: true })
  prefijo?: string;

  @ApiProperty({
    description: 'Número de teléfono (opcional)',
    example: '11-4444-5555',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @ApiProperty({
    description: 'Provincia de residencia (opcional)',
    example: 'Buenos Aires',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  provincia?: string;

  @ApiProperty({
    description: 'Fecha y hora de la última conexión del usuario',
    example: '2026-02-21T21:54:00.000Z',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  ultima_conexion: Date;

  @ApiProperty({
    description: 'Beneficios asociados al usuario',
    type: () => [UsuarioBeneficio],
    required: false,
  })
  @OneToMany(() => UsuarioBeneficio, (ub) => ub.beneficio)
  usuarios: UsuarioBeneficio[];

  @ApiProperty({
    description: 'Donaciones realizadas por el usuario',
    type: () => [Donations],
    required: false,
  })
  @OneToMany(() => Donations, (donacion) => donacion.usuario)
  donaciones: Donations[];
}
