import { AlarmModule } from 'src/modules/alarm/alarm.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { ClubModule } from 'src/modules/club/club.module';
import { LikeModule } from 'src/modules/like/like.module';
import { Otp } from 'src/modules/otp/entities/otp.entity';
import { OtpModule } from 'src/modules/otp/otp.module';
import { PostModule } from 'src/modules/post/post.module';
import { ScheduleModule } from 'src/modules/schedule/schedule.module';
import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { UploadFileModule } from 'src/modules/upload-file/upload-file.module';
import { Account } from 'src/modules/user/entity/account.entity';
import { UserState } from 'src/modules/user/entity/user-state.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { Rounding } from 'src/rounding/entities/rounding.entity';
import { CommonModule } from '../common/common.module';

export const ENTITIES = [User, Account, UserState, UploadFile, Otp, Rounding];

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
  OtpModule,
];
