export class CreateCommunityDto {
  name: string;
  description: string;
  type: 'INDUSTRY' | 'UNIVERSITY' | 'WOMEN_PROFESSIONAL' | 'TECH';
  category: string;
  coverImage?: string;
  isPrivate?: boolean;
}
