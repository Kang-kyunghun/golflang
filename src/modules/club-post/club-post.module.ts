import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubPostController } from './club-post.controller';
import { UploadFileService } from '../upload-file/upload-file.service';
import { ClubPostService } from './club-post.service';
import { Club } from 'src/modules/club/entity/club.entity';
import { User } from 'src/modules//user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, User])],
  controllers: [ClubPostController],
  providers: [ClubPostService, UploadFileService, Logger],
})
export class ClubPostModule {}
