import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import { ErrorManager } from '../../common/errors/error.manager';

/**
 * Servicio para el envío de correos electrónicos
 */
@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly baseUrl: string;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!user || !pass) {
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Las credenciales de email no están configuradas',
      });
    }

    if (!baseUrl) {
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'La URL del frontend no está configurada',
      });
    }

    this.baseUrl = baseUrl;

    this.transporter = nodemailer.createTransport({
      service: 'gmail' as const,
      auth: { user, pass },
    });
  }

  /**
   * Envía un email para recuperación de contraseña
   *
   * @param to - Correo electrónico del destinatario
   * @param token - Token único para restablecer la contraseña
   *
   * @throws {ErrorManager} Si falla el envío del correo
   */
  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    try {
      const resetLink = `${this.baseUrl}/restaurar-contrasena?token=${token}`;

      const mailOptions: SendMailOptions = {
        from: '"SolidApp" <noreply@solidapp.com>',
        to,
        subject: 'Recuperación de contraseña',
        html: `
          <h2>Recuperar contraseña</h2>
          <p>Hacé click en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Este enlace expira en 1 hora.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error al enviar el email de recuperación',
      });
    }
  }

  /**
   * Envía una invitación a un usuario para que se registre en la plataforma
   *
   * @param to - Correo electrónico del destinatario
   * @param token - Token único para aceptar la invitación
   *
   * @throws {ErrorManager} Si falla el envío del correo
   */
  async sendInvitationEmail(to: string, token: string): Promise<void> {
    try {
      const inviteLink = `${this.baseUrl}/login?token=${token}`;

      const mailOptions: SendMailOptions = {
        from: '"SolidApp" <noreply@solidapp.com>',
        to,
        subject: 'Invitación a SolidApp',
        html: `
          <h2>Te invitaron a SolidApp</h2>
          <p>Hacé click en el siguiente enlace para completar tu registro:</p>
          <a href="${inviteLink}">${inviteLink}</a>
          <p>Este enlace expira en 48 horas.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de invitación enviado a ${to}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error al enviar el email de invitación',
      });
    }
  }

  /**
   * Envía una invitación a una entidad (empresa u organización) para que se registre
   *
   * @param to - Correo electrónico del destinatario
   * @param token - Token único para aceptar la invitación
   *
   * @throws {ErrorManager} Si falla el envío del correo
   */
  async sendEntidadInvitationEmail(to: string, token: string): Promise<void> {
    try {
      const inviteLink = `${this.baseUrl}/registro-entidad?token=${token}`;

      const mailOptions: SendMailOptions = {
        from: '"SolidApp" <noreply@solidapp.com>',
        to,
        subject: 'Invitación a registrar tu entidad en SolidApp',
        html: `
          <h2>Te invitaron a unirte a SolidApp</h2>
          <p>Hacé click en el siguiente enlace para registrar tu empresa u organización:</p>
          <a href="${inviteLink}">${inviteLink}</a>
          <p>Este enlace expira en 7 días.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de invitación de entidad enviado a ${to}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      }
      throw new ErrorManager({
        type: 'INTERNAL_SERVER_ERROR',
        message: 'Error al enviar el email de invitación de entidad',
      });
    }
  }
}
