import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/Modules/auth/auth.controller';
import { AuthService } from '../../src/Modules/auth/auth.service';
import { mock, DeepMockProxy } from 'jest-mock-extended';
import { RolCuenta } from '../../src/Entities/cuenta.entity';
import { LoginDto, RegisterDto } from '../../src/Modules/auth/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: DeepMockProxy<AuthService>;
  let registerDto: RegisterDto;
  let loginDto: LoginDto;

  beforeEach(async () => {
    mockAuthService = mock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    registerDto = {
      correo: 'empresa@example.com',
      clave: 'password123',
      role: RolCuenta.EMPRESA,
      perfilEmpresa: {
        cuit_empresa: '20123456789',
        razon_social: 'Mi Empresa SA',
        nombre_empresa: 'Mi Empresa',
        telefono: '1234567890',
        calle: 'Avenida Siempreviva',
        numero: '742',
      },
    };

    loginDto = {
      correo: 'test@example.com',
      clave: 'password123',
      rol: RolCuenta.USUARIO,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE REGISTER ==========
  describe('register', () => {
    it('debe registrar una Empresa correctamente', async () => {
      const tokenResponse = { token: 'jwt-token-123' };

      mockAuthService.register.mockResolvedValue(tokenResponse);

      const resultado = await controller.register(registerDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('debe pasar los datos correctamente al servicio', async () => {
      mockAuthService.register.mockResolvedValue({ token: 'token' });

      await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  // ========== TESTS DE LOGIN ==========
  describe('login', () => {
    it('debe retornar un token cuando las credenciales son válidas', async () => {
      const tokenResponse = { token: 'jwt-token-valido-123' };

      mockAuthService.login.mockResolvedValue(tokenResponse);

      const resultado = await controller.login(loginDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('debe delegar al servicio cuando se llama login', async () => {

      mockAuthService.login.mockResolvedValue({ token: 'token' });

      await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Credenciales inválidas');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });
  });

  // ========== TESTS DE FORGOT PASSWORD ==========
  describe('forgotPassword', () => {
    it('debe enviar email de reset cuando el email existe', async () => {
      const email = 'usuario@example.com';
      const response = { message: 'Email enviado' };

      mockAuthService.forgotPassword.mockResolvedValue(response);

      const resultado = await controller.forgotPassword(email);

      expect(resultado).toEqual(response);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('debe retornar mensaje genérico por seguridad', async () => {
      const email = 'noexiste@example.com';
      const response = { message: 'Si el email existe, recibirás un enlace' };

      mockAuthService.forgotPassword.mockResolvedValue(response);

      const resultado = await controller.forgotPassword(email);

      expect(resultado).toEqual(response);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
    });

    it('debe pasar el email correctamente al servicio', async () => {
      const email = 'reset@example.com';
      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'Email enviado',
      });

      await controller.forgotPassword(email);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        'reset@example.com',
      );
    });
  });

  // ========== TESTS DE RESET PASSWORD ==========
  describe('resetPassword', () => {
    it('debe resetear la contraseña correctamente', async () => {
      const token = 'valid-reset-token-123';
      const newPassword = 'new-secure-password';
      const response = { message: 'Contraseña actualizada correctamente' };

      mockAuthService.resetPassword.mockResolvedValue(response);

      const resultado = await controller.resetPassword(token, newPassword);

      expect(resultado).toEqual(response);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        token,
        newPassword,
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('debe pasar token y contraseña correctamente al servicio', async () => {
      const token = 'token-abc-123';
      const newPassword = 'password-xyz-789';

      mockAuthService.resetPassword.mockResolvedValue({
        message: 'Contraseña actualizada correctamente',
      });

      await controller.resetPassword(token, newPassword);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'token-abc-123',
        'password-xyz-789',
      );
    });

    it('debe lanzar error si el token es inválido', async () => {
      const token = 'invalid-token';
      const newPassword = 'new-password';

      const error = new Error('Token inválido o expirado');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow('Token inválido o expirado');
    });

    it('debe propagar excepciones del servicio', async () => {
      const token = 'token';
      const newPassword = 'password';

      const error = new Error('Error en la base de datos');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow('Error en la base de datos');
    });
  });
});
