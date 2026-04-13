import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { Beneficios } from '../../src/Entities/beneficio.entity';
import { Empresa } from '../../src/Entities/empresa.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import {
  BeneficioEstado,
  BeneficiosUsuarioEstado,
} from '../../src/Modules/benefit/dto/enum/enum';
import { Rol } from '../../src/Modules/user/enums/enums';

const mockEmpresa = Object.assign(new Empresa(), {
  id: 1,
  razon_social: 'Empresa Test S.A.',
  nombre_empresa: 'Test Empresa',
  rubro: 'Tecnología',
  verificada: true,
  habilitada: true,
  logo: 'logo.png',
});

const mockUsuario = Object.assign(new Usuario(), {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  puntos: 1000,
  rol: Rol.USUARIO,
  habilitado: true,
});

const mockBeneficio = Object.assign(new Beneficios(), {
  id: 1,
  titulo: 'Descuento 20%',
  tipo: 'Descuento',
  detalle: '20% de descuento en toda la tienda',
  cantidad: 100,
  valor: 50,
  estado: BeneficioEstado.PENDIENTE,
  empresa: mockEmpresa,
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
  creado_por: mockUsuario,
  actualizado_por: mockUsuario,
});

const mockUsuarioBeneficio = Object.assign(new UsuarioBeneficio(), {
  id: 1,
  usuario: mockUsuario,
  beneficio: mockBeneficio,
  cantidad: 2,
  usados: 0,
  estado: BeneficiosUsuarioEstado.ACTIVO,
  fecha_reclamo: new Date(),
  ultimo_cambio: new Date(),
});

