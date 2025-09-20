import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey } from 'crypto';
import { exportJWK, JWK } from 'jose';

export interface JwksResponse {
  keys: (JWK & { kid?: string; alg?: string; use?: string })[];
}

@Injectable()
export class JwksService {
  private cached?: JwksResponse;

  constructor(private readonly configService: ConfigService) {}

  async getJwks(): Promise<JwksResponse> {
    if (!this.cached) {
      const publicKey = this.configService.get<string>('jwt.publicKey');
      if (!publicKey) {
        throw new Error('JWT public key not configured');
      }

      const kid = this.configService.get<string>('jwt.kid');
      const keyObject = createPublicKey(publicKey);
      const jwk = await exportJWK(keyObject);

      this.cached = {
        keys: [
          {
            ...jwk,
            kid,
            alg: 'RS256',
            use: 'sig'
          }
        ]
      };
    }

    return this.cached;
  }
}
