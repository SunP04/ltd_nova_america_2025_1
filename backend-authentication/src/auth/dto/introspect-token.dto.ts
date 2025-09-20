import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class IntrospectTokenDto {
  @ApiProperty({ description: 'Access or refresh token to introspect' })
  @IsString()
  @IsJWT()
  token!: string;
}
