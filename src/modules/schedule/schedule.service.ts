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
  ScheduleOutputDto,
  GetScheduleListDto,
  GetSchedulesQueryDto,
  UpdateScheduleInputDto,
} from './dto';
import { Schedule } from './entity/schedule.entity';
import { ScheduleType } from './entity/schedule-type.entity';
import { ScheduleTypeEnum } from './enum/schedule.enum';
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
      schedule.type = new ScheduleType();

      schedule.title = body.title;
      schedule.roundingPlace = body.roundingPlace;
      schedule.roundingLocation = body.roundingLocation;
      schedule.startTime = body.startTime;
      schedule.maxParticipants = body.maxParticipants;
      schedule.memo = body.memo;
      schedule.type.id = ScheduleTypeEnum.id(body.scheduleType);
      schedule.hostUser = user;

      await queryRunner.manager.save(schedule);
      await queryRunner.commitTransaction();

      return new ScheduleOutputDto(schedule, userId, []);
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

  async getScheduleDetail(
    scheduleId: number,
    userId: number,
  ): Promise<ScheduleOutputDto> {
    try {
      const schedule = await this.scheduleRepo
        .createQueryBuilder('schedule')
        .innerJoinAndSelect('schedule.type', 'type')
        .innerJoinAndSelect('schedule.users', 'user')
        .leftJoinAndSelect('user.profileImage', 'profileImage')
        .leftJoinAndSelect('schedule.hostUser', 'hostUser')
        .where('schedule.id = :scheduleId', { scheduleId })
        .getOne();

      if (!schedule) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND);
      }

      const participants = schedule.users;

      const participantsProfileImage = participants.map((participant) => {
        return participant.profileImage?.url;
      });

      return new ScheduleOutputDto(
        schedule,
        userId,
        participants,
        participantsProfileImage,
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

  async getSchedules(
    query: GetSchedulesQueryDto,
    userId: number,
  ): Promise<GetScheduleListDto> {
    try {
      const { date } = query;

      const startDate = moment(new Date(date))
        .startOf('month')
        .format('YYYY-MM-DD HH:mm:ss');

      const endDate = moment(new Date(date))
        .endOf('month')
        .format('YYYY-MM-DD HH:mm:ss');

      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['schedules'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      let schedules = await this.scheduleRepo
        .createQueryBuilder('schedule')
        .innerJoinAndSelect('schedule.type', 'type')
        .leftJoinAndSelect('schedule.users', 'user')
        .leftJoinAndSelect('schedule.hostUser', 'hostUser')
        .leftJoinAndSelect('schedule.users', 'scheduleUsers')
        .where('user.id = :userId', { userId })
        .andWhere('schedule.id IN (:...scheduleIds)', {
          scheduleIds: user.schedules.map((schedule) => schedule.id),
        })
        .andWhere('schedule.startTime BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();

      schedules = await this.scheduleRepo.find({
        relations: ['type', 'users', 'hostUser'],
        where: {},
      });

      const personalSchedules = schedules.map(
        (schedule) => new ScheduleOutputDto(schedule, userId, schedule.users),
      );
      const excludedScheduleIds = schedules.map((schedule) => schedule.id);

      schedules = await this.scheduleRepo
        .createQueryBuilder('schedule')
        .innerJoinAndSelect('schedule.type', 'type')
        .innerJoinAndSelect('schedule.users', 'user')
        .leftJoinAndSelect('schedule.club', 'club')
        .leftJoinAndSelect('club.users', 'clubUser')
        .leftJoinAndSelect('schedule.hostUser', 'hostUser')
        .where('clubUser.id = :userId', { userId })
        .andWhere('schedule.id NOT IN (:...excludedScheduleIds)', {
          excludedScheduleIds: excludedScheduleIds,
        })
        .andWhere('schedule.startTime BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();

      const clubSchedules = schedules.map(
        (schedule) => new ScheduleOutputDto(schedule, userId, schedule.users),
      );
      return new GetScheduleListDto(personalSchedules, clubSchedules);
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

  async updateSchedule(
    body: UpdateScheduleInputDto,
    scheduleId: number,
    userId: number,
  ) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_USER_NOT_FOUND);
      }

      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId, hostUser: { id: userId } },
      });

      if (!schedule) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND);
      }

      const bodyKeys = Object.keys(body);
      const updateData: Partial<Schedule> = {};

      bodyKeys.forEach((key) => {
        if (body[key] !== undefined) {
          updateData[key] = body[key];
        }
      });

      await this.scheduleRepo.update(schedule.id, updateData);

      const updatedSchedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId, hostUser: { id: user.id } },
        relations: ['hostUser', 'type', 'users'],
      });

      return new ScheduleOutputDto(
        updatedSchedule,
        userId,
        updatedSchedule.users,
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

  async deleteSchedule(scheduleId: number, userId: number) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_USER_NOT_FOUND);
      }

      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId, hostUser: { id: userId } },
      });

      if (!schedule) {
        throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND);
      }

      await this.scheduleRepo.softDelete(schedule.id);
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

  // async getRoundingAcceptParticipantList(
  //   scheduleId: number,
  // ): Promise<GetRoundingAcceptParticipantListOutputDto> {
  //   try {
  //     const participantList = await this.userScheduleMappingRepo.findAndCount({
  //       where: {
  //         schedule: { id: scheduleId },
  //         participationState: ParticipationState.CONFIRM,
  //       },
  //       // relations: { targetUser: { userState: true, profileImage: true } },
  //     });

  //     // const userInfos = await Promise.all(
  //     //   participantList[0].map(async (v) => {
  //     //     const age = await this.commonService.getAge(v.targetUser.birthday);

  //     //     return {
  //     //       profileImage: v.targetUser.profileImage.url,
  //     //       nickname: v.targetUser.nickname,
  //     //       gender: v.targetUser.gender,
  //     //       age,
  //     //       avgHitScore: v.targetUser.userState.avgHitScore,
  //     //     };
  //     //   }),
  //     // );

  //     return {
  //       confirmParticipantCount: participantList[1],
  //       users: [],
  //       // users: userInfos,
  //     };
  //   } catch (error) {
  //     this.logger.error(error);

  //     const statusCode = error.response
  //       ? error.response.statusCode
  //       : HttpStatus.BAD_REQUEST;

  //     throw new HttpException(
  //       this.scheduleError.errorHandler(error.message),
  //       statusCode,
  //     );
  //   }
  // }

  // async getRoundingWaitingParticipantList(
  //   scheduleId: number,
  // ): Promise<GetRoundingWaitingParticipantListOutputDto> {
  //   try {
  //     const schedule = await this.scheduleRepo.findOne({
  //       where: { id: scheduleId },
  //     });

  //     if (!schedule) {
  //       throw new NotFoundException(SCHEDULE_ERROR.ROUNDING_SCHEDULE_NOT_FOUND);
  //     }

  //     const invitationPendingList =
  //       await this.userScheduleMappingRepo.findAndCount({
  //         where: {
  //           schedule: { id: scheduleId },
  //           participationState: ParticipationState.PENDING,
  //         },
  //         // relations: { targetUser: { userState: true, profileImage: true } },
  //       });

  //     const pendingUsers = await Promise.all(
  //       invitationPendingList[0].map(async (v) => {
  //         // const age = await this.commonService.getAge(v.targetUser.birthday);

  //         return {
  //           // profileImage: v.targetUser.profileImage.url,
  //           // nickname: v.targetUser.nickname,
  //           // gender: v.targetUser.gender,
  //           // age,
  //           // avgHitScore: v.targetUser.userState.avgHitScore,
  //         };
  //       }),
  //     );

  //     const invitationRejectList =
  //       await this.userScheduleMappingRepo.findAndCount({
  //         where: {
  //           schedule: { id: scheduleId },
  //           participationState: ParticipationState.REJECT,
  //         },
  //         // relations: { targetUser: { userState: true, profileImage: true } },
  //       });

  //     const rejectUsers = await Promise.all(
  //       invitationRejectList[0].map(async (v) => {
  //         // const age = await this.commonService.getAge(v.targetUser.birthday);

  //         return {
  //           // profileImage: v.targetUser.profileImage.url,
  //           // nickname: v.targetUser.nickname,
  //           // gender: v.targetUser.gender,
  //           // age,
  //           // avgHitScore: v.targetUser.userState.avgHitScore,
  //         };
  //       }),
  //     );

  //     return {
  //       pending: {
  //         count: invitationPendingList[1],
  //         users: [],
  //         // users: pendingUsers,
  //       },
  //       reject: {
  //         count: invitationRejectList[1],
  //         users: [],
  //         // users: rejectUsers,
  //       },
  //     };
  //   } catch (error) {
  //     this.logger.error(error);

  //     const statusCode = error.response
  //       ? error.response.statusCode
  //       : HttpStatus.BAD_REQUEST;

  //     throw new HttpException(
  //       this.scheduleError.errorHandler(error.message),
  //       statusCode,
  //     );
  //   }
  // }
}
