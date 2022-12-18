import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { CreateRoundingScheduleInputDto } from './dto/create-rounding-schedule.dto';
import { GetRoundingScheduleListOutputDto } from './dto/get-rounding-schedule-list.dto';
import {
  GetRoundingAcceptParticipantListOutputDto,
  GetRoundingWaitingParticipantListOutputDto,
} from './dto/get-rounding-participant-list.dto';
import { GetRoundingScheduleDetailOutputDto } from './dto/get-rounding-schedule-detail.dto';

@ApiTags('SCHEDULE')
@Controller('schedule')
@UseInterceptors(ResultFormatInterceptor)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @SwaggerDefault('라운딩 일정 생성', 'done', '라운딩 일정 생성')
  async createMyRoundingSchedule(
    @Body() body: CreateRoundingScheduleInputDto,
    @GetUserId() userId: number,
  ): Promise<string> {
    return await this.scheduleService.createMyRoundingSchedule(body, 2);
  }

  @Get('list')
  @SwaggerDefault(
    '라운딩 일정 리스트 조회',
    GetRoundingScheduleListOutputDto,
    '라운딩 일정 리스트 조회',
    null,
    true,
  )
  async getRoundingScheduleList(
    @GetUserId() userId: number,
  ): Promise<GetRoundingScheduleListOutputDto[]> {
    return await this.scheduleService.getRoundingScheduleList(2);
  }

  @Get(':scheduleId/participant/accept')
  @SwaggerDefault(
    '라운딩 확정 참가자 리스트 조회',
    GetRoundingAcceptParticipantListOutputDto,
    '라운딩 확정 참가자 리스트 조회',
  )
  @ApiParam({
    name: 'scheduleId',
    required: true,
    description: 'Schedule id',
  })
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
    '라운딩 대기중인 참가자 리스트 조회',
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
  @SwaggerDefault(
    '라운딩 일정 상세 조회',
    GetRoundingScheduleDetailOutputDto,
    '라운딩 일정 상세 조회',
  )
  @ApiParam({
    name: 'scheduleId',
    required: true,
    description: 'Schedule id',
  })
  async getRoundingScheduleDetail(
    @Param('scheduleId') scheduleId: number,
    @GetUserId() userId: number,
  ): Promise<GetRoundingScheduleDetailOutputDto> {
    return await this.scheduleService.getRoundingScheduleDetail(scheduleId, 2);
  }
}
