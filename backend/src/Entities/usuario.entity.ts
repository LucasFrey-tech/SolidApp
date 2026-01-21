import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('usuarios')
export class Usuario {
  @ApiProperty({ example: 1, description: 'Id Único del Usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Número de documento del usuario',
    example: '12345678',
  })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  documento: string;

  @ApiProperty({ example: 'Lucas', description: 'Nombre del Usuario' })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({ example: 'Frey', description: 'Apellido del Usuario' })
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @ApiProperty({
    example: 'correofalso@gmail.com',
    description: 'Correo Electronico del Usuario',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @ApiProperty({
    example: 'asdasd',
    description: 'Clave de accedo del Usuario',
  })
  @Column({ type: 'varchar', length: 255 })
  clave: string;

  @ApiProperty({ example: 'admin', description: 'Rol del Usuario en el sitio' })
  @Column({ type: 'varchar', length: 50 })
  rol: string;

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
    description: 'Departamento, piso o unidad del domicilio del usuario',
    example: 'Depto 3B',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  departamento?: string;

  @ApiProperty({
    description: 'Código postal del domicilio del usuario',
    example: '1638',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigoPostal?: string;

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
    description: 'Provincia del domicilio del usuario',
    example: 'Buenos Aires',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  provincia?: string;

  @ApiProperty({ example: 'profile.jpg', description: 'Imagen del Usuario' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen!: string;

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

  @ApiProperty({
    example: 150,
    description: 'Puntos acumulados del usuario',
  })
  @Column({ type: 'int', default: 0 })
  puntos: number;
}
