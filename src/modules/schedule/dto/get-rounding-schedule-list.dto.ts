import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetRoundingScheduleListOutputDto {
  @ApiProperty({ description: 'rounding id' })
  id: number;

  @ApiProperty({ description: '주최자 여부' })
  isHost: boolean;

  @ApiProperty({ description: '라운딩 이름' })
  roundingName: string;

  @ApiProperty({ description: '라운딩 위치' })
  roundingLocation: string;

  @ApiProperty({ description: '라운딩 시작 시간' })
  startTime: Date;

  @ApiProperty({ description: '라운딩 참가자 수' })
  participantCount: number;
}

export class GetRoundingScheduleListQueryDto {
  @IsString()
  @ApiProperty({
    description: '조회하고자 하는 날짜(년월)',
    example: 'YYYY-MM',
  })
  date: string;
}
