import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';

import { User } from 'src/modules/user/entity/user.entity';
import { Gender } from 'src/modules/user/enum/user.enum';
import { SortOrderEnum } from 'src/common/enum/common.enum';

export class ClubMemberOutPutDto {
  @IsNumber()
  @ApiProperty({ description: '맴버의 유저 id' })
  userId: number;

  @IsNumber()
  @ApiProperty({ description: '클럽 인정 타수' })
  clubHitScore: number;

  @IsString()
  @ApiProperty({ description: '맴버 닉네임' })
  nickName: string;

  @IsNumber()
  @ApiProperty({ description: '맴버 나이' })
  age: number;

  @IsEnum(Gender)
  @ApiProperty({ description: '맴버 성별' })
  gender: Gender;

  @IsNumber()
  @ApiProperty({ description: '맴버 프로필 이미지' })
  profileImage: string;

  constructor(member: User) {
    this.userId = member.id;
    this.clubHitScore = member.userClubs[0].clubHitScore;
    this.nickName = member.nickname;
    this.age = this.getMemberAge(member.birthday);
    this.gender = member.gender;
    this.profileImage = member.profileImage?.url || null;
  }

  private getMemberAge(birthday: string) {
    const nowDate = new Date();
    const birthDate = new Date(birthday);

    const nowYear = nowDate.getFullYear();
    const birthYear = birthDate.getFullYear();

    return nowYear - birthYear + 1;
  }
}

export class ClubMemberListOutPutDto {
  @ApiProperty({ description: '조건에 맞는 총 맴버 수' })
  totalMemberCount: number;

  @ApiProperty({ description: '클럽 맴버 목록' })
  clubMembers: ClubMemberOutPutDto[];

  constructor(totalMemberCount: number, clubMembers: ClubMemberOutPutDto[]) {
    this.totalMemberCount = totalMemberCount;
    this.clubMembers = clubMembers;
  }
}

export class GetClubMemberListQueryDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: '최소 나이',
    example: '1',
    default: '1',
  })
  minAge: number = 0;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: '최대 나이',
    example: '100',
    default: '100',
  })
  maxAge: number = 100;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: '최저 클럽 인정 타수',
    example: '0',
    default: '0',
  })
  minHitScore: number = 0;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: '최고 클럽 인정 타수',
    example: '200',
    default: '200',
  })
  maxHitScore: number = 200;

  @IsOptional()
  @ApiProperty({ description: '성별', enum: Gender })
  gender: string;

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
