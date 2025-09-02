import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';

@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class SharedModule { }


