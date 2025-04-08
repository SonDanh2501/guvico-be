import { Module } from '@nestjs/common';
import { GoongApiController } from './goong-api.controller';
import { GoongModule } from 'src/@share-module/goong/goong.module';
import { JwtStrategyGoong } from 'src/@core';

@Module({
    imports: [
        GoongModule,
    ],
    controllers: [
        GoongApiController
    ],
    providers: [
        JwtStrategyGoong
    ]
})
export class GoongApiModule {}
