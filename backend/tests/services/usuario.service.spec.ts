import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like, UpdateResult } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../../src/Modules/user/usuario.service';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { UsuarioBeneficioService } from '../../src/Modules/user/usuario-beneficio/usuario-beneficio.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { Usuario } from '../../src/Entities/usuario.entity';
import { Contacto } from '../../src/Entities/contacto.entity';
import { Direccion } from '../../src/Entities/direccion.entity';
import { CreateUsuarioDto } from '../../src/Modules/user/dto/create_usuario.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { UpdateUsuarioDto } from '../../src/Modules/user/dto/update_usuario.dto';
import { Rol } from '../../src/Modules/user/enums/enums';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';
import { BeneficiosUsuarioEstado } from '../../src/Modules/benefit/dto/enum/enum';
import { Beneficios } from '../../src/Entities/beneficio.entity';

const mockContacto = Object.assign(new Contacto(), {
  id: 1,
  correo: 'test@test.com',
});

const mockDireccion = Object.assign(new Direccion(), {
  id: 1,
  calle: 'Av. Test',
  numero: '123',
});

const mockUsuario = Object.assign(new Usuario(), {
  id: 1,
  documento: '12345678',
  clave: 'hashed_password',
  nombre: 'Juan',
  apellido: 'Pérez',
  rol: Rol.USUARIO,
  puntos: 100,
  habilitado: true,
  verificado: true,
  contacto: mockContacto,
  direccion: mockDireccion,
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
  ultima_conexion: new Date(),
});

const mockDonationResponse: ResponseDonationDto = {
  id: 1,
  titulo: 'Donación Test',
  detalle: 'Detalle de donación',
  cantidad: 5,
  estado: DonacionEstado.PENDIENTE,
  puntos: 50,
  fecha_registro: new Date(),
  campaignId: 1,
  userId: 1,
  imagen: '',
};

const mockUsuarioBeneficio: UsuarioBeneficio = {
  id: 1,
  usuario: mockUsuario,
  beneficio: {} as Beneficios,
  cantidad: 2,
  usados: 0,
  estado: BeneficiosUsuarioEstado.ACTIVO,
  fecha_reclamo: new Date(),
  ultimo_cambio: new Date(),
};

const mockUpdateResult: UpdateResult = {
  affected: 1,
  raw: {},
  generatedMaps: [],
};

