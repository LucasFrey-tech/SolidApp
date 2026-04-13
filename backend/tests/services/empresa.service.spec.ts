import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { EmpresaService } from '../../src/Modules/empresa/empresa.service';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { Empresa } from '../../src/Entities/empresa.entity';
import { EmpresaUsuario } from '../../src/Entities/empresa_usuario.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { Contacto } from '../../src/Entities/contacto.entity';
import { Direccion } from '../../src/Entities/direccion.entity';
import { CreateEmpresaDTO } from '../../src/Modules/empresa/dto/create_empresa.dto';
import { UpdateEmpresaDTO } from '../../src/Modules/empresa/dto/update_empresa.dto';
import { Rol, RolSecundario } from '../../src/Modules/user/enums/enums';
import { BeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_beneficios.dto';
import { PaginatedBeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_paginated_beneficios';
import { BeneficioEstado } from '../../src/Modules/benefit/dto/enum/enum';

const mockContacto = Object.assign(new Contacto(), {
  id: 1,
  correo: 'empresa@test.com',
  prefijo: '11',
  telefono: '12345678',
});

const mockContactoUsuario = Object.assign(new Contacto(), {
  id: 2,
  correo: 'usuario@test.com',
  prefijo: '11',
  telefono: '87654321',
});

const mockDireccion = Object.assign(new Direccion(), {
  id: 1,
  calle: 'Av. Test',
  numero: '123',
  ciudad: 'Ciudad Test',
  provincia: 'Provincia Test',
  codigo_postal: '1234',
});

const mockUsuario = Object.assign(new Usuario(), {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  documento: '12345678',
  clave: 'hashed_password',
  rol: Rol.COLABORADOR,
  contacto: mockContactoUsuario,
  habilitado: true,
});

const mockEmpresa = Object.assign(new Empresa(), {
  id: 1,
  cuit: '30-12345678-9',
  razon_social: 'Empresa Test S.A.',
  nombre_empresa: 'Test Empresa',
  rubro: 'Tecnología',
  descripcion: 'Descripción de la empresa',
  web: 'https://test.com',
  verificada: false,
  habilitada: true,
  logo: 'logo.png',
  contacto: mockContacto,
  direccion: mockDireccion,
  creado_por: mockUsuario,
  actualizado_por: mockUsuario,
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
});

const mockEmpresaUsuario = Object.assign(new EmpresaUsuario(), {
  id: 1,
  id_usuario: 1,
  id_empresa: 1,
  rol: RolSecundario.GESTOR,
  activo: true,
  usuario: mockUsuario,
  empresa: mockEmpresa,
  fecha_asignacion: new Date(),
});

const mockBeneficioResponse: BeneficiosResponseDTO = {
  id: 1,
  titulo: 'Descuento 20%',
  tipo: 'Descuento',
  detalle: '20% de descuento en toda la tienda',
  cantidad: 100,
  valor: 50,
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
  empresa: {
    id: 1,
    razon_social: 'Empresa Test S.A.',
    nombre_empresa: 'Test Empresa',
    rubro: 'Tecnología',
    verificada: true,
    habilitada: true,
    logo: 'logo.png',
  },
  estado: BeneficioEstado.APROBADO,
};

describe('EmpresaService', () => {
  let service: EmpresaService;
  let empresaRepository: jest.Mocked<Repository<Empresa>>;
  let empresaUsuarioRepository: jest.Mocked<Repository<EmpresaUsuario>>;
  let beneficioService: jest.Mocked<BeneficioService>;
  let dataSource: jest.Mocked<DataSource>;
  let hashService: jest.Mocked<HashService>;
  let invitacionesService: jest.Mocked<InvitacionesService>;

  beforeEach(async () => {
    const mockEmpresaRepo = mock<Repository<Empresa>>();
    const mockEmpresaUsuarioRepo = mock<Repository<EmpresaUsuario>>();
    const mockBeneficioService = mock<BeneficioService>();
    const mockDataSource = mock<DataSource>();
    const mockHashService = mock<HashService>();
    const mockInvitacionesService = mock<InvitacionesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: getRepositoryToken(Empresa), useValue: mockEmpresaRepo },
        {
          provide: getRepositoryToken(EmpresaUsuario),
          useValue: mockEmpresaUsuarioRepo,
        },
        { provide: BeneficioService, useValue: mockBeneficioService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: HashService, useValue: mockHashService },
        { provide: InvitacionesService, useValue: mockInvitacionesService },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
    empresaRepository = module.get(getRepositoryToken(Empresa));
    empresaUsuarioRepository = module.get(getRepositoryToken(EmpresaUsuario));
    beneficioService = module.get(BeneficioService);
    dataSource = module.get(DataSource);
    hashService = module.get(HashService);
    invitacionesService = module.get(InvitacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    it('debe obtener empresas paginadas sin búsqueda', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[mockEmpresa], 1]);

      const result = await service.findPaginated(1, 10, '', false);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe obtener empresas paginadas con onlyEnabled = true', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[mockEmpresa], 1]);

      const result = await service.findPaginated(1, 10, '', true);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe filtrar por search', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findPaginated(1, 10, 'test', false);

      expect(empresaRepository.findAndCount).toHaveBeenCalled();
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaRepository.findAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.findPaginated(1, 10, '', false)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe manejar error de base de datos', async () => {
      const error = new Error('Error de conexión');
      empresaRepository.findAndCount.mockRejectedValue(error);

      await expect(service.findPaginated(1, 10, '', false)).rejects.toThrow(
        'Error de conexión',
      );
    });
  });

  describe('getEmpresaByUsuario', () => {
    const usuarioId = 1;

    it('debe obtener la empresa del usuario', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);

      const result = await service.getEmpresaByUsuario(usuarioId);

      expect(result.id).toBe(1);
      expect(empresaUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { usuario: { id: usuarioId } },
        relations: ['empresa'],
      });
    });

    it('debe lanzar error cuando el usuario no gestiona ninguna empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.getEmpresaByUsuario(usuarioId)).rejects.toThrow(
        'El usuario no gestiona ninguna empresa',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaUsuarioRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.getEmpresaByUsuario(usuarioId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('getCupones', () => {
    const usuarioId = 1;
    const mockPaginatedResponse: PaginatedBeneficiosResponseDTO = {
      items: [mockBeneficioResponse],
      total: 1,
    };

    it('debe obtener los cupones de la empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      beneficioService.findByEmpresaPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await service.getCupones(usuarioId, 1, 10);

      expect(result.items).toHaveLength(1);
      expect(beneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        1,
        1,
        10,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaUsuarioRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.getCupones(usuarioId, 1, 10)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('createCupon', () => {
    const usuarioId = 1;
    const createDto = {
      titulo: 'Descuento 20%',
      cantidad: 100,
      valor: 50,
    };

    it('debe crear un cupón', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      beneficioService.create.mockResolvedValue(mockBeneficioResponse);

      const result = await service.createCupon(usuarioId, createDto as any);

      expect(result.id).toBe(1);
      expect(beneficioService.create).toHaveBeenCalledWith(
        { ...createDto, id_empresa: 1 },
        usuarioId,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaUsuarioRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(
        service.createCupon(usuarioId, createDto as any),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('updateCupon', () => {
    const cuponId = 1;
    const usuarioId = 1;
    const updateDto = { titulo: 'Nuevo título' };

    it('debe actualizar un cupón', async () => {
      beneficioService.update.mockResolvedValue(mockBeneficioResponse);

      const result = await service.updateCupon(
        cuponId,
        updateDto as any,
        usuarioId,
      );

      expect(result.id).toBe(1);
      expect(beneficioService.update).toHaveBeenCalledWith(
        cuponId,
        updateDto,
        usuarioId,
      );
    });
  });

  describe('registrarEmpresa', () => {
    const createDto: CreateEmpresaDTO = {
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      correo: 'juan@test.com',
      clave: 'Password123',
      prefijo: '11',
      telefono: '12345678',
      correo_empresa: 'empresa@test.com',
      cuit_empresa: '30123456789',
      razon_social: 'Empresa Test S.A.',
      nombre_empresa: 'Test Empresa',
      calle: 'Av. Test',
      numero: '123',
    };

    beforeEach(() => {
      const mockUsuarioRepo = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };
      const mockEmpresaRepo = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };
      const mockEmpresaUsuarioRepo = {
        create: jest.fn(),
        save: jest.fn(),
      };
      const mockContactoRepo = {
        find: jest.fn(),
      };

      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Usuario) return mockUsuarioRepo;
          if (entity === Empresa) return mockEmpresaRepo;
          if (entity === EmpresaUsuario) return mockEmpresaUsuarioRepo;
          if (entity === Contacto) return mockContactoRepo;
          return null;
        }),
      };

      mockUsuarioRepo.findOne.mockResolvedValue(null);
      mockEmpresaRepo.findOne.mockResolvedValue(null);
      mockContactoRepo.find.mockResolvedValue([]);
      mockUsuarioRepo.create.mockReturnValue(mockUsuario);
      mockUsuarioRepo.save.mockResolvedValue(mockUsuario);
      mockEmpresaRepo.create.mockReturnValue(mockEmpresa);
      mockEmpresaRepo.save.mockResolvedValue(mockEmpresa);
      mockEmpresaUsuarioRepo.create.mockReturnValue(mockEmpresaUsuario);
      mockEmpresaUsuarioRepo.save.mockResolvedValue(mockEmpresaUsuario);

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');
    });

    it('debe registrar una empresa exitosamente', async () => {
      const result = await service.registrarEmpresa(createDto);

      expect(result.id).toBe(1);
      expect(hashService.hash).toHaveBeenCalledWith('Password123');
    });

    it('debe lanzar error cuando el CUIT ya existe', async () => {
      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Empresa) {
            return {
              findOne: jest.fn().mockResolvedValue(mockEmpresa),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Usuario) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Contacto) {
            return {
              find: jest.fn().mockResolvedValue([]),
            };
          }
          return null;
        }),
      };

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        'Ya existe una empresa con ese CUIT',
      );
    });

    it('debe lanzar error cuando el documento ya existe', async () => {
      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Empresa) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Usuario) {
            return {
              findOne: jest.fn().mockResolvedValue(mockUsuario),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Contacto) {
            return {
              find: jest.fn().mockResolvedValue([]),
            };
          }
          return null;
        }),
      };

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        'Ya existe un usuario con ese documento',
      );
    });

    it('debe lanzar error cuando el correo del usuario ya existe', async () => {
      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Empresa) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Usuario) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Contacto) {
            return {
              find: jest.fn().mockResolvedValue([{ correo: 'juan@test.com' }]),
            };
          }
          return null;
        }),
      };

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        'Ya existe un usuario con ese correo',
      );
    });

    it('debe lanzar error cuando el correo de la empresa ya existe', async () => {
      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Empresa) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Usuario) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Contacto) {
            return {
              find: jest
                .fn()
                .mockResolvedValue([{ correo: 'empresa@test.com' }]),
            };
          }
          return null;
        }),
      };

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        'Ya existe una empresa con ese correo',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      dataSource.transaction = jest
        .fn()
        .mockRejectedValue('Error string inesperado');

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('update', () => {
    const usuarioId = 1;
    const updateDto: UpdateEmpresaDTO = {
      descripcion: 'Nueva descripción',
      rubro: 'Nuevo rubro',
    };

    beforeEach(() => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      empresaRepository.preload = jest.fn().mockResolvedValue(mockEmpresa);
      empresaRepository.save.mockResolvedValue(mockEmpresa);
    });

    it('debe actualizar una empresa exitosamente', async () => {
      const result = await service.update(usuarioId, updateDto);

      expect(result.id).toBe(1);
      expect(empresaRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el usuario no gestiona ninguna empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.update(usuarioId, updateDto)).rejects.toThrow(
        'El usuario no gestiona ninguna empresa',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaUsuarioRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.update(usuarioId, updateDto)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe lanzar error cuando la empresa no se encuentra para preload', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      empresaRepository.preload = jest.fn().mockResolvedValue(null);

      await expect(service.update(usuarioId, updateDto)).rejects.toThrow(
        'Empresa con ID 1 no encontrada',
      );
    });
  });

  describe('verify', () => {
    const empresaId = 1;

    beforeEach(() => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresa);
      empresaRepository.save.mockResolvedValue({
        ...mockEmpresa,
        verificada: true,
      });
    });

    it('debe verificar una empresa', async () => {
      const result = await service.verify(empresaId);

      expect(result.verificada).toBe(true);
    });

    it('debe lanzar error cuando la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(empresaId)).rejects.toThrow(
        `Empresa con ID ${empresaId} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.verify(empresaId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('delete', () => {
    const empresaId = 1;

    beforeEach(() => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresa);
      empresaRepository.update.mockResolvedValue({ affected: 1 } as any);
    });

    it('debe deshabilitar una empresa', async () => {
      await service.delete(empresaId);

      expect(empresaRepository.update).toHaveBeenCalledWith(empresaId, {
        habilitada: false,
      });
    });

    it('debe lanzar error cuando la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(empresaId)).rejects.toThrow(
        `Empresa con ID ${empresaId} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.delete(empresaId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('restore', () => {
    const empresaId = 1;

    beforeEach(() => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresa);
      empresaRepository.update.mockResolvedValue({ affected: 1 } as any);
    });

    it('debe restaurar una empresa', async () => {
      await service.restore(empresaId);

      expect(empresaRepository.update).toHaveBeenCalledWith(empresaId, {
        habilitada: true,
      });
    });

    it('debe lanzar error cuando la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(empresaId)).rejects.toThrow(
        `Empresa con ID ${empresaId} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      empresaRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.restore(empresaId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });
});
