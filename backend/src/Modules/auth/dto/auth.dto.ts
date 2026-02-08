import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) para Register y Login.
 * Se usa para validar y transformar datos entre el cliente y el servidor.
 */

export class LoginRequestBody {
  /**
   * Email del usuario
   * @type {string}
   */
  @ApiProperty({ example: 'sarasa@gmail.com' })
  @IsEmail()
  correo: string;

  /**
   * Contraseña del usuario
   * @type {string}
   */
  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  clave: string;

  /**
   * Constructor del DTO.
   */
  constructor(email: string, password: string) {
    this.correo = email;
    this.clave = password;
  }
}

export class RegisterUsuarioDto {
  
  /**
   * DNI del Usuario
   * @type {string}
   */
  @ApiProperty({
    example: '12345678',
    description: 'Documento del Usuario',
  })
  @IsString()
  @MinLength(8)
  documento: string;
  
  /**
   * Correo Electrónico del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  correo: string;
  
  /**
   * Contraseña del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  clave: string;
  
  /**
   * Nombre del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @MinLength(2)
  nombre: string;
  
  /**
   * Apellido del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @MinLength(2)
  apellido: string;
  
  /**
   * Imagen de Perfil del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Imagen de perfil', required: false })
  @IsString()
  @IsOptional()
  imagen?: string;
  
  /**
   * Nombre de la Calle del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Nombre de la Calle', required: false })
  @IsString()
  @IsOptional()
  calle?: string;
  
  /**
   * Número de la calle del Usuario
   * @type {string}
   */
  @ApiProperty({ description: 'Número de la calle', required: false })
  @IsString()
  @IsOptional()
  numero?: string;
}

export class RegisterEmpresaDto {
    
  /**
   * CUIL de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Número de documento' })
  @IsString()
  @MinLength(3)
  documento: string;
    
  /**
   * Nombre Legal de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Razón social' })
  @IsString()
  @MinLength(3)
  razonSocial: string;
    
  /**
   * Nombre Comercial de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Nombre de fantasía' })
  @IsString()
  @MinLength(3)
  nombreFantasia: string;
    
  /**
   * Contraseña del Usuario de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  clave: string;
    
  /**
   * Teléfono de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Teléfono' })
  @IsString()
  @MinLength(8)
  telefono: string;
    
  /**
   * Dirección de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Dirección' })
  @IsString()
  @MinLength(5)
  direccion: string;
    
  /**
   * Correo Electrónico de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Email' })
  @IsEmail()
  correo: string;
    
  /**
   * Página Web de la Empresa
   * @type {string}
   */
  @ApiProperty({ description: 'Sitio web', required: false })
  @IsString()
  @IsOptional()
  web?: string;
}

export class RegisterOrganizacionDto {
      
  /**
   * CUIL de la Organización
   * @type {string}
   */
  @ApiProperty({ description: 'Número de documento' })
  @IsString()
  @MinLength(3)
  documento: string;
      
  /**
   * Nombre Legal de la Organización
   * @type {string}
   */
  @ApiProperty({ description: 'Razón social' })
  @IsString()
  @MinLength(3)
  razonSocial: string;
      
  /**
   * Nombre Comercial de la Organización
   * @type {string}
   */
  @ApiProperty({ description: 'Nombre' })
  @IsString()
  @MinLength(3)
  nombreFantasia: string;
      
  /**
   * Contraseña del Usuario de la Organización
   * @type {string}
   */
  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  clave: string;
      
  /**
   * Correo Electrónico de la Organización
   * @type {string}
   */
  @ApiProperty({ description: 'Email' })
  @IsEmail()
  correo: string;
}

export class AuthResponse {
        
  /**
   * Token
   * @type {string}
   */
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
  token: string;
}
