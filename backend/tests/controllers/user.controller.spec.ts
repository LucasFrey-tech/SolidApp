import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from '../../src/Modules/user/usuario.controller';
import { UsuarioService } from '../../src/Modules/user/usuario.service';
import { mock } from 'jest-mock-extended';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { Rol } from '../../src/Modules/user/enums/enums';
import { UpdateUsuarioDto } from '../../src/Modules/user/dto/update_usuario.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { ResponseUsuarioDto } from '../../src/Modules/user/dto/response_usuario.dto';
import { PaginatedUserDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByUser.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';
import { UserDonationItemDto } from '../../src/Modules/donation/dto/usuario_donation_item.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { BeneficiosUsuarioEstado } from '../../src/Modules/benefit/dto/enum/enum';
import { Usuario } from '../../src/Entities/usuario.entity';
import { Beneficios } from '../../src/Entities/beneficio.entity';

const mockContactoDto = {
  id: 1,
  correo: 'juan@test.com',
  prefijo: '11',
  telefono: '12345678',
};

const mockUsuarioResponse: ResponseUsuarioDto = {
  id: 1,
  documento: '12345678',
  clave: 'hashed_password',
  nombre: 'Juan',
  apellido: 'Pérez',
  rol: Rol.USUARIO,
  puntos: 1000,
  contacto: mockContactoDto,
  habilitado: true,
  verificado: true,
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
  ultima_conexion: new Date(),
};

const mockDonationItem: UserDonationItemDto = {
  id: 1,
  detalle: 'Arroz y fideos',
  cantidad: 10,
  puntos: 100,
  estado: DonacionEstado.APROBADA,
  fecha_registro: new Date(),
  nombre_organizacion: 'Fundación Test',
  titulo_campaña: 'Campaña Solidaria',
  motivo_rechazo: '',
  organizacionId: 1,
};

const mockDonacionesResponse: PaginatedUserDonationsResponseDto = {
  items: [mockDonationItem],
  total: 1,
};

const mockDonacionResponse: ResponseDonationDto = {
  id: 1,
  titulo: 'Donación de alimentos',
  detalle: 'Arroz y fideos',
  tipo: 'ALIMENTO',
  cantidad: 10,
  estado: DonacionEstado.APROBADA,
  puntos: 100,
  campaignId: 1,
  userId: 1,
  fecha_registro: new Date(),
  imagen: 'imagen.jpg',
};

const mockUsuario: Usuario = {
  id: 1,
} as Usuario;

const mockBeneficio: Beneficios = {
  id: 1,
} as Beneficios;

const mockUsuarioBeneficio: UsuarioBeneficio = {
  id: 1,
  usuario: mockUsuario,
  beneficio: mockBeneficio,
  cantidad: 2,
  usados: 0,
  estado: BeneficiosUsuarioEstado.ACTIVO,
  fecha_reclamo: new Date(),
  ultimo_cambio: new Date(),
};

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let usuarioService: jest.Mocked<UsuarioService>;

  const mockReq = { user: { id: 1, rol: Rol.USUARIO } } as RequestConUsuario;

  beforeEach(async () => {
    const mockUsuarioService = mock<UsuarioService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    usuarioService = module.get(UsuarioService);
  });

  describe('getMiPerfil', () => {
    it('debe obtener el perfil del usuario autenticado', async () => {
      usuarioService.findOne.mockResolvedValue(mockUsuarioResponse);

      const result = await controller.getMiPerfil(mockReq);

      expect(result).toEqual(mockUsuarioResponse);
      expect(usuarioService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateMiPerfil', () => {
    const updateDto: UpdateUsuarioDto = {
      nombre: 'Juan Carlos',
      apellido: 'Pérez García',
    };

    it('debe actualizar los datos personales del usuario', async () => {
      const expectedResponse = {
        ...mockUsuarioResponse,
        nombre: 'Juan Carlos',
      };

      usuarioService.updateUsuario.mockResolvedValue(expectedResponse);

      const result = await controller.updateMiPerfil(mockReq, updateDto);

      expect(result).toEqual(expectedResponse);
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('updateMisCredenciales', () => {
    const credencialesDto: UpdateCredencialesDto = {
      correo: 'nuevo@test.com',
      passwordActual: 'OldPass123',
      passwordNueva: 'NuevaPass123',
    };

    it('debe actualizar email y/o contraseña del usuario', async () => {
      const expectedResponse = { token: 'nuevo-jwt-token' };

      usuarioService.updateCredenciales.mockResolvedValue(expectedResponse);

      const result = await controller.updateMisCredenciales(
        mockReq,
        credencialesDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(usuarioService.updateCredenciales).toHaveBeenCalledWith(
        1,
        credencialesDto,
      );
    });
  });

  describe('getMisPuntos', () => {
    it('debe obtener los puntos del usuario', async () => {
      const expectedResponse = { id: 1, puntos: 1000 };

      usuarioService.getPoints.mockResolvedValue(expectedResponse);

      const result = await controller.getMisPuntos(mockReq);

      expect(result).toEqual(expectedResponse);
      expect(usuarioService.getPoints).toHaveBeenCalledWith(1);
    });
  });

  describe('getMisDonaciones', () => {
    it('debe obtener las donaciones del usuario paginadas', async () => {
      usuarioService.getDonaciones.mockResolvedValue(mockDonacionesResponse);

      const result = await controller.getMisDonaciones(mockReq, 1, 10);

      expect(result).toEqual(mockDonacionesResponse);
      expect(usuarioService.getDonaciones).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('donar', () => {
    const donacionDto: CreateDonationDto = {
      detalle: 'Arroz y fideos',
      cantidad: 5,
      campaignId: 1,
      puntos: 50,
    };

    it('debe realizar una donación exitosamente', async () => {
      usuarioService.donar.mockResolvedValue(mockDonacionResponse);

      const result = await controller.donar(mockReq, donacionDto);

      expect(result).toEqual(mockDonacionResponse);
      expect(usuarioService.donar).toHaveBeenCalledWith(1, donacionDto);
    });
  });

  describe('getMisCuponesCanjeados', () => {
    it('debe obtener los cupones canjeados por el usuario', async () => {
      usuarioService.getMisCuponesCanjeados.mockResolvedValue([
        mockUsuarioBeneficio,
      ]);

      const result = await controller.getMisCuponesCanjeados(mockReq);

      expect(result).toEqual([mockUsuarioBeneficio]);
      expect(usuarioService.getMisCuponesCanjeados).toHaveBeenCalledWith(1);
    });
  });

  describe('usarCupon', () => {
    const cuponId = 1;

    it('debe marcar un cupón como usado', async () => {
      const expectedResponse = { ...mockUsuarioBeneficio, usados: 1 };

      usuarioService.usarCupon.mockResolvedValue(expectedResponse);

      const result = await controller.usarCupon(cuponId);

      expect(result).toEqual(expectedResponse);
      expect(usuarioService.usarCupon).toHaveBeenCalledWith(1);
    });
  });

  describe('canjearCupon', () => {
    const cuponId = 1;
    const cantidad = 2;

    it('debe canjear un cupón exitosamente', async () => {
      const expectedResponse = {
        success: true,
        cantidadCanjeada: 2,
        puntosGastados: 100,
        puntosRestantes: 900,
        stockRestante: 98,
      };

      usuarioService.canjearCupon.mockResolvedValue(expectedResponse);

      const result = await controller.canjearCupon(mockReq, cuponId, cantidad);

      expect(result).toEqual(expectedResponse);
      expect(usuarioService.canjearCupon).toHaveBeenCalledWith(
        1,
        cuponId,
        cantidad,
      );
    });
  });

  describe('findAll (Admin)', () => {
    const mockPaginatedResponse = {
      items: [mockUsuarioResponse],
      total: 1,
    };

    it('debe listar todos los usuarios paginados', async () => {
      usuarioService.findPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(1, 10, '');

      expect(result).toEqual(mockPaginatedResponse);
      expect(usuarioService.findPaginated).toHaveBeenCalledWith(1, 10, '');
    });
  });

  describe('getDonacionesDeUsuario (Admin)', () => {
    const userId = 2;

    it('debe obtener las donaciones de un usuario específico', async () => {
      usuarioService.getDonaciones.mockResolvedValue(mockDonacionesResponse);

      const result = await controller.getDonacionesDeUsuario(userId, 1, 10);

      expect(result).toEqual(mockDonacionesResponse);
      expect(usuarioService.getDonaciones).toHaveBeenCalledWith(userId, 1, 10);
    });
  });

  describe('deleteUsuario (Admin)', () => {
    it('debe deshabilitar un usuario exitosamente', async () => {
      usuarioService.delete.mockResolvedValue(undefined);

      await controller.deleteUsuario(1);

      expect(usuarioService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('restoreUsuario (Admin)', () => {
    it('debe restaurar un usuario deshabilitado exitosamente', async () => {
      usuarioService.restore.mockResolvedValue(undefined);

      await controller.restoreUsuario(1);

      expect(usuarioService.restore).toHaveBeenCalledWith(1);
    });
  });
});
