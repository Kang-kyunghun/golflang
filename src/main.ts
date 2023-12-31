import { HttpExceptionFilter } from './common/exception/common.exception';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { swaggerSetup } from './util/swagger-setup';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const PORT = process.env.PORT || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 엔티티 데코레이터에 없는 프로퍼티 값은 무조건 거름
      forbidNonWhitelisted: false, // 엔티티 데코레이터에 없는 값 인입시 그 값에 대한 에러메세지 알려주지 않음
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 예외처리 필터
  app.useGlobalFilters(new HttpExceptionFilter());

  // 스웨거 셋업
  swaggerSetup(app);

  // cors 에러 해결
  app.enableCors();

  // 포트 확인
  await app.listen(PORT);
  console.log(`Listening on port ${PORT}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
