import { Module } from '@nestjs/common';
import { UploadImageService } from './upload-image.service';
import { UploadImageController } from './upload-image.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BASEPOINT_DB } from 'src/@core';
import { FileManager, fileManagerSchema } from 'src/@core/db/schema/file_manager.schema';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: FileManager.name, schema: fileManagerSchema },
    ]),
    // CacheModule.register({
    //   ttl: 1800, // seconds
    //   max: 100, // maximum number of items in cache
    // })
  ],
  controllers: [UploadImageController],
  providers: [
    UploadImageService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ]
})
export class UploadImageModule { }
