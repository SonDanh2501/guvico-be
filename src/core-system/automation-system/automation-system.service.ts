import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AFTER_ACTION } from 'src/@core'
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto'
import { AutomationRepositoryService } from 'src/@repositories/repository-service/automation-repository/automation-repository.service'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { ContentNotificationRepositoryService } from 'src/@repositories/repository-service/content-notification-repository/content-notification-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { DeviceTokenRepositoryService } from 'src/@repositories/repository-service/device-token-repository/device-token-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { NotificationService } from 'src/notification/notification.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { PunishTicketSystemService } from '../punish-ticket-system/punish-ticket-system.service'
import { TransactionSystemService } from '../transaction-system/transaction-system.service'
const { ObjectId } = require('mongodb');
@Injectable()
export class AutomationSystemService {
    constructor(
        private automationRepositoryService: AutomationRepositoryService,
        private orderRepositoryService: OrderRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private activitySystemService: ActivitySystemService,
        private transactionSystemService: TransactionSystemService,
        private transactionRepositoryService: TransactionRepositoryService,

        private punishTicketSystemService: PunishTicketSystemService,

        private punishPolicyRepositoryService: PunishPolicyRepositoryService,
        private contentNotificationRepositoryService: ContentNotificationRepositoryService,


        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,

        private notificationSystemService: NotificationSystemService,

        private deviceTokenRepositoryService: DeviceTokenRepositoryService,

        private notificationService: NotificationService,
    ) { }


