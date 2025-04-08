import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { LinkInviteRepositoryService } from 'src/@repositories/repository-service/link-invite-repository/link-invite-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';

@Injectable()
export class LinkInviteOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
    
        private linkInviteRepositoryService: LinkInviteRepositoryService,
    ) {}


    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.linkInviteRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "link_invite")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOneByCodeInvite(lang, codeInvite) {
        try {
            const query = {
                $and: [
                    {code_invite: codeInvite}
                ]
            }
            const getItem = await this.linkInviteRepositoryService.findOne(query, {}, {date_create: -1});
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "link_invite")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createNewItem(payload) {
        try {
            const payloadCreate = {
                ip: null,
                token: payload.id_bundle,
                date_create: new Date().toISOString(),
                code_invite: payload.referral_code,
                is_active : true,
                is_delete : false
            }
            await this.linkInviteRepositoryService.create(payloadCreate)
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getLinkItem(token) {
        try {
            const query = {
                $and: [
                    { token: token }
                ]
            }
            
            return await this.linkInviteRepositoryService.findOne(query, {}, { date_create: -1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
