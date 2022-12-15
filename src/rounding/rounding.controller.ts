import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { CreateMyRoundingScheduleInputDto } from './dto/create-my-rounding-schedule.dto';
import {
  GetAcceptParticipantListOutputDto,
  GetWaitingParticipantListOutputDto,
} from './dto/get-participant-list.dto';
import { GetRoundingScheduleDetailOutputDto } from './dto/get-rounding-schedule-detail.dto';
import { GetRoundingScheduleListOutputDto } from './dto/get-rounding-schedule-list.dto';
import { RoundingService } from './rounding.service';

@ApiTags('ROUNDING')
@Controller('rounding')
@UseInterceptors(ResultFormatInterceptor)
export class RoundingController {
  constructor(private readonly roundingService: RoundingService) {}

  @Post()
  @SwaggerDefault('라운딩 일정 생성', 'done', '라운딩 일정 생성')
  async createMyRoundingSchedule(
    @Body() body: CreateMyRoundingScheduleInputDto,
    @GetUserId() userId: number,
  ): Promise<string> {
    return await this.roundingService.createMyRoundingSchedule(body, 2);
  }

  @Get('list')
  @SwaggerDefault('라운딩 일정 리스트 조회', 'done', '라운딩 일정 리스트 조회')
  async getRoundingScheduleList(
    @GetUserId() userId: number,
  ): Promise<GetRoundingScheduleListOutputDto[]> {
    return await this.roundingService.getRoundingScheduleList(2);
  }

  @Get(':roundingId/participant/accept')
  @SwaggerDefault(
    '라운딩 확정 참가자 리스트 조회',
    GetAcceptParticipantListOutputDto,
    '라운딩 확정 참가자 리스트 조회',
  )
  @ApiParam({
    name: 'roundingId',
    required: true,
    description: 'Rounding id',
  })
  async getAcceptParticipantList(
    @Param('roundingId') roundingId: number,
  ): Promise<GetAcceptParticipantListOutputDto> {
    return await this.roundingService.getAcceptParticipantList(roundingId);
  }

  @Get(':roundingId/participant/waiting')
  @SwaggerDefault(
    '라운딩 대기중인 참가자 리스트 조회',
    GetWaitingParticipantListOutputDto,
    '라운딩 대기중인 참가자 리스트 조회',
  )
  @ApiParam({
    name: 'roundingId',
    required: true,
    description: 'Rounding id',
  })
  async getWaitingParticipantList(
    @Param('roundingId') roundingId: number,
  ): Promise<GetWaitingParticipantListOutputDto> {
    return await this.roundingService.getWaitingParticipantList(roundingId);
  }

  @Get('detail/:roundingId')
  @SwaggerDefault('라운딩 일정 상세 조회', 'done', '라운딩 일정 상세 조회')
  @ApiParam({
    name: 'roundingId',
    required: true,
    description: 'Rounding id',
  })
  async getRoundingScheduleDetail(
    @Param('roundingId') roundingId: number,
    @GetUserId() userId: number,
  ): Promise<GetRoundingScheduleDetailOutputDto> {
    return await this.roundingService.getRoundingScheduleDetail(roundingId, 2);
  }
}
