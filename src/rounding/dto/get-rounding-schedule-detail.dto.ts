import { PartialType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { GetRoundingScheduleListOutputDto } from './get-rounding-schedule-list.dto';

export class GetRoundingScheduleDetailOutputDto extends PartialType(
  PickType(GetRoundingScheduleListOutputDto, [
    'id',
    'location',
    'startTime',
    'participantCount',
  ]),
) {
  @ApiProperty({ description: '라운딩 장소' })
  place: string;

  @ApiProperty({ description: '메모' })
  memo: string;

  @ApiProperty({ description: '최대 참여자 수' })
  maxParticipant: number;

  @ApiProperty({ description: '참가자 프로필 이미지 URL' })
  participantsProfileImage: string[];
}
