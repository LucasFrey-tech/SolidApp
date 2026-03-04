import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CuentaService } from '../../src/Modules/cuenta/cuenta.service';
import { Cuenta, RolCuenta } from '../../src/Entities/cuenta.entity';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { UpdateUsuarioDto } from '../../src/Modules/user/dto/update_usuario.dto';
import { HashService } from '../../src/common/bcryptService/hashService';

describe('CuentaService', () => {
  let service: CuentaService;
  let mockCuentaRepository: {
    findOne: jest.Mock<Promise<Cuenta | null>, [object]>;
    create: jest.Mock<Cuenta, [Partial<Cuenta>]>;
    save: jest.Mock<Promise<Cuenta>, [Cuenta]>;
    update: jest.Mock<Promise<{ affected?: number }>, [number, object]>;
  };
  let mockHashService: {
    hash: jest.Mock<Promise<string>, [string]>;
    compare: jest.Mock<Promise<boolean>, [string, string]>;
  };

  let cuenta: Cuenta;
  let updateCredencialesDto: UpdateCredencialesDto;
  let updateUsuarioDto: UpdateUsuarioDto;

  beforeEach(async () => {
    mockCuentaRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentaService,
        {
          provide: getRepositoryToken(Cuenta),
          useValue: mockCuentaRepository,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
      ],
    }).compile();

    service = module.get<CuentaService>(CuentaService);

    // ========== Cuenta ==========
    cuenta = {
      id: 1,
      correo: 'usuario@example.com',
      clave: 'hashedPassword123',
      role: RolCuenta.USUARIO,
      deshabilitado: false,
      fecha_registro: new Date(),
      ultima_conexion: new Date(),
    } as unknown as Cuenta;

    // ========== DTOs ==========
    updateCredencialesDto = {
      passwordActual: 'currentPassword',
      passwordNueva: 'newPassword',
      correo: 'newemail@example.com',
    };

    updateUsuarioDto = {
      calle: 'Av. Libertador',
      numero: '742',
      codigo_postal: 'B1638',
      ciudad: 'Villa Ballester',
      provincia: 'Buenos Aires',
      prefijo: '+54',
      telefono: '11-4444-5555',
      departamento: '2B',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND BY EMAIL ROL ==========
  describe('findByEmailRol', () => {
    it('debe retornar una cuenta con email y rol específicos', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);

      const resultado = await service.findByEmailRol(
        'usuario@example.com',
        RolCuenta.USUARIO,
      );

      expect(resultado).toEqual(cuenta);
      expect(mockCuentaRepository.findOne).toHaveBeenCalledWith({
        where: { correo: 'usuario@example.com', role: RolCuenta.USUARIO },
      });
    });

    it('debe retornar null si no encuentra la cuenta', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(null);

      const resultado = await service.findByEmailRol(
        'nonexistent@example.com',
        RolCuenta.USUARIO,
      );

      expect(resultado).toBeNull();
    });
  });

  // ========== TESTS DE FIND BY EMAIL ==========
  describe('findByEmail', () => {
    it('debe retornar una cuenta por email', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);

      const resultado = await service.findByEmail('usuario@example.com');

      expect(resultado).toEqual(cuenta);
      expect(mockCuentaRepository.findOne).toHaveBeenCalledWith({
        where: { correo: 'usuario@example.com' },
      });
    });

    it('debe retornar null si no encuentra la cuenta', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(null);

      const resultado = await service.findByEmail('nonexistent@example.com');

      expect(resultado).toBeNull();
    });
  });

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    it('debe crear una cuenta correctamente', async () => {
      mockCuentaRepository.create.mockReturnValue(cuenta);
      mockCuentaRepository.save.mockResolvedValue(cuenta);

      const resultado = await service.create({
        correo: 'usuario@example.com',
        clave: 'hashedPassword123',
        role: RolCuenta.USUARIO,
      });

      expect(resultado).toEqual(cuenta);
      expect(mockCuentaRepository.save).toHaveBeenCalled();
    });
  });

  // ========== TESTS DE ACTUALIZAR ULTIMA CONEXION ==========
  describe('actualizarUltimaConexion', () => {
    it('debe actualizar la última conexión', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      await service.actualizarUltimaConexion(1);

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(1, {
        ultima_conexion: expect.any(Date),
      });
    });
  });

  // ========== TESTS DE UPDATE USUARIO ==========
  describe('updateUsuario', () => {
    it('debe actualizar datos del usuario', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateUsuario(1, updateUsuarioDto);

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(
        1,
        updateUsuarioDto,
      );
    });
  });

  // ========== TESTS DE UPDATE CREDENCIALES ==========
  describe('updateCredenciales', () => {
    it('debe actualizar password y email correctamente', async () => {
      const cuentaMock = {
        ...cuenta,
        clave: 'hashedPassword123',
      };

      mockCuentaRepository.findOne.mockResolvedValue(cuentaMock);
      mockHashService.compare.mockResolvedValue(true);
      mockHashService.hash.mockResolvedValue('newHashedPassword');
      mockCuentaRepository.save.mockResolvedValue(cuentaMock);

      await service.updateCredenciales(1, updateCredencialesDto);

      expect(mockHashService.compare).toHaveBeenCalledWith(
        'currentPassword',
        'hashedPassword123',
      );
      expect(mockHashService.hash).toHaveBeenCalledWith('newPassword');
      expect(mockCuentaRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCredenciales(999, updateCredencialesDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si no proporciona password actual', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);

      const dtoSinPasswordActual = {
        ...updateCredencialesDto,
        passwordActual: undefined,
      };

      await expect(
        service.updateCredenciales(1, dtoSinPasswordActual),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar UnauthorizedException si el password actual es incorrecto', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);
      mockHashService.compare.mockResolvedValue(false);

      await expect(
        service.updateCredenciales(1, updateCredencialesDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe actualizar solo email si no proporciona nueva password', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);
      mockCuentaRepository.save.mockResolvedValue(cuenta);

      const dtoSoloEmail = { correo: 'newemail@example.com' };

      await service.updateCredenciales(1, dtoSoloEmail);

      expect(mockHashService.compare).not.toHaveBeenCalled();
      expect(mockCuentaRepository.save).toHaveBeenCalled();
    });
  });

  // ========== TESTS DE FIND BY ID ==========
  describe('findById', () => {
    it('debe retornar una cuenta por ID', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);

      const resultado = await service.findById(1);

      expect(resultado).toEqual(cuenta);
      expect(mockCuentaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debe retornar null si no encuentra la cuenta', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(null);

      const resultado = await service.findById(999);

      expect(resultado).toBeNull();
    });
  });

  // ========== TESTS DE DESHABILITAR ==========
  describe('deshabilitar', () => {
    it('debe deshabilitar una cuenta', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      await service.deshabilitar(1);

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(1, {
        deshabilitado: true,
      });
    });
  });

  // ========== TESTS DE HABILITAR ==========
  describe('habilitar', () => {
    it('debe habilitar una cuenta', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      await service.habilitar(1);

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(1, {
        deshabilitado: false,
      });
    });
  });

  // ========== TESTS DE FIND BY RESET TOKEN ==========
  describe('findByResetToken', () => {
    it('debe retornar una cuenta por reset token válido', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(cuenta);

      const resultado = await service.findByResetToken('validToken123');

      expect(resultado).toEqual(cuenta);
      expect(mockCuentaRepository.findOne).toHaveBeenCalled();
    });

    it('debe retornar null si el token no existe o expiró', async () => {
      mockCuentaRepository.findOne.mockResolvedValue(null);

      const resultado = await service.findByResetToken('expiredToken');

      expect(resultado).toBeNull();
    });
  });

  // ========== TESTS DE SET RESET TOKEN ==========
  describe('setResetToken', () => {
    it('debe establecer el reset token', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      const expiresDate = new Date(Date.now() + 3600000);
      await service.setResetToken(1, 'newToken123', expiresDate);

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(1, {
        resetPasswordToken: 'newToken123',
        resetPasswordExpires: expiresDate,
      });
    });
  });

  // ========== TESTS DE CLEAR RESET TOKEN ==========
  describe('clearResetToken', () => {
    it('debe limpiar el reset token', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      await service.clearResetToken(1);

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(1, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });
  });

  // ========== TESTS DE RESET PASSWORD ==========
  describe('resetPassword', () => {
    it('debe resetear la password y limpiar el token', async () => {
      mockCuentaRepository.update.mockResolvedValue({ affected: 1 });

      await service.resetPassword(1, 'newHashedPassword');

      expect(mockCuentaRepository.update).toHaveBeenCalledWith(1, {
        clave: 'newHashedPassword',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });
  });
});