    async runAutomation(typeTrigger, payloadAutomation?) {
        try {
            let query: any = {
                $and: [
                    { status: "doing" },
                    { type_trigger: typeTrigger },
                    { action_trigger: null }
                ]
            }

            if(payloadAutomation) {
                const temp = AFTER_ACTION.filter(x => x.url === payloadAutomation.url);
                if(temp.length > 0) {
                    query["$and"][2] = { action_trigger: temp[0].action_trigger }
                }
            }
            const getListAutomation = await this.automationRepositoryService.getListDataByCondition(query);
            if(typeTrigger === "after_action" && payloadAutomation) {
                    for(let i = 0 ; i < getListAutomation.length ; i++) { 
                        this.runAutomationActionTrigger(getListAutomation[i], payloadAutomation)
                    }
            } else {
                for (let i = 0; i < getListAutomation.length; i++) {
                    await this.runAutomationScheduleTrigger(getListAutomation[i])
                }
            }


        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async runAutomationActionTrigger(automation, payloadAutomation) {
        try {


            const dataRequire = await this.getDataRequireAction(automation);
            let dataInput = {
                data: []
            }
            switch(automation.action_trigger) {
                case "collaborator_cancel_order": {
                    dataInput.data.push({
                        id_collaborator: payloadAutomation.id_user_token,
                        id_order: payloadAutomation.id_params
                    })
                }
            }

            dataInput = await this.runCheckCodition(automation, dataRequire, dataInput)


            if (dataInput.data.length > 0) {
                await this.runAction(automation, dataInput.data)
            }



        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async runAutomationScheduleTrigger(automation) {
        try {


            const getDataRequire = await this.getDataRequireAction(automation);

            
            const dataInput = await this.runCheckCodition(automation, getDataRequire)
            
            // console.log(dataInput, 'dataInput');
            
            
            if (dataInput.data.length > 0) {
                await this.runAction(automation, dataInput.data)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async runAction(automation, dataInput) {
        try {
            let formDataRequire = []
            switch (automation.action.type_action) {
                case "create_and_start_punish_ticket": {
                    const convertMinitue = automation.action
                    
                    const getPunishPolicy = await this.punishPolicyRepositoryService.findOneById(automation.action.id_punish_policy);
                    for (const item of dataInput) {

                        const payload: createPunishTicketFromPolicyDTO = {
                            id_order: item.id_order._id,
                            id_collaborator: item.id_collaborator._id,
                            id_punish_policy: getPunishPolicy._id,
                            is_verify_now: true,
                            note_admin: getPunishPolicy.title.vi
                        }

                        const findCollaborator = await this.collaboratorRepositoryService.findOneById(item.id_collaborator._id);
                        const findOrder = await this.orderRepositoryService.findOneById(item.id_order._id);
                        const previousBalance = {
                            work_wallet: findCollaborator.work_wallet,
                            collaborator_wallet: findCollaborator.collaborator_wallet
                        }

                        let ticket = await this.punishTicketSystemService.createPunishTicketFromPolicy("vi", payload);
                        // Cập nhật phiếu phạt vào trong đơn hàng
                        if(findOrder !== null && findOrder !== undefined) {
                            const punishTicketForOrder = {
                                id_punish_ticket: ticket._id,
                                date_create: ticket.date_create,
                                execution_date: new Date().toISOString(),
                                revocation_date: null
                            }
                            findOrder.list_of_punish_ticket.push(punishTicketForOrder)
                            findOrder.total_punish += ticket.punish_money
                            findOrder.incurrence_time.push({ date_create: ticket.date_create, fee: ticket.punish_money })
                            await this.orderRepositoryService.findByIdAndUpdate(findOrder._id, findOrder)
                        }
                        await this.activitySystemService.createPunishTicket(ticket);
                        ticket = await this.punishTicketSystemService.standbyToWaitingPunishTicket("vi", ticket);
                        const punishTicket = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi", ticket);
                        const transaction = await this.transactionRepositoryService.findOneById(punishTicket.id_transaction);
                        if (transaction) {
                            await this.activitySystemService.createTransaction(transaction);
                            await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction, null, true);
                            await this.activitySystemService.verifyPunishCollaboratorTransaction(transaction, previousBalance)
                        }
                        await this.punishTicketSystemService.doingToDonePunishTicket('vi', punishTicket);



                        // console.log("log 1");

                        // const punishticket = await this.punishTicketSystemService.createPunishTicketFromPolicy('vi', payload);
                        // console.log("log 2");

                        // await this.activitySystemService.createPunishTicket(punishticket);// log lịch sử
                        // console.log("log 3");

                        // let ticket = await this.punishTicketSystemService.standbyToWaitingPunishTicket('vi', punishticket);
                        // console.log("log 4");

                        // ticket = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi", ticket);
                        // console.log("log 5");

                        // ticket = await this.punishTicketSystemService.doingToDonePunishTicket('vi', ticket);
                        // console.log("log 6");

                        // await this.activitySystemService.verifyPunishTicket(ticket);
                        // console.log("log 7");

                        // const result = await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction);
                        // console.log("log 8");

                        // // await this.activitySystemService.verifyPunishCollaborator(result.transaction, result.collaborator, previousBalance);

                        // await this.activitySystemService.verifyPunishCollaboratorTransaction(result.transaction, )
                        // console.log("log 9");

                        
                        if (automation.action.id_content_notification !== null) {
                            const findNoti = await this.contentNotificationRepositoryService.findOneById(automation.action.id_content_notification);
                            const payloadContent = {
                                order_id_view: item.id_order.id_view,
                                punish_ticket_money: await this.generalHandleService.formatMoney(punishTicket.punish_money || 0)
                            }
                            const description = {
                                vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, findNoti.description.vi),
                                en: await this.generalHandleService.convertTemplateLiteral(payloadContent, findNoti.description.en)
                            }
                            const title = {
                                vi: findNoti.title.vi,
                                en: findNoti.title.en,
                            }
                            const payloadNotification = {
                                title: title,
                                description: description,
                                user_object: findNoti.user_apply,
                                id_collaborator: (findNoti.user_apply === "collaborator") ? item.id_collaborator?._id : null,
                                id_customer: (findNoti.user_apply === "customer") ? item.id_customer?._id : null,
                                type_notification: findNoti.type_notification,
                                related_id: null
                            }
                            await this.notificationSystemService.newActivity(payloadNotification);

                            let arrDeviceToken = [];
                            if (findNoti.user_apply === "collaborator") arrDeviceToken = await this.deviceTokenRepositoryService.getListDataByCondition({ user_id: payloadNotification.id_collaborator.toString(), user_object: findNoti.user_apply })
                            if (findNoti.user_apply === "customer") arrDeviceToken = await this.deviceTokenRepositoryService.getListDataByCondition({ user_id: payloadNotification.id_customer.toString(), user_object: findNoti.user_apply })


                            if (arrDeviceToken.length > 0) {
                                const playload = {
                                    title: title.vi,
                                    body: description.vi,
                                    token: [arrDeviceToken[0].token]
                                }
                                for (let i = 1; i < arrDeviceToken.length; i++) {
                                    playload.token.push(arrDeviceToken[i].token)
                                }
                                this.notificationService.send(playload)
                            }

                        }
                    }
                    break;
                }
                case "send_notification": {
                    // send notification for collaborator

                    for (const item of dataInput) {

                        if (automation.action.id_content_notification !== null) {
                            const findNoti = await this.contentNotificationRepositoryService.findOneById(automation.action.id_content_notification);
                            const payloadContent = {
                                order_id_view: item.id_order.id_view || null
                            }
                            const description = {
                                vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, findNoti.description.vi),
                                en: await this.generalHandleService.convertTemplateLiteral(payloadContent, findNoti.description.en)
                            }
                            const title = {
                                vi: findNoti.title.vi,
                                en: findNoti.title.en,
                            }

                            const payloadNotification = {
                                title: title,
                                description: description,
                                user_object: findNoti.user_apply,
                                id_collaborator: (findNoti.user_apply === "collaborator") ? item.id_collaborator?._id : null,
                                id_customer: (findNoti.user_apply === "customer") ? item.id_customer?._id : null,
                                type_notification: findNoti.type_notification,
                                related_id: null
                            }
                            await this.notificationSystemService.newActivity(payloadNotification);
    
                            // send push notification
                            // console.log(payloadNotification, 'payloadNotification');
                            
                            // console.log(payloadNotification.id_collaborator || payloadNotification.id_customer, 'ssss');
                            
                            // const arrDeviceToken = await this.deviceTokenRepositoryService.getListDataByCondition({ user_id: payloadNotification.id_collaborator || payloadNotification.id_customer, user_object: findNoti.user_apply })
                            let arrDeviceToken = [];
                            if(findNoti.user_apply === "collaborator") arrDeviceToken = await this.deviceTokenRepositoryService.getListDataByCondition({ user_id: payloadNotification.id_collaborator.toString(), user_object: findNoti.user_apply })
                            if(findNoti.user_apply === "customer") arrDeviceToken = await this.deviceTokenRepositoryService.getListDataByCondition({ user_id: payloadNotification.id_customer.toString(), user_object: findNoti.user_apply })

                            // console.log(arrDeviceToken, 'arrDeviceToken');
                            
                            if (arrDeviceToken.length > 0) {
                                const playload = {
                                    title: title.vi,
                                    body: description.vi,
                                    token: [arrDeviceToken[0].token]
                                }
                                for (let i = 1; i < arrDeviceToken.length; i++) {
                                    playload.token.push(arrDeviceToken[i].token)
                                }
                                this.notificationService.send(playload)
                            }
                        }

                    }


                    break;
                }
                default: {
                    break;
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async runCheckCodition(automation, getDataRequire, dataInput?) {
        try {
            let tempDataResult = {
                dependency: [],
                data: []
            }


            const arrTemp = await this.generalHandleService.sortArrObject(automation.condition.condition, "dependency", -1)

            let data_table = "order";
            for(const item of automation.condition.condition) {
                let i = 0
                for(const item2 of getDataRequire) {
                    const check = item.dependency.findIndex(x => x === item2);
                    if(check > -1) {
                        i++;
                        if(i === getDataRequire.length) {
                            data_table = item.data_table
                        } 
                    }
                }
            }
            // console.log(data_table, 'data_table');
            
            let getData = []
            switch(data_table) {
                case "order": {
                    getData = await this.getDataOrder(arrTemp, automation.condition.type_condition, dataInput || null)
                    break;
                }
                case "collaborator": {

                    break;
                }
                case "customer": {

                    break;
                }
                default: {
                    break;
                }
            }

            tempDataResult = {
                dependency: ["collaborator", "order"],
                data: getData
            }



            return tempDataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getDataOrder(arrCondition, type_condition, dataInput?) {
        try {
            const componentQuery = []
            const populateArr = []


            // // du lieu search dau vao
            // if(dataInput.data.length > 0) {
            //     if(dataInput.data[0].id_order) componentQuery.push({ id_order: dataInput.data[0].id_order })
            //     if(dataInput.data[0].id_collaborator) componentQuery.push({ id_collaborator: dataInput.data[0].id_collaborator })
            // }

            // du lieu search dau vao
            if(dataInput !== null) {
                const arrField = Object.keys(dataInput.data[0]);
                const temp = {
                    id_order: {$in: []},
                    // id_collaborator: {$in: []}
                }
                for(const item of dataInput.data) {
                    for(const field of arrField) {
                        if(field === 'id_order') {
                         temp.id_order["$in"].push(ObjectId(item.id_order));
                        }
                        // if(field === 'id_collaborator') temp.id_collaborator["$in"].push(item.id_collaborator);
                    }
                }
                componentQuery.push({ _id: temp.id_order })
                // componentQuery.push({ id_collaborator: temp.id_collaborator })
            }



            for (const condition of arrCondition) {
                if (condition.data_table === "order") {
                    switch (condition.kind) {
                        case "status": {
                            if (condition.operator === "==") componentQuery.push({ [condition.kind]: condition.value })
                            if (condition.operator === ">") componentQuery.push({ [condition.kind]: { $gt: condition.value } })
                            if (condition.operator === "<") componentQuery.push({ [condition.kind]: { $lt: condition.value } })
                            if (condition.operator === ">=") componentQuery.push({ [condition.kind]: { $gte: condition.value } })
                            if (condition.operator === "<=") componentQuery.push({ [condition.kind]: { $lte: condition.value } })
                            break;
                        }
                        case "order_date_work": {
                            const convertToMiliTime = condition.value
                            const dateNow = new Date();
                            let tempDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
                            tempDate = new Date(tempDate.getTime() - convertToMiliTime);
                            const dateCompare = tempDate.toISOString()
                            if (condition.operator === "==") componentQuery.push({ date_work: dateCompare })
                            if (condition.operator === ">") componentQuery.push({ date_work: { $gt: dateCompare } })
                            if (condition.operator === "<") componentQuery.push({ date_work: { $lt: dateCompare } })
                            if (condition.operator === ">=") componentQuery.push({ date_work: { $gte: dateCompare } })
                            if (condition.operator === "<=") componentQuery.push({ date_work: { $lte: dateCompare } })
                            break;
                        }
                        case "id_punish_policy": {
                            break;
                        }
                        case "time_now_compare_before_date_work": {
                            const convertToMiliTime = condition.value
                            const dateNow = new Date();
                            let tempDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
                            tempDate = new Date(tempDate.getTime() + convertToMiliTime);
                            const dateCompare = tempDate.toISOString()
                            if (condition.operator === "==") componentQuery.push({ date_work: dateCompare })
                            if (condition.operator === ">") componentQuery.push({ date_work: { $gt: dateCompare } })
                            if (condition.operator === "<") componentQuery.push({ date_work: { $lt: dateCompare } })
                            if (condition.operator === ">=") componentQuery.push({ date_work: { $gte: dateCompare } })
                            if (condition.operator === "<=") componentQuery.push({ date_work: { $lte: dateCompare } })
                            break;
                        }
                        case "time_now_compare_after_date_work": {
                            const convertToMiliTime = condition.value
                            const dateNow = new Date();
                            let tempDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
                            tempDate = new Date(tempDate.getTime() - convertToMiliTime);
                            const dateCompare = tempDate.toISOString()
                            if (condition.operator === "==") componentQuery.push({ date_work: dateCompare })
                            if (condition.operator === ">") componentQuery.push({ date_work: { $gt: dateCompare } })
                            if (condition.operator === "<") componentQuery.push({ date_work: { $lt: dateCompare } })
                            if (condition.operator === ">=") componentQuery.push({ date_work: { $gte: dateCompare } })
                            if (condition.operator === "<=") componentQuery.push({ date_work: { $lte: dateCompare } })

                            break;
                        }
                        case "time_now_compare_before_end_date_work": {
                            const convertToMiliTime = condition.value
                            const dateNow = new Date();
                            let tempDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
                            tempDate = new Date(tempDate.getTime() + convertToMiliTime);
                            const dateCompare = tempDate.toISOString()
                            if (condition.operator === "==") componentQuery.push({ end_date_work: dateCompare })
                            if (condition.operator === ">") componentQuery.push({ end_date_work: { $gt: dateCompare } })
                            if (condition.operator === "<") componentQuery.push({ end_date_work: { $lt: dateCompare } })
                            if (condition.operator === ">=") componentQuery.push({ end_date_work: { $gte: dateCompare } })
                            if (condition.operator === "<=") componentQuery.push({ end_date_work: { $lte: dateCompare } })
                            break;
                        }
                        case "time_now_compare_after_end_date_work": {
                            const convertToMiliTime = condition.value
                            const dateNow = new Date();
                            let tempDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
                            tempDate = new Date(tempDate.getTime() - convertToMiliTime);
                            const dateCompare = tempDate.toISOString()
                            if (condition.operator === "==") componentQuery.push({ end_date_work: dateCompare })
                            if (condition.operator === ">") componentQuery.push({ end_date_work: { $gt: dateCompare } })
                            if (condition.operator === "<") componentQuery.push({ end_date_work: { $lt: dateCompare } })
                            if (condition.operator === ">=") componentQuery.push({ end_date_work: { $gte: dateCompare } })
                            if (condition.operator === "<=") componentQuery.push({ end_date_work: { $lte: dateCompare } })

                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } else if (condition.data_table === "collaborator") {

                    let feildQuery = ''
                    switch (condition.kind) {
                        case "star": {
                            feildQuery = `id_collaborator.${condition.kind}`
                            if (condition.operator === "==") componentQuery.push({ [feildQuery]: condition.value })
                            if (condition.operator === ">") componentQuery.push({ [feildQuery]: { $gt: condition.value } })
                            if (condition.operator === "<") componentQuery.push({ [feildQuery]: { $lt: condition.value } })
                            if (condition.operator === ">=") componentQuery.push({ [feildQuery]: { $gte: condition.value } })
                            if (condition.operator === "<=") componentQuery.push({ [feildQuery]: { $lte: condition.value } })
                            populateArr.push({ path: "id_collaborator", select: { [condition.kind]: 1, _id: 1 } })
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                } else if (condition.data_table === "punish_ticket") {
                    let feildQuery = ''
                    // switch(condition.kind) {
                    //     case "id_punish_policy": {
                    //         feildQuery = `id_punish_ticket.${condition.kind}` 
                    //         componentQuery.push({ [feildQuery]: condition.value })
                    //         populateArr.push({path: "id_punish_ticket", select: {[condition.kind]: 1, _id: 1}})
                    //     }
                    // }
                }

            }

            let query: any = {}
            if (type_condition === "and") {
                query = {
                    $and: componentQuery
                }
            } else {
                query = {
                    $or: componentQuery
                }
            }

            // console.log(componentQuery, 'componentQuery');
            


            const getData = await this.orderRepositoryService.getListDataByCondition(query, {}, {}, populateArr);
            // console.log(getData.length, "getData.length");
            

            const result = []
            for(let i = 0 ; i < getData.length ; i++) {
                result.push({
                    id_order: {
                        _id: getData[i]._id,
                        id_view: getData[i].id_view
                    } ,
                    // id_collaborator: (dataInput !== null && dataInput.data.length > 0 && dataInput.data[0].id_collaborator) ? dataInput?.data[0]?.id_collaborator : getData[i].id_collaborator,
                    id_collaborator: {
                        _id: dataInput?.data[0]?.id_collaborator || getData[i].id_collaborator
                    },
                    id_customer: {
                        _id: getData[i].id_customer
                    }
                        
                })
            }


            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getDataCollaborator(arrCondition, type_condition) {
        try {

            const componentQuery = []

            for (const condition of arrCondition) {
                switch (condition.kind) {
                    case "star": {
                        if (condition.operator === "==") componentQuery.push({ [condition.kind]: condition.value })
                        if (condition.operator === ">") componentQuery.push({ [condition.kind]: { $gt: condition.value } })
                        if (condition.operator === "<") componentQuery.push({ [condition.kind]: { $lt: condition.value } })
                        if (condition.operator === ">=") componentQuery.push({ [condition.kind]: { $gte: condition.value } })
                        if (condition.operator === "<=") componentQuery.push({ [condition.kind]: { $lte: condition.value } })
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            let query: any = {}
            if (type_condition === "and") {
                query = {
                    $and: componentQuery
                }
            } else {
                query = {
                    $or: componentQuery
                }
            }




            const getData = await this.collaboratorRepositoryService.getListDataByCondition(query);


            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDataRequireAction(automation) {
        try {
            let formDataRequire = []
            switch (automation.action.type_action) {
                case "create_and_start_punish_ticket": {
                    formDataRequire.push('id_collaborator')
                    formDataRequire.push('id_order')
                    break;
                }
                default: {
                    break;
                }
            }

            if(automation.type_trigger === "after_action") {
                switch (automation.action_trigger) {
                    case "collaborator_cancel_order": {
                        formDataRequire.push('id_collaborator')
                        formDataRequire.push('id_order')
                        break;
                    } default: {
                        break;
                    }
                }
            }


            const result = this.generalHandleService.removeDuplicateValueArr(formDataRequire)
            
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDataByActionTrigger() {
        try {

        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
