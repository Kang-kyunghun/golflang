import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Provider } from 'src/modules/auth/enum/account.enum';
import { Gender } from '../enum/user.enum';

export class GetUserDetailOutputDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: '닉네임' })
  @IsOptional()
  nickname: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '성별' })
  @IsOptional()
  gender: Gender;

  @ApiProperty({ description: '나이' })
  @IsOptional()
  birthday: string;

  @ApiProperty({ description: '지역1' })
  @IsOptional()
  addressMain: string;

  @ApiProperty({ description: '지역2' })
  @IsOptional()
  addressDetail: string;

  @ApiProperty({ description: '평균타수' })
  @IsOptional()
  avgHitScore: number;

  @ApiProperty({ description: '매너지수' })
  @IsOptional()
  mannerScore: number;

  @ApiProperty({ description: '프로필 이미지 url' })
  @IsOptional()
  photo: string;

  @ApiProperty({ description: '로긴 provider' })
  @IsOptional()
  provider: Provider;

  @ApiProperty({ description: '현재 임시 비번으로 로그인 했는지 여부' })
  @IsOptional()
  hasTempPassword: boolean;
}
