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
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UploadSingleImage } from '../upload-file/decorator/upload-file.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { ClubService } from './club.service';
import {
  CreateClubInputDto,
  UpdateClubInputDto,
  ClubOutputDto,
  ClubMemberOutPutDto,
  GetClubMemberListQueryDto,
} from './dto/';

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
    description: '생성 성공 응답',
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
    description: '요청 성공 응답',
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

  @Patch(':clubId')
  @UploadSingleImage('profileImage')
  @ApiOperation({
    summary: '클럽 정보 수정',
    description: '클럽의 상세 정보를 수정합니다.',
  })
  @ApiOkResponse({
    description: '수정 성공 응답',
    type: ClubOutputDto,
    isArray: false,
  })
  @ApiParam({ name: 'clubId', required: true })
  async updateClub(
    @Body() body: UpdateClubInputDto,
    @Param('clubId') clubId: number,
    @GetUserId() userId: number,
    @UploadedFile() file?: Express.MulterS3.File,
  ): Promise<ClubOutputDto> {
    console.log(body);
    return this.clubService.updateClub(body, clubId, userId, file);
  }

  @Delete(':clubId')
  @HttpCode(204)
  @ApiOperation({
    summary: '클럽 삭제',
    description: '클럽의 호스트가 클럽을 삭제합니다..',
  })
  @ApiNoContentResponse({ description: '삭제 성공 응답' })
  @ApiParam({ name: 'clubId', required: true })
  async deleteClub(
    @Param('clubId') clubId: number,
    @GetUserId() userId: number,
  ) {
    return this.clubService.deleteClub(clubId, userId);
  }

  @Get('/:clubId/member/list')
  @ApiOperation({
    summary: '클럽 회원 목록 조회',
    description: '클럽 회원 목록를 조회합니다.',
  })
  @ApiOkResponse({
    description: '요청 성공 응답',
    type: [ClubMemberOutPutDto],
    isArray: false,
  })
  @ApiParam({ name: 'clubId', required: true })
  async getClubMemberList(
    @Query() query: GetClubMemberListQueryDto,
    @Param('clubId') clubId: number,
    @GetUserId() userId: number,
  ): Promise<ClubMemberOutPutDto[]> {
    return await this.clubService.getClubMemberList(clubId, userId, query);
  }

  @Get('/list/my')
  @ApiOperation({
    summary: '내가 가입한 클럽 목록 조회',
    description: '내가 가입한 클럽의 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '요청 성공 응답',
    type: [ClubOutputDto],
    isArray: false,
  })
  async getMyClubList(@GetUserId() userId: number): Promise<ClubOutputDto[]> {
    return await this.clubService.getMyClubList(userId);
  }
}
