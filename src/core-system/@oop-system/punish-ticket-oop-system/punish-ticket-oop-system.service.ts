import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, queryWithinRangeDate, searchQuery } from 'src/@core'
import { PUNISH_LOCK_TIME_TYPE, TICKET_STATUS } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { PunishTicketRepositoryService } from 'src/@repositories/repository-service/punish-ticket-repository/punish-ticket-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CYCLE_TIME_TYPE, DEPENDENCY_ORDER_VALUE, PUNISH_VALUE_TYPE } from './../../../@repositories/module/mongodb/@database/enum/policy.enum'

@Injectable()
export class PunishTicketOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private punishTicketRepositoryService: PunishTicketRepositoryService
    ) {}

    async getDetailItem(lang, idItem) {
        try {
            const item = await this.punishTicketRepositoryService.findOneById(idItem);
            if(!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "punish_ticket")], HttpStatus.NOT_FOUND)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateRandomIdViewPunishTicket() {
        const now = new Date();
        let tempRandomID = await this.generalHandleService.randomIDTransaction(4)
        const day = now.getDay() < 10 ? `0${now.getDay().toString()}` : now.getDay().toString();
        const month = now.getMonth() < 10 ? `0${now.getMonth().toString()}` : now.getMonth().toString();
        const year = now.getFullYear().toString()
        let idView = `#` + year + month + day + tempRandomID;
        let checkRandomID = await this.punishTicketRepositoryService.findOne({ id_view: idView });
        let a = 0;
        while (checkRandomID && a < 5) {
            tempRandomID = await this.generalHandleService.randomIDTransaction(4)
            idView = `#` + year + month + day + tempRandomID;
            checkRandomID = await this.punishTicketRepositoryService.findOne({ id_view: idView });
            a += 1;
        }
        return idView;
    }

    async calculatePunishMoney(policy, orderDependency?) {
        try {
            // let resultMoney = 0;
            let punishMoney = policy.punish_money;
            if (policy.punish_money_type === "percent_of_initial_fee_order") {
                if (orderDependency) {
                    // lam tron so tien phat
                    let initialFee = orderDependency.initial_fee / 1000;
                    punishMoney = Number((initialFee * (policy.punish_money / 100)).toFixed()) * 1000;
                    
                }
            } else if (policy.punish_money_type === 'unset') {
                punishMoney = policy.punish_money;
            }
            return punishMoney;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async calculateDateLock(policy) {
        try {
            const dateStartLock = new Date(Date.now()).toISOString();
            let dateEndLock = new Date(Date.now()).toISOString();
            switch (policy.punish_lock_time_type) {
                case PUNISH_LOCK_TIME_TYPE.minute: {
                    const tempDateStart = new Date(dateStartLock).getTime();
                    dateEndLock = new Date(tempDateStart + (policy.punish_lock_time * 60 * 1000)).toISOString()
                    break;
                }
                case PUNISH_LOCK_TIME_TYPE.hours: {
                    const tempDateStart = new Date(dateStartLock).getTime();
                    dateEndLock = new Date(tempDateStart + (policy.punish_lock_time * 60 * 60 * 1000)).toISOString()
                    break;
                } default: {
                    dateEndLock = dateStartLock;
                    break;
                }
            }

            return {
                dateStartLock,
                dateEndLock
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItemFromPolicy(lang, payload, policy, payloadDependency, actor?) {
        try {
            const promiseData = await Promise.all([
                this.calculateDateLock(policy),
                this.calculatePunishMoney(policy, payloadDependency.order)
            ])
            const calDateLock = promiseData[0]
            const punishMoney = promiseData[1]
            const newPayload = {
                id_customer: payload.id_customer || null,
                id_collaborator: payload.id_collaborator || null,
                id_order: payload.id_order || null,
                id_admin_action: actor?._id || null,
                date_create: new Date(Date.now()).toISOString(),
                title: policy.title,
                user_apply: policy.user_apply,
                status: "standby",
                id_transaction: null,
                punish_lock_time: policy.punish_lock_time,
                current_total_time_process: 1,
                current_total_order_process: 1,
                id_punish_policy: payload.id_punish_policy,
                time_end: calDateLock.dateStartLock,
                time_start: calDateLock.dateEndLock,
                punish_money: punishMoney,
                id_view: null,
                note_admin: payload.note_admin ? payload.note_admin : policy.title['vi'],
                payment_out: policy.payment_out,
                payment_in: 'cash_book',
                action_lock: policy.action_lock,
            }
            const newData = await this.createItem(lang, newPayload)
            return newData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(lang, payload) {
        try {
            const idView = await this.generateRandomIdViewPunishTicket()

            const payloadCreate = {
                id_customer: payload.id_customer || null,
                id_collaborator: payload.id_collaborator || null,
                id_order: payload.id_order || null,
                id_admin_action: payload.id_admin_action || null,
                date_create: new Date(Date.now()).toISOString(),
                title: payload.title,
                user_apply: payload.user_apply,
                status: "standby",
                id_transaction: null,
                punish_lock_time: payload.punish_lock_time,
                current_total_time_process: 1,
                current_total_order_process: 1,
                id_punish_policy: payload.id_punish_policy,
                time_end: payload.time_end,
                time_start: payload.time_start,
                punish_money: payload.punish_money,
                id_view: idView,
                note_admin: payload.note_admin,
                payment_out: payload.payment_out || null,
                payment_in: payload.payment_in || null,
                action_lock: payload.punish_function,
                punish_type: payload.punish_type,
                nth_time: payload.nth_time
            }
            const newData = await this.punishTicketRepositoryService.create(payloadCreate)
            return newData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createManyItem(lstPayload) {
        try {
            return await this.punishTicketRepositoryService.createMany(lstPayload)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateNewDateLock(punishRule) {
        try {
            let dateStartLock = new Date(Date.now()).toISOString();
            let dateEndLock = new Date(Date.now()).toISOString();
            switch (punishRule.punish_lock_time_type) {
                case PUNISH_LOCK_TIME_TYPE.minute: {
                    const tempDateStart = new Date(dateStartLock).getTime();
                    dateEndLock = new Date(tempDateStart + (punishRule.punish_lock_time * 60 * 1000)).toISOString()
                    break;
                }
                case PUNISH_LOCK_TIME_TYPE.hours: {
                    const tempDateStart = new Date(dateStartLock).getTime();
                    dateEndLock = new Date(tempDateStart + (punishRule.punish_lock_time * 60 * 60 * 1000)).toISOString()
                    break;
                } default: {
                    dateStartLock = null
                    dateEndLock = null
                    break;
                }
            }

            return {
                dateStartLock,
                dateEndLock
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateNewPunishMoney(punishRule, orderDependency?) {
        try {
            let punishMoney = punishRule.punish_value;
            if (punishRule.punish_value_type === PUNISH_VALUE_TYPE.percent) {
                if (orderDependency) {
                    switch(punishRule.dependency_order_value) {
                        case DEPENDENCY_ORDER_VALUE.initial_fee: {
                            // lam tron so tien phat
                            let initialFee = orderDependency.initial_fee / 1000;
                            punishMoney = Number((initialFee * (punishRule.punish_value / 100)).toFixed()) * 1000;
                        }
                        case DEPENDENCY_ORDER_VALUE.final_fee: {
                            // lam tron so tien phat
                            let finalFee = orderDependency.final_fee / 1000;
                            punishMoney = Number((finalFee * (punishRule.punish_value / 100)).toFixed()) * 1000;
                        }
                        case DEPENDENCY_ORDER_VALUE.subtotal_fee: {
                            // lam tron so tien phat
                            let subtotalFee = orderDependency.subtotal_fee / 1000;
                            punishMoney = Number((subtotalFee * (punishRule.punish_value / 100)).toFixed()) * 1000;
                        }
                    }
                }
            } else {
                punishMoney = punishRule.punish_value;
            }
            return punishMoney;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createNewItemFromPolicy(lang, subjectAction, payloadDependency, payload, punishRule) {
        try {
            const punish_policy = payloadDependency.punish_policy
            const [calDateLock, punishMoney] = await Promise.all([
                this.calculateNewDateLock(punishRule),
                this.calculateNewPunishMoney(punishRule, payloadDependency.order)
            ])
            const newPayload = {
                id_customer: payload.id_customer || null,
                id_collaborator: payload.id_collaborator || null,
                id_order: payload.id_order || null,
                id_admin_action: subjectAction.type === TYPE_SUBJECT_ACTION.admin ? subjectAction?._id : null,
                date_create: new Date(Date.now()).toISOString(),
                title: punish_policy.title,
                user_apply: punish_policy.user_apply,
                status: "standby",
                id_transaction: null,
                punish_lock_time: punishRule.punish_lock_time,
                current_total_time_process: 1,
                current_total_order_process: 1,
                id_punish_policy: payload.id_punish_policy,
                time_end: calDateLock.dateStartLock || null,
                time_start: calDateLock.dateEndLock || null,
                punish_money: punishMoney,
                id_view: null,
                note_admin: payload.note_admin ? payload.note_admin : punish_policy.title['vi'],
                payment_out: punish_policy.payment_out,
                payment_in: punishRule.punish_value > 0 ? 'cash_book' : null,
                punish_type: punishRule.punish_type,
                nth_time: punishRule.nth_time,
            }
            const newData = await this.createItem(lang, newPayload)
            return newData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async doingToDonePunishTicket(lang, idPunishTicket) {
        try {
            const punishTicket = await this.getDetailItem(lang, idPunishTicket)
            punishTicket.status = TICKET_STATUS.done;
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async doneToRevokePunishTicket(lang, idPunishTicket) {
        try {
            const punishTicket = await this.getDetailItem(lang, idPunishTicket)
            if(punishTicket.status === "revoke") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_REVOKE, lang, "punish_ticket")], HttpStatus.NOT_FOUND)
            }
            if(punishTicket.status === "cancel") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_CANCEL, lang, "punish_ticket")], HttpStatus.NOT_FOUND)
            }
            punishTicket.status = 'revoke';
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getListPunishTicketOrderByCollaborator(idOrder, idCollaborator) {
        try {

            const query = {
                $and: [
                    {id_order: idOrder},
                    {id_collaborator: idCollaborator}
                ]
            }
            const getData = await this.punishTicketRepositoryService.getListDataByCondition(query);
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListItemByListIdOrder(lstIdOrder) {
        try {
            const query = {
                $and :[
                    { is_delete: false },
                    { id_order: {$in: lstIdOrder } }
                ]
            }

            return await this.punishTicketRepositoryService.getListDataByCondition(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListItem (lang, iPage) {
        try {
            const query: any = searchQuery(["id_collaborator.full_name", "id_customer.full_name",
                "id_punish_policy.id_view"
            ], iPage)
            if (iPage.user_apply && iPage.user_apply !== "" ) {
                query.$and.push({ user_apply: iPage.user_apply });
            }
            if (iPage.status && iPage.status !== "" ) {
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
            const sortOption = {date_create: -1}
            const populateItem = [
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_punish_policy", select: { title: 1, id_view: 1 } },
                { path: "id_transaction", select: { title: 1, id_view: 1, _id: 1 } },
                { path: "id_order", select: { id_group_order: 1, id_view: 1 } },
                { path: "id_admin_action", select: { full_name: 1, email: 1 } },
            ]
            const result = await this.punishTicketRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption, populateItem)

            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalItem (lang, iPage) {
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

    async getListByCollaborator(idCollaborator, iPage) {
        try {            
            const query:any = {
            $and:[
                { id_collaborator: idCollaborator },
            ]
            }
            if(iPage.date_type === 'week') {
                const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), 1, 'Asia/Ho_Chi_Minh')

                query.$and.push(
                    { date_create: { $gte: getWeekRange.startOfWeek.toISOString(), $lte: getWeekRange.endOfWeek.toISOString() } }
                )
            }
            return await this.punishTicketRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 })
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async countItemByPunishPolicyAndCollaborator(idCollaborator, policy) {
        try {
            let startDate
            let endDate
            switch(policy.cycle_time_type) {
                case CYCLE_TIME_TYPE.month: {
                    const getMonthRange = await this.generalHandleService.getMonthRange(new Date(), 'Asia/Ho_Chi_Minh') 
                    startDate = getMonthRange.startOfMonth
                    endDate = getMonthRange.endOfMonth
                    break;
                }
                case CYCLE_TIME_TYPE.week: {
                    const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), new Date(policy.start_cycle_time).getDay(), 'Asia/Ho_Chi_Minh')
                    startDate = getWeekRange.startOfWeek.toISOString()
                    endDate = getWeekRange.endOfWeek.toISOString()
                    break;
                }
                case CYCLE_TIME_TYPE.day: {
                    startDate = new Date(new Date().setHours(0, 0, 0, 0))
                    endDate = new Date(new Date().setHours(23, 59, 59, 999))
                    break;
                }
                case CYCLE_TIME_TYPE.hour: {
                    startDate = new Date(new Date().setHours(new Date().getHours(), 0, 0, 0))
                    endDate = new Date(new Date().setHours(new Date().getHours(), 59, 59, 999))
                    break;
                }
            }

            const query = {
                $and: [
                    { id_punish_policy: policy._id },
                    { id_collaborator: idCollaborator },
                    { date_create: { $gte: startDate, $lte: endDate } }
                ]
            }

            return await this.punishTicketRepositoryService.countDataByCondition(query)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPunishTicketByTimeFrame(idCollaborator, startTime, endTime) {
        try {
            const query = {
            $and: [
                { status: TICKET_STATUS.done },
                { date_create: { $gte: startTime, $lte: endTime } },
                { id_collaborator: idCollaborator }
            ]
            }

            return await this.punishTicketRepositoryService.getListDataByCondition(query, {}, { execution_date: 1 })
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async standbyToWaitingPunishTicket(lang, punishTicket) {
        try {
            if (punishTicket.status !== TICKET_STATUS.standby) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
            }
            punishTicket.status = TICKET_STATUS.waiting;
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateRewardTicket(lang, punishTicket) {
        try {
            await this.getDetailItem(lang, punishTicket._id)
            return await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
