import { AlarmModule } from 'src/alarm/alarm.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import { ClubModule } from 'src/club/club.module';
import { LikeModule } from 'src/like/like.module';
import { MailModule } from 'src/mail/mail.module';
import { PostModule } from 'src/post/post.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { UploadFile } from 'src/upload-file/entity/upload-file.entity';
import { UploadFileModule } from 'src/upload-file/upload-file.module';
import { Account } from 'src/user/entity/account.entity';
import { UserState } from 'src/user/entity/user-state.entity';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { CommonModule } from '../common/common.module';

export const ENTITIES = [User, Account, UserState, UploadFile];

export const MODULES = [
  CommonModule,
  UserModule,
  PostModule,
  ClubModule,
  ScheduleModule,
  UploadFileModule,
  AlarmModule,
  ChatModule,
  AuthModule,
  LikeModule,
  MailModule,
];
