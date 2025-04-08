import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';
import { MulterModule } from '@webundsoehne/nest-fastify-file-upload';
@Module({
    imports: [
        MulterModule.register({
            storage: memoryStorage(), // use memory storage for having the buffer
          }),
    ],
    providers: [CloudinaryService],
      controllers: [CloudinaryController],
})
export class CloudinaryModule { }
