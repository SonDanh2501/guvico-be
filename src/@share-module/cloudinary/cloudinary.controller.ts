import { Controller, HttpException, HttpStatus, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { CloudinaryService } from './cloudinary.service';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) { }

  @ApiTags('cloudinary')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createItemSingle(
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log(file);
      const result = await this.cloudinaryService.createItemSingle(file);
      return result;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('cloudinary')
  @Post('uploadMultiple')
  @UseInterceptors(AnyFilesInterceptor())
  async createItemMulti
    (
      @UploadedFiles() files: Array<Express.Multer.File>
    ) {
    try {
      console.log(files, '<<<<<<<<<<<<<<<<<<< files');
      const result = await this.cloudinaryService.createItemMulti(files);
      return result;
      // return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }



  // router.post("/", upload.array("img", 3 ), async (req, res) => {

  //     const urls = [];
  //     const files = req.files;
  //     for (const file of files) {
  //       const { path } = file;
  //       const newPath = await cloudinaryImageUploadMethod(path);
  //       urls.push(newPath);
  //     } 

  //     const product = new Product({ 
  //       name: req.body.name,
  //       productImages: urls.map( url => url.res ),
  //     });

  //  }

  // @Post('uploadFields')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //     FileFieldsInterceptor(
  //         [
  //             // 👈  multiple files with different field names
  //             { name: 'avatar', maxCount: 1 },
  //             { name: 'background', maxCount: 1 },
  //         ],
  //         // {
  //         //   storage: diskStorage({
  //         //     destination: getFileUploadFolder,
  //         //     filename: randomizedFileName,
  //         //   }),
  //         //   fileFilter: imageFileFilter,
  //         // },
  //     ),
  // )
  // @ApiBody({
  //     schema: {
  //         type: 'object',
  //         properties: {
  //             // 👈 matches field names
  //             avatar: {
  //                 type: 'string',
  //                 format: 'binary',
  //             },
  //             background: {
  //                 type: 'string',
  //                 format: 'binary',
  //             },
  //         },
  //     },
  // })
  // async uploadFields(
  //     @UploadedFiles()
  //     files: {
  //         avatar?: Express.Multer.File[];
  //         background?: Express.Multer.File[];
  //     },
  //     // files: {
  //     //     image?: Express.Multer.File[],
  //     // }

  // ) {
  //     const response = [];
  //     files.avatar.forEach((file) => {
  //         const fileReponse = {
  //             originalname: file.originalname,
  //             newfilename: file.filename,
  //         };
  //         response.push(fileReponse);
  //     });

  //     files.background.forEach((file) => {
  //         const fileReponse = {
  //             originalname: file.originalname,
  //             newfilename: file.filename,
  //         };
  //         response.push(fileReponse);
  //     });
  //     //     const fileReponse = {
  //     //         originalname: file.originalname,
  //     //         newfilename: file.filename,
  //     //     };
  //     //     response.push(fileReponse);
  //     // });
  //     // return response;

  //     // files.image.map((file) => {
  //     //     const fileReponse = {
  //     //         originalname: file.originalname,
  //     //         newfilename: file.filename,
  //     //     };
  //     //     response.push(fileReponse);
  //     // }
  //     // );


  //     //     const fileReponse = {
  //     //       originalname: file.originalname,
  //     //       newfilename: file.filename,
  //     //     };
  //     //     response.push(fileReponse);
  //     //   });

  //     //   files.background.forEach((file) => {
  //     //     const fileReponse = {
  //     //       originalname: file.originalname,
  //     //       newfilename: file.filename,
  //     //     };
  //     //     response.push(fileReponse);
  //     //   });
  //     return response;
  // }

  @Post('uploadFields')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        // 👈  multiple files with different field names
        { name: 'avatar', maxCount: 2 },
        { name: 'background', maxCount: 2 },
      ],
      // {
      //   storage: diskStorage({
      //     destination: getFileUploadFolder,
      //     filename: randomizedFileName,
      //   }),
      //   fileFilter: imageFileFilter,
      // },
    ),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // 👈 matches field names
        avatar: {
          type: 'string',
          format: 'binary',
        },
        background: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFields(
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    const response = [];
    files.avatar.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        file: file
        //   newfilename: file.filename,
        //   secure_url: file.url,
      };
      response.push(fileReponse);
    });

    files.background.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        file: file

        //   newfilename: file.filename,
        //   secure_url: file.secure_url,
      };
      response.push(fileReponse);
    });
    return response;
  }

}
