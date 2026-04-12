import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaController } from '../../src/Modules/empresa/empresa.controller';
import { EmpresaService } from '../../src/Modules/empresa/empresa.service';
import { mock } from 'jest-mock-extended';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { Rol } from '../../src/Modules/user/enums/enums';
import { UpdateEmpresaDTO } from '../../src/Modules/empresa/dto/update_empresa.dto';
import { CreateBeneficiosDTO } from '../../src/Modules/benefit/dto/create_beneficios.dto';
import { UpdateBeneficiosDTO } from '../../src/Modules/benefit/dto/update_beneficios.dto';
import { CreateEmpresaDTO } from '../../src/Modules/empresa/dto/create_empresa.dto';
import { EmpresaResponseDTO } from '../../src/Modules/empresa/dto/response_empresa.dto';
import { PaginatedBeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_paginated_beneficios';
import { BeneficiosResponseDTO } from '../../src/Modules/benefit/dto/response_beneficios.dto';

describe('EmpresaController', () => {
  let controller: EmpresaController;
  let empresaService: jest.Mocked<EmpresaService>;

  const mockReq = {
    user: { id: 1, rol: Rol.COLABORADOR },
  } as RequestConUsuario;

  const mockEmpresaResponse: EmpresaResponseDTO = {
    id: 1,
    cuit: '30-12345678-9',
    razon_social: 'Empresa Test S.A.',
    nombre_empresa: 'Test Empresa',
    descripcion: 'Descripción de la empresa',
    rubro: 'Tecnología',
    verificada: true,
    habilitada: true,
    fecha_registro: new Date(),
    ultimo_cambio: new Date(),
  };

  beforeEach(async () => {
    const mockEmpresaService = mock<EmpresaService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [
        {
          provide: EmpresaService,
          useValue: mockEmpresaService,
        },
      ],
    }).compile();

    controller = module.get<EmpresaController>(EmpresaController);
    empresaService = module.get(EmpresaService);
  });

  describe('findPaginated', () => {
    it('debe obtener empresas paginadas con valores por defecto', async () => {
      const expectedResponse = { items: [mockEmpresaResponse], total: 1 };

      empresaService.findPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findPaginated(1, 10, '', true);

      expect(result).toEqual(expectedResponse);
      expect(empresaService.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        true,
      );
      expect(empresaService.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('debe obtener empresas paginadas con parámetros personalizados', async () => {
      const expectedResponse = { items: [], total: 0 };

      empresaService.findPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findPaginated(2, 20, 'test', false);

      expect(result).toEqual(expectedResponse);
      expect(empresaService.findPaginated).toHaveBeenCalledWith(
        2,
        20,
        'test',
        false,
      );
    });

    it('debe manejar error del servicio', async () => {
      const error = new Error('Error al obtener empresas');

      empresaService.findPaginated.mockRejectedValue(error);

      await expect(controller.findPaginated(1, 10, '', true)).rejects.toThrow(
        'Error al obtener empresas',
      );
    });
  });

  describe('getDatosEmpresa', () => {
    it('debe obtener los datos de la empresa del usuario autenticado', async () => {
      empresaService.getEmpresaByUsuario.mockResolvedValue(mockEmpresaResponse);

      const result = await controller.getDatosEmpresa(mockReq);

      expect(result).toEqual(mockEmpresaResponse);
      expect(empresaService.getEmpresaByUsuario).toHaveBeenCalledWith(1);
      expect(empresaService.getEmpresaByUsuario).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando el usuario no tiene empresa asociada', async () => {
      const error = new Error('Usuario no asociado a ninguna empresa');

      empresaService.getEmpresaByUsuario.mockRejectedValue(error);

      await expect(controller.getDatosEmpresa(mockReq)).rejects.toThrow(
        'Usuario no asociado a ninguna empresa',
      );
    });
  });

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
      razon_social: 'Empresa Test S.A.',
      nombre_empresa: 'Test Empresa',
      calle: 'Av. Siempre Viva',
      numero: '742',
    };

    it('debe registrar una nueva empresa exitosamente', async () => {
      empresaService.registrarEmpresa.mockResolvedValue(mockEmpresaResponse);

      const result = await controller.registrarEmpresa(createDto);

      expect(result).toEqual(mockEmpresaResponse);
      expect(empresaService.registrarEmpresa).toHaveBeenCalledWith(createDto);
      expect(empresaService.registrarEmpresa).toHaveBeenCalledTimes(1);
    });

    it('debe registrar una empresa con token opcional', async () => {
      const createDtoWithToken = { ...createDto, token: 'a8sd7a98sd7as9d87' };

      empresaService.registrarEmpresa.mockResolvedValue(mockEmpresaResponse);

      const result = await controller.registrarEmpresa(createDtoWithToken);

      expect(result).toEqual(mockEmpresaResponse);
      expect(empresaService.registrarEmpresa).toHaveBeenCalledWith(
        createDtoWithToken,
      );
    });

    it('debe manejar error cuando el CUIT ya está registrado', async () => {
      const error = new Error('CUIT ya registrado');

      empresaService.registrarEmpresa.mockRejectedValue(error);

      await expect(controller.registrarEmpresa(createDto)).rejects.toThrow(
        'CUIT ya registrado',
      );
    });

    it('debe manejar error cuando el correo ya está registrado', async () => {
      const error = new Error('El correo electrónico ya está registrado');

      empresaService.registrarEmpresa.mockRejectedValue(error);

      await expect(controller.registrarEmpresa(createDto)).rejects.toThrow(
        'El correo electrónico ya está registrado',
      );
    });
  });

  describe('updateMiPerfil', () => {
    const updateDto: UpdateEmpresaDTO = {
      descripcion: 'Nueva descripción',
      rubro: 'Nuevo rubro',
      web: 'https://nueva-web.com',
    };

    it('debe actualizar el perfil de la empresa exitosamente', async () => {
      const expectedResponse = {
        ...mockEmpresaResponse,
        descripcion: 'Nueva descripción',
      };
      const dataString = JSON.stringify(updateDto);

      empresaService.update.mockResolvedValue(expectedResponse);

      const result = await controller.updateMiPerfil(
        mockReq,
        undefined,
        dataString,
      );

      expect(result).toEqual(expectedResponse);
      expect(empresaService.update).toHaveBeenCalledWith(1, updateDto);
      expect(empresaService.update).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar con archivo de logo', async () => {
      const mockFile = { filename: 'nuevo-logo.png' } as Express.Multer.File;
      const expectedResponse = {
        ...mockEmpresaResponse,
        logo: 'nuevo-logo.png',
      };

      empresaService.update.mockResolvedValue(expectedResponse);

      const result = await controller.updateMiPerfil(
        mockReq,
        mockFile,
        undefined,
      );

      expect(result).toEqual(expectedResponse);
      expect(empresaService.update).toHaveBeenCalledWith(1, {
        logo: 'nuevo-logo.png',
      });
    });

    it('debe actualizar con logo y datos simultáneamente', async () => {
      const mockFile = { filename: 'nuevo-logo.png' } as Express.Multer.File;
      const dataString = JSON.stringify(updateDto);
      const expectedResponse = {
        ...mockEmpresaResponse,
        logo: 'nuevo-logo.png',
        descripcion: 'Nueva descripción',
      };

      empresaService.update.mockResolvedValue(expectedResponse);

      const result = await controller.updateMiPerfil(
        mockReq,
        mockFile,
        dataString,
      );

      expect(result).toEqual(expectedResponse);
      expect(empresaService.update).toHaveBeenCalledWith(1, {
        ...updateDto,
        logo: 'nuevo-logo.png',
      });
    });

    it('debe manejar error cuando la empresa no existe', async () => {
      const error = new Error('Empresa no encontrada');

      empresaService.update.mockRejectedValue(error);

      await expect(
        controller.updateMiPerfil(
          mockReq,
          undefined,
          JSON.stringify(updateDto),
        ),
      ).rejects.toThrow('Empresa no encontrada');
    });
  });

  describe('getMisCupones', () => {
    const mockCuponesResponse: PaginatedBeneficiosResponseDTO = {
      items: [],
      total: 0,
    };

    it('debe obtener los cupones de la empresa paginados', async () => {
      empresaService.getCupones.mockResolvedValue(mockCuponesResponse);

      const result = await controller.getMisCupones(mockReq, 1, 10);

      expect(result).toEqual(mockCuponesResponse);
      expect(empresaService.getCupones).toHaveBeenCalledWith(1, 1, 10);
    });

    it('debe usar valores por defecto para page y limit', async () => {
      empresaService.getCupones.mockResolvedValue(mockCuponesResponse);

      await controller.getMisCupones(mockReq, 1, 10);

      expect(empresaService.getCupones).toHaveBeenCalledWith(1, 1, 10);
    });

    it('debe manejar error cuando la empresa no tiene cupones', async () => {
      const error = new Error('Cupones no encontrados');

      empresaService.getCupones.mockRejectedValue(error);

      await expect(controller.getMisCupones(mockReq, 1, 10)).rejects.toThrow(
        'Cupones no encontrados',
      );
    });
  });

  describe('createCupon', () => {
    const createDto: CreateBeneficiosDTO = {
      titulo: 'Descuento 20%',
      cantidad: 100,
      valor: 50,
    } as CreateBeneficiosDTO;

    const mockBeneficioResponse: BeneficiosResponseDTO = {
      id: 1,
      titulo: 'Descuento 20%',
      tipo: 'Descuento',
      detalle: '20% de descuento',
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
        logo: null,
      },
      estado: 'APROBADO',
    };

    it('debe crear un cupón exitosamente', async () => {
      empresaService.createCupon.mockResolvedValue(mockBeneficioResponse);

      const result = await controller.createCupon(mockReq, createDto);

      expect(result).toEqual(mockBeneficioResponse);
      expect(empresaService.createCupon).toHaveBeenCalledWith(1, createDto);
    });

    it('debe manejar error cuando la empresa no existe', async () => {
      const error = new Error('Empresa no encontrada');

      empresaService.createCupon.mockRejectedValue(error);

      await expect(controller.createCupon(mockReq, createDto)).rejects.toThrow(
        'Empresa no encontrada',
      );
    });
  });

  describe('updateCupon', () => {
    const cuponId = 1;
    const updateDto: UpdateBeneficiosDTO = {
      titulo: 'Nuevo título',
    } as UpdateBeneficiosDTO;

    const mockBeneficioResponse: BeneficiosResponseDTO = {
      id: 1,
      titulo: 'Nuevo título',
      tipo: 'Descuento',
      detalle: '20% de descuento',
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
        logo: null,
      },
      estado: 'APROBADO',
    };

    it('debe actualizar un cupón exitosamente', async () => {
      empresaService.updateCupon.mockResolvedValue(mockBeneficioResponse);

      const result = await controller.updateCupon(cuponId, updateDto, mockReq);

      expect(result).toEqual(mockBeneficioResponse);
      expect(empresaService.updateCupon).toHaveBeenCalledWith(1, updateDto, 1);
    });

    it('debe manejar error cuando el cupón no existe', async () => {
      const error = new Error('Cupón no encontrado');

      empresaService.updateCupon.mockRejectedValue(error);

      await expect(
        controller.updateCupon(999, updateDto, mockReq),
      ).rejects.toThrow('Cupón no encontrado');
    });

    it('debe manejar error cuando el usuario no tiene permisos', async () => {
      const error = new Error('No tiene permisos para modificar este cupón');

      empresaService.updateCupon.mockRejectedValue(error);

      await expect(
        controller.updateCupon(cuponId, updateDto, mockReq),
      ).rejects.toThrow('No tiene permisos para modificar este cupón');
    });
  });

  describe('delete', () => {
    it('debe deshabilitar una empresa exitosamente', async () => {
      empresaService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(empresaService.delete).toHaveBeenCalledWith(1);
    });

    it('debe manejar error cuando la empresa no existe', async () => {
      const error = new Error('Empresa no encontrada');

      empresaService.delete.mockRejectedValue(error);

      await expect(controller.delete(999)).rejects.toThrow(
        'Empresa no encontrada',
      );
    });
  });

  describe('restore', () => {
    it('debe restaurar una empresa exitosamente', async () => {
      empresaService.restore.mockResolvedValue(undefined);

      await controller.restore(1);

      expect(empresaService.restore).toHaveBeenCalledWith(1);
    });

    it('debe manejar error cuando la empresa no existe', async () => {
      const error = new Error('Empresa no encontrada');

      empresaService.restore.mockRejectedValue(error);

      await expect(controller.restore(999)).rejects.toThrow(
        'Empresa no encontrada',
      );
    });

    it('debe manejar error cuando la empresa ya está activa', async () => {
      const error = new Error('La empresa ya está activa');

      empresaService.restore.mockRejectedValue(error);

      await expect(controller.restore(1)).rejects.toThrow(
        'La empresa ya está activa',
      );
    });
  });
});
