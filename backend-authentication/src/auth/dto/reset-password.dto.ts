import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token received via e-mail', example: 'id.token' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ minLength: 8, example: 'NewStrongPass123!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
