import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ERROR, GlobalService, REFERRAL_GIFT } from 'src/@core'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum/transaction.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PunishPolicyOopSystemService } from 'src/core-system/@oop-system/punish-policy-oop-system/punish-policy-oop-system.service'
import { RewardPolicyOopSystemService } from 'src/core-system/@oop-system/reward-policy-oop-system/reward-policy-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'

@Injectable()
export class CollaboratorSystemService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
        private rewardPolicyOopSystemService: RewardPolicyOopSystemService,
        private punishPolicyOopSystemService: PunishPolicyOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        
        @Inject(forwardRef(() => NotificationSystemService))
        private notificationSystemService: NotificationSystemService,
    ) { }

    // async login

    async minusPlatformFee(lang, getCollaborator, getOrder, money) {
        try {


            // await this.collaboratorOopSystemService.minusCollaborator(lang, getCollaborator, money)

            // return getCollaborator;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editCollaboratorPersonalInfo(lang, subjectAction, idCollaborator, payload) {
        try {
            const payloadDependency = {
                collaborator: null,
                admin_action: null
            }
            // 1. Cập nhật
            payloadDependency.collaborator = await this.collaboratorOopSystemService.updateCollaboratorPersonalInformation(lang, idCollaborator, payload);
            // 2. Chạy log
            return true;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editCollaboratorBankInfo(lang, idCollaborator, payload, admin) {
        try {
            const payloadDependency = {
                collaborator: null,
                admin_action: null
            }
            // 1. Cập nhật
            payloadDependency.collaborator = await this.collaboratorOopSystemService.updateCollaboratorBankInformation(lang, idCollaborator, payload);
            // 2. Chạy log
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateSessionSocketCollaborator(client, isDisconnect: boolean = true) {
        try {
            if (client.payload) {
                // 1. Lay thong tin CTV
                let getCollaborator = await this.collaboratorOopSystemService.getDetailItemForWebSocket(client.payload._id);

                // 2.
                // Neu khong co CTV hoac CTV bi khoa thi ngat ket noi
                if (!getCollaborator || getCollaborator.is_locked) {
                    return null
                }

                // Neu co thi cap nhat session_socket cho CTV
                getCollaborator = await this.collaboratorOopSystemService.updateSocketCollaborator('vi', client.payload._id, isDisconnect, client.id)

                return getCollaborator
            } else {
                return null
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateStatusCollaboratorProfile(lang, subjectAction, idCollaborator, payload,) {
        try {
            const payloadDependency = {
                collaborator: null,
                admin_action: null
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
            }
            
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)
            let status = (payload.status && payload.status !== getCollaborator.status) ? payload.status : null
            let noteHandleAdmin = (payload.note_handle_admin && payload.note_handle_admin !== getCollaborator.note_handle_admin) ? payload.note_handle_admin : null
            
            if (noteHandleAdmin) {
                getCollaborator.note_handle_admin = noteHandleAdmin
            }
            if (status) {
                getCollaborator.status = status
            }
            getCollaborator.id_user_system_handle = subjectAction._id;

            let is_verify = getCollaborator.is_verify
            if (status === "actived" && is_verify === true) {
                if (getCollaborator.city < 0) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ESTABLISHED_PROVINCE, 'vi', 'collaborator')], HttpStatus.NOT_FOUND)
                }
                getCollaborator.is_verify = true
                getCollaborator.date_actived = new Date().toISOString();
            }

            payloadDependency.collaborator = await this.collaboratorOopSystemService.updateCollaborator(lang, getCollaborator)

            if (status === "actived" && is_verify === true) {
                this.historyActivityOopSystemService.verifyCollaborator(subjectAction, payloadDependency)
                this.notificationSystemService.verifyCollaborator(lang, payloadDependency.collaborator)
            }

            if (noteHandleAdmin !== null) {
                this.historyActivityOopSystemService.updateHandleNoteAdminCollaborator(subjectAction, payloadDependency, noteHandleAdmin)
            }
            if (status !== null) {
                this.historyActivityOopSystemService.updateHandleStatusCollaborator(subjectAction, payloadDependency, status)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async payRewardToReferralPerson() {
        try {
            // Lay danh sach doi tac co ngay tao lon hon ngay hien tai - 31 va is_added_gift_remainder = false
            const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
            const getListCollaborator = await this.collaboratorOopSystemService.getListActivatedCollaboratorWithinSomeDays(thirtyOneDaysAgo)

            for(let i = 0; i < getListCollaborator.length; i++) {
                getListCollaborator[i].is_added_gift_remainder = true
                await this.collaboratorOopSystemService.updateCollaborator('vi', getListCollaborator[i])
                
                let isCustomer = true
                let getInviter:any

                if (getListCollaborator[i].id_customer_inviter) {
                    getInviter = await this.customerOopSystemService.getDetailInviter(getListCollaborator[i].id_customer_inviter)
                }

                if (getListCollaborator[i].id_collaborator_inviter) {
                    isCustomer = false
                    getInviter = await this.collaboratorOopSystemService.getDetailInviter(getListCollaborator[i].id_collaborator_inviter)
                }
    
                if (getInviter) {
                    const payloadDependency = {
                        collaborator: null,
                        customer: null
                    }

                    const subjectAction = {
                        type: TYPE_SUBJECT_ACTION.system
                    }

                    let previousBalance = {
                        pay_point: getInviter?.pay_point || 0,
                        work_wallet: 0
                    }
                    // Cong tien thuong
                    if(isCustomer) {
                        payloadDependency.customer = await this.customerOopSystemService.addPayPoint('vi', REFERRAL_GIFT, getInviter._id)
                    } else {
                        previousBalance.work_wallet = getInviter.work_wallet
                        payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet('vi', getInviter._id, TYPE_WALLET.work_wallet, REFERRAL_GIFT)
                    }
                    // Log tang tien thuong 
                    await this.historyActivityOopSystemService.systemGiveMoneyNew(subjectAction, payloadDependency, getListCollaborator[i], previousBalance, REFERRAL_GIFT, isCustomer)
                    await this.notificationSystemService.addMoneyIntoWorkWalletNew('vi', getListCollaborator[i], getInviter, REFERRAL_GIFT, isCustomer)
                }
            }
            

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async getInfoForAccumulationByCollaborator(lang, idCollaborator) {
        try {  
            let [getInfoCollaborator, getListRewardMilestone, getListPunishMilestone, getCurrentRank] = await Promise.all([
                this.collaboratorOopSystemService.getDetailItemForAccumlation(lang, idCollaborator),
                this.rewardPolicyOopSystemService.getListRewardMilestone(),
                this.punishPolicyOopSystemService.getListPunishMilestone(),
                this.collaboratorOopSystemService.getCurrentRank(lang, idCollaborator),
            ])

            getListRewardMilestone = getListRewardMilestone.map((e) => {
                return e.score || 0
            })

            getListPunishMilestone = getListPunishMilestone.map((e) => {
                return e?.punish_rule[0]?.nth_time || 0
            })

            return { infoCollaborator: getInfoCollaborator, listRewardMilestone: getListRewardMilestone, listPunishMilestone: getListPunishMilestone, currentRank: getCurrentRank }
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async verifyCollaborator (lang, id, subjectAction) {
        try {
            const payloadDependency = {
                collaborator: null,
                admin_action: null,

            }
            if(subjectAction.type == "admin") {
                payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
            }
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, id);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getCollaborator.is_verify === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getCollaborator.is_verify = true;
            // 1. Cập nhật
            payloadDependency.collaborator = await this.collaboratorOopSystemService.updateCollaborator(lang, getCollaborator)
            // 2. Chạy log
            await this.historyActivityOopSystemService.verifyCollaborator(subjectAction, payloadDependency);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async getReviewCollaborator (lang, idCollaborator, iPage, user) {
        try {
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(user, getCollaborator.city, getCollaborator.district, null, getCollaborator.id_business);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }

            const getReview = await this.orderOopSystemService.getListHistory(iPage, idCollaborator)
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                // totalItem: count,
                data: getReview
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getOrderById (lang, idCollaborator, iPage) {
        try {
            const result = await this.orderOopSystemService.getListOrderByCollaborator(idCollaborator, iPage)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async getTotalOrderById (idCollaborator) {
        try {
            const result = await this.orderOopSystemService.getTotalOrder(idCollaborator)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    
    async getListCustomerBlockOrFavourite(lang, idCollaborator, iPage) {
        try {
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)
            return await this.customerOopSystemService.getListCustomerBlockOrFavourite(getCollaborator, iPage)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async resetRewardPoint() {
        try {
            const lstCollaborator = await this.collaboratorOopSystemService.getListCollaboratorHaveRewardPoint()
            const lstTask:any = []
            const subjectAction = {
                _id: null,
                type: "system"
            }
            for(let i = 0; i < lstCollaborator.length; i++) {
                const payloadDependency = {
                    collaborator: lstCollaborator[i]
                }
                lstCollaborator[i].reward_point = 0
                lstCollaborator[i].number_of_violation = 0
                lstCollaborator[i].last_point_updated_at = null

                lstTask.push(this.collaboratorOopSystemService.updateCollaborator("vi", lstCollaborator[i]))
                lstTask.push(this.historyActivityOopSystemService.resetRewardPoint(subjectAction, payloadDependency))
            }

            await Promise.all(lstTask)

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async resetMonthlyRewardPoint() {
        try {
            const lstCollaborator = await this.collaboratorOopSystemService.getListCollaboratorHaveMonthlyRewardPoint()
            const lstTask:any = []
            const subjectAction = {
                _id: null,
                type: "system"
            }
            for(let i = 0; i < lstCollaborator.length; i++) {
                const payloadDependency = {
                    collaborator: lstCollaborator[i]
                }
                lstCollaborator[i].monthly_reward_point = 0
                lstCollaborator[i].monthly_number_of_violation = 0
                lstCollaborator[i].is_not_received_reward = false
                lstCollaborator[i].monthly_last_point_updated_at = null

                lstTask.push(this.collaboratorOopSystemService.updateCollaborator("vi", lstCollaborator[i]))
                lstTask.push(this.historyActivityOopSystemService.resetMonthlyRewardPoint(subjectAction, payloadDependency))
            }

            await Promise.all(lstTask)

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
