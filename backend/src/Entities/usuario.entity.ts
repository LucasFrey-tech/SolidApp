import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UsuarioBeneficio } from './usuario-beneficio.entity';

@Entity('usuarios')
export class Usuario {
    
  /**
   * ID único del Usuario
   * @type {number}
   */
  @ApiProperty({ example: 1, description: 'Id Único del Usuario' })
  @PrimaryGeneratedColumn()
  id: number;
    
  /**
   * DNI del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Número de documento del usuario',
    example: '12345678',
  })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  documento: string;

  /**
   * Nombre del Usuario
   * @type {string}
   */
  @ApiProperty({ example: 'Lucas', description: 'Nombre del Usuario' })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /**
   * Apellido del Usuario
   * @type {string}
   */
  @ApiProperty({ example: 'Frey', description: 'Apellido del Usuario' })
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  /**
   * Correo Elecrtónico del Usuario
   * @type {string}
   */
  @ApiProperty({
    example: 'correofalso@gmail.com',
    description: 'Correo Electronico del Usuario',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  /**
   * Contraseña del Usuario
   * @type {string}
   */
  @ApiProperty({
    example: 'asdasd',
    description: 'Clave de accedo del Usuario',
  })
  @Column({ type: 'varchar', length: 255 })
  clave: string;

  /**
   * Rol del Usuario en el sitio web
   * @type {string}
   */
  @ApiProperty({ example: 'admin', description: 'Rol del Usuario en el sitio' })
  @Column({ type: 'varchar', length: 50 })
  rol: string;

  /**
   * Domicilio del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Nombre de la calle del domicilio del usuario',
    example: 'Av. Siempre Viva',
  })
  @Column({ type: 'varchar', length: 80, nullable: true })
  calle?: string;

  /**
   * Numero de la Direccion del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Número de la dirección del usuario',
    example: '742',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  numero?: string;

  /**
   * Departamento, Piso o Unidad del domicilio del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Departamento, piso o unidad del domicilio del usuario',
    example: 'Depto 3B',
    required: false,
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  departamento?: string;

  /**
   * Código Postal del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Código postal del domicilio del usuario',
    example: '1638',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  codigoPostal?: string;

  /**
   * Ciudad del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Ciudad del domicilio del usuario',
    example: 'Vicente López',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ciudad?: string;

  /**
   * Prefijo telefónico del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Prefijo telefónico del usuario',
    example: '+54',
  })
  @Column({ type: 'varchar', length: 5, nullable: true })
  prefijo?: string;

  /**
   * Número de Teléfono del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '11-1234-5678',
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  /**
   * Provincia del domicilio del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Provincia del domicilio del usuario',
    example: 'Buenos Aires',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  provincia?: string;

  /**
   * Imágen del Usuario
   * @type {string}
   */
  @ApiProperty({ example: 'profile.jpg', description: 'Imagen del Usuario' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen!: string;

  /**
   * Decha de Registro del Usuario
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de Registro del Usuario',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  /**
   * Ultima Conexión del Usuario
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima Conexión del Usuario al sitio',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  ultima_conexion: Date;

  /**
   * Ultima modificación del Usuario
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Ultima modificación del Usuario',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  ultimo_cambio: Date;

  /**
   * Estado del Usuario
   * @type {boolean}
   */
  @ApiProperty({ example: false, description: 'Estado del Usuario' })
  @Column({ type: 'bit', default: false })
  deshabilitado: boolean;

  /**
   * Puntos acumulados del Usuario
   * @type {number}
   */
  @ApiProperty({
    example: 150,
    description: 'Puntos acumulados del usuario',
  })
  @Column({ type: 'int', default: 0 })
  puntos: number;

  /**
   * Beneficios asociados al Usuario
   * @type {UsuarioBeneficio}
   */
  @OneToMany(() => UsuarioBeneficio, (ub) => ub.beneficio)
  usuarios: UsuarioBeneficio[];
}
