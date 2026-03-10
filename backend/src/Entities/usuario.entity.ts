import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Donaciones } from './donacion.entity';
import { UsuarioBeneficio } from './usuario-beneficio.entity';
import { RankingDonador } from './ranking.entity';
import { EmpresaUsuario } from './empresa_usuario.entity';
import { OrganizacionUsuario } from './organizacion_usuario.entity';
import { Contacto } from './contacto.entity';
import { Direccion } from './direccion.entity';

export enum Rol {
  USUARIO = 'USUARIO',
  GESTOR = 'GESTOR',
  ADMIN = 'ADMIN',
}

/**
 * Entidad Usuario
 * Fusión de las antiguas tablas: cuenta + perfil_usuario
 * Representa a TODAS las personas físicas del sistema (donadores, gestores, admins)
 */
@Entity('usuarios')
export class Usuario {
  @ApiProperty({
    example: 1,
    description: 'ID único del usuario (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  // ==================== DATOS DE AUTENTICACIÓN (antes en cuenta) ====================

  @ApiProperty({
    example: '$2b$10$...',
    description: 'Contraseña hasheada con bcrypt',
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude()
  clave: string;

  @ApiProperty({
    example: 'USUARIO',
    description: 'Rol del usuario en el sistema',
    enum: ['USUARIO', 'GESTOR', 'ADMIN'],
  })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: Rol.USUARIO,
  })
  rol: Rol;

  // ==================== DATOS PERSONALES (antes en perfil_usuario) ====================

  @ApiProperty({
    example: '12345678',
    description: 'Número de documento/DNI del usuario (único)',
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
  documento: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  apellido: string;

  @ApiProperty({
    example: 50000,
    description: 'Puntos acumulados por donaciones',
    default: 0,
  })
  @Column({ type: 'int', nullable: true, default: 0 })
  puntos: number;

  @ApiPropertyOptional({
    example: 'IT',
    description: 'Departamento del usuario (opcional)',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  departamento?: string;

  // ==================== RELACIONES CON CONTACTO ====================

  @ApiProperty({
    description: 'Información de contacto del usuario (correo y teléfono)',
    type: () => Contacto,
  })
  @OneToOne(() => Contacto, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'contacto_id' })
  contacto: Contacto;

  @ApiPropertyOptional({
    description: 'Dirección física del usuario',
    type: () => Direccion,
  })
  @OneToOne(() => Direccion, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'direccion_id' })
  direccion?: Direccion;

  // ==================== CAMPOS DEL SISTEMA ====================

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario está habilitado',
    default: false,
  })
  @Column({ type: 'bit', nullable: false, default: true })
  habilitado: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el email del usuario está verificado',
    default: false,
  })
  @Column({ type: 'bit', nullable: false, default: false })
  verificado: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de registro del usuario',
  })
  @CreateDateColumn({ type: 'datetime2', nullable: false })
  fecha_registro: Date;

  @ApiProperty({
    example: '2024-03-20T15:45:00Z',
    description: 'Fecha de última modificación',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: false })
  ultimo_cambio: Date;

  @ApiPropertyOptional({
    example: '2024-03-20T15:45:00Z',
    description: 'Fecha de última conexión',
  })
  @Column({ type: 'datetime2', nullable: true })
  ultima_conexion: Date;

  @ApiPropertyOptional({
    example: 'a1b2c3d4e5f6...',
    description: 'Token para recuperación de contraseña',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  resetPasswordToken?: string;

  @ApiPropertyOptional({
    example: '2024-03-21T10:00:00Z',
    description: 'Fecha de expiración del token de recuperación',
  })
  @Column({ type: 'datetime2', nullable: true })
  @Exclude()
  resetPasswordExpires?: Date;

  // ==================== RELACIONES N:M CON EMPRESAS ====================

  @ApiPropertyOptional({
    description: 'Relaciones empresa-usuario (tabla intermedia con detalles)',
    type: () => [EmpresaUsuario],
  })
  @OneToMany(() => EmpresaUsuario, (empresaUsuario) => empresaUsuario.usuario)
  empresaUsuarios?: EmpresaUsuario[];

  // ==================== RELACIONES N:M CON ORGANIZACIONES ====================

  @ApiPropertyOptional({
    description:
      'Relaciones organizacion-usuario (tabla intermedia con detalles)',
    type: () => [OrganizacionUsuario],
  })
  @OneToMany(() => OrganizacionUsuario, (orgUsuario) => orgUsuario.usuario)
  organizacionUsuarios?: OrganizacionUsuario[];

  // ==================== RELACIONES DE DONADOR ====================

  @ApiPropertyOptional({
    description: 'Donaciones realizadas por este usuario',
    type: () => [Donaciones],
  })
  @OneToMany(() => Donaciones, (donacion) => donacion.usuario)
  donaciones?: Donaciones[];

  @ApiPropertyOptional({
    description: 'Beneficios reclamados por este usuario',
    type: () => [UsuarioBeneficio],
  })
  @OneToMany(
    () => UsuarioBeneficio,
    (usuarioBeneficio) => usuarioBeneficio.usuario,
  )
  usuarioBeneficios?: UsuarioBeneficio[];

  @ApiPropertyOptional({
    description: 'Registro en el ranking de donadores',
    type: () => RankingDonador,
  })
  @OneToMany(() => RankingDonador, (ranking) => ranking.usuario)
  rankingDonador?: RankingDonador;
}
