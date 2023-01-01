import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../schedule/entity/schedule.entity';
import { UserScheduleMapping } from '../schedule/entity/user-schedule-mapping.entity';
import {
  ParticipationState,
  ParticipationType,
} from '../schedule/enum/schedule.enum';
import { User } from '../user/entity/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateRoundingInvitationInputDto } from './dto/create-rounding-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { UpdateRoundingInvitationInputDto } from './dto/update-rounding-invitation.dto';
import { InvitationError, INVITATION_ERROR } from './error/invitation.error';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(UserScheduleMapping)
    private readonly userScheduleMappingRepo: Repository<UserScheduleMapping>,

    private readonly logger: Logger,
    private readonly invitationError: InvitationError,
  ) {}

  async createRoundingInvitation(
    body: CreateRoundingInvitationInputDto,
    userId: number,
  ): Promise<boolean> {
    try {
      const { targetUserIds, scheduleId } = body;

      const hostUser = await this.userRepo.findOne({
        where: { id: userId },
      });

      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId },
      });

      for (const targetUserId of targetUserIds) {
        const checkInvitation = await this.userScheduleMappingRepo.findOne({
          where: {
            targetUser: { id: targetUserId },
            schedule: { id: schedule.id },
            hostUser: { id: hostUser.id },
          },
        });

        if (checkInvitation) {
          continue;
        }
        const targetUser = await this.userRepo.findOne({
          where: { id: targetUserId },
        });

        await this.userScheduleMappingRepo.save({
          participationState: ParticipationState.PENDING,
          participationType: ParticipationType.INVITATION,
          targetUser,
          hostUser,
          schedule,
        });
      }

      return true;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.invitationError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async updateRoundingInvitation(
    body: UpdateRoundingInvitationInputDto,
    userId: number,
  ): Promise<boolean> {
    try {
      const { participationState, scheduleId, hostUserId } = body;

      const schedule = await this.scheduleRepo.findOne({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new NotFoundException(INVITATION_ERROR.SCHEDULE_NOT_FOUND);
      }

      const hostUser = await this.userRepo.findOne({
        where: { id: hostUserId },
      });

      if (!hostUser) {
        throw new NotFoundException(INVITATION_ERROR.HOST_USER_NOT_FOUND);
      }

      await this.userScheduleMappingRepo.update(
        {
          hostUser: { id: hostUserId },
          schedule: { id: scheduleId },
          targetUser: { id: userId },
        },
        {
          participationState,
        },
      );

      return true;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.invitationError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
