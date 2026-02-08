import { IsInt, Min } from "class-validator";

/**
 * Data Tansfer Object (DTO) para el canje de Beneficios por parte de los Usuarios.
 */
export class CanjearBeneficioDto {
    /** ID del Usuario */
    @IsInt()
    @Min(1)
    userId: number;
    
    /** Cantidad del mismo cupon canjeados */
    @IsInt()
    @Min(1)
    cantidad: number;
}