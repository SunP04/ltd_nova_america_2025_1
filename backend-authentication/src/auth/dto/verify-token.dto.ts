import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ description: 'Token received via e-mail', example: 'id.token' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
