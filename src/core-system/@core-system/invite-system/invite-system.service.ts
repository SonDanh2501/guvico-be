import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service';
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service';
import { LinkInviteOopSystemService } from 'src/core-system/@oop-system/link-invite-oop-system/link-invite-oop-system.service';

@Injectable()
export class InviteSystemService {

    constructor (
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private linkInviteOopSystemService: LinkInviteOopSystemService,
        
        private customerOopSystemService: CustomerOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService

    ) {}

    async ProcessBonusInvite() {
        try {
            
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async checkCoditionCollaboratorInvite() {
        try {
            // const payloadResult = {

            // }

            // 1. kiem tra khu vuc CTV co nam trong khu vuc duoc thoa dieu kien gioi thieu khong

            // 2. kiem tra CTV duoc gioi thieu co thoa dieu kien hoan thanh it nhat 5 ca lam khong

            // 3. kiem tra trong 5 ca lam co 3 danh gia tot tu 4 sao tro len trong vong 30 ngay tinh tu ngay kich hoat khong

            // 4. kiem tra nguoi duoc gioi thieu co chinh sach vi pham gi khong



        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkCustomerInvite() {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createNewLinkInvite(payload) {
        try {
            return await this.linkInviteOopSystemService.createNewItem(payload)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getLinkInvite(token) {
        try {
            return await this.linkInviteOopSystemService.getLinkItem(token)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
