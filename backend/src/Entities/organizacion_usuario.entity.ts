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
import { RolSecundario } from '../Modules/user/enums/enums';

/**
 * Entidad OrganizacionUsuario
 * Tabla intermedia N:M entre Usuario y Organizacion
 * Almacena información adicional sobre la relación (rol, fecha, estado)
 */
@Entity('organizacion_usuario')
@Unique(['usuario', 'organizacion'])
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

  @ApiProperty({
    example: 'MIEMBRO',
    description: 'Rol del usuario dentro de la empresa',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: RolSecundario.MIEMBRO,
  })
  rol: RolSecundario;

  @ApiProperty({
    description: 'Usuario que gestiona',
    type: () => Usuario,
  })
  @ManyToOne(() => Usuario, (usuario) => usuario.organizacionUsuario, {
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
