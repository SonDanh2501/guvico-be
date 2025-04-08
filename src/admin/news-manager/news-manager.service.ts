import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { activeNewsDTOAdmin, createNewsDTOAdmin, editNewsDTOAdmin, ERROR, GlobalService, iPageDTO, iPageNewsDTOAdmin, News, NewsDocument } from 'src/@core';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class NewsManagerService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,


        private activityAdminSystemService: ActivityAdminSystemService,
        // private i18n: I18nContext,
        @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    ) { }


    async getListItem(lang, iPage: iPageNewsDTOAdmin) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        title: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                    // {
                    //     is_active: true,
                    // }
                ]
            }
            const arrItem = await this.newsModel.find(query)
                .sort({ position: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.newsModel.count(query)

            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }


    async getDetailItem(lang, id: string) {
        try {
            const findItem = await this.newsModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createItem(lang, payload: createNewsDTOAdmin, idAdmin: string) {
        try {
            console.log(payload, 'payload');
            const newCustomer = new this.newsModel({
                title: payload.title,
                short_description: payload.short_description,
                thumbnail: payload.thumbnail,
                url: payload.url,
                type: payload.type,
            });

            await newCustomer.save();
            await this.activityAdminSystemService.createNews(idAdmin, newCustomer._id)
            return newCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editNewsDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.newsModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem) {
                getItem.title = payload.title || getItem.title
                getItem.url = payload.url || getItem.url
                getItem.short_description = payload.short_description || getItem.short_description
                getItem.thumbnail = payload.thumbnail || getItem.thumbnail
                getItem.type = payload.type || getItem.type
                getItem.position = payload.position || getItem.position
                await getItem.save();
                await this.activityAdminSystemService.editNews(idAdmin, getItem._id);
                return getItem;
            }
            else {
                return getItem
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            await this.newsModel.findByIdAndDelete(id);
            await this.activityAdminSystemService.deleteNews(idAdmin, id)
            return `Delete ${id} successfully`;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }


    async activeItem(lang, payload: activeNewsDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.newsModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            this.activityAdminSystemService.actiNews(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


}
