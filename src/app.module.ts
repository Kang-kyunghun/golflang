import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ENTITIES, MODULES } from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'develop' ? '.env' : '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.GL_DB_HOST,
      port: +process.env.GL_DB_PORT,
      username: process.env.GL_DB_USERNAME,
      password: process.env.GL_DB_PASSWORD,
      database: process.env.GL_DB_NAME,
      synchronize: false,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
      entities: ENTITIES,
      charset: 'utf8mb4',
    }),
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
}
