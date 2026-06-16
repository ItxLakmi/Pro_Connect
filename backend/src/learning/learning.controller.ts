import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    return this.learningService.createCourse(req.user.userId, dto);
  }

  @Get('courses')
  getCourses() {
    return this.learningService.getCourses();
  }

  @Get('courses/:id')
  getCourseById(@Param('id') id: string) {
    return this.learningService.getCourseById(id);
  }

  @Get('courses/:id/enrollment')
  getCourseEnrollment(@Request() req, @Param('id') id: string) {
    return this.learningService.getCourseEnrollment(req.user.userId, id);
  }

  @Post('courses/:id/modules')
  createCourseModule(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.learningService.createCourseModule(id, req.user.userId, dto, req.user.role);
  }

  @Put('courses/:id')
  updateCourse(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.learningService.updateCourse(req.user.userId, req.user.role, id, dto);
  }

  @Delete('courses/:id')
  deleteCourse(@Request() req, @Param('id') id: string) {
    return this.learningService.deleteCourse(req.user.userId, req.user.role, id);
  }

  @Post('enroll')
  enrollInCourse(@Request() req, @Body() dto: EnrollCourseDto) {
    return this.learningService.enrollInCourse(req.user.userId, dto.courseId);
  }

  @Get('my-enrollments')
  getMyEnrollments(@Request() req) {
    return this.learningService.getMyEnrollments(req.user.userId);
  }

  @Post('enrollments/:enrollmentId/modules/:moduleId/complete')
  markModuleComplete(
    @Request() req,
    @Param('enrollmentId') enrollmentId: string,
    @Param('moduleId') moduleId: string
  ) {
    return this.learningService.markModuleComplete(req.user.userId, enrollmentId, moduleId);
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
    return this.learningService.submitAttempt(req.user.userId, id, dto);
  }

  @Get('my-badges')
  getMyBadges(@Request() req) {
    return this.learningService.getMyBadges(req.user.userId);
  }

  @Get('badges/:userId')
  getUserBadges(@Param('userId') userId: string) {
    return this.learningService.getMyBadges(userId);
  }

  @Get('my-attempts')
  getMyAttempts(@Request() req) {
    return this.learningService.getMyAttempts(req.user.userId);
  }
}
