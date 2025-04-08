import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR, UserSystemDocument, createRewardTicketDTO, createRewardTicketFromPolicyDTO, searchQuery } from 'src/@core';
import { RewardTicketRepositoryService } from 'src/@repositories/repository-service/reward-ticket-repository/reward-ticket-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { RewardTicketSystemService } from 'src/core-system/reward-ticket-system/reward-ticket-system.service';

@Injectable()
export class RewardTicketManageService {
    constructor(
        private rewardTicketSystemService: RewardTicketSystemService,
        private rewardTicketRepositoryService: RewardTicketRepositoryService,
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
    ) { }

    async getList(lang, iPage) {
        try {
            const query: any = searchQuery(["id_collaborator.full_name", "id_customer.full_name",
                "id_reward_policy.id_view"], iPage);

            const result = await this.rewardTicketRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 }, [
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_reward_policy", select: { title: 1, id_view: 1 } },
            ])
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getItemById(lang, idTicket: string) {
        try {
            const getTicket = await this.rewardTicketRepositoryService.findOneById(idTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return getTicket;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(lang, payload: createRewardTicketDTO, admin: UserSystemDocument) {
        try {
            const data = {
                title: payload.title,
                user_apply: payload.user_apply,
                id_collaborator: payload.id_collaborator,
                id_customer: payload.id_customer,
                current_total_time_process: payload.current_total_time_process,
                current_total_order_process: payload.current_total_order_process,
                id_reward_policy: payload.id_reward_policy,
                id_transaction: payload.id_transaction,
                reward_money: payload.reward_money,
                id_order: payload.id_order,
            }
            const result = await this.rewardTicketRepositoryService.create(data);
            this.activityAdminSystemService.adminCreateRewardTicket(result, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItemFromPolicy(lang, payload: createRewardTicketFromPolicyDTO, admin: UserSystemDocument) {
        try {
            const result = await this.rewardTicketSystemService.createTicketFromPolicy(lang, payload);
            this.activityAdminSystemService.adminCreatePunishPolicy(admin, result);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyItem(lang, idTicket, admin) {
        try {
            const getTicket = await this.rewardTicketRepositoryService.findOneById(idTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (
                getTicket.status === 'done' ||
                getTicket.status === 'cancel' ||
                getTicket.status === 'revoke' ||
                getTicket.status === 'out_date'
            ) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_VERIFY_ITEM, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const updateData = {
                status: 'done'
            }
            const result = await this.rewardTicketRepositoryService.findByIdAndUpdate(idTicket, updateData);
            this.activityAdminSystemService.adminVerifyRewardTicket(result, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteItem(lang, idTicket, admin) {
        try {
            const getTicket = await this.rewardTicketRepositoryService.findOneById(idTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const result = await this.rewardTicketRepositoryService.findByIdAndSoftDelete(idTicket);
            this.activityAdminSystemService.adminDeleteRewardTicket(result, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateItem(lang, idTicket, payload, admin) {
        try {
            const getTicket = await this.rewardTicketRepositoryService.findOneById(idTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const result = await this.rewardTicketRepositoryService.findByIdAndUpdate(idTicket, payload);
            this.activityAdminSystemService.adminUpdateRewardTicket(result, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
