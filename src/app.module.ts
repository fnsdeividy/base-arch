import { Module } from '@nestjs/common';
import { AppController } from './shared/adapters/http/controllers/app.controller';
import { AppService } from './shared/application/services/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
