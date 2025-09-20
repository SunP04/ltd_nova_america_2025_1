import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'StrongPass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: [String], example: ['i1', 'i2'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  institutions!: string[];

  @ApiProperty({ type: [String], required: false, example: ['user'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
