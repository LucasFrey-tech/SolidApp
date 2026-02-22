// user-profile.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Cuenta } from './cuenta.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Donaciones } from './donacion.entity';
import { UsuarioBeneficio } from './usuario-beneficio.entity';

@Entity()
export class PerfilUsuario {
  /**
   * ID único del Usuario
   * @type {number}
   */
  @ApiProperty({
    description: 'Identificador único del perfil de usuario',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * DNI del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Documento único del usuario (DNI)',
    example: '12345678',
  })
  @Column()
  documento: string;

  /**
   * Nombre del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Lucas',
  })
  @Column()
  nombre: string;

  /**
   * Apellido del Usuario
   * @type {string}
   */
  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @Column()
  apellido: string;

  /**
   * Puntos acumulados del Usuario
   * @type {number}
   */
  @ApiProperty({
    description: 'Cantidad de puntos acumulados por el usuario',
    example: 150,
    default: 0,
  })
  @Column({ default: 0 })
  puntos: number;

  /**
   * Informacion base del usuario
   * @type {Cuenta}
   */
  @ApiProperty({
    description: 'Cuenta asociada al perfil de usuario',
    type: () => Cuenta,
  })
  @OneToOne(() => Cuenta)
  @JoinColumn()
  cuenta: Cuenta;

  /**
   * Beneficios asociados al Usuario
   * @type {UsuarioBeneficio}
   */
  @OneToMany(() => UsuarioBeneficio, (ub) => ub.beneficio)
  usuarios: UsuarioBeneficio[];

  /**
   * Donaciones del usuario
   * @type {Donaciones}
   */
  @OneToMany(() => Donaciones, (donacion) => donacion.usuario)
  donaciones: Donaciones[];
}
