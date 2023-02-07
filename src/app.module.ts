import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ENTITIES, MODULES } from './config/config';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/config';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.GL_DB_HOST,
      port: +process.env.GL_DB_PORT,
      username: process.env.GL_DB_USERNAME,
      password: process.env.GL_DB_PASSWORD,
      database: process.env.GL_DB_NAME,
      synchronize: process.env.NODE_ENV !== 'production',
      namingStrategy: new SnakeNamingStrategy(),
      entities: ENTITIES,
      charset: 'utf8mb4',
    }),
    {
      // jwt 전역 설정으로 수정
      ...JwtModule.register({
        secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      }),
      global: true,
    },
    ...MODULES,
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
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
}
