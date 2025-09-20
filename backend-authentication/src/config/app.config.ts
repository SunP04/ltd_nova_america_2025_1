import { registerAs } from '@nestjs/config';

const parseOrigins = (value?: string) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

export default registerAs('app', () => {
  const corsOrigins = parseOrigins(process.env.CORS_ORIGINS);

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    corsOrigins,
    frontendUrl: process.env.FRONTEND_URL ?? '',
    passwordResetTtl: parseInt(process.env.PASSWORD_RESET_TTL ?? '900', 10),
    verificationTokenTtl: parseInt(process.env.VERIFICATION_TOKEN_TTL ?? '86400', 10),
    twoFactorIssuer: process.env.TWO_FACTOR_ISSUER ?? 'Auth Service'
  };
});
