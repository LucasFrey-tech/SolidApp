import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
import { Beneficios } from './beneficio.entity';

@Entity('usuarios_beneficios')
export class UsuarioBeneficio {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  /* ===============================
     RELACIONES
  ================================ */

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Beneficios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_beneficio' })
  beneficio: Beneficios;

  /* ===============================
     DATOS DEL CUPÓN PARA EL USUARIO
  ================================ */

  @ApiProperty({
    example: 3,
    description: 'Cantidad de cupones que tiene el usuario',
  })
  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @ApiProperty({
    example: 1,
    description: 'Cantidad de cupones ya usados',
  })
  @Column({ type: 'int', default: 0 })
  usados: number;

  @ApiProperty({
    example: 'activo',
    description: 'Estado del cupón para el usuario',
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'activo',
  })
  estado: 'activo' | 'usado' | 'vencido';

  /* ===============================
     FECHAS
  ================================ */

  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha en que el usuario reclamó el beneficio',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_reclamo: Date;

  @ApiProperty({
    example: '2025-12-20T10:30:45Z',
    description: 'Fecha en que el beneficio fue usado',
    required: false,
  })
  @Column({ type: 'datetime2', nullable: true })
  fecha_uso?: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;
}
