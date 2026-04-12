import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/Modules/auth/auth.controller';
import { AuthService } from '../../src/Modules/auth/auth.service';
import { mock } from 'jest-mock-extended';
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
} from '../../src/Modules/auth/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = mock<AuthService>();

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
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('debe registrar un usuario exitosamente y retornar token', async () => {
      const registerDto: RegisterDto = {
        correo: 'test@test.com',
        clave: 'password123',
        nombre: 'Lucas',
        apellido: 'Frey',
        documento: '11888858',
      };
      const expectedResponse: AuthResponse = { token: 'jwt-token-123' };

      authService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('debe registrar un usuario con token opcional', async () => {
      const registerDto: RegisterDto = {
        correo: 'test@test.com',
        clave: 'password123',
        nombre: 'Lucas',
        apellido: 'Frey',
        documento: '11888858',
        token: 'a8sd7a98sd7as9d87',
      };
      const expectedResponse: AuthResponse = { token: 'jwt-token-123' };

      authService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('debe manejar error cuando el correo ya está registrado', async () => {
      const registerDto: RegisterDto = {
        correo: 'existente@test.com',
        clave: 'password123',
        nombre: 'Lucas',
        apellido: 'Frey',
        documento: '11888858',
      };
      const error = new Error('El correo electrónico ya está registrado');

      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'El correo electrónico ya está registrado',
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('debe manejar error cuando el documento ya está registrado', async () => {
      const registerDto: RegisterDto = {
        correo: 'test@test.com',
        clave: 'password123',
        nombre: 'Lucas',
        apellido: 'Frey',
        documento: '11888858',
      };
      const error = new Error('El documento ya está registrado');

      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'El documento ya está registrado',
      );
    });

    it('debe manejar error cuando la contraseña es muy débil', async () => {
      const registerDto: RegisterDto = {
        correo: 'test@test.com',
        clave: '123',
        nombre: 'Lucas',
        apellido: 'Frey',
        documento: '11888858',
      };
      const error = new Error('La contraseña debe tener al menos 6 caracteres');

      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
    });

    it('debe manejar error cuando el email es inválido', async () => {
      const registerDto: RegisterDto = {
        correo: 'email-invalido',
        clave: 'password123',
        nombre: 'Lucas',
        apellido: 'Frey',
        documento: '11888858',
      };
      const error = new Error('El formato del correo electrónico es inválido');

      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(
        'El formato del correo electrónico es inválido',
      );
    });
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente con credenciales correctas', async () => {
      const loginDto: LoginDto = {
        correo: 'test@test.com',
        clave: 'password123',
      };
      const expectedResponse: AuthResponse = { token: 'jwt-token-456' };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando el correo no existe', async () => {
      const loginDto: LoginDto = {
        correo: 'noexiste@test.com',
        clave: 'password123',
      };
      const error = new Error('Credenciales inválidas');

      authService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('debe manejar error cuando la contraseña es incorrecta', async () => {
      const loginDto: LoginDto = {
        correo: 'test@test.com',
        clave: 'wrongpassword',
      };
      const error = new Error('Credenciales inválidas');

      authService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    it('debe manejar error cuando el usuario está deshabilitado', async () => {
      const loginDto: LoginDto = {
        correo: 'disabled@test.com',
        clave: 'password123',
      };
      const error = new Error('La cuenta está deshabilitada');

      authService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'La cuenta está deshabilitada',
      );
    });

    it('debe manejar error cuando el email tiene formato inválido', async () => {
      const loginDto: LoginDto = {
        correo: 'email-invalido',
        clave: 'password123',
      };
      const error = new Error('El formato del correo electrónico es inválido');

      authService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'El formato del correo electrónico es inválido',
      );
    });
  });

  describe('forgotPassword', () => {
    it('debe enviar correo de recuperación exitosamente', async () => {
      const email = 'test@test.com';
      const expectedResponse = { message: 'Correo de recuperación enviado' };

      authService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(email);

      expect(result).toEqual(expectedResponse);
      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando el email no existe', async () => {
      const email = 'noexiste@test.com';
      const error = new Error(
        'No existe una cuenta con ese correo electrónico',
      );

      authService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword(email)).rejects.toThrow(
        'No existe una cuenta con ese correo electrónico',
      );
      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
    });

    it('debe manejar error cuando el email tiene formato inválido', async () => {
      const email = 'email-invalido';
      const error = new Error('El formato del correo electrónico es inválido');

      authService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword(email)).rejects.toThrow(
        'El formato del correo electrónico es inválido',
      );
    });

    it('debe manejar error cuando el usuario está deshabilitado', async () => {
      const email = 'disabled@test.com';
      const error = new Error(
        'La cuenta está deshabilitada, contacte al administrador',
      );

      authService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword(email)).rejects.toThrow(
        'La cuenta está deshabilitada, contacte al administrador',
      );
    });
  });

  describe('resetPassword', () => {
    it('debe resetear la contraseña exitosamente', async () => {
      const token = 'reset-token-123';
      const newPassword = 'newPassword456';
      const expectedResponse = {
        message: 'Contraseña actualizada exitosamente',
      };

      authService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(token, newPassword);

      expect(result).toEqual(expectedResponse);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        token,
        newPassword,
      );
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando el token es inválido', async () => {
      const token = 'invalid-token';
      const newPassword = 'newPassword456';
      const error = new Error('Token inválido o expirado');

      authService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow('Token inválido o expirado');
      expect(authService.resetPassword).toHaveBeenCalledWith(
        token,
        newPassword,
      );
    });

    it('debe manejar error cuando el token ha expirado', async () => {
      const token = 'expired-token';
      const newPassword = 'newPassword456';
      const error = new Error(
        'El token ha expirado, solicite un nuevo restablecimiento',
      );

      authService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow(
        'El token ha expirado, solicite un nuevo restablecimiento',
      );
    });

    it('debe manejar error cuando la nueva contraseña es demasiado corta', async () => {
      const token = 'reset-token-123';
      const newPassword = '123';
      const error = new Error('La contraseña debe tener al menos 6 caracteres');

      authService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('debe manejar error cuando la nueva contraseña es igual a la anterior', async () => {
      const token = 'reset-token-123';
      const newPassword = 'samePassword123';
      const error = new Error(
        'La nueva contraseña debe ser diferente a la anterior',
      );

      authService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow('La nueva contraseña debe ser diferente a la anterior');
    });

    it('debe manejar error cuando no se encuentra el usuario asociado al token', async () => {
      const token = 'orphan-token';
      const newPassword = 'newPassword456';
      const error = new Error('Usuario no encontrado');

      authService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword(token, newPassword),
      ).rejects.toThrow('Usuario no encontrado');
    });
  });
});
