import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { IntrospectTokenDto } from './dto/introspect-token.dto';
import { LoginDto } from './dto/login.dto';
import { TwoFactorCodeDto } from './dto/two-factor-code.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and issue tokens' })
  @ApiCreatedResponse({ description: 'User created', type: TokenPairDto })
  async register(@Body() dto: RegisterDto): Promise<TokenPairDto> {
    return this.authService.register(dto);
  }

  @Throttle(60, 60)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiOkResponse({ description: 'Authentication successful', type: TokenPairDto })
  async login(@Req() request: Request, @Body() body: LoginDto): Promise<TokenPairDto> {
    return this.authService.login(request.user as User, body.twoFactorCode);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Issue new token pair from refresh token' })
  @ApiOkResponse({ description: 'New token pair', type: TokenPairDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPairDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiOkResponse({ description: 'Refresh token revoked' })
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Return authenticated user profile' })
  @ApiOkResponse({ description: 'Authenticated profile', type: UserProfileDto })
  async me(@CurrentUser() user: UserProfileDto) {
    return user;
  }

  @Throttle(60, 60)
  @Post('introspect')
  @ApiOperation({ summary: 'Validate and introspect a token' })
  @ApiOkResponse({ description: 'Token introspection result' })
  async introspect(@Body() dto: IntrospectTokenDto) {
    return this.authService.introspect(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/setup')
  @ApiOperation({ summary: 'Generate a new Google Authenticator secret' })
  @ApiOkResponse({ description: 'Secret and otpauth URL generated', schema: { properties: { secret: { type: 'string' }, otpauthUrl: { type: 'string' } } } })
  async setupTwoFactor(@CurrentUser() user: UserProfileDto) {
    return this.authService.generateTwoFactorSecret(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiOkResponse({ description: 'Two-factor enabled' })
  async enableTwoFactor(@CurrentUser() user: UserProfileDto, @Body() dto: TwoFactorCodeDto) {
    await this.authService.enableTwoFactor(user.id, dto.code);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiOkResponse({ description: 'Two-factor disabled' })
  async disableTwoFactor(@CurrentUser() user: UserProfileDto, @Body() dto: TwoFactorCodeDto) {
    await this.authService.disableTwoFactor(user.id, dto.code);
    return { success: true };
  }
}
