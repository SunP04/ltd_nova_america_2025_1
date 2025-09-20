import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
  user: process.env.SMTP_USER ?? '',
  pass: process.env.SMTP_PASS ?? '',
  from: process.env.MAIL_FROM ?? 'no-reply@example.com',
  secure: process.env.SMTP_SECURE === 'true'
}));
