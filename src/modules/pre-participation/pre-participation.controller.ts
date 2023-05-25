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
import { PreParticipationService } from './pre-participation.service';
import {
  ApiParam,
  ApiTags,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { SwaggerDefault } from 'src/common/decorator/swagger.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import {
  PreParticipationOutputDto,
  PreParticipationListDto,
} from './dto/pre-participation.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CreatePreParticipationInputDto } from './dto/create-pre-participation.dto';
import { UpdatePreParticipationStateInputDto } from './dto/update-pre-participation.dto';

@ApiTags('PRE-PARTICIPATION')
@UseGuards(JwtAuthGuard)
@Controller('pre-participation')
// @UseInterceptors(ResultFormatInterceptor)
export class PreParticipationController {
  constructor(
    private readonly preParticipationService: PreParticipationService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: '일정 예비 참여 생성',
    type: CreatePreParticipationInputDto,
  })
  async createPreParticipation(
    @Body() body: CreatePreParticipationInputDto,
    @GetUserId() userId: number,
  ): Promise<PreParticipationListDto> {
    return await this.preParticipationService.createPreParticipation(
      body,
      userId,
    );
  }

  @Patch(':preParticipationId')
  @SwaggerDefault('라운딩 일정 수정', PreParticipationOutputDto)
  @ApiParam({ name: 'preParticipationId', required: true })
  async updateSchedule(
    @Param('preParticipationId') preParticipationId: number,
    @Body() body: UpdatePreParticipationStateInputDto,
    @GetUserId() userId: number,
  ): Promise<PreParticipationOutputDto> {
    return await this.preParticipationService.updatePreParticipationState(
      body,
      preParticipationId,
      userId,
    );
  }
}
