import { IsString } from 'class-validator';

export class EnrollCourseDto {
  @IsString()
  courseId: string;
}
