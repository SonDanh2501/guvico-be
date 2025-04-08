import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR } from 'src/@core';
import { FileManager, FileManagerDocument } from 'src/@core/db/schema/file_manager.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import * as fs from 'fs';

@Injectable()
export class FileManagerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        @InjectModel(FileManager.name) private fileModel: Model<FileManagerDocument>,
    ) { }


    async getList(lang, iPage) {
        try {
            let query = {
                $or: [
                    {
                        title: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    }
                ]
            }
            const getList = await this.fileModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.fileModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getList
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, idFiles) {
        try {
            for(const item of idFiles) {
                const getItem = await this.fileModel.findById(item);
                if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, item._id)], HttpStatus.NOT_FOUND);
                await fs.unlink(`/public/image/${getItem.title}`, async (err) => {
                    if (err) {
                     console.error(err);
                     throw new HttpException([{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);
                    }
                    await this.fileModel.findByIdAndDelete(getItem._id);
                   });
                // await getItem.save();
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListFileUnconnect(lang, iPage) {
        try {
            let query = {
                $or: [
                    {
                        title: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    }
                ]
            }
            const getList = await this.fileModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            // const count = await this.fileModel.count(query);
            // let countItem = 0;
            // const arrList = [];
            // for(const item of getList) {
            //     const findCTV = await this.
            // }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: 0,
                data: getList
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
