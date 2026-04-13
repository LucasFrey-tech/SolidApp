import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { mock } from 'jest-mock-extended';
import { AuthService } from '../../src/Modules/auth/auth.service';
import { UsuarioService } from '../../src/Modules/user/usuario.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { EmailService } from '../../src/Modules/email/email.service';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { GestionDetector } from '../../src/Modules/auth/estrategias/gestion/gestion_detector';
import { LoginDto, RegisterDto } from '../../src/Modules/auth/dto/auth.dto';
import { Rol } from '../../src/Modules/user/enums/enums';
import { GestionTipo } from '../../src/Modules/auth/dto/gestion.enum';
import { Invitacion } from '../../src/Entities/invitacion.entity';
import { OrganizacionUsuario } from '../../src/Entities/organizacion_usuario.entity';
import { Usuario } from '../../src/Entities/usuario.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioService: jest.Mocked<UsuarioService>;
  let jwtService: jest.Mocked<JwtService>;
  let hashService: jest.Mocked<HashService>;
  let emailService: jest.Mocked<EmailService>;
  let gestionDetector: jest.Mocked<GestionDetector>;
  let invitacionesService: jest.Mocked<InvitacionesService>;

  const mockUsuario = Object.assign(new Usuario(), {
    id: 1,
    correo: 'test@test.com',
    clave: 'hashed_password',
    nombre: 'Juan',
    apellido: 'Pérez',
    documento: '12345678',
    rol: Rol.USUARIO,
    habilitado: true,
  });

  const mockInvitacion = Object.assign(new Invitacion(), {
    id: 1,
    token: 'valid-token',
    correo: 'test@test.com',
    organizacion: { id: 1 },
    empresa: undefined,
    invitadorID: 1,
    rol: Rol.COLABORADOR,
    expirada: false,
    fecha_creacion: new Date(),
  });

  const mockOrganizacionUsuario = Object.assign(new OrganizacionUsuario(), {
    id: 1,
    id_usuario: 1,
    id_organizacion: 1,
    activo: true,
    rol: 'GESTOR',
    fecha_asignacion: new Date(),
  });

  beforeEach(async () => {
    const mockUsuarioService = mock<UsuarioService>();
    const mockJwtService = mock<JwtService>();
    const mockHashService = mock<HashService>();
    const mockEmailService = mock<EmailService>();
    const mockGestionDetector = mock<GestionDetector>();
    const mockInvitacionesService = mock<InvitacionesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: HashService, useValue: mockHashService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: GestionDetector, useValue: mockGestionDetector },
        { provide: InvitacionesService, useValue: mockInvitacionesService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioService = module.get(UsuarioService);
    jwtService = module.get(JwtService);
    hashService = module.get(HashService);
    emailService = module.get(EmailService);
    gestionDetector = module.get(GestionDetector);
    invitacionesService = module.get(InvitacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      correo: 'test@test.com',
      clave: 'password123',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
    };

    it('debe registrar un usuario exitosamente sin token', async () => {
      usuarioService.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed_password');
      usuarioService.create.mockResolvedValue(mockUsuario);
      jwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.register(registerDto);

      expect(result).toEqual({ token: 'jwt-token-123' });
      expect(usuarioService.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(hashService.hash).toHaveBeenCalledWith('password123');
      expect(usuarioService.create).toHaveBeenCalled();
    });

    it('debe registrar un usuario colaborador con token válido', async () => {
      const registerDtoConToken = { ...registerDto, token: 'valid-token' };

      usuarioService.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed_password');
      invitacionesService.validarInvitacion.mockResolvedValue(mockInvitacion);
      usuarioService.create.mockResolvedValue(
        Object.assign(new Usuario(), { ...mockUsuario, rol: Rol.COLABORADOR }),
      );
      invitacionesService.agregarUsuarioAOrganizacion.mockResolvedValue(
        mockOrganizacionUsuario,
      );
      invitacionesService.marcarAceptada.mockResolvedValue(mockInvitacion);
      jwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.register(registerDtoConToken);

      expect(result).toEqual({ token: 'jwt-token-123' });
      expect(invitacionesService.validarInvitacion).toHaveBeenCalledWith(
        'valid-token',
        'test@test.com',
      );
      expect(
        invitacionesService.agregarUsuarioAOrganizacion,
      ).toHaveBeenCalledWith(1, 1);
      expect(invitacionesService.marcarAceptada).toHaveBeenCalledWith(1, 1);
    });

    it('debe lanzar error cuando el correo ya está registrado', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);

      await expect(service.register(registerDto)).rejects.toThrow(
        'El correo ya está registrado',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error en register', async () => {
      usuarioService.findByEmail.mockRejectedValue('Error string inesperado');

      await expect(service.register(registerDto)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe manejar error cuando create falla', async () => {
      usuarioService.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed_password');
      usuarioService.create.mockRejectedValue(
        new Error('Error al crear usuario'),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        'Error al crear usuario',
      );
    });

    it('debe manejar error cuando hash falla', async () => {
      usuarioService.findByEmail.mockResolvedValue(null);
      hashService.hash.mockRejectedValue(new Error('Error al hashear'));

      await expect(service.register(registerDto)).rejects.toThrow(
        'Error al hashear',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      correo: 'test@test.com',
      clave: 'password123',
    };

    it('debe iniciar sesión exitosamente para usuario normal', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      hashService.compare.mockResolvedValue(true);
      usuarioService.actualizarUltimaConexion.mockResolvedValue(undefined);
      jwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login(loginDto);

      expect(result).toEqual({ token: 'jwt-token-123' });
      expect(usuarioService.actualizarUltimaConexion).toHaveBeenCalledWith(1);
    });

    it('debe iniciar sesión exitosamente para colaborador con gestión', async () => {
      const mockColaborador = Object.assign(new Usuario(), {
        ...mockUsuario,
        rol: Rol.COLABORADOR,
      });
      const mockGestionInfo = { tipo: GestionTipo.EMPRESA, entidadId: 5 };

      usuarioService.findByEmail.mockResolvedValue(mockColaborador);
      hashService.compare.mockResolvedValue(true);
      usuarioService.actualizarUltimaConexion.mockResolvedValue(undefined);
      gestionDetector.detectar.mockResolvedValue(mockGestionInfo);
      jwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login(loginDto);

      expect(result).toEqual({ token: 'jwt-token-123' });
      expect(gestionDetector.detectar).toHaveBeenCalledWith(1);
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales incorrectas',
      );
    });

    it('debe lanzar error cuando el usuario está deshabilitado', async () => {
      const mockUsuarioDeshabilitado = Object.assign(new Usuario(), {
        ...mockUsuario,
        habilitado: false,
      });
      usuarioService.findByEmail.mockResolvedValue(mockUsuarioDeshabilitado);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Usuario bloqueado',
      );
    });

    it('debe lanzar error cuando la contraseña es incorrecta', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      hashService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales incorrectas',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error en login', async () => {
      usuarioService.findByEmail.mockRejectedValue('Error string inesperado');

      await expect(service.login(loginDto)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe manejar error cuando compare falla', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      hashService.compare.mockRejectedValue(new Error('Error al comparar'));

      await expect(service.login(loginDto)).rejects.toThrow(
        'Error al comparar',
      );
    });

    it('debe manejar error cuando actualizarUltimaConexion falla', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      hashService.compare.mockResolvedValue(true);
      usuarioService.actualizarUltimaConexion.mockRejectedValue(
        new Error('Error al actualizar conexión'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        'Error al actualizar conexión',
      );
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@test.com';

    it('debe enviar email de recuperación cuando el usuario existe', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      usuarioService.setResetToken.mockResolvedValue(undefined);
      emailService.sendResetPasswordEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'Email enviado' });
      expect(usuarioService.setResetToken).toHaveBeenCalled();
      expect(emailService.sendResetPasswordEmail).toHaveBeenCalled();
    });

    it('debe retornar mensaje genérico cuando el usuario no existe (por seguridad)', async () => {
      usuarioService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({
        message: 'Si el email existe, recibirás un enlace',
      });
      expect(usuarioService.setResetToken).not.toHaveBeenCalled();
      expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });

    it('debe manejar error cuando el error no es instancia de Error en forgotPassword', async () => {
      usuarioService.findByEmail.mockRejectedValue('Error string inesperado');

      await expect(service.forgotPassword(email)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe manejar error cuando setResetToken falla', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      usuarioService.setResetToken.mockRejectedValue(
        new Error('Error al guardar token'),
      );

      await expect(service.forgotPassword(email)).rejects.toThrow(
        'Error al guardar token',
      );
    });

    it('debe manejar error cuando sendResetPasswordEmail falla', async () => {
      usuarioService.findByEmail.mockResolvedValue(mockUsuario);
      usuarioService.setResetToken.mockResolvedValue(undefined);
      emailService.sendResetPasswordEmail.mockRejectedValue(
        new Error('Error al enviar email'),
      );

      await expect(service.forgotPassword(email)).rejects.toThrow(
        'Error al enviar email',
      );
    });
  });

  describe('resetPassword', () => {
    const token = 'reset-token-123';
    const newPassword = 'newPassword456';

    it('debe resetear la contraseña exitosamente', async () => {
      usuarioService.findByResetToken.mockResolvedValue(mockUsuario);
      hashService.hash.mockResolvedValue('new_hashed_password');
      usuarioService.resetPassword.mockResolvedValue(undefined);

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({
        message: 'Contraseña actualizada correctamente',
      });
      expect(usuarioService.findByResetToken).toHaveBeenCalledWith(token);
      expect(hashService.hash).toHaveBeenCalledWith(newPassword);
      expect(usuarioService.resetPassword).toHaveBeenCalledWith(
        1,
        'new_hashed_password',
      );
    });

    it('debe lanzar error cuando el token es inválido', async () => {
      usuarioService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error en resetPassword', async () => {
      usuarioService.findByResetToken.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe manejar error cuando hash falla', async () => {
      usuarioService.findByResetToken.mockResolvedValue(mockUsuario);
      hashService.hash.mockRejectedValue(new Error('Error al hashear'));

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Error al hashear',
      );
    });

    it('debe manejar error cuando resetPassword falla', async () => {
      usuarioService.findByResetToken.mockResolvedValue(mockUsuario);
      hashService.hash.mockResolvedValue('new_hashed_password');
      usuarioService.resetPassword.mockRejectedValue(
        new Error('Error al actualizar'),
      );

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Error al actualizar',
      );
    });
  });
});
