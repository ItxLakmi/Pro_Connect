import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(userData: any) {
    const existingUser = await this.usersService.findOne(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      emailVerificationToken,
    });

    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    return this.login(user);
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      // Don't leak whether user exists, just return success
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1); // 1 hour expiration

    await this.usersService.update(user.id, {
      resetPasswordToken,
      resetPasswordExpires,
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetPasswordToken);

    return { message: 'Password reset link sent to your email.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetPasswordToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password has been reset successfully.' };
  }
}
