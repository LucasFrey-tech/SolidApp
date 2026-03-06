import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
import { Campaigns } from './campaigns.entity';
import { ImagenesOrganizacion } from './imagenes_organizacion.entity';
import { OrganizacionUsuario } from './organizacion_usuario.entity';

/**
 * Entidad Organizacion
 * Antes: perfil_organizacion
 * Representa ONGs/Fundaciones que crean campañas de recaudación
 */
@Entity('organizacion')
export class Organizacion {
  @ApiProperty({
    example: 1,
    description: 'ID único de la organización (auto-generado)',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '30-98765432-1',
    description: 'CUIT de la organización (único)',
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  cuit: string;

  @ApiProperty({
    example: 'Fundación Innovar',
    description: 'Razón social de la organización',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  razon_social: string;

  @ApiProperty({
    example: 'Innovar ONG',
    description: 'Nombre de la organización',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre_organizacion: string;

  @ApiProperty({
    example: 'ONG dedicada a la educación y desarrollo comunitario',
    description: 'Descripción de la organización',
    default: '',
  })
  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  descripcion: string;

  @ApiProperty({
    example: false,
    description: 'Indica si la organización está verificada por un admin',
    default: false,
  })
  @Column({ type: 'bit', nullable: false, default: false })
  verificada: boolean;

  @ApiProperty({
    example: 'https://www.innovarong.org',
    description: 'Sitio web de la organización',
    default: '',
  })
  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  web: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de registro de la organización',
  })
  @CreateDateColumn({ type: 'datetime2', nullable: false })
  fecha_registro: Date;

  @ApiProperty({
    example: '2024-03-20T15:45:00Z',
    description: 'Fecha de última modificación',
  })
  @UpdateDateColumn({ type: 'datetime2', nullable: false })
  ultimo_cambio: Date;

  // ==================== RELACIONES ====================

  @ApiPropertyOptional({
    description: 'Usuarios que gestionan esta organización',
    type: () => [Usuario],
  })
  @ManyToMany(() => Usuario, (usuario) => usuario.organizaciones)
  usuarios?: Usuario[];

  @ApiPropertyOptional({
    description: 'Relaciones organización-usuario con roles (tabla intermedia)',
    type: () => [OrganizacionUsuario],
  })
  @OneToMany(() => OrganizacionUsuario, (orgUsuario) => orgUsuario.organizacion)
  organizacionUsuarios?: OrganizacionUsuario[];

  @ApiPropertyOptional({
    description: 'Campañas creadas por esta organización',
    type: () => [Campaigns],
  })
  @OneToMany(() => Campaigns, (campaña) => campaña.organizacion)
  campaign?: Campaigns[];

  @ApiPropertyOptional({
    description: 'Imágenes de la organización (logo/banner)',
    type: () => [ImagenesOrganizacion],
  })
  @OneToMany(() => ImagenesOrganizacion, (imagen) => imagen.organizacion)
  imagenes?: ImagenesOrganizacion[];
}
