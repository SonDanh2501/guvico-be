import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePunishPolicyDTO, IPagePunishPolicyDTO, IPageRewardPolicyDTO } from 'src/@core';
import { ERROR, searchQuery, } from 'src/@core';
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { RewardPolicyRepositoryService } from 'src/@repositories/repository-service/reward-policy-repository/reward-policy-repository.service';
import { PunishTicketSystemService } from 'src/core-system/punish-ticket-system/punish-ticket-system.service';
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto';


@Injectable()
export class PolicyManageService {
    constructor(
        private punishPolicyRepositoryService: PunishPolicyRepositoryService,
        private punishTicketSystemService: PunishTicketSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private rewardPolicyRepositoryService: RewardPolicyRepositoryService,
    ) { }

    async createPunishPolicy(lang, punishPolicy, admin) {
        try {
            if (!punishPolicy.id_view) {
                const idView = await this.generalHandleService.GenerateRandomString(5);
                punishPolicy.id_view = idView;
            }
            let newPunish:any;
            const check = await this.punishPolicyRepositoryService.countDataByCondition({"title.vi":punishPolicy.title.vi, "description.vi":punishPolicy.description.vi}); 
            if(check < 1){
                newPunish = await this.punishPolicyRepositoryService.create(punishPolicy);
            } else throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_ALREADY_EXISTS, lang, null)], HttpStatus.NOT_FOUND);
            this.activityAdminSystemService.adminCreatePunishPolicy(admin, newPunish);
            return newPunish;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editPunishPolicy(lang, idPunish, punishPolicy, user) {
        try {
            const punishPolicy = await this.punishPolicyRepositoryService.findOneById(idPunish);
            if (!punishPolicy || punishPolicy.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            await this.punishPolicyRepositoryService.findByIdAndUpdate(idPunish, punishPolicy);
            this.activityAdminSystemService.adminEditPunishPolicy(user, punishPolicy);
            return true
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getListPunishPolicies(lang, iPage: IPagePunishPolicyDTO) {
        try {
            const query: any = searchQuery(['title.vi'], iPage);
            if (iPage.title && (iPage.title.vi !== "" || iPage.title.en !== "")) {
                query.$and.push({ title: iPage.title })
            }
            if (iPage.description && (iPage.description.vi !== "" || iPage.description.en !== "")) {
                query.$and.push({ description: iPage.description })
            }
            if (iPage.punish_money && iPage.punish_money !== 0) {
                query.$and.push({ punish_money: iPage.punish_money });
            }
            //return query;

            const arrItem = await this.punishPolicyRepositoryService.getListPaginationDataByCondition(iPage, query);

            return arrItem;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getPunishPolicyById(lang, idPunish) {
        try {
            const result = await this.punishPolicyRepositoryService.findOneById(idPunish);
            if (!result || result.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return result;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async softDeletePunishPolicy(lang, idPunish, admin) {
        try {
            const punishPolicy = await this.punishPolicyRepositoryService.findOneById(idPunish);
            if (!punishPolicy) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (punishPolicy.is_delete === true) return true;
            const result = await this.punishPolicyRepositoryService.findByIdAndSoftDelete(idPunish);
            this.activityAdminSystemService.adminDeletePunishPolicy(admin, punishPolicy);
            return result;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // Reward Policy
    async getListRewardPolicy(lang, iPage: IPageRewardPolicyDTO) {
        try {
            const query: any = searchQuery(['title.vi'], iPage);
            if (iPage.title && (iPage.title.vi !== "" || iPage.title.en !== "")) {
                query.$and.push({ title: iPage.title })
            }
            if (iPage.description && (iPage.description.vi !== "" || iPage.description.en !== "")) {
                query.$and.push({ description: iPage.description })
            }
            if (iPage.reward_money && iPage.reward_money !== 0) {
                query.$and.push({ reward_money: iPage.reward_money });
            }
            //return query;
            const arrItem = await this.rewardPolicyRepositoryService.getListPaginationDataByCondition(iPage, query);

            return arrItem;

        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getRewardPolicyById(lang, idRewardPolicy) {
        try {
            const rewardPolicy = await this.rewardPolicyRepositoryService.findOneById(idRewardPolicy);
            if (!rewardPolicy || rewardPolicy.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return rewardPolicy;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createRewardPolicy(lang, rewardPolicy, admin) {
        try {
            const idView = await this.generalHandleService.GenerateRandomString(5);
            rewardPolicy.id_view = idView;
            const newReward = await this.rewardPolicyRepositoryService.create(rewardPolicy);
            this.activityAdminSystemService.adminCreateRewardPolicy(admin, newReward);
            return newReward;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editRewardPolicy(lang, idRewardPolicy, rewardPolicy, admin) {
        try {
            const rewardPolicy = await this.rewardPolicyRepositoryService.findOneById(idRewardPolicy);
            if (!rewardPolicy && rewardPolicy.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            await this.rewardPolicyRepositoryService.findByIdAndUpdate(idRewardPolicy, rewardPolicy);
            this.activityAdminSystemService.adminEditRewardPolicy(admin, rewardPolicy);
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async softDeleteRewardPolicy(lang, idRewardPolicy, admin) {
        try {
            const rewardPolicy = await this.rewardPolicyRepositoryService.findOneById(idRewardPolicy);
            if (!rewardPolicy && rewardPolicy.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const result = await this.rewardPolicyRepositoryService.findByIdAndSoftDelete(idRewardPolicy);
            this.activityAdminSystemService.adminDeleteRewardPolicy(admin, rewardPolicy);
            return result;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
