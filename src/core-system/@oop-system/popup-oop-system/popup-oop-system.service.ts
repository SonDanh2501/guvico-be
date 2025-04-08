import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { iPagePopupDTOAdmin } from 'src/@core/dto/popup.dto';
import { PopupRepositoryService } from 'src/@repositories/repository-service/popup-repository/popup-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';

@Injectable()
export class PopupOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private popupRepositoryService: PopupRepositoryService,
    ) { }


    async createNewItem(payload) {
        try {
            const payloadCreate = {
                image: payload.image,
                is_active: payload.is_active || true,
                start_date: payload.start_date,
                end_date: payload.end_date,
                is_date_schedule: payload.is_date_schedule || false,
                date_create: new Date().toISOString(),
                status: payload.status,
                is_delete: false,
                screen: payload.screen,
                is_counted: payload.is_counted || false,
                key_event_count: payload.key_event_count || null,
                deep_link: payload.deep_link || null

            }
            return await this.popupRepositoryService.create(payloadCreate)

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.popupRepositoryService.findOneById(idItem);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "popup")], HttpStatus.NOT_FOUND)
            }
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getList(iPage: iPagePopupDTOAdmin) {
        try {
            const query: any = {
                $and: []
            }
            const iPageTransactionDTOAdminKeys = ['status', 'start_date', 'end_date',
                'screen', 'id_counted'];
            const iPagaDTOKeys = Object.keys(iPage)
            const filkey = iPageTransactionDTOAdminKeys.filter(key => iPagaDTOKeys.includes(key));
            for (const itemKey of filkey) {
                if (iPage[itemKey] !== "" && itemKey !== "start_date" && itemKey !== "end_date") {
                    query.$and.push({ [itemKey]: iPage[itemKey] })
                }
            }
            if (iPage.start_date && iPage.end_date) {
                query.$and.push({
                    $and: [
                        { date_create: { $lte: iPage.end_date } },
                        { date_create: { $gte: iPage.start_date } }
                    ]
                })
            }

            const sortOption = { date_create: -1 }; // Sắp xếp theo date_created giảm dần (mới nhất)
            return await this.popupRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateIsActive(lang, idItem) {
        try {
            let popup = await this.getDetailItem(lang, idItem)
            popup.is_active = !popup.is_active
            popup = await this.popupRepositoryService.findByIdAndUpdate(idItem, popup)
            return popup
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
