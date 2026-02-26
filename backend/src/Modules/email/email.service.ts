import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail' as const,
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const resetLink = `http://localhost:3000/restaurar-contrasena?token=${token}`;

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
  }
}
