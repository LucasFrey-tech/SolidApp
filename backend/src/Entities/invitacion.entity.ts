import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolSecundario } from '../Modules/user/enums/enums';
import { Usuario } from './usuario.entity';
import { Empresa } from './empresa.entity';
import { Organizacion } from './organizacion.entity';

@Entity('invitaciones')
export class Invitacion {
  @ApiProperty({
    example: 1,
    description: 'ID único de la invitación',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'f9a3c5d7e8b1...',
    description: 'Token único utilizado para aceptar la invitación',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  token: string;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Correo electrónico del usuario invitado',
  })
  @Column({ type: 'varchar', length: 255 })
  correo: string;

  // ================================
  // RELACIÓN: EMPRESA (opcional)
  // ================================
  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'empresaId' })
  empresa?: Empresa;

  @Column({ nullable: true })
  empresaId?: number;

  // ================================
  // RELACIÓN: ORGANIZACIÓN (opcional)
  // ================================
  @ManyToOne(() => Organizacion, { nullable: true })
  @JoinColumn({ name: 'organizacionId' })
  organizacion?: Organizacion;

  @Column({ nullable: true })
  organizacionId?: number;

  // ================================
  // RELACIÓN: USUARIO QUE INVITA
  // ================================
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'invitadorID' })
  invitador: Usuario;

  @Column()
  invitadorID: number;

  // ================================
  // RELACIÓN: USUARIO QUE ACEPTA 
  // ================================
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuarioId' })
  usuario?: Usuario;

  @Column({ nullable: true })
  usuarioId?: number;

  @ApiProperty({
    example: 'MIEMBRO',
    description: 'Rol que tendrá el usuario al aceptar la invitación',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: RolSecundario.MIEMBRO,
  })
  rol: RolSecundario;

  @ApiProperty({
    example: false,
    description: 'Indica si la invitación ya fue utilizada',
  })
  @Column({ default: false })
  expirada: boolean;

  @ApiProperty({
    example: '2026-03-14T10:30:00Z',
    description: 'Fecha de creación de la invitación',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_creacion: Date;

  @ApiPropertyOptional({
    example: '2026-03-20T10:30:00Z',
    description: 'Fecha de expiración de la invitación',
  })
  @Column({ type: 'datetime2', nullable: true })
  fecha_expiracion?: Date;

  // ================================
  // ESTADO CALCULADO
  // ================================
  get estado(): 'pendiente' | 'usada' | 'expirada' {
    if (this.expirada) return 'usada';
    if (this.fecha_expiracion && this.fecha_expiracion < new Date())
      return 'expirada';
    return 'pendiente';
  }
}