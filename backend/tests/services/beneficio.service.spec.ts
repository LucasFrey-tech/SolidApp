import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { Beneficios } from '../../src/Entities/beneficio.entity';
import { Empresa } from '../../src/Entities/empresa.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import { BeneficioEstado, BeneficiosUsuarioEstado } from '../../src/Modules/benefit/dto/enum/enum';
import { Rol } from '../../src/Modules/user/enums/enums';

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

  const USUARIO_ID = 1;
  const EMPRESA_ID = 1;
  const BENEFICIO_ID = 1;

  let beneficio: Beneficios;
  let empresa: Empresa;
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
          provide: getRepositoryToken(Empresa),
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
      id_empresa: EMPRESA_ID,
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

    // ========== Entidades ==========
    empresa = {
      id: EMPRESA_ID,
      razon_social: 'Mi Empresa SA',
      nombre_empresa: 'Mi Empresa',
      rubro: 'Comercio',
      verificada: true,
      habilitada: true,
      logo: '/logo.png',
    } as Empresa;

    beneficio = {
      id: BENEFICIO_ID,
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

      const resultado = await service.create(createBeneficioDto, USUARIO_ID);

      expect(resultado.id).toBe(beneficio.id);
      expect(resultado.titulo).toBe(beneficio.titulo);
      expect(mockEmpresasRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: createBeneficioDto.id_empresa,
          }),
        }),
      );
    });

    it('debe asignar estado PENDIENTE por defecto si no se indica', async () => {
      const dtoSinEstado = { ...createBeneficioDto, estado: undefined };
      mockEmpresasRepository.findOne.mockResolvedValue(empresa);
      mockBeneficiosRepository.create.mockReturnValue(beneficio);
      mockBeneficiosRepository.save.mockResolvedValue(beneficio);

      await service.create(dtoSinEstado, USUARIO_ID);

      expect(mockBeneficiosRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ estado: BeneficioEstado.PENDIENTE }),
      );
    });

    it('debe lanzar NotFoundException si la empresa no existe o está deshabilitada', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBeneficioDto, USUARIO_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBeneficiosRepository.create).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si la cantidad es menor o igual a 0', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(empresa);

      const dtoInvalido = { ...createBeneficioDto, cantidad: 0 };

      await expect(service.create(dtoInvalido, USUARIO_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el valor es negativo', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(empresa);

      const dtoInvalido = { ...createBeneficioDto, valor: -100 };

      await expect(service.create(dtoInvalido, USUARIO_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ========== TESTS DE UPDATE ==========
  describe('update', () => {
    it('debe actualizar un beneficio correctamente', async () => {
      const beneficioActualizado = { ...beneficio, ...updateBeneficioDto };

      mockBeneficiosRepository.findOne
        .mockResolvedValueOnce(beneficio)
        .mockResolvedValueOnce(beneficioActualizado);

      mockBeneficiosRepository.save.mockResolvedValue(beneficioActualizado);

      const resultado = await service.update(BENEFICIO_ID, updateBeneficioDto, USUARIO_ID);

      expect(resultado.titulo).toBe(updateBeneficioDto.titulo);
      expect(mockBeneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el beneficio no existe o no pertenece al usuario', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateBeneficioDto, USUARIO_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBeneficiosRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si cantidad es negativa', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(beneficio);

      const dtoInvalido: UpdateBeneficiosDTO = { cantidad: -10 };

      await expect(service.update(BENEFICIO_ID, dtoInvalido, USUARIO_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si valor es negativo', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(beneficio);

      const dtoInvalido: UpdateBeneficiosDTO = { valor: -100 };

      await expect(service.update(BENEFICIO_ID, dtoInvalido, USUARIO_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe lanzar error si cantidad es 0 (permitido en update)', async () => {
      const beneficioActualizado = { ...beneficio, cantidad: 0 };

      mockBeneficiosRepository.findOne
        .mockResolvedValueOnce(beneficio)
        .mockResolvedValueOnce(beneficioActualizado);
      mockBeneficiosRepository.save.mockResolvedValue(beneficioActualizado);

      const resultado = await service.update(BENEFICIO_ID, { cantidad: 0 }, USUARIO_ID);

      expect(resultado.cantidad).toBe(0);
    });
  });

  // ========== TESTS DE UPDATE ESTADO ==========
  describe('updateEstado', () => {
    it('debe actualizar el estado siendo ADMIN (sin filtro de empresa)', async () => {
      const beneficioActualizado = { ...beneficio, estado: BeneficioEstado.APROBADO };

      mockBeneficiosRepository.findOne
        .mockResolvedValueOnce(beneficio)
        .mockResolvedValueOnce(beneficioActualizado);
      mockBeneficiosRepository.save.mockResolvedValue(beneficioActualizado);

      const resultado = await service.updateEstado(
        BENEFICIO_ID,
        BeneficioEstado.APROBADO,
        USUARIO_ID,
        Rol.ADMIN,
      );

      expect(resultado.estado).toBe(BeneficioEstado.APROBADO);
      // Admin busca sin filtro de empresa
      expect(mockBeneficiosRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: BENEFICIO_ID } }),
      );
    });

    it('debe actualizar el estado siendo COLABORADOR (con filtro de empresa)', async () => {
      const beneficioActualizado = { ...beneficio, estado: BeneficioEstado.RECHAZADO };

      mockBeneficiosRepository.findOne
        .mockResolvedValueOnce(beneficio)
        .mockResolvedValueOnce(beneficioActualizado);
      mockBeneficiosRepository.save.mockResolvedValue(beneficioActualizado);

      const resultado = await service.updateEstado(
        BENEFICIO_ID,
        BeneficioEstado.RECHAZADO,
        USUARIO_ID,
        Rol.COLABORADOR,
      );

      expect(resultado.estado).toBe(BeneficioEstado.RECHAZADO);
      expect(mockBeneficiosRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: BENEFICIO_ID,
            empresa: expect.objectContaining({
              empresaUsuarios: expect.objectContaining({
                usuario: { id: USUARIO_ID },
              }),
            }),
          }),
        }),
      );
    });

    it('debe lanzar NotFoundException si el beneficio no existe', async () => {
      mockBeneficiosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEstado(999, BeneficioEstado.APROBADO, USUARIO_ID, Rol.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE FIND ALL PAGINATED ==========
  describe('findAllPaginated', () => {
    it('debe retornar beneficios paginados sin filtros', async () => {
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
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
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

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('titulo'),
        expect.objectContaining({ search: '%Descuento%' }),
      );
    });

    it('debe aplicar filtros de habilitado cuando onlyEnabled es true', async () => {
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

      await service.findAllPaginated(1, 10, '', true);

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  // ========== TESTS DE FIND BY EMPRESA PAGINATED ==========
  describe('findByEmpresaPaginated', () => {
    it('debe retornar beneficios de una empresa paginados', async () => {
      mockBeneficiosRepository.findAndCount.mockResolvedValue([[beneficio], 1]);

      const resultado = await service.findByEmpresaPaginated(EMPRESA_ID, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(mockBeneficiosRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            empresa: expect.objectContaining({ id: EMPRESA_ID }),
          }),
          skip: 0,
          take: 10,
        }),
      );
    });

    it('debe respetar la paginación', async () => {
      mockBeneficiosRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findByEmpresaPaginated(EMPRESA_ID, 3, 5);

      expect(mockBeneficiosRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ========== TESTS DE CANJEAR ==========
  describe('canjear', () => {
    interface MockBeneficioRepo {
      findOne: jest.Mock;
      save: jest.Mock;
    }
    interface MockUsuarioRepo {
      findOne: jest.Mock;
      save: jest.Mock;
    }
    interface MockUsuarioBeneficioRepo {
      findOne: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
    }
    interface MockManagerOverrides {
      beneficioRepo?: Partial<MockBeneficioRepo>;
      usuarioRepo?: Partial<MockUsuarioRepo>;
      usuarioBeneficioRepo?: Partial<MockUsuarioBeneficioRepo>;
    }

    const buildMockManager = (overrides: MockManagerOverrides = {}) => {
      const beneficioRepoDefault: MockBeneficioRepo = {
        findOne: jest.fn().mockResolvedValue({ ...beneficio }),
        save: jest.fn().mockResolvedValue(beneficio),
      };
      const usuarioRepoDefault: MockUsuarioRepo = {
        findOne: jest.fn().mockResolvedValue({
          id: USUARIO_ID,
          puntos: 2000,
          rol: Rol.USUARIO,
          habilitado: true,
        } as Partial<Usuario>),
        save: jest.fn().mockResolvedValue({}),
      };
      const usuarioBeneficioRepoDefault: MockUsuarioBeneficioRepo = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
      };

      const finalBeneficioRepo = { ...beneficioRepoDefault, ...overrides.beneficioRepo };
      const finalUsuarioRepo = { ...usuarioRepoDefault, ...overrides.usuarioRepo };
      const finalUsuarioBeneficioRepo = {
        ...usuarioBeneficioRepoDefault,
        ...overrides.usuarioBeneficioRepo,
      };

      return {
        getRepository: jest.fn((entity) => {
          if (entity === Beneficios) return finalBeneficioRepo;
          if (entity === Usuario) return finalUsuarioRepo;
          if (entity === UsuarioBeneficio) return finalUsuarioBeneficioRepo;
          return {};
        }),
      };
    };

    it('debe canjear un beneficio correctamente (sin registro previo)', async () => {
      mockDataSource.transaction.mockImplementation((cb) => cb(buildMockManager()));

      const resultado = await service.canjear(BENEFICIO_ID, USUARIO_ID, 2);

      expect(resultado.success).toBe(true);
      expect(resultado.cantidadCanjeada).toBe(2);
      expect(resultado.puntosGastados).toBe(beneficio.valor * 2);
    });

    it('debe acumular cantidad si ya existe un registro de canje activo', async () => {
      const existente = {
        id: 10,
        cantidad: 3,
        estado: BeneficiosUsuarioEstado.ACTIVO,
        save: jest.fn(),
      };

      const manager = buildMockManager({
        usuarioBeneficioRepo: {
          findOne: jest.fn().mockResolvedValue(existente),
          save: jest.fn().mockResolvedValue({ ...existente, cantidad: 5 }),
        },
      });

      mockDataSource.transaction.mockImplementation((cb) => cb(manager));

      const resultado = await service.canjear(BENEFICIO_ID, USUARIO_ID, 2);

      expect(resultado.success).toBe(true);
    });

    it('debe lanzar NotFoundException si el beneficio no existe', async () => {
      const manager = buildMockManager({
        beneficioRepo: { findOne: jest.fn().mockResolvedValue(null) },
      });

      mockDataSource.transaction.mockImplementation((cb) => cb(manager));

      await expect(service.canjear(999, USUARIO_ID, 1)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si no hay stock suficiente', async () => {
      const manager = buildMockManager({
        beneficioRepo: {
          findOne: jest.fn().mockResolvedValue({ ...beneficio, cantidad: 1 }),
        },
      });

      mockDataSource.transaction.mockImplementation((cb) => cb(manager));

      await expect(service.canjear(BENEFICIO_ID, USUARIO_ID, 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar NotFoundException si el usuario no existe o está deshabilitado', async () => {
      const manager = buildMockManager({
        usuarioRepo: { findOne: jest.fn().mockResolvedValue(null) },
      });

      mockDataSource.transaction.mockImplementation((cb) => cb(manager));

      await expect(service.canjear(BENEFICIO_ID, 999, 1)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el usuario no tiene rol USUARIO', async () => {
      const manager = buildMockManager({
        usuarioRepo: {
          findOne: jest.fn().mockResolvedValue({
            id: USUARIO_ID,
            puntos: 2000,
            rol: Rol.COLABORADOR,
            habilitado: true,
          }),
        },
      });

      mockDataSource.transaction.mockImplementation((cb) => cb(manager));

      await expect(service.canjear(BENEFICIO_ID, USUARIO_ID, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el usuario no tiene suficientes puntos', async () => {
      const manager = buildMockManager({
        usuarioRepo: {
          findOne: jest.fn().mockResolvedValue({
            id: USUARIO_ID,
            puntos: 10,
            rol: Rol.USUARIO,
            habilitado: true,
          }),
        },
      });

      mockDataSource.transaction.mockImplementation((cb) => cb(manager));

      await expect(service.canjear(BENEFICIO_ID, USUARIO_ID, 2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});