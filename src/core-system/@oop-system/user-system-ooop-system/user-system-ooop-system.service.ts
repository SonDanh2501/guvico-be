import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class UserSystemOoopSystemService {
    constructor (
        private customExceptionService: CustomExceptionService,
        private userSystemRepositoryService: UserSystemRepositoryService
    ) {}

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.userSystemRepositoryService.findOneById(idItem);
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateSocketAdmin(lang, idAdmin, isDisconnect:boolean = true, sessionSocket?) {
        try {
            let getAdmin = await this.getDetailItem(lang, idAdmin);
            if (isDisconnect) {
                getAdmin.session_socket = null
            } else {
                getAdmin.session_socket = sessionSocket
            }
            getAdmin = await this.userSystemRepositoryService.findByIdAndUpdate(idAdmin, getAdmin);

            return getAdmin
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItemForWebSocket(idCustomer) {
        const getCustomer = await this.userSystemRepositoryService.findOneById(idCustomer);
        return getCustomer;
    }
}
