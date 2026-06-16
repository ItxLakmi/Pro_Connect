import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseModuleDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  notesUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
