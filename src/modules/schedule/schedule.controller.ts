import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { CreateScheduleInputDto as CreateScheduleInputDto } from './dto/create-schedule.dto';
import {
  GetRoundingScheduleListOutputDto,
  GetRoundingScheduleListQueryDto as GetScheduleListQueryDto,
} from './dto/get-rounding-schedule-list.dto';
import {
  GetRoundingAcceptParticipantListOutputDto,
  GetRoundingWaitingParticipantListOutputDto,
} from './dto/get-rounding-participant-list.dto';
import { GetRoundingScheduleDetailOutputDto as GetScheduleDetailOutputDto } from './dto/get-rounding-schedule-detail.dto';
import { Schedule } from './entity/schedule.entity';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

@ApiTags('SCHEDULE')
@UseGuards(JwtAuthGuard)
@Controller('schedule')
@UseInterceptors(ResultFormatInterceptor)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @SwaggerDefault('라운딩 일정 생성')
  async createSchedule(
    @Body() body: CreateScheduleInputDto,
    @GetUserId() userId: number,
  ): Promise<Schedule> {
    return await this.scheduleService.createSchedule(body, userId);
  }

  @Get('list')
  @SwaggerDefault('라운딩 일정 리스트 조회', GetRoundingScheduleListOutputDto)
  async getScheduleList(
    @Query() query: GetScheduleListQueryDto,
    @GetUserId() userId: number,
  ): Promise<Schedule[]> {
    return await this.scheduleService.getScheduleList(query, userId);
  }

  @Get(':scheduleId/participant/confirm')
  @SwaggerDefault(
    '라운딩 확정 참가자 리스트 조회',
    GetRoundingAcceptParticipantListOutputDto,
    '라운딩 확정 참가자 리스트 조회',
  )
  @ApiParam({ name: 'scheduleId', required: true })
  async getRoundingAcceptParticipantList(
    @Param('scheduleId') scheduleId: number,
  ): Promise<GetRoundingAcceptParticipantListOutputDto> {
    return await this.scheduleService.getRoundingAcceptParticipantList(
      scheduleId,
    );
  }

  @Get(':scheduleId/participant/waiting')
  @SwaggerDefault(
    '라운딩 대기중인 참가자 리스트 조회',
    GetRoundingWaitingParticipantListOutputDto,
  )
  @ApiParam({
    name: 'scheduleId',
    required: true,
    description: 'Schedule id',
  })
  async getRoundingWaitingParticipantList(
    @Param('scheduleId') scheduleId: number,
  ): Promise<GetRoundingWaitingParticipantListOutputDto> {
    return await this.scheduleService.getRoundingWaitingParticipantList(
      scheduleId,
    );
  }

  @Get('detail/:scheduleId')
  @SwaggerDefault('라운딩 일정 상세 조회', GetScheduleDetailOutputDto)
  @ApiParam({
    name: 'scheduleId',
    required: true,
    description: 'Schedule id',
  })
  async getScheduleDetail(
    @Param('scheduleId') scheduleId: number,
    @GetUserId() userId: number,
  ): Promise<GetScheduleDetailOutputDto> {
    return await this.scheduleService.getScheduleDetail(scheduleId, 2);
  }
}
