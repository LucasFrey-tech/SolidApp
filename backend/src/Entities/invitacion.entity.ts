import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidad Invitacion
 * Representa una invitación enviada a un correo para unirse
 * a una empresa y organización dentro del sistema.
 */
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

  @ApiProperty({
    example: 3,
    description: 'ID de la empresa a la que se invita',
  })
  @Column({ nullable: true })
  empresaId?: number;

  @ApiProperty({
    example: 5,
    description: 'ID de la organización a la que se invita',
  })
  @Column({ nullable: true })
  organizacionId?: number;

  @ApiProperty({
    example: 10,
    description: 'ID del usuario que envió la invitación',
  })
  @Column()
  invitadorID: number;

  @ApiProperty({
    example: 'MIEMBRO',
    description: 'Rol que tendrá el usuario al aceptar la invitación',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'MIEMBRO',
  })
  rol: string;

  @ApiProperty({
    example: false,
    description: 'Indica si la invitación ya fue utilizada',
  })
  @Column({ default: false })
  usada: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si la invitación fue cancelada manualmente',
  })
  @Column({ default: false })
  cancelada: boolean;

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
}
