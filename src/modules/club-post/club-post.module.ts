import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubPostController } from './club-post.controller';
import { UploadFileService } from '../upload-file/upload-file.service';
import { ClubPostService } from './club-post.service';
import { ClubPost } from './entity';
import { Club } from 'src/modules/club/entity/club.entity';
import { User } from 'src/modules//user/entity/user.entity';
import { Account } from '../user/entity/account.entity';
import { ClubError } from '../club/error/club.error';
import { ClubPostError } from './error/club-post.error';

@Module({
  imports: [TypeOrmModule.forFeature([ClubPost, Club, User, Account])],
  controllers: [ClubPostController],
  providers: [
    ClubPostService,
    UploadFileService,
    Logger,
    ClubError,
    ClubPostError,
  ],
})
export class ClubPostModule {}
