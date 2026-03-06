import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
import { Organizacion } from './organizacion.entity';

/**
 * Entidad OrganizacionUsuario
 * Tabla intermedia N:M entre Usuario y Organizacion
 * Almacena información adicional sobre la relación (rol, fecha, estado)
 */
@Entity('organizacion_usuario')
@Unique(['usuario', 'organizacion']) // No duplicar mismo usuario-organización
export class OrganizacionUsuario {
  @ApiProperty({
    example: 1,
    description: 'ID único de la relación (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 5,
    description: 'ID del usuario que gestiona la organización',
  })
  @Column({ type: 'int', nullable: false })
  id_usuario: number;

  @ApiProperty({
    example: 2,
    description: 'ID de la organización gestionada',
  })
  @Column({ type: 'int', nullable: false })
  id_organizacion: number;

  /*@ApiProperty({
    example: 'ADMINISTRADOR',
    description: 'Rol del usuario dentro de la organización',
    enum: ['ADMINISTRADOR', 'COLABORADOR', 'EDITOR', 'VISUALIZADOR'],
    default: 'ADMINISTRADOR',
  })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'ADMINISTRADOR',
  })
  rol_en_organizacion:
    | 'ADMINISTRADOR'
    | 'COLABORADOR'
    | 'EDITOR'
    | 'VISUALIZADOR';
  */

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha en que el usuario fue asignado a la organización',
  })
  @CreateDateColumn({ type: 'datetime2', nullable: false })
  fecha_asignacion: Date;

  @ApiProperty({
    example: true,
    description:
      'Indica si la relación está activa (el usuario puede gestionar)',
    default: true,
  })
  @Column({ type: 'bit', nullable: false, default: true })
  activo: boolean;

  // ==================== RELACIONES ====================

  @ApiProperty({
    description: 'Usuario que gestiona',
    type: () => Usuario,
  })
  @ManyToOne(() => Usuario, (usuario) => usuario.organizacionUsuarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ApiProperty({
    description: 'Organización gestionada',
    type: () => Organizacion,
  })
  @ManyToOne(
    () => Organizacion,
    (organizacion) => organizacion.organizacionUsuarios,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizacion;
}