describe('UsuarioService', () => {
  let service: UsuarioService;
  let usuarioRepository: jest.Mocked<Repository<Usuario>>;
  let donacionService: jest.Mocked<DonacionService>;
  let beneficioService: jest.Mocked<BeneficioService>;
  let usuarioBeneficioService: jest.Mocked<UsuarioBeneficioService>;
  let hashService: jest.Mocked<HashService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsuarioRepo = mock<Repository<Usuario>>();
    const mockDonacionService = mock<DonacionService>();
    const mockBeneficioService = mock<BeneficioService>();
    const mockUsuarioBeneficioService = mock<UsuarioBeneficioService>();
    const mockHashService = mock<HashService>();
    const mockJwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepo },
        { provide: DonacionService, useValue: mockDonacionService },
        { provide: BeneficioService, useValue: mockBeneficioService },
        {
          provide: UsuarioBeneficioService,
          useValue: mockUsuarioBeneficioService,
        },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    usuarioRepository = module.get(getRepositoryToken(Usuario));
    donacionService = module.get(DonacionService);
    beneficioService = module.get(BeneficioService);
    usuarioBeneficioService = module.get(UsuarioBeneficioService);
    hashService = module.get(HashService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    const email = 'test@test.com';

    it('debe encontrar un usuario por email', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUsuario);
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        relations: [
          'contacto',
          'direccion',
          'empresaUsuario',
          'organizacionUsuario',
        ],
        where: { contacto: { correo: email } },
      });
    });

    it('debe retornar null cuando el email no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto: CreateUsuarioDto = {
      correo: 'test@test.com',
      clave: 'password123',
      documento: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: Rol.USUARIO,
    };

    beforeEach(() => {
      usuarioRepository.findOne.mockResolvedValue(null);
      usuarioRepository.create.mockReturnValue(mockUsuario);
      usuarioRepository.save.mockResolvedValue(mockUsuario);
    });

    it('debe crear un usuario exitosamente', async () => {
      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(usuarioRepository.create).toHaveBeenCalled();
      expect(usuarioRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el usuario ya existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);

      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe este Usuario',
      );
    });
  });

  describe('getDonaciones', () => {
    const usuarioId = 1;
    const mockResponse = { items: [], total: 0 };

    it('debe obtener las donaciones del usuario', async () => {
      donacionService.findAllPaginatedByUser.mockResolvedValue(mockResponse);

      const result = await service.getDonaciones(usuarioId, 1, 10);

      expect(result).toEqual(mockResponse);
      expect(donacionService.findAllPaginatedByUser).toHaveBeenCalledWith(
        usuarioId,
        1,
        10,
      );
    });
  });

  describe('donar', () => {
    const usuarioId = 1;
    const createDto = {
      campaignId: 1,
      cantidad: 5,
      detalle: 'Test',
      puntos: 50,
    };

    it('debe realizar una donación', async () => {
      donacionService.create.mockResolvedValue(mockDonationResponse);

      const result = await service.donar(usuarioId, createDto as any);

      expect(result).toEqual(mockDonationResponse);
      expect(donacionService.create).toHaveBeenCalledWith(usuarioId, createDto);
    });
  });

  describe('getMisCuponesCanjeados', () => {
    const usuarioId = 1;

    it('debe obtener los cupones canjeados', async () => {
      usuarioBeneficioService.getByUsuario.mockResolvedValue([
        mockUsuarioBeneficio,
      ]);

      const result = await service.getMisCuponesCanjeados(usuarioId);

      expect(result).toEqual([mockUsuarioBeneficio]);
      expect(usuarioBeneficioService.getByUsuario).toHaveBeenCalledWith(
        usuarioId,
      );
    });
  });

  describe('usarCupon', () => {
    const usuarioBeneficioId = 1;

    it('debe usar un cupón', async () => {
      usuarioBeneficioService.usarBeneficio.mockResolvedValue(
        mockUsuarioBeneficio,
      );

      const result = await service.usarCupon(usuarioBeneficioId);

      expect(result).toEqual(mockUsuarioBeneficio);
      expect(usuarioBeneficioService.usarBeneficio).toHaveBeenCalledWith(
        usuarioBeneficioId,
      );
    });
  });

  describe('canjearCupon', () => {
    const usuarioId = 1;
    const cuponId = 1;
    const cantidad = 2;
    const mockResponse = {
      success: true,
      cantidadCanjeada: 2,
      puntosGastados: 100,
      puntosRestantes: 900,
      stockRestante: 98,
    };

    it('debe canjear un cupón', async () => {
      beneficioService.canjear.mockResolvedValue(mockResponse);

      const result = await service.canjearCupon(usuarioId, cuponId, cantidad);

      expect(result).toEqual(mockResponse);
      expect(beneficioService.canjear).toHaveBeenCalledWith(
        cuponId,
        usuarioId,
        cantidad,
      );
    });
  });

  describe('updateCredenciales', () => {
    const usuarioId = 1;
    const dto: UpdateCredencialesDto = {
      correo: 'nuevo@test.com',
      passwordActual: 'oldPass123',
      passwordNueva: 'newPass123',
    };

    beforeEach(() => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('new_hashed_password');
      usuarioRepository.save.mockResolvedValue({
        ...mockUsuario,
        contacto: { ...mockContacto, correo: 'nuevo@test.com' },
      });
      jwtService.sign.mockReturnValue('new-jwt-token');
    });

    it('debe actualizar email y contraseña exitosamente', async () => {
      const result = await service.updateCredenciales(usuarioId, dto);

      expect(result).toEqual({ token: 'new-jwt-token' });
      expect(hashService.compare).toHaveBeenCalledWith(
        'oldPass123',
        'hashed_password',
      );
      expect(hashService.hash).toHaveBeenCalledWith('newPass123');
    });

    it('debe actualizar solo el email cuando no se proporciona nueva contraseña', async () => {
      const dtoSinPass: UpdateCredencialesDto = { correo: 'nuevo@test.com' };

      const result = await service.updateCredenciales(usuarioId, dtoSinPass);

      expect(result).toEqual({ token: 'new-jwt-token' });
      expect(hashService.compare).not.toHaveBeenCalled();
      expect(hashService.hash).not.toHaveBeenCalled();
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.updateCredenciales(usuarioId, dto)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('debe lanzar error cuando la contraseña actual es incorrecta', async () => {
      hashService.compare.mockResolvedValue(false);

      await expect(service.updateCredenciales(usuarioId, dto)).rejects.toThrow(
        'La contraseña actual es incorrecta',
      );
    });

    it('debe lanzar error cuando se proporciona nueva contraseña sin la actual', async () => {
      const dtoSinActual: UpdateCredencialesDto = {
        passwordNueva: 'newPass123',
      };

      await expect(
        service.updateCredenciales(usuarioId, dtoSinActual),
      ).rejects.toThrow('Debés ingresar la contraseña actual');
    });
  });

  describe('updateUsuario', () => {
    const usuarioId = 1;
    const updateDto: UpdateUsuarioDto = {
      nombre: 'Juan Carlos',
      apellido: 'Pérez García',
    };

    beforeEach(() => {
      const usuarioOriginal = Object.assign(new Usuario(), {
        ...mockUsuario,
        nombre: 'Juan',
        apellido: 'Pérez',
      });

      usuarioRepository.findOne.mockResolvedValue(usuarioOriginal);

      usuarioRepository.merge = jest.fn((entity, dto) => {
        Object.assign(entity, dto);
        return entity;
      });

      usuarioRepository.save.mockResolvedValue(usuarioOriginal as any);
    });

    it('debe actualizar los datos del usuario exitosamente', async () => {
      const result = await service.updateUsuario(usuarioId, updateDto);

      expect(result.nombre).toBe('Juan Carlos');
      expect(result.apellido).toBe('Pérez García');
      expect(usuarioRepository.merge).toHaveBeenCalled();
      expect(usuarioRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUsuario(usuarioId, updateDto)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('updatePuntos', () => {
    const usuarioId = 1;
    const updateDto = { puntos: 500 };

    beforeEach(() => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);
      usuarioRepository.save.mockResolvedValue({ ...mockUsuario, puntos: 500 });
    });

    it('debe actualizar los puntos del usuario', async () => {
      const result = await service.updatePuntos(usuarioId, updateDto);

      expect(result.puntos).toBe(500);
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePuntos(usuarioId, updateDto)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('actualizarUltimaConexion', () => {
    const usuarioId = 1;

    it('debe actualizar la última conexión', async () => {
      usuarioRepository.update.mockResolvedValue(mockUpdateResult);

      await service.actualizarUltimaConexion(usuarioId);

      expect(usuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        ultima_conexion: expect.any(Date),
      });
    });
  });

  describe('getPoints', () => {
    const usuarioId = 1;

    it('debe obtener los puntos del usuario', async () => {
      usuarioRepository.findOne.mockResolvedValue({
        id: 1,
        puntos: 100,
      } as Usuario);

      const result = await service.getPoints(usuarioId);

      expect(result).toEqual({ id: 1, puntos: 100 });
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.getPoints(usuarioId)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('findPaginated', () => {
    const mockResponse = { items: [mockUsuario], total: 1 };

    beforeEach(() => {
      usuarioRepository.findAndCount.mockResolvedValue([[mockUsuario], 1]);
    });

    it('debe obtener usuarios paginados sin búsqueda', async () => {
      const result = await service.findPaginated(1, 10, '');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe obtener usuarios paginados con búsqueda por nombre', async () => {
      await service.findPaginated(1, 10, 'Juan');

      expect(usuarioRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            { nombre: Like('%Juan%') },
            { apellido: Like('%Juan%') },
            { contacto: { correo: Like('%Juan%') } },
            { documento: Like('%Juan%') },
          ]),
        }),
      );
    });
  });

  describe('findOne', () => {
    const usuarioId = 1;

    it('debe obtener un usuario por ID', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);

      const result = await service.findOne(usuarioId);

      expect(result.id).toBe(1);
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(usuarioId)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('delete', () => {
    const usuarioId = 1;

    beforeEach(() => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);
      usuarioRepository.update.mockResolvedValue(mockUpdateResult);
    });

    it('debe deshabilitar un usuario', async () => {
      await service.delete(usuarioId);

      expect(usuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        habilitado: false,
      });
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(usuarioId)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('restore', () => {
    const usuarioId = 1;

    beforeEach(() => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);
      usuarioRepository.update.mockResolvedValue(mockUpdateResult);
    });

    it('debe restaurar un usuario', async () => {
      await service.restore(usuarioId);

      expect(usuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        habilitado: true,
      });
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(usuarioId)).rejects.toThrow(
        'Usuario con ID 1 no encontrado',
      );
    });
  });

  describe('findByResetToken', () => {
    const token = 'reset-token-123';

    it('debe encontrar usuario por token de reseteo', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);

      const result = await service.findByResetToken(token);

      expect(result).toEqual(mockUsuario);
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: expect.anything(),
        },
      });
    });
  });

  describe('setResetToken', () => {
    const usuarioId = 1;
    const token = 'reset-token-123';
    const expires = new Date();

    it('debe establecer el token de reseteo', async () => {
      usuarioRepository.update.mockResolvedValue(mockUpdateResult);

      await service.setResetToken(usuarioId, token, expires);

      expect(usuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      });
    });
  });

  describe('resetPassword', () => {
    const usuarioId = 1;
    const newHashedPassword = 'new_hashed_password';

    it('debe resetear la contraseña', async () => {
      usuarioRepository.update.mockResolvedValue(mockUpdateResult);

      await service.resetPassword(usuarioId, newHashedPassword);

      expect(usuarioRepository.update).toHaveBeenCalledWith(usuarioId, {
        clave: newHashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });
    });
  });
});
