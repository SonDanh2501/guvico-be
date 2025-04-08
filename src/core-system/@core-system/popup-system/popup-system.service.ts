import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { iPagePopupDTOAdmin } from 'src/@core/dto/popup.dto';
import { PopupOopSystemService } from 'src/core-system/@oop-system/popup-oop-system/popup-oop-system.service';

@Injectable()
export class PopupSystemService {
    constructor(
        private popupOopSystemService: PopupOopSystemService
    ) { }

    async createPopup(payload) {
        try {
            return this.popupOopSystemService.createNewItem(payload)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItem(lang, idItem) {
        try {
            return this.popupOopSystemService.getDetailItem(lang, idItem)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getList(iPage: iPagePopupDTOAdmin) {
        try {
            return await this.popupOopSystemService.getList(iPage)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    async updateIsActiveItem(lang, idItem) {
        try {
            return await this.popupOopSystemService.updateIsActive(lang, idItem)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
