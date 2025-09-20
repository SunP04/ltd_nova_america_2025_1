import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerificationTokenService } from './verification-token.service';
import { RequestVerificationTokenDto } from './dto/request-verification-token.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@ApiTags('Verification Token')
@Controller('verification-token')
export class VerificationTokenController {
  constructor(private readonly verificationTokenService: VerificationTokenService) {}

  @Throttle(5, 60)
  @Post('request')
  @ApiOperation({ summary: 'Send a new email verification token' })
  async request(@Body() dto: RequestVerificationTokenDto) {
    await this.verificationTokenService.requestEmailVerification(dto.email);
    return { success: true };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify e-mail ownership using the received token' })
  async verify(@Body() dto: VerifyTokenDto) {
    await this.verificationTokenService.verifyEmailToken(dto.token);
    return { success: true };
  }
}
