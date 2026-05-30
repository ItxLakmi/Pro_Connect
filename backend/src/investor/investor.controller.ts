import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStartupDto } from './dto/create-startup.dto';
import { CreateInvestorProfileDto } from './dto/create-investor-profile.dto';
import { ConnectRequestDto } from './dto/connect-request.dto';

@Controller('investor')
@UseGuards(JwtAuthGuard)
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  // ─── Startups ──────────────────────────────────────────────────────────

  @Post('startup')
  upsertStartup(@Request() req, @Body() dto: CreateStartupDto) {
    return this.investorService.upsertStartup(req.user.id, dto);
  }

  @Get('startups')
  getStartups(@Query('industry') industry?: string, @Query('stage') stage?: string) {
    return this.investorService.getStartups(industry, stage);
  }

  @Get('startups/me')
  getMyStartup(@Request() req) {
    return this.investorService.getMyStartup(req.user.id);
  }

  @Get('startups/:id')
  getStartupById(@Param('id') id: string) {
    return this.investorService.getStartupById(id);
  }

  // ─── Investor Profiles ──────────────────────────────────────────────────

  @Post('profile')
  upsertInvestorProfile(@Request() req, @Body() dto: CreateInvestorProfileDto) {
    return this.investorService.upsertInvestorProfile(req.user.id, dto);
  }

  @Get('investors')
  getInvestors() {
    return this.investorService.getInvestors();
  }

  @Get('profile/me')
  getMyInvestorProfile(@Request() req) {
    return this.investorService.getMyInvestorProfile(req.user.id);
  }

  @Get('matches')
  getInvestorMatches(@Request() req) {
    return this.investorService.getInvestorMatches(req.user.id);
  }

  // ─── Connections ────────────────────────────────────────────────────────

  @Post('connect')
  sendConnection(@Request() req, @Body() dto: ConnectRequestDto) {
    return this.investorService.sendConnection(req.user.id, dto);
  }

  @Get('connections')
  getMyConnections(@Request() req) {
    return this.investorService.getMyConnections(req.user.id);
  }

  @Patch('connections/:id')
  updateConnectionStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.investorService.updateConnectionStatus(id, status);
  }
}
