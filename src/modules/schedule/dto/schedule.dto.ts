import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Schedule } from '../entity/schedule.entity';
import { User } from '../../user/entity/user.entity';
import { ScheduleTypeEnum } from '../enum/schedule.enum';

export class ScheduleOutputDto {
  @ApiProperty({ description: '스케쥴 id' })
  id: number;

  @IsBoolean()
  @ApiProperty({ description: '주최자 여부' })
  isHost: boolean;

  @IsEnum(ScheduleTypeEnum)
  @ApiProperty({ description: '개인 or 클럽' })
  scheduleType: ScheduleTypeEnum;

  @IsString()
  @ApiProperty({ description: '일정 이름' })
  title: string;

  @IsString()
  @ApiProperty({ description: '일정 라운딩 위치' })
  roundingLocation: string;

  @IsString()
  @ApiProperty({ description: '일정 라운딩 장소' })
  roundingPlace: string;

  @IsString()
  @ApiProperty({ description: '메모' })
  memo: string;

  @IsDate()
  @ApiProperty({ description: '라운딩 시작 시간' })
  startTime: Date;

  @IsNumber()
  @ApiProperty({ description: '라운딩 참가자 수' })
  participantCount: number;

  @IsNumber()
  @ApiProperty({ description: '라운딩 최대 참가자 수' })
  maxParticipants: number;

  @IsBoolean()
  @ApiProperty({ description: '공개 여부' })
  isPrivate: boolean;

  @IsOptional()
  @IsArray()
  @ApiProperty({ description: '참가자 프로필 이미지 목록', required: false })
  participantsProfileImage?: string[];

  constructor(schedule: Schedule, selfUserId: number, participants: User[]) {
    this.id = schedule.id;
    this.isHost = schedule.hostUser?.id === selfUserId;
    this.scheduleType = ScheduleTypeEnum.value(schedule.type.id);
    this.title = schedule.title;
    this.roundingLocation = schedule.roundingLocation;
    this.roundingPlace = schedule.roundingPlace;
    this.memo = schedule.memo;
    this.startTime = schedule.startTime;
    this.participantCount = participants.length;
    this.maxParticipants = schedule.maxParticipants;
    this.isPrivate = schedule.isPrivate;
    this.participantsProfileImage = this.getProfileImages(participants);
  }

  private getProfileImages(participants: User[]) {
    const profileImages = participants.map((participant) => {
      return participant.profileImage?.url;
    });

    return profileImages;
  }
}

export class GetScheduleListDto {
  @ApiProperty({ description: '개인 스케줄' })
  personalSchedules: ScheduleOutputDto[];

  @ApiProperty({ description: '클럽 스케줄' })
  clubSchedules: ScheduleOutputDto[];

  constructor(
    personalSchedules: ScheduleOutputDto[],
    clubSchedules: ScheduleOutputDto[],
  ) {
    this.personalSchedules = personalSchedules;
    this.clubSchedules = clubSchedules;
  }
}

export class GetSchedulesQueryDto {
  @IsString()
  @ApiProperty({
    description: '조회하고자 하는 날짜(년월)',
    example: 'YYYY-MM',
  })
  date: string;
}
