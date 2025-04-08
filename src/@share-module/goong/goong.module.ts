import { Module } from '@nestjs/common';
import { GoongController } from './goong.controller';
import { GoongService } from './goong.service';
import { HttpModule } from '@nestjs/axios';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';

@Module({
  imports: [        
    HttpModule,
    CustomExceptionModule
  ],
  controllers: [GoongController],
  providers: [GoongService],
  exports: [GoongService],
})
export class GoongModule {}
