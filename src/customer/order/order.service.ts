import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isEqual } from 'date-fns/fp'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, createOrderDTO, createOrderDTOCustomer, Customer, CustomerDocument, ERROR, GlobalService, iPageDTO, Service, ServiceDocument, tipCollaboratorDTOCustomer } from 'src/@core'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Order, OrderDocument } from 'src/@core/db/schema/order.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { PAYMENT_METHOD, TYPE_RESPONSE_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CoreSystemService } from 'src/core-system/@core-system/core-system.service'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { CustomerSystemService } from 'src/core-system/customer-system/customer-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
@Injectable()
export class OrderService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private orderSystemService: OrderSystemService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private orderRepositoryService: OrderRepositoryService,
        private customerSystemService: CustomerSystemService,
        private coreSystemService: CoreSystemService,
        private orderSystemService2: OrderSystemService2,

        // private i18n: I18nContext,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }


    async getListItem(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [
                    {
                        $and: [
                            { status: { $ne: "cancel" } },
                            { status: { $ne: "done" } }
                        ]
                    },
                    {
                        is_active: true
                    },
                    {
                        id_customer: user._id
                    }
                ]
            }
            const arrItem = await this.orderModel.find(query).sort({ date_work: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1 } })
                .populate({ path: 'id_group_order', select: { type: 1, time_schedule: 1, is_auto_order: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
            // .then();
            const count = await this.orderModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getDetailItem(lang, id: string) {
        try {
            const findItem = await this.orderModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            // findItem.phone_collaborator = await this.generalHandleService.formatHidePhone(findItem.phone_collaborator);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createOrderDTO) {
        try {
            const newItem = new this.orderModel({
                id_customer: payload.id_customer,
                id_collaborator: payload.id_collaborator || null,
                lat: payload.lat,
                lng: payload.lng,
                address: payload.address,
                date_create: payload.date_create,
                date_work: payload.date_work,
                service: payload.service,
                final_fee: payload.final_fee,
                status: payload.status,
            });
            await newItem.save();
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: createOrderDTOCustomer, id: string) {
        try {
            const getItem = await this.orderModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // getItem.id_service = payload.id_service || getItem.id_service
            // getItem.type = payload.type || getItem.type
            return await getItem.save();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async create(lang, payload: createOrderDTOCustomer, id: string) {
        try {
            const getItem = await this.orderModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // getItem.id_service = payload.id_service || getItem.id_service
            // getItem.type = payload.type || getItem.type
            return await getItem.save();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getWaitingItems(lang, user, iPage: iPageDTO) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                {
                    status: ["pending", "confirm", "doing"]
                }
                ]
            }
            const arrItem = await this.orderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.orderModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }




    async getDoneOrder(lang, iPageDoneOrder) {
        try {
            const query = {
                $and: [
                    {
                        status: iPageDoneOrder.status
                    }
                ]
            }
            const arrItem = await this.orderModel.find(query).sort({ date_create: -1, _id: 1 })
            const count = await this.orderModel.count(query)
            const result = {
                start: iPageDoneOrder.start,
                length: iPageDoneOrder.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getListHistoryOrder(lang, iPage, user) {
        try {
            const query = {
                $and: [
                    {
                        status: ["done", "cancel"]
                    },
                    {
                        id_customer: user._id
                    }
                ]
            }
            const arrItem = await this.orderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1, } })
                .populate({ path: 'id_group_order', select: { type: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
            const count = await this.orderModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getInforOrder(lang, user, id) {
        try {
            const item = await this.orderModel.findOne({ _id: id, id_customer: user._id })
                // const item = await this.orderModel.findById(id)
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, phone: 1, gender: 1, birthday: 1, star: 1, } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .populate({ path: 'service.optional_service.extend_optional._id', select: { kind: 1, kind_v2: 1 } })
                .populate({ path: 'id_cancel_customer.id_reason_cancel', select: { title: 1 } })
                .populate({ path: 'id_cancel_collaborator.id_reason_cancel', select: { title: 1 } })
                .populate({ path: 'id_cancel_collaborator.id_collaborator', select: { avatar: 1, full_name: 1, name: 1, phone: 1, gender: 1, birthday: 1 } })
                .populate({ path: "code_promotion._id", select: { title: 1 } })
                .populate({ path: "event_promotion._id", select: { title: 1 } });

            if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (item.id_collaborator !== null) {
                item.id_collaborator.phone = await this.generalHandleService.formatHidePhone(item.id_collaborator.phone)
            }
            for (let i = 0; i < item.id_cancel_collaborator.length; i++) {
                const lengthPhone = item.id_cancel_collaborator[i]["id_collaborator"].phone.length - 2;
                const numberPhoneVisible = item.id_cancel_collaborator[i]["id_collaborator"].phone.slice(-3);
                let phoneHide = "";
                for (let i = 0; i < lengthPhone; i++) {
                    phoneHide += "*";
                }
                item.id_cancel_collaborator[i]["id_collaborator"].phone = phoneHide + numberPhoneVisible;
            }

            let type: any
            if(item.payment_method === PAYMENT_METHOD.cash || item.payment_method === PAYMENT_METHOD.point) {
                type = TYPE_RESPONSE_ORDER.none
            }
            if(item.payment_method === PAYMENT_METHOD.momo) {
                type = TYPE_RESPONSE_ORDER.deep_link
                
            }
            if(item.payment_method === PAYMENT_METHOD.vnpay || item.payment_method === PAYMENT_METHOD.vnbank || item.payment_method === PAYMENT_METHOD.intcard) {
                type = TYPE_RESPONSE_ORDER.url
            }

            return { item, type };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // async customerCancelOrder(lang, user, id) {
    //     try {
    //         const getItem = await this.orderModel.findOne({ _id: id, id_customer: user._id });
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         getItem.status = "cancel";
    //         await getItem.save();
    //         const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order)
    //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false || getGroupOrder.type === 'single') {
    //             getGroupOrder.status = "cancel",
    //                 await getGroupOrder.save();
    //         }
    //         if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
    //             const checkCountOrder = await this.orderModel.count({ id_group_order: getGroupOrder._id }).limit(2)
    //             getGroupOrder.status = (checkCountOrder < 2) ? "cancel" : "done";
    //             await getGroupOrder.save();
    //         }
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async getLastOrderForService(lang, user, idService) {
        try {
            console.log('do da');

            const getOrder = await this.orderModel.findOne({ id_customer: user._id, "service._id": idService }).sort({ date_create: -1 })
                .populate({ path: 'id_group_order', select: { type: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service._id', select: { title: 1, kind: 1, personal: 1 } })
                .populate({ path: 'service.optional_service.extend_optional._id', select: { kind: 1 } })

            return getOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async reasonCancel(lang, user, iPage) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                {
                    apply_user: "customer",
                },
                {
                    is_active: true,
                },
                {
                    is_delete: false,
                }
                ]
            }
            const arrItem = await this.reasonCancelModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
            const count = await this.reasonCancelModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async cancelJob(lang, customer, idOrder, idCancel) {
        try {
            // const getItem = await this.orderModel.findById(idOrder);
            const getOrder = await this.orderModel.findOne({ _id: idOrder, id_customer: customer._id });
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderModel.findOne({ _id: getOrder.id_group_order })
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
            if (getOrder.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            if (getOrder.status === "doing" || getOrder.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
            if (getGroupOrder.status === "cancel" || getGroupOrder.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            const getCancel = await this.reasonCancelModel.findById(idCancel);
            if (!getCancel || (getCancel && getCancel.apply_user !== "customer")) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);

            if (getGroupOrder.type === "schedule") {
                const query = {
                    $and: [
                        { id_group_order: getGroupOrder._id },
                        {
                            $or: [
                                { status: "pending" },
                                { status: "confirm" }
                            ]
                        }
                    ]
                }
                const getOrderPendingConfirm = await this.orderModel.find(query)
                    .select({
                        platform_fee: 1, id_collaborator: 1, date_work: 1, service_fee: 1, final_fee: 1, initial_fee: 1, status: 1, pending_money: 1, refund_money: 1, is_duplicate: 1,
                        name_customer: 1
                    });
                const arrTemp = await this.generalHandleService.sortArrObject(getOrderPendingConfirm, "date_work", 1)
                const findGetOrder = arrTemp.findIndex(x => x.date_work === getOrder.date_work);
                const checkIsConfirm = arrTemp.findIndex(x => x.status === "confirm");
                if (findGetOrder === 0 && arrTemp.length > 1) {
                    let fee_service = 0;
                    for (const item of getOrder.service_fee) {
                        fee_service += item["fee"];
                    }
                    const nextOrder = arrTemp[findGetOrder + 1];
                    const temp_service_fee = getOrder.service_fee;
                    const temp_pending_money = getOrder.pending_money;
                    nextOrder.service_fee = temp_service_fee;
                    nextOrder.pending_money = temp_pending_money;
                    nextOrder.final_fee += fee_service;
                    await nextOrder.save();
                    getOrder.service_fee = [];
                    getOrder.final_fee -= fee_service;
                }
                if (getOrder.is_duplicate === false && arrTemp.length > 1) {
                    getOrder.is_duplicate = true;
                    arrTemp[1].is_duplicate = false;
                    getGroupOrder.status = arrTemp[1].status;
                    if (checkIsConfirm > -1) {
                        const findCollaborator = await this.collaboratorRepositoryService.findOneById(arrTemp[checkIsConfirm].id_collaborator);


                        let previousBalance: any = {
                            refundPlatformFee: {
                                gift_remainder: findCollaborator.gift_remainder,
                                remainder: findCollaborator.remainder,
                                collaborator_wallet: findCollaborator.collaborator_wallet,
                                work_wallet: findCollaborator.work_wallet,
                                date_create: new Date().toISOString()
                            },
                            // minusPlatformFee: {
                            //     gift_remainder: 0,
                            //     remainder: 0,
                            //     date_create: null
                            // }
                            minusPlatformFee: {
                                collaborator_wallet: 0,
                                work_wallet: 0,
                                gift_remainder: 0,
                                remainder: 0,
                                date_create: null
                            }
                        }


                        // const tempCancelOrdeer = await this.collaboratorSystemService.calculateBalance(lang, findCollaborator, getGroupOrder, getOrder, "cancel")
                        findCollaborator.gift_remainder += getOrder.work_shift_deposit
                        findCollaborator.work_wallet += getOrder.work_shift_deposit

                        await this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, getOrder.work_shift_deposit, getOrder, getService, getGroupOrder._id, previousBalance.refundPlatformFee)


                        previousBalance.minusPlatformFee.collaborator_wallet = findCollaborator.collaborator_wallet
                        previousBalance.minusPlatformFee.work_wallet = findCollaborator.work_wallet

                        previousBalance.minusPlatformFee.gift_remainder = findCollaborator.gift_remainder
                        previousBalance.minusPlatformFee.remainder = findCollaborator.remainder
                        previousBalance.minusPlatformFee.date_create = new Date().toISOString()


                        ///// tinh phi tru cho don tiep theo
                        // await this.collaboratorSystemService.checkBalanceMiniusOrder(lang, findCollaborator, getGroupOrder, arrTemp[1]);
                        // const tempConfirmOrder = await this.collaboratorSystemService.calculateBalance(lang, findCollaborator, (arrTemp[1].pending_money + arrTemp[1].platform_fee))
                        // findCollaborator.gift_remainder = tempConfirmOrder.gift_remainder;
                        // findCollaborator.remainder = tempConfirmOrder.remainder;

                        let tempWallet = 0;
                        // tempRemainder = collaborator.gift_remainder - getItem.platform_fee;
                        // tempRemainder = tempRemainder - getItem.pending_money;

                        tempWallet = findCollaborator.work_wallet - getOrder.platform_fee - getOrder.pending_money;

                        ///////////////////////////////////////// OPEN chuyển đổi tiền tệ giữa các ví /////////////////////////////////////////
                        if (findCollaborator.is_auto_change_money && findCollaborator.collaborator_wallet >= tempWallet) {
                            const resultAuto = await this.collaboratorSystemService.changeMoneyWallet(findCollaborator, tempWallet)
                            previousBalance.collaborator_wallet = resultAuto.collaborator_wallet;
                            previousBalance.work_wallet = resultAuto.work_wallet;
                            tempWallet = resultAuto.work_wallet - getOrder.platform_fee - getOrder.pending_money;
                        }
                        ///////////////////////////////////////// END chuyển đổi tiền tệ giữa các ví /////////////////////////////////////////
                        // if (tempWallet < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.BAD_REQUEST);
                        findCollaborator.work_wallet = tempWallet;

                        /// tinh phi tru cho don tiep theo 

                        // if (getGroupOrder.payment_method === "cash") findCollaborator.gift_remainder +=
                        //     getOrder.pending_money - arrTemp[1].pending_money;
                        await this.collaboratorRepositoryService.findByIdAndUpdate(arrTemp[checkIsConfirm].id_collaborator, findCollaborator)
                        // const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
                        this.activityCollaboratorSystemService.minusPlatformFee(findCollaborator, (arrTemp[1].platform_fee + arrTemp[1].pending_money), arrTemp[1], getService, getGroupOrder._id, previousBalance.minusPlatformFee)
                        // if (getOrder.pending_money > 0 && getGroupOrder.payment_method === "cash") {
                        //     this.activityCollaboratorSystemService.refundMoney(findCollaborator, getOrder.pending_money, getGroupOrder, getService, getOrder)
                        //     this.activityCollaboratorSystemService.minusPendingMoney(findCollaborator, arrTemp[1].pending_money, arrTemp[1], getService, getGroupOrder._id)
                        // }



                        // findCollaborator.gift_remainder += getOrder.platform_fee - arrTemp[1].platform_fee;
                        // if (getGroupOrder.payment_method === "cash") findCollaborator.gift_remainder +=
                        //     getOrder.pending_money - arrTemp[1].pending_money;
                        // await findCollaborator.save();
                        // const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
                        // if (getService) {
                        //     this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, getOrder.platform_fee, getOrder, getService, getGroupOrder._id)
                        //     this.activityCollaboratorSystemService.minusPlatformFee(findCollaborator, arrTemp[1].platform_fee, arrTemp[1], getService, getGroupOrder._id)
                        //     if (getOrder.pending_money > 0 && getGroupOrder.payment_method === "cash") {
                        //         this.activityCollaboratorSystemService.refundMoney(findCollaborator, getOrder.pending_money, getGroupOrder, getService, getOrder)
                        //         this.activityCollaboratorSystemService.minusPendingMoney(findCollaborator, arrTemp[1].pending_money, arrTemp[1], getService, getGroupOrder._id)
                        //     }
                        // }
                    }
                    await arrTemp[1].save();
                } else if (getOrder.is_duplicate === true && arrTemp.length > 1) {
                    getGroupOrder.status = arrTemp[1].status;
                }
                else {
                    getGroupOrder.status = "cancel";
                    if (checkIsConfirm > -1) {
                        const findCollaborator = await this.collaboratorRepositoryService.findOneById(arrTemp[checkIsConfirm].id_collaborator);
                        const previousBalance = {
                            gift_remainder: findCollaborator.gift_remainder,
                            remainder: findCollaborator.remainder,
                            collaborator_wallet: findCollaborator.collaborator_wallet,
                            work_wallet: findCollaborator.work_wallet
                        }
                        findCollaborator.gift_remainder += getOrder.work_shift_deposit
                        // findCollaborator.gift_remainder += getOrder.pending_money;
                        findCollaborator.work_wallet += getOrder.work_shift_deposit

                        // if (getGroupOrder.payment_method === "cash") findCollaborator.gift_remainder += getOrder.pending_money;
                        await findCollaborator.save();
                        await this.collaboratorRepositoryService.findByIdAndUpdate(arrTemp[checkIsConfirm].id_collaborator, findCollaborator)
                        const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
                        if (getService) {
                            this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, getOrder.work_shift_deposit, getOrder, getService, getGroupOrder._id, previousBalance)
                            // if (getOrder.pending_money > 0 && getGroupOrder.payment_method === "cash") {
                            //     this.activityCollaboratorSystemService.refundMoney(findCollaborator, getOrder.pending_money, getGroupOrder, getService, getOrder)
                            // }
                        }
                    }
                }
            } else {
                const checkIsConfirm = await this.orderModel.findOne({ status: "confirm", id_group_order: getGroupOrder._id });
                if (checkIsConfirm) {
                    const findCollaborator = await this.collaboratorRepositoryService.findOneById(checkIsConfirm.id_collaborator.toString());
                    if (!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
                    const previousBalance = {
                        gift_remainder: findCollaborator.gift_remainder,
                        remainder: findCollaborator.remainder,
                        collaborator_wallet: findCollaborator.collaborator_wallet,
                        work_wallet: findCollaborator.work_wallet
                    }
                    findCollaborator.gift_remainder += checkIsConfirm.work_shift_deposit;
                    // findCollaborator.gift_remainder += checkIsConfirm.pending_money;

                    findCollaborator.work_wallet += checkIsConfirm.work_shift_deposit;
                    // findCollaborator.work_wallet += checkIsConfirm.pending_money;

                    // if (getGroupOrder.payment_method === "cash") findCollaborator.gift_remainder += checkIsConfirm.pending_money;

                    await this.collaboratorRepositoryService.findByIdAndUpdate(checkIsConfirm.id_collaborator.toString(), findCollaborator)
                    const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
                    if (getService) {
                        this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, getOrder.work_shift_deposit, getOrder, getService, getGroupOrder._id, previousBalance)
                        // if (getOrder.pending_money > 0 && getGroupOrder.payment_method === "cash") {
                        //     this.activityCollaboratorSystemService.refundMoney(findCollaborator, getOrder.pending_money, getGroupOrder, getService, getOrder)
                        // }
                    }
                }
                const checkIsDone = await this.orderModel.findOne({ status: "done", id_group_order: getGroupOrder._id });
                getGroupOrder.status = (checkIsDone) ? "done" : "cancel";
            }
            const previousBalance = customer.pay_point
            if (getGroupOrder.payment_method === "point") {
                customer.cash = customer.cash + getOrder.final_fee;
                customer.pay_point = customer.pay_point + getOrder.final_fee;
                await customer.save();
                this.activityCustomerSystemService.refundPayPointV2(customer._id, getOrder.final_fee, getGroupOrder, getOrder, previousBalance)
            }

            getOrder.id_cancel_customer = {
                id_reason_cancel: idCancel,
                date_create: new Date(Date.now()).toISOString()
            }
            if (getGroupOrder.status === "cancel" || getGroupOrder.status === "done") {
                getGroupOrder.id_cancel_customer = {
                    id_reason_cancel: idCancel,
                    date_create: new Date(Date.now()).toISOString()
                }
            }
            getOrder.status = "cancel";
            for (let i of getGroupOrder.date_work_schedule) {
                let check = isEqual(new Date(getOrder.date_work), new Date(i.date));
                if (check) {
                    i.status = 'cancel'
                }
            }
            if (customer.reputation_score > 0) {
                customer.reputation_score = customer.reputation_score - 1; // tru diem uy tin
                await customer.save()
            }
            getOrder.pending_money = 0;
            getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - getOrder.net_income_collaborator;
            getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - getOrder.pending_money;
            getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - getOrder.refund_money;
            getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - getOrder.initial_fee;
            getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - getOrder.final_fee;
            getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - getOrder.platform_fee;
            await getGroupOrder.save();
            await getOrder.save();
            this.activityCustomerSystemService.cancelOrder(customer._id, getOrder._id, getGroupOrder._id, getCancel)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }


    }

    async cancelJobV2(lang, customer, idOrder, idCancel) {
        try {
            const getOrder = await this.orderModel.findOne({ _id: idOrder, id_customer: customer._id });
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderModel.findOne({ _id: getOrder.id_group_order })
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
            if (getOrder.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            if (getOrder.status === "doing" || getOrder.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
            if (getGroupOrder.status === "cancel" || getGroupOrder.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            const getCancel = await this.reasonCancelModel.findById(idCancel);
            if (!getCancel || (getCancel && getCancel.apply_user !== "customer")) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            let result;
            if (getGroupOrder.type === "schedule") {
                result = await this.orderSystemService.cancelOrderSchedule(lang, getOrder, getGroupOrder, idCancel, 'customer');
            } else {
                result = await this.orderSystemService.cancelOrderSingle(lang, getOrder, getGroupOrder, idCancel, 'customer');
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getOrderByGroupOrder(lang, idUser, idGroupOrder, iPage: iPageDTO) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "groupOrder")], HttpStatus.NOT_FOUND);

            const query = {
                $and: [
                    { is_delete: false },
                    { id_group_order: getGroupOrder._id },
                ]
            }
            const getArrOrder = await this.orderModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_work: 1, ordinal_number: 1 })
                .populate({
                    path: 'id_collaborator', select: {
                        _id: 1, id_view: 1, total_star: 1, total_review: 1, star: 1,
                        name: 1, full_name: 1, phone: 1, code_phone_area: 1, avatar: 1,
                    }
                })
                .populate({ path: "code_promotion._id", select: { title: 1 } })
                .populate({ path: "event_promotion._id", select: { title: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } });

            const count = await this.orderModel.count(query);
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getArrOrder
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // async cancelJob(lang, user, idOrder, idCancel) {
    //     try {
    //         // const getItem = await this.orderModel.findById(idOrder);
    //         const getOrder = await this.orderModel.findOne({ _id: idOrder, id_customer: user._id });
    //         if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
    //         const getGroupOrder = await this.groupOrderModel.findOne({ _id: getOrder.id_group_order })
    //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
    //         if (getOrder.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
    //         if (getOrder.status === "doing" || getOrder.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
    //         if (getGroupOrder.status === "cancel" || getGroupOrder.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
    //         const getCancel = await this.reasonCancelModel.findById(idCancel);
    //         if (!getCancel || (getCancel && getCancel.apply_user !== "customer")) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);
    //         if (getGroupOrder.type === "schedule") {

    //             const query = {
    //                 $and: [
    //                     { id_group_order: getGroupOrder._id },
    //                     { status: "pending" }
    //                 ]
    //             }
    //             const getOrderPending = await this.orderModel.find(query)
    //                 .select({ date_work: 1, service_fee: 1, final_fee: 1, initial_fee: 1, status: 1, pending_money: 1, refund_money: 1, is_duplicate: 1 });
    //             const arrTemp = await this.generalHandleService.sortArrObject(getOrderPending, "date_work", 1)
    //             const getOrderDone = await this.orderModel.findOne({ status: "done", id_group_order: getGroupOrder._id })
    //             if (!getOrderDone || getOrder.service_fee.length > 0) {
    //                 if (getOrderPending.length > 1) {
    //                     let serviceFee = 0;
    //                     for (let serviceFeeItem of getOrder.service_fee) {
    //                         serviceFee += serviceFeeItem["fee"];
    //                     }
    //                     arrTemp[1].service_fee = getOrder.service_fee;
    //                     arrTemp[1].final_fee += serviceFee;
    //                     if (arrTemp[1].pending_money > 0) arrTemp[1].pending_money += serviceFee;
    //                     if (arrTemp[1].refund_money > 0) arrTemp[1].refund_money -= serviceFee;
    //                     await arrTemp[1].save();
    //                     getOrder.service_fee = [];
    //                     getOrder.final_fee -= serviceFee;
    //                     if (getOrder.pending_money > 0) getOrder.pending_money -= serviceFee;
    //                     if (getOrder.refund_money > 0) getOrder.refund_money += serviceFee;
    //                 }
    //             }

    //             if (getOrder.is_duplicate === false && getOrderPending.length > 1) {
    //                 getOrder.is_duplicate = true;
    //                 arrTemp[1].is_duplicate = false;
    //                 await arrTemp[1].save();
    //             }
    //             // for ( let item of arrTemp ) {

    //             // }
    //             getGroupOrder.status = (getOrderPending.length > 0) ? "doing" : (getOrderDone) ? "done" : "cancel";
    //             getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - getOrder.net_income_collaborator;
    //             getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - getOrder.pending_money;
    //             getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - getOrder.refund_money;
    //             getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - getOrder.initial_fee;
    //             getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - getOrder.final_fee;
    //             getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - getOrder.platform_fee;




    //             const checkIsConfirm = await this.orderModel.findOne({ status: "confirm", id_group_order: getGroupOrder._id });
    //             if (checkIsConfirm) {
    //                 const findCollaborator = await this.collaboratorModel.findById(checkIsConfirm.id_collaborator);
    //                 if (!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
    //                 findCollaborator.gift_remainder += checkIsConfirm.platform_fee;
    //                 if (getGroupOrder.payment_method === "cash") findCollaborator.gift_remainder += checkIsConfirm.pending_money;
    //                 await findCollaborator.save();
    //             }
    //         } else {
    //             const checkIsConfirm = await this.orderModel.findOne({ status: "confirm", id_group_order: getGroupOrder._id });
    //             if (checkIsConfirm) {
    //                 const findCollaborator = await this.collaboratorModel.findById(checkIsConfirm.id_collaborator);
    //                 if (!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
    //                 findCollaborator.gift_remainder += checkIsConfirm.platform_fee;
    //                 if (getGroupOrder.payment_method === "cash") findCollaborator.gift_remainder += checkIsConfirm.pending_money;
    //                 await findCollaborator.save();
    //             }
    //             const checkIsDone = await this.orderModel.findOne({ status: "done", id_group_order: getGroupOrder._id });

    //             getGroupOrder.status = (checkIsDone) ? "done" : "cancel";
    //         }
    //         if (getGroupOrder.payment_method === "point") {
    //             const getCustomer = await this.customerModel.findById(getGroupOrder.id_customer);
    //             if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND);
    //             getCustomer.cash = getCustomer.cash + getOrder.final_fee;
    //             getCustomer.pay_point = getCustomer.pay_point + getOrder.final_fee;
    //             await getCustomer.save();

    //             // const dateWork = new Date(getOrder.date_work).getTime();
    //             // const getOrderDone = await this.orderModel.findOne({status: "done", id_group_order: getGroupOrder._id})
    //             // const findPositionOrder = getGroupOrder.date_work_schedule.findIndex(x => new Date(getGroupOrder.date_work_schedule[0].date).getTime() === dateWork)
    //             //     if(getOrderDone) {
    //             //         getCustomer.cash = getCustomer.cash + getOrder.final_fee;
    //             //         getCustomer.pay_point = getCustomer.pay_point + getOrder.final_fee;
    //             //     } else {
    //             //         if(Number(findPositionOrder+1) === getGroupOrder.date_work_schedule.length) {
    //             //             getCustomer.cash = getCustomer.cash + getOrder.final_fee;
    //             //             getCustomer.pay_point = getCustomer.pay_point + getOrder.final_fee;
    //             //         } else {
    //             //             const getNextOrder = await this.orderModel.findOne({date_work: getGroupOrder.date_work_schedule[findPositionOrder + 1].date})
    //             //             const serviceFee = await this.orderSystemService.sumServiceFee(getOrder);
    //             //             getNextOrder.service_fee = getOrder.service_fee;
    //             //             getNextOrder.final_fee += serviceFee;
    //             //             getOrder.service_fee = [];
    //             //             getOrder.final_fee = getOrder.final_fee - serviceFee
    //             //             if(getOrder.is_duplicate === false) {
    //             //                 getNextOrder.is_duplicate = false;
    //             //                 getOrder.is_duplicate = true;
    //             //             }
    //             //             getCustomer.cash = getCustomer.cash + getOrder.final_fee;
    //             //             getCustomer.pay_point = getCustomer.pay_point + getOrder.final_fee;
    //             //             await getNextOrder.save();
    //             //         }
    //             //     }

    //         }
    //         getOrder.id_cancel_customer = {
    //             id_reason_cancel: idCancel,
    //             date_create: new Date(Date.now()).toISOString()
    //         }
    //         if (getGroupOrder.status === "cancel" || getGroupOrder.status === "done") {
    //             getGroupOrder.id_cancel_customer = {
    //                 id_reason_cancel: idCancel,
    //                 date_create: new Date(Date.now()).toISOString()
    //             }
    //         }
    //         getOrder.status = "cancel";

    //         if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
    //             for (let i of getGroupOrder.date_work_schedule) {
    //                 let check = isEqual(new Date(getOrder.date_work), new Date(i.date));
    //                 if (check) {
    //                     i.status = 'cancel'
    //                 }
    //             }
    //         } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
    //             for (let i of getGroupOrder.date_work_schedule) {
    //                 i.status = "cancel";
    //             }
    //         } else if (getGroupOrder.type === 'schedule') {
    //             for (let i of getGroupOrder.date_work_schedule) {
    //                 let check = isEqual(new Date(getOrder.date_work), new Date(i.date));
    //                 if (check) {
    //                     i.status = 'cancel'
    //                 }
    //             }
    //         }

    //         await getGroupOrder.save();
    //         await getOrder.save();
    //         this.activityCustomerSystemService.cancelOrder(user._id, getOrder._id)

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }


    // }
    //////
    async tipCollaborator(lang, user, idOrder, req: tipCollaboratorDTOCustomer) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    //////
    //////
    //////



    async cancelOrder(lang, user, idOrder, idCancel) {
        try {
            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: true,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: true
            }
            const subjectAction = {
                _id: user._id.toString(),
                type: "customer"
            }
            const result = await this.orderSystemService2.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
