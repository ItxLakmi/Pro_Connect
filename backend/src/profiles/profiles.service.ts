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
        profileSkills: {
          include: {
            endorsements: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
              },
            },
          },
        },
        experience: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startDate: 'desc' } },
        projects: {
          include: { media: true },
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true, firstName: true, lastName: true, email: true,
            avatar: true, createdAt: true, role: true, company: true,
          },
        },
      },
    });

    if (!profile) {
      return this.prisma.profile.create({
        data: { userId },
        include: {
          skills: true,
          profileSkills: { include: { endorsements: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } } },
          experience: true,
          education: true,
          projects: { include: { media: true } },
        },
      });
    }

    return profile;
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query) return [];
    const searchTerms = query.split(' ').filter(Boolean);
    
    return this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        AND: searchTerms.map(term => ({
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { profile: { headline: { contains: term, mode: 'insensitive' } } },
          ]
        }))
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        profile: { select: { headline: true, location: true } },
      },
      take: 50,
    });
  }

  async updateCompany(userId: string, companyData: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { company: true } });
    if (!user) throw new NotFoundException('User not found');

    // Pick only fields that exist in Company model
    const { name, logo, website, description, industry, size, location } = companyData;
    const safeData: any = {};
    if (name !== undefined) safeData.name = name;
    if (logo !== undefined) safeData.logo = logo;
    if (website !== undefined) safeData.website = website;
    if (description !== undefined) safeData.description = description;
    if (industry !== undefined) safeData.industry = industry;
    // size and location require DB migration - store gracefully if columns exist
    try {
      if (size !== undefined) safeData.size = size;
      if (location !== undefined) safeData.location = location;
    } catch (_) {}

    if (user.companyId) {
      return this.prisma.company.update({ where: { id: user.companyId }, data: safeData });
    } else {
      const company = await this.prisma.company.create({ data: { name: safeData.name || 'My Company', ...safeData } });
      await this.prisma.user.update({ where: { id: userId }, data: { companyId: company.id } });
      return company;
    }
  }

  async update(userId: string, updateData: any) {
    const { skills, experience, education, avatar, ...profileData } = updateData;

    if (avatar !== undefined) {
      await this.prisma.user.update({ where: { id: userId }, data: { avatar } });
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...profileData,
        skills: skills
          ? {
              set: [],
              connectOrCreate: skills.map((skillName: string) => ({
                where: { name: skillName },
                create: { name: skillName },
              })),
            }
          : undefined,
      },
      include: {
        skills: true,
        profileSkills: { include: { endorsements: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } } },
        experience: true,
        education: true,
        projects: { include: { media: true } },
      },
    });
  }

  async addExperience(userId: string, experienceData: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.experience.create({ data: { ...experienceData, profileId: profile.id } });
  }

  async addEducation(userId: string, educationData: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.education.create({ data: { ...educationData, profileId: profile.id } });
  }

  // ─── Profile Skills (with Percentages) ───────────────────────────────────

  async addProfileSkill(userId: string, skillName: string, percentage: number) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.profileSkill.upsert({
      where: { profileId_skillName: { profileId: profile.id, skillName } },
      create: { profileId: profile.id, skillName, percentage },
      update: { percentage },
      include: { endorsements: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } },
    });
  }

  async updateProfileSkill(userId: string, skillId: string, percentage: number) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.profileSkill.update({
      where: { id: skillId },
      data: { percentage },
      include: { endorsements: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } },
    });
  }

  async removeProfileSkill(userId: string, skillId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.profileSkill.delete({ where: { id: skillId } });
  }

  async endorseSkill(endorserId: string, skillId: string) {
    return this.prisma.skillEndorsement.upsert({
      where: { profileSkillId_userId: { profileSkillId: skillId, userId: endorserId } },
      create: { profileSkillId: skillId, userId: endorserId },
      update: {},
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async unendorseSkill(endorserId: string, skillId: string) {
    try {
      return await this.prisma.skillEndorsement.delete({
        where: { profileSkillId_userId: { profileSkillId: skillId, userId: endorserId } },
      });
    } catch {
      return { message: 'Not endorsed' };
    }
  }

  // ─── Portfolio Projects ────────────────────────────────────────────────────

  async addProject(userId: string, data: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const { media, ...projectData } = data;

    return this.prisma.portfolioProject.create({
      data: {
        ...projectData,
        profileId: profile.id,
        media: media ? {
          create: media.map((m: any) => ({ url: m.url, type: m.type })),
        } : undefined,
      },
      include: { media: true },
    });
  }

  async updateProject(userId: string, projectId: string, data: any) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const { media, ...projectData } = data;

    return this.prisma.portfolioProject.update({
      where: { id: projectId },
      data: { ...projectData },
      include: { media: true },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.portfolioProject.delete({ where: { id: projectId } });
  }
}
