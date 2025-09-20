import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

interface PasswordResetMailOptions {
  to: string;
  name: string;
  resetUrl: string;
}

interface EmailVerificationOptions {
  to: string;
  name: string;
  verificationUrl: string;
}

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const secure = this.configService.get<boolean>('mail.secure', false);
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    const auth = user ? { user, pass } : undefined;

    this.transporter = createTransport({ host, port, secure, auth });
    this.fromAddress = this.configService.get<string>('mail.from', 'no-reply@example.com');
  }

  async sendPasswordReset(options: PasswordResetMailOptions): Promise<void> {
    const subject = 'Password reset request';
    const text = `Hello ${options.name},\n\nYou requested a password reset. Use the link below to set a new password.\n\n${options.resetUrl}\n\nIf you did not request this, you can ignore this email.\n`;
    const html = `
      <p>Hello ${options.name},</p>
      <p>You requested a password reset. Use the link below to set a new password.</p>
      <p><a href="${options.resetUrl}">Reset password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    await this.transporter.sendMail({
      to: options.to,
      from: this.fromAddress,
      subject,
      text,
      html
    });
  }

  async sendEmailVerification(options: EmailVerificationOptions): Promise<void> {
    const subject = 'Verify your email address';
    const text = `Hello ${options.name},\n\nPlease confirm your email address by using the link below.\n\n${options.verificationUrl}\n\nIf you did not create an account, you can ignore this email.\n`;
    const html = `
      <p>Hello ${options.name},</p>
      <p>Please confirm your email address by using the link below.</p>
      <p><a href="${options.verificationUrl}">Verify email</a></p>
      <p>If you did not create an account, you can ignore this email.</p>
    `;

    await this.transporter.sendMail({
      to: options.to,
      from: this.fromAddress,
      subject,
      text,
      html
    });
  }
}
