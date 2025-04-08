import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service';
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service';
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class HandleLogicSystemService {
    constructor(
        private orderRepositoryService: OrderRepositoryService,
        private reasonsCancelRepositoryService: ReasonsCancelRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,

        private customExceptionService: CustomExceptionService
    ) {}

    async exceptionHandle(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

    async customHandleCustom(lang, errorMess, field?, status?){
        try {
            throw new HttpException([await this.customExceptionService.i18nError(errorMess, lang, field || null)], status || HttpStatus.FORBIDDEN);
        } catch (err) {
            await this.exceptionHandle(err);
        }
    }

    async findAndCheckExistsGroupOrder(lang, idItem) {
        try {

            const findItem = await this.groupOrderRepositoryService.findOneById(idItem);
            if(!findItem) await this.customHandleCustom(ERROR.ITEM_NOT_FOUND, lang, "group_order", HttpStatus.NOT_FOUND)
            return findItem;
        } catch (err) {
            await this.exceptionHandle(err);
        }
    }

    async findAndCheckExistsCustomer(lang, idItem) {
        try {

            const findItem = await this.customerRepositoryService.findOneById(idItem);
            if(!findItem) await this.customHandleCustom(ERROR.ITEM_NOT_FOUND, lang, "customer", HttpStatus.NOT_FOUND)
            return findItem;
        } catch (err) {
            await this.exceptionHandle(err);
        }
    }

    async findAndCheckExistsCollaborator(lang, idItem) {
        try {

            const findItem = await this.collaboratorRepositoryService.findOneById(idItem);
            if(!findItem) await this.customHandleCustom(ERROR.ITEM_NOT_FOUND, lang, "collaborator", HttpStatus.NOT_FOUND)
            return findItem;
        } catch (err) {
            await this.exceptionHandle(err);
        }
    }

    async findAndCheckExistsOrder(lang, idItem) {
        try {
            const findItem = await this.orderRepositoryService.findOneById(idItem);
            if(!findItem) await this.customHandleCustom(ERROR.ITEM_NOT_FOUND, lang, "order", HttpStatus.NOT_FOUND)
            return findItem;
        } catch (err) {
            await this.exceptionHandle(err);
        }
    }
}
