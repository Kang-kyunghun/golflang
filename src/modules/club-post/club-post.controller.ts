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
import { CreateClubPostInputDto } from './dto/create-club-post.dto';
import { ClubPostOutputDto } from './dto/club-post';

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
}
