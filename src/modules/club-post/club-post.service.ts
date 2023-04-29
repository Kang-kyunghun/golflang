import { Injectable } from '@nestjs/common';
import { CreateClubPostDto } from './dto/create-club-post.dto';

@Injectable()
export class ClubPostService {
  create(createPostDto: CreateClubPostDto) {
    return 'This action adds a new post';
  }
}
