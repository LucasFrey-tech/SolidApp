import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../../src/common/bcryptService/hashService';

import { Usuario } from '../../src/Entities/usuario.entity';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';

import { UsuarioService } from '../../src/Modules/user/usuario.service';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { UsuarioBeneficioService } from '../../src/Modules/user/usuario-beneficio/usuario-beneficio.service';

import { CreateUsuarioDto } from '../../src/Modules/user/dto/create_usuario.dto';
import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { UpdateUsuarioDto } from '../../src/Modules/user/dto/update_usuario.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { ResponseUsuarioDto } from '../../src/Modules/user/dto/response_usuario.dto';
import { PaginatedUserDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByUser.dto';

import { Rol } from '../../src/Modules/user/enums/enums';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: MockProxy<Repository<Usuario>>;
  let donacionService: MockProxy<DonacionService>;
  let beneficioService: MockProxy<BeneficioService>;
  let usuarioBeneficioService: MockProxy<UsuarioBeneficioService>;
  let hashService: MockProxy<HashService>;
  let jwtService: MockProxy<JwtService>;

  const USUARIO_ID = 1;

  beforeEach(async () => {
    repository = mock<Repository<Usuario>>();
    donacionService = mock<DonacionService>();
    beneficioService = mock<BeneficioService>();
    usuarioBeneficioService = mock<UsuarioBeneficioService>();
    hashService = mock<HashService>();
    jwtService = mock<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: repository,
        },
        { provide: DonacionService, useValue: donacionService },
        { provide: BeneficioService, useValue: beneficioService },
        { provide: UsuarioBeneficioService, useValue: usuarioBeneficioService },
        { provide: HashService, useValue: hashService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => jest.clearAllMocks());

  // ========== Helper ==========
  const buildUsuario = (overrides: Partial<Usuario> = {}): Usuario =>
    ({
      id: USUARIO_ID,
      documento: '12345678',
      nombre: 'Juan',
      apellido: 'Perez',
      clave: 'hashed-password',
      puntos: 10,
      rol: Rol.USUARIO,
      habilitado: true,
      verificado: false,
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      ultima_conexion: new Date(),
      contacto: {
        id: 1,
        correo: 'juan@mail.com',
        prefijo: '+54',
        telefono: '1123456789',
      },
      direccion: {
        id: 1,
        calle: 'Av. Siempreviva',
        numero: '742',
      },
      ...overrides,
    }) as unknown as Usuario;

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    const createDto: CreateUsuarioDto = {
      correo: 'juan@mail.com',
      clave: 'Password123',
      nombre: 'Juan',
      apellido: 'Perez',
      documento: '12345678',
      rol: Rol.USUARIO,
    };

    it('debe crear un usuario correctamente', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(buildUsuario());
      repository.save.mockResolvedValue(buildUsuario());

      const result = await service.create(createDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.id).toBe(USUARIO_ID);
    });

    it('debe separar correo del resto del DTO al crear', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(buildUsuario());
      repository.save.mockResolvedValue(buildUsuario());

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contacto: { correo: createDto.correo },
          puntos: 0,
        }),
      );
    });

    it('debe lanzar ConflictException si ya existe un usuario con ese documento', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE FIND BY EMAIL ==========
  describe('findByEmail', () => {
    it('debe retornar usuario si existe', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());

      const result = await service.findByEmail('juan@mail.com');

      expect(result).not.toBeNull();
      expect(result!.id).toBe(USUARIO_ID);
      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { contacto: { correo: 'juan@mail.com' } },
        }),
      );
    });

    it('debe retornar null si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@mail.com');

      expect(result).toBeNull();
    });
  });

  // ========== TESTS DE GET DONACIONES ==========
  describe('getDonaciones', () => {
    it('debe delegar correctamente a donacionService', async () => {
      donacionService.findAllPaginatedByUser.mockResolvedValue(
        {} as PaginatedUserDonationsResponseDto,
      );

      await service.getDonaciones(USUARIO_ID, 1, 10);

      expect(donacionService.findAllPaginatedByUser).toHaveBeenCalledWith(
        USUARIO_ID,
        1,
        10,
      );
    });
  });

  // ========== TESTS DE DONAR ==========
  describe('donar', () => {
    it('debe delegar correctamente a donacionService', async () => {
      donacionService.create.mockResolvedValue({} as ResponseDonationDto);

      await service.donar(USUARIO_ID, {} as CreateDonationDto);

      expect(donacionService.create).toHaveBeenCalledWith(
        USUARIO_ID,
        expect.anything(),
      );
    });
  });

  // ========== TESTS DE GET MIS CUPONES CANJEADOS ==========
  describe('getMisCuponesCanjeados', () => {
    it('debe delegar correctamente a usuarioBeneficioService', async () => {
      usuarioBeneficioService.getByUsuario.mockResolvedValue(
        [] as UsuarioBeneficio[],
      );

      await service.getMisCuponesCanjeados(USUARIO_ID);

      expect(usuarioBeneficioService.getByUsuario).toHaveBeenCalledWith(USUARIO_ID);
    });
  });

  // ========== TESTS DE USAR CUPON ==========
  describe('usarCupon', () => {
    it('debe delegar correctamente a usuarioBeneficioService', async () => {
      usuarioBeneficioService.usarBeneficio.mockResolvedValue(
        {} as UsuarioBeneficio,
      );

      await service.usarCupon(10);

      expect(usuarioBeneficioService.usarBeneficio).toHaveBeenCalledWith(10);
    });
  });

  // ========== TESTS DE CANJEAR CUPON ==========
  describe('canjearCupon', () => {
    it('debe delegar correctamente a beneficioService', async () => {
      beneficioService.canjear.mockResolvedValue({
        success: true,
        cantidadCanjeada: 1,
        puntosGastados: 10,
        puntosRestantes: 90,
        stockRestante: 5,
      });

      await service.canjearCupon(USUARIO_ID, 2, 3);

      expect(beneficioService.canjear).toHaveBeenCalledWith(USUARIO_ID, 2, 3);
    });
  });

  // ========== TESTS DE UPDATE CREDENCIALES ==========
  describe('updateCredenciales', () => {
    it('debe actualizar solo el correo sin cambio de contraseña', async () => {
      const usuario = buildUsuario();
      repository.findOne.mockResolvedValue(usuario);
      repository.save.mockResolvedValue(usuario);
      jwtService.sign.mockReturnValue('nuevo-token');

      const dto: UpdateCredencialesDto = { correo: 'nuevo@mail.com' };
      const result = await service.updateCredenciales(USUARIO_ID, dto);

      expect(result.token).toBe('nuevo-token');
      expect(hashService.compare).not.toHaveBeenCalled();
      expect(hashService.hash).not.toHaveBeenCalled();
    });

    it('debe actualizar la contraseña cuando se provee passwordNueva', async () => {
      const usuario = buildUsuario();
      repository.findOne.mockResolvedValue(usuario);
      repository.save.mockResolvedValue(usuario);
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('nueva-clave-hash');
      jwtService.sign.mockReturnValue('token-updated');

      const dto: UpdateCredencialesDto = {
        passwordActual: 'OldPass123',
        passwordNueva: 'NewPass456',
      };

      const result = await service.updateCredenciales(USUARIO_ID, dto);

      expect(hashService.compare).toHaveBeenCalledWith('OldPass123', usuario.clave);
      expect(hashService.hash).toHaveBeenCalledWith('NewPass456');
      expect(result.token).toBe('token-updated');
    });

    it('debe lanzar BadRequestException si no se provee passwordActual al cambiar contraseña', async () => {
      const usuario = buildUsuario();
      repository.findOne.mockResolvedValue(usuario);

      const dto: UpdateCredencialesDto = { passwordNueva: 'NewPass456' };

      await expect(service.updateCredenciales(USUARIO_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(hashService.hash).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si la contraseña actual es incorrecta', async () => {
      const usuario = buildUsuario();
      repository.findOne.mockResolvedValue(usuario);
      hashService.compare.mockResolvedValue(false);

      const dto: UpdateCredencialesDto = {
        passwordActual: 'WrongPass',
        passwordNueva: 'NewPass456',
      };

      await expect(service.updateCredenciales(USUARIO_ID, dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashService.hash).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCredenciales(USUARIO_ID, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE UPDATE USUARIO ==========
  describe('updateUsuario', () => {
    it('debe actualizar los datos del usuario', async () => {
      const usuario = buildUsuario();
      repository.findOne.mockResolvedValue(usuario);
      repository.merge.mockReturnValue(usuario);
      repository.save.mockResolvedValue(usuario);

      const dto: UpdateUsuarioDto = { nombre: 'Pedro', apellido: 'Gomez' };
      const result = await service.updateUsuario(USUARIO_ID, dto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.id).toBe(USUARIO_ID);
    });

    it('debe actualizar contacto y dirección si se proporcionan', async () => {
      const usuario = buildUsuario();
      repository.findOne.mockResolvedValue(usuario);
      repository.merge.mockReturnValue(usuario);
      repository.save.mockResolvedValue(usuario);

      const dto: UpdateUsuarioDto = {
        contacto: { telefono: '1198765432' },
        direccion: { calle: 'Av. Nueva' },
      };

      await service.updateUsuario(USUARIO_ID, dto);

      expect(repository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUsuario(USUARIO_ID, {} as UpdateUsuarioDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE UPDATE PUNTOS ==========
  describe('updatePuntos', () => {
    it('debe actualizar los puntos del usuario', async () => {
      const usuario = buildUsuario();
      const updatedUsuario = { ...usuario, puntos: 50 } as Usuario;

      repository.findOne.mockResolvedValue(usuario);
      repository.save.mockResolvedValue(updatedUsuario);

      const result = await service.updatePuntos(USUARIO_ID, { puntos: 50 });

      expect(repository.save).toHaveBeenCalled();
      expect(result.puntos).toBe(50);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePuntos(USUARIO_ID, { puntos: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE ACTUALIZAR ULTIMA CONEXION ==========
  describe('actualizarUltimaConexion', () => {
    it('debe llamar a update con la fecha actual', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.actualizarUltimaConexion(USUARIO_ID);

      expect(repository.update).toHaveBeenCalledWith(
        USUARIO_ID,
        expect.objectContaining({ ultima_conexion: expect.any(Date) }),
      );
    });
  });

  // ========== TESTS DE GET POINTS ==========
  describe('getPoints', () => {
    it('debe retornar los puntos del usuario', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());

      const result = await service.getPoints(USUARIO_ID);

      expect(result.puntos).toBe(10);
      expect(result.id).toBe(USUARIO_ID);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getPoints(USUARIO_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ========== TESTS DE FIND PAGINATED ==========
  describe('findPaginated', () => {
    it('debe retornar usuarios paginados sin búsqueda', async () => {
      repository.findAndCount.mockResolvedValue([[buildUsuario()], 1]);

      const result = await service.findPaginated(1, 10, '');

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('debe aplicar condiciones de búsqueda cuando se proporciona search', async () => {
      repository.findAndCount.mockResolvedValue([[buildUsuario()], 1]);

      await service.findPaginated(1, 10, 'Juan');

      const call = (repository.findAndCount as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(call.where)).toBe(true);
      expect(call.where).toHaveLength(4);
    });

    it('debe respetar la paginación', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findPaginated(3, 5, '');

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ========== TESTS DE FIND ONE ==========
  describe('findOne', () => {
    it('debe retornar el DTO del usuario', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());

      const result = await service.findOne(USUARIO_ID);

      expect(result).toBeInstanceOf(ResponseUsuarioDto);
      expect(result.id).toBe(USUARIO_ID);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(USUARIO_ID)).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE DELETE ==========
  describe('delete', () => {
    it('debe deshabilitar al usuario con update directo', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.delete(USUARIO_ID);

      expect(repository.update).toHaveBeenCalledWith(USUARIO_ID, {
        habilitado: false,
      });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete(USUARIO_ID)).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE RESTORE ==========
  describe('restore', () => {
    it('debe rehabilitar al usuario con update directo', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.restore(USUARIO_ID);

      expect(repository.update).toHaveBeenCalledWith(USUARIO_ID, {
        habilitado: true,
      });
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.restore(USUARIO_ID)).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE RESET PASSWORD ==========
  describe('findByResetToken', () => {
    it('debe retornar usuario si el token es válido y no está expirado', async () => {
      repository.findOne.mockResolvedValue(buildUsuario());

      const result = await service.findByResetToken('token-valido');

      expect(result).not.toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ resetPasswordToken: 'token-valido' }),
        }),
      );
    });

    it('debe retornar null si el token no existe o está expirado', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByResetToken('token-invalido');

      expect(result).toBeNull();
    });
  });

  describe('setResetToken', () => {
    it('debe actualizar el token y su expiración', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);
      const expires = new Date(Date.now() + 3600000);

      await service.setResetToken(USUARIO_ID, 'nuevo-token', expires);

      expect(repository.update).toHaveBeenCalledWith(USUARIO_ID, {
        resetPasswordToken: 'nuevo-token',
        resetPasswordExpires: expires,
      });
    });
  });

  describe('resetPassword', () => {
    it('debe actualizar la contraseña y limpiar el token', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.resetPassword(USUARIO_ID, 'nueva-clave-hash');

      expect(repository.update).toHaveBeenCalledWith(USUARIO_ID, {
        clave: 'nueva-clave-hash',
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });
    });
  });
});