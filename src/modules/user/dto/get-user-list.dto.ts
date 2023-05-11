import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { SortOrderEnum, UserSortField } from 'src/common/enum/sortField.enum';
import { User } from '../entity/user.entity';
import { Gender } from '../enum/user.enum';

export class GetUserListQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '검색 키워드', required: false })
  keyword?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '정렬 기준',
    enum: UserSortField,
    default: 'nickname',
    required: false,
  })
  sortField: UserSortField;

  @IsEnum(SortOrderEnum)
  @IsOptional()
  @ApiProperty({
    description: 'ASC or DESC',
    default: 'ASC',
    required: false,
  })
  sortOrder: SortOrderEnum = SortOrderEnum.ASC;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'offset', default: 0, required: false })
  offset: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'limit', default: 10, required: false })
  limit: number = 10;
}

export class UserOutputDto {
  @IsNumber()
  @ApiProperty({ description: '회원의 유저 id' })
  userId: number;

  @IsNumber()
  @ApiProperty({ description: '프로필 평균 타수' })
  avgHitScore: number;

  @IsString()
  @ApiProperty({ description: '회원 닉네임' })
  nickName: string;

  @IsString()
  @ApiProperty({ description: '회원 email' })
  email: string;

  @IsNumber()
  @ApiProperty({ description: '회원 나이' })
  age: number;

  @IsEnum(Gender)
  @ApiProperty({ description: '회원 성병' })
  gender: Gender;

  @IsNumber()
  @ApiProperty({ description: '회원 프로필 이미지' })
  profileImage: string;

  constructor(user: User) {
    this.userId = user.id;
    this.avgHitScore = user.userState.avgHitScore;
    this.nickName = user.nickname;
    this.email = user.account.email;
    this.age = this.getUserAge(user.birthday);
    this.gender = user.gender;
    this.profileImage = user.profileImage?.url || null;
  }

  private getUserAge(birthday: string) {
    const nowDate = new Date();
    const birthDate = new Date(birthday);

    const nowYear = nowDate.getFullYear();
    const birthYear = birthDate.getFullYear();

    return nowYear - birthYear + 1;
  }
}

export class UserListOutputDto {
  @ApiProperty({ description: '조건에 맞는 총 회원 수' })
  totalUserCount: number;

  @ApiProperty({ description: '회원 목록' })
  users: UserOutputDto[];

  constructor(totalUserCount: number, users: UserOutputDto[]) {
    this.totalUserCount = totalUserCount;
    this.users = users;
  }
}
