import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Switch the current user's role (e.g. PROFESSIONAL → RECRUITER).
   * Body: { role: 'RECRUITER' }
   * NOTE: ADMIN users cannot change their DB role — switching is UI-only for them.
   */
  @Patch('me/role')
  async switchRole(@Req() req: any, @Body('role') role: string) {
    const allowedRoles: Role[] = [
      Role.PROFESSIONAL,
      Role.RECRUITER,
      Role.FREELANCER,
      Role.STARTUP_FOUNDER,
      Role.INVESTOR,
    ];

    // Admins cannot change their DB role — UI handles preview mode in localStorage
    if (req.user.role === Role.ADMIN) {
      const current = await this.usersService.findById(req.user.userId);
      const { password, ...safeUser } = current as any;
      return safeUser;
    }

    if (!allowedRoles.includes(role as Role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }

    const updated = await this.usersService.update(req.user.userId, {
      role: role as Role,
    });

    // Return the safe user object (no password)
    const { password, ...safeUser } = updated as any;
    return safeUser;
  }
}
