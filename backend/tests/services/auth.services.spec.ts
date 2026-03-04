/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { mock, DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from '../../src/Modules/auth/auth.service';
import { CuentaService } from '../../src/Modules/cuenta/cuenta.service';
import { PerfilUsuarioService } from '../../src/Modules/user/usuario.service';
import { PerfilEmpresaService } from '../../src/Modules/empresa/empresa.service';
import { PerfilOrganizacionService } from '../../src/Modules/organization/organizacion.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { EmailService } from '../../src/Modules/email/email.service';
import { DataSource } from 'typeorm';
import { Cuenta, RolCuenta } from '../../src/Entities/cuenta.entity';
import { LoginDto, RegisterDto } from '../../src/Modules/auth/dto/auth.dto';
import { EmpresaResponseDTO } from '../../src/Modules/empresa/dto/response_empresa.dto';

describe('AuthService', () => {
  let service: AuthService;
  let mockCuentaService: DeepMockProxy<CuentaService>;
  let mockPerfilUsuarioService: DeepMockProxy<PerfilUsuarioService>;
  let mockPerfilEmpresaService: DeepMockProxy<PerfilEmpresaService>;
  let mockPerfilOrganizacionService: DeepMockProxy<PerfilOrganizacionService>;
  let mockJwtService: DeepMockProxy<JwtService>;
  let mockHashService: DeepMockProxy<HashService>;
  let mockEmailService: DeepMockProxy<EmailService>;
  let mockDataSource: any;

  let registerDto: RegisterDto;
  let loginDto: LoginDto;
  let cuentaValida: Cuenta;
  let cuentaBloqueada: Cuenta;
  let cuentaCreada: Cuenta;
  let empresaResponseDTO: EmpresaResponseDTO;
  let tokenResponse: { token: string };
  let email: string;

  beforeEach(async () => {
    mockCuentaService = mock<CuentaService>();
    mockPerfilUsuarioService = mock<PerfilUsuarioService>();
    mockPerfilEmpresaService = mock<PerfilEmpresaService>();
    mockPerfilOrganizacionService = mock<PerfilOrganizacionService>();
    mockJwtService = mock<JwtService>();
    mockHashService = mock<HashService>();
    mockEmailService = mock<EmailService>();
    mockDataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CuentaService,
          useValue: mockCuentaService,
        },
        {
          provide: PerfilUsuarioService,
          useValue: mockPerfilUsuarioService,
        },
        {
          provide: PerfilEmpresaService,
          useValue: mockPerfilEmpresaService,
        },
        {
          provide: PerfilOrganizacionService,
          useValue: mockPerfilOrganizacionService,
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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // ========== DTOs ==========
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
      correo: 'usuario@example.com',
      clave: 'password123',
      rol: RolCuenta.USUARIO,
    };

    // ========== Objetos de respuesta ==========
    cuentaValida = {
      id: 1,
      correo: 'usuario@example.com',
      clave: 'hashed-password',
      role: RolCuenta.USUARIO,
      deshabilitado: false,
    } as Cuenta;

    cuentaBloqueada = {
      id: 1,
      correo: 'bloqueado@example.com',
      clave: 'hashed-password',
      role: RolCuenta.USUARIO,
      deshabilitado: true,
    } as Cuenta;

    tokenResponse = { token: 'jwt-token-valido' };

    // ========== Objetos para register test ==========
    cuentaCreada = { id: 1, ...registerDto } as Cuenta;

    // ========== Email para forgot password ==========
    email = 'usuario@example.com';

    // ========== EmpresaResponseDTO para register test ==========
    empresaResponseDTO = {
      id: 1,
      cuit_empresa: '20123456789',
      correo: registerDto.correo,
      razon_social: 'Mi Empresa SA',
      nombre_empresa: 'Mi Empresa',
      descripcion: 'Empresa de ejemplo',
      rubro: 'Comercio',
      prefijo: '+54',
      telefono: '1234567890',
      provincia: 'Buenos Aires',
      ciudad: 'CABA',
      calle: 'Avenida Siempreviva',
      numero: '742',
      codigo_postal: '1234',
      web: 'www.miempresa.com',
      verificada: false,
      deshabilitado: false,
      fecha_registro: new Date(),
      ultima_conexion: new Date(),
      ultimo_cambio: new Date(),
      logo: '/logo.png',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE REGISTER ==========
  describe('register', () => {
    it('debe registrar una empresa correctamente', async () => {
      mockCuentaService.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed-password');
      mockDataSource.transaction.mockImplementation((callback) => callback({}));
      mockCuentaService.create.mockResolvedValue(cuentaCreada);
      mockPerfilEmpresaService.create.mockResolvedValue(empresaResponseDTO);
      mockJwtService.sign.mockReturnValue(tokenResponse.token);

      const resultado = await service.register(registerDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockCuentaService.findByEmail).toHaveBeenCalledWith(
        registerDto.correo,
      );
    });

    it('debe lanzar error si el email ya existe', async () => {
      mockCuentaService.findByEmail.mockResolvedValue(cuentaValida);

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  // ========== TESTS DE LOGIN ==========
  describe('login', () => {
    it('debe retornar un token si las credenciales son válidas', async () => {
      mockCuentaService.findByEmailRol.mockResolvedValue(cuentaValida);
      mockHashService.compare.mockResolvedValue(true);
      mockCuentaService.actualizarUltimaConexion.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue(tokenResponse.token);

      const resultado = await service.login(loginDto);

      expect(resultado).toEqual(tokenResponse);
      expect(mockCuentaService.findByEmailRol).toHaveBeenCalledWith(
        loginDto.correo,
        loginDto.rol,
      );
    });

    it('debe lanzar error si la cuenta no existe', async () => {
      mockCuentaService.findByEmailRol.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar error si la contraseña es incorrecta', async () => {
      mockCuentaService.findByEmailRol.mockResolvedValue(cuentaValida);
      mockHashService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar error si la cuenta está deshabilitada', async () => {
      mockCuentaService.findByEmailRol.mockResolvedValue(cuentaBloqueada);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  // ========== TESTS DE FORGOT PASSWORD ==========
  describe('forgotPassword', () => {
    it('debe enviar email de reset si el usuario existe', async () => {
      mockCuentaService.findByEmail.mockResolvedValue(cuentaValida);
      mockCuentaService.setResetToken.mockResolvedValue(undefined);
      mockEmailService.sendResetPasswordEmail.mockResolvedValue(undefined);

      const resultado = await service.forgotPassword(email);

      expect(resultado).toEqual({ message: 'Email enviado' });
      expect(mockCuentaService.setResetToken).toHaveBeenCalled();
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalled();
    });

    it('debe retornar mensaje genérico si el usuario NO existe', async () => {
      mockCuentaService.findByEmail.mockResolvedValue(null);

      const resultado = await service.forgotPassword(email);

      expect(resultado).toEqual({
        message: 'Si el email existe, recibirás un enlace',
      });
      expect(mockEmailService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE RESET PASSWORD ==========
  describe('resetPassword', () => {
    it('debe resetear la contraseña correctamente', async () => {
      const token = 'token-valido-123';
      const newPassword = 'nueva-password-456';

      mockCuentaService.findByResetToken.mockResolvedValue(cuentaValida);
      mockHashService.hash.mockResolvedValue('new-hashed-password');
      mockCuentaService.resetPassword.mockResolvedValue(undefined);
      mockCuentaService.findById.mockResolvedValue(cuentaValida);

      const resultado = await service.resetPassword(token, newPassword);

      expect(resultado).toEqual({
        message: 'Contraseña actualizada correctamente',
      });
      expect(mockHashService.hash).toHaveBeenCalledWith(newPassword);
      expect(mockCuentaService.resetPassword).toHaveBeenCalled();
    });

    it('debe lanzar error si el token es inválido', async () => {
      const token = 'token-invalido';
      const newPassword = 'nueva-password';

      mockCuentaService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar error si el token está expirado', async () => {
      const token = 'token-expirado';
      const newPassword = 'nueva-password';

      mockCuentaService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
