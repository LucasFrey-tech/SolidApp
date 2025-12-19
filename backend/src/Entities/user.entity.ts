import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Donor } from './donor.entity';
import { Organizations_user } from './organization_user.entity';
import { Company_users } from './company_users.entity';

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
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de Registro del Usuario',
  })
  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima Conexión del Usuario al sitio',
  })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  ultima_conexion: Date;

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima modificación del Usuario',
  })
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  ultimo_cambio: Date;

  @ApiProperty({ example: false, description: 'Estado del Usuario' })
  @Column({ type: 'boolean', default: false })
  deshabilitado: boolean;

  @ApiProperty({
    type: () => Donor,
    required: false,
    description:
      'Información del Donador asociada al Usuario (opcional - No todo Usuario es Donador)',
  })
  @OneToOne(() => Donor, (donor) => donor.usuario)
  donor?: Donor;

  @ApiProperty({
    type: () => Organizations_user,
    required: false,
    description: 'Usuario de la Organización',
  })
  @OneToOne(() => Organizations_user, (user) => user.usuario)
  organizationsUser: Organizations_user;

  @ApiProperty({
    type: () => Company_users,
    required: false,
    description: 'Usuario de la Empresa',
  })
  @OneToOne(() => Company_users, (user) => user.usuario)
  companyUser: Company_users[];
}
