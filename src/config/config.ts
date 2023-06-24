import { AlarmModule } from 'src/modules/alarm/alarm.module';
import { Alarm } from 'src/modules/alarm/entity/alarm.entity';
import { AlarmType } from 'src/modules/alarm/entity/alarm-type.entity';
import { AlarmInformation } from 'src/modules/alarm/entity/alarm-information.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Auth } from 'src/modules/auth/entity/auth.entity';
import { ChatModule } from 'src/modules/chat/chat.module';
import { Chat } from 'src/modules/chat/entity/chat.entity';
import { ClubModule } from 'src/modules/club/club.module';
import { Club } from 'src/modules/club/entity/club.entity';
import { Like } from 'src/modules/like/entity/like.entity';
import { LikeModule } from 'src/modules/like/like.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { Post } from 'src/modules/post/entity/post.entity';
import { Otp } from 'src/modules/otp/entities/otp.entity';
import { OtpModule } from 'src/modules/otp/otp.module';
import { PostModule } from 'src/modules/post/post.module';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { ScheduleModule } from 'src/modules/schedule/schedule.module';
import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { UploadFileModule } from 'src/modules/upload-file/upload-file.module';
import { Account } from 'src/modules/user/entity/account.entity';
import { UserState } from 'src/modules/user/entity/user-state.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { CommonModule } from '../common/common.module';
import { NotHostUserScheduleMapping } from 'src/modules/schedule/entity/not-host-user-schedule-mapping.entity';
import { Invitation } from 'src/modules/invitation/entities/invitation.entity';
import { InvitationModule } from 'src/modules/invitation/invitation.module';
import { PingModule } from 'src/modules/ping/ping.module';
import { ScheduleType } from 'src/modules/schedule/entity/schedule-type.entity';
import { PreParticipationModule } from 'src/modules/pre-participation/pre-participation.module';
import { PreParticipation } from 'src/modules/pre-participation/entity/pre-participation.entity';
import { ParticipationType } from 'src/modules/pre-participation/entity/participation-type.entity';
import { ParticipationState } from 'src/modules/pre-participation/entity/participation-state.entity';
import { ClubUser } from 'src/modules/club/entity/club-user.entity';
import { ClubMatchingModule } from 'src/modules/club-matching/club-matching.module';
import { ClubMatching } from 'src/modules/club-matching/entity/club-matching.entity';
import { ClubPostModule } from 'src/modules/club-post/club-post.module';
import { SearchKeyword } from 'src/modules/club/entity/search-keyword.entity';

import {
  ClubPostCategory,
  HandyApproveState,
  ClubPost,
  ClubPostComment,
  ClubPostImage,
  ClubPostLike,
} from 'src/modules/club-post/entity';
import { ClubUserState } from 'src/modules/club/entity/club-user-state.entity';

export const ENTITIES = [
  User,
  Account,
  UserState,
  UploadFile,
  Post,
  Club,
  Schedule,
  ScheduleType,
  NotHostUserScheduleMapping,
  Alarm,
  Chat,
  Auth,
  Like,
  Otp,
  Invitation,
  PreParticipation,
  ParticipationType,
  ParticipationState,
  ClubUser,
  ClubPostCategory,
  HandyApproveState,
  ClubPost,
  ClubPostComment,
  ClubPostImage,
  ClubPostLike,
  ClubMatching,
  Alarm,
  AlarmType,
  AlarmInformation,
  SearchKeyword,
  ClubUserState,
];

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
  MailModule,
  InvitationModule,
  PingModule,
  PreParticipationModule,
  ClubPostModule,
  ClubMatchingModule,
  AlarmModule,
];

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  dbname: string;
}
// [사용법 예시] const dbConfig = this.configService.get<DatabaseConfig>('database');
// const port = dbConfig.port;

export interface TokenInfoConfig {
  accessSecretKey: string;
  accessSecretKeyExpDate: string;
  refrechSecretKey: string;
  refrechSecretKeyExpDate: string;
}

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.GL_DB_HOST,
    port: parseInt(process.env.GL_DB_PORT, 10) || 5432,
    username: process.env.GL_DB_USERNAME,
    password: process.env.GL_DB_PASSWORD,
    dbname: process.env.GL_DB_NAME,
  },
  tokenInfos: {
    accessSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    accessSecretKeyExpDate: process.env.ACCESS_TOKEN_EXPIRE_DATE,
    refrechSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    refrechSecretKeyExpDate: process.env.REFRESH_TOKEN_EXPIRE_DATE,
  },
});
