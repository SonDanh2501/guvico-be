import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, REFERRAL_GIFT } from 'src/@core'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { NotificationSystemService } from '../@core-system/notification-system/notification-system.service'
import { HistoryActivityOopSystemService } from '../@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { ActivityCustomerSystemService } from '../activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
@Injectable()
export class InviteCodeSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private activitySystemService: ActivitySystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private notificationSystemService: NotificationSystemService,



        // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
    ) { }


    async addGiftRemainder(lang, idUser) {
        try {
            let getCollaborator = await this.collaboratorRepositoryService.findOneById(idUser);
            if (!getCollaborator) {
                return true
            }

            if (getCollaborator.is_added_gift_remainder === true) 
            {
                return true;
            }

            if (getCollaborator.id_inviter !== null) {
                let getInviter = await this.collaboratorRepositoryService.findOneById(getCollaborator.id_inviter);
                if (getInviter) {
                    const payloadDependency = {
                        collaborator: null
                    }
                    
                    const subjectAction = {
                        type: TYPE_SUBJECT_ACTION.system
                    }
    
                    payloadDependency.collaborator = getInviter
                    let previousBalance = {
                        work_wallet: getInviter.work_wallet
                    }
                    getCollaborator.is_added_gift_remainder = true;
                    // getInviter.gift_remainder = getInviter.gift_remainder + 100000;
                    getInviter.work_wallet = getInviter.work_wallet + REFERRAL_GIFT;
    
                    getCollaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(idUser, getCollaborator);
                    payloadDependency.collaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator.id_inviter, getInviter);
    
                    // Log tang tien thuong 
                    await this.historyActivityOopSystemService.systemGiveMoney(subjectAction, payloadDependency, getCollaborator, previousBalance, REFERRAL_GIFT)
                    await this.notificationSystemService.addMoneyIntoWorkWallet(lang, getCollaborator, getInviter, REFERRAL_GIFT)
                    // this.activitySystemService.systemGiveMoney(getCollaborator._id, getInviter._id, REFERRAL_GIFT)
                }

            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async addCodeInviterCollaborator(lang, idCode, idUser) {
        try {
            const getData = await Promise.all([
                this.collaboratorRepositoryService.findOneById(idUser),
                this.collaboratorModel.findOne({ invite_code: idCode })
                
            ])
            if (!getData[0]) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.ACCOUNT_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            if (!getData[1]) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            getData[0].id_inviter = getData[1]._id;
            await Promise.all([
                this.collaboratorRepositoryService.findByIdAndUpdate(idUser, getData[0]),
                getData[1].save()
            ])

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
