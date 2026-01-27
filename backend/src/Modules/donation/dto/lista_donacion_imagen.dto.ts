import { ApiProperty } from "@nestjs/swagger";

export class DonacionImagenDTO {
    @ApiProperty({ example: 1, description: 'ID único de la Donacion'})
    id_donacion: number;

    @ApiProperty({example: 'Campaña de Caritas, Donacion de Sillas', description: 'Nombre'})
    nombre: string;

    @ApiProperty({ example: '/uploads/bb-logo.png', description: 'path de la imagen de la donacion'})
    logo: string;
}