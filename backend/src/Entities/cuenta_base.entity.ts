// base-account.entity.ts
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  TableInheritance,
  Entity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cuentas')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export abstract class BaseAccount {
  @ApiProperty({
    description: 'Identificador único de la cuenta',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Correo electrónico único asociado a la cuenta',
    example: 'usuario@ejemplo.com',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  correo: string;

  @ApiProperty({
    description: 'Clave o contraseña en formato encriptado',
    example: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36rY4vEixZaYVK1fsbw1ZfbX3O',
  })
  @Column({ type: 'varchar', length: 255 })
  clave: string;

  @ApiProperty({
    description: 'Indica si la cuenta está deshabilitada',
    example: false,
    default: false,
  })
  @Column({ type: 'bit', default: false })
  deshabilitado: boolean;

  @ApiProperty({
    description: 'Indica si la cuenta fue verificada',
    example: true,
    default: false,
  })
  @Column({ type: 'bit', default: false })
  verificada: boolean;

  @ApiProperty({
    description: 'Fecha de registro de la cuenta',
    example: '2026-02-21T21:54:00.000Z',
  })
  @CreateDateColumn({ type: 'datetime2' })
  fecha_registro: Date;

  @ApiProperty({
    description: 'Fecha del último cambio realizado en la cuenta',
    example: '2026-02-21T21:54:00.000Z',
  })
  @UpdateDateColumn({ type: 'datetime2' })
  ultimo_cambio: Date;
}
