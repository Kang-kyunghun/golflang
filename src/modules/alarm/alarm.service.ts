import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository, DataSource } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { Alarm } from './entity/alarm.entity';
import { CreateAlarmInputDto } from './dto/create-alarm.dto';
import { AlarmTypeEnum } from './enum/alarm.enum';
import { AlarmInformation } from './entity/alarm-information.entity';
import { AlarmOutputDto } from './dto/alarm.dto';
import { AlarmError, ALARM_ERROR } from './error/alarm.error';
import { AlarmType } from './entity/alarm-type.entity';
import { Schedule } from '../schedule/entity/schedule.entity';
import { ScheduleService } from '../schedule/schedule.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Alarm)
    private readonly alarmRepo: Repository<Alarm>,
    private readonly userService: UserService,
    private readonly scheduleService: ScheduleService,

    private dataSource: DataSource,
    private readonly logger: Logger,
    private readonly alarmError: AlarmError,
  ) {}

  async createAlarm(body: CreateAlarmInputDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);

      const alarm = new Alarm();
      let alarmInformation = new AlarmInformation();

      if (body.scheduleId)
        alarmInformation = await this.createScheduleAlarm(body.scheduleId);

      if (body.chatingUserId)
        alarmInformation = await this.createChattingAlarm(body.chatingUserId);

      alarm.type = new AlarmType();
      alarm.user = user;
      alarm.content = body.alarmContent;
      alarm.type.id = AlarmTypeEnum.id(body.alarmType);
      alarm.information = alarmInformation;

      await queryRunner.manager.save(alarmInformation);
      await queryRunner.manager.save(alarm);
      await queryRunner.commitTransaction();

      return new AlarmOutputDto(alarm, user);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.alarmError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createScheduleAlarm(scheduleId: number) {
    try {
      const schedule = await this.scheduleService.getSchedule(scheduleId);
      const alarmInformation = new AlarmInformation();

      alarmInformation.schedule = schedule;
      return alarmInformation;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.alarmError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async createChattingAlarm(userId: number) {
    try {
      const user = await this.userService.getUser(userId);
      const alarmInformation = new AlarmInformation();

      alarmInformation.user = user;

      return alarmInformation;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.alarmError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
