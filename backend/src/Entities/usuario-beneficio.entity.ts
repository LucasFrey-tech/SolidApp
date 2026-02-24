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
import { PerfilUsuario } from './perfil_Usuario.entity';
import { Beneficios } from './beneficio.entity';
import { BeneficiosUsuarioEstado } from '../Modules/benefit/dto/enum/enum';

@Entity('usuarios_beneficios')
export class UsuarioBeneficio {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PerfilUsuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: PerfilUsuario;

  @ManyToOne(() => Beneficios)
  @JoinColumn({ name: 'id_beneficio' })
  beneficio: Beneficios;

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
    default: BeneficiosUsuarioEstado.ACTIVO,
  })
  estado: BeneficiosUsuarioEstado;

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
