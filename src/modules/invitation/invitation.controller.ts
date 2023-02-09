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
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResultFormatInterceptor } from 'src/common/interceptor/result-format.interceptor';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { CreateRoundingInvitationInputDto as CreateScheduleInvitationInputDto } from './dto/create-rounding-invitation.dto';
import { UpdateRoundingInvitationInputDto as UpdateScheduleInvitationInputDto } from './dto/update-rounding-invitation.dto';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';

@ApiTags('INVITATION')
@Controller('invitation')
// @UseInterceptors(ResultFormatInterceptor)
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @SwaggerDefault('라운딩 일정에 초대하기', 'true', '라운딩 일정에 초대하기')
  async createScheduleInvitation(
    @Body() body: CreateScheduleInvitationInputDto,
    @GetUserId() userId: number,
  ): Promise<boolean> {
    return await this.invitationService.createScheduleInvitation(body, 2);
  }

  @Patch()
  @SwaggerDefault(
    '라운딩 일정의 초대를 수락&거절',
    'true',
    '라운딩 일정의 초대를 수락&거절',
  )
  async updateScheduleInvitation(
    @Body() body: UpdateScheduleInvitationInputDto,
    @GetUserId() userId: number,
  ): Promise<boolean> {
    return await this.invitationService.updateScheduleInvitation(body, 4);
  }
}
