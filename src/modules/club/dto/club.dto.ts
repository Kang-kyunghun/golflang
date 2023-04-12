import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';

import { Club } from '../entity/club.entity';
import { UserClub } from 'src/modules/user/entity/user-club.entity';
import { SortOrderEnum } from 'src/common/enum/common.enum';

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
    this.isMember = club.userClubs.some(
      (userClub) => userClub.user.id === userId,
    );
    this.name = club.name;
    this.region = club.region;
    this.memberTotal = club.userClubs.length;
    this.memberProfileImages = this.getProfileImage(club.userClubs);
    this.mennerScore = club.mennerScore;
    this.joinCondition = club.joinCondition;
    this.searchKeyword = club.searchKeyword.split(', ');
    this.introduction = club.introduction;
    this.profileImage = club.profileImage?.url;
  }

  private getProfileImage(clubMembers: UserClub[]) {
    const profileImage = clubMembers.map((clubMember) => {
      return clubMember.user.profileImage?.url;
    });

    return profileImage;
  }
}

export class ClubListOutPutDto {
  @ApiProperty({ description: '조건에 맞는 총 클럽 수' })
  totalClubCount: number;

  @ApiProperty({ description: '클럽 목록' })
  clubs: ClubOutputDto[];

  constructor(totalClubCount: number, clubs: ClubOutputDto[]) {
    this.totalClubCount = totalClubCount;
    this.clubs = clubs;
  }
}

export class GetMyClubListQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '정렬 기준', required: true })
  sortField: string;

  @IsEnum(SortOrderEnum)
  @IsOptional()
  @ApiProperty({ description: 'ASC or DESC', required: true })
  sortOrder: SortOrderEnum = SortOrderEnum.ASC;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'offset', required: true })
  offset: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'limit', required: true })
  limit: number = 10;
}
