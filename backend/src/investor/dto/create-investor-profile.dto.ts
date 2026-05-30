import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateInvestorProfileDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  investmentFocus: string[]; // e.g. ["FinTech", "EdTech"]

  @IsNumber()
  minTicket: number;

  @IsNumber()
  maxTicket: number;

  @IsString()
  @IsOptional()
  portfolioUrl?: string;
}
