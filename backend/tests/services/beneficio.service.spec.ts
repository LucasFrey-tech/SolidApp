import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { Beneficios } from '../../src/Entities/beneficio.entity';
import { PerfilEmpresa } from '../../src/Entities/perfil_empresa.entity';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import { BeneficioEstado } from '../../src/Modules/benefit/dto/enum/enum';

describe('BeneficioService', () => {
  let service: BeneficioService;
  let mockBeneficiosRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let mockEmpresasRepository: {
    findOne: jest.Mock;
  };
  let mockDataSource: {
    transaction: jest.Mock;
  };

  let beneficio: Beneficios;
  let empresa: PerfilEmpresa;
  let createBeneficioDto: CreateBeneficiosDTO;
  let updateBeneficioDto: UpdateBeneficiosDTO;

  beforeEach(async () => {
    mockBeneficiosRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockEmpresasRepository = {
      findOne: jest.fn(),
    };
    mockDataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficioService,
        {
          provide: getRepositoryToken(Beneficios),
          useValue: mockBeneficiosRepository,
        },
        {
          provide: getRepositoryToken(PerfilEmpresa),
          useValue: mockEmpresasRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<BeneficioService>(BeneficioService);

    // ========== DTOs ==========
    createBeneficioDto = {
      id_empresa: 1,
      titulo: 'Descuento 20%',
      tipo: 'Descuento',
      detalle: 'Descuento del 20% en compras',
      cantidad: 100,
      valor: 500,
      estado: BeneficioEstado.PENDIENTE,
    };

    updateBeneficioDto = {
      titulo: 'Descuento 25%',
      cantidad: 80,
      valor: 600,
    };

    // ========== Objetos de datos ==========
    empresa = {
      id: 1,
      razon_social: 'Mi Empresa SA',
      nombre_empresa: 'Mi Empresa',
      rubro: 'Comercio',
      verificada: true,
      logo: '/logo.png',
      cuenta: {
        deshabilitado: false,
      },
    } as PerfilEmpresa;

    beneficio = {
      id: 1,
      titulo: 'Descuento 20%',
      tipo: 'Descuento',
      detalle: 'Descuento del 20% en compras',
      cantidad: 100,
      valor: 500,
      estado: BeneficioEstado.PENDIENTE,
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      empresa,
    } as Beneficios;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    it('debe crear un beneficio correctamente', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(empresa);
      mockBeneficiosRepository.create.mockReturnValue(beneficio);
      mockBeneficiosRepository.save.mockResolvedValue(beneficio);

      const resultado = await service.create(createBeneficioDto);

      expect(resultado.id).toBe(beneficio.id);
      expect(resultado.titulo).toBe(beneficio.titulo);
      expect(mockEmpresasRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: createBeneficioDto.id_empresa,
          cuenta: { deshabilitado: false },
        },
        relations: ['cuenta'],
      });
    });

    it('debe lanzar NotFoundException si la empresa no existe', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBeneficioDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si la cantidad es menor a 0', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(empresa);

      const dtoInvalido = { ...createBeneficioDto, cantidad: -5 };

      await expect(service.create(dtoInvalido)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el valor es negativo', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(empresa);

      const dtoInvalido = { ...createBeneficioDto, valor: -100 };

      await expect(service.create(dtoInvalido)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ========== TESTS DE UPDATE ==========
  describe('update', () => {
    it('debe actualizar un beneficio correctamente', async () => {
      const beneficioActualizado = {
        ...beneficio,
        ...updateBeneficioDto,
      };

      mockBeneficiosRepository.findOne.mockResolvedValue(beneficio);
      mockBeneficiosRepository.save.mockResolvedValue(beneficioActualizado);

      const resultado = await service.update(1, updateBeneficioDto);

      expect(resultado.titulo).toBe(updateBeneficioDto.titulo);
      expect(mockBeneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el beneficio no existe', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateBeneficioDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si cantidad es negativa', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(beneficio);

      const dtoInvalido = { cantidad: -10 };

      await expect(service.update(1, dtoInvalido)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si valor es negativo', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(beneficio);

      const dtoInvalido = { valor: -100 };

      await expect(service.update(1, dtoInvalido)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ========== TESTS DE UPDATE ESTADO ==========
  describe('updateEstado', () => {
    it('debe actualizar el estado de un beneficio', async () => {
      const beneficioActualizado = {
        ...beneficio,
        estado: BeneficioEstado.APROBADO,
      };

      mockBeneficiosRepository.findOne.mockResolvedValue(beneficio);
      mockBeneficiosRepository.save.mockResolvedValue(beneficioActualizado);

      const resultado = await service.updateEstado(1, BeneficioEstado.APROBADO);

      expect(resultado.estado).toBe(BeneficioEstado.APROBADO);
      expect(mockBeneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el beneficio no existe', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEstado(999, BeneficioEstado.APROBADO),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE FIND ALL PAGINATED ==========
  describe('findAllPaginated', () => {
    it('debe retornar beneficios paginados', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[beneficio], 1]),
      };

      mockBeneficiosRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      const resultado = await service.findAllPaginated(1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
    });

    it('debe filtrar por búsqueda cuando se proporciona', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[beneficio], 1]),
      };

      mockBeneficiosRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      await service.findAllPaginated(1, 10, 'Descuento');

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  // ========== TESTS DE FIND BY EMPRESA PAGINATED ==========
  describe('findByEmpresaPaginated', () => {
    it('debe retornar beneficios de una empresa paginados', async () => {
      mockBeneficiosRepository.findAndCount = jest
        .fn()
        .mockResolvedValue([[beneficio], 1]);

      const resultado = await service.findByEmpresaPaginated(1, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
    });
  });

  // ========== TESTS DE CANJEAR ==========
  describe('canjear', () => {
    it('debe canjear un beneficio correctamente', async () => {
      const usuario = {
        id: 1,
        puntos: 1000,
        cuenta: { deshabilitado: false, role: 'USUARIO' },
        save: jest.fn(),
      };

      const beneficioMock = {
        id: 1,
        cantidad: 100,
        valor: 500,
        save: jest.fn(),
      };

      const beneficioRepo = {
        findOne: jest.fn().mockResolvedValue(beneficioMock),
        save: jest.fn().mockResolvedValue(beneficioMock),
      };

      const usuarioRepo = {
        findOne: jest.fn().mockResolvedValue(usuario),
        save: jest.fn().mockResolvedValue(usuario),
      };

      const usuarioBeneficioRepo = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
      };

      mockDataSource.transaction.mockImplementation((callback) =>
        callback({
          getRepository: jest.fn((entity) => {
            if (entity === Beneficios) return beneficioRepo;
            if (entity.name === 'PerfilUsuario') return usuarioRepo;
            return usuarioBeneficioRepo;
          }),
        }),
      );

      const resultado = await service.canjear(1, 1, 2);

      expect(resultado.success).toBe(true);
      expect(resultado.cantidadCanjeada).toBe(2);
    });

    it('debe lanzar NotFoundException si el beneficio no existe', async () => {
      const beneficioRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      mockDataSource.transaction.mockImplementation((callback) =>
        callback({
          getRepository: jest.fn((entity) => {
            if (entity === Beneficios) return beneficioRepo;
            return { findOne: jest.fn() };
          }),
        }),
      );

      await expect(service.canjear(999, 1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si no hay stock suficiente', async () => {
      const beneficioSinStock = {
        id: 1,
        cantidad: 0,
        valor: 500,
      };

      const beneficioRepo = {
        findOne: jest.fn().mockResolvedValue(beneficioSinStock),
      };

      mockDataSource.transaction.mockImplementation((callback) =>
        callback({
          getRepository: jest.fn((entity) => {
            if (entity === Beneficios) return beneficioRepo;
            return { findOne: jest.fn() };
          }),
        }),
      );

      await expect(service.canjear(1, 1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const beneficioMock = {
        id: 1,
        cantidad: 100,
        valor: 500,
      };

      const beneficioRepo = {
        findOne: jest.fn().mockResolvedValue(beneficioMock),
      };

      const usuarioRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      mockDataSource.transaction.mockImplementation((callback) =>
        callback({
          getRepository: jest.fn((entity) => {
            if (entity === Beneficios) return beneficioRepo;
            if (entity.name === 'PerfilUsuario') return usuarioRepo;
            return { findOne: jest.fn() };
          }),
        }),
      );

      await expect(service.canjear(1, 999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si el usuario no tiene suficientes puntos', async () => {
      const usuarioSinPuntos = {
        id: 1,
        puntos: 10,
        cuenta: { deshabilitado: false, role: 'USUARIO' },
      };

      const beneficioMock = {
        id: 1,
        cantidad: 100,
        valor: 500,
      };

      const beneficioRepo = {
        findOne: jest.fn().mockResolvedValue(beneficioMock),
      };

      const usuarioRepo = {
        findOne: jest.fn().mockResolvedValue(usuarioSinPuntos),
      };

      mockDataSource.transaction.mockImplementation((callback) =>
        callback({
          getRepository: jest.fn((entity) => {
            if (entity === Beneficios) return beneficioRepo;
            if (entity.name === 'PerfilUsuario') return usuarioRepo;
            return { findOne: jest.fn() };
          }),
        }),
      );

      await expect(service.canjear(1, 1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
