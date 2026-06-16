import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateSkillTestDto } from './dto/create-skill-test.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  // ─── Courses ──────────────────────────────────────────────────────────────

  async createCourse(instructorId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        ...dto,
        instructorId,
      },
    });
  }

  async getCourses() {
    return this.prisma.course.findMany({
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        modules: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async createCourseModule(courseId: string, instructorId: string, dto: any, userRole?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the course instructor or an admin can add modules');
    }
    // Auto-assign order = next index
    const count = await this.prisma.courseModule.count({ where: { courseId } });
    return this.prisma.courseModule.create({
      data: {
        ...dto,
        order: dto.order ?? count,
        courseId,
      },
    });
  }

  async updateCourse(userId: string, role: string, courseId: string, dto: any) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Not authorized to edit this course');
    }
    return this.prisma.course.update({
      where: { id: courseId },
      data: dto,
    });
  }

  async deleteCourse(userId: string, role: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Not authorized to delete this course');
    }
    return this.prisma.course.delete({
      where: { id: courseId },
    });
  }

  async enrollInCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.instructorId === userId) {
      throw new ForbiddenException('Instructors cannot enroll in their own courses.');
    }
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      throw new ConflictException('You are already enrolled in this course.');
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  }

  async getMyEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        moduleProgress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseEnrollment(userId: string, courseId: string) {
    return this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        moduleProgress: true,
      },
    });
  }

  // ─── Module Progress Tracking ──────────────────────────────────────────────

  async markModuleComplete(userId: string, enrollmentId: string, moduleId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: { include: { modules: true } },
      },
    });

    if (!enrollment || enrollment.userId !== userId) {
      throw new NotFoundException('Enrollment not found or unauthorized');
    }

    await this.prisma.moduleProgress.upsert({
      where: { enrollmentId_moduleId: { enrollmentId, moduleId } },
      update: { completed: true, completedAt: new Date() },
      create: { enrollmentId, moduleId, completed: true, completedAt: new Date() },
    });

    const totalModules = enrollment.course.modules.length;
    if (totalModules === 0) return enrollment;

    const completedModules = await this.prisma.moduleProgress.count({
      where: { enrollmentId, completed: true },
    });

    const progress = Math.round((completedModules / totalModules) * 100);
    const status = progress === 100 ? 'COMPLETED' : 'IN_PROGRESS';

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { progress, status },
      include: { moduleProgress: true }
    });
  }

  // ─── Learning Paths ────────────────────────────────────────────────────────

  async getLearningPaths() {
    return this.prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLearningPathById(id: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            course: {
              include: {
                instructor: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!path) throw new NotFoundException('Learning path not found');
    return path;
  }

  // ─── Skill Tests ──────────────────────────────────────────────────────────

  async createSkillTest(dto: CreateSkillTestDto) {
    const { questions, ...testData } = dto;
    return this.prisma.skillTest.create({
      data: {
        ...testData,
        questions: {
          create: questions.map((q, i) => ({ ...q, order: q.order ?? i })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async getSkillTests() {
    return this.prisma.skillTest.findMany({
      include: {
        _count: { select: { questions: true, attempts: true, badges: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSkillTestById(id: string) {
    const test = await this.prisma.skillTest.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            // correctIndex intentionally excluded — hidden from client during test
          },
        },
        _count: { select: { attempts: true, badges: true } },
      },
    });
    if (!test) throw new NotFoundException('Skill test not found');
    return test;
  }

  async submitAttempt(userId: string, skillTestId: string, dto: SubmitAttemptDto) {
    // Load full test with correct answers
    const test = await this.prisma.skillTest.findUnique({
      where: { id: skillTestId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!test) throw new NotFoundException('Skill test not found');

    const { answers } = dto;
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });

    const score = Math.round((correct / test.questions.length) * 100);
    const passed = score >= test.passingScore;

    // Save attempt
    const attempt = await this.prisma.skillTestAttempt.create({
      data: {
        userId,
        skillTestId,
        score,
        passed,
        answers,
      },
    });

    // Award badge if passed (upsert to avoid duplicates)
    let badge = null;
    if (passed) {
      badge = await this.prisma.skillBadge.upsert({
        where: { userId_skillTestId: { userId, skillTestId } },
        update: {},
        create: { userId, skillTestId },
      });
    }

    return {
      ...attempt,
      totalQuestions: test.questions.length,
      correctAnswers: correct,
      passingScore: test.passingScore,
      badge,
    };
  }

  async getMyBadges(userId: string) {
    return this.prisma.skillBadge.findMany({
      where: { userId },
      include: {
        skillTest: {
          select: { id: true, title: true, skillTag: true },
        },
      },
      orderBy: { awardedAt: 'desc' },
    });
  }

  async getMyAttempts(userId: string) {
    return this.prisma.skillTestAttempt.findMany({
      where: { userId },
      include: {
        skillTest: { select: { id: true, title: true, skillTag: true, passingScore: true } },
      },
      orderBy: { completedAt: 'desc' },
    });
  }
}
