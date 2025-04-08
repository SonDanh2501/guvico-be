import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import toStream = require('buffer-to-stream');

// cloudinary.config({
//     cloud_name: 'dto1wtlnn',
//     api_key: '263671249237213',
//     api_secret: 'Y3x_TbpzkZtsv_eZtVK8nBN4WHQ',
//     secure: true
// });
// cloudinary.config({
//     cloud_name: 'dcivdqyyj',
//     api_key: '823514258534269',
//     api_secret: 'V9i9FinmZEBxl9wN_APF3h7X2TI',
//     secure: true
// });
cloudinary.config({
    cloud_name: 'dbxnp5vc0',
    api_key: 'no_secret_key',
    api_secret: 'ePBzuw-no_secret_key',
    secure: true
});

@Injectable()
export class CloudinaryService {

    async uploadSingleImage(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream((error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            Readable.from(file.buffer).pipe(upload); // covert buffer to readable stream and pass to upload
            // toStream(file.buffer).pipe(upload); // covert buffer to readable stream and pass to upload
            // console.log(upload,'check upload')
        });
    }

    async createItemSingle(file: Express.Multer.File) {
        try {
            const result = await this.uploadSingleImage(file)
            return result.secure_url;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async uploadMultiImage(
        files: Express.Multer.File[],
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        console.log("CHECK FILES uploadMultiImage", files);
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream((error, result) => {
                if (error) return reject(error);
                resolve(result);
                console.log("check result upload", result);
            });
            if (upload) {
                for (let i = 0; i < files.length; i++) {
                    Readable.from(files[i].buffer).pipe(upload); // covert buffer to readable stream and pass to upload
                    // toStream(file.buffer).pipe(upload); // covert buffer to readable stream and pass to upload
                    console.log(upload, 'check upload')
                }
                // let multiplePicturePromise = files.map((file) =>
                //     cloudinary.uploader.upload(file.path)
                // );
                let imageResponses = Promise.all(files);
                return imageResponses
            }
        });
    }

    async createItemMulti(files: Express.Multer.File[]) {
        // console.log("CHECK FILES CREATE", files);
        try {
            const promoiseArr = []
            for(const item of files) {
                promoiseArr.push(this.uploadSingleImage(item))
            }
            const tempResult = await Promise.all(promoiseArr);
            const result = []
            for(const item of tempResult) {
                result.push(item.secure_url)
            }
            // const result = await this.uploadMultiImage(files)
            // console.log(result, '<<<<<<<<<<<<<<<<<<< result create');
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async createItemMulti(files) {
    //     try {
    //         console.log("CHEKC FILE >>>>>>>>>>>>>>>>>>>.", files);

    //         // let pictureFiles = req.files;
    //         //Check if files exist
    //         // if (!files)
    //         //   return res.status(400).json({ message: "No picture attached!" });
    //         //map through images and create a promise array using cloudinary upload function
    //         let multiplePicturePromise = files.map((picture) =>
    //             Readable.from(picture.buffer)
    //             // cloudinary.uploader.upload(picture.path)
    //         );
    //         console.log("CHECK multiplePicturePromise <<<<<<<<<><>>", multiplePicturePromise);
    //         // return multiplePicturePromise

    //         // await all the cloudinary upload functions in promise.all, exactly where the magic happens
    //         let imageResponses = await Promise.all(multiplePicturePromise);
    //         return imageResponses
    //         let result = JSON.stringify(imageResponses)
    //         return result
    //         // res.status(200).json({ images: imageResponses });    
    //     } catch (err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     };
    // }
    // async uploadMultiImage(files: Array<Express.Multer.File>): Promise<UploadApiResponse | UploadApiErrorResponse> {
    //     return new Promise((resolve, reject) => {
    //         const upload = cloudinary.uploader.upload_stream((error, result) => {
    //             if (error) return reject(error);
    //             resolve(result);
    //         });
    //         for (const file of files) {
    //             const { path } = file;
    //             const newPaths =
    //             // Readable.from(file.buffer).pipe(upload); // covert buffer to readable stream and pass to upload
    //             // toStream(file.buffer).pipe(upload); // covert buffer to readable stream and pass to upload
    //             // console.log(upload,'check upload')
    //         }
    //     });
    // }

    //     async uploadMultiImage() {
    //         const uploader = async (path) => await cloudinary.uploads(path, ' Images ');        const uploa        const uploader = async (path) => await cloudinary.uploads(path, ' Images ');
    //         const uploader = async (path) => await cloudinary.uploads(path, ' Images ');
    //         der = async (path) => await cloudinary.uploads(path, ' Images ');

    //         if (req.method == POST"){
    //         const urls = []
    //         const files = req.files
    //         for (const file of files)
    //             const path
    //     }= file;
    //     const newPath = await up loader(path)
    // urls.push(newPath)
    // fs.unlinkSync(path)
    // }



    //     async createItemMulti(files: Array<Express.Multer.File>) {
    //     try {
    //         const result = await this.uploadMultiImage(files[""])
    //         return result.secure_url;
    //     } catch (err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }


    // const cloudinaryImageUploadMethod = async file => {
    //     return new Promise(resolve => {
    //         cloudinary.uploader.upload( file , (err, res) => {
    //           if (err) return res.status(500).send("upload image error")
    //             resolve({
    //               res: res.secure_url
    //             }) 
    //           }
    //         ) 
    //     })
    //   }



}