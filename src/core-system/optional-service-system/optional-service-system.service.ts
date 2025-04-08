import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { activeGroupServiceDTOAdmin, ERROR, ExtendOptional, ExtendOptionalDocument, GlobalService, iPageDTO, OptionalService, OptionalServiceDocument } from 'src/@core';
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class OptionalServiceSystemService {

    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(OptionalService.name) private optionalServiceModel: Model<OptionalServiceDocument>,
        @InjectModel(ExtendOptional.name) private extendOptionalServiceModel: Model<ExtendOptionalDocument>,
    ) { }

    async getOptionalServiceByService(lang, iPage: iPageDTO, id: string) {
        try {
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
                .limit(iPage.length).then();
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

    async activeItem(lang, payload: activeGroupServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.optionalServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active != getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            if (getItem.is_active === false) {
                const arrExtendOptional = await this.extendOptionalServiceModel.find({ id_optional_service: getItem._id })
                for (let item of arrExtendOptional) {
                    item.is_active = payload.is_active
                    item.save();
                }
            }
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.optionalServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            const arrExtendOptional = await this.extendOptionalServiceModel.find({ id_optional_service: getItem._id })
            for (let item of arrExtendOptional) {
                item.is_delete = true
                await item.save();
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
