import { Type } from 'class-transformer';
import {
  IsEmail,
  MinLength,
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class RegisterBaseDto {
  @IsEmail() correo: string;
  @MinLength(8) clave: string;
}

// 2. DTOs específicos
export class RegisterUsuarioDto extends RegisterBaseDto {
  @IsString() documento: string;
  @IsString() nombre: string;
  @IsString() apellido: string;
}

export class RegisterEmpresaDto extends RegisterBaseDto {
  @IsString() cuit: string;
  @IsString() razon_Social: string;
  @IsString() nombre_Empresa: string;
  @IsString() telefono: string;
  @IsString() calle: string;
  @IsString() numero: string;
  @IsOptional() @IsString() ciudad?: string;
  @IsOptional() @IsString() provincia?: string;
  @IsOptional() @IsString() codigoPostal?: string;
  @IsOptional() @IsString() prefijo?: string;
  @IsOptional() @IsString() web?: string;
}

export class RegisterOrganizacionDto extends RegisterBaseDto {
  @IsString() cuit: string;
  @IsString() razon_Social: string;
  @IsString() nombre_Organizacion: string;
  @IsOptional() @IsString() telefono: string;
  @IsOptional() @IsString() calle?: string;
  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsString() ciudad?: string;
  @IsOptional() @IsString() provincia?: string;
  @IsOptional() @IsString() codigoPostal?: string;
  @IsOptional() @IsString() prefijo?: string;
  @IsOptional() @IsString() web: string;
}

// 3. DTO principal para el endpoint
export class RegisterUserDto {
  @IsEnum(['usuario', 'empresa', 'organizacion'])
  tipo: string;

  @ValidateNested()
  @Type(() => RegisterBaseDto, {
    discriminator: {
      property: 'tipo',
      subTypes: [
        { value: RegisterUsuarioDto, name: 'usuario' },
        { value: RegisterEmpresaDto, name: 'empresa' },
        { value: RegisterOrganizacionDto, name: 'organizacion' },
      ],
    },
  })
  datos: RegisterUsuarioDto | RegisterEmpresaDto | RegisterOrganizacionDto;
}
