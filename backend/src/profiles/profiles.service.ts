import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: true,
        experience: true,
        education: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!profile) {
      // Create an empty profile if it doesn't exist
      return this.prisma.profile.create({
        data: { userId },
        include: {
          skills: true,
          experience: true,
          education: true,
        },
      });
    }

    return profile;
  }

  async update(userId: string, updateData: any) {
    const { skills, experience, education, ...profileData } = updateData;

    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...profileData,
        // Handling skills (many-to-many)
        skills: skills ? {
          set: [], // Clear existing
          connectOrCreate: skills.map((skillName: string) => ({
            where: { name: skillName },
            create: { name: skillName },
          })),
        } : undefined,
      },
      include: {
        skills: true,
        experience: true,
        education: true,
      },
    });
  }

  async addExperience(userId: string, experienceData: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.experience.create({
      data: {
        ...experienceData,
        profileId: profile.id,
      },
    });
  }

  async addEducation(userId: string, educationData: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.education.create({
      data: {
        ...educationData,
        profileId: profile.id,
      },
    });
  }
}
