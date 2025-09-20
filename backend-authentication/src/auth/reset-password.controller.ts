import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResetPasswordService } from './reset-password.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Reset Password')
@Controller('reset-password')
export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Throttle(5, 60)
  @Post('request')
  @ApiOperation({ summary: 'Request a password reset email' })
  async request(@Body() dto: ForgotPasswordDto) {
    await this.resetPasswordService.requestPasswordReset(dto);
    return { success: true };
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a password reset with the provided token' })
  async confirm(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordService.confirmPasswordReset(dto);
    return { success: true };
  }
}
