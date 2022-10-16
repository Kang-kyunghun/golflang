import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { ClubModule } from './club/club.module';
import { ScheduleModule } from './schedule/schedule.module';
import { UploadFileModule } from './upload-file/upload-file.module';
import { AlarmModule } from './alarm/alarm.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { LikeModule } from './like/like.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
