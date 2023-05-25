import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  ApiParam,
  ApiTags,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import {
  CreateScheduleInputDto,
  ScheduleOutputDto,
  GetScheduleListDto,
  GetSchedulesQueryDto,
  UpdateScheduleInputDto,
  GetParticipantListOutputDto,
  GetWaitingParticipantListOutputDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

@ApiTags('SCHEDULE')
@UseGuards(JwtAuthGuard)
@Controller('schedule')
// @UseInterceptors(ResultFormatInterceptor)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}
  @Post()
  @ApiCreatedResponse({
    description: '라운딩 일정 생성',
    type: ScheduleOutputDto,
  })
  async createSchedule(
    @Body() body: CreateScheduleInputDto,
    @GetUserId() userId: number,
  ): Promise<ScheduleOutputDto> {
    return await this.scheduleService.createSchedule(body, userId);
  }

  @Get('detail/:scheduleId')
  @SwaggerDefault('라운딩 일정 상세 조회', ScheduleOutputDto)
  @ApiParam({ name: 'scheduleId', required: true })
  async getScheduleDetail(
    @Param('scheduleId') scheduleId: number,
    @GetUserId() userId: number,
  ): Promise<ScheduleOutputDto> {
    return await this.scheduleService.getScheduleDetail(scheduleId, userId);
  }

  @Get('list')
  @SwaggerDefault(
    '본인 관련 라운딩 일정(호스트, 참여, 클럽) 리스트 조회',
    GetScheduleListDto,
  )
  async getSchedules(
    @Query() query: GetSchedulesQueryDto,
    @GetUserId() userId: number,
  ): Promise<GetScheduleListDto> {
    return await this.scheduleService.getSchedules(query, userId);
  }

  @Patch(':scheduleId')
  @SwaggerDefault('라운딩 일정 수정', ScheduleOutputDto)
  @ApiParam({ name: 'scheduleId', required: true })
  async updateSchedule(
    @Param('scheduleId') scheduleId: number,
    @Body() body: UpdateScheduleInputDto,
    @GetUserId() userId: number,
  ): Promise<ScheduleOutputDto> {
    return await this.scheduleService.updateSchedule(body, scheduleId, userId);
  }

  @Delete(':scheduleId')
  @HttpCode(204)
  @ApiNoContentResponse({ description: '라운딩 일정 삭제' })
  @ApiParam({ name: 'scheduleId', required: true })
  async deleteSchedule(
    @Param('scheduleId') scheduleId: number,
    @GetUserId() userId: number,
  ) {
    await this.scheduleService.deleteSchedule(scheduleId, userId);
  }

  @Get(':scheduleId/participant/confirm')
  @SwaggerDefault('라운딩 확정 참가자 리스트 조회', GetParticipantListOutputDto)
  @ApiParam({ name: 'scheduleId', required: true })
  async getConfirmedParticipantList(
    @Param('scheduleId') scheduleId: number,
    @GetUserId() userId: number,
  ): Promise<GetParticipantListOutputDto> {
    return await this.scheduleService.getConfirmedParticipantList(scheduleId);
  }

  @Get(':scheduleId/participant/waiting')
  @SwaggerDefault(
    '라운딩 대기중인 참가자 리스트 조회',
    GetParticipantListOutputDto,
  )
  @ApiParam({ name: 'scheduleId', required: true })
  async getWaitingParticipantList(
    @Param('scheduleId') scheduleId: number,
    @GetUserId() userId: number,
  ): Promise<GetWaitingParticipantListOutputDto> {
    return await this.scheduleService.getWaitingParticipantList(scheduleId);
  }
}
