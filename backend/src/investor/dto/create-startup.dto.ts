import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateStartupDto {
  @IsString()
  name: string;

  @IsString()
  tagline: string;

  @IsString()
  description: string;

  @IsString()
  industry: string;

  @IsString()
  fundingStage: string; // IDEA | PRE_SEED | SEED | SERIES_A | SERIES_B

  @IsNumber()
  amountSeeking: number;

  @IsNumber()
  equity: number;

  @IsString()
  @IsOptional()
  pitchDeckUrl?: string;

  @IsString()
  @IsOptional()
  website?: string;
}
