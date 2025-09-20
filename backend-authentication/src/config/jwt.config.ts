import { registerAs } from '@nestjs/config';

const normalizeKey = (value?: string) => value?.replace(/\\n/g, '\n');

export default registerAs('jwt', () => ({
  privateKey: normalizeKey(process.env.JWT_PRIVATE_KEY) ?? '',
  publicKey: normalizeKey(process.env.JWT_PUBLIC_KEY) ?? '',
  kid: process.env.JWT_KID ?? '',
  issuer: process.env.JWT_ISS ?? 'auth.example',
  audience: process.env.JWT_AUD ?? 'apps.example',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '900s',
  refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d'
}));
