import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Profile, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        profile: {
          create: {}, // Initialize an empty profile for new users
        },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateProfile(userId: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });
  }

  async update(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
