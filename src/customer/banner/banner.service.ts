import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalService, iPageDTO } from 'src/@core';
import { Banner, BannerDocument } from 'src/@core/db/schema/banner.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class BannerService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    ) { }

    async getListBanner(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    }]
                },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            const arrItem = await this.bannerModel.find(query).sort({ position: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.bannerModel.count(query)
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

}
