import { ApiProperty } from '@nestjs/swagger';

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
