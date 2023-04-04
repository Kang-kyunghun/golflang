import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { ClubService } from './club.service';
import { CreateClubInputDto } from './dto/create-club.dto';
import { ClubOutputDto } from './dto/club.dto';

@ApiTags('CLUB')
@UseGuards(JwtAuthGuard)
@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  @UploadSingleImage('profileImage')
  @ApiOperation({
    summary: '클럽 생성',
    description: '회원이 새로운 클럽을 생성합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateClubInputDto })
  @ApiCreatedResponse({
    description: '성공 응답',
    type: ClubOutputDto,
  })
  async createClub(
    @Body() body: CreateClubInputDto,
    @GetUserId() userId: number,
    @UploadedFile() file?: Express.MulterS3.File,
  ): Promise<ClubOutputDto> {
    return this.clubService.createClub(body, userId, file);
  }

  @Get('/detail/:clubId')
  @ApiOperation({
    summary: '클럽 상세 조회',
    description: '클럽의 상세 정보를 조회합니다.',
  })
  @ApiOkResponse({
    description: '성공 응답',
    type: ClubOutputDto,
    isArray: false,
  })
  @ApiParam({ name: 'clubId', required: true })
  async getClubDetail(
    @Param('clubId') clubId: number,
    @GetUserId() userId: number,
  ): Promise<ClubOutputDto> {
    return await this.clubService.getClubDetail(clubId, userId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
  //   return this.clubService.update(+id, updateClubDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.clubService.remove(+id);
  // }
}
