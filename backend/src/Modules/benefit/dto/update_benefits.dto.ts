import { ApiProperty } from "@nestjs/swagger";
import { PartialType } from "@nestjs/swagger";
import { CreateBenefitsDTO } from "./create_benefits.dto";
import { IsOptional, Min } from "class-validator";

export class UpdateBenefitsDTO extends PartialType(CreateBenefitsDTO) {
    @ApiProperty({ example: 10, description: 'Cantidad disponible', required: false })
    @IsOptional()
    @Min(0)
    cantidad?: number;
}