import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { CreateBeneficiosDTO } from './dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from './dto/update_beneficios.dto';
import { BeneficiosResponseDTO } from './dto/response_beneficios.dto';

@ApiTags('Beneficios')
@Controller('beneficios')
export class BeneficioController {
  constructor(private readonly beneficiosService: BeneficioService) {}

  @Get()
  async findAll(): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findAll();
  }

  @Get('paginated')
  async findAllPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.beneficiosService.findAllPaginated(
      Number(page),
      Number(limit),
    );
  }

  @Get('empresa/:idEmpresa')
  async findByEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ): Promise<BeneficiosResponseDTO[]> {
    return this.beneficiosService.findByEmpresa(idEmpresa);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.create(dto);
  }

  // ✅ PATCH (NO PUT)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBeneficiosDTO,
  ): Promise<BeneficiosResponseDTO> {
    return this.beneficiosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.beneficiosService.delete(id);
  }
}
