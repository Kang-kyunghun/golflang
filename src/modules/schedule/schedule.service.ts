import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Not, Repository, DataSource, Between } from 'typeorm';
import { User } from '../user/entity/user.entity';
import {
  CreateScheduleInputDto,
  ScheduleOutputDto,
  GetScheduleListDto,
  GetSchedulesQueryDto,
  UpdateScheduleInputDto,
  GetParticipantListOutputDto,
  GetWaitingParticipantListOutputDto,
} from './dto';
import { Schedule } from './entity/schedule.entity';
import { ScheduleType } from './entity/schedule-type.entity';
import { ScheduleTypeEnum } from './enum/schedule.enum';
import { ScheduleError, SCHEDULE_ERROR } from './error/schedule.error';
import { Club } from '../club/entity/club.entity';
import { PreParticipation } from '../pre-participation/entity/pre-participation.entity';
import {
  ParticipationStateEnum,
  ParticipationTypeEnum,
} from '../pre-participation/enum/pre-participation.enum';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    @InjectRepository(PreParticipation)
    private readonly preParticipationRepo: Repository<PreParticipation>,

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

      if (body.scheduleType === ScheduleTypeEnum.CLUB) {
        const club = await this.clubRepo.findOne({
          where: { id: body.clubId },
          relations: ['host', 'userClubs', 'userClubs.user'],
        });

        const isMember = club.userClubs.some(
          (userClub) => userClub.user.id === user.id,
        );

        if (!club || !isMember) {
          throw new NotFoundException(SCHEDULE_ERROR.CLUB_NOT_FOUND);
        }

        schedule.club = club;
      }

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

      return new ScheduleOutputDto(schedule, userId, participants);
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

      const userScheduleIds = user.schedules.map((schedule) => schedule.id);

      let schedules = await this.scheduleRepo.find({
        relations: ['type', 'users', 'hostUser'],
        where: {
          id: In(userScheduleIds),
          type: { id: ScheduleTypeEnum.id(ScheduleTypeEnum.PERSONAL) },
          startTime: Between(startDate, endDate),
        },
        order: { startTime: 'ASC' },
      });

      const personalSchedules = schedules.map(
        (schedule) => new ScheduleOutputDto(schedule, userId, schedule.users),
      );

      schedules = await this.scheduleRepo.find({
        relations: ['type', 'users', 'hostUser'],
        where: {
          id: In(userScheduleIds),
          type: { id: ScheduleTypeEnum.id(ScheduleTypeEnum.CLUB) },
          startTime: Between(startDate, endDate),
        },
        order: { startTime: 'ASC' },
      });

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

  async getSchedule(scheduleId: number) {
    try {
      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId },
        relations: ['hostUser', 'users', 'users.profileImage'],
      });

      return schedule;
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

  async getConfirmedParticipantList(
    scheduleId: number,
  ): Promise<GetParticipantListOutputDto> {
    try {
      const schedule = await this.getSchedule(scheduleId);
      const confirmedParticipants = await this.preParticipationRepo.find({
        where: {
          scheduleId: schedule.id,
          state: { state: ParticipationStateEnum.CONFIRM },
        },
        relations: [
          'guestUser',
          'guestUser.profileImage',
          'guestUser.userState',
          'type',
          'state',
        ],
      });

      return new GetParticipantListOutputDto(
        confirmedParticipants.length,
        confirmedParticipants,
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

  async getWaitingParticipantList(
    scheduleId: number,
  ): Promise<GetWaitingParticipantListOutputDto> {
    try {
      const schedule = await this.getSchedule(scheduleId);
      const inviteeList = await this.preParticipationRepo.find({
        where: {
          scheduleId: schedule.id,
          type: { type: ParticipationTypeEnum.INVITATION },
          state: { state: Not(ParticipationStateEnum.CONFIRM) },
        },
        relations: [
          'guestUser',
          'guestUser.profileImage',
          'guestUser.userState',
          'type',
          'state',
        ],
      });

      const applicantList = await this.preParticipationRepo.find({
        where: {
          scheduleId: schedule.id,
          type: { type: ParticipationTypeEnum.APPLICATION },
          state: { state: Not(ParticipationStateEnum.CONFIRM) },
        },
        relations: [
          'guestUser',
          'guestUser.profileImage',
          'guestUser.userState',
          'type',
          'state',
        ],
      });

      return new GetWaitingParticipantListOutputDto(
        new GetParticipantListOutputDto(inviteeList.length, inviteeList),
        new GetParticipantListOutputDto(applicantList.length, applicantList),
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
}
