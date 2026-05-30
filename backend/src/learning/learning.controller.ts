import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCourseDto } from './dto/create-course.dto';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { CreateSkillTestDto } from './dto/create-skill-test.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // ─── Courses ──────────────────────────────────────────────────────────────

  @Post('courses')
  createCourse(@Request() req, @Body() dto: CreateCourseDto) {
    return this.learningService.createCourse(req.user.id, dto);
  }

  @Get('courses')
  getCourses() {
    return this.learningService.getCourses();
  }

  @Get('courses/:id')
  getCourseById(@Param('id') id: string) {
    return this.learningService.getCourseById(id);
  }

  @Post('courses/:id/modules')
  createCourseModule(@Param('id') id: string, @Body() dto: any) {
    return this.learningService.createCourseModule(id, dto);
  }

  @Post('enroll')
  enrollInCourse(@Request() req, @Body() dto: EnrollCourseDto) {
    return this.learningService.enrollInCourse(req.user.id, dto.courseId);
  }

  @Get('my-enrollments')
  getMyEnrollments(@Request() req) {
    return this.learningService.getMyEnrollments(req.user.id);
  }

  @Post('enrollments/:enrollmentId/modules/:moduleId/complete')
  markModuleComplete(
    @Request() req,
    @Param('enrollmentId') enrollmentId: string,
    @Param('moduleId') moduleId: string
  ) {
    return this.learningService.markModuleComplete(req.user.id, enrollmentId, moduleId);
  }

  // ─── Learning Paths ────────────────────────────────────────────────────────

  @Get('paths')
  getLearningPaths() {
    return this.learningService.getLearningPaths();
  }

  @Get('paths/:id')
  getLearningPathById(@Param('id') id: string) {
    return this.learningService.getLearningPathById(id);
  }

  // ─── Skill Tests ──────────────────────────────────────────────────────────

  @Post('skill-tests')
  createSkillTest(@Body() dto: CreateSkillTestDto) {
    return this.learningService.createSkillTest(dto);
  }

  @Get('skill-tests')
  getSkillTests() {
    return this.learningService.getSkillTests();
  }

  @Get('skill-tests/:id')
  getSkillTestById(@Param('id') id: string) {
    return this.learningService.getSkillTestById(id);
  }

  @Post('skill-tests/:id/attempt')
  submitAttempt(@Request() req, @Param('id') id: string, @Body() dto: SubmitAttemptDto) {
    return this.learningService.submitAttempt(req.user.id, id, dto);
  }

  @Get('my-badges')
  getMyBadges(@Request() req) {
    return this.learningService.getMyBadges(req.user.id);
  }

  @Get('my-attempts')
  getMyAttempts(@Request() req) {
    return this.learningService.getMyAttempts(req.user.id);
  }
}
