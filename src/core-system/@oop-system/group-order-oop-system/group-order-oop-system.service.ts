import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { ERROR, iPageDTO, POP_COLLABORATOR_INFO, POP_ORDER_IN_GROUP_ORDER, POP_SERVICE } from 'src/@core'
import { PAYMENT_METHOD, PROMOTION_TYPE, STATUS_GROUP_ORDER, STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { GroupOrderDocument } from 'src/@repositories/module/mongodb/@database/schema/group_order.schema'
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class GroupOrderOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private groupOrderRepositoryService: GroupOrderRepositoryService
    ) { }

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.groupOrderRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async unassignCollaborator(lang, idGroupOrder) {
        try {
            const item = await this.getDetailItem(lang, idGroupOrder);
            item.id_collaborator = null;
            item.status = "pending",
            item.index_search_collaborator = []
                await this.groupOrderRepositoryService.findByIdAndUpdate(item._id, item);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(lang, idGroupOrder, status) {
        try {
            const item = await this.getDetailItem(lang, idGroupOrder);
            item.status = status;
            await this.groupOrderRepositoryService.findByIdAndUpdate(item._id, item)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancel(lang, idGroupOrder, subjectAction, idReasonCancel) {
        try {
            const item = await this.getDetailItem(lang, idGroupOrder);

            if (subjectAction.type === "customer") {
                item.id_cancel_customer = {
                    id_reason_cancel: idReasonCancel,
                    date_create: new Date(Date.now()).toISOString()
                }
            }
            else if (subjectAction.type === "collaborator") {
                item.id_cancel_collaborator.push({
                    id_reason_cancel: idReasonCancel,
                    id_collaborator: item.id_collaborator,
                    date_create: new Date(Date.now()).toISOString()
                })
            }
            else if (subjectAction.type === "admin") {
                item.id_cancel_user_system = {
                    id_reason_cancel: idReasonCancel,
                    id_user_system: new Types.ObjectId(subjectAction._id),
                    date_create: new Date(Date.now()).toISOString()
                }
            }
            item.status = "cancel"
            await this.groupOrderRepositoryService.findByIdAndUpdate(item._id, item)

            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
* 
* @param groupOrder đơn hàng cần kiểm tra 
* @param status :[ ] các trạng thái cần kiểm tra
* @param lang ngôn ngữ trả lỗi
* @returns kiểm tra trạng thái đơn hàng với các status cần kiểm tra, trả lỗi nếu trạng thái của đơn hàng
* trùng với 1 trong các trạng thái truyền vào 
*/
    async checkStatusGroupOrder(groupOrder: GroupOrderDocument, status: string[], lang) {
        try {
            for (let i of status) {
                if (i === STATUS_ORDER.cancel && groupOrder.status === STATUS_ORDER.cancel) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === STATUS_ORDER.confirm && groupOrder.status === STATUS_ORDER.confirm) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === STATUS_ORDER.doing && groupOrder.status === STATUS_ORDER.doing) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === STATUS_ORDER.done && groupOrder.status === STATUS_ORDER.done) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === STATUS_ORDER.pending && groupOrder.status === STATUS_ORDER.pending) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListHistory(iPage, idCollaborator) {
        try {
            const query = {
                $and: [
                    { id_collaborator: idCollaborator },
                    { status: { $in: ["done"] } }
                ]
            }
            const listData = await this.groupOrderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_work: -1 })
            return listData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(lang, infoJob, payload, codePayloadArea, getCustomer, getCollaborator?) {
        try {
            let pending_money = 0;
            for (const item of infoJob.service_fee) {
                pending_money += item.fee;
            }
            let refund_money = (infoJob.code_promotion !== null) ? infoJob.code_promotion.discount : 0;

            for (const item of infoJob.event_promotion) {
                refund_money += item.discount;
            }
            // console.log(getCustomer.index_search, 'getCustomer.index_search');

            const {tempIdView, tempOrdinalNumber} = await this.generateIdView(codePayloadArea);
            const createItem = await this.groupOrderRepositoryService.create({
                id_collaborator: (getCollaborator !== null && getCollaborator !== undefined) ? getCollaborator._id : null,
                // name_collaborator: (getCollaborator !== null) ? getCollaborator.full_name : null,
                // phone_collaborator: (getCollaborator !== null) ? getCollaborator.phone : null,
                index_search_customer: getCustomer.index_search,
                index_search_collaborator:  (getCollaborator !== null && getCollaborator !== undefined) ? getCollaborator.index_search : [],
                id_customer: getCustomer._id,
                // name_customer: getCustomer.full_name,
                // phone_customer: getCustomer.phone,
                id_order: [],
                lat: infoJob.lat || "",
                lng: infoJob.lng || "",
                address: infoJob.address || "",
                type_address_work: infoJob.type_address_work,
                note_address: infoJob.note_address,
                date_create: new Date(Date.now()).toISOString(),
                transaction_execution_date: new Date(Date.now()).toISOString(),
                date_work_schedule: infoJob.date_work_schedule,
                next_time: null,
                time_schedule: infoJob.service.time_schedule,
                type: infoJob.service.type,
                code_promotion: infoJob.code_promotion,
                event_promotion: infoJob.event_promotion || [],
                initial_fee: infoJob.initial_fee,
                platform_fee: infoJob.platform_fee,
                net_income_collaborator: infoJob.net_income_collaborator,
                temp_net_income_collaborator: infoJob.net_income_collaborator,
                temp_initial_fee: infoJob.initial_fee,
                temp_platform_fee: infoJob.platform_fee,
                temp_pending_money: pending_money,
                temp_refund_money: refund_money,
                temp_final_fee: infoJob.final_fee,
                service: infoJob.service,
                service_fee: infoJob.service_fee,
                total_estimate: infoJob.total_estimate,
                final_fee: infoJob.final_fee,
                note: payload.note,
                convert_time: false,
                payment_method: PAYMENT_METHOD[`${payload.payment_method}`] || PAYMENT_METHOD.cash,
                city: infoJob.city,
                district: infoJob.district,
                id_view: tempIdView,
                ordinal_number: tempOrdinalNumber,
                id_favourite_collaborator: getCustomer.id_favourite_collaborator,
                id_block_collaborator: getCustomer.id_block_collaborator,
                // id_block_collaborator_new: 
                // phone_collaborator: null,
                // name_collaborator: null,
                // phone_customer: getCustomer.phone,
                // name_customer: getCustomer.full_name || null,
                customer_version: '0',
                collaborator_version: '0',
                tip_collaborator: infoJob.tip_collaborator,
                date_tip_collaborator: payload.tip_collaborator > 0 ? new Date(Date.now()).toISOString() : null,
                day_loop: payload.day_loop || [],
                is_auto_order: payload.is_auto_order || false,
                time_zone: payload.time_zone,
                timestamp: payload.timestamp,
                status: (payload.payment_method !== PAYMENT_METHOD.cash && payload.payment_method !== PAYMENT_METHOD.point) ? STATUS_ORDER.processing : STATUS_ORDER.pending,
                shift_income: infoJob.shift_income || 0,
                subtotal_fee: infoJob.subtotal_fee || infoJob.initial_fee,
                net_income: infoJob.net_income || 0,
                value_added_tax: infoJob.value_added_tax || 0,
                is_check_duplicate: false
            });

            return createItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateIdView(codePayloadArea) {
        try {
            ////// tạo mã group order 
            let tempIdView: string = '0000000';
            let tempOrdinalNumber: number = -1;
            let currentYear: string = new Date().getUTCFullYear().toString();
            const dateCurrentStart = new Date(`${currentYear}-01-01`).toISOString();
            const dateCurrentEnd = new Date(`${currentYear}-12-31`).toISOString();
            const getLastGroupOrder = await this.groupOrderRepositoryService.findOne({
                $and: [
                    {city: codePayloadArea.city},
                    {
                        date_create: {
                            $gte: dateCurrentStart,
                            $lt: dateCurrentEnd
                        }
                    }
                ]
            }, {}, { ordinal_number: -1 })
            if (getLastGroupOrder) {
                tempOrdinalNumber = getLastGroupOrder.ordinal_number + 1;
            } else {
                tempOrdinalNumber = 1;
            }
            const tempCity = codePayloadArea.city > 10 ? codePayloadArea.city : `0${codePayloadArea.city}`;// nếu mã code tỉnh bé hơn 10 thì thêm số 0 đằng trước
            tempIdView = `${tempIdView}${tempOrdinalNumber}`
            tempIdView = tempIdView.slice(-7);
            tempIdView = `#${currentYear.slice(-2)}${tempCity}${tempIdView}`

            const dataResult = {
                tempIdView,
                tempOrdinalNumber
            }
            return dataResult;
        }catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateListOrder(lang, getGroupOrder, listOrder) {
        try {
            listOrder = await this.generalHandleService.sortArrObject(listOrder, "ordinal_number", 1)
            const idOrder = []
            for(let i = 0 ; i < listOrder.length ; i++) {
                idOrder.push(listOrder[i]._id);
            }
            await this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrder._id, {id_order: idOrder})
            return listOrder[0];
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getGroupOrderByCustomer(idCustomer, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {id_customer: new Types.ObjectId(idCustomer)},
                    {$or: [
                        {
                            index_search_collaborator: {
                                 $regex: iPage.search,
                                 $options: "i"
                            }
                       },
                       {
                            $or: [{
                                 id_view: { $exists: false }
                            }, {
                                 id_view: {
                                      $regex: iPage.search,
                                      $options: "i"
                                 }
                            }]
                       },
                       {
                            address: {
                                 $regex: iPage.search,
                                 $options: "i"
                            }
                       }
                    ]}
                ]
            }
            let sortOption = {}
            if(iPage.typeSort) {
                sortOption = {
                    [iPage.typeSort]: iPage.valueSort || 1
                }
            } else {
                sortOption = {
                    date_create: -1
                }
            }
            const arrPopulate = [
                POP_COLLABORATOR_INFO,
                POP_SERVICE
            ]
            const resultData = await this.groupOrderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption, arrPopulate, false)
             return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getGroupOrderHistoryByCustomer(idCustomer, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {id_customer: new Types.ObjectId(idCustomer)},
                    {$or: [
                        {
                            index_search_collaborator: {
                                 $regex: iPage.search,
                                 $options: "i"
                            }
                       },
                       {
                            $or: [{
                                 id_view: { $exists: false }
                            }, {
                                 id_view: {
                                      $regex: iPage.search,
                                      $options: "i"
                                 }
                            }]
                       },
                       {
                            address: {
                                 $regex: iPage.search,
                                 $options: "i"
                            }
                       }
                    ]},
                    {status: {$in: [STATUS_ORDER.done, STATUS_ORDER.cancel]}}
                ]
            }
            let sortOption = {}
            if(iPage.typeSort) {
                sortOption = {
                    [iPage.typeSort]: iPage.valueSort || 1
                }
            } else {
                sortOption = {
                    date_create: -1
                }
            }
            const arrPopulate = [
                POP_COLLABORATOR_INFO,
                POP_SERVICE,
                POP_ORDER_IN_GROUP_ORDER
            ]
            const resultData = await this.groupOrderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption, arrPopulate, false)
             return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async assignCollaborator(lang, idGroupOrder, collaborator, isSchedule?:boolean) {
        try {
            const item = await this.getDetailItem(lang, idGroupOrder);
            item.status = STATUS_ORDER.confirm;
            item["is_check_duplicate"] = true
            if(!isSchedule) {
                item.date_work_schedule[0].status = STATUS_ORDER.confirm
            } else {
                for(let i = 0; i < item.date_work_schedule.length; i++) {
                    if(item.date_work_schedule[i].status === STATUS_ORDER.pending) {
                        item.date_work_schedule[i].status = STATUS_ORDER.confirm
                    }
                }
            }
            item.id_collaborator = collaborator._id;
            item.phone_collaborator = collaborator.phone;
            item.name_collaborator = collaborator.full_name;
            item.index_search_collaborator = collaborator.index_search;
            
            await this.groupOrderRepositoryService.findByIdAndUpdate(item._id, item);

            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCollaboratorVersionInGroupOrder(lang, idGroupOrder, version){
        try {
            const item = await this.getDetailItem(lang, idGroupOrder)
            item.collaborator_version = version
            
            await this.groupOrderRepositoryService.findByIdAndUpdate(item._id, item)
            
            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateFeeAndMoneyInGroupOrder(lang, idGroupOrder, order) {
        try {
const getGroupOrder = await this.getDetailItem(lang, idGroupOrder)

        getGroupOrder.temp_net_income_collaborator -= order.net_income_collaborator;
        getGroupOrder.temp_pending_money -= order.pending_money;
        getGroupOrder.temp_refund_money -= order.refund_money;
        getGroupOrder.temp_initial_fee -= order.initial_fee;
        getGroupOrder.temp_final_fee -= order.final_fee;
        getGroupOrder.temp_platform_fee -= order.platform_fee;

        await this.groupOrderRepositoryService.findByIdAndUpdate(idGroupOrder, getGroupOrder)

        return getGroupOrder
        }catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        


    }

    async updateDeepLinkGroupOrder(lang, idGroupOrder, deep_link) {
        try {
            const getGroupOrder = await this.getDetailItem(lang, idGroupOrder)
            getGroupOrder.deep_link = deep_link
            return await this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrder._id, getGroupOrder)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sortDateWorkSchedule(lang, idGroupOrder) {
        try {
            const getGroupOrder = await this.getDetailItem(lang, idGroupOrder)
            getGroupOrder.date_work_schedule.sort((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1)
            return await this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrder._id, getGroupOrder)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async countGroupOrderUsingPromotion(idCustomer, code) {
        try {
            const query = {
                $and: [
                    { "code_promotion.code": code } ,
                    { id_customer: idCustomer }, 
                    { status: { $nin: [ STATUS_GROUP_ORDER.cancel, STATUS_GROUP_ORDER.processing ] } },  
                    { is_delete: false }
                ]
            }

            return await this.groupOrderRepositoryService.countDataByCondition(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListPaginationByPromotion(iPage, promotion) {
        try {
            const query: any = {
                $and: [
                    { is_delete: false },
                ]
            }
            if (promotion.type_promotion === PROMOTION_TYPE.code) {
                query.$and.push({
                    "code_promotion._id": promotion._id,
                })
            } else if (promotion.type_promotion === PROMOTION_TYPE.event) {
                query.$and.push({
                    "event_promotion._id": promotion._id,
                })
            }
            if (iPage.status === STATUS_GROUP_ORDER.cancel) {
                query.$and.push({
                    status: STATUS_GROUP_ORDER.cancel
                });
            } else if (iPage.status === STATUS_GROUP_ORDER.pending) {
                query.$and.push({
                    status: { $in: [STATUS_GROUP_ORDER.pending, STATUS_GROUP_ORDER.doing, STATUS_GROUP_ORDER.confirm] }
                });
            } else if (iPage.status === STATUS_GROUP_ORDER.done) {
                query.$and.push({
                    status: STATUS_GROUP_ORDER.done
                });
            }
            
            return await this.groupOrderRepositoryService.getListPaginationDataByCondition(iPage, query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async updateGroupOrder(lang, groupOrder) {
        try {
            await this.getDetailItem(lang, groupOrder._id)
            return await this.groupOrderRepositoryService.findByIdAndUpdate(groupOrder._id, groupOrder)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getInforGroupOrder(lang, idGroupOrder, idCustomer) {
        try {
            const query = {
                $and: [
                    { _id: idGroupOrder },
                    { id_customer: idCustomer },
                ]
            }
            const arrPopulate = [
                { path: 'id_customer', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1, birthday: 1 } },
                { path: 'id_collaborator', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1, birthday: 1 } },
                { path: 'service._id', select: { title: 1 } },
                { path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } },
                { path: 'service.optional_service.extend_optional._id', select: { kind: 1, kind_v2: 1 } },
                { path: 'id_cancel_customer.id_reason_cancel', select: { title: 1, } },
                { path: "code_promotion._id", select: { title: 1 } },
                { path: "event_promotion._id", select: { title: 1 } },
            ]
            
            const getItem = await this.groupOrderRepositoryService.findOne(query, {}, {}, arrPopulate);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListGroupOrderDuplicateMinusPlatformFee() {
        try {
            const query = {
                $and: [
                    { is_check_duplicate: true },
                ]
            }

            return await this.groupOrderRepositoryService.getListDataByCondition(query, {}, { date_create: 1 })
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
