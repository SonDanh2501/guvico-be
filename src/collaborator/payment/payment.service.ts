import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, ERROR, GUVI_BANKING_INFOR, GlobalService, TransitionCollaborator, TransitionCollaboratorDocument } from 'src/@core';
import { createTransactionDTO } from 'src/@core/dto/transaction.dto';
import { PAYMENT_ENUM, TYPE_TRANSFER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { createPaymentMoMoDTO } from 'src/@share-module/momo/dto/momo.dto';
import { MomoService } from 'src/@share-module/momo/momo.service';
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service';
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service';
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service';

@Injectable()
export class PaymentService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private globalService: GlobalService,
        private transactionSystemService: TransactionSystemService,
        private momoService: MomoService,
        private transactionRepository: TransactionRepositoryService,
        private activitySystemService: ActivitySystemService,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,

    ) { }

    async createMoMoPayment(lang, payload: createPaymentMoMoDTO, user: CollaboratorDocument) {
        try {

            // throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_MAIN_TAIN, lang, null)], HttpStatus.NOT_FOUND);

            const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCollaborator(user);
            const dataCreate: createTransactionDTO = {
                id_collaborator: user._id,
                money: payload.amount,
                subject: 'collaborator',
                transfer_note: _transfer_note,
                type_transfer: TYPE_TRANSFER.top_up,
                payment_in: PAYMENT_ENUM.momo,
                payment_out: PAYMENT_ENUM.momo,
                type_wallet: TYPE_WALLET.work_wallet
            }
            const newTransaction = await this.transactionSystemService.createItem(dataCreate)
            this.activitySystemService.createTransaction(newTransaction);
            const isCustomer = false;
            const result = await this.momoService.createPaymentUrlV2(lang, payload, user, newTransaction, isCustomer);
            newTransaction.momo_transfer = result;
            await this.transactionRepository.findByIdAndUpdate(newTransaction._id, newTransaction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);
        }
    }

}
