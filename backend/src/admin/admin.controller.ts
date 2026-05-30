import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
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

  @Get('courses')
  getCourses() {
    return this.adminService.getCourses();
  }

  @Patch('courses/:id/status')
  updateCourseStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateCourseStatus(id, status);
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
  createAdvertisement(@Body() body: { title: string; imageUrl: string; targetUrl: string }) {
    return this.adminService.createAdvertisement(body);
  }

  @Patch('advertisements/:id/toggle')
  toggleAdvertisement(@Param('id') id: string, @Body('active') active: boolean) {
    return this.adminService.toggleAdvertisement(id, active);
  }
}
