import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ type: [String] })
  institutions!: string[];

  @ApiProperty()
  twoFactorEnabled!: boolean;

  @ApiProperty()
  isEmailVerified!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
