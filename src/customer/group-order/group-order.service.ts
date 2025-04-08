import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument, ERROR, GlobalService, iPageDTO, iPageHistoryGroupOrderDTOCustomer, Order, OrderDocument, Service, ServiceDocument, stepCancelDTO } from 'src/@core';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { Address, AddressDocument } from 'src/@core/db/schema/address.schema';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { OrderSystemService } from 'src/core-system/order-system/order-system.service';
import { ExtendOptionalService } from '../extend-optional/extend-optional.service';
import { OptionalServiceService } from '../optional-service/optional-service.service';
import { PromotionService } from '../promotion/promotion.service';
import { ServiceService } from '../service/service.service';
import { AddressService } from '../address/address.service';
import { AuthService } from '../auth/auth.service';
import { CustomExceptionService } from '../../@share-module/custom-exception/custom-exception.service';
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema';
import { Collaborator, CollaboratorDocument, createOrderDTO, createOrderDTOCustomer } from 'src/@core';
import { ServiceFee, ServiceFeeDocument } from 'src/@core/db/schema/service_fee.schema';
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service';
import { createTransactionDTO } from 'src/@core/dto/transaction.dto';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service';
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service';
import { CustomerSystemService } from 'src/core-system/customer-system/customer-system.service';
import { CoreSystemService } from 'src/core-system/@core-system/core-system.service';
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service';
import { PAYMENT_METHOD, TYPE_RESPONSE_ORDER } from 'src/@repositories/module/mongodb/@database/enum';

@Injectable()
export class GroupOrderService {
    constructor(
        private globalService: GlobalService,
        private extendOptionalService: ExtendOptionalService,
        private optionalServiceService: OptionalServiceService,
        private serviceService: ServiceService,
        private promotionService: PromotionService,
        private addressService: AddressService,
        private authService: AuthService,
        private orderSystemService: OrderSystemService,
        private customExceptionService: CustomExceptionService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private groupOrderSystemService: GroupOrderSystemService,
        private transactionSystemService: TransactionSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private collaboratorSystemService: CollaboratorSystemService,
        private customerSystemService: CustomerSystemService,
        private coreSystemService: CoreSystemService,
        private groupOrderSystemService2: GroupOrderSystemService2,



        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(ServiceFee.name) private serviceFeeModel: Model<ServiceFeeDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }


