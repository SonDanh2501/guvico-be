import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, iPageDTO, queryWithinRangeDate, searchQuery } from 'src/@core'
import { createPunishTicketFromPolicyDTO, iPagePunishTicketDTOAdmin } from 'src/@core/dto/punishTicket.dto'
import { UserSystemDocument } from 'src/@repositories/module/mongodb/@database'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { PunishTicketRepositoryService } from 'src/@repositories/repository-service/punish-ticket-repository/punish-ticket-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { PunishTicketSystemService } from 'src/core-system/punish-ticket-system/punish-ticket-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'

@Injectable()
export class PunishTicketManageService {
    constructor(
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private punishTicketRepositoryService: PunishTicketRepositoryService,
        private orderRepositoryService: OrderRepositoryService,
        private punishTicketSystemService: PunishTicketSystemService,
        private punishPolicyRepositoryService: PunishPolicyRepositoryService,
        private transactionRepositoryService: TransactionRepositoryService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private activitySystemService: ActivitySystemService,
        private transactionSystemService: TransactionSystemService,
        private orderSystemService: OrderSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
    ) { }


    async getListItem(lang, iPage) {
        try {
            const query: any = searchQuery(["id_collaborator.full_name", "id_customer.full_name",
                "id_punish_policy.id_view"
            ], iPage)
            if (iPage.user_apply && iPage.user_apply !== "") {
                query.$and.push({ user_apply: iPage.user_apply });
            }
            if (iPage.status && iPage.status !== "") {
                query.$and.push({ status: iPage.status });
            }
            if (iPage.payment_out && iPage.payment_out !== "") {
                query.$and.push({ payment_out: iPage.payment_out });
            }
            if (iPage.start_date && iPage.end_date) {
                query.$and.push(
                    queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                );
            }
            if (iPage.created_by === 'system') {
                query.$and.push({
                    $and: [
                        { id_admin_action: null },
                        { id_admin_verify: null }
                    ]
                });
            } else if (iPage.created_by === 'admin_action') {
                query.$and.push({
                    $and: [
                        { id_admin_action: { $ne: null } },
                    ]
                });
            }
            const result = await this.punishTicketRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 }, [
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_punish_policy", select: { title: 1, id_view: 1 } },
                { path: "id_transaction", select: { title: 1, id_view: 1, _id: 1 } },
                { path: "id_order", select: { id_group_order: 1, id_view: 1 } },
                { path: "id_admin_action", select: { full_name: 1, email: 1 } },
            ]);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getItemById(lang, idTicket) {
        try {
            const getTicket = await this.punishTicketRepositoryService.findOneById(idTicket, {}, [
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, id_view: 1 } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, id_view: 1 } },
                { path: "id_punish_policy", select: { title: 1, id_view: 1 } },
                { path: "id_transaction", select: { title: 1, id_view: 1, money: 1, date_create: 1, status: 1 } },
                { path: "id_order", select: { name_customer: 1, phone_customer: 1, id_view: 1, final_fee: 1, date_work: 1, date_create: 1, } },
            ]);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return getTicket;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createPunishTicketFromPolicy(lang, payload: createPunishTicketFromPolicyDTO, admin: UserSystemDocument) {
        try {
            const result = await this.punishTicketSystemService.createPunishTicketFromPolicy(lang, payload, admin);
            await this.activitySystemService.createPunishTicket(result);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyItem(lang, admin: UserSystemDocument, idPunishTicket: string) {
        try {
            const getPunishTicket = await this.punishTicketRepositoryService.findOneById(idPunishTicket);
            if (!getPunishTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'punish ticket')], HttpStatus.NOT_FOUND);
            let result = await this.punishTicketSystemService.standbyToWaitingPunishTicket(lang, getPunishTicket);
            await this.activitySystemService.standbyToWaitingPunishTicket(getPunishTicket, admin);
            // ---------------------------------------------------------------- // 
            result = await this.punishTicketSystemService.waitingToDoingPunishTicket(lang, result, admin);
            await this.activitySystemService.waitingToDoingPunishTicket(getPunishTicket, admin);
            result.id_admin_verify = admin._id;
            const timeEnd = new Date(getPunishTicket.time_end).getTime();
            const timeNow = new Date(new Date(Date.now()).toISOString()).getTime();
            if (timeEnd < timeNow) {
                result = await this.punishTicketSystemService.doingToDonePunishTicket(lang, result, admin);
                await this.activitySystemService.verifyPunishTicket(result);
            }
            if (result.id_transaction) {
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(getPunishTicket.id_collaborator.toString());
                const previousBalance = {
                    work_wallet: getCollaborator.work_wallet,
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                }
                const verifyTransaction = await this.transactionSystemService.verifyTransaction(lang, result.id_transaction);
                this.activitySystemService.verifyPunishCollaborator(verifyTransaction.transaction, verifyTransaction.collaborator, previousBalance, admin)
            }

            // ---------------------------------------------------------------- //
            await this.punishTicketRepositoryService.findByIdAndUpdate(getPunishTicket._id, result);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delteItem(lang, admin: UserSystemDocument, idPunishTicket: string) {
        try {
            const getTicket = await this.punishTicketRepositoryService.findOneById(idPunishTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            await this.punishTicketSystemService.checkStatusPunishTicket(getTicket, ["done"], lang)
            // const result = await this.punishTicketSystemService.deleteItem(lang, idPunishTicket);
            // this.activityAdminSystemService.adminDeletePunishTicket(result, admin);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelItem(lang, admin: UserSystemDocument, idPunishTicket: string) {
        try {
            const getTicket = await this.punishTicketRepositoryService.findOneById(idPunishTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const result = await this.punishTicketSystemService.standbyToCancelPunishTicket(lang, getTicket, admin);
            // this.activityAdminSystemService.adminCancelPunishTicket(result, admin);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokeItem(lang, idTicket, admin) {
        try {
            const getTicket = await this.punishTicketRepositoryService.findOneById(idTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const result = this.punishTicketSystemService.revokeTicket(getTicket, admin, lang);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getActivityHistoryPunishTicket(lang, idTicket: string, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { "id_punish_ticket._id": idTicket },
                ]
            }
            const getHistory = await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 },
                [
                    { path: "id_punish_ticket", select: { title: 1, _id: 1, id_view: 1 } },
                    { path: "id_collaborator", select: { full_name: 1, _id: 1, phone: 1 } },
                    { path: "id_admin_action", select: { full_name: 1, _id: 1, email: 1 } },
                ]
            );
            return getHistory;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTotalPunishTicket(lang, iPage: iPagePunishTicketDTOAdmin) {
        try {
            const result = {
                total: '',
                standby: 'standby',
                waiting: 'waiting',
                processing: 'processing',
                doing: 'doing',
                done: 'done',
                cancel: 'cancel',
                revoke: 'revoke',
            }

            for (const key in result) {
                const query: any = {
                    $and: [
                        { is_active: true }
                    ]
                }
                if (iPage.start_date && iPage.end_date) {
                    query.$and.push(
                        queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                    );
                }
                if (result[key] !== '') {
                    query.$and.push({ status: result[key] });
                }
                const total = await this.punishTicketRepositoryService.countDataByCondition(query);
                result[key] = total
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
