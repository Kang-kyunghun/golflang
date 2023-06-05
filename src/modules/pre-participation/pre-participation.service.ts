import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { AlarmService } from '../alarm/alarm.service';
import { User } from '../user/entity/user.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { PreParticipation } from './entity/pre-participation.entity';
import { ParticipationType } from './entity/participation-type.entity';
import { ParticipationState } from './entity/participation-state.entity';
import {
  PreParticipationError,
  PRE_PARTICIPATION_ERROR,
} from './error/pre-participation.error';
import { CreatePreParticipationInputDto } from './dto/create-pre-participation.dto';
import { UpdatePreParticipationStateInputDto } from './dto/update-pre-participation.dto';

import {
  PreParticipationOutputDto,
  PreParticipationListDto,
} from './dto/pre-participation.dto';
import {
  ParticipationStateEnum,
  ParticipationTypeEnum,
} from './enum/pre-participation.enum';
import { CreateAlarmInputDto } from '../alarm/dto/create-alarm.dto';
import { UserService } from '../user/user.service';
import { ScheduleService } from '../schedule/schedule.service';
import { AlarmTypeEnum, AlarmContentTypeEnum } from '../alarm/enum/alarm.enum';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

@Injectable()
export class PreParticipationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(PreParticipation)
    private readonly preParticipationRepo: Repository<PreParticipation>,
    @InjectRepository(ParticipationState)
    private readonly participationStateRepo: Repository<ParticipationState>,
    private readonly userService: UserService,
    private readonly scheduleService: ScheduleService,
    private readonly alarmService: AlarmService,

    private dataSource: DataSource,
    private readonly logger: Logger,
    private readonly preParticipationError: PreParticipationError,
  ) {}

  async createPreParticipation(
    body: CreatePreParticipationInputDto,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    const queryBuilder = queryRunner.manager.createQueryBuilder();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      const schedule = await this.scheduleService.getSchedule(body.scheduleId);

      const guestUserList = await this.userRepo.find({
        where: { id: In(body.guestUserIds) },
        relations: ['profileImage'],
      });

      let preParticipations: PreParticipation[];
      let alarmContentType: AlarmContentTypeEnum;
      let alarmContent: AlarmContentTypeEnum;

      switch (ParticipationTypeEnum[body.type]) {
        case ParticipationTypeEnum.INVITATION:
          preParticipations = await this.createInvitationData(
            schedule,
            user,
            body,
          );
          alarmContentType = AlarmContentTypeEnum.INVITATION;
          alarmContent = AlarmContentTypeEnum.content(alarmContentType, {
            schedule: schedule,
          });
          break;
        case ParticipationTypeEnum.APPLICATION:
          preParticipations = await this.createParticipation(schedule, body);
          alarmContentType = AlarmContentTypeEnum.APPLICATION;
          alarmContent = AlarmContentTypeEnum.content(alarmContentType, {
            schedule: schedule,
            user: preParticipations[0].guestUser,
          });
          break;
      }

      await queryBuilder
        .insert()
        .into(PreParticipation)
        .values(preParticipations)
        .execute();

      const createAlarmInputDto = new CreateAlarmInputDto();
      createAlarmInputDto.scheduleId = schedule.id;
      createAlarmInputDto.alarmContent = alarmContent;
      createAlarmInputDto.alarmType = AlarmTypeEnum.Schedule;

      const alarmUserIds = guestUserList.map((guestUser) => guestUser.id);
      const createAlarmList = alarmUserIds.map((alarmUserId) =>
        this.alarmService.createAlarm(createAlarmInputDto, alarmUserId),
      );

      await Promise.all(createAlarmList);
      await queryRunner.commitTransaction();

      const preParticipationOutputs = preParticipations.map(
        (preParticipation) => new PreParticipationOutputDto(preParticipation),
      );

      return new PreParticipationListDto(preParticipationOutputs);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.preParticipationError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createInvitationData(
    schedule: Schedule,
    user: User,
    body: CreatePreParticipationInputDto,
  ) {
    try {
      if (schedule.hostUser.id !== user.id)
        throw new ForbiddenException(PRE_PARTICIPATION_ERROR.FORBIDDEN);

      return this.createParticipation(schedule, body);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.preParticipationError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async createParticipation(
    schedule: Schedule,
    body: CreatePreParticipationInputDto,
  ) {
    const preParticipations = body.guestUserIds.map((guestUserId) => {
      const preParticipation = new PreParticipation();
      preParticipation.type = new ParticipationType();
      preParticipation.state = new ParticipationState();
      preParticipation.guestUser = new User();

      preParticipation.guestUser.id = guestUserId;
      preParticipation.schedule = schedule;
      preParticipation.type.id = ParticipationTypeEnum.id(body.type);
      preParticipation.state.id = ParticipationStateEnum.id(
        ParticipationStateEnum.PENDING,
      );

      return preParticipation;
    });

    return preParticipations;
  }

  async getPreParticipation(prePartipationId: number) {
    try {
      const preParticipation = await this.preParticipationRepo.findOne({
        where: { id: prePartipationId },
        relations: [
          'guestUser',
          'guestUser.profileImage',
          'schedule',
          'schedule.hostUser',
          'schedule.hostUser.profileImage',
          'type',
          'state',
        ],
      });

      if (!preParticipation)
        //에러 메시지 변경 필요
        throw new NotFoundException(PRE_PARTICIPATION_ERROR.SCHEDULE_NOT_FOUND);

      return preParticipation;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.preParticipationError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async updatePreParticipationState(
    body: UpdatePreParticipationStateInputDto,
    prePartipationId: number,
    userId: number,
  ) {
    try {
      let preParticipation = await this.getPreParticipation(prePartipationId);

      switch (preParticipation.type.type) {
        case ParticipationTypeEnum.INVITATION:
          preParticipation = await this.updateInvitaionState(
            preParticipation,
            body.state,
            userId,
          );
          break;
        case ParticipationTypeEnum.APPLICATION:
          preParticipation = await this.updateApplicationState(
            preParticipation,
            body.state,
            userId,
          );
          break;
      }

      return new PreParticipationOutputDto(preParticipation);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.preParticipationError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async updateInvitaionState(
    preParticipation: PreParticipation,
    state: ParticipationStateEnum,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (userId !== preParticipation.guestUserId)
        throw new ForbiddenException(PRE_PARTICIPATION_ERROR.FORBIDDEN);

      preParticipation.state = await this.participationStateRepo.findOne({
        where: {
          id: ParticipationStateEnum.id(ParticipationStateEnum[state]),
        },
      });
      await this.preParticipationRepo.save(preParticipation);

      const alarmContentType =
        state === ParticipationStateEnum.CONFIRM
          ? AlarmContentTypeEnum.INVITATION_APPROVE
          : AlarmContentTypeEnum.INVITATION_REJECT;
      const alarmContent = AlarmContentTypeEnum.content(alarmContentType, {
        schedule: preParticipation.schedule,
        user: preParticipation.guestUser,
      });
      const createAlarmInputDto = new CreateAlarmInputDto();

      createAlarmInputDto.scheduleId = preParticipation.schedule.id;
      createAlarmInputDto.alarmContent = alarmContent;
      createAlarmInputDto.alarmType = AlarmTypeEnum.Schedule;

      await this.alarmService.createAlarm(
        createAlarmInputDto,
        preParticipation.schedule.hostUser.id,
      ),
        await queryRunner.commitTransaction();

      return preParticipation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateApplicationState(
    preParticipation: PreParticipation,
    state: ParticipationStateEnum,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (userId !== preParticipation.schedule.hostUser.id)
        throw new ForbiddenException(PRE_PARTICIPATION_ERROR.FORBIDDEN);

      preParticipation.state = await this.participationStateRepo.findOne({
        where: {
          id: ParticipationStateEnum.id(ParticipationStateEnum[state]),
        },
      });
      await this.preParticipationRepo.save(preParticipation);

      const alarmContentType =
        state === ParticipationStateEnum.CONFIRM
          ? AlarmContentTypeEnum.APPLICATION_APPROVE
          : AlarmContentTypeEnum.APPLICATION_REJECT;
      const alarmContent = AlarmContentTypeEnum.content(alarmContentType, {
        schedule: preParticipation.schedule,
      });
      const createAlarmInputDto = new CreateAlarmInputDto();

      createAlarmInputDto.scheduleId = preParticipation.schedule.id;
      createAlarmInputDto.alarmContent = alarmContent;
      createAlarmInputDto.alarmType = AlarmTypeEnum.Schedule;

      await this.alarmService.createAlarm(
        createAlarmInputDto,
        preParticipation.guestUserId,
      ),
        await queryRunner.commitTransaction();

      return preParticipation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
