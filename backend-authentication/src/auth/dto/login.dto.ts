import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Username or e-mail' })
  @IsString()
  @MinLength(3)
  identifier!: string;

  @ApiProperty({ example: 'admin', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: '123456', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  twoFactorCode?: string;
}
