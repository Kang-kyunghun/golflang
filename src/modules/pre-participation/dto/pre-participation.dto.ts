import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';

import { User } from 'src/modules/user/entity/user.entity';
import {
  ParticipationStateEnum,
  ParticipationTypeEnum,
} from '../enum/pre-participation.enum';
import { PreParticipation } from '../entity/pre-participation.entity';

export class PreParticipationOutputDto {
  @ApiProperty({ description: '일정 예비 참석 id' })
  id: number;

  @IsObject()
  @ApiProperty({ description: '일정 예비 참석자' })
  guestUser: object;

  @IsObject()
  @ApiProperty({ description: '예비 참석할 일정' })
  schedule: object;

  @IsObject()
  @ApiProperty({ description: '일정 주인' })
  hostUser: object;

  @IsEnum(ParticipationTypeEnum)
  @ApiProperty({
    description: '예비 일정 타입',
    enum: ParticipationTypeEnum,
  })
  type: ParticipationTypeEnum;

  @IsEnum(ParticipationStateEnum)
  @ApiProperty({
    description: '예비 일정 상태',
    enum: ParticipationStateEnum,
  })
  state: ParticipationStateEnum;

  constructor(preParticipation: PreParticipation) {
    this.id = preParticipation.id;
    this.guestUser = {
      id: preParticipation.guestUser.id,
      nickname: preParticipation.guestUser.nickname,
      profileImage: preParticipation.guestUser.profileImage?.url,
    };
    this.hostUser = {
      id: preParticipation.schedule.hostUser.id,
      nickname: preParticipation.schedule.hostUser.nickname,
      profileImage: preParticipation.schedule.hostUser.profileImage?.url,
    };
    this.schedule = {
      id: preParticipation.schedule.id,
      title: preParticipation.schedule.title,
      roundingLocation: preParticipation.schedule.roundingLocation,
      roundingPlace: preParticipation.schedule.roundingPlace,
      memo: preParticipation.schedule.memo,
      startTime: preParticipation.schedule.startTime,
    };
    this.type = ParticipationTypeEnum.value(preParticipation.type.id);
    this.state = ParticipationStateEnum.value(preParticipation.state.id);
  }
}

export class PreParticipationListDto {
  @ApiProperty({ description: '예비 참여 목록' })
  preParticipations: PreParticipationOutputDto[];

  constructor(preParticipations: PreParticipationOutputDto[]) {
    this.preParticipations = preParticipations;
  }
}
