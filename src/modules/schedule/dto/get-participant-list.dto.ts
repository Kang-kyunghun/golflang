import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/modules/user/enum/user.enum';

class userField {
  @ApiProperty({ description: '프로필 이미지 URL' })
  profileImage: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '성별', enum: Gender })
  gender: string;

  @ApiProperty({ description: '나이' })
  age: number;

  @ApiProperty({ description: '평균타수' })
  avgHitScore: number;
}

export class GetRoundingAcceptParticipantListOutputDto {
  @ApiProperty({ description: '확정 참가자 수' })
  confirmParticipantCount: number;

  @ApiProperty({ description: '참가자 정보', type: [userField] })
  users: userField[];
}

class PendingField {
  @ApiProperty({ description: '초대 진행중인 유저 수' })
  count: number;

  @ApiProperty({ description: '초대 진행중인 유저 정보', type: [userField] })
  users: userField[];
}

class RejectField {
  @ApiProperty({ description: '초대 거절한 유저 수' })
  count: number;

  @ApiProperty({ description: '초대 거절한 유저 정보', type: [userField] })
  users: userField[];
}

export class GetRoundingWaitingParticipantListOutputDto {
  @ApiProperty({ description: '초대 진행중', type: PendingField })
  pending: PendingField;

  @ApiProperty({ description: '초대 거절', type: RejectField })
  reject: RejectField;
}
