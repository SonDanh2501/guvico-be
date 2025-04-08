import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
<<<<<<< HEAD
import { ERROR, HISTORY_ACTIVITY_WALLET, STATUS_COLLABORATOR_PROFILE } from 'src/@core'
=======
import { ERROR, HISTORY_ACTIVITY_WALLET, POP_COLLABORATOR_INFO, POP_CUSTOMER_INFO, STATUS_COLLABORATOR_PROFILE } from 'src/@core'
>>>>>>> son
import { PAYMENT_METHOD } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class HistoryActivityOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
    ) {}

    async createManyItem(lstPayload) {
        try {
            return await this.historyActivityRepositoryService.createMany(lstPayload)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async identifyUser(subject, endPoint) {
        let payload = subject + "_" + endPoint
        return payload;
    }

    async getList(query, iPage, select = {}, isPopulateFirst: boolean = true) {
        try {
            const populateArr = [
                {
                    path: "id_group_order",
                    select: {
                        _id: 1,
                        id_view: 1
                    }
                },
                {
                    path: "id_order",
                    select: {
                        _id: 1,
                        id_view: 1
                    }
                },
                {
                    path: "id_collaborator",
                    select: {
                        _id: 1,
                        id_view: 1,
                        full_name: 1
                    }
                },
                {
                    path: "id_admin_action",
                    select: {
                        _id: 1,
                        id_view: 1,
                        full_name: 1
                    }
                }

            ]
            if (isPopulateFirst) {
                populateArr.push( 
                    {
                        path: "id_customer",
                        select: {
                            _id: 1,
                            id_view: 1,
                            full_name: 1
                        }
                    })
            }

            const dataResult = await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, select, {date_create: -1}, populateArr, isPopulateFirst)
            return dataResult;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForGroupOrder(idGroupOrder, iPage) {
        try {
            const query = {
                $and: [
                    {id_group_order: new Types.ObjectId(idGroupOrder)}
                ]
            }
            const dataResult = this.getList(query, iPage)
            return dataResult;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForCollaborator(idCollaborator, iPage) {
        try {
            const query = {
                $and: [
                    { id_collaborator: new Types.ObjectId(idCollaborator) }
                ]
            }
            const dataResult = this.getList(query, iPage)
            return dataResult;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForCustomer(idCustomer, iPage) {
        try {
            const query = {
                $and: [
                    { id_customer: new Types.ObjectId(idCustomer) },
                ]
            }
            const dataResult = this.getList(query, iPage)
            return dataResult;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListRewardPointByIdCollaborator(idCollaborator, iPage) {
        try {      
            const query:any = {
                $and:[
                    { $or: [
                        { type: "system_add_reward_point" },
                        { type: "system_reset_reward_point" },
                    ] },
                    { id_collaborator: idCollaborator },
                ]
            }
            if(iPage.date_type === 'week') {
                const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), 1, 'Asia/Ho_Chi_Minh')
                console.log('startOfWeek', getWeekRange.startOfWeek);
                console.log('endOfWeek', getWeekRange.endOfWeek);
                
                query.$and.push(
                    { date_create: { $gte: getWeekRange.startOfWeek.toISOString(), $lte: getWeekRange.endOfWeek.toISOString() } }
                )
            } else {
                const sixMonthsAgo  = new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)).toISOString()
                query.$and.push(
                    { date_create: { $gte: sixMonthsAgo } }
                )
            }

            const select = { id_collaborator: 1, title: 1, body: 1, type: 1, date_create: 1, id_reward_ticket: 1, value: 1, current_reward_point: 1, status_current_reward_point: 1 }
            return await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, select, {date_create: -1})
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListRewardMoneyByIdCollaborator(idCollaborator, iPage) {
        try {            
            const query:any = {
                $and:[
                    { id_collaborator: idCollaborator },
                    { type: "system_add_reward_money" },
                ]
            }
            if(iPage.date_type === 'week') {
                const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), 1, 'Asia/Ho_Chi_Minh')

                query.$and.push(
                    { date_create: { $gte: getWeekRange.startOfWeek.toISOString(), $lte: getWeekRange.endOfWeek.toISOString() } }
                )
            } 
            const select = { id_collaborator: 1, title: 1, body: 1, type: 1, date_create: 1, id_reward_ticket: 1, value: 1, current_work_wallet: 1, status_current_work_wallet: 1, current_collaborator_wallet: 1, status_current_collaborator_wallet: 1 }
            return await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, select, {date_create: -1})
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListPunishTicketByIdCollaborator(idCollaborator, iPage) {
        try {            
            const query:any = {
                $and:[
                    { id_collaborator: idCollaborator },
                    { $or: [
                        { type: "system_log_violation" },
                        { type: "system_log_violation_and_fine" },

                    ] }
                ]
            }
            if(iPage.date_type === 'week') {
                const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), 1, 'Asia/Ho_Chi_Minh')

                query.$and.push(
                    { date_create: { $gte: getWeekRange.startOfWeek.toISOString(), $lte: getWeekRange.endOfWeek.toISOString() } }
                )
            } 
            const select = { id_collaborator: 1, title: 1, body: 1, type: 1, date_create: 1, id_punish_ticket: 1 }
            return await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, select, {date_create: -1})
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(payload) {
        try {
            payload['date_create'] = new Date(Date.now()).toISOString()
            const result = await this.historyActivityRepositoryService.create(payload)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fillPayloadDependency(title, body, title_admin, payloadDependency, subjectAction) { 
        try {
            const payload = {
                title,
                body,
                title_admin,
                id_user_action: subjectAction._id || null,
                id_customer: payloadDependency.customer?._id || null,
                id_admin_action: payloadDependency.admin_action?._id || null,
                id_group_order: payloadDependency.group_order?._id || null,
                id_order: payloadDependency.order?._id || null,
                id_collaborator: payloadDependency.collaborator?._id || null,
                id_reason_cancel: payloadDependency.reason_cancel?._id || null,
                id_punish_ticket: payloadDependency.punish_ticket?._id || null,
                id_reward_ticket: payloadDependency.reward_ticket?._id || null,
                id_transaction: payloadDependency.transaction?._id || null,
                id_promotion: payloadDependency.promotion?._id || null,
                id_inviter: payloadDependency.inviter?._id || null,
                id_customer_referrer: payloadDependency.customer_referrer?._id || null,
                date_create: new Date().toISOString(),
            }
            return payload;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async fillStatusAccountBalance(getCollaborator, previousBalance) {
        try {
            const payload = {
                current_collaborator_wallet: getCollaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
            }
            return payload
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fillStatusPointBalance(getCustomer, previousBalance) {
        try {
            const payload = {
                current_point: getCustomer.point,
                status_current_point: (previousBalance.point < getCustomer.point) ?
                    "up" : (previousBalance.point > getCustomer.point) ? "down" : "none",
            }
            return payload
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fillStatusPayPointOrWorkWallerBalance(inviter, previousBalance, isCustomer) {
        try {
            let payload:any
            if (isCustomer) {
            payload = {
                current_pay_point: inviter.pay_point,
                status_current_pay_point: (previousBalance.pay_point < inviter.pay_point) ?
                    "up" : (previousBalance.pay_point > inviter.pay_point) ? "down" : "none",
                }
            } else {
                payload = {
                    current_work_wallet: inviter.work_wallet,
                    status_current_work_wallet: (previousBalance.work_wallet < inviter.work_wallet) ?
                        "up" : (previousBalance.work_wallet > inviter.work_wallet) ? "down" : "none",
                }
            }
            
            return payload
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundPayPointCustomer(subjectAction, payloadDependency, money) {
        try {
            const getCustomer = payloadDependency.customer;
            const getOrder = payloadDependency.order || null;
            let title = {
                vi: "Hoàn tiền dịch vụ",
                en: "Refund service"
            }
            let titleAdmin = `Hoàn tiền cho khách hàng`
            if(getOrder) {
                if(getOrder.final_fee < money) {
                    const getGroupOrder = payloadDependency.group_order || null;
                    titleAdmin = `Hoàn tiền dịch vụ ${getGroupOrder.id_view}`
                } else {
                    titleAdmin = `Hoàn tiền ca làm ${getOrder.id_view}`
                }
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "customer_refund_money",
                value: money || 0,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: "up",
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async paymentPayPointCustomer(subjectAction, payloadDependency, money) {
        try {
            const getGroupOrder = payloadDependency.group_order
            const getCustomer = payloadDependency.customer
            const formatMoney = await this.generalHandleService.formatMoney(money);
            let title = {
                vi: "Thanh toán thành công",
                en: "Payment success"
            }
            let titleAdmin = `Thanh toán thành công dịch vụ với số tiền ${formatMoney} cho đơn ${getGroupOrder.id_view} !`
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "customer_payment_pay_point_service",
                value: -money || 0,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: "down",
            }) 
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async paymentServiceCustomer(subjectAction, payloadDependency, money, payment_method) {
        try {
            const getGroupOrder = payloadDependency.group_order
            const getCustomer = payloadDependency.customer
            const formatMoney = await this.generalHandleService.formatMoney(money);

            let paymentMethod = 'Gpay'
            let type = 'customer_payment_point_service'
            let statusCurrentPayPoint = 'down'
            let currentPayPoint = getCustomer.pay_point
            if (payment_method !== PAYMENT_METHOD.cash && payment_method !== PAYMENT_METHOD.point) {
                if (payment_method === PAYMENT_METHOD.vnpay || payment_method === PAYMENT_METHOD.vnbank || payment_method === PAYMENT_METHOD.intcard) {
                    payment_method = PAYMENT_METHOD.vnpay
                }
                paymentMethod = PAYMENT_METHOD[payment_method].slice(0, 1).toUpperCase() + PAYMENT_METHOD[payment_method].slice(1)
                type = `customer_payment_${payment_method}_service`
                currentPayPoint = null
                statusCurrentPayPoint = 'none'
            }
        
            let title = {
                vi: `Thanh toán thành công qua ${paymentMethod}`,
                en: `Successful payment via ${paymentMethod}`
            }
            let titleAdmin = `Thanh toán thành công dịch vụ với số tiền ${formatMoney} qua ${paymentMethod} cho đơn ${getGroupOrder.id_view} !`
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: -money || 0,
                current_pay_point: currentPayPoint,
                status_current_pay_point: statusCurrentPayPoint,
            }) 
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createGroupOrder(subjectAction, payloadDependency) {
        try {
            const getCustomer = payloadDependency.customer
            const getGroupOrder = payloadDependency.group_order

            let title = {
                vi: "Đơn hàng của bạn đã lên thành công",
                en: "Your order has been successfully placed."
            }
            let titleAdmin = `Lên thành công đơn hàng`
            if(subjectAction.type === "customer") {
                titleAdmin = `${getCustomer.full_name} Đã lên thành công đơn hàng ${getGroupOrder.id_view}`
            } else if (subjectAction.type === "admin") {
                const getAdmin = payloadDependency.admin_action
                titleAdmin = `QTV ${getAdmin.full_name} Đã lên thành công đơn hàng ${getGroupOrder.id_view}`
            } else if (subjectAction.type === "system") {
                titleAdmin = `Hệ thống lên thành công đơn hàng ${getGroupOrder.id_view}`
            }
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: await this.identifyUser(subjectAction.type, "create_group_order")
            }) 
            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusPlatformFee(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const order = payloadDependency.order;
            const collaborator = payloadDependency.collaborator;
            let title = {
                vi: `Thu phí dịch vụ ca làm ${order.id_view}`,
                en: `Collect shift service fees ${order.id_view}`
            }
            let titleAdmin = `Thu phí dịch vụ ca làm ${order.id_view}`
            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "system_minus_platform_fee",
                value: -money,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusNewPlatformFee(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const order = payloadDependency.order;
            const collaborator = payloadDependency.collaborator;
            let title = {
                vi: `Thu phí dịch vụ ca làm ${order.id_view}`,
                en: `Collect service fees for order ${order.id_view}`
            }
            let titleAdmin = `Thu phí dịch vụ ca làm ${order.id_view} của đối tác ${collaborator.full_name}`
            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "system_minus_new_platform_fee",
                value: -money,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelGroupOrder(subjectAction, payloadDependency) {
        try {
            const groupOrder = payloadDependency.group_order
            const reasonCancel = payloadDependency.reason_cancel


            let type = 'system_cancel_group_order'
            let title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
            }
            let titleAdmin = `Dịch vụ ${groupOrder.id_view || null} đã bị hủy với lí do ${reasonCancel.title.vi}`
            if(subjectAction.type === "customer"){
                const getCustomer = payloadDependency.customer
                type = 'customer_cancel_group_order'
                title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
                }
                titleAdmin = `${getCustomer.full_name} Hủy dịch vụ ${groupOrder.id_view } với lí do ${reasonCancel.title.vi}`
            }
            else if(subjectAction.type === "collaborator"){
                const getCollaborator = payloadDependency.collaborator
                type = 'collaborator_cancel_group_order',
                title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
                }
                titleAdmin = `${getCollaborator.full_name} Hủy ca làm ${groupOrder.id_view } với lí do ${reasonCancel.title.vi}`
            }
            else if(subjectAction.type === "admin"){
            const admin = payloadDependency.admin_action

                type = 'admin_cancel_group_order',
                title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
                }
                titleAdmin = `QTV ${admin.full_name} Hủy dịch vụ ${groupOrder.id_view } với lí do ${reasonCancel.title.vi}`
            }
            
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelOrder(subjectAction, payloadDependency) {
        try {
            const order = payloadDependency.order;
            const reasonCancel = payloadDependency.reason_cancel;
            const getCustomer = payloadDependency.customer;
            let type = 'system_cancel_order'
            let title = {
                vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                en: `Order ${order.id_view || null} is canceled`
            }
            let titleAdmin = `Ca làm ${order.id_view } đã bị hủy với lí do ${reasonCancel.title.vi}`
            if(subjectAction.type === "customer"){
                type = 'customer_cancel_order'
                title = {
                    vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                    en: `Order ${order.id_view || null} is canceled`
                }
                titleAdmin = `KH ${getCustomer.full_name} Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
            }
            else if(subjectAction.type === "collaborator"){
                const getCollaborator = payloadDependency.collaborator
                type = 'collaborator_cancel_order',
                title = {
                    vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                    en: `Order ${order.id_view || null} is canceled`
                }
                titleAdmin = `CTV ${getCollaborator.full_name} Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
            }
            else if(subjectAction.type === "admin"){
                type = 'admin_cancel_order',
                title = {
                    vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                    en: `Order ${order.id_view || null} is canceled`
                }
                titleAdmin = `QTV Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
                const getAdmin = payloadDependency.admin_action;
                if(getAdmin) {
                    titleAdmin = `QTV ${getAdmin.full_name} Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
                }
            }
            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundPointWalletCollaborator(subjectAction, payloadDependency, previousBalance, money) {
        try {
            const getCollaborator = payloadDependency.collaborator
            const getOrder = payloadDependency.order
            
            const title = {
                vi: `Hoàn tiền từ đơn hàng ${getOrder.id_view}`,
                en: `Refund from order ${getOrder.id_view}`
            }
            const titleAdmin = `Hoàn tiền cho CTV ${getCollaborator.full_name} từ đơn hàng ${getOrder.id_view}`;
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "collaborator_refund_money",
                value: money || 0,
                ...await this.fillStatusAccountBalance(getCollaborator, previousBalance)
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokePunishMoneyCollaborator(subjectAction, payloadDependency, previousBalance, money) {
        try {
            const getCollaborator = payloadDependency.collaborator
            const getPunishTicket = payloadDependency.punish_ticket
            const getAdmin = payloadDependency.admin_action
            let type = `${subjectAction.type}_revoke_punish_money`
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Hoàn ${formatMoney} từ lệnh phạt ${getPunishTicket.id_view}`,
                en: `Hoàn ${formatMoney} từ lệnh phạt ${getPunishTicket.id_view}`
            }
            const titleAdmin = `QTV ${getAdmin.full_name} thu hồi lệnh phạt, hoàn tiền ${formatMoney} cho CTV ${getCollaborator.full_name}`;
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type,
                value: money || 0,
                ...await this.fillStatusAccountBalance(getCollaborator, previousBalance)
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async punishMoney(subjectAction, payloadDependency, previousBalance, money) {
        try {
            const order = payloadDependency.order
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const getCollaborator = payloadDependency.collaborator
            const punishTicket = payloadDependency.punish_ticket
            const title = {
                vi: `Bạn bị phạt${order !== null ? ` từ ca làm việc ${order.id_view}`: ""}`,
                en: `You are punish${order !== null ? ` from shift ${order.id_view}` : ""}`
            }
            const type = `${subjectAction.type}_punish_collaborator`
            const titleAdmin = `Phạt CTV với lệnh phạt ${punishTicket.id_view}, số tiền ${formatMoney}${order !== null ? ` từ ca làm việc ${order.id_view}` : ""}`;
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: -money || 0,
                ...await this.fillStatusAccountBalance(getCollaborator, previousBalance)
            });

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async paymentCustomer() {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // async createGroupOrder() {
    //     try {

    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // async minusPlatformFee(subjectAction, payloadDependency, money, previousBalance) {
    //     try {
    //         const order = await this.orderRepositoryService.findOneById(payloadDependency.id_order);
    //         const getCollaborator = await this.collaboratorRepositoryService.findOneById(payloadDependency.id_collaborator);
    //         let title = {
    //             vi: `Thu phí dịch vụ ca làm ${order.id_view}`,
    //             en: `Collect shift service fees ${order.id_view}`
    //         }
    //         let titleAdmin = `Thu phí dịch vụ ca làm ${order.id_view}`
    //         this.historyActivityRepositoryService.create({
    //             ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
    //             type: "collaborator_minus_platform_fee",
    //             value: -money,
    //             current_collaborator_wallet: getCollaborator.collaborator_wallet,
    //             status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
    //                 "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
    //             current_work_wallet: getCollaborator.work_wallet,
    //             status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
    //                 "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
    //         })
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async unassignCollaborator(subjectAction, payloadDependency) {
        try {

            const getGroupOrder = payloadDependency.group_order
            const getCollaborator = payloadDependency.collaborator
            const getAdmin = payloadDependency.admin_action
            let title = {
                vi: "Đẩy CTV ra khỏi dịch vụ thành công",
                en: "Payment success"
            }
            let titleAdmin = `QTV ${getAdmin.full_name} đẩy CTV ${getCollaborator.full_name} thành công ra dịch vụ ${getGroupOrder.id_view}.`
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "admin_unassign_collaborator",
            }) 
            return true;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmOrder(subjectAction, payloadDependency) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator
            
            let title = {
                vi: "CTV đã xác nhận công việc",
                en: "Collaborator had confirmed this job",
            }
            let type = 'collaborator_confirm_order'
            let titleAdmin = `${collaborator?.full_name} đã xác nhận công việc ${order.id_view}`;
            
            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                title = {
                    vi: "CTV đã xác nhận công việc",
                    en: "Collaborator had confirmed this job",
                }
                titleAdmin = `${collaborator?.full_name} đã xác nhận công việc ${order.id_view}`;
                type = "collaborator_confirm_order"
            } else if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const admin = payloadDependency.admin_action
                title = {
                    vi: "QTV đã gán đơn cho CTV",
                    en: "Administrator assigned order to collaborator",
                }
                titleAdmin = `QTV ${admin?.full_name} đã gán công việc ${order.id_view} cho ${collaborator?.full_name}`,
                type = "admin_confirm_order";
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                // ...await this.fillStatusAccountBalance(collaborator, previousBalance),
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async doingOrder(subjectAction, payloadDependency) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator
            
            let title = {
                    en: "Collaborator is doing this job",
                    vi: "CTV đang làm công việc"
                }
            let titleAdmin = `${collaborator.full_name} đang làm công việc ${order.id_view}`;
            let type = "collaborator_doing_order"
            
            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                title = {
                    en: "Collaborator is doing this job",
                    vi: "CTV đang làm công việc"
                }
                titleAdmin = `${collaborator.full_name} đang làm công việc ${order.id_view}`;
                type = "collaborator_doing_order"
            } else if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const admin = payloadDependency.admin_action
                title = {
                    vi: "QTV chuyển trạng thái đang làm cho đơn hàng",
                    en: "Administrator changes doing status for the order",
                }
                titleAdmin = `${admin?.full_name} đã chuyển trạng thái đang làm cho công việc ${order.id_view}`,
                type = "admin_doing_order";
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async doneOrder(subjectAction, payloadDependency) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator
            
            let title = {
                en: "Collaborator has done this job",
                vi: "CTV hoàn thành công việc"
            }
            let type = 'collaborator_done_order'
            let titleAdmin = `${collaborator.full_name} hoàn thành công việc ${order.id_view}`;
            
            if (subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                title = {
                    en: "Collaborator has done this job",
                    vi: "CTV hoàn thành công việc"
                }
                titleAdmin = `${collaborator.full_name} hoàn thành công việc ${order.id_view}`;
                type = "collaborator_done_order"
            } else if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const admin = payloadDependency.admin_action
                title = {
                    vi: "QTV chuyển trạng thái hoàn thành cho đơn hàng",
                    en: "Administrator changes done status for the order",
                }
                titleAdmin = `${admin?.full_name} đã chuyển trạng thái hoàn thành cho công việc ${order.id_view}`,
                type = "admin_done_order";
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                // ...await this.fillStatusAccountBalance(collaborator, previousBalance),
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addPointForCustomerWhenDoneOrder(subjectAction, payloadDependency, previousBalance, point) {
        try {
            const order = payloadDependency.order;
            const customer = payloadDependency.customer;
            let title = {
                vi: `${customer.full_name} được cộng ${point} điểm từ đơn hàng ${order.id_view}`,
                en: `${customer.full_name} get ${point} points from the order ${order.id_view}`
            }
            let titleAdmin = `${customer.full_name} được cộng ${point} điểm từ đơn hàng ${order.id_view}`
            let type = 'system_add_point'
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                ...await this.fillStatusPointBalance(customer, previousBalance),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async addPayPointsForInviterWhenDoneOrder(subjectAction, payloadDependency, previousBalance, money, referralPerson, isCustomer) {
        try {
            // Nguoi nhan tien
            let inviter:any
            if (isCustomer) {
                inviter = payloadDependency.customer
            } else {
                inviter = payloadDependency.collaborator;
            }

            const formatMoney = await this.generalHandleService.formatMoney(money);

            let title = {
                vi: `Tặng tiền thành công cho khách hàng.`,
                en: `Congratulations give a money.`
            }
            let titleAdmin = `Bạn "${referralPerson.full_name}" của bạn đã hoàn thành đơn hàng đầu tiên. Bạn được nhận thưởng ${formatMoney} vào Ví Gpay.
            Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`
            let type = 'system_give_pay_point_customer'
            if (!isCustomer) {
                type = 'system_given_money'
            }
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: money || 0,
                ...await this.fillStatusPayPointOrWorkWallerBalance(inviter, previousBalance, isCustomer) ,
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async receiveRefundMoney(subjectAction, payloadDependency, previousBalance, refundMoney) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator

            const formatRefundMoney = await this.generalHandleService.formatMoney(refundMoney);
            
            let title = {
                en: `Get net income from order  ${order.id_view}`,
                vi: `Nhận thu nhập ròng từ ca làm ${order.id_view}`
            }
            let type = 'collaborator_receive_refund_money'
            let titleAdmin = `${collaborator.full_name} được nhận ${formatRefundMoney} từ ${order.id_view}`;

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance),
                value: refundMoney
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createNotificationSchedule(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const notification_schedule = payloadDependency.notification_schedule

            let type = 'admin_create_notification_schedule'

            let title = {
                vi: "Tạo mới lịch bắn thông báo thành công",
                en: "Create new schedule push notification successfully"
            }
            let titleAdmin = `QTV ${admin.full_name} Tạo mới lịch bắn thông báo ${notification_schedule._id}`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                id_notification_schedule: notification_schedule.id_notification_schedule
            }) 

            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateIsCreatedNotificationSchedule(subjectAction, payloadDependency) {
        try {
            const notification_schedule = payloadDependency.notification_schedule

            let type = 'system_update_is_created_notification_schedule'

            let title = {
                vi: "Tạo danh sách thông báo thành công",
                en: "Create list of notifications successfully"
            }
            let titleAdmin = `Hệ thống tạo danh sách thông báo theo lịch thông báo ${notification_schedule._id}`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                id_notification_schedule: notification_schedule.id_notification_schedule
            }) 

            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateIsDeleteNotificationSchedule(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const notification_schedule = payloadDependency.notification_schedule

            let type = 'admin_delete_notification_schedule'

            let title = {
                vi: "Xóa lịch thông báo thành công",
                en: "Delete schedule notification successfully"
            }
            let titleAdmin = `QTV ${admin.full_name} Xóa lịch thông báo ${notification_schedule._id}`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                id_notification_schedule: notification_schedule.id_notification_schedule
            }) 

            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNotificationSchedule(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const notification_schedule = payloadDependency.notification_schedule

            let type = 'admin_update_notification_schedule'

            let title = {
                vi: "Cập nhật lập lịch thông báo thành công",
                en: "Delete schedule notification successfully"
            }
            let titleAdmin = `QTV ${admin.full_name} Xóa lịch thông báo ${notification_schedule._id}`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                id_notification_schedule: notification_schedule.id_notification_schedule
            }) 

            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createBankAccount(subjectAction, payloadDependency) {
        try {
            const customer = payloadDependency.customer
            const title = {
                vi: "Tạo tài khoản ngân hàng thành công",
                en: "Successfully created a bank account"
            }
            const titleAdmin = `Khách hàng ${customer.full_name} tạo tài khoản ngân hàng thành công!`
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "customer_create_bank_account",

            }) 
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fillStatusAPayBalance(getReferrerPerson, previousBalance) {
        try {
            const payload = {
                current_a_pay: getReferrerPerson.a_pay,
                status_current_a_pay: (previousBalance.a_pay < getReferrerPerson.a_pay) ?
                    "up" : (previousBalance.a_pay > getReferrerPerson.a_pay) ? "down" : "none",
            }
            return payload
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addAPointForReferrerPerson(subjectAction, payloadDependency, previousBalance, getCustomer, money) {
        try {
            const inviter = payloadDependency.customer_referrer
            const last4Digits = getCustomer.phone.slice(-4);
            const maskedNumber = last4Digits.padStart(getCustomer.phone.length, '*');
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Nhận chiết khấu từ khách hàng ${maskedNumber}`,
                en: `Get discount from the customer ${maskedNumber}`
            }
            const titleAdmin = `Nhận chiết khấu từ khách hàng ${getCustomer.full_name} với số tiền ${formatMoney}`
            const type = 'system_receive_discount'
            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                ...await this.fillStatusAPayBalance(inviter, previousBalance),
                value: money
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListPaginationForReferrerPerson(subjectAction, iPage, idCustomer) {
        try {
            const query = {
                $or: [
                    { 
                        $and: [
                            { type: { $in: ['customer_request_withdraw_affiliate', 'admin_request_withdraw_affiliate'] } },
                            { id_customer: idCustomer },
                        ] 
                    },
                    { 
                        $and: [
                            { type: 'system_receive_discount' },
                            { id_customer_referrer: idCustomer },
                        ] 
                    }
                ]  
            }
            let select = {}
            if(subjectAction.type !== TYPE_SUBJECT_ACTION.admin) {
                select = {
                    id_customer: 1,
                    title: 1,
                    body: 1,
                    date_create: 1,
                    status_current_a_pay: 1,
                    current_a_pay: 1,
                    is_affiliate: 1,
                    type: 1,
                    value: 1
                }
            }
            const dataResult =  await this.getList(query, iPage, select, false)
            return dataResult;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForReferrerPerson(idCustomer, queryByDate: boolean = false) {
        try {
            let query:any = {
                $and: [
                    { id_customer_referrer: idCustomer },
                    { type: 'system_receive_discount' },
                ]  
            }

            if (queryByDate) {
                const now = new Date(new Date(new Date().setHours(23, 59, 59, 99))).toISOString()
                const thirtyDayAgo = new Date(new Date(now).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                query = {
                    $and: [
                        { date_create: { $gte: thirtyDayAgo, $lt: now }},
                        { id_customer_referrer: idCustomer },
                        { type: 'system_receive_discount' },
                    ] 
                }
            }

            const dataResult = await this.historyActivityRepositoryService.getListDataByCondition(query, {  value: 1 }, {date_create: 1})
            return dataResult;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getListHistoryActivity(lstIdOrder) {
        const query = {
            $and:[
                { id_order: {$in:lstIdOrder}},
                { type: 'system_add_pay_point' }
            ]
        }
        return await this.historyActivityRepositoryService.getListDataByCondition(query)
    }

    async createNewAccountForCustomer(subjectAction, payloadDependency) {
        try {
            const customer = payloadDependency.customer
            let title = {
                en: "User create is successfully",
                vi: "Tài khoản đã tạo thành công"
            }
            let body = {
                vi: `Khách hàng ${customer.full_name} đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`,
                en: `Customer ${customer.full_name} has agreed to GUVI's terms of use and privacy policy`
            }
            let titleAdmin = `Khách hàng ${customer.full_name} đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI!`
            let type = 'customer_create_new_account'

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const admin = payloadDependency.admin_action
                title = {
                    en: 'Create customer successfully',
                    vi: 'Tạo mới khách hàng thành công',
                };
                body = {
                    en: 'Create customer successfully',
                    vi: 'Tạo mới khách hàng thành công',
                };
                titleAdmin = `QTV ${admin.full_name} đã tạo mới khách hàng!`
                type = 'admin_create_user'
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: type,
            }) 

            if(subjectAction.type === TYPE_SUBJECT_ACTION.customer) {
                const title2 = {
                    vi: `Bạn đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`,
                    en: `You have agreed to GUVI's terms of use and privacy policy`
                }
                const body2 = {
                    vi: `Khách hàng ${customer.full_name} đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`,
                    en: `Customer ${customer.full_name} has agreed to GUVI's terms of use and privacy policy`
                }
                const titleAdmin2 = `Khách hàng ${customer.full_name} đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`
                await this.createItem({
                    ...await this.fillPayloadDependency(title2, body2, titleAdmin2, payloadDependency, subjectAction),
                    type: "customer_accept_policy",
    
                }) 
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async applyReferralCode(subjectAction, payloadDependency, isCustomer, referralPerson, type_subject_action) {
        try {
            let inviter:any
            if (isCustomer) {
                inviter = payloadDependency.customer
            } else {
                inviter = payloadDependency.collaborator;
            }

            let title = {
                vi: "Nhập mã giới thiệu thành công",
                en: "Enter referral code successfully"
            }
            let titleAdmin = `${referralPerson.full_name} đã nhập mã giới thiệu của ${inviter.full_name}`
            let type = `${type_subject_action}_inviter_code_was_applied`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    async createNewAccountForCollaborator(subjectAction, payloadDependency) {
        try {
            const collaborator = payloadDependency.collaborator
            const title = {
                en: "Collaborator create account successfully",
                vi: "Đối tác đã tạo tài khoản thành công"
            }

            let titleAdmin = `Đối tác ${collaborator.full_name} đăng kí thành công tài khoản!`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "collaborator_create_new_account",
            }) 
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async systemGiveMoney(subjectAction, payloadDependency, referralPerson, previousBalance, money) {
        try {
            const collaborator = payloadDependency.collaborator

            const formatMoney = await this.generalHandleService.formatMoney(money);

            const title = {
                en: `${referralPerson.full_name} done 3 jobs with good review`,
                vi: `${referralPerson.full_name} đã hoàn thành 3 ca làm được đánh giá tốt`
            }
            const body = {
                en: `You given ${formatMoney} because  ${referralPerson.full_name} done 3 jobs with good review`,
                vi: `Bạn được tặng ${formatMoney} vì ${referralPerson.full_name} đã hoàn thành 3 ca làm được đánh giá tốt`
            }
            let titleAdmin = `${collaborator.full_name} được tặng ${formatMoney} vì đã giới thiệu CTV ${referralPerson.full_name}`;
            let type = 'system_given_money'
            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: money || 0,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance) ,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemGiveMoneyNew(subjectAction, payloadDependency, referralPerson, previousBalance, money, isCustomer) {
        try {
            let inviter:any
            if(isCustomer) {
                inviter = payloadDependency.customer
            } else {
                inviter = payloadDependency.collaborator
            }

            const formatMoney = await this.generalHandleService.formatMoney(money);

            const title = {
                en: `${referralPerson.full_name} has completed at least 5 shifts and has 3 good reviews of 4 stars or higher`,
                vi: `${referralPerson.full_name} đã hoàn thành ít nhất 5 ca làm và có 3 đánh giá tốt từ 4 sao trở lên`
            }
            const body = {
                en: `You are given ${formatMoney} because  ${referralPerson.full_name} has completed at least 5 shifts and has 3 good reviews of 4 stars or higher`,
                vi: `Bạn được tặng ${formatMoney} vì ${referralPerson.full_name} đã hoàn thành 3 ca làm được đánh giá tốt`
            }
            let titleAdmin = `${inviter.full_name} được tặng ${formatMoney} vì đã giới thiệu đối tác ${referralPerson.full_name}`;
            let type = 'system_given_money'
            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: money || 0,
                ...await this.fillStatusPayPointOrWorkWallerBalance(inviter, previousBalance, isCustomer) ,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateHandleNoteAdminCollaborator(subjectAction, payloadDependency, noteAdmin) {
        try {
            const admin = payloadDependency.admin_action
            const collaborator = payloadDependency.collaborator

            const title = {
                en: 'The administrator has changed the account status',
                vi: 'Quản trị viên đã thay đổi ghi chú tài khoản',
            }
            const titleAdmin = `${admin?.full_name} đã cập nhật ghi chú cho ${collaborator.full_name}`;
            let type = 'admin_update_note_admin_collaborator'
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value_string: noteAdmin
            })

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateHandleStatusCollaborator(subjectAction, payloadDependency, status) {
        try {
            const admin = payloadDependency.admin_action
            const collaborator = payloadDependency.collaborator

            const title = {
                en: 'The administrator has changed the account status',
                vi: 'Quản trị viên đã thay đổi trạng thái tài khoản',
            }

            const statusProfile = STATUS_COLLABORATOR_PROFILE[status]?.value
            const textStatus = STATUS_COLLABORATOR_PROFILE[status]?.label

            const titleAdmin = `${admin?.full_name} đã cập nhật trạng thái thành ${textStatus} cho ${collaborator.full_name}`;
            let type = 'admin_update_status_collaborator'
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value_select: statusProfile
            })

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyCollaborator(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const collaborator = payloadDependency.collaborator

            const title = {
                en: 'Verified collaborator',
                vi: 'Đã phê duyệt cộng tác viên',
            }

            const titleAdmin = `${admin?.full_name} đã phê duyệt cho cộng tác viên ${collaborator.full_name}`;
            let type = 'admin_verify_user'
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateReferralCode(subjectAction, payloadDependency) {
        try {
            const customer = payloadDependency.customer
            const title = {
                vi: "Cập nhật mã giới thiệu thành công",
                en: "Referral code updated successfully"
            }
            const titleAdmin = `${customer.full_name} đã cập nhật mã giới thiệu`
            const type = `customer_update_referral_code`

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    async createWithdrawalRequestForReferrer(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const customer = payloadDependency.customer
            const transaction = payloadDependency.transaction
            const formatMoney = await this.generalHandleService.formatMoney(money);

            let title:any
            let titleAdmin:any
            let type:any
            if(subjectAction.type === TYPE_SUBJECT_ACTION.customer) {
                title = {
                    vi: `Bạn đã lên yêu cầu rút ${formatMoney} với mã ${transaction.id_view}`,
                    en: `You have requested to withdraw ${formatMoney} with code ${transaction.id_view}`,
                }
                titleAdmin = `Khách hàng ${customer.full_name} lên yêu cầu rút ${formatMoney} từ chương trình affiliate với mã ${transaction.id_view}`;
                type = "customer_request_withdraw_affiliate"
            } else if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const admin = payloadDependency.admin_action
                title = {
                    vi: `QTV đã tạo yêu cầu rút ${formatMoney} cho bạn với mã ${transaction.id_view}`,
                    en: `Administrator has created a withdrawal request of ${formatMoney} for you with code ${transaction.id_view}`,
                }
                titleAdmin = `QTV ${admin?.full_name} đã tạo lệnh rút ${formatMoney} cho khách hàng ${customer.full_name} trong chương trình affiliate với mã ${transaction.id_view}`,
                type = "admin_request_withdraw_affiliate";
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                ...await this.fillStatusAPayBalance(customer, previousBalance),
                value: money
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelWithdrawalRequestForReferrer(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const customer = payloadDependency.customer
            const transaction = payloadDependency.transaction
            const formatMoney = await this.generalHandleService.formatMoney(money);

            let title:any
            let titleAdmin:any
            let type:any
            if(subjectAction.type === TYPE_SUBJECT_ACTION.customer) {
                title = {
                    vi: `Bạn đã hủy yêu cầu rút ${formatMoney} với mã ${transaction.id_view}`,
                    en: `You have canceled your request to withdraw ${formatMoney} with code ${transaction.id_view}`,
                }
                titleAdmin = `Khách hàng ${customer.full_name} hủy yêu cầu rút ${formatMoney} từ chương trình affiliate với mã ${transaction.id_view}`;
                type = "customer_cancel_withdraw_affiliate"
            } else if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const admin = payloadDependency.admin_action
                title = {
                    vi: `QTV đã hủy lệnh rút ${formatMoney} cho bạn với mã ${transaction.id_view}`,
                    en: `Administrator has canceled your request to withdraw ${formatMoney} with code ${transaction.id_view}`,
                }
                titleAdmin = `QTV ${admin?.full_name} đã hủy lệnh rút ${formatMoney} cho khách hàng ${customer.full_name} trong chương trình affiliate với mã ${transaction.id_view}`,
                type = "admin_cancel_withdraw_affiliate";
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                ...await this.fillStatusAPayBalance(customer, previousBalance),
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    async verifyTransaction(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const transaction = payloadDependency.transaction

            const title = {
                vi: `QTV đã duyệt lệnh ${transaction.id_view} cho bạn`,
                en: `Administrator has approved request ${transaction.id_view} for you`,
            }
            const titleAdmin = `QTV ${admin?.full_name} đã duyệt lệnh ${transaction.id_view}`
            const type = "admin_verify_transaction";
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyTopUpCustomer(subjectAction, payloadDependency) {
        try {
            const customer = payloadDependency.customer
            const transaction = payloadDependency.transaction

            const title = {
                vi: 'Nạp thành công',
                en: 'Top up successfully'
            }
            const titleAdmin = `Duyệt lệnh nạp ${transaction.id_view} của khách hàng ${customer.full_name} thành công`;
            const type = "verify_transaction_top_up";

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: transaction.money || 0,
                current_pay_point: customer.pay_point,
                status_current_pay_point: "up",
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createPromotion(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const promotion = payloadDependency.promotion
            const title = {
                en: 'Create new promotion successfully',
                vi: 'Tạo mới khuyến mãi thành công',
            }
            const titleAdmin = `QTV ${admin?.full_name} đã tạo khuyến mãi ${promotion._id} thành công`
            const type = "admin_create_promotion";

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editCustomer(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const customer = payloadDependency.customer

            const title = {
                vi: `QTV đã thay đổi thông tin khách hàng`,
                en: `Administrator has change customer information`
            }
            const titleAdmin = `QTV ${admin.full_name} đã thay đổi thông tin của khách hàng ${customer.full_name} `
            const type = "admin_edit_user";
            
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    
    async editPromotion(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const promotion = payloadDependency.promotion
            const title = {
                en: 'Edited promotion successfully',
                vi: 'Thay đổi thông tin khuyến mãi thành công',
            };
            const type  = 'admin_edit_promotion'
            const titleAdmin = `QTV ${admin?.full_name} đã thay đổi thông tin khuyến mãi ${promotion._id}`;

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activePromotion(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const promotion = payloadDependency.promotion
            const title = {
                en: 'Change active of promotion ',
                vi: 'Đã thay đổi trạng thái của khuyến mãi ',
            };
            const titleAdmin = `QTV ${admin?.full_name} đã thay đổi trạng của khuyến mãi ${promotion._id}`;
            const type =  'admin_acti_promotion'
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deletePromotion(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const promotion = payloadDependency.promotion
            const title = {
                en: 'Deleted promotion successfully',
                vi: 'Xóa khuyến mãi thành công',
            };
            const titleAdmin = `QTV ${admin?.full_name} đã xóa khuyến mãi ${promotion._id} thành công`;
            const type = 'admin_delete_promotion'
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeCollaborator(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator

            const title = {
                en: 'Admin changed collaborator in group order',
                vi: 'Admin đã thay đổi CTV cho đơn hàng',
            };

            const type = 'admin_change_collaborator'

            const titleAdmin = `QTV ${admin?.full_name} đã thay đổi đối tác  ${collaborator.full_name} cho đơn hàng ${order.id_view} thành công`;
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async minusRemainingShiftDeposit(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const order = payloadDependency.order;
            const collaborator = payloadDependency.collaborator;
            let title = {
                vi: `Cấn trừ số tiền thu hộ còn lại của ca làm ${order.id_view}`,
                en: `Deducting the remaining collected amount of the order ${order.id_view}`
            }
            let titleAdmin = `Cấn trừ số tiền thu hộ còn lại của ca làm ${order.id_view}`
            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: "system_minus_remaining_shift_deposit",
                value: -money,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async allowConfirmingDuplicateOrder(subjectAction, payloadDependency) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator
            
            const admin = payloadDependency.admin_action
            let title = {
                vi: `QTV cho phép đối tác ${collaborator.full_name} nhận trùng đơn hàng ${order.id_view} (nếu có)`,
                en: `Administrator allows partner ${collaborator.full_name} to accept duplicate order ${order.id_view} (if any)`,
            }

            let titleAdmin = `QTV ${admin?.full_name} cho phép đối tác ${collaborator.full_name} nhận trùng ca ${order.id_view} (nếu có)`
            let type = "admin_allow_confirming_duplicate_order";

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateAddressForOrder(subjectAction, payloadDependency) {
        try {
            const group_order = payloadDependency.group_order
            const admin = payloadDependency.admin_action
            let title = {
                vi: `QTV cập nhật địa chỉ cho đơn hàng ${group_order.id_view}`,
                en: `Administrator updates address for order ${group_order.id_view}`,
            }

            let titleAdmin = `QTV ${admin?.full_name} cập nhật địa chỉ cho đơn hàng ${group_order.id_view}`
            let type = "admin_update_address_for_order";

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async restoreAccountForCollaborator(subjectAction, payloadDependency) {
        try {
            const collaborator = payloadDependency.collaborator
            const admin = payloadDependency.admin_action
            let title = {
                vi: `QTV khôi phục tài khoản cho đối tác ${collaborator._id}`,
                en: `Administrator restores account for collaborator ${collaborator._id}`,
            }

            let titleAdmin = `QTV ${admin?.full_name} khôi phục tài khoản cho đối tác ${collaborator._id}`
            let type = "admin_restore_account_for_collaborator";

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createLoopGroupOrder(subjectAction, payloadDependency) {
        try {
            const getGroupOrder = payloadDependency.group_order
            let title = {
                vi: "Đơn hàng lặp lại của bạn đã lên thành công",
                en: "Your recurring order has been successfully placed."
            }
            const titleAdmin = `Hệ thống lên thành công đơn hàng lặp lại ${getGroupOrder.id_view}`
            const type = 'system_create_loop_group_order'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 
            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addRewardPoint(subjectAction, payloadDependency, contentHistoryActivity, rewardPoint, previousBalance) {
        try {
            const payloadContent = {
                order_id_view: payloadDependency.order.id_view,
                collaborator_full_name: payloadDependency.collaborator.full_name
            }
            const collaborator = payloadDependency.collaborator;
            let title = {
                vi: contentHistoryActivity.title.vi,
                en: contentHistoryActivity.title.en
            }
            let body = {
                vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.vi),
                en: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.en)
            }
            
            let titleAdmin = await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.title_admin)
            const type = 'system_add_reward_point'
            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: rewardPoint,
                current_reward_point: collaborator.reward_point,
                status_reward_point: (previousBalance.reward_point < collaborator.reward_point) ?
                    "up" : (previousBalance.reward_point > collaborator.reward_point) ? "down" : "none",
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addRewardMoney(subjectAction, payloadDependency, contentHistoryActivity, previousBalance) {
        try {
            const collaborator = payloadDependency.collaborator;
            const reward_ticket = payloadDependency.reward_ticket;
            const payloadContent = {
                reward_value: payloadDependency.reward_ticket.reward_value,
                collaborator_full_name: payloadDependency.collaborator.full_name
            }
            let title = {
                vi: contentHistoryActivity.title.vi,
                en: contentHistoryActivity.title.en
            }

            let body = {
                vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.vi),
                en: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.en)
            }
            let titleAdmin = `Đối tác ${collaborator.full_name} đạt ${contentHistoryActivity.title.vi}`
            const type = "system_add_reward_money"
            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: reward_ticket.reward_value,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async logViolation(subjectAction, payloadDependency, contentHistoryActivity) {
        try {
            const payloadContent = {
                order_id_view: payloadDependency.order.id_view,
                collaborator_full_name: payloadDependency.collaborator.full_name
            }
            let title = {
                vi: contentHistoryActivity.title.vi,
                en: contentHistoryActivity.title.en
            }
            let body = {
                vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.vi),
                en: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.en)
            }
            let titleAdmin = await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.title_admin)
            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: "system_log_violation",
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async logViolationAndFine(subjectAction, payloadDependency, contentHistoryActivity, previousBalance) {
        try {
            const collaborator = payloadDependency.collaborator;
            const punish_ticket = payloadDependency.punish_ticket;
            const payloadContent = {
                punish_money: punish_ticket.punish_money,
                collaborator_full_name: collaborator.full_name,
                order_id_view: payloadDependency.order.id_view
            }
            let title = {
                vi: contentHistoryActivity.title.vi,
                en: contentHistoryActivity.title.en
            }
            let body = {
                vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.vi),
                en: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.description.en)
            }
        
            let titleAdmin = await this.generalHandleService.convertTemplateLiteral(payloadContent, contentHistoryActivity.title_admin)
            const type = "system_log_violation_and_fine"
            await this.createItem({
                ...await this.fillPayloadDependency(title, body, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: punish_ticket.punish_money,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async balanceMoney(subjectAction, payloadDependency, previousBalance, money) {
        try {
            const collaborator = payloadDependency.collaborator
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Hệ thống đã chuyển ${formatMoney} sang ví công việc thành công.`,
                en: `System transfered ${formatMoney} to the work wallet successful.`
            }
            
            const titleAdmin = `Hệ thống cân bằng số dư thành công`
            const type = 'system_balance_money'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: money,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            }) 
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async editCollaborator(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action
            const collaborator = payloadDependency.collaborator

            const title = {
                vi: `QTV đã thay đổi thông tin đối tác`,
                en: `Administrator has change collaborator information`
            }
            const titleAdmin = `QTV ${admin.full_name} đã thay đổi thông tin của đối tác ${collaborator.full_name} `
            const type = "admin_edit_collaborator";
            
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

<<<<<<< HEAD
    async balanceMoney(subjectAction, payloadDependency, previousBalance, money) {
        try {
            const collaborator = payloadDependency.collaborator
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Hệ thống đã chuyển ${formatMoney} sang ví công việc thành công.`,
                en: `System transfered ${formatMoney} to the work wallet successful.`
            }
            
            const titleAdmin = `Hệ thống cân bằng số dư thành công`
            const type = 'system_balance_money'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
                value: money,
                ...await this.fillStatusAccountBalance(collaborator, previousBalance)
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

=======
>>>>>>> son
    async logErrorGroupOrder(subjectAction, payloadDependency) {
        try {
            const group_order = payloadDependency.group_order
            const title = {
<<<<<<< HEAD
                vi: `Nhóm đơn hàng ${group_order.id_vew} có id ${group_order._id} bị lỗi id_collaborator ở order và id_collaborator ở group order khác nhau`,
                en: `The order group ${group_order.id_vew} with ID ${group_order._id} has an error where the collaborator ID in the order and the collaborator ID in the order group are different`
            }
            
            const titleAdmin = `Nhóm đơn hàng ${group_order.id_vew} có id ${group_order._id} bị lỗi id_collaborator ở order và id_collaborator ở group order khác nhau`
=======
                vi: `Nhóm đơn hàng ${group_order.id_view} có id ${group_order._id} bị lỗi id_collaborator ở order và id_collaborator ở group order khác nhau`,
                en: `The order group ${group_order.id_view} with ID ${group_order._id} has an error where the collaborator ID in the order and the collaborator ID in the order group are different`
            }
            
            const titleAdmin = `Nhóm đơn hàng ${group_order.id_view} có id ${group_order._id} bị lỗi id_collaborator ở order và id_collaborator ở group order khác nhau`
>>>>>>> son
            const type = 'system_error_group_order_and_order'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    
    async getListByTypeAndIdGroupOrder(idGroupOrder, type) {
        try {
            const query = {
                $and: [
                    { type: type },
                    { id_group_order: idGroupOrder }
                ]
            }

            return await this.historyActivityRepositoryService.getListDataByCondition(query, {}, { date_create: 1 })
        } catch(err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    
    async getItemBeforeASpecificTimeByCollaborator(idCollaborator, time) {
        try {
            const query = {
                $and: [
                    {
                        $or: HISTORY_ACTIVITY_WALLET
                    },
                    { id_collaborator: idCollaborator },
                    { date_create: { $lt: time } }
                ]
            }

            return await this.historyActivityRepositoryService.findOne(query, {}, { date_create: -1 })
        } catch(err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryRemainderByCollaborator(idCollaborator, time?) {
        try {
            const query:any = {
                $and: [
                    {
                        $or: HISTORY_ACTIVITY_WALLET
                    },
                    { id_collaborator: idCollaborator },
                ]
            }

            if(time !== null && time !== undefined) {
                query.$and.push( { date_create: { $gte: time } })
            }

            return await this.historyActivityRepositoryService.getListDataByCondition(query, {}, { date_create: 1})
        } catch(err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    
    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.historyActivityRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "history_activity")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateHistoryActivity(lang, historyActivity) {
        try {
            await this.getDetailItem(lang, historyActivity._id)
            return await this.historyActivityRepositoryService.findByIdAndUpdate(historyActivity._id, historyActivity)
        } catch(err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    
    async permanentlyDeleteItem(lang, idItem) {
        try {
            await this.getDetailItem(lang, idItem)
            return await this.historyActivityRepositoryService.findByIdAndPermanentlyDelete(idItem)
        } catch(err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
<<<<<<< HEAD
=======

    async createPunishTicket(subjectAction, payloadDependency) {
        try {
            const punish_ticket = payloadDependency.punish_ticket
            const collaborator = payloadDependency.collaborator
            const title = {
                en: `Create punish ticket ${punish_ticket.id_view} success`,
                vi: `Tạo vé phạt ${punish_ticket.id_view} thành công`,
            }

            const titleAdmin = `Vé phạt ${punish_ticket.id_view} của đối tác ${collaborator.full_name} đã được tạo thành công`
            let type = `system_create_punish_ticket`
            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                type = `admin_create_punish_ticket`
            }

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createPunishPolicy(subjectAction, payloadDependency) {
        try {
            const punish_policy = payloadDependency.punish_policy
            const admin = payloadDependency.admin_action

            const title = {
                en: `Create punish policy ${punish_policy.id_view} success`,
                vi: `Tạo chính sách phạt ${punish_policy.id_view} thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} tạo chính sách phạt ${punish_policy.id_view} thành công`
            const type = 'admin_create_punish_policy'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updatePunishPolicy(subjectAction, payloadDependency) {
        try {
            const punish_policy = payloadDependency.punish_policy
            const admin = payloadDependency.admin_action

            const title = {
                en: `Update punish policy ${punish_policy.id_view} success`,
                vi: `Cập nhật chính sách phạt ${punish_policy.id_view} thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} cập nhật chính sách phạt ${punish_policy.id_view} thành công`
            const type = 'admin_update_punish_policy'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createRewardPolicy(subjectAction, payloadDependency) {
        try {
            const reward_policy = payloadDependency.reward_policy
            const admin = payloadDependency.admin_action

            const title = {
                en: `Create reward policy ${reward_policy.id_view} success`,
                vi: `Tạo chính sách thưởng ${reward_policy.id_view} thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} tạo chính sách thưởng ${reward_policy.id_view} thành công`
            const type = 'admin_create_reward_policy'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateRewardPolicy(subjectAction, payloadDependency) {
        try {
            const reward_policy = payloadDependency.reward_policy
            const admin = payloadDependency.admin_action

            const title = {
                en: `Update reward policy ${reward_policy.id_view} success`,
                vi: `Cập nhật chính sách thưởng ${reward_policy.id_view} thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} cập nhật chính sách thưởng ${reward_policy.id_view} thành công`
            const type = 'admin_update_reward_policy'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createContentNotification(subjectAction, payloadDependency) {
        try {
            const content_notification = payloadDependency.content_notification
            const admin = payloadDependency.admin_action

            const title = {
                en: `Create content notification success`,
                vi: `Tạo nội dung thông báo thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} tạo nội dung thông báo thành công`
            const type = 'admin_create_content_notification'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateContentNotification(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action

            const title = {
                en: `Update content notification success`,
                vi: `Cập nhật nội dung thông báo thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} cập nhật nội dung thông báo thành công`
            const type = 'admin_update_content_notification'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createContentHistoryActivity(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action

            const title = {
                en: `Create content history activity success`,
                vi: `Tạo nội dung lịch sử hoạt động thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} tạo nội dung lịch sử hoạt động thành công`
            const type = 'admin_create_content_history_activity'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateContentHistoryActivity(subjectAction, payloadDependency) {
        try {
            const admin = payloadDependency.admin_action

            const title = {
                en: `Update content history activity success`,
                vi: `Cập nhật nội dung lịch sử hoạt động thành công`,
            }

            const titleAdmin = `QTV ${admin.full_name} cập nhật nội dung lịch sử hoạt động thành công`
            const type = 'admin_update_content_history_activity'

            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type
            }) 

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async revokeRewardMoneyCollaborator(subjectAction, payloadDependency, previousBalance, money) {
        try {
            const getCollaborator = payloadDependency.collaborator
            const getPunishTicket = payloadDependency.punish_ticket
            const getAdmin = payloadDependency.admin_action
            let type = 'admin_revoke_reward_money'
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Thu hồi ${formatMoney} từ lệnh thưởng ${getPunishTicket.id_view}`,
                en: `Revoke ${formatMoney} from reward ticket ${getPunishTicket.id_view}`
            }
            const titleAdmin = `QTV ${getAdmin.full_name} thu hồi lệnh thưởng, thu hồi ${formatMoney} của CTV ${getCollaborator.full_name}`;
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type,
                value: money || 0,
                ...await this.fillStatusAccountBalance(getCollaborator, previousBalance)
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokeRewardPointCollaborator(subjectAction, payloadDependency, previousBalance, point) {
        try {
            const getCollaborator = payloadDependency.collaborator
            const getPunishTicket = payloadDependency.punish_ticket
            const getAdmin = payloadDependency.admin_action
            let type = 'admin_revoke_reward_point'
            const title = {
                vi: `Thu hồi ${point} điểm từ lệnh thưởng ${getPunishTicket.id_view}`,
                en: `Revoke ${point} points from reward ticket ${getPunishTicket.id_view}`
            }
            const titleAdmin = `QTV ${getAdmin.full_name} thu hồi lệnh thưởng, thu hồi ${point} điểm của CTV ${getCollaborator.full_name}`;
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type,
                value: point || 0,
                ...await this.fillStatusPointBalance(getCollaborator, previousBalance)
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async resetRewardPoint(subjectAction, payloadDependency) {
        try {
            const collaborator = payloadDependency.collaborator

            const title = {
                vi: `Hệ thống đặt lại điểm tích lũy về 0`,
                en: `The system resets accumulated points to zero`
            }
            const titleAdmin = `Hệ thống đặt lại điểm tích lũy về 0 cho đối tác ${collaborator.full_name} `
            const type = "system_reset_reward_point";
            
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async resetMonthlyRewardPoint(subjectAction, payloadDependency) {
        try {
            const collaborator = payloadDependency.collaborator

            const title = {
                vi: `Hệ thống đặt lại điểm tích lũy tháng về 0`,
                en: `The system resets accumulated monthly points to zero`
            }
            const titleAdmin = `Hệ thống đặt lại điểm tích lũy tháng về 0 cho đối tác ${collaborator.full_name} `
            const type = "system_reset_monthly_reward_point";
            
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createReviewCollaboratorByCustomer(subjectAction, payloadDependency) {
        try {
            const collaborator = payloadDependency.collaborator
            const customer = payloadDependency.customer
            const order = payloadDependency.order

            const title = {
                vi: `Khách hàng đánh giá thành công đối tác`,
                en: `User create review collaborator`
            }
            const titleAdmin = `${customer.full_name} đã đánh giá đối tác ${collaborator.full_name} qua đơn hàng ${order.id_view} `
            const type = "customer_review_collaborator";
            
            await this.createItem({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
                type: type,
            })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListHistoryActivitiesForGroupOrder(lang, iPage, subjectAction, idGroupOrder) {
        try {

            const query = {
                $and: [
                    {
                        id_group_order: await this.generalHandleService.convertObjectId(idGroupOrder)
                    }
                ]
            }


            const populateArr = [
                POP_CUSTOMER_INFO,
                POP_COLLABORATOR_INFO,
                {
                    path: 'id_admin_action', select: { full_name: 1, }
                },
                {
                    path: 'id_user_system', select: { full_name: 1, }
                },
                {
                    path: 'id_reason_cancel', select: { title: 1, }
                },
                {
                    path: 'id_group_order', select: { id_view: 1, _id: 1 }
                },
                {
                    path: 'id_order', select: { id_view: 1, _id: 1 }
                },
            ]

             const reuslt = await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: 1 }, populateArr)
            return reuslt;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
>>>>>>> son
}