import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClubPostService } from './club-post.service';
import { CreateClubPostDto } from './dto/create-club-post.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('POST')
@Controller('post')
export class ClubPostController {
  constructor(private readonly postService: ClubPostService) {}

  @Post()
  create(@Body() createPostDto: CreateClubPostDto) {
    return this.postService.create(createPostDto);
  }
}
