import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { UploadFileService } from '../upload-file/upload-file.service';
import { Club } from './entity/club.entity';
import { User } from '../user/entity/user.entity';
import { Account } from '../user/entity/account.entity';
import { ClubError } from './error/club.error';
import { SearchKeyword } from './entity/search-keyword.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, User, Account, SearchKeyword])],
  controllers: [ClubController],
  providers: [ClubService, UploadFileService, Logger, ClubError],
})
export class ClubModule {}
