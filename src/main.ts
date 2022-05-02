import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3500);
  await console.log(
    'Starting on port 3500\nOpen browser to http://localhost:3500/:channelName',
  );
}
bootstrap();
