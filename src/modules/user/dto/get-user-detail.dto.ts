import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Provider } from 'src/modules/auth/enum/account.enum';
import { User } from '../entity/user.entity';
import { Gender } from '../enum/user.enum';

export class GetUserDetailOutputDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @IsOptional()
  @ApiProperty({ description: '닉네임', required: false })
  nickname: string;

  @ApiProperty({ description: '이메일', required: false })
  email: string;

  @IsOptional()
  @ApiProperty({ description: '성별', required: false })
  gender: Gender;

  @IsOptional()
  @ApiProperty({ description: '나이', required: false })
  birthday: string;

  @IsOptional()
  @ApiProperty({ description: '전화번호', required: false })
  phone: string;

  @IsOptional()
  @ApiProperty({ description: '지역1', required: false })
  addressMain: string;

  @IsOptional()
  @ApiProperty({ description: '지역2', required: false })
  addressDetail: string;

  @IsOptional()
  @ApiProperty({ description: '평균타수', required: false })
  avgHitScore: number;

  @IsOptional()
  @ApiProperty({ description: '매너지수', required: false })
  mannerScore: number;

  @IsOptional()
  @ApiProperty({ description: '프로필 이미지 url', required: false })
  photo: string;

  @IsOptional()
  @ApiProperty({ description: '로긴 provider', required: false })
  provider: Provider;

  constructor(user: User) {
    this.userId = user.id ?? undefined;
    this.nickname = user.nickname ?? undefined;
    this.email = user.account?.email ?? undefined;
    this.gender = user.gender ?? undefined;
    this.birthday = user.birthday ?? undefined;
    this.addressMain = user.addressMain ?? undefined;
    this.addressDetail = user.addressDetail ?? undefined;
    this.avgHitScore = user.userState?.avgHitScore ?? undefined;
    this.mannerScore = user.userState?.mannerScore ?? undefined;
    this.photo = user.profileImage?.url ?? undefined;
    this.provider = user.account?.provider ?? undefined;
    this.phone = user.phone ?? undefined;
  }
}
