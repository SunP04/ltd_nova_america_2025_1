import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ description: 'Refresh token to revoke' })
  @IsString()
  @IsJWT()
  refreshToken!: string;
}
