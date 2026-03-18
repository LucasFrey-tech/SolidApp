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
import { Empresa } from './empresa.entity';
import { RolSecundario } from '../Modules/user/enums/enums';

/**
 * Entidad EmpresaUsuario
 * Tabla intermedia N:M entre Usuario y Empresa
 * Almacena información adicional sobre la relación (rol, fecha, estado)
 */
@Entity('empresa_usuario')
@Unique(['usuario', 'empresa'])
export class EmpresaUsuario {
  @ApiProperty({
    example: 1,
    description: 'ID único de la relación (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 5,
    description: 'ID del usuario que gestiona la empresa',
  })
  @Column({ type: 'int', nullable: false })
  id_usuario: number;

  @ApiProperty({
    example: 2,
    description: 'ID de la empresa gestionada',
  })
  @Column({ type: 'int', nullable: false })
  id_empresa: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha en que el usuario fue asignado a la empresa',
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

  // ==================== RELACIONES ====================

  @ApiProperty({
    description: 'Usuario que gestiona',
    type: () => Usuario,
  })
  @ManyToOne(() => Usuario, (usuario) => usuario.empresaUsuario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ApiProperty({
    description: 'Empresa gestionada',
    type: () => Empresa,
  })
  @ManyToOne(() => Empresa, (empresa) => empresa.empresaUsuarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
