import { Injectable, HttpStatus, HttpException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, Order, OrderDocument, PunishCollaboratorDTOAdmin, Service, UserSystemDocument, previousBalanceCollaboratorDTO } from 'src/@core';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service';
import { ActivityCollaboratorSystemService } from '../activity-collaborator-system/activity-collaborator-system.service';
import { CollaboratorSystemService } from '../collaborator-system/collaborator-system.service';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';

@Injectable()
export class PunishSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,

        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(Service.name) private serviceModel: Model<PunishDocument>,
    ) { }
    async systemMonetaryFineCancelJobCollaborator(lang, idCollaborator, payload: PunishCollaboratorDTOAdmin, timeCancelJob) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const newPunish = new this.punishModel({
                id_admin_action: null,
                id_collaborator: getCollaborator._id,
                date_create: new Date(Date.now()).toISOString(),
                date_verify_create: new Date(Date.now()).toISOString(),
                status: "done",
                money: payload.money,
                note_admin: payload.punish_note,
                id_punish: payload.id_punish,
                is_delete: false,
                id_admin_verify: null,
                is_punish_system: true,
                id_order: payload.id_order
            })
            await newPunish.save();
            const previousBalance: previousBalanceCollaboratorDTO = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            getCollaborator.work_wallet -= newPunish.money;
            await getCollaborator.save();
            this.collaboratorSystemService.balanceMoney(lang, getCollaborator._id);
            const getOrder = await this.orderModel.findById(payload.id_order)
            this.activityCollaboratorSystemService.penaltyCancelOrderCollaborator(getCollaborator, payload.money, getOrder.id_group_order, getOrder, previousBalance, newPunish, timeCancelJob)
            return newPunish;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
