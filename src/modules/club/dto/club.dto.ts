import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';

import { Club } from '../entity/club.entity';
import { User } from 'src/modules/user/entity/user.entity';

export class ClubOutputDto {
  @ApiProperty({ description: '클럽 id' })
  id: number;

  @IsObject()
  @ApiProperty({ description: '클럽장 정보' })
  host: object;

  @IsBoolean()
  @ApiProperty({ description: '클럽장 여부' })
  isHost: boolean;

  @IsBoolean()
  @ApiProperty({ description: '클럽 회원 여부' })
  isMember: boolean;

  @IsString()
  @ApiProperty({ description: '클럽명' })
  name: string;

  @IsString()
  @ApiProperty({ description: '주 활동지역' })
  region: string;

  @IsNumber()
  @ApiProperty({ description: '클럽 현재 인원 수' })
  memberTotal: number;

  @IsArray()
  @ApiProperty({ description: '클럽 회원 프로필 이미지 목록' })
  memberProfileImages: string[];

  @IsNumber()
  @ApiProperty({ description: '클럽 매너 점수' })
  mennerScore: number;

  @IsString()
  @ApiProperty({ description: '가입조건' })
  joinCondition: string;

  @IsArray()
  @ApiProperty({ description: '키워드' })
  searchKeyword: string[];

  @IsString()
  @ApiProperty({ description: '클럽소개' })
  introduction: string;

  @IsString()
  @ApiProperty({ description: '클럽 대표 이미지' })
  profileImage: string;

  constructor(club: Club, userId: number) {
    this.id = club.id;
    this.host = {
      id: club.host?.id,
      nickname: club.host?.nickname,
      profileImage: club.host?.profileImage?.url,
    };
    this.isHost = club.host?.id === userId;
    this.isMember = club.users.some((user) => user.id === userId);
    this.name = club.name;
    this.region = club.region;
    this.memberTotal = club.users.length;
    this.memberProfileImages = this.getProfileImage(club.users);
    this.mennerScore = club.mennerScore;
    this.joinCondition = club.joinCondition;
    this.searchKeyword = club.searchKeyword;
    this.introduction = club.introduction;
    this.profileImage = club.profileImage?.url;
  }

  private getProfileImage(members: User[]) {
    const profileImage = members.map((member) => {
      return member.profileImage?.url;
    });

    return profileImage;
  }
}
