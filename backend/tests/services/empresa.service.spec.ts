import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { PerfilEmpresaService } from '../../src/Modules/empresa/empresa.service';
import { PerfilEmpresa } from '../../src/Entities/perfil_empresa.entity';
import { Cuenta, RolCuenta } from '../../src/Entities/cuenta.entity';
import { CuentaService } from '../../src/Modules/cuenta/cuenta.service';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { CreateEmpresaDTO } from '../../src/Modules/empresa/dto/create_empresa.dto';
import { UpdateEmpresaDTO } from '../../src/Modules/empresa/dto/update_empresa.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import { SettingsService } from '../../src/common/settings/settings.service';
import { EmpresaResponseDTO } from '../../src/Modules/empresa/dto/response_empresa.dto';
import { Beneficios } from '../../src/Entities/beneficio.entity';

describe('PerfilEmpresaService', () => {
  let service: PerfilEmpresaService;
  let empresaRepository: MockProxy<Repository<PerfilEmpresa>>;
  let cuentaService: MockProxy<CuentaService>;
  let beneficioService: MockProxy<BeneficioService>;

  const mockCuenta: Cuenta = {
    id: 1,
    correo: 'test@test.com',
    clave: 'hashed_password',
    role: RolCuenta.EMPRESA,
    calle: 'Calle falsa',
    numero: '123',
    codigo_postal: 'B1638',
    ciudad: 'Vicente López',
    provincia: 'Buenos Aires',
    prefijo: '+54',
    telefono: '1123456789',
    deshabilitado: false,
    verificada: false,
    fecha_registro: new Date('2025-12-15T10:30:45Z'),
    ultimo_cambio: new Date('2025-12-15T10:30:45Z'),
    ultima_conexion: new Date('2026-02-22T11:55:00Z'),
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };

  const mockEmpresaCompleta: PerfilEmpresa = {
    id: 1,
    cuit: '20-04856975-3',
    razon_social: 'Supermercados Unidos S.A.',
    nombre_empresa: 'SuperUnidos',
    descripcion: 'Descripción de prueba',
    rubro: 'Supermercado',
    web: 'www.test.com',
    logo: 'logo.png',
    verificada: false,
    cuenta: mockCuenta,
    beneficios: [] as Beneficios[],
  };

  const mockEmpresaBasica: PerfilEmpresa = {
    id: 1,
    cuit: '20-04856975-3',
    razon_social: 'Supermercados Unidos S.A.',
    nombre_empresa: 'SuperUnidos',
    descripcion: '',
    rubro: '',
    web: 'www.test.com',
    logo: '',
    verificada: false,
    cuenta: { id: 1 } as Cuenta,
    beneficios: [] as Beneficios[],
  };

  beforeEach(async () => {
    empresaRepository = mock<Repository<PerfilEmpresa>>();
    cuentaService = mock<CuentaService>();
    beneficioService = mock<BeneficioService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilEmpresaService,
        {
          provide: getRepositoryToken(PerfilEmpresa),
          useValue: empresaRepository,
        },
        {
          provide: CuentaService,
          useValue: cuentaService,
        },
        {
          provide: BeneficioService,
          useValue: beneficioService,
        },
      ],
    }).compile();

    service = module.get<PerfilEmpresaService>(PerfilEmpresaService);
  });

  describe('findPaginated', () => {
    it('debería retornar empresas paginadas sin búsqueda', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[mockEmpresaCompleta], 1]),
      };

      empresaRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findPaginated(1, 10, '', false);

      expect(result).toEqual({
        items: [
          expect.objectContaining({
            id: mockEmpresaCompleta.id,
            cuit_empresa: mockEmpresaCompleta.cuit,
            razon_social: mockEmpresaCompleta.razon_social,
          }),
        ],
        total: 1,
      });
      expect(empresaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'perfil',
      );
    });

    it('debería filtrar solo empresas habilitadas cuando onlyEnabled es true', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[mockEmpresaCompleta], 1]),
      };

      empresaRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findPaginated(1, 10, '', true);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'cuenta.deshabilitado = :deshabilitado',
        { deshabilitado: false },
      );
    });

    it('debería aplicar búsqueda por texto', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[mockEmpresaCompleta], 1]),
      };

      empresaRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findPaginated(1, 10, 'Super', false);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(perfil.razon_social LIKE :search OR perfil.nombre_empresa LIKE :search OR cuenta.correo LIKE :search)',
        { search: '%Super%' },
      );
    });
  });

  describe('findOne', () => {
    it('debería retornar una empresa por ID', async () => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresaCompleta);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(result.id).toBe(mockEmpresaCompleta.id);
      expect(result.cuit_empresa).toBe(mockEmpresaCompleta.cuit);
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, cuenta: { deshabilitado: false } },
        relations: ['cuenta'],
      });
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'La Empresa con ID 999 no encontrada',
      );
    });
  });

  describe('findByCuentaId', () => {
    it('debería retornar el perfil por ID de cuenta', async () => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresaCompleta);

      const result = await service.findByCuentaId(1);

      expect(result).toBe(mockEmpresaCompleta);
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuenta: { id: 1 } },
        relations: ['cuenta'],
      });
    });

    it('debería lanzar NotFoundException si no existe el perfil', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.findByCuentaId(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByCuentaId(999)).rejects.toThrow(
        'Perfil de empresa para cuenta 999 no encontrado',
      );
    });
  });

  describe('getCupones', () => {
    it('debería retornar cupones paginados de una empresa', async () => {
      const mockPaginatedResponse = {
        items: [],
        total: 0,
      };

      beneficioService.findByEmpresaPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await service.getCupones(1, 1, 10);

      expect(result).toBe(mockPaginatedResponse);
      expect(beneficioService.findByEmpresaPaginated).toHaveBeenCalledWith(
        1,
        1,
        10,
      );
    });
  });

  describe('createCupon', () => {
    it('debería crear un cupón para una empresa', async () => {
      const createDto: CreateBeneficiosDTO = {
        titulo: 'Descuento 15%',
        tipo: 'Discount',
        detalle: 'Descuento en supermercado',
        cantidad: 50,
        valor: 100,
        id_empresa: 1,
      };

      const mockBeneficioResponse = { id: 1, ...createDto };
      beneficioService.create.mockResolvedValue(mockBeneficioResponse as any);

      const result = await service.createCupon(1, createDto);

      expect(result).toBe(mockBeneficioResponse);
      expect(beneficioService.create).toHaveBeenCalledWith({
        ...createDto,
        id_empresa: 1,
      });
    });
  });

  describe('updateCupon', () => {
    it('debería actualizar un cupón', async () => {
      const updateDto: UpdateBeneficiosDTO = {
        cantidad: 30,
        valor: 150,
      };

      const mockUpdatedResponse = { id: 1, ...updateDto };
      beneficioService.update.mockResolvedValue(mockUpdatedResponse as any);

      const result = await service.updateCupon(1, updateDto);

      expect(result).toBe(mockUpdatedResponse);
      expect(beneficioService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('create', () => {
    const createDto: CreateEmpresaDTO = {
      cuit_empresa: '20-04856975-3',
      razon_social: 'Supermercados Unidos S.A.',
      nombre_empresa: 'SuperUnidos',
      rubro: 'Supermercado',
      web: 'www.test.com',
    };

    it('debería crear una nueva empresa', async () => {
      empresaRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      empresaRepository.create.mockReturnValue(mockEmpresaBasica);
      empresaRepository.save.mockResolvedValue(mockEmpresaBasica);

      const result = await service.create(createDto, 1);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(result.id).toBe(mockEmpresaBasica.id);
      expect(result.cuit_empresa).toBe(mockEmpresaBasica.cuit);
      expect(empresaRepository.create).toHaveBeenCalledWith({
        cuit: createDto.cuit_empresa,
        razon_social: createDto.razon_social,
        nombre_empresa: createDto.nombre_empresa,
        web: createDto.web,
        verificada: false,
        cuenta: { id: 1 },
      });
    });

    it('debería usar EntityManager si se proporciona', async () => {
      const mockManager = mock<EntityManager>();
      const mockRepo = mock<Repository<PerfilEmpresa>>();
      mockManager.getRepository.mockReturnValue(mockRepo);

      mockRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockRepo.create.mockReturnValue(mockEmpresaBasica);
      mockRepo.save.mockResolvedValue(mockEmpresaBasica);

      await service.create(createDto, 1, mockManager);

      expect(mockManager.getRepository).toHaveBeenCalledWith(PerfilEmpresa);
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si ya existe perfil para la cuenta', async () => {
      const mockPerfilExistente: PerfilEmpresa = {
        ...mockEmpresaBasica,
        id: 1,
        cuenta: mockCuenta,
      };

      empresaRepository.findOne.mockResolvedValueOnce(mockPerfilExistente);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        'Ya existe un perfil para esta cuenta',
      );
    });

    it('debería lanzar ConflictException si el CUIT ya existe', async () => {
      const mockCuitExistente: PerfilEmpresa = {
        ...mockEmpresaBasica,
        id: 2,
        cuit: '20-04856975-3',
        cuenta: mockCuenta,
      };

      empresaRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCuitExistente);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        'La Empresa ya está registrada',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateEmpresaDTO = {
      descripcion: 'Nueva descripción',
      rubro: 'Hipermercado',
      web: 'www.nueva-web.com',
      telefono: '1198765432',
      calle: 'Av. Nueva',
      numero: '456',
    };

    it('debería actualizar datos de la empresa y cuenta', async () => {
      const mockEmpresaActualizada: PerfilEmpresa = {
        ...mockEmpresaCompleta,
        descripcion: updateDto.descripcion!,
        rubro: updateDto.rubro!,
        web: updateDto.web!,
        cuenta: {
          ...mockCuenta,
          telefono: updateDto.telefono!,
          calle: updateDto.calle!,
          numero: updateDto.numero!,
        },
      };

      empresaRepository.findOne.mockResolvedValue(mockEmpresaCompleta);
      empresaRepository.save.mockResolvedValue(mockEmpresaActualizada);

      const result = await service.update(1, updateDto);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(empresaRepository.save).toHaveBeenCalled();
      expect(cuentaService.updateUsuario).toHaveBeenCalledWith(
        mockEmpresaCompleta.cuenta.id,
        {
          telefono: updateDto.telefono,
          calle: updateDto.calle,
          numero: updateDto.numero,
        },
      );
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Empresa con ID 999 no encontrada',
      );
    });

    it('debería ignorar campos undefined en el DTO', async () => {
      const partialUpdateDto: UpdateEmpresaDTO = {
        descripcion: 'Solo descripción',
      };

      const mockEmpresaParcial: PerfilEmpresa = {
        ...mockEmpresaCompleta,
        descripcion: partialUpdateDto.descripcion!,
      };

      empresaRepository.findOne.mockResolvedValue(mockEmpresaCompleta);
      empresaRepository.save.mockResolvedValue(mockEmpresaParcial);

      await service.update(1, partialUpdateDto);

      expect(cuentaService.updateUsuario).not.toHaveBeenCalled();
    });
  });

  describe('updateCredenciales', () => {
    it('debería actualizar credenciales del usuario', async () => {
      const credencialesDto: UpdateCredencialesDto = {
        correo: 'nuevo@email.com',
        passwordActual: 'oldPass123',
        passwordNueva: 'newPass123',
      };

      cuentaService.updateCredenciales.mockResolvedValue(undefined);

      await service.updateCredenciales(1, credencialesDto);

      expect(cuentaService.updateCredenciales).toHaveBeenCalledWith(
        1,
        credencialesDto,
      );
    });
  });

  describe('verify', () => {
    it('debería marcar una empresa como verificada', async () => {
      const empresaParaModificar: PerfilEmpresa = {
        ...mockEmpresaCompleta,
        verificada: false,
        cuenta: {
          ...mockCuenta,
          verificada: false,
        },
      };

      const empresaVerificada: PerfilEmpresa = {
        ...empresaParaModificar,
        verificada: true,
        cuenta: {
          ...empresaParaModificar.cuenta,
          verificada: true,
        },
      };

      empresaRepository.findOne.mockResolvedValue(empresaParaModificar);
      empresaRepository.save.mockResolvedValue(empresaVerificada);

      const result = await service.verify(1);

      expect(result.verificada).toBe(true);
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('debería deshabilitar una empresa (soft delete)', async () => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresaCompleta);
      cuentaService.deshabilitar.mockResolvedValue(undefined);

      await service.delete(1);

      expect(cuentaService.deshabilitar).toHaveBeenCalledWith(
        mockEmpresaCompleta.cuenta.id,
      );
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow(
        'Usuario con ID 999 no encontrado',
      );
    });
  });

  describe('restore', () => {
    it('debería restaurar una empresa deshabilitada', async () => {
      empresaRepository.findOne.mockResolvedValue(mockEmpresaCompleta);
      cuentaService.habilitar.mockResolvedValue(undefined);

      await service.restore(1);

      expect(cuentaService.habilitar).toHaveBeenCalledWith(
        mockEmpresaCompleta.cuenta.id,
      );
    });

    it('debería lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('mapToResponseDto', () => {
    it('debería mapear correctamente la entidad a DTO', () => {
      const result = (service as any).mapToResponseDto(mockEmpresaCompleta);

      expect(result).toBeInstanceOf(EmpresaResponseDTO);
      expect(result.id).toBe(mockEmpresaCompleta.id);
      expect(result.cuit_empresa).toBe(mockEmpresaCompleta.cuit);
      expect(result.correo).toBe(mockEmpresaCompleta.cuenta.correo);
      expect(result.logo).toBe(
        SettingsService.getEmpresaImageUrl(mockEmpresaCompleta.logo),
      );
    });

    it('debería manejar logo vacío', () => {
      const empresaSinLogo: PerfilEmpresa = {
        ...mockEmpresaCompleta,
        logo: '',
      };

      const result = (service as any).mapToResponseDto(empresaSinLogo);

      expect(result.logo).toBe('');
    });
  });
});
