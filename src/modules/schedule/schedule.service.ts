import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { InvitationState } from 'src/common/enum/common.enum';
import { Connection, Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { CreateRoundingScheduleInputDto } from './dto/create-rounding-schedule.dto';
import {
  GetRoundingAcceptParticipantListOutputDto,
  GetRoundingWaitingParticipantListOutputDto,
} from './dto/get-rounding-participant-list.dto';
import { GetRoundingScheduleDetailOutputDto } from './dto/get-rounding-schedule-detail.dto';
import { GetRoundingScheduleListOutputDto } from './dto/get-rounding-schedule-list.dto';
import { Schedule } from './entity/schedule.entity';
import { UserScheduleMapping } from './entity/user-schedule-mapping.entity';
import { RoundingScheduleType } from './enum/schedule.enum';
import { ScheduleError, SCHEDULE_ERROR } from './error/schedule.error';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(UserScheduleMapping)
    private readonly userScheduleMappingRepo: Repository<UserScheduleMapping>,

    private connection: Connection,
    private readonly logger: Logger,
    private readonly scheduleError: ScheduleError,
    private readonly commonService: CommonService,
  ) {}

  async createMyRoundingSchedule(
    body: CreateRoundingScheduleInputDto,
    userId: number,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      const checkSchedule = await this.scheduleRepo.findOne({
        where: {
          roundingName: body.roundingName,
          roundingPlace: body.roundingPlace,
          roundingLocation: body.roundingLocation,
          startTime: body.startTime,
        },
        relations: { userScheduleMappings: { user: true } },
      });

      if (checkSchedule) {
        throw new ConflictException(
          SCHEDULE_ERROR.ROUNDING_SCHEDULE_ALREADY_EXIST,
        );
      }

      const schedule = new Schedule();
      schedule.roundingName = body.roundingName;
      schedule.roundingPlace = body.roundingPlace;
      schedule.roundingLocation = body.roundingLocation;
      schedule.startTime = body.startTime;
      schedule.maxParticipant = body.maxParticipant;
      schedule.memo = body.memo;
      schedule.type = RoundingScheduleType.PERSONAL;

      await queryRunner.manager.save(Schedule, schedule);

      const userScheduleMapping = new UserScheduleMapping();
      userScheduleMapping.user = user;
      userScheduleMapping.schedule = schedule;
      userScheduleMapping.isHost = true;
      userScheduleMapping.invitationState = InvitationState.PENDING;

      await queryRunner.manager.save(UserScheduleMapping, userScheduleMapping);

      await queryRunner.commitTransaction();

      return 'done';
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

  async getRoundingScheduleList(
    userId: number,
  ): Promise<GetRoundingScheduleListOutputDto[]> {
    try {
      const userScheduleMapping = await this.userScheduleMappingRepo.find({
        where: {
          user: { id: userId },
        },
        relations: { schedule: true },
        select: {
          isHost: true,
          schedule: {
            id: true,
            startTime: true,
            roundingName: true,
            roundingLocation: true,
            maxParticipant: true,
          },
        },
      });

      const result = await Promise.all(
        userScheduleMapping.map(async (ele) => {
          const participantCount = await this.userScheduleMappingRepo.count({
            where: {
              schedule: { id: ele.id },
            },
          });

          return {
            id: ele.schedule.id,
            isHost: ele.isHost,
            roundingName: ele.schedule.roundingName,
            roundingLocation: ele.schedule.roundingLocation,
            startTime: ele.schedule.startTime,
            participantCount,
          };
        }),
      );

      return result;
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
    roundingId: number,
  ): Promise<GetRoundingAcceptParticipantListOutputDto> {
    try {
      const participantList = await this.userScheduleMappingRepo.findAndCount({
        where: {
          schedule: { id: roundingId },
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
      const invitationPendingList =
        await this.userScheduleMappingRepo.findAndCount({
          where: {
            schedule: { id: scheduleId },
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
        await this.userScheduleMappingRepo.findAndCount({
          where: {
            schedule: { id: scheduleId },
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

  async getRoundingScheduleDetail(
    scheduleId: number,
    userId: number,
  ): Promise<GetRoundingScheduleDetailOutputDto> {
    try {
      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new NotFoundException('없음');
      }
      const participants = await this.userScheduleMappingRepo.find({
        where: { schedule: { id: scheduleId } },
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
        id: schedule.id,
        roundingName: schedule.roundingName,
        roundingPlace: schedule.roundingPlace,
        roundingLocation: schedule.roundingLocation,
        startTime: schedule.startTime,
        memo: schedule.memo,
        participantCount: participantsProfileImage.length,
        maxParticipant: schedule.maxParticipant,
        participantsProfileImage,
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
