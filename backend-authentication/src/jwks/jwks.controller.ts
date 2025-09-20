import { Controller, Get } from '@nestjs/common';
import { JwksService, JwksResponse } from './jwks.service';

@Controller('.well-known')
export class JwksController {
  constructor(private readonly jwksService: JwksService) {}

  @Get('jwks.json')
  getJwks(): Promise<JwksResponse> {
    return this.jwksService.getJwks();
  }
}
