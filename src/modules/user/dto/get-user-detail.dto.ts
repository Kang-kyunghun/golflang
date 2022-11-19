import { ApiProperty } from '@nestjs/swagger';

export class GetUserDetailOutputDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '성별' })
  gender: string;

  @ApiProperty({ description: '나이' })
  age: number;

  @ApiProperty({ description: '지역' })
  city: string;

  @ApiProperty({ description: '평균타수' })
  avgHitScore: number;

  @ApiProperty({ description: '매너지수' })
  mannerScore: number;
}
