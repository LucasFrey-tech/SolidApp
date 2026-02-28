import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilEmpresa } from './perfil_empresa.entity';
import { BeneficioEstado } from '../Modules/benefit/dto/enum/enum';
import { UsuarioBeneficio } from './usuario-beneficio.entity';

@Entity('beneficios')
export class Beneficios {
  /**
   * ID unico del Beneficio
   * @type {number}
   */
  @ApiProperty({ example: 1, description: 'Id único del Beneficio' })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Titulo del Beneficio
   * @type {string}
   */
  @ApiProperty({
    example: 'Descuento del 15!!',
    description: 'Titulo del Beneficio',
  })
  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  /**
   * Tipo del Beneficio
   * @type {string}
   */
  @ApiProperty({ example: 'Discount', description: 'Tipo del Beneficio' })
  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  /**
   * Informacion detallada del Beneficio
   * @type {string}
   */
  @ApiProperty({
    example: 'Descuento en articulos de Supermecado',
    description: 'Información detallada del Beneficio',
  })
  @Column({ type: 'varchar', length: 255 })
  detalle: string;

  /**
   * Cantidad del Beneficio disponible
   * @type {number}
   */
  @ApiProperty({
    example: 50,
    description: 'La cantidad del Beneficio disponible',
  })
  @Column({ type: 'int' })
  cantidad: number;

  /**
   * Fecha de Creacion del Beneficio
   * @type {date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha de Creación del Beneficio',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  /**
   * Fecha del ultimo cambio del Beneficio
   * @type {date}
   */
  @ApiProperty({
    example: '2025-12-15T10:30:45Z',
    description: 'Fecha del ultimo cambio realizado al Beneficio',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;

  /**
   * Valor del Beneficio
   * @type {number}
   */
  @ApiProperty({
    example: 100,
    description: 'El valor del Beneficio',
  })
  @Column({ type: 'int' })
  valor: number;

  /**
   * Estado del Beneficio
   * @type {string}
   */
  @ApiProperty({
    example: 'pendiente',
    description: 'Estado del Beneficio',
  })
  @Column({ type: 'varchar', length: 20, default: BeneficioEstado.PENDIENTE })
  estado: BeneficioEstado;

  /**
   * Empresa dueña del Beneficio
   * @type {Empresa}
   */
  @ApiProperty({ example: 1, description: 'Id Foranea de la Empresa' })
  @ManyToOne(() => PerfilEmpresa, (empresa) => empresa.beneficios)
  @JoinColumn({ name: 'id_empresa' })
  empresa: PerfilEmpresa;

  @OneToMany(() => UsuarioBeneficio, (ub) => ub.beneficio)
  usuariosCanje: UsuarioBeneficio[];
}
