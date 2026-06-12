import { Controller, Get, Patch, Post, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.adminService.updateUserRole(id, role);
  }

  @Post('users')
  createUser(@Body() body: { firstName: string; lastName: string; email: string; password: string; role: string }) {
    return this.adminService.createUser(body);
  }

  @Get('profiles')
  getProfiles() {
    return this.adminService.getProfiles();
  }

  @Get('jobs')
  getJobs() {
    return this.adminService.getJobs();
  }

  @Patch('jobs/:id/status')
  updateJobStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateJobStatus(id, status);
  }

  @Post('jobs')
  createJob(@Body() body: { title: string; description: string; location: string; type: string; postedById: string }) {
    return this.adminService.createJob(body);
  }

  @Get('courses')
  getCourses() {
    return this.adminService.getCourses();
  }

  @Patch('courses/:id/status')
  updateCourseStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateCourseStatus(id, status);
  }

  @Post('courses')
  createCourse(@Body() body: { title: string; description: string; price: number; level: string; instructorId: string }) {
    return this.adminService.createCourse(body);
  }

  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  @Get('advertisements')
  getAdvertisements() {
    return this.adminService.getAdvertisements();
  }

  @Post('advertisements')
  createAdvertisement(@Body() body: { title: string; description?: string; imageUrl: string; targetUrl: string; startDate?: string; endDate?: string }) {
    return this.adminService.createAdvertisement(body);
  }

  @Patch('advertisements/:id/toggle')
  toggleAdvertisement(@Param('id') id: string, @Body('active') active: boolean) {
    return this.adminService.toggleAdvertisement(id, active);
  }

  // ── Subscription Plans ────────────────────────────────────────────────────

  @Get('subscription-plans')
  getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  @Post('subscription-plans')
  createSubscriptionPlan(@Body() body: { name: string; price: number; billingCycle: string; features: string[] }) {
    return this.adminService.createSubscriptionPlan(body);
  }

  @Patch('subscription-plans/:id/toggle')
  toggleSubscriptionPlan(@Param('id') id: string, @Body('active') active: boolean) {
    return this.adminService.toggleSubscriptionPlan(id, active);
  }

  @Patch('subscription-plans/:id')
  updateSubscriptionPlan(
    @Param('id') id: string,
    @Body() body: { name: string; price: number; billingCycle: string; features: string[] }
  ) {
    return this.adminService.updateSubscriptionPlan(id, body);
  }

  // ── User Subscriptions ────────────────────────────────────────────────────

  @Get('user-subscriptions')
  getAllUserSubscriptions() {
    return this.adminService.getAllUserSubscriptions();
  }

  @Patch('user-subscriptions/:id')
  updateUserSubscription(
    @Param('id') id: string,
    @Body() body: { status?: string; endDate?: string }
  ) {
    return this.adminService.updateUserSubscription(id, body);
  }

  @Delete('user-subscriptions/:id')
  deleteUserSubscription(@Param('id') id: string) {
    return this.adminService.deleteUserSubscription(id);
  }
}
