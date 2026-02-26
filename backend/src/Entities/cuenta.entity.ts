// base-account.entity.ts
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum RolCuenta {
  USUARIO = 'USUARIO',
  EMPRESA = 'EMPRESA',
  ORGANIZACION = 'ORGANIZACION',
  ADMIN = 'ADMIN',
}

@Entity()
export class Cuenta {
  @ApiProperty({
    description: 'Identificador único de la cuenta',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Correo electrónico único asociado a la cuenta',
    example: 'usuario@ejemplo.com',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @ApiProperty({
    description: 'Clave o contraseña en formato encriptado',
    example: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36rY4vEixZaYVK1fsbw1ZfbX3O',
  })
  @Column({ type: 'varchar', length: 255 })
  clave: string;

  @ApiProperty({
    description: 'Rol asignado a la cuenta',
    enum: RolCuenta,
    example: RolCuenta.USUARIO,
  })
  @Column({ type: 'varchar', length: 20 })
  role: RolCuenta;

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

  @ApiProperty({
    description: 'Indica si la cuenta está deshabilitada',
    example: false,
    default: false,
  })
  @Column({ type: 'bit', default: false })
  deshabilitado: boolean;

  @ApiProperty({
    description: 'Indica si la cuenta fue verificada',
    example: true,
    default: false,
  })
  @Column({ type: 'bit', default: false })
  verificada: boolean;

  @ApiProperty({
    description: 'Fecha de registro de la cuenta',
    example: '2026-02-21T21:54:00.000Z',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiProperty({
    description: 'Fecha del último cambio realizado en la cuenta',
    example: '2026-02-21T21:54:00.000Z',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última conexión del usuario',
    example: '2026-02-22T11:55:00.000Z',
    required: false,
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  ultima_conexion: Date;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'datetime2', nullable: true })
  resetPasswordExpires: Date | null;
}
