import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCampaignDto } from './create_campaigns.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @ApiPropertyOptional({
    example: 'Campaña Solidaria Invierno 2025 (extendida)',
    description: 'Título actualizado de la campaña solidaria',
  })
  titulo?: string;

  @ApiPropertyOptional({
    example: 'FINALIZADA',
    description: 'Nuevo estado de la campaña solidaria',
  })
  estado?: string;

  @ApiPropertyOptional({
    example: 'Campaña extendida hasta fines de agosto',
    description: 'Descripción actualizada de la campaña',
  })
  description?: string;

  @ApiPropertyOptional({
    example: '2025-09-15',
    description: 'Nueva fecha de finalización de la campaña',
    type: String,
    format: 'date',
  })
  fechaFin?: Date;

  @ApiPropertyOptional({
    example: 750000,
    description: 'Nuevo monto objetivo de la campaña',
  })
  objetivo?: number;
}
