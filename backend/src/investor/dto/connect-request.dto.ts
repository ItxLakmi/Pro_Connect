import { IsString, IsOptional } from 'class-validator';

export class ConnectRequestDto {
  @IsString()
  startupId: string;

  @IsString()
  toUserId: string;

  @IsString()
  @IsOptional()
  message?: string;
}
