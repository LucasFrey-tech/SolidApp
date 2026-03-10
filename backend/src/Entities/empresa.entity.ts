import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Beneficios } from './beneficio.entity';
import { EmpresaUsuario } from './empresa_usuario.entity';
import { Contacto } from './contacto.entity';
import { Direccion } from './direccion.entity';

/**
 * Entidad Empresa
 * Antes: perfil_empresa
 * Representa empresas que ofrecen beneficios/cupones
 */
@Entity('empresa')
export class Empresa {
  @ApiProperty({
    example: 1,
    description: 'ID único de la empresa (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '30-12345678-9',
    description: 'CUIT de la empresa (único)',
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  cuit: string;

  @ApiProperty({
    example: 'GlobalServ S.R.L.',
    description: 'Razón social de la empresa',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  razon_social: string;

  @ApiProperty({
    example: 'Supermercado',
    description: 'Rubro/categoría de la empresa',
    enum: [
      'Supermercado',
      'Restaurante',
      'Indumentaria',
      'Tecnología',
      'Salud',
      'Educación',
      'Entretenimiento',
      'Deportes',
      'Belleza',
      'Hogar',
      'Otro',
    ],
  })
  @Column({ type: 'varchar', length: 50, nullable: false, default: '' })
  rubro: string;

  @ApiProperty({
    example: 'GlobalServ',
    description: 'Nombre comercial de la empresa',
  })
  @Column({ type: 'varchar', length: 15, nullable: false })
  nombre_empresa: string;

  @ApiProperty({
    description: 'ID del contacto asociado (obligatorio)',
  })
  @Column({ type: 'int', nullable: false })
  contacto_id: number; //ES NECESARIO ???

  @ApiProperty({
    description: 'Información de contacto de la empresa',
    type: () => Contacto,
  })
  @ManyToOne(() => Contacto, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contacto_id' })
  contacto: Contacto;

  @ApiPropertyOptional({
    description: 'ID de la dirección fiscal/comercial (opcional)',
  })
  @Column({ type: 'int', nullable: true })
  direccion_id?: number; // ES NECESARIO ???

  @ApiPropertyOptional({
    description: 'Dirección fiscal/comercial de la empresa',
    type: () => Direccion,
  })
  @ManyToOne(() => Direccion, {
    eager: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'direccion_id' })
  direccion?: Direccion;

  @ApiProperty({
    example: false,
    description: 'Indica si la empresa está verificada por un admin',
    default: false,
  })
  @Column({ type: 'bit', nullable: false, default: false })
  verificada: boolean;

  @ApiPropertyOptional({
    example: 'logo_globalserv.png',
    description: 'Nombre del archivo del logo de la empresa',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string;

  @ApiPropertyOptional({
    example: 'https://www.globalserv.com',
    description: 'Sitio web de la empresa',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  web?: string;

  @ApiProperty({
    example: 'Supermercado mayorista con más de 20 años en el mercado',
    description: 'Descripción de la empresa',
    default: '',
  })
  @Column({ type: 'varchar', length: 500, nullable: false, default: '' })
  descripcion: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de registro de la empresa',
  })
  @CreateDateColumn({ type: 'datetime2', nullable: false })
  fecha_registro: Date;

  @ApiProperty({
    example: '2024-03-20T15:45:00Z',
    description: 'Fecha de última modificación',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: false })
  ultimo_cambio: Date;

  @ApiProperty({
    example: false,
    description: 'Indica si la Empresa está habilitada (bloqueado)',
    default: false,
  })
  @Column({ type: 'bit', nullable: false, default: false })
  habilitada: boolean;

  // ==================== RELACIONES ====================

  @ApiPropertyOptional({
    description: 'Relaciones empresa-usuario con roles (tabla intermedia)',
    type: () => [EmpresaUsuario],
  })
  @OneToMany(() => EmpresaUsuario, (empresaUsuario) => empresaUsuario.empresa)
  empresaUsuarios?: EmpresaUsuario[];

  @ApiPropertyOptional({
    description: 'Beneficios ofrecidos por esta empresa',
    type: () => [Beneficios],
  })
  @OneToMany(() => Beneficios, (beneficio) => beneficio.empresa)
  beneficios?: Beneficios[];
}
