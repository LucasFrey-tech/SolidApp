import { IsInt, Min } from "class-validator";

export class CanjearBeneficioDto {
    @IsInt()
    @Min(1)
    userId: number;
    
    @IsInt()
    @Min(1)
    cantidad: number;
}