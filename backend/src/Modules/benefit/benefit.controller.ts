import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BenefitService } from './benefit.service';
import { CreateBenefitsDTO } from './dto/create_benefits.dto';
import { UpdateBenefitsDTO } from './dto/update_benefits.dto';
import { BenefitsResponseDTO } from './dto/response_benefits.dto';

/**
 * Controlador para gestionar los Beneficios.
 */

@ApiTags('Beneficios')
@Controller('benefits')
export class BenefitController {
    constructor(private readonly benefitService: BenefitService) { }

    /**
     * Lista todos los beneficios.
     */
    @Get()
    @ApiOperation({ summary: 'Listar todos los Beneficios' })
    @ApiResponse({
        status: 200,
        description: 'Lista de Beneficios obtenida exitosamente',
        type: BenefitsResponseDTO,
        isArray: true,
    })
    async findAll(): Promise<BenefitsResponseDTO[]> {
        return this.benefitService.findAll();
    }

    /**
     * Obtiene un beneficio por ID.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener Beneficio por ID' })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID del beneficio',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Beneficio encontrado',
        type: BenefitsResponseDTO,
    })
    @ApiResponse({
        status: 404,
        description: 'Beneficio no encontrado',
    })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<BenefitsResponseDTO> {
        return this.benefitService.findOne(id);
    }

    /**
     * Crea un nuevo beneficio.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear nuevo Beneficio' })
    @ApiBody({
        type: CreateBenefitsDTO,
        description: 'Datos para crear un nuevo beneficio',
    })
    @ApiResponse({
        status: 201,
        description: 'Beneficio creado exitosamente',
        type: BenefitsResponseDTO,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos',
    })
    @ApiResponse({
        status: 404,
        description: 'Empresa no encontrada',
    })
    async create(
        @Body() createBenefitsDto: CreateBenefitsDTO,
    ): Promise<BenefitsResponseDTO> {
        return this.benefitService.create(createBenefitsDto)
    }

    /**
     * Actualiza un beneficio existente.
     */
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar Beneficio existente' })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID del beneficio a actualizar',
        type: Number,
    })
    @ApiBody({
        type: UpdateBenefitsDTO,
        description: 'Datos para actualizar el beneficio',
    })
    @ApiResponse({
        status: 200,
        description: 'Beneficio actualizado exitosamente',
        type: BenefitsResponseDTO,
    })
    @ApiResponse({
        status: 404,
        description: 'Beneficio no encontrado',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBenefitsDto: UpdateBenefitsDTO,
    ): Promise<BenefitsResponseDTO> {
        return this.benefitService.update(id, updateBenefitsDto);
    }

    /**
     * Elimina un beneficio.
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar Beneficio' })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID del beneficio a eliminar',
        type: Number,
    })
    @ApiResponse({
        status: 204,
        description: 'Beneficio eliminado exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Beneficio no encontrado',
    })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.benefitService.delete(id);
    }
}