    async getAll(lang, iPage) {
        try {
            const query = {
                $and: [
                    { type: iPage.type },
                    { id_order: [] }
                ],
            }
            // if (iPage.type === "single") {
            //     query.$and.push({ id_order: [] });
            // }
            // if (iPage.type === "loop") {
            //     query.$and.push({ id_order: [] });
            // }
            // if (iPage.type === "schedule") {
            //     query.$and.push({ id_order: [] });
            // }

            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupOrderModel.count(query)
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


    async getAllLoop(lang, iPage) {
        try {
            const query = {
                $and: [
                    { type: iPage.type },
                    { id_order: [] },
                    { is_auto_order: iPage.is_auto_order }
                ],
            }
            // if (iPage.type === "single") {
            //     query.$and.push({ id_order: [] });
            // }
            // if (iPage.type === "loop") {
            //     query.$and.push({ id_order: [] });
            // }
            // if (iPage.type === "schedule") {
            //     query.$and.push({ id_order: [] });
            // }
            console.log(query.$and, 'iPage');
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupOrderModel.count(query)
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

    async getAllSchedule(lang, iPage) {
        try {
            const query = {
                $and: [
                    { type: iPage.type },
                    { id_order: [] }
                ],
            }
            // if (iPage.type === "single") {
            //     query.$and.push({ id_order: [] });
            // }
            // if (iPage.type === "loop") {
            //     query.$and.push({ id_order: [] });
            // }
            // if (iPage.type === "schedule") {
            //     query.$and.push({ id_order: [] });
            // }
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupOrderModel.count(query)
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



    async createItem(lang, payload: createGroupOrderDTOCustomer, user: CustomerDocument, version?: string) {
        try {
            payload.id_customer = user._id;
            const newGroupOrder = await this.groupOrderSystemService.createItem(lang, payload, null, version);
            return newGroupOrder;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async setDefaultAddress(lang, user) {
        try {
            const groupOrderAddress = await this.getAddressLastOrder(lang, user)
            const getDefaultAddressCustomer = await this.authService.getInfoByToken(lang, user);
            if (!getDefaultAddressCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getDefaultAddressCustomer.default_address = groupOrderAddress.data
            return await getDefaultAddressCustomer.save()
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getAddressLastOrder(lang, user) {
        try {
            const arrItem = await this.groupOrderModel.findOne({ id_customer: user._id }).sort({ date_create: -1, _id: 1 }).then();
            const result = {
                data: arrItem.address,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, id, payload: any) {
        try {
            const getItem = await this.groupOrderModel.findById(id);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.id_order.push(payload.id_order);
            getItem.save();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getServiceFee(lang, payload: createGroupOrderDTOCustomer, user) {
        try {
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: "house",
                note_address: ""
            };
            if (!payload.token) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
            }
            if (payload.token) {
                convertToken = await this.globalService.decryptObject(payload.token);
            }

            const service_fee = await this.serviceFeeModel.find();
            const result = {
                service_fee: service_fee
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getLoopItems(lang, user, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {
                        type: "loop"
                    },
                    {
                        status: { $in: ["pending", "confirm", "doing"] }
                    },
                    {
                        is_auto_order: true,
                    },
                    {
                        id_customer: user._id
                    }
                ]
            }
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .then();
            const count = await this.groupOrderModel.count(query)
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


    async getScheduleItems(lang, user, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {
                        status: { $in: ["pending", "confirm", "doing"] }
                    },
                    {
                        type: "schedule"
                    },
                    {
                        id_customer: user._id
                    }
                ]
            }
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1 } })
                .populate({ path: 'id_order', select: { _id: 1, id_view: 1, star: 1, review: 1 } })
                .populate({ path: "code_promotion._id", select: { title: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: "event_promotion._id", select: { title: 1 } });
            const count = await this.groupOrderModel.count(query)
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


    async getListItem(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    }]
                },
                { id_customer: user._id },

                ]
            }

            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            console.log(arrItem, 'arr');

            const count = await this.groupOrderModel.count(query)
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

    async getLastItem(lang) {
        try {
            const arrItem = await this.groupOrderModel.findOne().sort({ date_create: -1, _id: 1 })
            const result = {
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // bo trong phien ban sap toi
    async cancelGroupOrderBackup(lang, idGroupOrder: string, idCancel: string, user) {
        try {
            const getGroupOrder = await this.groupOrderModel.findOne({ _id: idGroupOrder, id_customer: user._id });
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getGroupOrder.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            getGroupOrder.id_cancel_customer = {
                id_reason_cancel: idCancel,
                date_create: new Date(Date.now()).toISOString()
            }
            const arrOrder = await this.orderModel.find({
                $and: [
                    { status: { $ne: "done" } },
                    { status: { $ne: "cancel" } },
                    { id_group_order: getGroupOrder._id }
                ]
            })
            const checkOrderIsDoing = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, status: "doing" });
            if (checkOrderIsDoing) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
            const checkOrderIsDone = arrOrder.findIndex(x => x.status === "done");
            getGroupOrder.status = (checkOrderIsDone > 0) ? "done" : "cancel"

            const getOrderByGroupOrder = await this.orderModel.find({
                id_group_order: getGroupOrder._id,
                id_customer: user._id
            })

            if (getGroupOrder.type === "schedule") {
                for (let item of getOrderByGroupOrder) {
                    if (item.status === 'pending' || item.status === 'confirm') {
                        item.status = 'cancel';
                        item.id_collaborator = null;
                        item.name_collaborator = null;
                        item.phone_collaborator = null;
                        await item.save();
                    }
                }
            }


            // neu co CTV da nhan don thi tra lai tien cho CTV
            if (getGroupOrder.type === "schedule") {
                const OrderIsConfirm: any = arrOrder.filter(x => x.status === "confirm");
                if (OrderIsConfirm.length > 0) {
                    const findCollaborator = await this.collaboratorRepositoryService.findOneById(OrderIsConfirm[0].id_collaborator);
                    if (!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
                    // let serviceFee = 0;
                    // for(const item of OrderIsConfirm) {
                    //     const temp = await this.orderSystemService.sumServiceFee(item);
                    //     serviceFee += temp;
                    // }
                    // findCollaborator.gift_remainder += platform_fee * OrderIsConfirm.length;
                    // findCollaborator.gift_remainder += 
                    // (OrderIsConfirm[0].payment_method === "cash") ? platform_fee + serviceFee : platform_fee ;



                    findCollaborator.gift_remainder += getGroupOrder.temp_platform_fee;

                    // if (getGroupOrder.payment_method === "cash" && getGroupOrder.temp_pending_money > 0) {
                    findCollaborator.gift_remainder += getGroupOrder.temp_pending_money;
                    // }
                    for (let item of getOrderByGroupOrder) {
                        if (item.status === 'confirm') {
                            item.status = 'cancel';
                            await item.save();
                        }
                    }

                    // let refund = 0;
                    // for (const item of OrderIsConfirm) {
                    //     refund += item.platform_fee;
                    //     if (item.payment_method === "cash") {
                    //         if (item.collaborator_fee < 0) {
                    //             refund = refund - item.collaborator_fee;
                    //         }
                    //     }
                    // }
                    // findCollaborator.gift_remainder += refund;
                    // if (OrderIsConfirm.change_money < 0) {
                    //     findCollaborator.gift_remainder += OrderIsConfirm.change_money * OrderIsConfirm.length;
                    // }
                    // for (const item of OrderIsConfirm) {
                    //     item.id_collaborator = null;
                    //     item.save();
                    // }
                    getGroupOrder.id_collaborator = null;
                    await findCollaborator.save();

                }
            } else {
                const OrderIsConfirm: any = arrOrder.filter(x => x.status === "confirm");
                if (OrderIsConfirm.length > 0) {
                    const findCollaborator = await this.collaboratorRepositoryService.findOneById(OrderIsConfirm[0].id_collaborator);
                    if (!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);

                    findCollaborator.gift_remainder += getGroupOrder.temp_platform_fee;
                    findCollaborator.gift_remainder += getGroupOrder.temp_pending_money;
                    // if (getGroupOrder.payment_method === "cash" && getGroupOrder.temp_pending_money > 0) {
                    //     findCollaborator.gift_remainder += getGroupOrder.temp_pending_money;
                    // }

                    // findCollaborator.gift_remainder += 
                    // (OrderIsConfirm[0].payment_method === "cash") ? platform_fee + serviceFee : platform_fee ;
                    // if (OrderIsConfirm[0].payment_method === "cash") {
                    //     if (OrderIsConfirm[0].collaborator_fee < 0) {
                    //         findCollaborator.gift_remainder = findCollaborator.gift_remainder - OrderIsConfirm[0].collaborator_fee;
                    //     }
                    // } else {
                    //     findCollaborator.gift_remainder += OrderIsConfirm[0].platform_fee;
                    // }

                    OrderIsConfirm[0].id_collaborator = null;
                    OrderIsConfirm[0].save();
                    getGroupOrder.id_collaborator = null;
                    await this.collaboratorRepositoryService.findByIdAndUpdate(OrderIsConfirm[0].id_collaborator, findCollaborator)
                }
            }
            let getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
            if (getGroupOrder.payment_method === "point") {
                for (let item of arrOrder) {
                    getCustomer.cash += item.final_fee;
                    getCustomer.pay_point += item.final_fee;
                }
            }
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            await getGroupOrder.save();

            this.activityCustomerSystemService.cancelGroupOrder(getCustomer._id, getGroupOrder._id, idCancel)
            if (getGroupOrder.payment_method === "point") {
                this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, getGroupOrder.temp_final_fee, getGroupOrder)
            }

            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }


    async getGroupOrderByOrder(lang, idOrder: string, idUser) {
        try {
            const getOrder = await this.orderModel.findOne({ _id: idOrder, id_customer: idUser });
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order)
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getLastGroupOrder(lang, user) {
        try {
            // const listGrOrder = await this.groupOrderRepositoryService.getListDataByCondition(
            //     {id_customer: user._id, status:{ "$in": ["done", "cancel"] }, 'service._id':new Types.ObjectId("6321598ea6c81260452bf4f5")},
            //     {},{date_create:-1},
            //     [{ path: 'service._id', select: { title: 1 } }, { path: 'service.optional_service.extend_optional._id', select: { kind: 1 } }]
            // )
            // // Ko populate được bằng getListDataByCondition nên dùng thêm findOne để populate
            // console.log(listGrOrder.length, "length");

            // const getGroupOrder = await this.groupOrderRepositoryService.findOne(
            //     listGrOrder[0], 
            //     {}, [{ path: 'service._id', select: { title: 1 } }, { path: 'service.optional_service.extend_optional._id', select: { kind: 1 } }]
            // );

            // Comment phần trên do chưa populate được

            const getGroupOrder = await this.groupOrderModel.findOne({ id_customer: user._id, status: { "$in": ["done", "cancel"] }, 'service._id': '6321598ea6c81260452bf4f5' })
                .sort({ date_create: -1 })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service.extend_optional._id', select: { kind: 1 } })
            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getLastGroupOrderForService(lang, user, idService) {
        try {
            const getGroupOrder = await this.groupOrderModel.findOne({ id_customer: user._id, "service._id": idService })
                .sort({ date_create: -1 })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service.extend_optional._id', select: { kind: 1 } })
            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInforGroupOrder(lang, user, id) {
        try {
            const item = await this.groupOrderModel.findOne({ _id: id, id_customer: user._id })
                .populate({ path: 'id_customer', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1, birthday: 1 } })
                .populate({ path: 'id_collaborator', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1, birthday: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .populate({ path: 'service.optional_service.extend_optional._id', select: { kind: 1, kind_v2: 1 } })
                .populate({ path: 'id_cancel_customer.id_reason_cancel', select: { title: 1, } })
                .populate({ path: "code_promotion._id", select: { title: 1 } })
                .populate({ path: "event_promotion._id", select: { title: 1 } })

            if (item.id_collaborator !== null) {
                item.id_collaborator.phone = await this.generalHandleService.formatHidePhone(item.id_collaborator.phone)
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
    async getListHistoryGroupOrder(lang, iPage: iPageHistoryGroupOrderDTOCustomer, user) {
        try {
            const query: any = {
                $and: [
                    {
                        status: { $in: ["done", "cancel"] }
                    },
                    {
                        id_customer: user._id
                    },
                    {
                        type: iPage.type
                    },
                    { is_delete: false }
                ]
            }
            if (iPage.type !== 'schedule') {
                query.$and[2] = { type: { $in: ['loop', 'single'] } }// fix tạm nữa cần sửa lại 
            }
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1, ordinal_number: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'id_order', select: { review: 1, star: 1, id_view: 1, _id: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } });

            const count = await this.groupOrderModel.count(query)
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


    async getLastGroupOrderOnQueue(lang, timestamp, user) {
        try {


            const query: any = {
                $and: [
                    {
                        timestamp: timestamp
                    },
                    {
                        id_customer: user._id
                    },
                    { is_delete: false }
                ]
            }
            const findItem = await this.groupOrderModel.findOne(query)
            // .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, star: 1 } })
            // .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
            // .populate({ path: 'id_order', select: { review: 1, star: 1, id_view: 1, _id: 1 } })
            // .populate({ path: 'service._id', select: { title: 1 } });
            // const count = await this.groupOrderModel.count(query)

            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async cancelGroupOrder(lang, idGroupOrder: string, idCancel: string, user) {
        try {
            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: true,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: false
            }
            const subjectAction = {
                _id: user._id.toString(),
                type: "customer"
            }
            this.groupOrderSystemService2.cancelGroupOrder(lang, subjectAction, idGroupOrder, idCancel, stepCancel)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

}
