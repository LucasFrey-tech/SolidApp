import { Test, TestingModule } from '@nestjs/testing';
import { InvitacionesController } from '../../src/Modules/invitaciones/invitacion.controller';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { mock } from 'jest-mock-extended';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { Rol, RolSecundario } from '../../src/Modules/user/enums/enums';
import { CreateInvitacionDto } from '../../src/Modules/invitaciones/dto/crear_invitacion.dto';
import { Invitacion } from '../../src/Entities/invitacion.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { Empresa } from '../../src/Entities/empresa.entity';

describe('InvitacionesController', () => {
  let controller: InvitacionesController;
  let invitacionesService: jest.Mocked<InvitacionesService>;

  const mockReq = {
    user: { id: 1, rol: Rol.COLABORADOR },
  } as RequestConUsuario;
  const mockReqAdmin = { user: { id: 1, rol: Rol.ADMIN } } as RequestConUsuario;

  const mockUsuario = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
  } as Usuario;

  const mockInvitacion = {
    id: 1,
    token: 'f9a3c5d7e8b1',
    correo: 'test@test.com',
    empresa: { id: 1 } as Empresa,
    organizacion: undefined,
    invitadorID: 1,
    invitador: mockUsuario,
    rol: RolSecundario.GESTOR,
    expirada: false,
    fecha_creacion: new Date(),
    fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    estado: 'pendiente',
  } as Invitacion;

  beforeEach(async () => {
    const mockInvitacionesService = mock<InvitacionesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitacionesController],
      providers: [
        {
          provide: InvitacionesService,
          useValue: mockInvitacionesService,
        },
      ],
    }).compile();

    controller = module.get<InvitacionesController>(InvitacionesController);
    invitacionesService = module.get(InvitacionesService);
  });

  describe('crearInvitacionesEmpresa', () => {
    const empresaId = 1;
    const dto: CreateInvitacionDto = {
      correos: ['invitado1@test.com', 'invitado2@test.com'],
    };

    const mockResponse = {
      invitaciones: [mockInvitacion],
      correosExistentes: [],
      correosYaInvitados: [],
    };

    it('debe crear invitaciones para una empresa exitosamente', async () => {
      invitacionesService.crearInvitacionesEmpresa.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.crearInvitacionesEmpresa(
        empresaId,
        dto,
        mockReq,
      );

      expect(result).toEqual(mockResponse);
      expect(invitacionesService.crearInvitacionesEmpresa).toHaveBeenCalledWith(
        dto.correos,
        empresaId,
        1,
      );
      expect(
        invitacionesService.crearInvitacionesEmpresa,
      ).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando algunos correos ya están registrados', async () => {
      const mockResponseConErrores = {
        invitaciones: [],
        correosExistentes: ['existente@test.com'],
        correosYaInvitados: [],
      };

      invitacionesService.crearInvitacionesEmpresa.mockResolvedValue(
        mockResponseConErrores,
      );

      const result = await controller.crearInvitacionesEmpresa(
        empresaId,
        dto,
        mockReq,
      );

      expect(result.correosExistentes).toContain('existente@test.com');
      expect(invitacionesService.crearInvitacionesEmpresa).toHaveBeenCalledWith(
        dto.correos,
        empresaId,
        1,
      );
    });
  });

  describe('getInvitacionesEmpresa', () => {
    const empresaId = 1;
    const mockResponse = {
      items: [mockInvitacion],
      total: 1,
    };

    it('debe obtener las invitaciones de una empresa paginadas', async () => {
      invitacionesService.listarInvitacionesEmpresa.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getInvitacionesEmpresa(empresaId, 1, 10);

      expect(result).toEqual(mockResponse);
      expect(
        invitacionesService.listarInvitacionesEmpresa,
      ).toHaveBeenCalledWith(empresaId, 1, 10);
      expect(
        invitacionesService.listarInvitacionesEmpresa,
      ).toHaveBeenCalledTimes(1);
    });

    it('debe usar valores por defecto para page y limit', async () => {
      invitacionesService.listarInvitacionesEmpresa.mockResolvedValue({
        items: [],
        total: 0,
      });

      await controller.getInvitacionesEmpresa(empresaId, 1, 10);

      expect(
        invitacionesService.listarInvitacionesEmpresa,
      ).toHaveBeenCalledWith(empresaId, 1, 10);
    });

    it('debe manejar error cuando la empresa no tiene invitaciones', async () => {
      const error = new Error('No se encontraron invitaciones');

      invitacionesService.listarInvitacionesEmpresa.mockRejectedValue(error);

      await expect(
        controller.getInvitacionesEmpresa(empresaId, 1, 10),
      ).rejects.toThrow('No se encontraron invitaciones');
    });
  });

  describe('crearInvitacionesOrganizacion', () => {
    const organizacionId = 1;
    const dto: CreateInvitacionDto = {
      correos: ['invitado1@test.com', 'invitado2@test.com'],
    };

    const mockResponse = {
      invitaciones: [mockInvitacion],
      correosExistentes: [],
      correosYaInvitados: [],
    };

    it('debe crear invitaciones para una organización exitosamente', async () => {
      invitacionesService.crearInvitacionesOrganizacion.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.crearInvitacionesOrganizacion(
        organizacionId,
        dto,
        mockReq,
      );

      expect(result).toEqual(mockResponse);
      expect(
        invitacionesService.crearInvitacionesOrganizacion,
      ).toHaveBeenCalledWith(dto.correos, organizacionId, 1);
    });
  });

  describe('invitarEntidad', () => {
    const dto: CreateInvitacionDto = {
      correos: ['entidad@test.com'],
    };

    const mockResponse = {
      invitaciones: [mockInvitacion],
      correosExistentes: [],
    };

    it('debe invitar a una entidad como admin', async () => {
      invitacionesService.invitarEntidad.mockResolvedValue(mockResponse);

      const result = await controller.invitarEntidad(dto, mockReqAdmin);

      expect(result).toEqual(mockResponse);
      expect(invitacionesService.invitarEntidad).toHaveBeenCalledWith(
        dto.correos,
        1,
      );
    });

    it('debe manejar error cuando el correo ya existe', async () => {
      const mockResponseConError = {
        invitaciones: [],
        correosExistentes: ['entidad@test.com'],
      };

      invitacionesService.invitarEntidad.mockResolvedValue(
        mockResponseConError,
      );

      const result = await controller.invitarEntidad(dto, mockReqAdmin);

      expect(result.correosExistentes).toContain('entidad@test.com');
    });
  });

  describe('getInvitacionesEntidad', () => {
    const mockResponse = {
      items: [mockInvitacion],
      total: 1,
    };

    it('debe obtener las invitaciones de entidad paginadas', async () => {
      invitacionesService.listarInvitacionesEntidad.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getInvitacionesEntidad(1, 10);

      expect(result).toEqual(mockResponse);
      expect(
        invitacionesService.listarInvitacionesEntidad,
      ).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getInvitacionesOrganizacion', () => {
    const organizacionId = 1;
    const mockResponse = {
      items: [mockInvitacion],
      total: 1,
    };

    it('debe obtener las invitaciones de una organización paginadas', async () => {
      invitacionesService.listarInvitacionesOrganizacion.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getInvitacionesOrganizacion(
        organizacionId,
        1,
        10,
      );

      expect(result).toEqual(mockResponse);
      expect(
        invitacionesService.listarInvitacionesOrganizacion,
      ).toHaveBeenCalledWith(organizacionId, 1, 10);
    });
  });

  describe('validarToken', () => {
    const token = 'f9a3c5d7e8b1';
    const mockValidacion = {
      valido: true,
      correo: 'test@test.com',
      empresaId: 1,
      organizacionId: undefined,
      rol: RolSecundario.GESTOR,
    };

    it('debe validar un token exitosamente', async () => {
      invitacionesService.validarToken.mockResolvedValue({
        correo: 'test@test.com',
        empresaId: 1,
        organizacionId: undefined,
        rol: RolSecundario.GESTOR,
      });

      const result = await controller.validarToken(token);

      expect(result).toEqual(mockValidacion);
      expect(invitacionesService.validarToken).toHaveBeenCalledWith(token);
      expect(invitacionesService.validarToken).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando el token es inválido', async () => {
      const error = new Error('Token inválido o expirado');

      invitacionesService.validarToken.mockRejectedValue(error);

      await expect(controller.validarToken('token-invalido')).rejects.toThrow(
        'Token inválido o expirado',
      );
    });

    it('debe manejar error cuando el token ha expirado', async () => {
      const error = new Error('La invitación ha expirado');

      invitacionesService.validarToken.mockRejectedValue(error);

      await expect(controller.validarToken(token)).rejects.toThrow(
        'La invitación ha expirado',
      );
    });
  });
});
