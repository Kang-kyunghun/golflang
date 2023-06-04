import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PreParticipation } from 'src/modules/pre-participation/entity/pre-participation.entity';
import { User } from 'src/modules/user/entity/user.entity';

class Participant {
  @ApiProperty({ description: '프로필 이미지 URL' })
  profileImage: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '성별' })
  gender: string;

  @ApiProperty({ description: '나이' })
  age: number;

  @ApiProperty({ description: '평균타수' })
  avgHitScore: number;

  @IsOptional()
  @ApiProperty({ description: '일정 참여 형태' })
  participationType: string;

  @IsOptional()
  @ApiProperty({ description: '일정 참여 상태' })
  participationState: string;

  constructor() {}
}

export class GetParticipantListOutputDto {
  @ApiProperty({ description: '확정 참가자 수' })
  participantCount: number;

  @ApiProperty({ description: '참가자 정보' })
  participantList: Participant[];

  constructor(participantCount: number, preParticipations: PreParticipation[]) {
    this.participantCount = participantCount;
    this.participantList = preParticipations.map((preParticipation) => {
      const participant = new Participant();
      const user = preParticipation.guestUser;

      participant.profileImage = user.profileImage?.url;
      participant.nickname = user.nickname;
      participant.gender = user.gender;
      participant.age = this.getUserAge(user.birthday);
      participant.avgHitScore = user.userState.avgHitScore;
      participant.participationType = preParticipation.type.type;
      participant.participationState = preParticipation.state.state;

      return participant;
    });
  }

  private getUserAge(birthday: string) {
    const nowDate = new Date();
    const birthDate = new Date(birthday);

    const nowYear = nowDate.getFullYear();
    const birthYear = birthDate.getFullYear();

    return nowYear - birthYear + 1;
  }
}

export class GetWaitingParticipantListOutputDto {
  @ApiProperty({ description: '일정 초대자 목록' })
  inviteeList: GetParticipantListOutputDto;

  @ApiProperty({ description: '일정 참가 요청자 목록' })
  applicantList: GetParticipantListOutputDto;

  constructor(
    inviteeList: GetParticipantListOutputDto,
    applicantList: GetParticipantListOutputDto,
  ) {
    this.inviteeList = inviteeList;
    this.applicantList = applicantList;
  }
}
