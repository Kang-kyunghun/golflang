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
    type: PreParticipationOutputDto,
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
}
