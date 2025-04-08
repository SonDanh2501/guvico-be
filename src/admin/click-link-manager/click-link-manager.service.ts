import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { iPageDTO } from 'src/@core';
import { ClickLink, ClickLinkDocument } from 'src/@core/db/schema/click_link.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ClickLinkManagerService {

    constructor(
        // private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,

        // private activityAdminSystemService: ActivityAdminSystemService,

        // private i18n: I18nContext,
        @InjectModel(ClickLink.name) private bannerModel: Model<ClickLinkDocument>,
    ) { }


    async getListItem(iPage: iPageDTO) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    },]
                },
                {
                    is_delete: false,
                }
                ]
            }
            const arrItem = await this.bannerModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
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

    async getDetailItem(lang, id: string) {
        try {
            const item = await this.bannerModel.findById(id)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // async createItem(lang, payload: createBannerDTOAdmin, idAdmin: string) {
    //     try {

    //         const newItem = new this.bannerModel({
    //             title: payload.title,
    //             image: payload.image,
    //             type_link: payload.type_link,
    //             link_id: payload.link_id,
    //             position: payload.position,
    //             kind: payload.kind
    //         });
    //         await newItem.save();
    //         await this.activityAdminSystemService.createBanner(idAdmin, newItem._id);

    //         return newItem;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }



    // async editItem(lang, payload: editBannerDTOAdmin, id: string, idAdmin: string) {
    //     try {
    //         const getItem = await this.bannerModel.findById(id);
    //         if (!getItem) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         }
    //         console.log(payload, 'payload');
    //         getItem.title = payload.title || getItem.title,
    //             getItem.image = payload.image || getItem.image,
    //             getItem.type_link = payload.type_link || getItem.type_link,
    //             getItem.link_id = payload.link_id || getItem.link_id,
    //             getItem.position = payload.position || getItem.position,
    //             getItem.kind = payload.kind || getItem.kind,
    //             await getItem.save();
    //         await this.activityAdminSystemService.editBanner(idAdmin, id);

    //         return getItem;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // async adminActiBanner(lang, payload: actiBannerDTOAdmin, id: string, idAdmin: string) {
    //     try {
    //         const getItem = await this.bannerModel.findById(id);
    //         console.log(getItem)
    //         console.log("check id", id)
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
    //         await getItem.save();
    //         await this.activityAdminSystemService.activeBanner(idAdmin, id);

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // async adminDeleteBanner(lang, payload: deleteBannerDTOAdmin, id: string, idAdmin: string) {
    //     try {
    //         const getItem = await this.bannerModel.findById(id);
    //         console.log(getItem)
    //         console.log("check id", id)
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         getItem.is_delete = (payload.is_delete !== getItem.is_delete) ? payload.is_delete : getItem.is_delete
    //         await getItem.save();
    //         await this.activityAdminSystemService.deleteBanner(idAdmin, id);

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
}
