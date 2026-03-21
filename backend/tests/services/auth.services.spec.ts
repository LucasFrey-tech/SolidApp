/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { mock, DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from '../../src/Modules/auth/auth.service';
import { UsuarioService } from '../../src/Modules/user/usuario.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { EmailService } from '../../src/Modules/email/email.service';
import { GestionDetector } from '../../src/Modules/auth/estrategias/gestion/gestion_detector';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { LoginDto, RegisterDto } from '../../src/Modules/auth/dto/auth.dto';
import { ResponseUsuarioDto } from '../../src/Modules/user/dto/response_usuario.dto';
import { Rol } from '../../src/Modules/user/enums/enums';
import { GestionTipo } from '../../src/Modules/auth/dto/gestion.enum';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsuarioService: DeepMockProxy<UsuarioService>;
  let mockJwtService: DeepMockProxy<JwtService>;
  let mockHashService: DeepMockProxy<HashService>;
  let mockEmailService: DeepMockProxy<EmailService>;
  let mockGestionDetector: DeepMockProxy<GestionDetector>;
  let mockInvitacionesService: DeepMockProxy<InvitacionesService>;

  let registerDto: RegisterDto;
  let registerDtoConToken: RegisterDto;
  let loginDto: LoginDto;
  let usuarioHabilitado: ResponseUsuarioDto;
  let usuarioDeshabilitado: ResponseUsuarioDto;
  let usuarioColaborador: ResponseUsuarioDto;
  let tokenResponse: { token: string };
  let email: string;

  beforeEach(async () => {
    mockUsuarioService = mock<UsuarioService>();
    mockJwtService = mock<JwtService>();
    mockHashService = mock<HashService>();
    mockEmailService = mock<EmailService>();
    mockGestionDetector = mock<GestionDetector>();
    mockInvitacionesService = mock<InvitacionesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashService,
          useValue: mockHashService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: GestionDetector,
          useValue: mockGestionDetector,
        },
        {
          provide: InvitacionesService,
          useValue: mockInvitacionesService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // ========== DTOs ==========
    registerDto = {
      correo: 'usuario@example.com',
      clave: 'password123',
      nombre: 'Lucas',
      apellido: 'Frey',
      documento: '11888858',
    };

    registerDtoConToken = {
      ...registerDto,
      token: 'token-de-invitacion-valido',
    };

    loginDto = {
      correo: 'usuario@example.com',
      clave: 'password123',
    };

    // ========== Objetos de respuesta ==========
    usuarioHabilitado = {
      id: 1,
      correo: 'usuario@example.com',
      clave: 'hashed-password',
      rol: Rol.USUARIO,
      habilitado: true,
    } as unknown as ResponseUsuarioDto;

    usuarioDeshabilitado = {
      id: 2,
      correo: 'bloqueado@example.com',
      clave: 'hashed-password',
      rol: Rol.USUARIO,
      habilitado: false,
    } as unknown as ResponseUsuarioDto;

    usuarioColaborador = {
      id: 3,
      correo: 'colaborador@example.com',
      clave: 'hashed-password',
      rol: Rol.COLABORADOR,
      habilitado: true,
    } as unknown as ResponseUsuarioDto;

    tokenResponse = { token: 'jwt-token-valido' };

    // ========== Email para forgot password ==========
    email = 'usuario@example.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE REGISTER ==========
  describe('register', () => {
    it('debe registrar un usuario correctamente sin token de invitación', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed-password');
      mockUsuarioService.create.mockResolvedValue({
        ...usuarioHabilitado,
        rol: Rol.USUARIO,
      });
      mockJwtService.sign.mockReturnValue(tokenResponse.token);

      const resultado = await service.register(registerDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockUsuarioService.findByEmail).toHaveBeenCalledWith(registerDto.correo);
      expect(mockHashService.hash).toHaveBeenCalledWith(registerDto.clave);
      expect(mockUsuarioService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          correo: registerDto.correo,
          nombre: registerDto.nombre,
          apellido: registerDto.apellido,
          documento: registerDto.documento,
          rol: Rol.USUARIO,
        }),
      );
    });

    it('debe registrar un colaborador correctamente con token de invitación válido', async () => {
      const invitacionMock = {
        id: 10,
        correo: registerDtoConToken.correo,
        organizacionId: null,
        empresaId: 5,
      };

      mockUsuarioService.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed-password');
      mockInvitacionesService.buscarPorToken.mockResolvedValue(invitacionMock as any);
      mockUsuarioService.create.mockResolvedValue({
        ...usuarioColaborador,
      });
      mockInvitacionesService.agregarUsuarioAEmpresa.mockResolvedValue(undefined as any);
      mockInvitacionesService.marcarAceptada.mockResolvedValue(undefined as any);
      mockJwtService.sign.mockReturnValue(tokenResponse.token);

      const resultado = await service.register(registerDtoConToken);

      expect(resultado).toEqual(tokenResponse);
      expect(mockInvitacionesService.buscarPorToken).toHaveBeenCalledWith(registerDtoConToken.token);
      expect(mockInvitacionesService.marcarAceptada).toHaveBeenCalledWith(invitacionMock.id);
      expect(mockUsuarioService.create).toHaveBeenCalledWith(
        expect.objectContaining({ rol: Rol.COLABORADOR }),
      );
    });

    it('debe lanzar BadRequestException si el email ya existe', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(usuarioHabilitado);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(mockUsuarioService.create).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el token de invitación es inválido', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed-password');
      mockInvitacionesService.buscarPorToken.mockResolvedValue(null);

      await expect(service.register(registerDtoConToken)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el correo no coincide con la invitación', async () => {
      const invitacionCorreoDistinto = {
        id: 10,
        correo: 'otro@example.com',
        organizacionId: null,
        empresaId: 5,
      };

      mockUsuarioService.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed-password');
      mockInvitacionesService.buscarPorToken.mockResolvedValue(invitacionCorreoDistinto as any);

      await expect(service.register(registerDtoConToken)).rejects.toThrow(BadRequestException);
    });
  });

  // ========== TESTS DE LOGIN ==========
  describe('login', () => {
    it('debe retornar un token si las credenciales son válidas (rol USUARIO)', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(usuarioHabilitado);
      mockHashService.compare.mockResolvedValue(true);
      mockUsuarioService.actualizarUltimaConexion.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue(tokenResponse.token);

      const resultado = await service.login(loginDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockUsuarioService.findByEmail).toHaveBeenCalledWith(loginDto.correo);
      expect(mockHashService.compare).toHaveBeenCalledWith(loginDto.clave, usuarioHabilitado.clave);
      expect(mockUsuarioService.actualizarUltimaConexion).toHaveBeenCalledWith(usuarioHabilitado.id);
      expect(mockGestionDetector.detectar).not.toHaveBeenCalled();
    });

    it('debe retornar un token con gestion si el rol es COLABORADOR', async () => {
      const gestionInfo = { tipo: GestionTipo.EMPRESA, entidadId: 5 };

      mockUsuarioService.findByEmail.mockResolvedValue(usuarioColaborador);
      mockHashService.compare.mockResolvedValue(true);
      mockUsuarioService.actualizarUltimaConexion.mockResolvedValue(undefined);
      mockGestionDetector.detectar.mockResolvedValue(gestionInfo as any);
      mockJwtService.sign.mockReturnValue(tokenResponse.token);

      const resultado = await service.login(loginDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockGestionDetector.detectar).toHaveBeenCalledWith(usuarioColaborador.id);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          gestion: GestionTipo.EMPRESA,
          gestionId: 5,
        }),
      );
    });

    it('debe lanzar UnauthorizedException si la cuenta no existe', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockHashService.compare).not.toHaveBeenCalled();
    });

    it('debe lanzar ForbiddenException si la cuenta está deshabilitada', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(usuarioDeshabilitado);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
      expect(mockHashService.compare).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(usuarioHabilitado);
      mockHashService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUsuarioService.actualizarUltimaConexion).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE FORGOT PASSWORD ==========
  describe('forgotPassword', () => {
    it('debe enviar email de reset si el usuario existe', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(usuarioHabilitado);
      mockUsuarioService.setResetToken.mockResolvedValue(undefined);
      mockEmailService.sendResetPasswordEmail.mockResolvedValue(undefined);

      const resultado = await service.forgotPassword(email);

      expect(resultado).toEqual({ message: 'Email enviado' });
      expect(mockUsuarioService.setResetToken).toHaveBeenCalledWith(
        usuarioHabilitado.id,
        expect.any(String),
        expect.any(Date),
      );
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });

    it('debe retornar mensaje genérico si el usuario NO existe', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(null);

      const resultado = await service.forgotPassword(email);

      expect(resultado).toEqual({ message: 'Si el email existe, recibirás un enlace' });
      expect(mockUsuarioService.setResetToken).not.toHaveBeenCalled();
      expect(mockEmailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE RESET PASSWORD ==========
  describe('resetPassword', () => {
    it('debe resetear la contraseña correctamente con token válido', async () => {
      const token = 'token-valido-123';
      const newPassword = 'nueva-password-456';

      mockUsuarioService.findByResetToken.mockResolvedValue(usuarioHabilitado as any);
      mockHashService.hash.mockResolvedValue('new-hashed-password');
      mockUsuarioService.resetPassword.mockResolvedValue(undefined);

      const resultado = await service.resetPassword(token, newPassword);

      expect(resultado).toEqual({ message: 'Contraseña actualizada correctamente' });
      expect(mockUsuarioService.findByResetToken).toHaveBeenCalledWith(token);
      expect(mockHashService.hash).toHaveBeenCalledWith(newPassword);
      expect(mockUsuarioService.resetPassword).toHaveBeenCalledWith(
        usuarioHabilitado.id,
        'new-hashed-password',
      );
    });

    it('debe lanzar UnauthorizedException si el token es inválido', async () => {
      const token = 'token-invalido';
      const newPassword = 'nueva-password';

      mockUsuarioService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockHashService.hash).not.toHaveBeenCalled();
      expect(mockUsuarioService.resetPassword).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si el token está expirado', async () => {
      const token = 'token-expirado';
      const newPassword = 'nueva-password';

      mockUsuarioService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ========== TESTS DE createPayload ==========
  describe('createPayload', () => {
    it('debe construir el payload correctamente sin gestion', () => {
      const payload = service.createPayload(1, Rol.USUARIO);

      expect(payload).toEqual({
        sub: 1,
        rol: Rol.USUARIO,
        gestion: undefined,
        gestionId: undefined,
      });
    });

    it('debe construir el payload correctamente con gestion', () => {
      const payload = service.createPayload(3, Rol.COLABORADOR, GestionTipo.EMPRESA, 5);

      expect(payload).toEqual({
        sub: 3,
        rol: Rol.COLABORADOR,
        gestion: GestionTipo.EMPRESA,
        gestionId: 5,
      });
    });
  });
});