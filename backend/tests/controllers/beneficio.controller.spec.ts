import { Test, TestingModule } from '@nestjs/testing';
import { BeneficioController } from '../../src/Modules/benefit/beneficio.controller';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { mock } from 'jest-mock-extended';
import { BeneficioEstado } from '../../src/Modules/benefit/dto/enum/enum';
import { BeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_beneficios.dto';
import { PaginatedBeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_paginated_beneficios';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { Rol } from '../../src/Modules/user/enums/enums';

describe('BeneficioController', () => {
  let controller: BeneficioController;
  let beneficioService: jest.Mocked<BeneficioService>;

  const mockEmpresaSummary = {
    id: 1,
    razon_social: 'Supermercados Unidos S.A.',
    nombre_empresa: 'SuperUnidos',
    rubro: 'Supermercado',
    verificada: true,
    habilitada: true,
    logo: 'logo.png',
  };

  const mockUsuarioResumen = {
    id: 5,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
  };

  const mockBeneficioResponse: BeneficiosResponseDTO = {
    id: 1,
    titulo: 'Descuento del 15%',
    tipo: 'Discount',
    detalle: 'Descuento en supermercado',
    cantidad: 100,
    valor: 50,
    fecha_registro: new Date('2025-12-15T10:30:45Z'),
    ultimo_cambio: new Date('2025-12-15T10:30:45Z'),
    empresa: mockEmpresaSummary,
    estado: BeneficioEstado.APROBADO,
    creado_por: mockUsuarioResumen,
    actualizado_por: mockUsuarioResumen,
  };

  beforeEach(async () => {
    const mockBeneficioService = mock<BeneficioService>();

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
    beneficioService = module.get(BeneficioService);
  });

  describe('findAllPaginated', () => {
    it('debe obtener todos los beneficios paginados con valores por defecto', async () => {
      const expectedResponse: {
        items: BeneficiosResponseDTO[];
        total: number;
      } = {
        items: [mockBeneficioResponse],
        total: 1,
      };

      beneficioService.findAllPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findAllPaginated(1, 10, '', true);

      expect(result).toEqual(expectedResponse);
      expect(beneficioService.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        true,
      );
      expect(beneficioService.findAllPaginated).toHaveBeenCalledTimes(1);
    });

    it('debe obtener beneficios paginados con parámetros personalizados', async () => {
      const expectedResponse: {
        items: BeneficiosResponseDTO[];
        total: number;
      } = {
        items: [mockBeneficioResponse],
        total: 5,
      };

      beneficioService.findAllPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findAllPaginated(
        2,
        20,
        'descuento',
        false,
      );

      expect(result).toEqual(expectedResponse);
      expect(beneficioService.findAllPaginated).toHaveBeenCalledWith(
        2,
        20,
        'descuento',
        false,
      );
    });

    it('debe manejar búsqueda vacía', async () => {
      const expectedResponse: {
        items: BeneficiosResponseDTO[];
        total: number;
      } = {
        items: [],
        total: 0,
      };

      beneficioService.findAllPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findAllPaginated(1, 10, '', true);

      expect(result).toEqual(expectedResponse);
      expect(beneficioService.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        true,
      );
    });

    it('debe manejar onlyEnabled como false', async () => {
      const expectedResponse: {
        items: BeneficiosResponseDTO[];
        total: number;
      } = {
        items: [mockBeneficioResponse],
        total: 1,
      };

      beneficioService.findAllPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findAllPaginated(1, 10, 'test', false);

      expect(result).toEqual(expectedResponse);
      expect(beneficioService.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        'test',
        false,
      );
    });

    it('debe manejar error del servicio', async () => {
      const error = new Error('Error al obtener beneficios');

      beneficioService.findAllPaginated.mockRejectedValue(error);

      await expect(
        controller.findAllPaginated(1, 10, '', true),
      ).rejects.toThrow('Error al obtener beneficios');
    });

    it('debe convertir page y limit a números cuando vienen como strings', async () => {
      const expectedResponse: {
        items: BeneficiosResponseDTO[];
        total: number;
      } = {
        items: [],
        total: 0,
      };

      beneficioService.findAllPaginated.mockResolvedValue(expectedResponse);

      await controller.findAllPaginated(
        '2' as unknown as number,
        '15' as unknown as number,
        'test',
        true,
      );

      expect(beneficioService.findAllPaginated).toHaveBeenCalledWith(
        2,
        15,
        'test',
        true,
      );
    });
  });

  describe('findByEmpresaPaginated', () => {
    it('debe obtener beneficios por empresa paginados', async () => {
      const idEmpresa = 1;
      const expectedResponse: PaginatedBeneficiosResponseDTO = {
        items: [mockBeneficioResponse],
        total: 1,
      };

      beneficioService.findByEmpresaPaginated.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.findByEmpresaPaginated(idEmpresa, 1, 5);

      expect(result).toEqual(expectedResponse);
      expect(beneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        1,
        1,
        5,
      );
      expect(beneficioService.findByEmpresaPaginated).toHaveBeenCalledTimes(1);
    });

    it('debe usar valores por defecto cuando no se proporcionan page y limit', async () => {
      const idEmpresa = 1;
      const expectedResponse: PaginatedBeneficiosResponseDTO = {
        items: [],
        total: 0,
      };

      beneficioService.findByEmpresaPaginated.mockResolvedValue(
        expectedResponse,
      );

      await controller.findByEmpresaPaginated(idEmpresa, 1, 5);

      expect(beneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        1,
        1,
        5,
      );
    });

    it('debe manejar empresa sin beneficios', async () => {
      const idEmpresa = 2;
      const expectedResponse: PaginatedBeneficiosResponseDTO = {
        items: [],
        total: 0,
      };

      beneficioService.findByEmpresaPaginated.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.findByEmpresaPaginated(idEmpresa, 1, 5);

      expect(result).toEqual(expectedResponse);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('debe manejar empresa no encontrada', async () => {
      const idEmpresa = 999;
      const error = new Error('Empresa no encontrada');

      beneficioService.findByEmpresaPaginated.mockRejectedValue(error);

      await expect(
        controller.findByEmpresaPaginated(idEmpresa, 1, 5),
      ).rejects.toThrow('Empresa no encontrada');
    });

    it('debe manejar error de base de datos', async () => {
      const idEmpresa = 1;
      const error = new Error('Error de conexión a la base de datos');

      beneficioService.findByEmpresaPaginated.mockRejectedValue(error);

      await expect(
        controller.findByEmpresaPaginated(idEmpresa, 1, 5),
      ).rejects.toThrow('Error de conexión a la base de datos');
    });
  });

  describe('updateEstado', () => {
    const mockReqColaborador = {
      user: { id: 5, rol: Rol.COLABORADOR },
    } as RequestConUsuario;
    const mockReqAdmin = {
      user: { id: 1, rol: Rol.ADMIN },
    } as RequestConUsuario;

    it('debe actualizar el estado del beneficio a APROBADO exitosamente', async () => {
      const id = 1;
      const estado = BeneficioEstado.APROBADO;
      const expectedResponse: BeneficiosResponseDTO = {
        ...mockBeneficioResponse,
        estado: BeneficioEstado.APROBADO,
      };

      beneficioService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(
        id,
        estado,
        mockReqColaborador,
      );

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(BeneficioEstado.APROBADO);
      expect(beneficioService.updateEstado).toHaveBeenCalledWith(
        1,
        estado,
        5,
        Rol.COLABORADOR,
      );
      expect(beneficioService.updateEstado).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar el estado del beneficio a RECHAZADO', async () => {
      const id = 2;
      const estado = BeneficioEstado.RECHAZADO;
      const expectedResponse: BeneficiosResponseDTO = {
        ...mockBeneficioResponse,
        id: 2,
        estado: BeneficioEstado.RECHAZADO,
      };

      beneficioService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(id, estado, mockReqAdmin);

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(BeneficioEstado.RECHAZADO);
      expect(beneficioService.updateEstado).toHaveBeenCalledWith(
        2,
        estado,
        1,
        Rol.ADMIN,
      );
    });

    it('debe actualizar el estado del beneficio a PENDIENTE', async () => {
      const id = 3;
      const estado = BeneficioEstado.PENDIENTE;
      const expectedResponse: BeneficiosResponseDTO = {
        ...mockBeneficioResponse,
        id: 3,
        estado: BeneficioEstado.PENDIENTE,
      };

      beneficioService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(
        id,
        estado,
        mockReqColaborador,
      );

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(BeneficioEstado.PENDIENTE);
      expect(beneficioService.updateEstado).toHaveBeenCalledWith(
        3,
        estado,
        5,
        Rol.COLABORADOR,
      );
    });

    it('debe manejar error cuando el beneficio no existe', async () => {
      const id = 999;
      const estado = BeneficioEstado.APROBADO;
      const error = new Error('Beneficio no encontrado');

      beneficioService.updateEstado.mockRejectedValue(error);

      await expect(
        controller.updateEstado(id, estado, mockReqAdmin),
      ).rejects.toThrow('Beneficio no encontrado');
    });

    it('debe manejar error cuando el usuario no tiene permisos', async () => {
      const id = 1;
      const estado = BeneficioEstado.APROBADO;
      const mockReqUsuario = {
        user: { id: 5, rol: Rol.USUARIO },
      } as RequestConUsuario;
      const error = new Error('No tiene permisos para realizar esta acción');

      beneficioService.updateEstado.mockRejectedValue(error);

      await expect(
        controller.updateEstado(id, estado, mockReqUsuario),
      ).rejects.toThrow('No tiene permisos para realizar esta acción');
    });

    it('debe manejar error cuando el estado es inválido', async () => {
      const id = 1;
      const estado = 'ESTADO_INVALIDO' as BeneficioEstado;
      const error = new Error('Estado inválido');

      beneficioService.updateEstado.mockRejectedValue(error);

      await expect(
        controller.updateEstado(id, estado, mockReqAdmin),
      ).rejects.toThrow('Estado inválido');
    });

    it('debe permitir que ADMIN actualice cualquier estado', async () => {
      const id = 1;
      const estado = BeneficioEstado.RECHAZADO;
      const expectedResponse: BeneficiosResponseDTO = {
        ...mockBeneficioResponse,
        estado: BeneficioEstado.RECHAZADO,
      };

      beneficioService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(id, estado, mockReqAdmin);

      expect(result.estado).toBe(BeneficioEstado.RECHAZADO);
      expect(beneficioService.updateEstado).toHaveBeenCalledWith(
        1,
        estado,
        1,
        Rol.ADMIN,
      );
    });

    it('debe permitir que COLABORADOR actualice beneficios de su empresa', async () => {
      const id = 1;
      const estado = BeneficioEstado.APROBADO;
      const expectedResponse: BeneficiosResponseDTO = {
        ...mockBeneficioResponse,
        estado: BeneficioEstado.APROBADO,
      };

      beneficioService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(
        id,
        estado,
        mockReqColaborador,
      );

      expect(result.estado).toBe(BeneficioEstado.APROBADO);
      expect(beneficioService.updateEstado).toHaveBeenCalledWith(
        1,
        estado,
        5,
        Rol.COLABORADOR,
      );
    });
  });
});
