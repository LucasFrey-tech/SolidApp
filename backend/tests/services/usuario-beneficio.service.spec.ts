import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { UsuarioBeneficioService } from '../../src/Modules/user/usuario-beneficio/usuario-beneficio.service';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';
import { BeneficiosUsuarioEstado } from '../../src/Modules/benefit/dto/enum/enum';

const mockUsuario = {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
};

const mockBeneficio = {
  id: 1,
  titulo: 'Descuento 20%',
  cantidad: 100,
  valor: 50,
};

const mockUsuarioBeneficioActivo: UsuarioBeneficio = {
  id: 1,
  usuario: mockUsuario,
  beneficio: mockBeneficio,
  cantidad: 5,
  usados: 2,
  estado: BeneficiosUsuarioEstado.ACTIVO,
  fecha_reclamo: new Date(),
  ultimo_cambio: new Date(),
} as UsuarioBeneficio;

const mockUsuarioBeneficioUsado: UsuarioBeneficio = {
  id: 2,
  usuario: mockUsuario,
  beneficio: mockBeneficio,
  cantidad: 3,
  usados: 3,
  estado: BeneficiosUsuarioEstado.USADO,
  fecha_reclamo: new Date(),
  fecha_uso: new Date(),
  ultimo_cambio: new Date(),
} as UsuarioBeneficio;

describe('UsuarioBeneficioService', () => {
  let service: UsuarioBeneficioService;
  let usuarioBeneficioRepo: jest.Mocked<Repository<UsuarioBeneficio>>;

  beforeEach(async () => {
    const mockRepository = mock<Repository<UsuarioBeneficio>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioBeneficioService,
        {
          provide: getRepositoryToken(UsuarioBeneficio),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioBeneficioService>(UsuarioBeneficioService);
    usuarioBeneficioRepo = module.get(getRepositoryToken(UsuarioBeneficio));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUsuario', () => {
    const usuarioId = 1;

    it('debe obtener todos los beneficios de un usuario', async () => {
      const expectedResponse = [
        mockUsuarioBeneficioActivo,
        mockUsuarioBeneficioUsado,
      ];

      usuarioBeneficioRepo.find.mockResolvedValue(expectedResponse);

      const result = await service.getByUsuario(usuarioId);

      expect(result).toEqual(expectedResponse);
      expect(usuarioBeneficioRepo.find).toHaveBeenCalledWith({
        where: { usuario: { id: usuarioId } },
        relations: ['beneficio'],
        order: { fecha_reclamo: 'DESC' },
      });
      expect(usuarioBeneficioRepo.find).toHaveBeenCalledTimes(1);
    });

    it('debe retornar un arreglo vacío cuando el usuario no tiene beneficios', async () => {
      usuarioBeneficioRepo.find.mockResolvedValue([]);

      const result = await service.getByUsuario(usuarioId);

      expect(result).toEqual([]);
      expect(usuarioBeneficioRepo.find).toHaveBeenCalledWith({
        where: { usuario: { id: usuarioId } },
        relations: ['beneficio'],
        order: { fecha_reclamo: 'DESC' },
      });
    });

    it('debe manejar error cuando falla la consulta', async () => {
      const error = new Error('Error de base de datos');

      usuarioBeneficioRepo.find.mockRejectedValue(error);

      await expect(service.getByUsuario(usuarioId)).rejects.toThrow(
        'Error de base de datos',
      );
    });
  });

  describe('usarBeneficio', () => {
    const beneficioId = 1;

    it('debe usar un beneficio exitosamente y actualizar usados', async () => {
      const mockRegistro = { ...mockUsuarioBeneficioActivo };
      const expectedResponse = { ...mockRegistro, usados: 3 };

      usuarioBeneficioRepo.findOne.mockResolvedValue(mockRegistro);
      usuarioBeneficioRepo.save.mockResolvedValue(expectedResponse);

      const result = await service.usarBeneficio(beneficioId);

      expect(result).toEqual(expectedResponse);
      expect(usuarioBeneficioRepo.findOne).toHaveBeenCalledWith({
        where: { id: beneficioId },
        relations: ['beneficio', 'usuario'],
      });
      expect(usuarioBeneficioRepo.save).toHaveBeenCalledWith(expectedResponse);
    });

    it('debe marcar el beneficio como USADO cuando usados alcanza la cantidad', async () => {
      const mockRegistro = {
        ...mockUsuarioBeneficioActivo,
        usados: 4,
        cantidad: 5,
      };
      const expectedResponse = {
        ...mockRegistro,
        usados: 5,
        estado: BeneficiosUsuarioEstado.USADO,
        fecha_uso: expect.any(Date),
      };

      usuarioBeneficioRepo.findOne.mockResolvedValue(mockRegistro);
      usuarioBeneficioRepo.save.mockResolvedValue(expectedResponse);

      const result = await service.usarBeneficio(beneficioId);

      expect(result.estado).toBe(BeneficiosUsuarioEstado.USADO);
      expect(result.fecha_uso).toBeDefined();
      expect(usuarioBeneficioRepo.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el beneficio no existe', async () => {
      usuarioBeneficioRepo.findOne.mockResolvedValue(null);

      await expect(service.usarBeneficio(beneficioId)).rejects.toThrow(
        'Beneficio no encontrado',
      );
    });

    it('debe lanzar error cuando el beneficio no está activo', async () => {
      usuarioBeneficioRepo.findOne.mockResolvedValue(mockUsuarioBeneficioUsado);

      await expect(service.usarBeneficio(beneficioId)).rejects.toThrow(
        'El beneficio no está activo',
      );
    });

    it('debe lanzar error cuando no hay cupones disponibles', async () => {
      const mockRegistro = {
        ...mockUsuarioBeneficioActivo,
        usados: 5,
        cantidad: 5,
      };

      usuarioBeneficioRepo.findOne.mockResolvedValue(mockRegistro);

      await expect(service.usarBeneficio(beneficioId)).rejects.toThrow(
        'No hay cupones disponibles',
      );
    });

    it('debe manejar error cuando findOne falla', async () => {
      const error = new Error('Error de conexión');

      usuarioBeneficioRepo.findOne.mockRejectedValue(error);

      await expect(service.usarBeneficio(beneficioId)).rejects.toThrow(
        'Error de conexión',
      );
    });

    it('debe manejar error cuando save falla', async () => {
      const error = new Error('Error al guardar');

      usuarioBeneficioRepo.findOne.mockResolvedValue(
        mockUsuarioBeneficioActivo,
      );
      usuarioBeneficioRepo.save.mockRejectedValue(error);

      await expect(service.usarBeneficio(beneficioId)).rejects.toThrow(
        'Error al guardar',
      );
    });
  });
});
