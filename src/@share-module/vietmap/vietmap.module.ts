import { Module } from '@nestjs/common';
import { VietmapController } from './vietmap.controller';
import { VietmapService } from './vietmap.service';

@Module({
  controllers: [VietmapController],
  providers: [VietmapService]
})
export class VietmapModule {}
