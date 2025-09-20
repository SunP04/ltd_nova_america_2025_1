import { ApiProperty } from '@nestjs/swagger';

export class TokenPairDto {
  @ApiProperty({ description: 'JWT de acesso com RS256', example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ description: 'Refresh token assinado', example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;
}
