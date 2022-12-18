import { PartialType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { GetRoundingScheduleListTwoOutputDto } from './get-rounding-schedule2-list.dto';

export class GetRoundingScheduleDetailOutputDto {
  @ApiProperty({ description: 'Schedule id' })
  id: number;

  @ApiProperty({ description: '라운딩 이름' })
  roundingName: string;

  @ApiProperty({ description: '라운딩 위치' })
  roundingLocation: string;

  @ApiProperty({ description: '라운딩 시간' })
  startTime: Date;

  @ApiProperty({ description: '참여자 수' })
  participantCount;

  @ApiProperty({ description: '라운딩 장소' })
  roundingPlace: string;

  @ApiProperty({ description: '메모' })
  memo: string;

  @ApiProperty({ description: '최대 참여자 수' })
  maxParticipant: number;

  @ApiProperty({ description: '참가자 프로필 이미지 URL' })
  participantsProfileImage: string[];
}
