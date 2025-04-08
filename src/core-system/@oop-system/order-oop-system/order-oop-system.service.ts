import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { ERROR, INFO_LINKED_ONE_COLLABORATOR, iPageDTO, iPageOrderDTO, iPageOrderNearDTOCollaborator, iPageReportOrderByCustomerDTOAdmin, LOOKUP_CUSTOMER, LOOKUP_GROUP_ID_CUSTOMER, LOOKUP_ID_SERVICE, LOOKUP_TRANSACTION_PUNISH_DONE, NET_INCOME, PERCENT_INCOME, POP_COLLABORATOR_INFO, POP_CUSTOMER_INFO, POP_SERVICE, SORT_DATE_WORK, TEMP_DATE_WORK, TEMP_DISCOUNT, TEMP_SERVICE_FEE, TEMP_TRANSACTION_PUNISH, TOTAL_COLLABORATOR_FEE, TOTAL_DISCOUNT, TOTAL_GROSS_INCOME, TOTAL_HOUR, TOTAL_INCOME, TOTAL_NET_INCOME, TOTAL_NET_INCOME_BUSINESS, TOTAL_ORDER, TOTAL_ORDER_FEE, TOTAL_PUNISH, TOTAL_SERVICE_FEE } from 'src/@core'
import { OrderDocument } from 'src/@repositories/module/mongodb/@database'
import { PAYMENT_METHOD, STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
@Injectable()
export class OrderOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private orderRepositoryService: OrderRepositoryService,
        private generalHandleService: GeneralHandleService
    ) { }

    async identifyUserForGetList(subject, user) {
        const payload = []
        if (subject === 'customer') {
            payload.push({ id_customer: user._id })
        }
        if (subject === 'collaborator') {
            payload.push({ id_collaborator: user._id })
        }
        return payload;
    }

    async getDetailItem(lang, idItem, arrPopulate?) {
        try {
            const getItem = await this.orderRepositoryService.findOneById(idItem, {}, arrPopulate || {});
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getInforOrder(lang, idItem, idCustomer) {
        try {
            const query = {
                $and: [
                    { _id: idItem },
                    { id_customer: idCustomer },
                ]
            }
            const arrPopulate = [
                { path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } },
                { path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, phone: 1, gender: 1, birthday: 1, star: 1, } },
                { path: 'service._id', select: { title: 1 } },
                { path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } },
                { path: 'service.optional_service.extend_optional._id', select: { kind: 1, kind_v2: 1 } },
                { path: 'id_cancel_customer.id_reason_cancel', select: { title: 1 } },
                { path: 'id_cancel_collaborator.id_reason_cancel', select: { title: 1 } },
                { path: 'id_cancel_collaborator.id_collaborator', select: { avatar: 1, full_name: 1, name: 1, phone: 1, gender: 1, birthday: 1 } },
                { path: "code_promotion._id", select: { title: 1 } },
                { path: "event_promotion._id", select: { title: 1 } }
            ]
            const getItem = await this.orderRepositoryService.findOne(query, {}, {}, arrPopulate);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(query) {
        try {
            const getItem = await this.orderRepositoryService.findOne(query);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getList(lang, iPage: iPageOrderDTO, subject, user) {
        try {
            const query = {
                $and: [
                    ...await this.identifyUserForGetList(subject, user)
                ]
            }
            const dataResult = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query)
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListNoPagination(query, sortOption?) {
        try {
            const dataResult = await this.orderRepositoryService.getListDataByCondition(query, {}, sortOption || {})
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findCurrentOrderInGroupOrder(lang, idGroupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: new Types.ObjectId(idGroupOrder) },
                    { status: ["confirm", "doing", "pending", "processing"] },
                ]
            }
            const getCurrentOrder = await this.orderRepositoryService.findOne(query, {}, { date_work: 1 });

            return getCurrentOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unassignCollaborator(lang, idOrder) {
        try {
            const item = await this.getDetailItem(lang, idOrder);
            item.id_collaborator = null;
            item.status = "pending",
                await this.orderRepositoryService.findByIdAndUpdate(item._id, item);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(lang, idOrder, status, infoLinkedCollaborator?) {
        try {
            const item = await this.getDetailItem(lang, idOrder);
            item.status = status;
            
            const findIndexLinked = item.info_linked_collaborator.findIndex(a => a.id_collaborator.toString() === item.id_collaborator.toString());
            if(findIndexLinked > -1) item.info_linked_collaborator[findIndexLinked].status = status
            
            if (status === STATUS_ORDER.doing) {
                item.collaborator_start_date_work = new Date().toISOString();
                item.work_start_date = new Date().toISOString();
            }
            if (status === STATUS_ORDER.done) {
                item.collaborator_end_date_work = new Date().toISOString();
                item.completion_date = new Date().toISOString()
            }
            await this.orderRepositoryService.findByIdAndUpdate(item._id, item)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async totalFinalFeeRemain(lang, idGroupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: idGroupOrder },
                    { status: { $in: ["pending", "confirm", "doing"] } }
                ]
            }
            const itemData = await this.orderRepositoryService.getListDataByCondition(query, {}, { date_work: 1 })
            console.log(itemData, 'itemData');

            let finalFeeRemain = 0;
            for (let i = 0; i < itemData.length; i++) {
                finalFeeRemain += itemData[i].final_fee;
            }
            console.log(finalFeeRemain, 'finalFeeRemain');

            return finalFeeRemain;
        } catch (err) {
            console.log(err, 'err');

            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancel(lang, order, subjectAction, idReasonCancel) {
        try {
            let item = order;
            if (subjectAction.type === TYPE_SUBJECT_ACTION.customer) {
                item.id_cancel_customer = {
                    id_reason_cancel: idReasonCancel,
                    date_create: new Date(Date.now()).toISOString()
                }
            }
            else if (subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                item.id_cancel_collaborator.push({
                    id_reason_cancel: idReasonCancel,
                    id_collaborator: item.id_collaborator,
                    date_create: new Date(Date.now()).toISOString()
                })

            }
            else if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                item.id_cancel_user_system = {
                    id_reason_cancel: idReasonCancel,
                    id_user_system: new Types.ObjectId(subjectAction._id),
                    date_create: new Date(Date.now()).toISOString()
                }
            }

            item.status = STATUS_ORDER.cancel
            item.cancellation_date = new Date().toISOString()
            item = await this.orderRepositoryService.findByIdAndUpdate(item._id, item)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async multiUnassignCollaboratorOfGroupOrder(lang, subjectAction, payloadDependency, infoLinkedCollaborator?) {
        try {

            let getOrder = await this.getDetailItem(lang, payloadDependency.order._id);

            if (subjectAction.type === "collaborator" && payloadDependency.reason_cancel !== null) {
                getOrder.id_cancel_collaborator.push({
                    id_reason_cancel: payloadDependency.reason_cancel._id,
                    id_collaborator: getOrder.id_collaborator,
                    date_create: new Date().toISOString()
                })
                // if(infoLinkedCollaborator) getOrder.info_linked_collaborator.push(infoLinkedCollaborator)
            }

            await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder)

            const query = {
                $and: [
                    { id_group_order: getOrder.id_group_order },
                    { status: { $in: [ STATUS_ORDER.confirm, STATUS_ORDER.doing ] } }
                ]
            }
            const payload = {
                status: STATUS_ORDER.pending,
                id_collaborator: null,
                name_collaborator: null,
                phone_collaborator: null
            }
            await this.orderRepositoryService.updateMany(query, payload)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findNextOrderInGroupOrder(lang, idOrder) {
        try {
            const getOrder = await this.getDetailItem(lang, idOrder);
            const query = {
                $and: [
                    { id_group_order: getOrder.id_group_order },
                    { status: { $in: [STATUS_ORDER.confirm, STATUS_ORDER.doing, STATUS_ORDER.pending] } },
                    { date_work: { $gt: getOrder.date_work } }
                ]
            }
            const queryPerious = {
                $and: [
                    { id_group_order: getOrder.id_group_order },
                    { status: { $in: [STATUS_ORDER.confirm, STATUS_ORDER.doing, STATUS_ORDER.pending] } },
                    { date_work: { $lt: getOrder.date_work } }
                ]
            }
            const periousOrder = await this.orderRepositoryService.findOne(queryPerious, {}, { date_work: 1 })
            if (periousOrder) {
                return null;
            }
            const nextOrder = await this.orderRepositoryService.findOne(query, {}, { date_work: 1 });
            return (nextOrder) ? nextOrder : null;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListHistory(iPage, idCollaborator) {
        try {
            const query = {
                $and: [
                    { id_collaborator: idCollaborator },
                    { status: { $in: ["done"] } },
                    { date_work: { $lte: iPage.end_date } },
                    { date_work: { $gte: iPage.start_date } }
                ]
            }
            const listData = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_work: -1 })
            return listData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalIncome(iPage, idCollaborator) {
        try {
            const query = {
                $and: [
                    { id_collaborator: idCollaborator },
                    { status: { $in: ["done"] } },
                    { date_work: { $lte: iPage.end_date } },
                    { date_work: { $gte: iPage.start_date } }
                ]
            }
            const aggregateQuery = [
                { $match: query },
                {
                    $group: {
                        _id: {},
                        total_net_income: TOTAL_NET_INCOME_BUSINESS
                    },
                }
            ]
            const dataResult = await this.orderRepositoryService.aggregateQuery(aggregateQuery);
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(payload) {
        try {
            const result = await this.orderRepositoryService.create(payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createMany(multiPayloadOrder) {
        try {
            const result = await this.orderRepositoryService.createMany(multiPayloadOrder);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createOrderByGroupOrder(lang, groupOrder, infoJob) {
        try {
            const payloadOrder = []
            for (let i = 0; i < infoJob.date_work_schedule.length; i++) {
                const { tempOrdinal, tempIdView } = await this.generateIdView(groupOrder.id_view, i);
                const endDateWork = new Date(new Date(groupOrder.date_work_schedule[i].date).getTime() + (groupOrder.total_estimate * 60 * 60 * 1000)).toISOString();
                const location = {
                    coordinates: [Number(groupOrder.lng), Number(groupOrder.lat)]
                }
                const tipCollaborator = (infoJob.tip_collaborator > 0) ? infoJob.tip_collaborator / infoJob.date_work_schedule.length : 0;
                // let finalFee = infoJob.date_work_schedule[i].initial_fee - infoJob.date_work_schedule[i].discount + tipCollaborator;
                // console.log(finalFee, 'finalFee');

                let serviceFee = []
                let pendingMoney = 0;
                let refundMoney = infoJob.date_work_schedule[i].discount
                if (i === 0) {
                    serviceFee = groupOrder.service_fee
                    for (const item of groupOrder.service_fee) {
                        pendingMoney += item.fee;
                        // refundMoney += item.fee
                    }
                }
                const initialFee = infoJob.date_work_schedule[i].initial_fee;
                let totalDiscount = 0
                if (infoJob.date_work_schedule[i].code_promotion !== null && infoJob.date_work_schedule[i].code_promotion !== undefined) {
                    totalDiscount += infoJob.date_work_schedule[i].code_promotion['discount']
                }
                for(let j = 0; j < infoJob.date_work_schedule[i].event_promotion.length; j++) {
                    totalDiscount += infoJob.date_work_schedule[i].event_promotion[j]['discount']
                }

                const payload = {
                    id_collaborator: groupOrder.id_collaborator,
                    // phone_collaborator: groupOrder.phone_collaborator,
                    // name_collaborator: groupOrder.name_collaborator,
                    id_customer: groupOrder.id_customer,
                    index_search_customer: groupOrder.index_search_customer,
                    index_search_collaborator: groupOrder.index_search_collaborator,
                    // name_customer: groupOrder.name_customer,
                    // phone_customer: groupOrder.phone_customer,
                    lat: groupOrder.lat.toString(),
                    lng: groupOrder.lng.toString(),
                    address: groupOrder.address,
                    date_create: new Date(Date.now()).toISOString(),
                    initial_fee: initialFee,
                    final_fee: infoJob.date_work_schedule[i].final_fee,
                    platform_fee: infoJob.date_work_schedule[i].platform_fee,
                    net_income_collaborator: infoJob.date_work_schedule[i].initial_fee - infoJob.date_work_schedule[i].platform_fee,
                    refund_money: refundMoney,
                    pending_money: pendingMoney,
                    change_money: 0,
                    collaborator_fee: 0,
                    service: infoJob.date_work_schedule[i].service,
                    date_work: groupOrder.date_work_schedule[i].date,
                    end_date_work: endDateWork,
                    // status: (groupOrder.id_collaborator !== null) ? "confirm" : "pending",
                    // status: (groupOrder.id_collaborator !== null) ? STATUS_ORDER.confirm : groupOrder.payment_method === PAYMENT_METHOD.momo ? STATUS_ORDER.processing : STATUS_ORDER.pending,
                    status: (groupOrder.payment_method !== PAYMENT_METHOD.cash && groupOrder.payment_method !== PAYMENT_METHOD.point) ? STATUS_ORDER.processing : STATUS_ORDER.pending,
                    code_promotion: infoJob.date_work_schedule[i].code_promotion,
                    event_promotion: infoJob.date_work_schedule[i].event_promotion,
                    total_estimate: groupOrder.total_estimate,
                    service_fee: (i === 0) ? groupOrder.service_fee : [],
                    id_group_order: groupOrder._id,
                    note: groupOrder.note,
                    type_address_work: groupOrder.type_address_work,
                    note_address: groupOrder.note_address || "",
                    payment_method: PAYMENT_METHOD[`${groupOrder.payment_method}`] || PAYMENT_METHOD.cash,
                    location: location,
                    is_duplicate: (i === 0) ? false : true,
                    convert_time: groupOrder.convert_time,
                    id_view: tempIdView,
                    ordinal_number: tempOrdinal,
                    id_favourite_collaborator: (groupOrder.id_favourite_collaborator) ? groupOrder.id_favourite_collaborator : [],
                    id_block_collaborator: (groupOrder.id_block_collaborator) ? groupOrder.id_block_collaborator : [],
                    city: groupOrder.city,
                    district: groupOrder.district,
                    tip_collaborator: tipCollaborator,
                    date_tip_collaborator: groupOrder.date_tip_collaborator,
                    shift_income: infoJob.date_work_schedule[i].shift_income || 0,
                    subtotal_fee: infoJob.date_work_schedule[i].subtotal_fee || infoJob.date_work_schedule[i].initial_fee,
                    net_income: infoJob.date_work_schedule[i].net_income || 0,
                    value_added_tax: infoJob.date_work_schedule[i].value_added_tax || 0,
                    work_shift_deposit: infoJob.date_work_schedule[i].platform_fee || 0,
                    remaining_shift_deposit: (infoJob.date_work_schedule[i].final_fee - infoJob.date_work_schedule[i].platform_fee) || 0,
                    total_fee: infoJob.date_work_schedule[i].initial_fee + (i === 0 ? groupOrder.service_fee[0].fee : 0),
                    total_discount: totalDiscount,
                    is_rush_time: infoJob.date_work_schedule[i].is_rush_time || false,
                }
                payloadOrder.push(payload)
            }
            let result: any
            if (payloadOrder.length > 1) {
                result = await this.createMany(payloadOrder);
            } else {
                result = [await this.createItem(payloadOrder[0])]
            }
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateIdView(idViewGroupOrder, indexDateWork) {
        try {
            const tempOrdinal = indexDateWork + 1;
            // const tempIdView = `000${tempOrdinal}`;
            const tempIdView = `${idViewGroupOrder}.${`000${tempOrdinal}`.slice(-3)}`
            const result = {
                tempOrdinal,
                tempIdView
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async moveServiceFeeNextOrder(lang, getOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: getOrder.id_group_order },
                    { status: { $in: ["pending", "confirm"] } }
                ]
            }
            const getNextOrder = await this.orderRepositoryService.findOne(query, {}, { date_work: 1 });
            if (getNextOrder !== null) {
                getNextOrder.service_fee = getOrder.service_fee
                getNextOrder.pending_money = getOrder.pending_money
                getNextOrder.final_fee = getNextOrder.final_fee + getOrder.pending_money
                getOrder.final_fee = getOrder.final_fee - getOrder.pending_money
                getOrder.pending_money = 0;
                getOrder.service_fee = [],
                    await Promise.all([
                        // this.orderRepositoryService.findByIdAndUpdate(getOrder._id, {service_fee: [], pending_money: 0, final_fee: getOrder.final_fee - getOrder.pending_money}),
                        this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder),

                        this.orderRepositoryService.findByIdAndUpdate(getNextOrder._id, getNextOrder)
                    ])
            }
            return getOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelAllOrderByGroupOrder(lang, idGroupOrder) {
        try {

            const query = {
                $and: [
                    { id_group_order: idGroupOrder },
                    { status: { $in: ["processing", "pending", "doing", "confirm"] } }
                ]
            }
            const listOrder = await this.orderRepositoryService.updateMany(query, { status: "cancel", cancellation_date: new Date().toISOString() })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderNearActiveByCustomer(iPage, idCustomer) {
        try {
            const query = {
                $and: [
                    { id_customer: idCustomer },
                    { is_duplicate: false },
                    { status: { $in: [STATUS_ORDER.processing, STATUS_ORDER.pending, STATUS_ORDER.confirm, STATUS_ORDER.doing] } }
                ]
            }

            const arrPopuplate = [
                POP_COLLABORATOR_INFO,
                POP_SERVICE
            ]
            const getData = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_work: -1 }, arrPopuplate);
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkStatusOrder(order, status: string[], lang) {
        try {
            for (let s of status) {
                if (s === STATUS_ORDER.cancel && order.status === STATUS_ORDER.cancel) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (s === STATUS_ORDER.confirm && order.status === STATUS_ORDER.confirm) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (s === STATUS_ORDER.doing && order.status === STATUS_ORDER.doing) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (s === STATUS_ORDER.done && order.status === STATUS_ORDER.done) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (s === STATUS_ORDER.pending && order.status === STATUS_ORDER.pending) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.FORBIDDEN);
                }
            }
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async assignCollaborator(lang, idOrder, collaborator) {
        try {
            const item = await this.getDetailItem(lang, idOrder);
            item.status = STATUS_ORDER.confirm,
            item.id_collaborator = collaborator._id;
            item.phone_collaborator = collaborator.phone;
            item.name_collaborator = collaborator.full_name;
            item.index_search_collaborator = collaborator.index_search;

            await this.orderRepositoryService.findByIdAndUpdate(item._id, item);

            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async assignCollaboratorByGroupOrder(idGroupOrder, collaborator) {
    //     try {
    //         const query = { $and: [{ id_group_order: idGroupOrder }, { status: STATUS_ORDER.pending }] }
    //         const arrOrderByGroupOrder = await this.orderRepositoryService.getListDataByCondition(query)
    //         const arrPromiseOrder = [];
    //         for (let i = 0; i < arrOrderByGroupOrder.length; i++) {
    //             arrOrderByGroupOrder[i].status = STATUS_ORDER.confirm;
    //             arrOrderByGroupOrder[i].id_collaborator = collaborator._id;
    //             arrOrderByGroupOrder[i].index_search_collaborator = collaborator.index_search;

    //             if (collaborator.id_business) {
    //                 arrOrderByGroupOrder[i].id_business = collaborator.id_business
    //             }

    //             arrPromiseOrder.push(this.orderRepositoryService.findByIdAndUpdate(arrOrderByGroupOrder[i]._id, arrOrderByGroupOrder[i]))
    //         }
    //         await Promise.all(arrPromiseOrder)

    //         return true
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async assignCollaboratorByGroupOrder(idGroupOrder, collaborator) {
        try {
            const query = {
                $and: [
                    { status: STATUS_ORDER.pending },
                    { id_group_order: idGroupOrder }
                ]
            }
            // tim xem CTV da co tung huy don hang do khong
            const findOne = await this.findOne(query);
            const findExistIndexInfoLinked = findOne.info_linked_collaborator.findIndex(a => a.id_collaborator.toString() === collaborator._id.toString());

            let updatePayload = {
                status: STATUS_ORDER.confirm,
                id_collaborator: collaborator._id,
                index_search_collaborator: collaborator.index_search,
            }
            const newInfoLinked = {
                id_collaborator: collaborator._id,
                status: STATUS_ORDER.confirm,
                call_to_customer: false
            }

            let options = {}
            if(findExistIndexInfoLinked > -1) {
                updatePayload = {
                    ...updatePayload,
                    ...{$set: {"info_linked_collaborator.$[elem].status": newInfoLinked.status} }
                }
                options = {
                    arrayFilters: [{ "elem.id_collaborator": newInfoLinked.id_collaborator }], 
                    upsert: true // Tạo mới nếu không tìm thấy
                }
            } else {
                updatePayload = {
                    ...updatePayload,
                    ...{ $push: { info_linked_collaborator: newInfoLinked } }
                },
                options = {
                    arrayFilters: [ { "elem": { $eq: { $arrayElemAt: ["$info_linked_collaborator", -1] } } } ] 
                }
            }


            if(collaborator.id_business) {
                updatePayload["id_business"] = collaborator.id_business
            }
            await this.orderRepositoryService.updateMany(query, updatePayload, options);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkForDoingOrdersOfCollaborator(lang, order, idCollaborator) {
        try {
            const query = { 
                $and: [
                    { $or: [
                            { status: STATUS_ORDER.doing },
                            // { $and: [
                            //         { status: STATUS_ORDER.confirm },  // Đoạn này bên nhánh develop và testing comment lại, còn nhánh master mở ra
                            //         { date_work: { $lt: order.date_work } }
                            //     ]
                            // }
                        ] 
                    },
                    { id_collaborator: idCollaborator }, 
                ] 
            }

            const getCountDoingOrders = await this.orderRepositoryService.countDataByCondition(query)

            if (getCountDoingOrders > 0) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NEED_DONE_ORDER, lang, null)], HttpStatus.FORBIDDEN);
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateIsDuplicate(lang, idOrder, value) {
        try {
            const getOrder = await this.getDetailItem(lang, idOrder)
            getOrder.is_duplicate = value

            await this.orderRepositoryService.findByIdAndUpdate(idOrder, getOrder)

            return getOrder
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async countOrdersByCustomer(idCustomer, status?) {
        try {
            const query: any = {
                $and: [
                    { is_delete: false },
                    { id_customer: idCustomer }
                ]
            }
            if (status) {
                query.$and.push({ status: STATUS_ORDER[status] })
            }
            const getCount = await this.orderRepositoryService.countDataByCondition(query)

            return getCount
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }

    }

    async countOrdersByListCustomer(lstIdCustomer, queryByDate, status?) {
        try {
            const query: any = {
                $and: [
                    { is_delete: false },
                    { id_customer: { $in: lstIdCustomer} }
                ]
            }
            if (status) {
                query.$and.push({ status: STATUS_ORDER[status] })
            }

            if(queryByDate) {
                const now = new Date(new Date(new Date().setHours(23, 59, 59, 99))).toISOString()
                const thirtyDayAgo = new Date(new Date(now).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

                query.$and.push({ date_work: { $gte: thirtyDayAgo, $lt: now }})
            }
            const getCount = await this.orderRepositoryService.countDataByCondition(query)

            return getCount
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }

    }
    
    async getListOderByCollab(iPage, idCollab) {
        try {
            const query = {
                $and: [
                    { is_system_review: false },
                    { is_delete: false },
                    { is_system_review: false },
                    { star: { "$gte": 4 } },
                    { status: STATUS_ORDER.done },
                    {
                        $or: [
                            { review: { "$ne": "" } },
                            { short_review: { "$ne": [] } }
                        ]
                    },
                    { id_collaborator: new Types.ObjectId(idCollab) },

                ]
            }
            const getList = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, { id_customer: 1, star: 1, review: 1, short_review: 1 }, {}, [{ path: "id_customer", select: { full_name: 1, _id: 1, avatar: 1 } }])

            return getList
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    // async getListAllReviewByCollab(iPage, idCollab) {
    //     try {
    //         const someDaysAgo = new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()
    //         const query = {
    //             $and: [
    //                 { is_delete: false },
    //                 { is_system_review: false },
    //                 { status: STATUS_ORDER.done },
    //                 { id_collaborator: new Types.ObjectId(idCollab) },
    //                 { date_create_review: { $lte: someDaysAgo } },
    //             ]
    //         }
    //         const getList = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, { id_customer: 1, star: 1, review: 1, short_review: 1 }, { date_create_review: -1 }, [{ path: "id_customer", select: { full_name: 1, _id: 1, avatar: 1 } }])

    //         return getList
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

    //     }
    // }

    async updateDeepLinkOrder(lang, idOrder, deep_link) {
        try {
            const getOrder = await this.getDetailItem(lang, idOrder)
            getOrder.deep_link = deep_link
            return await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getFirstOrderByGroupOrder(idGroupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: idGroupOrder }
                ]
            }
            return await this.orderRepositoryService.findOne(query, {}, { date_work: 1 })

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderByLstId(lstId) {
        try {
            const aggregateQuery = [
                {
                    $match: {
                        id_customer: { $in: lstId },
                        status: STATUS_ORDER.done,
                        is_delete: false
                    }
                },
                {
                    $sort: {  id_customer: 1, date_create: 1 }
                },
                {
                    $group: {
                        _id: "$id_customer",
                        firstOrder: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$firstOrder" }
                }
            ]


            const lstFirstOrder = await this.orderRepositoryService.aggregateQuery(aggregateQuery);

            return lstFirstOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListOrderTest() {
        const query = {
            $and: [
                { end_date_work: { $gt: "2024-10-06T14:13:05.722Z" } },
                { status: STATUS_ORDER.done}
            ]
        }

        return await this.orderRepositoryService.getListDataByCondition(query)
    }

    async changeStatusAllOrderByGroupOrder(idGroupOrder, status) {
        try {
            const query = {
                $and: [
                    { id_group_order: idGroupOrder },
                ]
            }
            await this.orderRepositoryService.updateMany(query, { status: status })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getOrderWithTheLatestDateWork(idGroupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: idGroupOrder },
                    { status: { $in: [STATUS_ORDER.pending, STATUS_ORDER.confirm] } }
                ]
            }
            return await this.orderRepositoryService.findOne(query, {}, { date_work: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateOrder(lang, order) {
        try {
            await this.getDetailItem(lang, order._id)
            return await this.orderRepositoryService.findByIdAndUpdate(order._id, order)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateOrderListOrdersByGroupOrder(groupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: groupOrder._id }
                ]
            }
            const getListOrder = await this.orderRepositoryService.getListDataByCondition(query, {}, { date_work: 1 })

            const lstTask:any = []
            for (let i = 0; i < getListOrder.length; i++ ) {
                const { tempOrdinal, tempIdView } = await this.generateIdView(groupOrder.id_view, i);
                getListOrder[i].ordinal_number = tempOrdinal
                getListOrder[i].id_view = tempIdView

                lstTask.push(this.orderRepositoryService.findByIdAndUpdate(getListOrder[i]._id, getListOrder[i]))
            }

            await Promise.all(lstTask)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getOrderHasPendingMoney(idGroupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: idGroupOrder },
                    { pending_money: 2000 },
                    { status: { $in: [STATUS_ORDER.pending, STATUS_ORDER.confirm] } }
                ]
            }
            return await this.orderRepositoryService.findOne(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async reportOrderByTypeCustomer(lang, iPage: iPageReportOrderByCustomerDTOAdmin) {
        try {
            let query: any = {
                $and: [
                        // {
                        //     $or: [
                        //     {status: "confirm"},
                        //     {status: "done"},
                        //     {status: "doing"}
                        // ]},
                        { is_delete: false },
                    ]
                };
                
                if (iPage.type_status === "done") {
                    query.$and.push({
                        status: "done"
                    })
                }
                else if (iPage.type_status === "doing") {
                    query.$and.push({
                        status: "doing"
                    })
                }
                else if (iPage.type_status === "confirm") {
                    query.$and.push({
                        status: "confirm"
                    })
                }
                else {
                    query.$or = [
                        { status: "done" },
                        { status: "doing" },
                        { status: "confirm" }
                    ];
                }
              
                // Thống kê theo ngày làm hoặc ngày tạo
                if (iPage.type_date !== 'date_work') {
                    query.$and.push({
                        date_create: {
                            $gte: iPage.start_date,
                        }
                    });
                    query.$and.push({
                        date_create: {
                            $lte: iPage.end_date,
                        }
                    });
                } else {
                    query.$and.push({
                        end_date_work: {
                            $gte: iPage.start_date,
                        }
                    });
                    query.$and.push({
                        end_date_work: {
                            $lte: iPage.end_date,
                        }
                    });
                }
    
                // Có một miền giá trị bị trùng là khi giá trị ngày tạo bằng ngày bắt đầu => fix lại KH cũ: có ngày tạo bé hơn ngày chọn bắt đầu
                if (iPage.type_customer === 'old') {
                    query.$and.push({ 'id_customer.date_create': { $lte: iPage.start_date } });
                    query.$and.push({ 'id_customer.date_create': { $lt: iPage.start_date } });
                }
                if (iPage.type_customer === 'new') {
                    query.$and.push({ 'id_customer.date_create': { $gte: iPage.start_date } });
                    query.$and.push({ 'id_customer.date_create': { $lte: iPage.end_date } });
                }

                const getCustomerTotal = await this.orderRepositoryService.aggregateQuery([
                    // Lấy thông tin của khách hàng đã đặt đơn hàng đó thông qua id_customer
                    {
                        $lookup: LOOKUP_CUSTOMER  
                    },
                    // Chuyển trường id_customer từ Array thành Object
                    {
                        $unwind: { path: "$id_customer" },
                    },
                    {
                        $match: query
                    },
                    // Thêm một trường mới tempServiceFee sẽ là tổng của tất cả các tổng các phí dịch vụ
                    /*[
                        { "_id": 1, "service_fee": { "fee": [10, 20, 30] } },
                        { "_id": 2, "service_fee": { "fee": [15, 25] } },
                        { "_id": 3, "service_fee": { "fee": [5, 10, 15, 20] } }
                         tempServiceFee = (10+20+30) + (15+25) + (5+10+15+20)
                    ]*/
                    {
                        $addFields: TEMP_SERVICE_FEE
                    },
                    // Thêm một trường mới tempDiscount sẽ là tổng của tất cả các tổng các giảm giá đến từ chương trình khuyến mãi và mã khuyến mãi
                    {
                        $addFields: TEMP_DISCOUNT
                    },
                    // Thêm một trường mới transactions_punish sẽ là một mảng chứa các tài liệu từ bảng transactions mà 
                    // id_order trùng với _id của tài liệu trong orders, status bằng "done", type_transfer bằng "punish"
                    {
                        $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                    },
                    // Thêm trường mới tempPunish là tổng tiền phạt của đơn hàng đó
                    {
                        $addFields: TEMP_TRANSACTION_PUNISH
                    },
                    // Tính tổng các giá trị
                    {
                        $group: {
                            _id: {},
                            total_order_fee: TOTAL_ORDER_FEE, // Tổng tiền của tất cả đơn hàng 
                            total_income: TOTAL_INCOME, // Tổng tiền thực nhận của công ty
                            total_service_fee: TOTAL_SERVICE_FEE, // Tổng tiền phí dịch vụ
                            total_collabotator_fee: TOTAL_COLLABORATOR_FEE, // Tổng tiền nhận của các cộng tác viên
                            total_gross_income: TOTAL_GROSS_INCOME, //
                            total_item: TOTAL_ORDER,
                            total_discount: TOTAL_DISCOUNT,
                            total_net_income: TOTAL_NET_INCOME,
                            total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                            punish: TOTAL_PUNISH,
                            total_hour: TOTAL_HOUR
                        },
                    },
                    // Tính phần trăm : ($total_net_income_business / $total_income) * 100
                    {
                        $addFields: PERCENT_INCOME
                    },
                ]);
    
                const getCustomer = await this.orderRepositoryService.aggregateQuery([
                    {
                        $lookup: LOOKUP_CUSTOMER,
                    },
                    {
                        $unwind: { path: "$id_customer" },
                    },
                    {
                        $match: query
                    },
                    {
                        $addFields: TEMP_SERVICE_FEE
                    },
                    {
                        $addFields: TEMP_DISCOUNT
                    },
                    {
                        $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                    },
                    {
                        $addFields: TEMP_TRANSACTION_PUNISH
                    },
                    {
                        $group: {
                            _id: '$id_customer._id',
                            total_order_fee: TOTAL_ORDER_FEE,
                            total_income: TOTAL_INCOME,
                            total_service_fee: TOTAL_SERVICE_FEE,
                            total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                            total_gross_income: TOTAL_GROSS_INCOME,
                            total_item: TOTAL_ORDER,
                            total_discount: TOTAL_DISCOUNT,
                            total_net_income: TOTAL_NET_INCOME,
                            punish: TOTAL_PUNISH,
                            total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                        },
                    },
                    {
                        $addFields: PERCENT_INCOME
                    },
                    {
                        $lookup: LOOKUP_GROUP_ID_CUSTOMER
                    },
                    {
                        $unwind: { path: "$id_customer" },
                    },
                    {
                        $sort: { total_item: -1 }
                    },
                    { $skip: Number(iPage.start) },
                    { $limit: Number(iPage.length) }
                ]);
                const totalCustomer = await this.orderRepositoryService.aggregateQuery([
                    {
                        $lookup: LOOKUP_CUSTOMER,
                    },
                    {
                        $unwind: { path: "$id_customer" },
                    },
                    {
                        $match: query
                    },
    
                    {
                        $group: {
                            _id: '$id_customer._id',
                        },
                    },
                    {
                        $count: 'total_customer'
                    },
                ]);
    
                const count = await this.orderRepositoryService.aggregateQuery([
                    {
                        $lookup: LOOKUP_CUSTOMER
                    },
                    {
                        $unwind: { path: "$id_customer" },
                    },
                    {
                        $match: query
                    },
                    {
                        $group: {
                            _id: '$id_customer._id',
                        },
                    },
                    {
                        $count: 'total'
                    },
                ]);
                const result = {
                    start: iPage.start,
                    length: iPage.length,
                    totalItem: count.length > 0 ? count[0].total : 0,
                    total: getCustomerTotal,
                    data: getCustomer,
                    totalCustomer: totalCustomer.length > 0 ? totalCustomer[0].total_customer : 0
                };
                return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reportFirstOrderByTypeCustomer(lang, iPage: iPageReportOrderByCustomerDTOAdmin) {
        try {
            let query: any = {
                $and: [
                        // {
                        //     $or: [
                        //     {status: "confirm"},
                        //     {status: "done"},
                        //     {status: "doing"}
                        // ]},
                        { is_delete: false },
                    ]
            };
            if (iPage.type_status === "done") {
                query.$and.push({
                    status: "done"
                })
            }
            else if (iPage.type_status === "doing") {
                query.$and.push({
                    status: "doing"
                })
            }
            else if (iPage.type_status === "confirm") {
                query.$and.push({
                    status: "confirm"
                })
            }
            else {
                query.$or = [
                    { status: "done" },
                    { status: "doing" },
                    { status: "confirm" }
                ];
            }
            // Thống kê theo ngày làm hoặc ngày tạo
            if (iPage.type_date !== 'date_work') {
                query.$and.push({
                    date_create: {
                        $gte: iPage.start_date,
                    }
                });
                query.$and.push({
                    date_create: {
                        $lte: iPage.end_date,
                    }
                });
            } else {
                query.$and.push({
                    end_date_work: {
                        $gte: iPage.start_date,
                    }
                });
                query.$and.push({
                    end_date_work: {
                        $lte: iPage.end_date,
                    }
                });
            }

            let typeCustomer: any = { $and: []}

            // - Logic hiện tại (sai)
            // + Nhập vào ngày bắt đầu và ngày kết thúc
            // + Dò trong bảng order: lấy tất cả những đơn có ngày làm (hoặc ngày bắt đầu) trong khoảng thời gian đã chọn (có populate thông tin KH)
            // + Lọc theo loại KH:
            //   . all: lấy tất cả các khách hàng
            //   . new: lấy những khách hàng có total_price = 0
            //   . old: lấy những khách hàng có total_price > 0
            // + Nhóm các giá trị dữ liệu tính toán theo những order đã lọc ra được


            // - Logic mới tính tổng đơn hàng đầu tiên theo ngày của khách hàng
            // + Nhập vào ngày bắt đầu và ngày kết thúc
            // + Dò trong bảng order: lấy tất cả những đơn có ngày làm (hoặc ngày bắt đầu) trong khoảng thời gian đã chọn
            // + Lọc theo loại KH:
            //   . all: lấy tất cả khách hàng
            //   . new, old: dò khoảng thời gian trước ngày bắt đầu trong bảng order
            //     .. Nếu tồn tại ít nhất một đơn có id_customer giống id_customer trên thì => KH cũ
            //     .. Còn lại => KH mới
            // + Nhóm các giá trị dữ liệu tính toán theo những order đã lọc ra được

            /*==> nếu dùng theo logic ở trên thì những khách hàng mặc dù trong khoảng thời gian đã chọn mới lên 1 đơn đầu tiên
            nhưng khoảng thời gian đó đã là quá khứ nên total_price (dò trong dữ liệu của KH ở thời điểm hiện tại) sẽ > 0 => bị gán vào KH cũ mặc dù đúng phải là KH mới*/
            if (iPage.type_customer === "old") {
                typeCustomer.$and.push({"previous_orders.0": { $exists: true }})
            }
            else if (iPage.type_customer === "new") {
                typeCustomer.$and.push({"previous_orders.0": { $exists: false }})
            }
            else {
                typeCustomer.$and.push({})
            }

            const getCustomerTotal = await this.orderRepositoryService.aggregateQuery([
                // Lấy thông tin của khách hàng đã đặt đơn hàng đó thông qua id_customer
                {
                    $lookup: LOOKUP_CUSTOMER  
                },
                // Chuyển trường id_customer từ Array thành Object
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                // Thêm một trường mới tempServiceFee sẽ là tổng của tất cả các tổng các phí dịch vụ
                /*[
                    { "_id": 1, "service_fee": { "fee": [10, 20, 30] } },
                    { "_id": 2, "service_fee": { "fee": [15, 25] } },
                    { "_id": 3, "service_fee": { "fee": [5, 10, 15, 20] } }
                        tempServiceFee = (10+20+30) + (15+25) + (5+10+15+20)
                ]*/
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                // Thêm một trường mới tempDiscount sẽ là tổng của tất cả các tổng các giảm giá đến từ chương trình khuyến mãi và mã khuyến mãi
                {
                    $addFields: TEMP_DISCOUNT
                },
                // Thêm một trường mới transactions_punish sẽ là một mảng chứa các tài liệu từ bảng transactions mà 
                // id_order trùng với _id của tài liệu trong orders, status bằng "done", type_transfer bằng "punish"
                {
                    $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                },
                // Thêm trường mới tempPunish là tổng tiền phạt của đơn hàng đó
                {
                    $addFields: TEMP_TRANSACTION_PUNISH
                },
                // Check những đơn hàng trước đó của từng khách hàng (nếu có, có => KH CŨ, không có => KH MỚI)
                {
                    $lookup: {
                      from: "orders",
                      let: {
                        customer_id: "$id_customer._id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                    $eq: [
                                        "$id_customer",
                                        "$$customer_id"
                                    ]
                                },
                                {
                                    $lt: [
                                        // Bug chỗ này, nếu chọn bộ lọc theo ngày tạo thì so với date_create
                                        // Nếu chọn bộ lọc theo ngày làm thì xét end_date_work (ko chọn date_work vì chỉ lấy nhưng đơn đã hoàn thành rồi)
                                        iPage.type_date === "date_work" ? "$end_date_work" : "$date_create",                                        
                                        iPage.start_date,
                                    ]
                                },
                                {
                                    $ne: ["$status", "cancel"]
                                }
                              ]
                            }
                          }
                        }
                      ],
                      as: "previous_orders"
                    }
                },
                // Lọc ra những khách hàng cũ hoặc mới hoặc lấy tất cả
                {
                    $match: typeCustomer
                },
                // Tính tổng các giá trị
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE, // Tổng tiền của tất cả đơn hàng 
                        total_income: TOTAL_INCOME, // Tổng tiền thực nhận của công ty
                        total_service_fee: TOTAL_SERVICE_FEE, // Tổng tiền phí dịch vụ
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE, // Tổng tiền nhận của các cộng tác viên
                        total_gross_income: TOTAL_GROSS_INCOME, //
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        total_hour: TOTAL_HOUR
                    },
                },
                // Tính phần trăm : ($total_net_income_business / $total_income) * 100
                {
                    $addFields: PERCENT_INCOME
                },
            ]);
            // Tổng hợp những giá trị total của từng khách hàng có trong bảng order
            const getCustomer = await this.orderRepositoryService.aggregateQuery([
                {
                    $lookup: LOOKUP_CUSTOMER,
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                },
                {
                    $addFields: TEMP_TRANSACTION_PUNISH
                },
                {
                    $lookup: {
                      from: "orders",
                      let: {
                        customer_id: "$id_customer._id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: [
                                    "$id_customer",
                                    "$$customer_id"
                                  ]
                                },
                                {
                                  $lt: [
                                        // Bug chỗ này, nếu chọn bộ lọc theo ngày tạo thì so với date_create
                                        // Nếu chọn bộ lọc theo ngày làm thì xét end_date_work (ko chọn date_work vì chỉ lấy nhưng đơn đã hoàn thành rồi)
                                        iPage.type_date === "date_work" ? "$end_date_work" : "$date_create",   
                                        iPage.start_date,
                                  ]
                                },
                                {
                                    $ne: ["$status", "cancel"]
                                }
                              ]
                            }
                          }
                        }
                      ],
                      as: "previous_orders"
                    }
                },
                // Lọc ra những khách hàng cũ hoặc mới hoặc lấy tất cả
                {
                    $match: typeCustomer
                },
                {
                    $group: {
                        _id: '$id_customer._id',
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        punish: TOTAL_PUNISH,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
                {
                    $lookup: LOOKUP_GROUP_ID_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $sort: { total_item: -1 }
                },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);
            const totalCustomer = await this.orderRepositoryService.aggregateQuery([
                {
                    $match: query
                },
                {
                    $lookup: LOOKUP_CUSTOMER,
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $lookup: {
                      from: "orders",
                      let: {
                        customer_id: "$id_customer._id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: [
                                    "$id_customer",
                                    "$$customer_id"
                                  ]
                                },
                                {
                                  $lt: [
                                        iPage.type_date === "date_work" ? "$end_date_work" : "$date_create",   
                                        iPage.start_date,
                                  ]
                                },
                                {
                                    $ne: ["$status", "cancel"]
                                }
                              ]
                            }
                          }
                        }
                      ],
                      as: "previous_orders"
                    }
                },
                // Lọc ra những khách hàng cũ hoặc mới hoặc lấy tất cả
                {
                    $match: typeCustomer
                },
                {
                    $group: {
                        _id: '$id_customer._id',
                    },
                },
                {
                    $count: 'total_customer'
                },
            ]);  
            const count = await this.orderRepositoryService.aggregateQuery([
                {
                    $match: query
                },
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $lookup: {
                      from: "orders",
                      let: {
                        customer_id: "$id_customer._id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: [
                                    "$id_customer",
                                    "$$customer_id"
                                  ]
                                },
                                {
                                  $lt: [
                                    iPage.type_date === "date_work" ? "$end_date_work" : "$date_create",   
                                    iPage.start_date,
                                  ]
                                },
                                {
                                    $ne: ["$status", "cancel"]
                                }
                              ]
                            }
                          }
                        }
                      ],
                      as: "previous_orders"
                    }
                },
                // Lọc ra những khách hàng cũ hoặc mới hoặc lấy tất cả
                {
                    $match: typeCustomer
                },
                {
                    $group: {
                        _id: '$id_customer._id',
                    },
                },
                {
                    $count: 'total'
                },
            ]);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                total: getCustomerTotal,
                data: getCustomer,
                totalCustomer: totalCustomer.length > 0 ? totalCustomer[0].total_customer : 0
            };
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reportTotalOrderByCustomer(lang, iPage: iPageReportOrderByCustomerDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    // {
                    //     $or: [
                    //     {status: "confirm"},
                    //     {status: "done"},
                    //     {status: "doing"}
                    // ]},
                    { is_delete: false },
                ]
            };

            if (iPage.type_status === "done") {
                query.$and.push({
                    status: "done"
                })
            }
            else if (iPage.type_status === "doing") {
                query.$and.push({
                    status: "doing"
                })
            }
            else if (iPage.type_status === "confirm") {
                query.$and.push({
                    status: "confirm"
                })
            }
            else {
                query.$or = [
                    { status: "done" },
                    { status: "doing" },
                    { status: "confirm" }
                ];
            }
            if (iPage.type_customer === 'old') {
                query.$and.push({ 'id_customer.date_create': { $lte: iPage.start_date } });
            }
            if (iPage.type_customer === 'new') {
                query.$and.push({ 'id_customer.date_create': { $gte: iPage.start_date } });
                query.$and.push({ 'id_customer.date_create': { $lte: iPage.end_date } });
            }
            if (iPage.type_date !== 'date_work') {
                query.$and.push({
                    date_create: {
                        $gte: iPage.start_date,
                    }
                });
                query.$and.push({
                    date_create: {
                        $lte: iPage.end_date,
                    }
                });
            } else {
                query.$and.push({
                    end_date_work: {
                        $gte: iPage.start_date,
                    }
                });
                query.$and.push({
                    end_date_work: {
                        $lte: iPage.end_date,
                    }
                });
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getTotal = await this.orderRepositoryService.aggregateQuery([
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        total_hour: TOTAL_HOUR
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);

            // const getCustomer = await this.orderModel.aggregate([
            //     {
            //         $lookup: LOOKUP_CUSTOMER,
            //     },
            //     {
            //         $unwind: { path: "$id_customer" },
            //     },
            //     {
            //         $match: query
            //     },
            //     {
            //         $addFields: TEMP_SERVICE_FEE
            //     },
            //     {
            //         $addFields: TEMP_DISCOUNT
            //     },
            //     {
            //         $group: {
            //             _id: '$id_customer._id',
            //             total_order_fee: TOTAL_ORDER_FEE,
            //             total_income: TOTAL_INCOME,
            //             total_service_fee: TOTAL_SERVICE_FEE,
            //             total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
            //             total_gross_income: TOTAL_GROSS_INCOME,
            //             total_item: TOTAL_ORDER,
            //             total_discount: TOTAL_DISCOUNT,
            //             total_net_income: TOTAL_NET_INCOME,
            //             total_net_income_business: TOTAL_NET_INCOME_BUSINESS
            //         },
            //     },
            //     {
            //         $addFields: PERCENT_INCOME
            //     },
            //     {
            //         $lookup: LOOKUP_GROUP_ID_CUSTOMER
            //     },
            //     {
            //         $unwind: { path: "$id_customer" },
            //     },
            //     {
            //         $sort: { total_item: -1 }
            //     },
            //     { $skip: Number(iPage.start) },
            //     { $limit: Number(iPage.length) }
            // ]);

            // const totalCustomer = await this.orderModel.aggregate([
            //     {
            //         $lookup: LOOKUP_CUSTOMER,
            //     },
            //     {
            //         $unwind: { path: "$id_customer" },
            //     },
            //     {
            //         $match: query
            //     },

            //     {
            //         $group: {
            //             _id: '$id_customer._id',
            //         },
            //     },
            //     {
            //         $count: 'total_customer'
            //     },
            // ]);

            const count = await this.orderRepositoryService.aggregateQuery([
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $group: {
                        _id: '$id_customer._id',
                    },
                },
                {
                    $count: 'total'
                },
            ]);

            const tempTotal = (getTotal.length > 0 ) ? getTotal : [{
                total_order_fee: 0,
                total_income: 0,
                total_service_fee: 0,
                total_collabotator_fee: 0,
                total_gross_income: 0,
                total_item: 0,
                total_discount: 0,
                total_net_income: 0,
                total_net_income_business: 0,
                total_hour: 0
            }]


            const result = {
                totalItem: count.length > 0 ? count[0].total : 0,
                total: tempTotal,
                // totalCustomer: totalCustomer.length > 0 ? totalCustomer[0].total_customer : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTotalFirstOrderByCustomer(lang, iPage: iPageReportOrderByCustomerDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    // {
                    //     $or: [
                    //     {status: "confirm"},
                    //     {status: "done"},
                    //     {status: "doing"}
                    // ]},
                    { is_delete: false },
                ]
            };

            if (iPage.type_status === "done") {
                query.$and.push({
                    status: "done"
                })
            }
            else if (iPage.type_status === "doing") {
                query.$and.push({
                    status: "doing"
                })
            }
            else if (iPage.type_status === "confirm") {
                query.$and.push({
                    status: "confirm"
                })
            }
            else {
                query.$or = [
                    { status: "done" },
                    { status: "doing" },
                    { status: "confirm" }
                ];
            }
            
            // if (iPage.type_customer === 'old') {
            //     // query.$and.push({'id_customer.total_price': {$gt: 0}})
            // }
            // if (iPage.type_customer === 'new') {
            //     // query.$and.push({'id_customer.total_price': {$eq: 0}})
            // }
            if (iPage.type_date !== 'date_work') {
                query.$and.push({
                    date_create: {
                        $gte: iPage.start_date,
                    }
                });
                query.$and.push({
                    date_create: {
                        $lte: iPage.end_date,
                    }
                });
            } else {
                query.$and.push({
                    end_date_work: {
                        $gte: iPage.start_date,
                    }
                });
                query.$and.push({
                    end_date_work: {
                        $lte: iPage.end_date,
                    }
                });
            }
            let typeCustomer: any = { $and: []}
            
            if (iPage.type_customer === "old") {
                typeCustomer.$and.push({"previous_orders.0": { $exists: true }})
            }
            else if (iPage.type_customer === "new") {
                typeCustomer.$and.push({"previous_orders.0": { $exists: false }})
            }
            else {
                typeCustomer.$and.push({})
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getTotal = await this.orderRepositoryService.aggregateQuery([
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $lookup: {
                      from: "orders",
                      let: {
                        customer_id: "$id_customer._id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: [
                                    "$id_customer",
                                    "$$customer_id"
                                  ]
                                },
                                {
                                  $lt: [
                                    iPage.type_date === "date_work" ? "$end_date_work" : "$date_create",   
                                    iPage.start_date,
                                  ]
                                },
                                {
                                    $ne: ["$status", "cancel"]
                                }
                              ]
                            }
                          }
                        }
                      ],
                      as: "previous_orders"
                    }
                },
                {$match: typeCustomer},
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        total_hour: TOTAL_HOUR
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);

            // const getCustomer = await this.orderModel.aggregate([
            //     {
            //         $lookup: LOOKUP_CUSTOMER,
            //     },
            //     {
            //         $unwind: { path: "$id_customer" },
            //     },
            //     {
            //         $match: query
            //     },
            //     {
            //         $addFields: TEMP_SERVICE_FEE
            //     },
            //     {
            //         $addFields: TEMP_DISCOUNT
            //     },
            //     {
            //         $group: {
            //             _id: '$id_customer._id',
            //             total_order_fee: TOTAL_ORDER_FEE,
            //             total_income: TOTAL_INCOME,
            //             total_service_fee: TOTAL_SERVICE_FEE,
            //             total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
            //             total_gross_income: TOTAL_GROSS_INCOME,
            //             total_item: TOTAL_ORDER,
            //             total_discount: TOTAL_DISCOUNT,
            //             total_net_income: TOTAL_NET_INCOME,
            //             total_net_income_business: TOTAL_NET_INCOME_BUSINESS
            //         },
            //     },
            //     {
            //         $addFields: PERCENT_INCOME
            //     },
            //     {
            //         $lookup: LOOKUP_GROUP_ID_CUSTOMER
            //     },
            //     {
            //         $unwind: { path: "$id_customer" },
            //     },
            //     {
            //         $sort: { total_item: -1 }
            //     },
            //     { $skip: Number(iPage.start) },
            //     { $limit: Number(iPage.length) }
            // ]);

            // const totalCustomer = await this.orderModel.aggregate([
            //     {
            //         $lookup: LOOKUP_CUSTOMER,
            //     },
            //     {
            //         $unwind: { path: "$id_customer" },
            //     },
            //     {
            //         $match: query
            //     },

            //     {
            //         $group: {
            //             _id: '$id_customer._id',
            //         },
            //     },
            //     {
            //         $count: 'total_customer'
            //     },
            // ]);

            const count = await this.orderRepositoryService.aggregateQuery([
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $lookup: {
                      from: "orders",
                      let: {
                        customer_id: "$id_customer._id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: [
                                    "$id_customer",
                                    "$$customer_id"
                                  ]
                                },
                                {
                                  $lt: [
                                    iPage.type_date === "date_work" ? "$end_date_work" : "$date_create",   
                                    iPage.start_date,
                                  ]
                                },
                                {
                                    $ne: ["$status", "cancel"]
                                }
                              ]
                            }
                          }
                        }
                      ],
                      as: "previous_orders"
                    }
                },
                {$match: typeCustomer},
                {
                    $group: {
                        _id: '$id_customer._id',
                    },
                },
                {
                    $count: 'total'
                },
            ]);

            const tempTotal = (getTotal.length > 0 ) ? getTotal : [{
                total_order_fee: 0,
                total_income: 0,
                total_service_fee: 0,
                total_collabotator_fee: 0,
                total_gross_income: 0,
                total_item: 0,
                total_discount: 0,
                total_net_income: 0,
                total_net_income_business: 0,
                total_hour: 0
            }]


            const result = {
                totalItem: count.length > 0 ? count[0].total : 0,
                total: tempTotal,
                // totalCustomer: totalCustomer.length > 0 ? totalCustomer[0].total_customer : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async setInfoLinkedCollaborator(getOrder: OrderDocument, infoLinkedCollaborator: any) {
        try {
            // getOrder.info_linked_collaborator.push(infoLinkedCollaborator)

            const findIndexLinked = getOrder.info_linked_collaborator.findIndex((a: any) => a.id_collaborator.toString() === infoLinkedCollaborator.id_collaborator.toString());
            if(findIndexLinked > -1) getOrder.info_linked_collaborator[findIndexLinked] = infoLinkedCollaborator
            
            getOrder = await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder)
            return getOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setMultiInfoLinkedCollaborator(getOrder: OrderDocument, infoLinkedCollaborator: any) {
        try {
          await this.orderRepositoryService.updateMany(
            {
              id_group_order: getOrder.id_group_order
            },
            {
                $set: { "info_linked_collaborator.$[elem].status": infoLinkedCollaborator.status }
            },
            {
                arrayFilters: [{ "elem.id_collaborator": infoLinkedCollaborator.id_collaborator }] 
            });
          return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateInfoLinkedCollaborator(getOrder: OrderDocument, infoLinkedCollaborator) {
        try {
            const findIndex = getOrder.info_linked_collaborator.findIndex((a: any) => a.id_collaborator.toString() === infoLinkedCollaborator.id_collaborator.toString());
            if(findIndex > -1) {
                getOrder.info_linked_collaborator[findIndex] = infoLinkedCollaborator;
                getOrder = await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder);
            }
            return getOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateCustomerSatisfactionReport(startDate, endDate) {
        try {
            const aggregateQuery = [
                    {
                        $match: {
                            star: { $gt: 0 },
                            status: STATUS_ORDER.done,
                            is_system_review: false,
                            $and: [
                                { date_create_review: { $ne: null } },
                                { date_create_review: { $gte: startDate } },
                                { date_create_review: { $lte: endDate } },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            starCategory: {
                            $cond: {
                                if: { $lte: ["$star", 2] }, then: "Unhappy",
                                else: {
                                $cond: {
                                    if: { $eq: ["$star", 3] }, then: "Neutral",
                                    else: "Happy"
                                }
                                }
                            }
                            }
                        }
                    },
                    // Nhóm theo starCategory và đếm số lượng
                    {
                        $group: {
                            _id: "$starCategory",
                            count: { $sum: 1 }
                        }
                    },
                    // Tính tổng số đánh giá và số khách hàng hài lòng
                    {
                        $group: {
                            _id: null,
                            totalReviews: { $sum: "$count" },
                            happyCustomers: {
                                $sum: {
                                    $cond: [{ $eq: ["$_id", "Happy"] }, "$count", 0]
                                }
                            },
                            neutralCustomers: {
                                $sum: {
                                    $cond: [{ $eq: ["$_id", "Neutral"] }, "$count", 0]
                                }
                            },
                            unhappyCustomers: {
                                $sum: {
                                    $cond: [ { $eq: ["$_id", "Unhappy"] }, "$count", 0]
                                }
                            }
                        }
                    },
                    // Tính chỉ số CSAT
                    {
                        $project: {
                            _id: 0,
                            percentHappyCus: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: [ "$happyCustomers", "$totalReviews" ] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            percentNeutralCus: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: [ "$neutralCustomers", "$totalReviews" ] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            percentUnhappyCus: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: [ "$unhappyCustomers", "$totalReviews" ] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            totalReviews: 1,
                            happyCustomers: 1,
                            neutralCustomers: 1,
                            unhappyCustomers: 1
                        }
                    }
            ]

            return await this.orderRepositoryService.aggregateQuery(aggregateQuery)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrder(lang, subjectAction, iPage, status, sort) {
        try {
            let query: any = {
                $and: [
                ]
            }
            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                query.$and = [
                    ...query.$and,
                    {
                        $or: [
                            {
                                id_collaborator: subjectAction._id
                            },
                            {
                                'info_linked_collaborator.id_collaborator': subjectAction._id
                            }
                        ]
                    }
                ]
            } else if(subjectAction.type === TYPE_SUBJECT_ACTION.customer) {
                query.$and = [
                    ...query.$and,
                    {
                        id_customer: subjectAction._id,
                    }
                ]
            }
            console.log(iPage.start_date, 'iPage.start_date');
            
            if(iPage.start_date && iPage.end_date) {
                if(Object.keys(sort)[0] === 'date_work') {
                    query.$and = [
                        ...query.$and,
                        // { date_work: { $lte: iPage.end_date } },
                        // { date_work: { $gte: iPage.start_date } }
                    ]
                } 
            }
            query.$and = [
                ...query.$and,
                {status: {$in: status}}
            ]
            const getList = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sort)
            return getList;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async statisticIncomeCollaborator(lang, subjectAction, iPage: iPageDTO, group, dataOrder, startDate, endDate) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.cancel},
                                ]
                            },
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.done},
                                ]
                            },
                        ]
                    },
                    { date_work: { $gte: startDate } },
                    { date_work: { $lte: endDate } }
                ]
            }

            const groupDays = (group === "days") ? { "$dateToString": { "format": "%d/%m/%Y", "date": "$tempDate" } } : { "$dateToString": { "format": "%m/%Y", "date": "$tempDate" } }
            const dataOrder = {
                $group: {
                    _id: groupDays,
                    total_item: TOTAL_ORDER,
                    total_net_income: NET_INCOME,
                    data: { $push: '$order' },
                    sort_date_work: SORT_DATE_WORK,
                },
            }

            const queryAggregateTotal = [
                { $match: query },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: {},
                        total_order_done: TOTAL_ORDER,
                        total_income: NET_INCOME,
                    }
                }
            ]

            let queryAggregateOrder: any = [
                { $match: query },
                { $addFields: TEMP_DATE_WORK },
                { $lookup: LOOKUP_ID_SERVICE },
                { $unwind: '$id_service' },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $addFields: {
                        order: {
                            _id: '$_id',
                            address: '$address',
                            final_fee: '$final_fee',
                            date_work: '$date_work',
                            service: '$id_service.title',
                            id_view: '$id_view',
                            info_linked_collaborator: INFO_LINKED_ONE_COLLABORATOR(subjectAction._id),
                            net_income: "$net_income"
                        }
                    }
                },
                { $sort: { date_work: 1 } },
                {
                    $group: {
                        _id: groupDays,
                        total_item: TOTAL_ORDER,
                        total_net_income: NET_INCOME,
                        data: { $push: '$order' },
                        sort_date_work: SORT_DATE_WORK,
                    },
                },
                { $sort: { sort_date_work: -1 } },
            ]




            
            const tempPromise = [
                this.orderRepositoryService.aggregateQuery(queryAggregateTotal),
                this.orderRepositoryService.countDataByCondition(query)

            ]
            // dataOrder
            // if(dataOrderByGroup === true) {
                tempPromise.push(this.orderRepositoryService.aggregateQuery(queryAggregateOrder));
            // }

            const arrPromise = await Promise.all(tempPromise)
            

            const getDataTotal = arrPromise[0]
            const totalItem = arrPromise[1]
            const getDataOrder = arrPromise[2]
            

            const resutl = {
                start: iPage.start,
                length: iPage.length,
                totalItem: totalItem,
                total_income: getDataTotal[0].total_income || 0,
                total_order_done: getDataTotal[0].total_order_done,
                group: group,
                data_order_by_group: getDataOrder
            }
            return resutl;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async statisticIncome(lang, subjectAction, group, startDate, endDate) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.cancel},
                                ]
                            },
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.done},
                                ]
                            },
                        ]
                    },
                    { date_work: { $gte: startDate } },
                    { date_work: { $lte: endDate } }
                ]
            }

            const queryTotal = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.done},
                                ]
                            },
                        ]
                    },
                    { date_work: { $gte: startDate } },
                    { date_work: { $lte: endDate } }
                ]
            }

            const queryAggregateTotal = [
                { $match: queryTotal },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: {},
                        total_order_done: TOTAL_ORDER,
                        total_income: NET_INCOME,
                    }
                }
            ]

            const groupDays = (group === "days") ? { "$dateToString": { "format": "%d/%m/%Y", "date": "$tempDate" } } : { "$dateToString": { "format": "%m/%Y", "date": "$tempDate" } }


            let queryAggregateOrder: any = [
                { $match: query },
                { $addFields: TEMP_DATE_WORK },
                { $lookup: LOOKUP_ID_SERVICE },
                { $unwind: '$id_service' },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $addFields: {
                        order: {
                            _id: '$_id',
                            address: '$address',
                            final_fee: '$final_fee',
                            date_work: '$date_work',
                            service: '$id_service.title',
                            id_view: '$id_view',
                            info_linked_collaborator: INFO_LINKED_ONE_COLLABORATOR(subjectAction._id),
                            net_income: "$net_income"
                        }
                    }
                },
                { $sort: { date_work: 1 } },
                {
                    $group: {
                        _id: groupDays,
                        total_item: TOTAL_ORDER,
                        total_net_income: NET_INCOME,
                        data: { $push: '$order' },
                        sort_date_work: SORT_DATE_WORK,
                    },
                },
                { $sort: { sort_date_work: -1 } },
            ]

            const getDataTotal = await this.orderRepositoryService.aggregateQuery(queryAggregateTotal)
            const getData = await this.orderRepositoryService.aggregateQuery(queryAggregateOrder)


            const result= {
                total_income: (getDataTotal.length > 0) ? getDataTotal[0].total_income : 0,
                total_order_done: (getDataTotal.length > 0) ? getDataTotal[0].total_order_done : 0,
                // group: group,
                data: getData
            }

            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getOrderByGroupDate(lang, subjectAction, iPage: iPageDTO, group, startDate, endDate) {
        try {
            const sixMonthsAgo  = new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)).toISOString()
            const query = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.cancel},
                                ]
                            },
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.done},
                                ]
                            },
                        ]
                    },
                    { date_work: { $gte: startDate } },
                    { date_work: { $lte: endDate } },
                    { date_create: { $gte: sixMonthsAgo } }
                ]
            }


            const groupDays = (group === "days") ? { "$dateToString": { "format": "%d/%m/%Y", "date": "$tempDate" } } : { "$dateToString": { "format": "%m/%Y", "date": "$tempDate" } }

            let queryAggregateOrder: any = [
                { $match: query },
                { $addFields: TEMP_DATE_WORK },
                { $lookup: LOOKUP_ID_SERVICE },
                { $unwind: '$id_service' },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $addFields: {
                        order: {
                            _id: '$_id',
                            address: '$address',
                            final_fee: '$final_fee',
                            date_work: '$date_work',
                            service: '$id_service.title',
                            id_view: '$id_view',
                            info_linked_collaborator: INFO_LINKED_ONE_COLLABORATOR(subjectAction._id),
                            net_income: "$net_income",
                            payment_method: "$payment_method",
                            end_date_work: "$end_date_work"
                        }
                    }
                },
                { $sort: { date_work: 1 } },
                {
                    $group: {
                        _id: groupDays,
                        total_item: TOTAL_ORDER,
                        total_net_income: NET_INCOME,
                        data: { $push: '$order' },
                        sort_date_work: SORT_DATE_WORK,
                    },
                },
                { $sort: { sort_date_work: -1 } },
                {
                    $facet: {
                        totalItem: [
                            {
                                $count: 'count'
                            }
                        ],
                        data: [{ $skip: iPage.start }, { $limit: iPage.length }],
                    },
                }
            ]

            const getData = await this.orderRepositoryService.aggregateQuery(queryAggregateOrder);

            const result = {
                ...iPage,
                totalItem: (getData[0]["totalItem"][0]) ? getData[0]["totalItem"][0].count : 0,
                data: getData[0]["data"] || []
            }


            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkNumberOfConfirmOrder(lang, idCollaborator, startTime, endTime) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: idCollaborator },
                    { status: { $in: [STATUS_ORDER.confirm, STATUS_ORDER.doing] } },
                    {
                        $or: [
                            { date_work: { $gt: startTime, $lt: endTime } },
                            { end_date_work: { $gt: startTime, $lt: endTime } },
                        ]
                    }
                ]
            }

            const countOrder = await this.orderRepositoryService.countDataByCondition(query)
            if(countOrder > 0) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
            }

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async statisticIncomeByService(lang, subjectAction, group, startDate, endDate) {
        try {
            const queryTotal = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.done},
                                ]
                            },
                        ]
                    },
                    { date_work: { $gte: startDate } },
                    { date_work: { $lte: endDate } }
                ]
            }

            const groupDays = (group === "days") ? { "$dateToString": { "format": "%d/%m/%Y", "date": "$tempDate" } } : { "$dateToString": { "format": "%m/%Y", "date": "$tempDate" } }
            
            
            let queryAggregateOrder: any = [
                { $match: queryTotal },
                { $addFields: TEMP_DATE_WORK },
                { $lookup: LOOKUP_ID_SERVICE },
                { $unwind: '$id_service' },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $addFields: {
                        order: {
                            _id: '$_id',
                            address: '$address',
                            final_fee: '$final_fee',
                            date_work: '$date_work',
                            service: '$id_service.title',
                            id_view: '$id_view',
                            info_linked_collaborator: INFO_LINKED_ONE_COLLABORATOR(subjectAction._id),
                            net_income: "$net_income",
                            payment_method: "$payment_method",
                            end_date_work: "$end_date_work"
                        }
                    }
                },
                { $sort: { date_work: 1 } },
                {
                    $group: {
                      _id: groupDays,
                      services: {
                        $push: {
                          service_id: "$service._id",
                          service_title: "$id_service.title",
                          net_income: "$net_income",
                          count_order: 1
                        }
                      }
                    }
                  },
                  { $unwind: "$services" },
                  {
                    $group: {
                      _id: {
                        date: "$_id",
                        service: "$services.service_id",
                      },
                      total_net_income: {
                        $sum: "$services.net_income"
                      },
                      total_order: {
                        $sum: "$services.count_order"
                      },
                      service_id: { $first: "$services.service_id" },
                      service_title: { $first: "$services.service_title" }
                    }
                  },
                  {
                    $group: {
                      _id: "$_id.date",
                      services: {
                        $push: {
                          service_id: "$service_id",
                          service_title: "$service_title",
                          total_net_income: "$total_net_income",
                          total_order: "$total_order"
                        }
                      }
                    }
                  },
                  { $sort: { _id: -1 } }
            ]

            const getData = await this.orderRepositoryService.aggregateQuery(queryAggregateOrder);


            // const result = {
            //     // totalItem: (getData[0]["totalItem"][0]) ? getData[0]["totalItem"][0].count : 0,
            //     data: getData[0]["data"] || []
            // }

            return (getData.length > 0) ? getData[0] : null;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async totalStatisticIncome(lang, subjectAction) {
        try {
            const queryTotal = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {'info_linked_collaborator.id_collaborator': subjectAction._id},
                                    {'info_linked_collaborator.status': STATUS_ORDER.done},
                                ]
                            },
                        ]
                    },
                ]
            }
            const queryAggregateTotal = [
                { $match: queryTotal },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: {},
                        total_order_done: TOTAL_ORDER,
                        total_income: NET_INCOME,
                    }
                }
            ]
            const getDataTotal = await this.orderRepositoryService.aggregateQuery(queryAggregateTotal)
            const result = {
                total_income: (getDataTotal.length > 0) ? getDataTotal[0].total_income : 0,
                total_order_done: (getDataTotal.length > 0) ? getDataTotal[0].total_order_done : 0,
            }

            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderByGroupOrderAndStatus(idGroupOrder, status?) {
        try {
            const query:any = {
                $and: [
                    { is_delete: false },
                    { id_group_order: idGroupOrder }
                ]
            }
            if(status) {
                query.$and.push(
                    { status: STATUS_ORDER[status] }
                )
            }
            return await this.orderRepositoryService.getListDataByCondition(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async checkOverlapOrder(lang, idCollaborator, order) {
        try {
            const checkTimeStart = new Date(new Date(order.date_work).getTime() - 30 * 60 * 1000).toISOString();
            const checkTimeEnd = new Date(new Date(order.end_date_work).getTime() + 30 * 60 * 1000).toISOString();
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: idCollaborator },
                    { status: { $in: [STATUS_ORDER.confirm, STATUS_ORDER.doing] } },
                    {
                        $or: [
                            { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                            { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                        ]
                    }
                ]
            }
            const numberConfirmOrder = await this.orderRepositoryService.countDataByCondition(query);
            if (numberConfirmOrder > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAddressOrderByGroupOrder(idGroupOrder, payloadAddress) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_group_order: idGroupOrder }
                ]
            }

            const dtoUpdate = {
                lat: payloadAddress.lat.toString(),
                lng: payloadAddress.lng.toString(),
                address: payloadAddress.address,
                "location.coordinates": [Number(payloadAddress.lng), Number(payloadAddress.lat)]
            }

            return await this.orderRepositoryService.updateMany(query, dtoUpdate)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderCreatedByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { date_create: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.orderRepositoryService.getListDataByCondition(query, {}, { date_create: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderDoneByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { completion_date: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.orderRepositoryService.getListDataByCondition(query, {}, { date_create: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderCancelledByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { completion_date: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.orderRepositoryService.getListDataByCondition(query, {}, { date_create: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListOrderHasPunishTicketByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { 
                        list_of_punish_ticket: { 
                            $elemMatch: { 
                                $or: [
                                    { date_create: { $gte: startTime, $lte: endTime } },
                                    { execution_date: { $gte: startTime, $lte: endTime } },
                                    { revocation_date: { $gte: startTime, $lte: endTime } }
                                ]
                            }  
                        } 
                    }
                ]
            }

            return await this.orderRepositoryService.getListDataByCondition(query, {}, { date_create: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderNearMe(lang, iPage: iPageOrderNearDTOCollaborator, getCollaborator, getCollaboratorSetting) {
        try {
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            const currentDate = new Date(Date.now());
            const aggregateQuery = [
                { 
                    $geoNear: {
                        near: { type: "Point", coordinates: iPage.location },
                        distanceField: "dist.calculated",
                        spherical: true,
                        maxDistance: 10000,
                    },
                },
                {
                    $match:  {
                        $and: [
                            { is_duplicate: false },
                            { status: STATUS_ORDER.pending },
                            { "service._id": { $in: getCollaborator.service_apply } },
                            { id_collaborator: null },
                            {
                                $or: [
                                    { id_block_collaborator: [] },
                                    {
                                        $and: [
                                            { id_block_collaborator: { $nin: [getCollaborator._id] } }
                                        ]
                                    }
                                ]
                            },
                        ]
                    },
                },
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        },
                        list_id_cancel_collaborator: {
                            $concatArrays: [ "$id_cancel_collaborator.id_collaborator" ],
                        },
                        is_favourite: { $in: [getCollaborator._id, '$id_favourite_collaborator'] }
                    }
                }, {
                    $addFields: {
                        duration: {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        }
                    }
                }, 
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $expr: {
                                                    $gt: ["$duration", timePushNoti]
                                                }
                                            },
                                            { id_favourite_collaborator: { $ne: [] } }
                                        ]
                                    },
                                    { id_favourite_collaborator: { $in: [getCollaborator._id] } },
                                    { id_favourite_collaborator: [] },
                                ],
                            },
                            {
                                $or: [
                                    { id_cancel_collaborator: [] },
                                    {
                                        $and: [
                                            { id_cancel_collaborator: { $ne: [] } },
                                            { list_id_cancel_collaborator: { $nin: [getCollaborator._id] } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    $sort: { date_work: 1, _id: 1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service._id",
                        foreignField: "_id",
                        as: "servicePop"
                    }
                },
                { $unwind: "$servicePop" },
                {
                    $addFields: {
                        service: {
                            "_id": {
                                "_id": "$servicePop._id",
                                "title": "$servicePop.title"
                            },
                            "optional_service": "$service.optional_service"
                        }
                    }
                },
                {
                    $project: {
                        servicePop: 0,
                    }
                },
            ]

            const lstData =  await this.orderRepositoryService.aggregateQuery(aggregateQuery)

            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: lstData.length,
                data: lstData.length > 0 ? lstData : []
            };
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderFavourite(lang, iPage: iPageDTO, getCollaborator, getCollaboratorSetting) {
        try {
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            const currentDate = new Date(Date.now());
            const aggregateQuery = [
                {
                    $match:  {
                        $and: [
                            { is_duplicate: false },
                            { status: STATUS_ORDER.pending },
                            { "service._id": { $in: getCollaborator.service_apply } },
                            { city: getCollaborator.city },
                            { district: { $in: getCollaborator.district } },
                            { id_collaborator: null },
                            {
                                $or: [
                                    { id_block_collaborator: [] },
                                    {
                                        $and: [
                                            { id_block_collaborator: { $nin: [getCollaborator._id] } }
                                        ]
                                    }
                                ]
                            },
                        ]
                    },
                },
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        },
                        list_id_cancel_collaborator: {
                            $concatArrays: [ "$id_cancel_collaborator.id_collaborator" ],
                        },
                        is_favourite: { $in: [getCollaborator._id, '$id_favourite_collaborator'] }
                    }
                }, {
                    $addFields: {
                        duration: {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        }
                    }
                }, 
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $expr: {
                                                    $gt: ["$duration", timePushNoti]
                                                }
                                            },
                                            { id_favourite_collaborator: { $ne: [] } }
                                        ]
                                    },
                                    { id_favourite_collaborator: { $in: [getCollaborator._id] } },
                                    { id_favourite_collaborator: [] },
                                ],
                            },
                            {
                                $or: [
                                    { id_cancel_collaborator: [] },
                                    {
                                        $and: [
                                            { id_cancel_collaborator: { $ne: [] } },
                                            { list_id_cancel_collaborator: { $nin: [getCollaborator._id] } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    $sort: { date_work: 1, _id: 1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service._id",
                        foreignField: "_id",
                        as: "servicePop"
                    }
                },
                { $unwind: "$servicePop" },
                {
                    $addFields: {
                        service: {
                            "_id": {
                                "_id": "$servicePop._id",
                                "title": "$servicePop.title"
                            },
                            "optional_service": "$service.optional_service"
                        }
                    }
                },
                {
                    $project: {
                        servicePop: 0,
                    }
                },
            ]

            const lstData =  await this.orderRepositoryService.aggregateQuery(aggregateQuery)
            const count = await this.orderRepositoryService.aggregateQuery(aggregateQuery.slice(0, -6))
            
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length,
                data: lstData.length > 0 ? lstData : []
            };
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderCity(lang, iPage: iPageDTO, getCollaborator, getCollaboratorSetting) {
        try {
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            const currentDate = new Date(Date.now());
            const aggregateQuery:any = [
                {
                    $match:  {
                        $and: [
                            { is_duplicate: false },
                            { status: STATUS_ORDER.pending },
                            { "service._id": { $in: getCollaborator.service_apply } },
                            { city: getCollaborator.city },
                            { id_collaborator: null },
                            {
                                $or: [
                                    { id_block_collaborator: [] },
                                    {
                                        $and: [
                                            { id_block_collaborator: { $nin: [getCollaborator._id] } }
                                        ]
                                    }
                                ]
                            },
                        ]
                    },
                },
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        },
                        list_id_cancel_collaborator: {
                            $concatArrays: [ "$id_cancel_collaborator.id_collaborator" ],
                        },
                        is_favourite: { $in: [getCollaborator._id, '$id_favourite_collaborator'] }
                    }
                }, {
                    $addFields: {
                        duration: {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        }
                    }
                }, 
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $expr: {
                                                    $gt: ["$duration", timePushNoti]
                                                }
                                            },
                                            { id_favourite_collaborator: { $ne: [] } }
                                        ]
                                    },
                                    { id_favourite_collaborator: { $in: [getCollaborator._id] } },
                                    { id_favourite_collaborator: [] },
                                ],
                            },
                            {
                                $or: [
                                    { id_cancel_collaborator: [] },
                                    {
                                        $and: [
                                            { id_cancel_collaborator: { $ne: [] } },
                                            { list_id_cancel_collaborator: { $nin: [getCollaborator._id] } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    $sort: { date_work: 1, _id: 1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service._id",
                        foreignField: "_id",
                        as: "servicePop"
                    }
                },
                { $unwind: "$servicePop" },
                {
                    $addFields: {
                        service: {
                            "_id": {
                                "_id": "$servicePop._id",
                                "title": "$servicePop.title"
                            },
                            "optional_service": "$service.optional_service"
                        }
                    }
                },
                {
                    $project: {
                        servicePop: 0,
                    }
                },
            ]

            if (getCollaborator.city < 0) {
                aggregateQuery[0].$match.$and.splice(3, 1);
            }

            const lstData =  await this.orderRepositoryService.aggregateQuery(aggregateQuery)
            const count = await this.orderRepositoryService.aggregateQuery(aggregateQuery.slice(0, -6))
            
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length,
                data: lstData.length > 0 ? lstData : []
            };
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getListOrderByCollaborator (idCollaborator, iPage) {
        try {
            const id = await this.generalHandleService.convertObjectId(idCollaborator)
            const query: any = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: id},
                ]
            }
            let SORT = {}
            if (iPage.type_date && iPage.type_date !== "undefined") { 
                const date_field = iPage.type_date === "date_create" ? "date_create" : "date_work"
                SORT = { [date_field]: -1}
            }
            if (iPage.status !== 'all' && iPage.status !== "undefined") {
                query.$and.push({ status: iPage.status });
            }
            if (iPage.id_service !== 'all' && iPage.id_service !== "undefined") {
                const id_service = await this.generalHandleService.convertObjectId(iPage.id_service)
                query.$and.push({ 'service._id': id_service });
            }
            if (iPage.payment_method !== "all" && iPage.payment_method !== "undefined") {
                query.$and.push({ payment_method: iPage.payment_method });
            }

            const arrPopuplate = [
                POP_COLLABORATOR_INFO,
                POP_CUSTOMER_INFO,
                { path: 'id_punish_ticket', select: {punish_money: 1, note_admin: 1} },
                { path: 'service._id', select: { kind: 1 } },
            ]
            const result = await this.orderRepositoryService.getListPaginationDataByCondition(iPage,query, {}, SORT, arrPopuplate)
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async getTotalOrder (idCollaborator) {
        try {
            const id = await this.generalHandleService.convertObjectId(idCollaborator)
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: id},
                ]
            }
            const result = await this.orderRepositoryService.aggregateQuery([
                {
                    $match: query,
                    
                },
                {
                    $facet: {
                      "overall": [
                          {
                              $group: {
                                  _id: "all",
                                  total_order: { $sum: 1 }
                              }
                          }
                      ],
                      "byStatus": [
                          {
                              $group: {
                                  _id: "$status",
                                  total_order: { $sum: 1 }
                              }
                          }
                      ]                    
                    }
                },
            ])
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async setCallToCustomer (lang,idOrder) { 
      try {
          let getOrder = await this.getDetailItem(lang, idOrder)
          
          getOrder.info_linked_collaborator = getOrder.info_linked_collaborator.map(item => {
              if (item.id_collaborator.toString() === getOrder.id_collaborator.toString()) {
                return { ...item, call_to_customer: true };
              }
              return item;
          });
          return this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder )
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    


    async queryAutomation(item) {
        try {

            const query: any = [
                {
                    $match: {
                        $and: []
                    }
                }
            ]

            // match tim kiem sau khi lookup
            const tempMatchAfter = {
                $match: {
                    $and: []
                }
            }


            for (const condition of item.condition) {
                if (condition.type_condition === "number" || condition.type_condition === "string") {
                    if (condition.operator === ">=") {
                        query[0].$match.$and.push({ [condition.kind]: { $gte: condition.value } })
                    } else if (condition.operator === ">") {
                        query[0].$match.$and.push({ [condition.kind]: { $gt: condition.value } })
                    } else if (condition.operator === "<=") {
                        query[0].$match.$and.push({ [condition.kind]: { $lte: condition.value } })
                    } else if (condition.operator === "<") {
                        query[0].$match.$and.push({ [condition.kind]: { $lt: condition.value } })
                    } else if (condition.operator === "!=") {
                        query[0].$match.$and.push({ [condition.kind]: { $ne: condition.value } })
                    } else {
                        query[0].$match.$and.push({ [condition.kind]: condition.value })
                    }
                } else {
                    switch (condition.kind) {
                        case "status": {
                            break;
                        }
                        case "time_now_compare_after_date_work": {
                            const convertToMiliTime = condition.value
                            const dateNow = new Date();
                            let tempDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
                            tempDate = new Date(tempDate.getTime() - convertToMiliTime);
                            const dateCompare = tempDate.toISOString()
                            if (condition.operator === ">=") {
                                query[0].$match.$and.push({ date_work: { $gte: dateCompare} })
                            } else if (condition.operator === ">") {
                                query[0].$match.$and.push({ date_work: { $gt: dateCompare } })
                            } else if (condition.operator === "<=") {
                                query[0].$match.$and.push({ date_work: { $lte: dateCompare } })
                            } else if (condition.operator === "<") {
                                query[0].$match.$and.push({ date_work: { $lt: dateCompare } })
                            } else if (condition.operator === "!=") {
                                query[0].$match.$and.push({ date_work: { $ne: dateCompare } })
                            } else {
                                query[0].$match.$and.push({ date_work: dateCompare })
                            }

                            break;
                        }
                        case "time_now_compare_date_work": {
                            query.push(
                                {
                                    $addFields: {
                                        createdAt: {
                                            $dateFromString: {
                                                dateString: "$date_create"
                                            }
                                        },
                                    }
                                }
                            )
                            const dateNow = new Date();
                        
                            query.push(
                                {
                                    $addFields: {
                                        timeDifference: { $subtract: ["$createdAt", dateNow] }
                                    }
                                }
                            )
                            
                            if (condition.operator === ">=") {
                                tempMatchAfter.$match.$and.push({ timeDifference: { $gte: condition.value} })
                            } else if (condition.operator === ">") {
                                tempMatchAfter.$match.$and.push({ timeDifference: { $gt: condition.value } })
                            } else if (condition.operator === "<=") {
                                tempMatchAfter.$match.$and.push({ timeDifference: { $lte: condition.value } })
                            } else if (condition.operator === "<") {
                                tempMatchAfter.$match.$and.push({ timeDifference: { $lt: condition.value } })
                            } else if (condition.operator === "!=") {
                                tempMatchAfter.$match.$and.push({ timeDifference: { $ne: condition.value } })
                            } else {
                                tempMatchAfter.$match.$and.push({ timeDifference: condition.value })
                            }

                            break;
                        }
                        default: break;
                    }
                }
            }

            for (const dependency of item.query_dependency) {
                const lookupQuery: any = {
                    $lookup: {
                        from: await this.generalHandleService.convertToPluralNouns(dependency.table),                                                                 
                        let: { localField: `$id_${dependency.table}` },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$localField"] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: `id_${dependency.table}`
                    }
                }

                for (const condition of dependency.condition) {
                    if (condition.type_condition === "number" || condition.type_condition === "string") {
                        const field = `id_${dependency.table}.${condition.kind}`
                        if (condition.operator === ">=") {
                            lookupQuery.$lookup.pipeline[0].$match.$expr.$and.push({ $gte: [{ $getField: { field: condition.kind, input: "$$ROOT" } }, condition.value] })
                            tempMatchAfter.$match.$and.push({ [field]: { $gte: condition.value } })
                        } else if (condition.operator === ">") {
                            lookupQuery.$lookup.pipeline[0].$match.$expr.$and.push({ $gt: [{ $getField: { field: condition.kind, input: "$$ROOT" } }, condition.value] })
                            tempMatchAfter.$match.$and.push({ [field]: { $gt: condition.value } })
                        } else if (condition.operator === "<=") {
                            lookupQuery.$lookup.pipeline[0].$match.$expr.$and.push({ $lte: [{ $getField: { field: condition.kind, input: "$$ROOT" } }, condition.value] })
                            tempMatchAfter.$match.$and.push({ [field]: { $lte: condition.value } })
                        } else if (condition.operator === "<") {
                            lookupQuery.$lookup.pipeline[0].$match.$expr.$and.push({ $lt: [{ $getField: { field: condition.kind, input: "$$ROOT" } }, condition.value] })
                            tempMatchAfter.$match.$and.push({ [field]: { $lt: condition.value } })
                        } else if (condition.operator === "!=") {
                            lookupQuery.$lookup.pipeline[0].$match.$expr.$and.push({ $ne: [{ $getField: { field: condition.kind, input: "$$ROOT" } }, condition.value] })
                            tempMatchAfter.$match.$and.push({ [field]: { $ne: condition.value } })
                        } else {
                            lookupQuery.$lookup.pipeline[0].$match.$expr.$and.push({ $eq: [{ $getField: { field: condition.kind, input: "$$ROOT" } }, condition.value] })
                            tempMatchAfter.$match.$and.push({ [field]: { $eq: condition.value } })
                        }
                    } else {
                        switch (condition.kind) {
                            case "status": {
                                break;
                            }
                            default: break;
                        }
                    }
                }
                query.push(lookupQuery)
                query.push({ $unwind: { path: `$id_${dependency.table}`, preserveNullAndEmptyArrays: true } })
            }
            query.push(tempMatchAfter);
            const result = await this.orderRepositoryService.aggregateQuery(query);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async queryAutomation2() {
        try {

            const query = [
                {
                  $match: {
                    $and: [
                      {status: "confirm"}
                    ]
                  }
                },
                {
                  $lookup: {
                    from: "collaborators",
                    let: { localField: "$id_collaborator" },
                     pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$_id", "$$localField"] },
                              { $or: [
                              { $regexMatch: { input: "$full_name", regex: "n", options: "i" } }
                              ]}
                            ]
                          }
                        }
                      }
                    ],
                    as: "id_collaborator"
                  }
                },
                { $unwind: { path: '$id_collaborator', preserveNullAndEmptyArrays: true } },
                {
                  $match: {
                    $and: [
                      {$or: [
                      {address: {$regex: "n", $options: "i"}},
                      {"id_collaborator.full_name": {$regex: "n", $options: "i"}}
                      ]}
                    ]
                  }
                },
            ]

            // const query2 = [
            //     {
            //       $match: {
            //         $and: [
            //           {status: "confirm"}
            //         ]
            //       }
            //     },
            //     {
            //       $lookup: {
            //         from: "collaborators",
            //         localField: "id_collaborator",
            //         foreignField: "_id",
            //         as: "id_collaborator"
            //       }
            //     },
            //     { $unwind: { path: '$id_collaborator', preserveNullAndEmptyArrays: true } },
            //     {
            //       $match: {
            //         $and: [
            //           {$or: [
            //           {address: {$regex: "n", $options: "i"}},
            //           {"id_collaborator.full_name": {$regex: "n", $options: "i"}}
            //           ]}
            //         ]
            //       }
            //     },
            // ]


            // const query = [
            //     {
            //         $match: {
            //             $and: []
            //         }
            //     }
            // ]


            
            const result = await this.orderRepositoryService.aggregateQuery(query, { explain: true });
            console.log(result.length, 'result');
            

            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListReviewsByCollaborator(idCollaborator, iPage) {
        try {
          let tempDay = new Date();
          tempDay.setDate(tempDay.getDate() - 3);
          const query = {
            $and: [
              {star: { $gt: 0 } },
              {is_system_review: false},
              {id_collaborator: await this.generalHandleService.convertObjectId(idCollaborator) },
              {date_create_review: {$lte: tempDay.toISOString()}}
            ]
          }
          const select = {_id: 1, id_customer: 1, star: 1, review: 1, date_create_review: 1, short_review: 1, is_system_review: 1}
          const sort = {date_create_review: -1}
          const populate = [
            { 
              path: 'id_customer', 
              select: { avatar: 1, full_name: 1} 
            }
          ];
          const results = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, select, sort, populate)

          const data = results.data
          const maskedData = data.map(item => {
            if (item.id_customer?.full_name) {
                const name = item.id_customer.full_name;
                if (name.length > 2) {
                    item.id_customer.full_name = `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
                }
            }
            return item;
          });
          
          return {...results, data: maskedData}

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
      
    }
}
            
