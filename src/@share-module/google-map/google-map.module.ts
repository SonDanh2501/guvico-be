import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';
import { GoogleMapController } from './google-map.controller';
import { GoogleMapService } from './google-map.service';

@Module({
    imports: [
        HttpModule,
        CustomExceptionModule
    ],
    controllers: [GoogleMapController],
    providers: [GoogleMapService],
})
export class GoogleMapModule { }
