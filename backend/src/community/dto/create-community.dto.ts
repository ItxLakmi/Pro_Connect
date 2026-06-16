import { IsString, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsIn(['INDUSTRY', 'UNIVERSITY', 'WOMEN_PROFESSIONAL', 'TECH'])
  type: 'INDUSTRY' | 'UNIVERSITY' | 'WOMEN_PROFESSIONAL' | 'TECH';

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
