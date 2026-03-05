import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';

import { UsuarioController } from '../../src/Modules/user/usuario.controller';
import { PerfilUsuarioService } from '../../src/Modules/user/usuario.service';

import { Cuenta, RolCuenta } from '../../src/Entities/cuenta.entity';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { ResponseUsuarioDto } from '../../src/Modules/user/dto/response_usuario.dto';
import { PaginatedUserDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByUser.dto';
import { UpdateUsuarioDto } from '../../src/Modules/user/dto/update_usuario.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: MockProxy<PerfilUsuarioService>;

  const mockCuenta = {
    id: 10,
    correo: 'test@mail.com',
    clave: 'hashed',
    role: RolCuenta.USUARIO,
    deshabilitado: false,
    verificada: true,
  } as Cuenta;

  const mockRequest = {
    user: {
      cuenta: mockCuenta,
      perfil: {
        id: 1,
      },
    },
  } as RequestConUsuario;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: PerfilUsuarioService,
          useValue: mock<PerfilUsuarioService>(),
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get(PerfilUsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMiPerfil', () => {
    it('getMiPerfil', async () => {
      service.findOne.mockResolvedValue({} as ResponseUsuarioDto);

      await controller.getMiPerfil(mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateMiPerfil', () => {
    it('updateMiPerfil', async () => {
      const dto = { nombre: 'Test' };

      service.updateUsuario.mockResolvedValue({} as ResponseUsuarioDto);

      await controller.updateMiPerfil(mockRequest, dto as UpdateUsuarioDto);

      expect(service.updateUsuario).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateMisCredenciales', () => {
    it('updateMisCredenciales', async () => {
      const dto = { correo: 'nuevo@mail.com', clave: '123456' };

      service.updateCredenciales.mockResolvedValue();

      await controller.updateMisCredenciales(
        mockRequest,
        dto as UpdateCredencialesDto,
      );

      expect(service.updateCredenciales).toHaveBeenCalledWith(10, dto);
    });
  });

  describe('getMisPuntos', () => {
    it('getMisPuntos', async () => {
      service.getPoints.mockResolvedValue({ id: 1, puntos: 100 });

      const result = await controller.getMisPuntos(mockRequest);

      expect(service.getPoints).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, puntos: 100 });
    });
  });

  describe('getMisDonaciones', () => {
    it('getMisDonaciones', async () => {
      service.getDonaciones.mockResolvedValue(
        {} as PaginatedUserDonationsResponseDto,
      );

      await controller.getMisDonaciones(mockRequest, 2, 5);

      expect(service.getDonaciones).toHaveBeenCalledWith(1, 2, 5);
    });
  });

  describe('donar', () => {
    it('donar', async () => {
      const dto = {
        detalle: 'Donación test',
        cantidad: 1,
        campaignId: 3,
        puntos: 5,
      };

      service.donar.mockResolvedValue({} as ResponseDonationDto);

      await controller.donar(mockRequest, dto as CreateDonationDto);

      expect(service.donar).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('getMisCuponesCanjeados', () => {
    it('getMisCuponesCanjeados', async () => {
      service.getMisCuponesCanjeados.mockResolvedValue(
        [] as UsuarioBeneficio[],
      );

      await controller.getMisCuponesCanjeados(mockRequest);

      expect(service.getMisCuponesCanjeados).toHaveBeenCalledWith(1);
    });
  });

  describe('usarCupon', () => {
    it('usarCupon', async () => {
      service.usarCupon.mockResolvedValue({} as UsuarioBeneficio);

      await controller.usarCupon(5);

      expect(service.usarCupon).toHaveBeenCalledWith(5);
    });
  });

  describe('canjearCupon', () => {
    it('canjearCupon', async () => {
      service.canjearCupon.mockResolvedValue({
        success: true,
        cantidadCanjeada: 1,
        puntosGastados: 10,
        puntosRestantes: 90,
        stockRestante: 4,
      });

      await controller.canjearCupon(mockRequest, 3, 2);

      expect(service.canjearCupon).toHaveBeenCalledWith(1, 3, 2);
    });
  });

  describe('findAll', () => {
    it('findAll', async () => {
      service.findPaginated.mockResolvedValue({
        items: [] as ResponseUsuarioDto[],
        total: 0,
      });

      await controller.findAll(1, 10, 'test');

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'test');
    });
  });

  describe('getDonacionesDeUsuario', () => {
    it('getDonacionesDeUsuario', async () => {
      service.getDonaciones.mockResolvedValue(
        {} as PaginatedUserDonationsResponseDto,
      );

      await controller.getDonacionesDeUsuario(7, 1, 10);

      expect(service.getDonaciones).toHaveBeenCalledWith(7, 1, 10);
    });
  });

  describe('deleteUsuario', () => {
    it('deleteUsuario', async () => {
      service.delete.mockResolvedValue();

      await controller.deleteUsuario(4);

      expect(service.delete).toHaveBeenCalledWith(4);
    });
  });

  describe('restoreUsuario', () => {
    it('restoreUsuario', async () => {
      service.restore.mockResolvedValue();

      await controller.restoreUsuario(4);

      expect(service.restore).toHaveBeenCalledWith(4);
    });
  });
});
