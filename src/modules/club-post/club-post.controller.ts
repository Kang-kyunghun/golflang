import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
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
import { UploadMultipleImages } from '../upload-file/decorator/upload-file.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { ClubPostService } from './club-post.service';
import {
  ClubPostOutputDto,
  GetClubPostQueryDto,
  CreateClubPostInputDto,
  UpdateClubPostInputDto,
} from './dto';

@ApiTags('CLUB-POST')
@UseGuards(JwtAuthGuard)
@Controller('club-post')
export class ClubPostController {
  constructor(private readonly clubPostService: ClubPostService) {}

  @Post()
  @UploadMultipleImages('clubPostImages', 10)
  @ApiOperation({
    summary: '클럽 게시글 생성',
    description: '클럽의 맴버가 클럽의 게시글을 생성합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateClubPostInputDto })
  @ApiCreatedResponse({
    description: '생성 성공 응답',
    type: ClubPostOutputDto,
  })
  async createClubPost(
    @Body() createClubPostInputDto: CreateClubPostInputDto,
    @GetUserId() userId: number,
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    return this.clubPostService.createClubPost(
      createClubPostInputDto,
      userId,
      files,
    );
  }

  @Get('list')
  @ApiOperation({
    summary: '클럽 게시글 목록 조회',
    description: '클럽 게시글을 조회 합니다.',
  })
  async getClubPostList(
    @Query() query: GetClubPostQueryDto,
    @GetUserId() userId: number,
  ): Promise<ClubPostOutputDto[]> {
    return await this.clubPostService.getClubPostList(query, userId);
  }

  @Get('/detail/:clubPostId')
  @ApiOperation({
    summary: '클럽 게시글 상세 조회',
    description: '클럽 게시글의 상세 정보를 조회합니다.',
  })
  @ApiOkResponse({
    description: '요청 성공 응답',
    type: ClubPostOutputDto,
    isArray: false,
  })
  @ApiParam({ name: 'clubPostId', required: true })
  async getClubDetail(
    @Param('clubPostId') clubPostId: number,
    @GetUserId() userId: number,
  ): Promise<ClubPostOutputDto> {
    return await this.clubPostService.getClubPostDetail(clubPostId, userId);
  }

  @Patch(':clubPostId')
  @ApiOperation({
    summary: '클럽 게시글 수정',
    description: '클럽 게시글의 내용을 수정합니다.',
  })
  @ApiOkResponse({
    description: '수정 성공 응답',
    type: ClubPostOutputDto,
    isArray: false,
  })
  @ApiParam({ name: 'clubPostId', required: true })
  async updateClubPost(
    @Body() body: UpdateClubPostInputDto,
    @Param('clubPostId') clubPostId: number,
    @GetUserId() userId: number,
  ): Promise<ClubPostOutputDto> {
    return this.clubPostService.updateClubPost(body, clubPostId, userId);
  }

  @Delete(':clubPostId')
  @HttpCode(204)
  @ApiOperation({
    summary: '클럽 게시글 삭제',
    description: '클럽 게시글의 작성자가 게시글을 삭제합니다..',
  })
  @ApiNoContentResponse({ description: '삭제 성공 응답' })
  @ApiParam({ name: 'clubPostId', required: true })
  async deleteClubPost(
    @Param('clubPostId') clubPostId: number,
    @GetUserId() userId: number,
  ) {
    return this.clubPostService.deleteClubPost(clubPostId, userId);
  }
}
