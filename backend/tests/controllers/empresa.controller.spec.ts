import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { EmpresaController } from '../../src/Modules/empresa/empresa.controller';
import { PerfilEmpresaService } from '../../src/Modules/empresa/empresa.service';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { EmpresaResponseDTO } from '../../src/Modules/empresa/dto/response_empresa.dto';
import { UpdateEmpresaDTO } from '../../src/Modules/empresa/dto/update_empresa.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import { PaginatedBeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_paginated_beneficios';
import { BeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_beneficios.dto';
import { RolCuenta, Cuenta } from '../../src/Entities/cuenta.entity';
import { PerfilEmpresa } from '../../src/Entities/perfil_empresa.entity';

describe('EmpresaController', () => {
  let controller: EmpresaController;
  let empresaService: MockProxy<PerfilEmpresaService>;

  let cuenta: Cuenta;
  let perfil: PerfilEmpresa;
  let requestConUsuario: RequestConUsuario;
  let empresaResponseDto: EmpresaResponseDTO;
  let beneficio: BeneficiosResponseDTO;
  let updateEmpresaDto: UpdateEmpresaDTO;
  let updateCredencialesDto: UpdateCredencialesDto;
  let createBeneficioDto: CreateBeneficiosDTO;
  let updateBeneficioDto: UpdateBeneficiosDTO;
  let paginatedBeneficios: PaginatedBeneficiosResponseDTO;

  beforeEach(async () => {
    empresaService = mock<PerfilEmpresaService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [
        {
          provide: PerfilEmpresaService,
          useValue: empresaService,
        },
      ],
    }).compile();

    controller = module.get<EmpresaController>(EmpresaController);

    // ========== Cuenta ==========
    cuenta = {
      id: 1,
      correo: 'empresa@example.com',
      clave: 'hashedPassword',
      role: RolCuenta.EMPRESA,
      deshabilitado: false,
      fecha_registro: new Date(),
      ultima_conexion: new Date(),
      calle: 'Av. Test',
      numero: '123',
      codigo_postal: 'B1638',
      ciudad: 'Villa Ballester',
      provincia: 'Buenos Aires',
      prefijo: '+54',
      telefono: '11-4444-5555',
      verificada: false,
      ultimo_cambio: new Date(),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    } as unknown as Cuenta;

    // ========== Perfil ==========
    perfil = {
      id: 1,
      cuit: '30123456789',
      razon_social: 'Mi Empresa SA',
      nombre_empresa: 'Mi Empresa',
      descripcion: 'Descripción',
      rubro: 'Comercio',
      web: 'https://miempresa.com',
      logo: 'logo.jpg',
      verificada: false,
      cuenta,
    } as unknown as PerfilEmpresa;

    // ========== RequestConUsuario ==========
    requestConUsuario = {
      user: {
        cuenta,
        perfil,
      },
    } as unknown as RequestConUsuario;

    // ========== EmpresaResponseDTO ==========
    empresaResponseDto = {
      id: 1,
      cuit_empresa: '30123456789',
      razon_social: 'Mi Empresa SA',
      nombre_empresa: 'Mi Empresa',
      descripcion: 'Descripción',
      rubro: 'Comercio',
      web: 'https://miempresa.com',
      logo: 'logo.jpg',
      verificada: false,
      correo: 'empresa@example.com',
      deshabilitado: false,
      calle: 'Av. Test',
      numero: '123',
      codigo_postal: 'B1638',
      ciudad: 'Villa Ballester',
      provincia: 'Buenos Aires',
      prefijo: '+54',
      telefono: '11-4444-5555',
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      ultima_conexion: new Date(),
    };

    // ========== Beneficio ==========
    beneficio = {
      id: 1,
      titulo: 'Descuento 20%',
      tipo: 'Descuento',
      detalle: 'Descuento en compras',
      cantidad: 100,
      valor: 500,
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      empresa: {
        id: 1,
        razon_social: 'Mi Empresa SA',
        nombre_empresa: 'Mi Empresa',
        rubro: 'Comercio',
        verificada: false,
        deshabilitado: false,
        logo: 'logo.jpg',
      },
      estado: 'APROBADO',
    };

    // ========== DTOs ==========
    updateEmpresaDto = {
      descripcion: 'Nueva descripción',
      rubro: 'Servicios',
    };

    updateCredencialesDto = {
      passwordActual: 'currentPassword',
      passwordNueva: 'newPassword',
    };

    createBeneficioDto = {
      titulo: 'Descuento 15%',
      tipo: 'Descuento',
      detalle: 'Descuento en compras',
      cantidad: 50,
      valor: 100,
      id_empresa: 1,
    };

    updateBeneficioDto = {
      cantidad: 80,
      valor: 150,
    };

    paginatedBeneficios = {
      items: [beneficio],
      total: 1,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND PAGINATED ==========
  describe('findPaginated', () => {
    it('debe retornar empresas paginadas', async () => {
      const resultado = { items: [empresaResponseDto], total: 1 };
      empresaService.findPaginated.mockResolvedValue(resultado);

      const response = await controller.findPaginated(1, 10, '', false);

      expect(response.items).toHaveLength(1);
      expect(response.total).toBe(1);
      expect(empresaService.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        false,
      );
    });

    it('debe aplicar filtro de búsqueda', async () => {
      const resultado = { items: [empresaResponseDto], total: 1 };
      empresaService.findPaginated.mockResolvedValue(resultado);

      await controller.findPaginated(1, 10, 'Mi Empresa', false);

      expect(empresaService.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        'Mi Empresa',
        false,
      );
    });

    it('debe filtrar solo empresas habilitadas', async () => {
      const resultado = { items: [empresaResponseDto], total: 1 };
      empresaService.findPaginated.mockResolvedValue(resultado);

      await controller.findPaginated(1, 10, '', true);

      expect(empresaService.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        true,
      );
    });
  });

  // ========== TESTS DE GET MI PERFIL ==========
  describe('getMiPerfil', () => {
    it('debe retornar el perfil de la empresa autenticada', async () => {
      empresaService.findOne.mockResolvedValue(empresaResponseDto);

      const resultado = await controller.getMiPerfil(requestConUsuario);

      expect(resultado).toEqual(empresaResponseDto);
      expect(empresaService.findOne).toHaveBeenCalledWith(perfil.id);
    });
  });

  // ========== TESTS DE UPDATE MI PERFIL ==========
  describe('updateMiPerfil', () => {
    it('debe actualizar perfil sin archivo', async () => {
      empresaService.update.mockResolvedValue(empresaResponseDto);

      const resultado = await controller.updateMiPerfil(
        requestConUsuario,
        undefined,
        JSON.stringify(updateEmpresaDto),
      );

      expect(resultado).toEqual(empresaResponseDto);
      expect(empresaService.update).toHaveBeenCalledWith(
        perfil.id,
        updateEmpresaDto,
      );
    });

    it('debe actualizar perfil con archivo logo', async () => {
      const mockFile = {
        fieldname: 'logo',
        originalname: 'logo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'C:/StaticResources/Solid/empresas/',
        filename: 'logo.jpg',
        path: 'C:/StaticResources/Solid/empresas/logo.jpg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      const dtoConLogo = {
        ...updateEmpresaDto,
        logo: 'logo.jpg',
      };

      empresaService.update.mockResolvedValue(empresaResponseDto);

      const resultado = await controller.updateMiPerfil(
        requestConUsuario,
        mockFile,
        JSON.stringify(updateEmpresaDto),
      );

      expect(resultado).toEqual(empresaResponseDto);
      expect(empresaService.update).toHaveBeenCalledWith(perfil.id, dtoConLogo);
    });

    it('debe actualizar perfil solo con archivo sin datos', async () => {
      const mockFile = {
        fieldname: 'logo',
        originalname: 'logo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'C:/StaticResources/Solid/empresas/',
        filename: 'logo.jpg',
        path: 'C:/StaticResources/Solid/empresas/logo.jpg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      empresaService.update.mockResolvedValue(empresaResponseDto);

      await controller.updateMiPerfil(requestConUsuario, mockFile);

      expect(empresaService.update).toHaveBeenCalledWith(perfil.id, {
        logo: 'logo.jpg',
      });
    });
  });

  // ========== TESTS DE GET MIS CUPONES ==========
  describe('getMisCupones', () => {
    it('debe retornar cupones paginados de la empresa', async () => {
      empresaService.getCupones.mockResolvedValue(paginatedBeneficios);

      const resultado = await controller.getMisCupones(
        requestConUsuario,
        1,
        10,
      );

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(empresaService.getCupones).toHaveBeenCalledWith(perfil.id, 1, 10);
    });
  });

  // ========== TESTS DE CREATE CUPON ==========
  describe('createCupon', () => {
    it('debe crear un cupón para la empresa', async () => {
      empresaService.createCupon.mockResolvedValue(beneficio);

      const resultado = await controller.createCupon(
        requestConUsuario,
        createBeneficioDto,
      );

      expect(resultado).toEqual(beneficio);
      expect(empresaService.createCupon).toHaveBeenCalledWith(
        perfil.id,
        createBeneficioDto,
      );
    });
  });

  // ========== TESTS DE UPDATE CUPON ==========
  describe('updateCupon', () => {
    it('debe actualizar un cupón', async () => {
      empresaService.updateCupon.mockResolvedValue(beneficio);

      const resultado = await controller.updateCupon(1, updateBeneficioDto);

      expect(resultado).toEqual(beneficio);
      expect(empresaService.updateCupon).toHaveBeenCalledWith(
        1,
        updateBeneficioDto,
      );
    });
  });

  // ========== TESTS DE UPDATE CREDENCIALES ==========
  describe('updateCredentials', () => {
    it('debe actualizar credenciales de la empresa', async () => {
      empresaService.updateCredenciales.mockResolvedValue(undefined);

      await controller.updateCredentials(
        requestConUsuario,
        updateCredencialesDto,
      );

      expect(empresaService.updateCredenciales).toHaveBeenCalledWith(
        cuenta.id,
        updateCredencialesDto,
      );
    });
  });

  // ========== TESTS DE DELETE ==========
  describe('delete', () => {
    it('debe deshabilitar una empresa', async () => {
      empresaService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(empresaService.delete).toHaveBeenCalledWith(1);
    });
  });

  // ========== TESTS DE RESTORE ==========
  describe('restore', () => {
    it('debe restaurar una empresa', async () => {
      empresaService.restore.mockResolvedValue(undefined);

      await controller.restore(1);

      expect(empresaService.restore).toHaveBeenCalledWith(1);
    });
  });
});
