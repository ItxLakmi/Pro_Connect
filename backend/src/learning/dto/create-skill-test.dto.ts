import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSkillTestQuestionDto {
  @IsString()
  question: string;

  @IsArray()
  options: string[]; // exactly 4 options

  @IsInt()
  @Min(0)
  @Max(3)
  correctIndex: number;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateSkillTestDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  skillTag: string;

  @IsInt()
  @IsOptional()
  timeLimitMin?: number;

  @IsInt()
  @IsOptional()
  passingScore?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillTestQuestionDto)
  questions: CreateSkillTestQuestionDto[];
}
