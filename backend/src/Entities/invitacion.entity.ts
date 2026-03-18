import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolSecundario } from '../Modules/user/enums/enums';

/**
 * Entidad Invitacion
 * Representa una invitación enviada a un correo para unirse
 * a una empresa o organización dentro del sistema.
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
  @Column({ type: 'varchar', length: 20, default: RolSecundario.MIEMBRO })
  rol: RolSecundario;

  @ApiProperty({
    example: false,
    description: 'Indica si la invitación ya fue utilizada',
  })
  @Column({ default: false })
  expirada: boolean;

  @ApiPropertyOptional({
    example: '2026-03-16T14:00:00Z',
    description:
      'Fecha en que el usuario invitado se registró usando la invitación',
  })
  @Column({ type: 'datetime2', nullable: true })
  fecha_registro?: Date;

  @ApiProperty({
    example: '2026-03-14T10:30:00Z',
    description: 'Fecha de creación de la invitación',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_creacion: Date;
  descripcion: 'Fecha cuando el usuario se registra usando la invitación';

  @ApiPropertyOptional({
    example: '2026-03-20T10:30:00Z',
    description: 'Fecha de expiración de la invitación',
  })
  @Column({ type: 'datetime2', nullable: true })
  fecha_expiracion?: Date;

  // ================================
  // Getter virtual para estado calculado
  // ================================
  get estado(): 'pendiente' | 'usada' | 'expirada' {
    if (this.expirada) return 'usada';
    if (this.fecha_expiracion && this.fecha_expiracion < new Date())
      return 'expirada';
    return 'pendiente';
  }
}
