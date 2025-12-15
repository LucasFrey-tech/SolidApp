import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('usuarios')
export class User {
  @ApiProperty({ example: 1, description: 'Id Único del Usuario' })
  @PrimaryGeneratedColumn()
  id: number;

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
    example: 'calle falsa 123',
    description: 'Dirección del domicilio del usuarios',
  })
  @Column({ type: 'varchar', length: 255 })
  direccion: string;

  @ApiProperty({ example: 'profile.jpg', description: 'Imagen del Usuario' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen!: string;

  @ApiProperty({
    example: '15-12-2025',
    description: 'Fecha de Registro del Usuario',
  })
  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima Conexión del Usuario al sitio',
  })
  @Column({ type: 'timestamp', nullable: true })
  ultima_conexion: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima modificación del Usuario',
  })
  @Column({ type: 'timestamp', nullable: true })
  ultimo_cambio: Date;

  @ApiProperty({ example: false, description: 'Estado del Usuario' })
  @Column({ type: 'boolean', default: false })
  deshabilitado: boolean;
}
