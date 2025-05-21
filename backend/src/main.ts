import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware 
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:5173', //  frontend URL
    credentials: true, // cookies
  });


  await app.listen(process.env.PORT ?? 5000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();