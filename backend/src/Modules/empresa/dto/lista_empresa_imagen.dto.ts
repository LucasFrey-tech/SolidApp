import { ApiProperty } from '@nestjs/swagger';

export class EmpresaImagenDTO {
    @ApiProperty({ example: 1, description: 'ID único de la Empresa' })
    id_empresa: number;

    @ApiProperty({ example: 'SuperUnidos', description: 'Nombre' })
    nombre: string;

    @ApiProperty({ example: '/uploads/bb-logo.png', description: 'path de la imagen de la emprase' })
    logo: string;
}