describe('BeneficioService', () => {
  let service: BeneficioService;
  let beneficiosRepository: jest.Mocked<Repository<Beneficios>>;
  let empresasRepository: jest.Mocked<Repository<Empresa>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const mockBeneficiosRepo = mock<Repository<Beneficios>>();
    const mockEmpresasRepo = mock<Repository<Empresa>>();
    const mockDataSource = mock<DataSource>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeneficioService,
        {
          provide: getRepositoryToken(Beneficios),
          useValue: mockBeneficiosRepo,
        },
        { provide: getRepositoryToken(Empresa), useValue: mockEmpresasRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<BeneficioService>(BeneficioService);
    beneficiosRepository = module.get(getRepositoryToken(Beneficios));
    empresasRepository = module.get(getRepositoryToken(Empresa));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllPaginated', () => {
    beforeEach(() => {
      beneficiosRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('debe obtener beneficios paginados sin filtros', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockBeneficio], 1]);

      const result = await service.findAllPaginated(1, 10, '', false);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe filtrar por onlyEnabled = true', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockBeneficio], 1]);

      await service.findAllPaginated(1, 10, '', true);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'beneficio.estado = :estado',
        {
          estado: BeneficioEstado.APROBADO,
        },
      );
    });

    it('debe filtrar por search', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginated(1, 10, 'descuento', false);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'beneficio.titulo ILIKE :search',
        {
          search: '%descuento%',
        },
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.findAllPaginated(1, 10, '', false)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('findByEmpresaPaginated', () => {
    const empresaId = 1;

    it('debe obtener beneficios por empresa paginados', async () => {
      beneficiosRepository.findAndCount.mockResolvedValue([[mockBeneficio], 1]);

      const result = await service.findByEmpresaPaginated(empresaId, 1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(beneficiosRepository.findAndCount).toHaveBeenCalled();
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      beneficiosRepository.findAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(
        service.findByEmpresaPaginated(empresaId, 1, 10),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('create', () => {
    const usuarioId = 1;
    const createDto: CreateBeneficiosDTO = {
      titulo: 'Descuento 20%',
      tipo: 'Descuento',
      detalle: '20% de descuento',
      cantidad: 100,
      valor: 50,
      id_empresa: 1,
    };

    beforeEach(() => {
      empresasRepository.findOne.mockResolvedValue(mockEmpresa);
      beneficiosRepository.create.mockReturnValue(mockBeneficio);
      beneficiosRepository.save.mockResolvedValue(mockBeneficio);
    });

    it('debe crear un beneficio exitosamente', async () => {
      const result = await service.create(createDto, usuarioId);

      expect(result.id).toBe(1);
      expect(empresasRepository.findOne).toHaveBeenCalled();
      expect(beneficiosRepository.create).toHaveBeenCalled();
      expect(beneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la empresa no existe', async () => {
      empresasRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, usuarioId)).rejects.toThrow(
        'Empresa con ID 1 no encontrada o deshabilitada',
      );
    });

    it('debe lanzar error cuando la cantidad es menor o igual a 0', async () => {
      const dtoInvalido = { ...createDto, cantidad: 0 };

      await expect(service.create(dtoInvalido, usuarioId)).rejects.toThrow(
        'La cantidad debe ser mayor a 0',
      );
    });

    it('debe lanzar error cuando el valor es negativo', async () => {
      const dtoInvalido = { ...createDto, valor: -10 };

      await expect(service.create(dtoInvalido, usuarioId)).rejects.toThrow(
        'El valor no puede ser negativo',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresasRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.create(createDto, usuarioId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('canjear', () => {
    const beneficioId = 1;
    const userId = 1;
    const cantidad = 2;

    const mockEntityManager = {
      getRepository: jest.fn(),
    };

    const mockBeneficioRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockUsuarioRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockUsuarioBeneficioRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    beforeEach(() => {
      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Beneficios) return mockBeneficioRepo;
        if (entity === Usuario) return mockUsuarioRepo;
        if (entity === UsuarioBeneficio) return mockUsuarioBeneficioRepo;
        return null;
      });

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
    });

    it('debe canjear un beneficio exitosamente (nuevo registro)', async () => {
      mockBeneficioRepo.findOne.mockResolvedValue(mockBeneficio);
      mockUsuarioRepo.findOne.mockResolvedValue(mockUsuario);
      mockUsuarioBeneficioRepo.findOne.mockResolvedValue(null);
      mockUsuarioBeneficioRepo.create.mockReturnValue(mockUsuarioBeneficio);
      mockUsuarioBeneficioRepo.save.mockResolvedValue(mockUsuarioBeneficio);

      const result = await service.canjear(beneficioId, userId, cantidad);

      expect(result.success).toBe(true);
      expect(result.cantidadCanjeada).toBe(2);
      expect(result.puntosGastados).toBe(100);
      expect(mockBeneficioRepo.save).toHaveBeenCalled();
      expect(mockUsuarioRepo.save).toHaveBeenCalled();
    });

    it('debe canjear un beneficio exitosamente (actualizando existente)', async () => {
      const existente = { ...mockUsuarioBeneficio, cantidad: 1 };
      mockBeneficioRepo.findOne.mockResolvedValue(mockBeneficio);
      mockUsuarioRepo.findOne.mockResolvedValue(mockUsuario);
      mockUsuarioBeneficioRepo.findOne.mockResolvedValue(existente);

      const result = await service.canjear(beneficioId, userId, cantidad);

      expect(result.success).toBe(true);
      expect(mockUsuarioBeneficioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ cantidad: 3 }),
      );
    });

    it('debe lanzar error cuando el beneficio no existe', async () => {
      mockBeneficioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.canjear(beneficioId, userId, cantidad),
      ).rejects.toThrow('Beneficio no encontrado');
    });

    it('debe lanzar error cuando no hay stock suficiente', async () => {
      const beneficioSinStock = { ...mockBeneficio, cantidad: 1 };
      mockBeneficioRepo.findOne.mockResolvedValue(beneficioSinStock);

      await expect(
        service.canjear(beneficioId, userId, cantidad),
      ).rejects.toThrow('Stock insuficiente');
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      mockBeneficioRepo.findOne.mockResolvedValue(mockBeneficio);
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.canjear(beneficioId, userId, cantidad),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debe lanzar error cuando el usuario no tiene suficientes puntos', async () => {
      const usuarioSinPuntos = { ...mockUsuario, puntos: 50 };
      mockBeneficioRepo.findOne.mockResolvedValue(mockBeneficio);
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioSinPuntos);

      await expect(
        service.canjear(beneficioId, userId, cantidad),
      ).rejects.toThrow('Puntos insuficientes');
    });

    it('debe lanzar error cuando el usuario no es de tipo USUARIO', async () => {
      const usuarioNoUsuario = Object.assign(new Usuario(), {
        ...mockUsuario,
        rol: Rol.COLABORADOR,
      });

      mockBeneficioRepo.findOne.mockResolvedValue(mockBeneficio);
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioNoUsuario);

      await expect(
        service.canjear(beneficioId, userId, cantidad),
      ).rejects.toThrow('Solo los usuarios pueden canjear beneficios');
    });
  });

  describe('update', () => {
    const beneficioId = 1;
    const usuarioId = 1;
    const updateDto: UpdateBeneficiosDTO = {
      titulo: 'Nuevo título',
      cantidad: 200,
    };

    beforeEach(() => {
      beneficiosRepository.findOne.mockResolvedValue(mockBeneficio);
      beneficiosRepository.save.mockResolvedValue(mockBeneficio);
    });

    it('debe actualizar un beneficio exitosamente', async () => {
      const result = await service.update(beneficioId, updateDto, usuarioId);

      expect(result.id).toBe(1);
      expect(beneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el beneficio no existe', async () => {
      beneficiosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(beneficioId, updateDto, usuarioId),
      ).rejects.toThrow(`Beneficio con ID ${beneficioId} no encontrado`);
    });

    it('debe lanzar error cuando la cantidad es negativa', async () => {
      const dtoInvalido = { ...updateDto, cantidad: -10 };

      await expect(
        service.update(beneficioId, dtoInvalido, usuarioId),
      ).rejects.toThrow('La cantidad no puede ser negativa');
    });

    it('debe lanzar error cuando el valor es negativo', async () => {
      const dtoInvalido = { ...updateDto, valor: -10 };

      await expect(
        service.update(beneficioId, dtoInvalido, usuarioId),
      ).rejects.toThrow('El valor no puede ser negativo');
    });

    it('debe lanzar error cuando el beneficio actualizado no se encuentra después de guardar', async () => {
      const updateDto: UpdateBeneficiosDTO = { titulo: 'Nuevo título' };

      beneficiosRepository.findOne.mockResolvedValueOnce(mockBeneficio);

      beneficiosRepository.findOne.mockResolvedValueOnce(null);
      beneficiosRepository.save.mockResolvedValue(mockBeneficio);

      await expect(
        service.update(beneficioId, updateDto, usuarioId),
      ).rejects.toThrow('Error al recuperar el beneficio actualizado');
    });

    it('debe actualizar solo los campos que vienen en el DTO', async () => {
      const updateDto: UpdateBeneficiosDTO = { titulo: 'Nuevo título' };

      beneficiosRepository.findOne.mockResolvedValue(mockBeneficio);
      beneficiosRepository.save.mockResolvedValue(mockBeneficio);

      const result = await service.update(beneficioId, updateDto, usuarioId);

      expect(result.id).toBe(1);
      expect(beneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      beneficiosRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(
        service.update(beneficioId, updateDto, usuarioId),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('updateEstado', () => {
    const beneficioId = 1;
    const usuarioId = 1;
    const estado = BeneficioEstado.APROBADO;

    beforeEach(() => {
      beneficiosRepository.findOne.mockResolvedValue(mockBeneficio);
      beneficiosRepository.save.mockResolvedValue(mockBeneficio);
    });

    it('debe actualizar el estado de un beneficio como ADMIN', async () => {
      const result = await service.updateEstado(
        beneficioId,
        estado,
        usuarioId,
        Rol.ADMIN,
      );

      expect(result.estado).toBe(BeneficioEstado.APROBADO);
      expect(beneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe actualizar el estado de un beneficio como COLABORADOR', async () => {
      const result = await service.updateEstado(
        beneficioId,
        estado,
        usuarioId,
        Rol.COLABORADOR,
      );

      expect(result.estado).toBe(BeneficioEstado.APROBADO);
      expect(beneficiosRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el beneficio no existe', async () => {
      beneficiosRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEstado(beneficioId, estado, usuarioId, Rol.ADMIN),
      ).rejects.toThrow(`Beneficio con ID ${beneficioId} no encontrado`);
    });

    it('debe lanzar error cuando el beneficio actualizado no se encuentra después de guardar', async () => {
      beneficiosRepository.findOne.mockResolvedValueOnce(mockBeneficio);

      beneficiosRepository.findOne.mockResolvedValueOnce(null);
      beneficiosRepository.save.mockResolvedValue(mockBeneficio);

      await expect(
        service.updateEstado(beneficioId, estado, usuarioId, Rol.ADMIN),
      ).rejects.toThrow('Error al recuperar el beneficio actualizado');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      beneficiosRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(
        service.updateEstado(beneficioId, estado, usuarioId, Rol.ADMIN),
      ).rejects.toThrow('Error desconocido');
    });
  });
});
