import { Test, TestingModule } from '@nestjs/testing';
import { BeneficioController } from '../../src/Modules/benefit/beneficio.controller';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { BeneficioEstado } from '../../src/Modules/benefit/dto/enum/enum';
import { CanjearBeneficioDto } from '../../src/Modules/benefit/dto/canjear_beneficio.dto';
import { BeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_beneficios.dto';
import { PaginatedBeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_paginated_beneficios';
import {
  RequestConUsuario,
  UsuarioAutenticado,
} from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { EmpresaSummaryDTO } from '../../src/Modules/empresa/dto/summary_empresa.dto';
import { Cuenta, RolCuenta } from '../../src/Entities/cuenta.entity';
import { PerfilUsuario } from '../../src/Entities/perfil_Usuario.entity';

interface CanjearResponse {
  success: boolean;
  cantidadCanjeada: number;
  puntosGastados: number;
  puntosRestantes: number;
  stockRestante: number;
}

describe('BeneficioController', () => {
  let controller: BeneficioController;
  let mockBeneficioService: {
    findAllPaginated: jest.Mock<
      Promise<PaginatedBeneficiosResponseDTO>,
      [number, number, string, boolean]
    >;
    findByEmpresaPaginated: jest.Mock<
      Promise<PaginatedBeneficiosResponseDTO>,
      [number, number, number]
    >;
    canjear: jest.Mock<Promise<CanjearResponse>, [number, number, number]>;
    updateEstado: jest.Mock<Promise<BeneficiosResponseDTO>, [number, string]>;
  };

  let empresaResumen: EmpresaSummaryDTO;
  let beneficioResponse: BeneficiosResponseDTO;
  let paginatedResponse: PaginatedBeneficiosResponseDTO;
  let canjearResponse: CanjearResponse;
  let canjearDto: CanjearBeneficioDto;
  let requestConUsuario: RequestConUsuario;

  beforeEach(async () => {
    mockBeneficioService = {
      findAllPaginated: jest.fn<
        Promise<PaginatedBeneficiosResponseDTO>,
        [number, number, string, boolean]
      >(),
      findByEmpresaPaginated: jest.fn<
        Promise<PaginatedBeneficiosResponseDTO>,
        [number, number, number]
      >(),
      canjear: jest.fn<Promise<CanjearResponse>, [number, number, number]>(),
      updateEstado: jest.fn<Promise<BeneficiosResponseDTO>, [number, string]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeneficioController],
      providers: [
        {
          provide: BeneficioService,
          useValue: mockBeneficioService,
        },
      ],
    }).compile();

    controller = module.get<BeneficioController>(BeneficioController);

    // ========== DTOs ==========
    canjearDto = {
      userId: 1,
      cantidad: 2,
    };

    // ========== EmpresaSummary ==========
    empresaResumen = {
      id: 1,
      razon_social: 'Mi Empresa SA',
      nombre_empresa: 'Mi Empresa',
      rubro: 'Comercio',
      verificada: true,
      deshabilitado: false,
      logo: '/logo.png',
    };

    // ========== Request Mock ==========
    const cuenta: Cuenta = {
      id: 1,
      correo: 'usuario@example.com',
      clave: 'hash',
      role: RolCuenta.USUARIO,
      deshabilitado: false,
      fecha_registro: new Date(),
      ultima_conexion: new Date(),
    } as unknown as Cuenta;

    const perfil: PerfilUsuario = {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      puntos: 1000,
      cuenta,
    } as unknown as PerfilUsuario;

    const usuarioAutenticado: UsuarioAutenticado = {
      cuenta,
      perfil,
    };

    requestConUsuario = {
      user: usuarioAutenticado,
    } as unknown as RequestConUsuario;

    // ========== Response Mocks ==========
    beneficioResponse = {
      id: 1,
      titulo: 'Descuento 20%',
      tipo: 'Descuento',
      detalle: 'Descuento del 20% en compras',
      cantidad: 100,
      valor: 500,
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      estado: BeneficioEstado.APROBADO,
      empresa: empresaResumen,
    };

    paginatedResponse = {
      items: [beneficioResponse],
      total: 1,
    };

    canjearResponse = {
      success: true,
      cantidadCanjeada: 2,
      puntosGastados: 1000,
      puntosRestantes: 0,
      stockRestante: 98,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND ALL PAGINATED ==========
  describe('findAllPaginated', () => {
    it('debe retornar beneficios paginados sin filtros', async () => {
      mockBeneficioService.findAllPaginated.mockResolvedValue(
        paginatedResponse,
      );

      const resultado = await controller.findAllPaginated(1, 10, '', false);

      expect(resultado).toEqual(paginatedResponse);
      expect(mockBeneficioService.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        false,
      );
    });

    it('debe retornar beneficios paginados con búsqueda', async () => {
      mockBeneficioService.findAllPaginated.mockResolvedValue(
        paginatedResponse,
      );

      const resultado = await controller.findAllPaginated(
        1,
        10,
        'Descuento',
        false,
      );

      expect(resultado).toEqual(paginatedResponse);
      expect(mockBeneficioService.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        'Descuento',
        false,
      );
    });

    it('debe retornar solo beneficios habilitados cuando onlyEnabled es true', async () => {
      mockBeneficioService.findAllPaginated.mockResolvedValue(
        paginatedResponse,
      );

      const resultado = await controller.findAllPaginated(1, 10, '', true);

      expect(resultado).toEqual(paginatedResponse);
      expect(mockBeneficioService.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        true,
      );
    });
  });

  // ========== TESTS DE FIND BY EMPRESA PAGINATED ==========
  describe('findByEmpresaPaginated', () => {
    it('debe retornar beneficios paginados de una empresa específica', async () => {
      mockBeneficioService.findByEmpresaPaginated.mockResolvedValue(
        paginatedResponse,
      );

      const resultado = await controller.findByEmpresaPaginated(1, 1, 5);

      expect(resultado).toEqual(paginatedResponse);
      expect(mockBeneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        1,
        1,
        5,
      );
    });

    it('debe usar valores por defecto para page y limit', async () => {
      mockBeneficioService.findByEmpresaPaginated.mockResolvedValue(
        paginatedResponse,
      );

      await controller.findByEmpresaPaginated(1);

      expect(mockBeneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        1,
        1,
        5,
      );
    });
  });

  // ========== TESTS DE CANJEAR ==========
  describe('canjear', () => {
    it('debe canjear un beneficio correctamente', async () => {
      mockBeneficioService.canjear.mockResolvedValue(canjearResponse);

      const resultado = await controller.canjear(
        1,
        requestConUsuario,
        canjearDto,
      );

      expect(resultado).toEqual(canjearResponse);
      expect(mockBeneficioService.canjear).toHaveBeenCalledWith(
        1,
        1,
        canjearDto.cantidad,
      );
    });

    it('debe pasar el ID del usuario del request', async () => {
      mockBeneficioService.canjear.mockResolvedValue(canjearResponse);

      await controller.canjear(1, requestConUsuario, canjearDto);

      expect(mockBeneficioService.canjear).toHaveBeenCalledWith(
        1,
        requestConUsuario.user.perfil.id,
        2,
      );
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Stock insuficiente');
      mockBeneficioService.canjear.mockRejectedValue(error);

      await expect(
        controller.canjear(1, requestConUsuario, canjearDto),
      ).rejects.toThrow('Stock insuficiente');
    });
  });

  // ========== TESTS DE UPDATE ESTADO ==========
  describe('updateEstado', () => {
    it('debe actualizar el estado de un beneficio', async () => {
      const beneficioActualizado: BeneficiosResponseDTO = {
        ...beneficioResponse,
        estado: BeneficioEstado.APROBADO,
      };

      mockBeneficioService.updateEstado.mockResolvedValue(beneficioActualizado);

      const resultado = await controller.updateEstado(
        1,
        BeneficioEstado.APROBADO,
      );

      expect(resultado).toEqual(beneficioActualizado);
      expect(mockBeneficioService.updateEstado).toHaveBeenCalledWith(
        1,
        BeneficioEstado.APROBADO,
      );
    });

    it('debe aceptar diferentes estados', async () => {
      const beneficioRechazado: BeneficiosResponseDTO = {
        ...beneficioResponse,
        estado: BeneficioEstado.RECHAZADO,
      };

      mockBeneficioService.updateEstado.mockResolvedValue(beneficioRechazado);

      await controller.updateEstado(1, BeneficioEstado.RECHAZADO);

      expect(mockBeneficioService.updateEstado).toHaveBeenCalledWith(
        1,
        BeneficioEstado.RECHAZADO,
      );
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Beneficio no encontrado');
      mockBeneficioService.updateEstado.mockRejectedValue(error);

      await expect(
        controller.updateEstado(999, BeneficioEstado.APROBADO),
      ).rejects.toThrow('Beneficio no encontrado');
    });
  });
});
