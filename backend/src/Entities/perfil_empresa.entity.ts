import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Cuenta } from './cuenta.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Beneficios } from './beneficio.entity';

@Entity()
export class PerfilEmpresa {
  /**
   * ID único de la Empresa
   * @type {number}
   */
  @ApiProperty({
    description: 'Identificador único del perfil de la empresa',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * CUIL de la Empresa
   * @type {string}
   */
  @ApiProperty({
    description: 'CUIT único de la empresa',
    example: '30-12345678-9',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  cuit: string;

  /**
   * Nombre Legal de la Empresa
   * @type {string}
   */
  @ApiProperty({
    description: 'Razón social registrada de la empresa',
    example: 'Comercializadora Ejemplo S.A.',
  })
  @Column({ type: 'varchar', length: 100 })
  razon_social: string;

  /**Rubro de la Empresa
   * @type {string}
   * */
  @ApiProperty({ example: 'Supermercado', description: 'Rubro de la Empresa' })
  @Column({ type: 'varchar', length: 50, default: '' })
  rubro: string;

  /**
   * Nombre Comercial de la Empresa
   * @type {string}
   */
  @ApiProperty({
    description: 'Nombre comercial o de fantasía de la empresa',
    example: 'Ejemplo Market',
  })
  @Column({ type: 'varchar', length: 15 })
  nombre_empresa: string;

  /**
   * Descripción de la Empresa
   * @type {string}
   */
  @ApiProperty({
    description: 'Descripción breve de la empresa',
    example: 'Empresa dedicada a la venta de productos tecnológicos.',
  })
  @Column({ type: 'varchar', length: 15, default: '' })
  descripcion: string;

  /**
   * Verificación
   * @type {boolean}
   */
  @ApiProperty({
    description: 'Indica si la empresa está verificada',
    example: true,
    default: false,
  })
  @Column({ default: false })
  verificada: boolean;

  /**
   * Logo de la empresa
   * @type {string}
   */
  @ApiProperty({
    description: 'Logo de la empresa en formato URL',
    example: 'https://cdn.ejemplo.com/logo.png',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  /**
   * Sitio Web de la Empresa
   * @type {string}
   */
  @ApiProperty({
    description: 'Sitio web oficial de la empresa',
    example: 'https://www.ejemplo.com',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  web: string;

  /**
   * Informacion base del usuario
   * @type {Cuenta}
   */
  @ApiProperty({
    description: 'Cuenta asociada al perfil de la empresa',
    type: () => Cuenta,
  })
  @OneToOne(() => Cuenta)
  @JoinColumn()
  cuenta: Cuenta;

  /**
   * Beneficios de la empresa
   * @type {Empresa}
   */
  @ApiProperty({
    description: 'Cupones asociados a la empresa',
    type: () => Beneficios,
  })
  @OneToMany(() => Beneficios, (beneficio) => beneficio.empresa)
  beneficios: Beneficios[];
}
