// 📁 src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID único del usuario' })
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ApiProperty({ description: 'Email único del usuario' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  correo: string;

  @ApiProperty({ description: 'Contraseña hasheada' })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
  })
  clave: string;

  @ApiProperty({
    description: 'Tipo de usuario',
    enum: ['usuario', 'empresa', 'organizacion'],
  })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  type: string;

  @ApiProperty({
    description: 'Nombre de la calle del domicilio del usuario',
    example: 'Av. Siempre Viva',
  })
  @Column({ type: 'varchar', length: 80, nullable: true })
  calle?: string;

  @ApiProperty({
    description: 'Número de la dirección del usuario',
    example: '742',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  numero?: string;

  @ApiProperty({
    description: 'Código postal del domicilio del usuario',
    example: '1638',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigoPostal?: string;

  @ApiProperty({
    description: 'Provincia del domicilio del usuario',
    example: 'Buenos Aires',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  provincia?: string;

  @ApiProperty({
    description: 'Ciudad del domicilio del usuario',
    example: 'Vicente López',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ciudad?: string;

  @ApiProperty({
    description: 'Prefijo telefónico del usuario',
    example: '+54',
  })
  @Column({ type: 'varchar', length: 5, nullable: true })
  prefijo?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '11-1234-5678',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de Registro del Usuario',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima Conexión del Usuario al sitio',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  ultima_conexion: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima modificación del Usuario',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  ultimo_cambio: Date;

  @ApiProperty({ example: false, description: 'Estado del Usuario' })
  @Column({ type: 'bit', default: false })
  deshabilitado: boolean;
}
