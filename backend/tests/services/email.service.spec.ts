import { EmailService } from '../../src/Modules/email/email.service';
import { ErrorManager } from '../../src/common/errors/error.manager';
import nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('EmailService', () => {
  let sendMailMock: jest.Mock;

  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env.EMAIL_USER = 'test@test.com';
    process.env.EMAIL_PASS = 'test-password';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockClear();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    });
  });

  describe('constructor', () => {
    it('debe crear una instancia correctamente cuando hay credenciales', () => {
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'test-password';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

      const service = new EmailService();
      expect(service).toBeDefined();
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: { user: 'test@test.com', pass: 'test-password' },
      });
    });

    it('debe lanzar error cuando falta EMAIL_USER', () => {
      process.env.EMAIL_USER = '';
      process.env.EMAIL_PASS = 'test-password';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

      expect(() => new EmailService()).toThrow(ErrorManager);
      expect(() => new EmailService()).toThrow(
        'Las credenciales de email no están configuradas',
      );
    });

    it('debe lanzar error cuando falta EMAIL_PASS', () => {
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = '';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

      expect(() => new EmailService()).toThrow(ErrorManager);
      expect(() => new EmailService()).toThrow(
        'Las credenciales de email no están configuradas',
      );
    });

    it('debe lanzar error cuando falta NEXT_PUBLIC_API_URL', () => {
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'test-password';
      process.env.NEXT_PUBLIC_API_URL = '';

      expect(() => new EmailService()).toThrow(ErrorManager);
      expect(() => new EmailService()).toThrow(
        'La URL del frontend no está configurada',
      );
    });
  });

  describe('sendResetPasswordEmail', () => {
    const to = 'usuario@test.com';
    const token = 'reset-token-123';

    beforeEach(() => {
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'test-password';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    });

    it('debe manejar error cuando el error no es una instancia de Error', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;

      sendMailMock.mockRejectedValue('Error string inesperado');

      await expect(service.sendResetPasswordEmail(to, token)).rejects.toThrow(
        'Error al enviar el email de recuperación',
      );
    });

    it('debe enviar email de recuperación exitosamente', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;

      await service.sendResetPasswordEmail(to, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: '"SolidApp" <noreply@solidapp.com>',
        to,
        subject: 'Recuperación de contraseña',
        html:
          expect.stringContaining(
            'http://localhost:3000/restaurar-contrasena?token=reset-token-123',
          ) && expect.stringContaining('Este enlace expira en 1 hora'),
      });
    });

    it('debe manejar error cuando falla el envío', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;
      const error = new Error('Error de conexión SMTP');
      sendMailMock.mockRejectedValue(error);

      await expect(service.sendResetPasswordEmail(to, token)).rejects.toThrow(
        'Error de conexión SMTP',
      );
    });
  });

  describe('sendInvitationEmail', () => {
    const to = 'invitado@test.com';
    const token = 'invite-token-456';

    beforeEach(() => {
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'test-password';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    });

    it('debe manejar error cuando el error no es una instancia de Error', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;
      sendMailMock.mockRejectedValue('Error string inesperado');

      await expect(service.sendInvitationEmail(to, token)).rejects.toThrow(
        'Error al enviar el email de invitación',
      );
    });

    it('debe enviar email de invitación exitosamente', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;

      await service.sendInvitationEmail(to, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: '"SolidApp" <noreply@solidapp.com>',
        to,
        subject: 'Invitación a SolidApp',
        html:
          expect.stringContaining(
            'http://localhost:3000/login?token=invite-token-456',
          ) && expect.stringContaining('Este enlace expira en 48 horas'),
      });
    });

    it('debe manejar error cuando falla el envío', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;
      const error = new Error('Error al enviar');
      sendMailMock.mockRejectedValue(error);

      await expect(service.sendInvitationEmail(to, token)).rejects.toThrow(
        'Error al enviar',
      );
    });
  });

  describe('sendEntidadInvitationEmail', () => {
    const to = 'empresa@test.com';
    const token = 'entidad-token-789';

    beforeEach(() => {
      process.env.EMAIL_USER = 'test@test.com';
      process.env.EMAIL_PASS = 'test-password';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    });

    it('debe manejar error cuando el error no es una instancia de Error', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;
      sendMailMock.mockRejectedValue('Error string inesperado');

      await expect(
        service.sendEntidadInvitationEmail(to, token),
      ).rejects.toThrow('Error al enviar el email de invitación de entidad');
    });

    it('debe enviar email de invitación de entidad exitosamente', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;

      await service.sendEntidadInvitationEmail(to, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: '"SolidApp" <noreply@solidapp.com>',
        to,
        subject: 'Invitación a registrar tu entidad en SolidApp',
        html:
          expect.stringContaining(
            'http://localhost:3000/registro-entidad?token=entidad-token-789',
          ) && expect.stringContaining('Este enlace expira en 7 días'),
      });
    });

    it('debe manejar error cuando falla el envío', async () => {
      const service = new EmailService();
      const transporter = (nodemailer.createTransport as jest.Mock).mock
        .results[0]?.value;
      sendMailMock = transporter?.sendMail as jest.Mock;
      const error = new Error('Error de red');
      sendMailMock.mockRejectedValue(error);

      await expect(
        service.sendEntidadInvitationEmail(to, token),
      ).rejects.toThrow('Error de red');
    });
  });
});
