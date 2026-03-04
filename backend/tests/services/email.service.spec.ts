import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../src/Modules/email/email.service';

jest.mock('nodemailer');
import nodemailer from 'nodemailer';

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: jest.Mock;
  let mockCreateTransport: jest.Mock;

  beforeEach(async () => {
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASS = 'testPassword123';

    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

    mockCreateTransport = jest.fn().mockReturnValue({
      sendMail: mockSendMail,
    });

    (nodemailer.createTransport as jest.Mock) = mockCreateTransport;

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Limpiar variables de entorno
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
  });

  // ========== TESTS DE SEND RESET PASSWORD EMAIL ==========
  describe('sendResetPasswordEmail', () => {
    it('debe enviar email de recuperación de contraseña', async () => {
      const to = 'usuario@example.com';
      const token = 'validToken123';

      await service.sendResetPasswordEmail(to, token);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"SolidApp" <noreply@solidapp.com>',
          to,
          subject: 'Recuperación de contraseña',
        }),
      );
    });

    it('debe incluir el token en el enlace del email', async () => {
      const to = 'usuario@example.com';
      const token = 'validToken123';

      await service.sendResetPasswordEmail(to, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(`token=${token}`);
    });

    it('debe construir correctamente la URL de restauración', async () => {
      const to = 'usuario@example.com';
      const token = 'testToken456';
      const expectedUrl = `http://localhost:3000/restaurar-contrasena?token=${token}`;

      await service.sendResetPasswordEmail(to, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(expectedUrl);
    });

    it('debe incluir el mensaje de expiración del enlace', async () => {
      const to = 'usuario@example.com';
      const token = 'validToken123';

      await service.sendResetPasswordEmail(to, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Este enlace expira en 1 hora');
    });

    it('debe propagar excepciones del transporter', async () => {
      mockSendMail.mockRejectedValue(new Error('Email service error'));

      const to = 'usuario@example.com';
      const token = 'validToken123';

      await expect(service.sendResetPasswordEmail(to, token)).rejects.toThrow(
        'Email service error',
      );
    });

    it('debe enviar email con contenido HTML', async () => {
      const to = 'usuario@example.com';
      const token = 'validToken123';

      await service.sendResetPasswordEmail(to, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toBeDefined();
      expect(callArgs.html).toContain('<h2>');
      expect(callArgs.html).toContain('<a href=');
    });

    it('debe usar correo "to" correcto', async () => {
      const to = 'different@example.com';
      const token = 'validToken123';

      await service.sendResetPasswordEmail(to, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(to);
    });
  });

  // ========== TESTS DE CONSTRUCTOR ==========
  describe('constructor', () => {
    it('debe crear transporter con configuración correcta', () => {
      expect(mockCreateTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@gmail.com',
          pass: 'testPassword123',
        },
      });
    });

    it('debe usar variables de entorno para credentials', () => {
      const callArgs = mockCreateTransport.mock.calls[0][0];
      expect(callArgs.auth.user).toBe(process.env.EMAIL_USER);
      expect(callArgs.auth.pass).toBe(process.env.EMAIL_PASS);
    });
  });
});
