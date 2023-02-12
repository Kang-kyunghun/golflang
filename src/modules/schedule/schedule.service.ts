import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository, DataSource } from 'typeorm';
import { User } from '../user/entity/user.entity';
import {
  CreateScheduleInputDto,
  CreateScheduleOutput,
} from './dto/create-schedule.dto';
import {
  GetRoundingAcceptParticipantListOutputDto,
  GetRoundingWaitingParticipantListOutputDto,
} from './dto/get-participant-list.dto';
import { GetRoundingScheduleDetailOutputDto } from './dto/get-schedule-detail.dto';
import {
  GetSchedulesOutputDto,
  GetSchedulesQueryDto,
} from './dto/get-schedules.dto';
import { Schedule } from './entity/schedule.entity';
import { NotHostUserScheduleMapping } from './entity/not-host-user-schedule-mapping.entity';
import { ParticipationState } from './enum/schedule.enum';
import { ScheduleError, SCHEDULE_ERROR } from './error/schedule.error';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(NotHostUserScheduleMapping)
    private readonly userScheduleMappingRepo: Repository<NotHostUserScheduleMapping>,

    private dataSource: DataSource,
    private readonly logger: Logger,
    private readonly scheduleError: ScheduleError,
  ) {}

  async createSchedule(body: CreateScheduleInputDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_USER_NOT_FOUND);
      }

      const schedule = new Schedule();
      schedule.title = body.title;
      schedule.roundingPlace = body.roundingPlace;
      schedule.roundingLocation = body.roundingLocation;
      schedule.startTime = body.startTime;
      schedule.maxParticipants = body.maxParticipants;
      schedule.memo = body.memo;
      schedule.type = body.scheduleType;
      schedule.hostUser = user;

      await queryRunner.manager.save(Schedule, schedule);

      await queryRunner.commitTransaction();

      return new CreateScheduleOutput(schedule);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.scheduleError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getSchedules(
    query: GetSchedulesQueryDto,
    userId: number,
  ): Promise<GetSchedulesOutputDto[]> {
    try {
      const { date } = query;

      const startDayOfThisMonth = moment(new Date(date))
        .startOf('month')
        .format('YYYY-MM-DD HH:mm:ss');

      const endDayOfThisMonth = moment(new Date(date))
        .endOf('month')
        .format('YYYY-MM-DD HH:mm:ss');

      // host가 본인인 것
      const schedulesAsHost = await this.scheduleRepo.find({
        where: {
          hostUser: { id: userId },
          startTime: Between(startDayOfThisMonth, endDayOfThisMonth),
        },
        relations: ['hostUser', 'notHostUserScheduleMappings'],
      });

      console.log(userId, schedulesAsHost);

      //TODO: participants가 본인인 것 추가하기
      // const shedulesAsParticipants = await this.scheduleRepo

      //TODO: 추후 본인이 가입한 클럽의 스케쥴 포함시키기

      return schedulesAsHost.map(
        // TODO: 마지막 인자는 참여자 수 계산해서 추후 업데이트 필요
        (schedule) => new GetSchedulesOutputDto(schedule, userId, 4),
      );
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.scheduleError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async getRoundingAcceptParticipantList(
    scheduleId: number,
  ): Promise<GetRoundingAcceptParticipantListOutputDto> {
    try {
      const participantList = await this.userScheduleMappingRepo.findAndCount({
        where: {
          schedule: { id: scheduleId },
          participationState: ParticipationState.CONFIRM,
        },
        // relations: { targetUser: { userState: true, profileImage: true } },
      });

      // const userInfos = await Promise.all(
      //   participantList[0].map(async (v) => {
      //     const age = await this.commonService.getAge(v.targetUser.birthday);

      //     return {
      //       profileImage: v.targetUser.profileImage.url,
      //       nickname: v.targetUser.nickname,
      //       gender: v.targetUser.gender,
      //       age,
      //       avgHitScore: v.targetUser.userState.avgHitScore,
      //     };
      //   }),
      // );

      return {
        confirmParticipantCount: participantList[1],
        users: [],
        // users: userInfos,
      };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.scheduleError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async getRoundingWaitingParticipantList(
    scheduleId: number,
  ): Promise<GetRoundingWaitingParticipantListOutputDto> {
    try {
      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND);
      }

      const invitationPendingList =
        await this.userScheduleMappingRepo.findAndCount({
          where: {
            schedule: { id: scheduleId },
            participationState: ParticipationState.PENDING,
          },
          // relations: { targetUser: { userState: true, profileImage: true } },
        });

      const pendingUsers = await Promise.all(
        invitationPendingList[0].map(async (v) => {
          // const age = await this.commonService.getAge(v.targetUser.birthday);

          return {
            // profileImage: v.targetUser.profileImage.url,
            // nickname: v.targetUser.nickname,
            // gender: v.targetUser.gender,
            // age,
            // avgHitScore: v.targetUser.userState.avgHitScore,
          };
        }),
      );

      const invitationRejectList =
        await this.userScheduleMappingRepo.findAndCount({
          where: {
            schedule: { id: scheduleId },
            participationState: ParticipationState.REJECT,
          },
          // relations: { targetUser: { userState: true, profileImage: true } },
        });

      const rejectUsers = await Promise.all(
        invitationRejectList[0].map(async (v) => {
          // const age = await this.commonService.getAge(v.targetUser.birthday);

          return {
            // profileImage: v.targetUser.profileImage.url,
            // nickname: v.targetUser.nickname,
            // gender: v.targetUser.gender,
            // age,
            // avgHitScore: v.targetUser.userState.avgHitScore,
          };
        }),
      );

      return {
        pending: {
          count: invitationPendingList[1],
          users: [],
          // users: pendingUsers,
        },
        reject: {
          count: invitationRejectList[1],
          users: [],
          // users: rejectUsers,
        },
      };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.scheduleError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async getScheduleDetail(
    scheduleId: number,
    userId: number,
  ): Promise<GetRoundingScheduleDetailOutputDto> {
    try {
      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND);
      }

      const participants = await this.userScheduleMappingRepo.find({
        where: { schedule: { id: scheduleId } },
        relations: {
          // targetUser: {
          //   profileImage: true,
          // },
        },
      });

      // const participantsProfileImage = participants.map((ele) => {
      //   return ele.targetUser.profileImage.url;
      // });

      return {
        id: schedule.id,
        roundingName: schedule.title,
        roundingPlace: schedule.roundingPlace,
        roundingLocation: schedule.roundingLocation,
        startTime: schedule.startTime,
        memo: schedule.memo,
        participantCount: participants.length,
        maxParticipants: schedule.maxParticipants,
        participantsProfileImage: [],
      };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.scheduleError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
