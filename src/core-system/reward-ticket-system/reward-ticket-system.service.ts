import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ERROR, GlobalService } from 'src/@core';
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service';
import { RewardPolicyRepositoryService } from 'src/@repositories/repository-service/reward-policy-repository/reward-policy-repository.service';
import { RewardTicketRepositoryService } from 'src/@repositories/repository-service/reward-ticket-repository/reward-ticket-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { createRewardTicketDTO, editRewardTicketDTO, createRewardTicketFromPolicyDTO } from 'src/@core';
import { TransactionSystemService } from '../transaction-system/transaction-system.service';

@Injectable()
export class RewardTicketSystemService {
    constructor(
        private rewardTicketRepositoryService: RewardTicketRepositoryService,
        private rewardPolicyRepositoryService: RewardPolicyRepositoryService,
        private orderRepositoryService: OrderRepositoryService,
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private transactionSytemService: TransactionSystemService,
    ) { }

    async createItem(payload: createRewardTicketDTO) {
        try {
            const data: createRewardTicketDTO = {
                title: payload.title,
                user_apply: payload.user_apply,
                id_collaborator: payload.id_collaborator,
                id_customer: payload.id_customer,
                current_total_time_process: payload.current_total_time_process,
                current_total_order_process: payload.current_total_order_process,
                status: 'standby',
                id_reward_policy: payload.id_reward_policy,
                id_transaction: payload.id_transaction,
                reward_money: payload.reward_money,
                id_order: payload.id_order,
                date_done: payload.date_done,
            }
            const result = await this.rewardTicketRepositoryService.create(data);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createTicketFromPolicy(lang, payload: createRewardTicketFromPolicyDTO) {
        try {
            const getPolicy = await this.rewardPolicyRepositoryService.findOneById(payload.id_reward_policy);
            if (!getPolicy) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);

            let rewardMoney = getPolicy.reward_money;
            if (getPolicy.reward_money_type === 'percent_of_initial_fee_order') {
                const getOrder = await this.orderRepositoryService.findOneById(payload.id_order);
                if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
                let initialFee = getOrder.initial_fee / 1000;
                rewardMoney = Number((initialFee * (getPolicy.reward_money / 100)).toFixed) * 1000;
            }

            if (getPolicy.user_apply === 'collaborator') {
                payload.id_customer = null;
            } else {
                payload.id_collaborator = null;
            }

            // Check điều kiện giới hạn dựa vào Policy
            if (getPolicy.is_count_limit === true) {
                const count = await this.rewardTicketRepositoryService.countDataByCondition({ id_reward_policy: payload.id_reward_policy });
                if (count >= getPolicy.count_limit) throw new HttpException([await this.customExceptionService.i18nError(ERROR.REACH_LIMIT_POLICY, "en", null)], HttpStatus.BAD_REQUEST);
            }
            if (getPolicy.is_count_per_user_limit === true) {
                if (getPolicy.user_apply === 'customer') {
                    const count = await this.rewardTicketRepositoryService.countDataByCondition({ id_reward_policy: payload.id_reward_policy, id_customer: payload.id_customer });
                    if (count >= getPolicy.count_per_user_limit) throw new HttpException([await this.customExceptionService.i18nError(ERROR.REACH_LIMIT_POLICY, "en", null)], HttpStatus.BAD_REQUEST);
                } else {
                    const count = await this.rewardTicketRepositoryService.countDataByCondition({ id_reward_policy: payload.id_reward_policy, id_collaborator: payload.id_collaborator });
                    if (count >= getPolicy.count_per_user_limit) throw new HttpException([await this.customExceptionService.i18nError(ERROR.REACH_LIMIT_POLICY, "en", null)], HttpStatus.BAD_REQUEST);
                }
            }
            const data = {
                title: getPolicy.title,
                user_apply: getPolicy.user_apply,
                id_collaborator: payload.id_collaborator,
                id_customer: payload.id_customer,
                current_total_time_process: 1,
                current_total_order_process: 1,
                status: "standby",
                id_reward_policy: payload.id_reward_policy,
                id_transaction: null,
                reward_money: rewardMoney,
                id_order: payload.id_order,
                date_done: null
            }
            const result = await this.rewardTicketRepositoryService.create(data);
            // Tạo transaction nếu có reward_money
            if (rewardMoney > 0) {
                // this.transactionSytemService.createItem({
                //     id_collaborator:result.id_collaborator,
                //     id_customer:result.id_customer,
                //     money:result.reward_money,
                //     kind_transfer:"expense",
                //     type_transfer:'reward',
                // })
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async updateItem(idRewardTicket: string, payload: editRewardTicketDTO) {
        try {
            const getTicket = await this.rewardPolicyRepositoryService.findOneById(idRewardTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            const result = await this.rewardTicketRepositoryService.findByIdAndUpdate(idRewardTicket, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(idRewardTicket: string) {
        try {
            const getTicket = await this.rewardTicketRepositoryService.findOneById(idRewardTicket);
            if (!getTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            const result = await this.rewardTicketRepositoryService.findByIdAndSoftDelete(idRewardTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
