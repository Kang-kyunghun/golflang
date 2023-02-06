import { AlarmModule } from 'src/modules/alarm/alarm.module';
import { Alarm } from 'src/modules/alarm/entity/alarm.entity';
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
import { UserScheduleMapping } from 'src/modules/schedule/entity/user-schedule-mapping.entity';
import { Invitation } from 'src/modules/invitation/entities/invitation.entity';
import { InvitationModule } from 'src/modules/invitation/invitation.module';

export const ENTITIES = [
  User,
  Account,
  UserState,
  UploadFile,
  Post,
  Club,
  Schedule,
  UserScheduleMapping,
  Alarm,
  Chat,
  Auth,
  Like,
  Otp,
  Invitation,
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
