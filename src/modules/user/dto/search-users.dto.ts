import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Gender } from '../enum/user.enum';

export class SearchUsersQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '검색 키워드', required: false })
  keyword?: string;
}

class userField {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: '프로필 이미지 URL' })
  profileImage: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '성별', enum: Gender })
  gender: string;

  @ApiProperty({ description: '나이' })
  age: number;

  @ApiProperty({ description: '평균타수' })
  avgHitScore: number;
}

export class SearchUsersOutputDto {
  @ApiProperty({ description: '참가자 수' })
  participantCount: number;

  @ApiProperty({ description: '참가자 정보', type: [userField] })
  participants: userField[];
}
