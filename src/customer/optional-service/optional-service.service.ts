import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, GlobalService, iPageDTO } from 'src/@core';
import { OptionalService, OptionalServiceDocument } from 'src/@core/db/schema/optional_service.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class OptionalServiceService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(OptionalService.name) private optionalServiceModel: Model<OptionalServiceDocument>,
    ) { }


    async getOptionalServiceByService(lang, iPage: iPageDTO, id: string) {
        try {
            console.log(id, "id");

            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                {
                    is_active: true
                },
                {
                    id_service: [id.toString()]
                },
                {
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            const arrItem = await this.optionalServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ position: 1 });
            const count = await this.optionalServiceModel.count(query)
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



    async getDetailOptionalService(lang, id: string) {
        try {
            const findItem = await this.optionalServiceModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHolidayOptionalServiceByService(lang, iPage: iPageDTO, id: string) {
        try {
            const query = {
                $and: [
                    {
                        is_active: true
                    },
                    {
                        id_service: [id.toString()]
                    },
                    {
                        $or: [
                            { is_delete: false },
                            { is_delete: { $exists: false } }
                        ]
                    }
                ]
            }
            const arrItem = await this.optionalServiceModel.find(query)
            const holiday = []
            for (let item of arrItem) {
                holiday.push(item.price_option_holiday)
            }
            return holiday
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
