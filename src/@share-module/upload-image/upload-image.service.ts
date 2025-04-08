import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUploadImageDto } from './dto/create-upload-image.dto';
import { UpdateUploadImageDto } from './dto/update-upload-image.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileManager, FileManagerDocument } from 'src/@core/db/schema/file_manager.schema';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';

@Injectable()
export class UploadImageService {

  constructor(
    @InjectModel(FileManager.name) private fileManagerModel: Model<FileManagerDocument>,
) { }

  async setAvatar(userId: number, avatarUrl: string) {
    
    try {
      
    } catch (err) {
      
    }
  }

  async saveData(arrLinks) {
    try {
      let pushSave = [];
      for(const item of arrLinks) {
        const temp = item.split("/");
        const newItem = new this.fileManagerModel({
          title: temp[temp.length - 1],
          date_create: new Date(Date.now()).toISOString(),
          link_url: item
      });
      pushSave.push(newItem.save());
      }
      await Promise.all(pushSave);
      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  
}
