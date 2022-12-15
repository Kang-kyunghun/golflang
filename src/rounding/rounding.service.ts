import { error } from 'console';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rounding } from './entities/rounding.entity';
import { Connection, Repository } from 'typeorm';
import { UserRoundingMapping } from './entities/user-rounding-mapping.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { CreateMyRoundingScheduleInputDto } from './dto/create-my-rounding-schedule.dto';
import { ROUNDING_ERROR } from './error/rounding.error';
import { RoundingType } from './enum/rounding.enum';
import { GetRoundingScheduleListOutputDto } from './dto/get-rounding-schedule-list.dto';
import { GetRoundingScheduleDetailOutputDto } from './dto/get-rounding-schedule-detail.dto';
import { CommonService } from 'src/common/common.service';
import { InvitationState } from 'src/common/enum/common.enum';
import {
  GetAcceptParticipantListOutputDto,
  GetWaitingParticipantListOutputDto,
} from './dto/get-participant-list.dto';

@Injectable()
export class RoundingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Rounding)
    private readonly roundingRepo: Repository<Rounding>,
    @InjectRepository(UserRoundingMapping)
    private readonly userRoundingMappingRepo: Repository<UserRoundingMapping>,

    private connection: Connection,
    private readonly commonService: CommonService,
  ) {}

  async createMyRoundingSchedule(
    body: CreateMyRoundingScheduleInputDto,
    userId: number,
  ): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      const checkRounding = await this.roundingRepo.findOne({
        where: {
          place: body.place,
          location: body.location,
          startTime: body.startTime,
        },
      });

      if (checkRounding) {
        throw new ConflictException(ROUNDING_ERROR.ROUNDING_ALREADY_EXIST);
      }

      const rounding = new Rounding();
      rounding.place = body.place;
      rounding.location = body.location;
      rounding.startTime = body.startTime;
      rounding.maxParticipant = body.maxParticipant;
      rounding.memo = body.memo;
      rounding.type = RoundingType.PERSONAL;

      await queryRunner.manager.save(Rounding, rounding);

      const userRoundingMapping = new UserRoundingMapping();
      userRoundingMapping.user = user;
      userRoundingMapping.rounding = rounding;
      userRoundingMapping.isHost = true;
      userRoundingMapping.invitationState = InvitationState.PENDING;

      await queryRunner.manager.save(UserRoundingMapping, userRoundingMapping);

      await queryRunner.commitTransaction();
      return 'done';
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getRoundingScheduleList(
    userId: number,
  ): Promise<GetRoundingScheduleListOutputDto[]> {
    try {
      const userRoundingMapping = await this.userRoundingMappingRepo.find({
        where: {
          user: { id: userId },
        },
        relations: { rounding: true },
        select: {
          isHost: true,
          rounding: {
            id: true,
            startTime: true,
            location: true,
            maxParticipant: true,
          },
        },
      });

      const result = await Promise.all(
        userRoundingMapping.map(async (ele) => {
          const participantCount = await this.userRoundingMappingRepo.count({
            where: {
              rounding: { id: ele.id },
            },
          });

          return {
            id: ele.rounding.id,
            isHost: ele.isHost,
            location: ele.rounding.location,
            startTime: ele.rounding.startTime,
            participantCount,
          };
        }),
      );

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getRoundingScheduleDetail(
    roundingId: number,
    userId: number,
  ): Promise<GetRoundingScheduleDetailOutputDto> {
    try {
      const rounding = await this.roundingRepo.findOne({
        where: { id: roundingId },
      });

      const participants = await this.userRoundingMappingRepo.find({
        where: { rounding: { id: roundingId } },
        relations: {
          user: {
            profileImage: true,
          },
        },
      });

      const participantsProfileImage = participants.map((ele) => {
        return ele.user.profileImage.url;
      });

      return {
        id: rounding.id,
        place: rounding.place,
        location: rounding.location,
        startTime: rounding.startTime,
        memo: rounding.memo,
        participantCount: participantsProfileImage.length,
        maxParticipant: rounding.maxParticipant,
        participantsProfileImage,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getAcceptParticipantList(
    roundingId: number,
  ): Promise<GetAcceptParticipantListOutputDto> {
    try {
      const participantList = await this.userRoundingMappingRepo.findAndCount({
        where: {
          rounding: { id: roundingId },
          invitationState: InvitationState.CONFIRM,
        },
        relations: { user: { userState: true, profileImage: true } },
      });

      const userInfos = await Promise.all(
        participantList[0].map(async (v) => {
          const age = await this.commonService.getAge(v.user.birthday);

          return {
            profileImage: v.user.profileImage.url,
            nickname: v.user.nickname,
            gender: v.user.gender,
            age,
            avgHitScore: v.user.userState.avgHitScore,
          };
        }),
      );

      return {
        participantCount: participantList[1],
        users: userInfos,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getWaitingParticipantList(
    roundingId: number,
  ): Promise<GetWaitingParticipantListOutputDto> {
    try {
      const invitationPendingList =
        await this.userRoundingMappingRepo.findAndCount({
          where: {
            rounding: { id: roundingId },
            invitationState: InvitationState.PENDING,
          },
          relations: { user: { userState: true, profileImage: true } },
        });

      const pendingUsers = await Promise.all(
        invitationPendingList[0].map(async (v) => {
          const age = await this.commonService.getAge(v.user.birthday);

          return {
            profileImage: v.user.profileImage.url,
            nickname: v.user.nickname,
            gender: v.user.gender,
            age,
            avgHitScore: v.user.userState.avgHitScore,
          };
        }),
      );

      const invitationRejectList =
        await this.userRoundingMappingRepo.findAndCount({
          where: {
            rounding: { id: roundingId },
            invitationState: InvitationState.REJECT,
          },
          relations: { user: { userState: true, profileImage: true } },
        });

      const rejectUsers = await Promise.all(
        invitationRejectList[0].map(async (v) => {
          const age = await this.commonService.getAge(v.user.birthday);

          return {
            profileImage: v.user.profileImage.url,
            nickname: v.user.nickname,
            gender: v.user.gender,
            age,
            avgHitScore: v.user.userState.avgHitScore,
          };
        }),
      );

      return {
        pending: {
          count: invitationPendingList[1],
          users: pendingUsers,
        },
        reject: {
          count: invitationRejectList[1],
          users: rejectUsers,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }
}
