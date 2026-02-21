import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('empresas')
export class Empresa {
  
  /**
   * ID único de la Empresa
   * @type {number}
   */
  @ApiProperty({ example: 1, description: 'Id única de la Empresa' })
  @PrimaryGeneratedColumn()
  id: number;
  
  /**
   * CUIL de la Empresa
   * @type {string}
   */
  @ApiProperty({ example: '20-04856975-3', description: 'Cuil de la Empresa' })
  @Column({ type: 'varchar', length: 13, unique: true })
  nroDocumento: string;
  
  /**
   * Nombre Legal de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: 'Supermercados Unidos S.A.',
    description: 'El nombre legal registrado de la empresa colaboradora',
  })
  @Column({ type: 'varchar', length: 255 })
  razon_social: string;
  
  /**
   * Nombre Comercial de la Empresa
   * @type {string}
   */
  @ApiProperty({ example: 'INSERT-NOMBRE', description: 'Nombre Comercial de la Empresa' })
  @Column({ type: 'varchar', length: 50 })
  nombre_fantasia: string; // Hace falta realmente ¿? Reemplazar por mail ¿?
  
  /**
   * Descripción de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example:
      'Supermercados Unidos S.A. impulsa la solidaridad mediante bonificaciones a clientes que donan a causas sociales.',
    description:
      'Descripción de la empresa colaboradora y su rol en la iniciativa de donaciones',
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;
  
  /**
   * Rubro de la Empresa
   * @type {string}
   */
  @ApiProperty({ example: 'Supermercado', description: 'Rubro de la Empresa' })
  @Column({ type: 'varchar', length: 15 })
  rubro: string;
  
  /**
   * Teléfono de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: '+54 11 4567-8900',
    description: 'Telefono de la Empresa',
  })
  @Column({ type: 'varchar', length: 25 })
  telefono: string;
  
  /**
   * Dirección de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: 'Calle falsa 123',
    description: 'La dirección donde reside la Empresa',
  })
  @Column({ type: 'varchar', length: 150 })
  direccion: string;
  
  /**
   * Sitio Web de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: 'www.supermercadosunidos.com.ar',
    description: 'Sitio Web de la Empresa',
  })
  @Column({ type: 'varchar', length: 255 })
  web: string;
  
  /**
   * // TEXTO
   * @type {boolean}
   */
  @ApiProperty({
    example: true,
    description: 'Representa si la Empresa es legítima',
  })
  @Column({ type: 'bit', default: false })
  verificada: boolean;
  
  /**
   * // TEXTO
   * @type {boolean}
   */
  @ApiProperty({
    example: false,
    description: 'Indica si la Empresa esta deshabilitada en el sitio',
  })
  @Column({ type: 'bit', default: false })
  deshabilitado: boolean;
  
  /**
   * Fecha de Registro de la Empresa
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del Registro de la Empresa en el sitio',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;
  
  /**
   * Fecha del último cambio de la Empresa
   * @type {Date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del ultimo cambio de información de la Empresa',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;
  
  /**
   * Correo Electrónico de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: 'correo@dominio.com',
    description: 'Correo electronico del usuario de la empresa.',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;
  
  /**
   * Contraseña del Usuario de la Empresa
   * @type {string}
   */
  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario de la empresa.',
  })
  @Column({ type: 'varchar', length: 255 })
  clave: string;

  /**
   * Logo de la empresa
   * @type {string}
   */
  @ApiProperty({ example: 'logo.jpg', description: 'Loog de la Empresa' })
  @Column({ type: 'varchar', length: 255, nullable: true})
  logo: string;
}
