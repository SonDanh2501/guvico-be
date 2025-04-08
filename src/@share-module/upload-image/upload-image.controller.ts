import { Controller, Get, HttpException, HttpStatus, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { UploadImageService } from './upload-image.service'
// import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor } from '@nestjs/cache-manager'
import { FileInterceptor, FilesInterceptor } from '@webundsoehne/nest-fastify-file-upload'
import { CURRENT_SERVER_URL } from 'src/@core'
// import * as path from 'path';
// import * as sharp from 'sharp';
@Controller('/')

export class UploadImageController {
  constructor(private readonly uploadImageService: UploadImageService) { }

  @Post('upload_image_single')
  @UseInterceptors(FileInterceptor('file',
    {
      storage: diskStorage({
        destination: '/public',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        let ext = extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
          return cb(new HttpException('Only images are allowed!', HttpStatus.BAD_REQUEST), null);
        }
        cb(null, true);
      },
      // limits: {
      //   fileSize: 10000
      // },

    },

  )
  )
  async uploadAvatar(
    @Param('userid') userId,
    @UploadedFile() file
  ) {

    const URL = `${CURRENT_SERVER_URL}${'/image/'}${file.path.substring(7)}`;
    console.log('url ', URL);

    // return await this.uploadImageService.setAvatar(Number(userId), `${URL}`);
    return URL;
  }


  @Get('/upload/:fileId')
  // @UseInterceptors(CacheInterceptor)
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    return res.sendFile(fileId, { root: '/public/image' });
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('multi-files', 20, {
    storage: diskStorage({
      destination: '/public/image',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
        return cb(null, `${randomName}${extname(file.originalname)}`)
      },
    }),
    fileFilter: (req, file, cb) => {
      let ext = extname(file.originalname).toLowerCase()
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.gifgif' && ext !== '.svg' && ext !== '.webp') {
        return cb(new HttpException('Only images are allowed!', HttpStatus.BAD_REQUEST), null);
      }
      cb(null, true);
    }
  }),
  )
  async uploadMultipleFiles(@UploadedFiles() files) {
    const response = [];
    files.forEach(file => {
      const fileReponse = {
        filename: file.filename,
      };
      response.push(`${CURRENT_SERVER_URL}${'/image/upload/'}${fileReponse.filename}`);
    });

    const result = await this.uploadImageService.saveData(response);

    return response;
  }

}
