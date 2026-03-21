import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { EmpresaService } from '../../src/Modules/empresa/empresa.service';
import { Empresa } from '../../src/Entities/empresa.entity';
import { EmpresaUsuario } from '../../src/Entities/empresa_usuario.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { DataSource } from 'typeorm';

import { CreateEmpresaDTO } from '../../src/Modules/empresa/dto/create_empresa.dto';
import { UpdateEmpresaDTO } from '../../src/Modules/empresa/dto/update_empresa.dto';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import { EmpresaResponseDTO } from '../../src/Modules/empresa/dto/response_empresa.dto';
import { SettingsService } from '../../src/common/settings/settings.service';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let empresaRepository: MockProxy<Repository<Empresa>>;
  let empresaUsuarioRepository: MockProxy<Repository<EmpresaUsuario>>;
  let usuarioRepository: MockProxy<Repository<Usuario>>;
  let beneficioService: MockProxy<BeneficioService>;
  let hashService: MockProxy<HashService>;
  let invitacionesService: MockProxy<InvitacionesService>;
  let dataSource: MockProxy<DataSource>;

  const USUARIO_ID = 1;
  const EMPRESA_ID = 1;

  let mockEmpresa: Empresa;
  let mockEmpresaUsuario: EmpresaUsuario;

  beforeEach(async () => {
    empresaRepository = mock<Repository<Empresa>>();
    empresaUsuarioRepository = mock<Repository<EmpresaUsuario>>();
    usuarioRepository = mock<Repository<Usuario>>();
    beneficioService = mock<BeneficioService>();
    hashService = mock<HashService>();
    invitacionesService = mock<InvitacionesService>();
    dataSource = mock<DataSource>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: getRepositoryToken(Empresa),
          useValue: empresaRepository,
        },
        {
          provide: getRepositoryToken(EmpresaUsuario),
          useValue: empresaUsuarioRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
        {
          provide: BeneficioService,
          useValue: beneficioService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: HashService,
          useValue: hashService,
        },
        {
          provide: InvitacionesService,
          useValue: invitacionesService,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);

    // ========== Entidades base ==========
    mockEmpresa = {
      id: EMPRESA_ID,
      cuit: '30123456789',
      razon_social: 'Supermercados Unidos S.A.',
      nombre_empresa: 'SuperUnidos',
      descripcion: 'Descripción de prueba',
      rubro: 'Supermercado',
      web: 'www.test.com',
      logo: 'logo.png',
      verificada: false,
      habilitada: true,
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      contacto: {
        id: 1,
        correo: 'empresa@test.com',
        prefijo: '+54',
        telefono: '1123456789',
      } as any,
      direccion: {
        id: 1,
        calle: 'Av. Siempreviva',
        numero: '742',
        provincia: 'Buenos Aires',
        ciudad: 'CABA',
        codigo_postal: '1234',
      } as any,
      beneficios: [],
    } as unknown as Empresa;

    mockEmpresaUsuario = {
      id: 1,
      empresa: mockEmpresa,
      usuario: { id: USUARIO_ID } as Usuario,
      activo: true,
    } as EmpresaUsuario;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND PAGINATED ==========
  describe('findPaginated', () => {
    it('debe retornar empresas paginadas sin búsqueda', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[mockEmpresa], 1]);

      const result = await service.findPaginated(1, 10, '', false);

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(mockEmpresa.id);
      expect(empresaRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('debe filtrar solo empresas habilitadas cuando onlyEnabled es true', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[mockEmpresa], 1]);

      await service.findPaginated(1, 10, '', true);

      expect(empresaRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            expect.objectContaining({ habilitada: true }),
          ]),
        }),
      );
    });

    it('debe aplicar búsqueda por nombre_empresa y razon_social', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[mockEmpresa], 1]);

      await service.findPaginated(1, 10, 'Super', false);

      const call = (empresaRepository.findAndCount as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(call.where)).toBe(true);
      expect(call.where).toHaveLength(2);
    });

    it('debe respetar la paginación', async () => {
      empresaRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findPaginated(3, 5, '', false);

      expect(empresaRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ========== TESTS DE GET EMPRESA BY USUARIO ==========
  describe('getEmpresaByUsuario', () => {
    it('debe retornar el DTO de empresa del usuario', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);

      const result = await service.getEmpresaByUsuario(USUARIO_ID);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(result.id).toBe(mockEmpresa.id);
      expect(empresaUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuario: { id: USUARIO_ID } },
          relations: ['empresa'],
        }),
      );
    });

    it('debe lanzar ForbiddenException si el usuario no gestiona ninguna empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.getEmpresaByUsuario(USUARIO_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ========== TESTS DE GET CUPONES ==========
  describe('getCupones', () => {
    it('debe retornar cupones paginados de la empresa del usuario', async () => {
      const mockPaginatedResponse = { items: [], total: 0 };
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      beneficioService.findByEmpresaPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await service.getCupones(USUARIO_ID, 1, 10);

      expect(result).toBe(mockPaginatedResponse);
      expect(beneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        EMPRESA_ID,
        1,
        10,
      );
    });

    it('debe lanzar ForbiddenException si el usuario no gestiona ninguna empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.getCupones(USUARIO_ID, 1, 10)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ========== TESTS DE CREATE CUPON ==========
  describe('createCupon', () => {
    it('debe crear un cupón para la empresa del usuario', async () => {
      const createDto: CreateBeneficiosDTO = {
        titulo: 'Descuento 15%',
        tipo: 'Discount',
        detalle: 'Descuento en supermercado',
        cantidad: 50,
        valor: 100,
        id_empresa: EMPRESA_ID,
      };

      const mockBeneficioResponse = { id: 1, ...createDto } as any;
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      beneficioService.create.mockResolvedValue(mockBeneficioResponse);

      const result = await service.createCupon(USUARIO_ID, createDto);

      expect(result).toBe(mockBeneficioResponse);
      expect(beneficioService.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_empresa: EMPRESA_ID }),
        USUARIO_ID,
      );
    });

    it('debe lanzar ForbiddenException si el usuario no gestiona ninguna empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createCupon(USUARIO_ID, {} as CreateBeneficiosDTO),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ========== TESTS DE UPDATE CUPON ==========
  describe('updateCupon', () => {
    it('debe actualizar un cupón pasando el usuarioId', async () => {
      const updateDto: UpdateBeneficiosDTO = { cantidad: 30, valor: 150 };
      const mockUpdatedResponse = { id: 1, ...updateDto } as any;

      beneficioService.update.mockResolvedValue(mockUpdatedResponse);

      const result = await service.updateCupon(1, updateDto, USUARIO_ID);

      expect(result).toBe(mockUpdatedResponse);
      expect(beneficioService.update).toHaveBeenCalledWith(1, updateDto, USUARIO_ID);
    });
  });

  // ========== TESTS DE REGISTRAR EMPRESA ==========
  describe('registrarEmpresa', () => {
    const createDto: CreateEmpresaDTO = {
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      correo: 'juan@empresa.com',
      clave: 'Password123',
      prefijo: '11',
      telefono: '1123456789',
      correo_empresa: 'contacto@empresa.com',
      cuit_empresa: '30123456789',
      razon_social: 'Mi Empresa S.A.',
      nombre_empresa: 'Mi Empresa',
      calle: 'Av. Siempreviva',
      numero: '742',
      web: 'www.miempresa.com',
    };

    it('debe registrar una empresa correctamente', async () => {
      const mockGestor = { id: 99 } as Usuario;
      const mockEmpresaGuardada = { ...mockEmpresa, id: 2 };

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Usuario) {
              return {
                findOne: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockReturnValue(mockGestor),
                save: jest.fn().mockResolvedValue(mockGestor),
              };
            }
            if (entity === Empresa) {
              return {
                findOne: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockReturnValue(mockEmpresaGuardada),
                save: jest.fn().mockResolvedValue(mockEmpresaGuardada),
              };
            }
            if (entity === EmpresaUsuario) {
              return {
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockResolvedValue({}),
              };
            }
            return {};
          }),
        };
        return cb(mockManager);
      });

      hashService.hash.mockResolvedValue('hashed-password');

      const result = await service.registrarEmpresa(createDto);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si ya existe empresa con ese CUIT', async () => {
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Empresa) {
              return {
                findOne: jest.fn().mockResolvedValue(mockEmpresa),
              };
            }
            return { findOne: jest.fn().mockResolvedValue(null) };
          }),
        };
        return cb(mockManager);
      });

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si ya existe usuario con ese documento', async () => {
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Empresa) {
              return { findOne: jest.fn().mockResolvedValue(null) };
            }
            if (entity === Usuario) {
              return {
                findOne: jest.fn().mockResolvedValue({ id: 99 }),
              };
            }
            return { findOne: jest.fn().mockResolvedValue(null) };
          }),
        };
        return cb(mockManager);
      });

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si ya existe usuario con ese correo', async () => {
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Empresa) {
              return { findOne: jest.fn().mockResolvedValue(null) };
            }
            if (entity === Usuario) {
              return {
                findOne: jest
                  .fn()
                  .mockResolvedValueOnce(null)
                  .mockResolvedValueOnce({ id: 99 }),
              };
            }
            return { findOne: jest.fn().mockResolvedValue(null) };
          }),
        };
        return cb(mockManager);
      });

      await expect(service.registrarEmpresa(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ========== TESTS DE UPDATE ==========
  describe('update', () => {
    const updateDto: UpdateEmpresaDTO = {
      descripcion: 'Nueva descripción',
      rubro: 'Hipermercado',
      web: 'www.nueva-web.com',
    };

    it('debe actualizar datos de la empresa correctamente', async () => {
      const empresaPreload = { ...mockEmpresa, ...updateDto };
      empresaUsuarioRepository.findOne.mockResolvedValue({
        ...mockEmpresaUsuario,
        empresa: {
          ...mockEmpresa,
          contacto: mockEmpresa.contacto,
          direccion: mockEmpresa.direccion,
        },
      } as EmpresaUsuario);
      empresaRepository.preload.mockResolvedValue(empresaPreload as Empresa);
      empresaRepository.save.mockResolvedValue(empresaPreload as Empresa);

      const result = await service.update(USUARIO_ID, updateDto);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(empresaRepository.save).toHaveBeenCalled();
    });

    it('debe actualizar contacto si se proporciona', async () => {
      const updateConContacto: UpdateEmpresaDTO = {
        contacto: { telefono: '1198765432', prefijo: '11' },
      };

      const empresaPreload = { ...mockEmpresa };
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      empresaRepository.preload.mockResolvedValue(empresaPreload as Empresa);
      empresaRepository.save.mockResolvedValue(empresaPreload as Empresa);

      await service.update(USUARIO_ID, updateConContacto);

      expect(empresaRepository.preload).toHaveBeenCalledWith(
        expect.objectContaining({
          contacto: expect.objectContaining({ telefono: '1198765432' }),
        }),
      );
    });

    it('debe lanzar NotFoundException si el usuario no gestiona ninguna empresa', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.update(USUARIO_ID, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException si la empresa no existe en preload', async () => {
      empresaUsuarioRepository.findOne.mockResolvedValue(mockEmpresaUsuario);
      empresaRepository.preload.mockResolvedValue(undefined);

      await expect(service.update(USUARIO_ID, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ========== TESTS DE VERIFY ==========
  describe('verify', () => {
    it('debe marcar una empresa como verificada', async () => {
      const empresaParaVerificar = { ...mockEmpresa, verificada: false };
      const empresaVerificada = { ...mockEmpresa, verificada: true };

      empresaRepository.findOne.mockResolvedValue(empresaParaVerificar as Empresa);
      empresaRepository.save.mockResolvedValue(empresaVerificada as Empresa);

      const result = await service.verify(EMPRESA_ID);

      expect(result.verificada).toBe(true);
      expect(empresaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ verificada: true }),
      );
    });

    it('debe lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE DELETE ==========
  describe('delete', () => {
    it('debe deshabilitar una empresa (soft delete con update)', async () => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresa);
      empresaRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.delete(EMPRESA_ID);

      expect(empresaRepository.update).toHaveBeenCalledWith(EMPRESA_ID, {
        habilitada: false,
      });
    });

    it('debe lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      expect(empresaRepository.update).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE RESTORE ==========
  describe('restore', () => {
    it('debe restaurar una empresa deshabilitada', async () => {
      const empresaDeshabilitada = { ...mockEmpresa, habilitada: false };
      empresaRepository.findOne.mockResolvedValue(empresaDeshabilitada as Empresa);
      empresaRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.restore(EMPRESA_ID);

      expect(empresaRepository.update).toHaveBeenCalledWith(EMPRESA_ID, {
        habilitada: true,
      });
    });

    it('debe lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
      expect(empresaRepository.update).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE mapToResponseDto ==========
  describe('mapToResponseDto (método privado)', () => {
    it('debe mapear correctamente la entidad al DTO', () => {
      const result = (service as any).mapToResponseDto(mockEmpresa);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(result.id).toBe(mockEmpresa.id);
      expect(result.cuit).toBe(mockEmpresa.cuit);
      expect(result.razon_social).toBe(mockEmpresa.razon_social);
      expect(result.habilitada).toBe(mockEmpresa.habilitada);
      expect(result.logo).toBe(SettingsService.getEmpresaImageUrl(mockEmpresa.logo!));
    });

    it('debe devolver logo vacío si la empresa no tiene logo', () => {
      const empresaSinLogo = { ...mockEmpresa, logo: undefined };

      const result = (service as any).mapToResponseDto(empresaSinLogo);

      expect(result.logo).toBe('');
    });

    it('debe mapear contacto y dirección si existen', () => {
      const result = (service as any).mapToResponseDto(mockEmpresa);

      expect(result.contacto).toBeDefined();
      expect(result.contacto.correo).toBe(mockEmpresa.contacto.correo);
      expect(result.direccion).toBeDefined();
      expect(result.direccion.calle).toBe(mockEmpresa.direccion!.calle);
    });

    it('debe omitir contacto y dirección si no existen', () => {
      const empresaSinContacto = {
        ...mockEmpresa,
        contacto: undefined,
        direccion: undefined,
      };

      const result = (service as any).mapToResponseDto(empresaSinContacto);

      expect(result.contacto).toBeUndefined();
      expect(result.direccion).toBeUndefined();
    });
  });
});