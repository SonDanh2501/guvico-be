import { Injectable } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { HttpException } from '@nestjs/common/exceptions'
import { InjectModel } from '@nestjs/mongoose'
import { addHours, nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday } from 'date-fns'
import { Model, Types } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, GlobalService, iPageDTO, Order, OrderDocument, phoneDTO, previousBalanceCollaboratorDTO, tipCollaboratorDTOCustomer, TransitionCustomer, TransitionCustomerDocument } from 'src/@core'
import { Address, AddressDocument } from 'src/@core/db/schema/address.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { PriceOption, PriceOptionDocument } from 'src/@core/db/schema/price_option.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { ServiceFee, ServiceFeeDocument } from 'src/@core/db/schema/service_fee.schema'
import { createGroupOrderDTOAdmin, createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { Service, ServiceDocument } from '../../@core/db/schema/service.schema'
import { UserSystem, UserSystemDocument } from '../../@core/db/schema/user_system.schema'
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from '../activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from '../activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
import { CollaboratorSystemService } from '../collaborator-system/collaborator-system.service'
import { ExtendOptionalSystemService } from '../extend-optional-system/extend-optional-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { OptionalServiceSystemService } from '../optional-service-system/optional-service-system.service'
import { OrderSystemService } from '../order-system/order-system.service'
import { PromotionSystemService } from '../promotion-system/promotion-system.service'
import { ServiceSystemService } from '../service-system/service-system.service'
import { TransactionSystemService } from '../transaction-system/transaction-system.service'

@Injectable()
export class GroupOrderSystemService {
    constructor(
        private globalService: GlobalService,
        private extendOptionalService: ExtendOptionalSystemService,
        private optionalServiceService: OptionalServiceSystemService,
        private serviceService: ServiceSystemService,
        private promotionService: PromotionSystemService,
        private orderSystemService: OrderSystemService,
        private customExceptionService: CustomExceptionService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private activitySystemService: ActivitySystemService,

        private generalHandleService: GeneralHandleService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private transactionSystemService: TransactionSystemService,
        private transactionRepositoryService: TransactionRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,

        private orderRepositoryService: OrderRepositoryService,

        private reasonsCancelRepositoryService: ReasonsCancelRepositoryService,

        private notificationSystemService: NotificationSystemService,

        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(ServiceFee.name) private serviceFeeModel: Model<ServiceFeeDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(PriceOption.name) private priceOptionModel: Model<PriceOptionDocument>,

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
            console.log(query.$and, 'iPage');

            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1 })
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
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1 })
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
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1 })
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

    // async createItem(lang, payload: createGroupOrderDTOCustomer, user) {
    //     try {
    //         const infoJob = await this.calculateFeeGroupOrder(lang, payload);
    //         let calculateCodePromotion = null
    //         if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
    //             payload.code_promotion !== "")


    //         calculateCodePromotion = {}
    //         if (payload.code_promotion) {
    //             calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion);
    //         }
    //         const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob);
    //         const service_fee = await this.getServiceFee(lang, payload, user);

    //         // let discount_event_promotion = 0;
    //         // let final_fee = Number(infoJob.initial_fee) - Number(calculateCodePromotion['discount'] | 0);

    //         // for(let i = 0 ; i < calculateEventPromotion.event_promotion.length ; i++) {
    //         //     final_fee = final_fee - Number(calculateEventPromotion.event_promotion[i].discount);
    //         // }
    //         // for(let i = 0 ; i < service_fee.service_fee.length ; i++) {
    //         //     final_fee = final_fee + Number(service_fee.service_fee[i].fee)
    //         // }

    //         const getDefaultAddressCustomer = await this.authService.getInfoByToken(lang, user);

    //         const newGroupOrder = new this.groupOrderModel({
    //             id_customer: user._id,
    //             id_order: [],
    //             lat: infoJob.lat || "",
    //             lng: infoJob.lng || "",
    //             address: infoJob.address || "",
    //             date_create: new Date(Date.now()).toISOString(),
    //             date_work_schedule: infoJob.date_work_schedule,
    //             next_time: null,
    //             time_schedule: (infoJob.type === "schedule") ? payload.time_schedule : null,
    //             is_auto_order: payload.is_auto_order,
    //             status: payload.status,
    //             type: infoJob.type,
    //             code_promotion: (payload.code_promotion) ? calculateCodePromotion : null,
    //             event_promotion: calculateEventPromotion.event_promotion || [],
    //             initial_fee: infoJob.initial_fee,
    //             service: infoJob.service,
    //             service_fee: service_fee.service_fee,
    //             total_estimate: infoJob.total_estimate,
    //             final_fee: 0,
    //             note: payload.note
    //         })
    //         const result = await newGroupOrder.save();

    //         if (result.type === 'loop') {
    //             await this.orderSystemService.processLoopOrder(result._id)
    //         }
    //         if (result.type === 'single') {
    //             await this.orderSystemService.processOrderSingle(result._id)
    //         }


    //         // return result;
    //         await newGroupOrder.save();
    //         // await this.setDefaultAddress(lang, user);

    //         if (getDefaultAddressCustomer.default_address = null) {
    //             await this.setDefaultAddress(lang, user);
    //         }
    //         await this.promotionService.increaseTotalUsedPromotion(lang, user);
    //         return newGroupOrder;
    //     }
    //     catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    async getInfoByToken(lang, payload: phoneDTO) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // backup
    // async createItem(lang, payload: createGroupOrderDTOAdmin, admin, version) {
    //     try {
    //         let checkAdmin = admin ? 'admin' : 'customer';
    //         const callPromiseAll = await Promise.all([
    //             this.calculateFeeGroupOrder(lang, payload, checkAdmin),
    //             this.getServiceFee(lang, payload),
    //             this.customerModel.findById(payload.id_customer)
    //         ]);

    //         if (payload.tip_collaborator && (payload.tip_collaborator > 0 && callPromiseAll[0].type === 'schedule') || (payload.tip_collaborator > 0 && payload.is_auto_order === true)) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'tip collaborator')], HttpStatus.BAD_REQUEST);
    //         }
    //         const infoJob = callPromiseAll[0];
    //         const service_fee = callPromiseAll[1];
    //         const getDefaultAddressCustomer = callPromiseAll[2];
    //         const getCustomer = await this.customerModel.findById(payload.id_customer);
    //         // const tempAddress = infoJob.address.split(",");
    //         // const administrative = {
    //         //     city: tempAddress[tempAddress.length - 1],
    //         //     district: tempAddress[tempAddress.length - 2]
    //         // }
    //         const previousBalance = {
    //             pay_point: getCustomer.pay_point
    //         }
    //         const callPromiseDistric = await Promise.all([
    //             this.generalHandleService.getCodeAdministrativeToString(infoJob.address),
    //             // this.serviceModel.findById(tempAddress.service["_id"])
    //         ]);
    //         const city: number = callPromiseDistric[0].city;
    //         const district: number = callPromiseDistric[0].district;

    //         // chặn tạo đơn ở các khu vực khác nếu ở trên admin 
    //         if (checkAdmin === 'admin') {
    //             const checkPermisstion = await this.globalService.checkPermissionArea(admin, city, district, callPromiseAll[0].service._id);
    //             if (!checkPermisstion.permisstion) {
    //                 throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
    //             }
    //         }
    //         // kết thúc chặn tạo đơn ở các khu vực khác nếu ở trên admin 

    //         ////// tạo mã group order 
    //         let tempIdView: string = '0000000';
    //         let tempOrdinalNumber: number = -1;
    //         let currentYear: string = new Date().getUTCFullYear().toString();
    //         const dateCurrentStart= new Date(`${currentYear}-01-01`).toISOString();
    //         const dateCurrentEnd =new Date(`${currentYear}-12-31`).toISOString();
    //         const getArrGroupOrder = await this.groupOrderModel.find({
    //             city:city,
    //             date_create:{
    //                 $gte:dateCurrentStart,
    //                 $lt:dateCurrentEnd
    //             }
    //         }).sort({ordinal_number: -1 });

    //         if (getArrGroupOrder.length > 0) {
    //             tempOrdinalNumber = getArrGroupOrder[0].ordinal_number + 1;
    //         } else {
    //             tempOrdinalNumber = 1;
    //         }
    //         const tempCity = city > 10 ? city : `0${city}`;// nếu mã code tỉnh bé hơn 10 thì thêm số 0 đằng trước
    //         tempIdView = `${tempIdView}${tempOrdinalNumber}`
    //         tempIdView = tempIdView.slice(-7);
    //         tempIdView = `#${currentYear.slice(-2)}${tempCity}${tempIdView}`
    //         //////
    //         let calculateCodePromotion = {}
    //         if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
    //             payload.code_promotion !== "") {
    //             calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion, getCustomer);
    //         }
    //         const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, payload.id_customer);
    //         const loadcalculateFinalFee = {
    //             initial_fee: infoJob.initial_fee,
    //             code_promotion: (payload.code_promotion) ? calculateCodePromotion : null,
    //             event_promotion: calculateEventPromotion.event_promotion || [],
    //             service_fee: service_fee.service_fee,
    //             type: infoJob.type,
    //             tip_collaborator: payload.tip_collaborator || 0
    //         }
    //         let final_fee = await this.orderSystemService.calculateFinalFee(loadcalculateFinalFee)
    //         if (payload.payment_method === "point" && getCustomer.pay_point - final_fee < 0) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_CASH, lang, 'cash')], HttpStatus.BAD_REQUEST);
    //         }
    //         // const temp = final_fee - infoJob.initial_fee;
    //         let refund_money = 0;
    //         let pending_money = 0;
    //         // if (temp > 0) pending_money = Math.abs(temp)
    //         // if (temp < 0) refund_money = Math.abs(temp)
    //         // if (final_fee < 0) {
    //         //     final_fee = 0;
    //         // }
    //         final_fee = final_fee / 1000;
    //         final_fee = Math.round(final_fee) * 1000;
    //         for (const item of service_fee.service_fee) {
    //             pending_money += item.fee;
    //         }
    //         final_fee = (final_fee < 0) ? 0 : final_fee;
    //         refund_money = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion["discount"] : 0;
    //         for (const item of calculateEventPromotion.event_promotion) {
    //             refund_money += item.discount;
    //         }

    //         const newGroupOrder = new this.groupOrderModel({
    //             id_customer: getCustomer._id,
    //             id_order: [],
    //             lat: infoJob.lat || "",
    //             lng: infoJob.lng || "",
    //             address: infoJob.address || "",
    //             type_address_work: infoJob.type_address_work,
    //             note_address: infoJob.note_address,
    //             date_create: new Date(Date.now()).toISOString(),
    //             date_work_schedule: infoJob.date_work_schedule,
    //             next_time: null,
    //             time_schedule: (infoJob.type === "schedule") ? payload.time_schedule : null,
    //             is_auto_order: payload.is_auto_order,
    //             type: infoJob.type,
    //             code_promotion: (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion : null,
    //             event_promotion: calculateEventPromotion.event_promotion || [],
    //             initial_fee: infoJob.initial_fee,
    //             platform_fee: infoJob.platform_fee,
    //             net_income_collaborator: infoJob.net_income_collaborator,
    //             temp_net_income_collaborator: infoJob.net_income_collaborator,
    //             temp_initial_fee: infoJob.initial_fee,
    //             temp_platform_fee: infoJob.platform_fee,
    //             temp_pending_money: pending_money,
    //             temp_refund_money: refund_money,
    //             temp_final_fee: final_fee,
    //             service: infoJob.service,
    //             service_fee: service_fee.service_fee,
    //             total_estimate: infoJob.total_estimate,
    //             final_fee: final_fee,
    //             note: payload.note,
    //             convert_time: payload.convert_time || false,
    //             payment_method: payload.payment_method || "cash",
    //             city: city,
    //             district: district,
    //             id_view: tempIdView,
    //             ordinal_number: tempOrdinalNumber,
    //             id_favourite_collaborator: callPromiseAll[2].id_favourite_collaborator,
    //             id_block_collaborator: callPromiseAll[2].id_block_collaborator,
    //             phone_collaborator: null,
    //             name_collaborator: null,
    //             phone_customer: getCustomer.phone,
    //             name_customer: getCustomer.full_name,
    //             customer_version: version || '0',
    //             collaborator_version: '0',
    //             tip_collaborator: payload.tip_collaborator,
    //             date_tip_collaborator: payload.tip_collaborator > 0 ? new Date(Date.now()).toISOString() : null,
    //             day_loop: payload.day_loop,
    //             time_zone: payload.time_zone,
    //             timestamp: payload.timestamp
    //             // phần tạo cho nhiều CTV //
    //             // personal: 
    //             // kết thúc phần tạo cho nhiều CTV //
    //         })

    //         if (payload.id_collaborator && (payload.id_collaborator !== "" || payload.id_collaborator !== null)) {
    //             await this.collaboratorSystemService.checkCollaborator(lang, payload.id_collaborator, infoJob, pending_money);
    //         }
    //         const result = await newGroupOrder.save();
    //         if (result.type === 'loop') {
    //             result.personal === 1 ? await this.orderSystemService.processLoopOrder(result)
    //                 : await this.orderSystemService.processLoopOrderMultiple(result);
    //         }
    //         if (result.type === 'single') {
    //             await this.orderSystemService.processOrderSingle(result)
    //         }
    //         if (result.type === 'schedule') {
    //             await this.orderSystemService.processScheduleOrder(result)
    //             // this.activityCustomerSystemService.createNewGroupOrder(getCustomer._id, result._id, infoJob.service._id, null)
    //         }

    //         // if (payload.id_collaborator &&( payload.id_collaborator !== "" || payload.id_collaborator !== null)) {
    //         //     await this.activityCustomerSystemService.createNewGroupOrder(result.id_customer, result._id, result.service['id'], result._id)
    //         // }
    //         if (admin !== null && !payload.id_collaborator || payload.id_collaborator === null || payload.id_collaborator === "") {
    //             await this.activityAdminSystemService.createNewGroupOrder(getCustomer, result, result.service, admin)
    //         }
    //         if (admin === null) {
    //             await this.activityCustomerSystemService.createNewGroupOrder(result.id_customer, result._id, result.service['id'])
    //         }
    //         if (payload.payment_method === "point") {
    //             const findCustomer = await this.customerModel.findById(getCustomer._id);
    //             findCustomer.cash = findCustomer.cash - final_fee;
    //             findCustomer.pay_point = findCustomer.pay_point - final_fee;
    //             // this.activityCustomerSystemService.paymentMethodPayPoint(getCustomer, result, final_fee)

    //             // const timeZone = (payload.query.time_zone) ? payload.query.time_zone : 7;\
    //             const dateNow = new Date(Number(new Date(Date.now()).getTime()) + (7 * 60 * 60 * 1000));
    //             const getDate = dateNow.getUTCDate();
    //             const getMonth = dateNow.getUTCMonth();
    //             const getFullYear = dateNow.getUTCFullYear();
    //             let tempRandomID = await this.globalService.randomID(3)
    //             let transferNote = `${findCustomer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
    //             let checkDupTrans = await this.transitionCustomerModel.findOne({ id_view: transferNote });
    //             while (checkDupTrans) {
    //                 let tempRandomID = await this.globalService.randomID(3)
    //                 transferNote = `${findCustomer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
    //                 checkDupTrans = await this.transitionCustomerModel.findOne({ id_view: transferNote });
    //             }
    //             const newTransition = new this.transitionCustomerModel({
    //                 id_customer: findCustomer._id,
    //                 id_activity_history: null,
    //                 money: final_fee,
    //                 date_create: new Date(Date.now()).toISOString(),
    //                 transfer_note: transferNote,
    //                 type_transfer: "payment_service",
    //                 method_transfer: "pay_point",
    //                 status: "done",
    //                 id_view: transferNote,
    //                 payment_discount: 0
    //             })
    //             const newTrans = await newTransition.save();
    //             const findCustomer1 = await this.customerModel.findById(newTransition.id_customer);
    //             findCustomer1.pay_point -= Number(newTransition.money);
    //             await findCustomer1.save();
    //             this.activityCustomerSystemService.customerSuccessPayment(findCustomer1, result, newTrans, previousBalance);

    //             findCustomer.save();
    //         }
    //         // return result;
    //         // await newGroupOrder.save();
    //         // await this.setDefaultAddress(lang, user);
    //         if (getDefaultAddressCustomer.default_address = null) {
    //             this.setDefaultAddress(lang, getCustomer);
    //         }
    //         if (result.code_promotion !== null) {
    //             this.promotionService.increaseTotalUsedPromotionCode(lang, getCustomer, calculateCodePromotion);
    //         }
    //         if (result.event_promotion.length > 0) {
    //             this.promotionService.increaseTotalUsedPromotionEvent(lang, getCustomer, calculateEventPromotion.event_promotion);
    //         }
    //         // await this.promotionService.increaseTotalUsedCustomer(lang, user);
    //         const getGroupOrder = await this.groupOrderModel.findById(newGroupOrder._id);
    //         return getGroupOrder;
    //     }
    //     catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async createItem(lang, payload: createGroupOrderDTOAdmin, admin, version) {
        try {
            let checkAdmin = admin ? 'admin' : 'customer';
            const callPromiseAll = await Promise.all([
                this.calculateFeeGroupOrder(lang, payload, checkAdmin),
                // this.getServiceFee(lang, payload),
                this.customerRepositoryService.findOneById(payload.id_customer)
            ]);


            if (
                payload.tip_collaborator
                && (payload.tip_collaborator > 0 && callPromiseAll[0].type === 'schedule')
                //|| (payload.tip_collaborator > 0 && payload.is_auto_order === true)
            ) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'tip collaborator')], HttpStatus.BAD_REQUEST);
            }
            const infoJob = callPromiseAll[0];


            // const service_fee = callPromiseAll[1];
            const getDefaultAddressCustomer = callPromiseAll[1];
            const getCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);

            // const tempAddress = infoJob.address.split(",");
            // const administrative = {
            //     city: tempAddress[tempAddress.length - 1],
            //     district: tempAddress[tempAddress.length - 2]
            // }
            const previousBalance = {
                pay_point: getCustomer.pay_point
            }
            const callPromiseDistric = await Promise.all([
                this.generalHandleService.getCodeAdministrativeToString(infoJob.address),
                // this.serviceModel.findById(tempAddress.service["_id"])
            ]);
            const city: number = callPromiseDistric[0].city;
            const district: number = callPromiseDistric[0].district;
            // kiểm tra thông tin nếu thanh toán bằng G-Pay nếu ko đủ G-Pay sẽ trả lỗi
            await this.checkBalanceCustomer(lang, infoJob, getCustomer);
            // chặn tạo đơn ở các khu vực khác nếu ở trên admin 
            if (checkAdmin === 'admin') {
                const checkPermisstion = await this.globalService.checkPermissionArea(admin, city, district, callPromiseAll[0].service._id);
                if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
                }
            }
            // kết thúc chặn tạo đơn ở các khu vực khác nếu ở trên admin 

            ////// tạo mã group order 
            let tempIdView: string = '0000000';
            let tempOrdinalNumber: number = -1;
            let currentYear: string = new Date().getUTCFullYear().toString();
            const dateCurrentStart = new Date(`${currentYear}-01-01`).toISOString();
            const dateCurrentEnd = new Date(`${currentYear}-12-31`).toISOString();
            const getLastGroupOrder = await this.groupOrderModel.findOne({
                city: city,
                date_create: {
                    $gte: dateCurrentStart,
                    $lt: dateCurrentEnd
                }
            }).sort({ ordinal_number: -1 });
            if (getLastGroupOrder) {
                tempOrdinalNumber = getLastGroupOrder.ordinal_number + 1;
            } else {
                tempOrdinalNumber = 1;
            }
            // if (getArrGroupOrder.length > 0) {
            //     tempOrdinalNumber = getArrGroupOrder[0].ordinal_number + 1;
            // } else {
            //     tempOrdinalNumber = 1;
            // }
            const tempCity = city > 10 ? city : `0${city}`;// nếu mã code tỉnh bé hơn 10 thì thêm số 0 đằng trước
            tempIdView = `${tempIdView}${tempOrdinalNumber}`
            tempIdView = tempIdView.slice(-7);
            tempIdView = `#${currentYear.slice(-2)}${tempCity}${tempIdView}`
            //////
            // let calculateCodePromotion = {}
            // if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
            //     payload.code_promotion !== "") {
            //     calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion, getCustomer);
            // }
            // const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, payload.id_customer);
            // const loadcalculateFinalFee = {
            //     initial_fee: infoJob.initial_fee,
            //     code_promotion: infoJob.code_promotion || {},
            //     event_promotion: infoJob.event_promotion || [],
            //     service_fee: service_fee.service_fee,
            //     type: infoJob.type,
            //     tip_collaborator: payload.tip_collaborator || 0
            // }
            // let final_fee = await this.orderSystemService.calculateFinalFee(loadcalculateFinalFee)
            // if (payload.payment_method === "point" && getCustomer.pay_point - infoJob.final_fee < 0) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_CASH, lang, 'cash')], HttpStatus.BAD_REQUEST);
            // }
            // const temp = final_fee - infoJob.initial_fee;
            let refund_money = 0;
            let pending_money = 0;
            // if (temp > 0) pending_money = Math.abs(temp)
            // if (temp < 0) refund_money = Math.abs(temp)
            // if (final_fee < 0) {
            //     final_fee = 0;
            // }
            // final_fee = final_fee / 1000;
            // final_fee = Math.round(final_fee) * 1000;
            for (const item of infoJob.service_fee) {
                pending_money += item.fee;
            }
            // final_fee = (final_fee < 0) ? 0 : final_fee;
            // refund_money = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion["discount"] : 0;
            refund_money = (infoJob.code_promotion !== null) ? infoJob.code_promotion.discount : 0;

            for (const item of infoJob.event_promotion) {
                refund_money += item.discount;
            }

            const newGroupOrder = new this.groupOrderModel({
                id_customer: getCustomer._id,
                id_order: [],
                lat: infoJob.lat || "",
                lng: infoJob.lng || "",
                address: infoJob.address || "",
                type_address_work: infoJob.type_address_work,
                note_address: infoJob.note_address,
                date_create: new Date(Date.now()).toISOString(),
                date_work_schedule: infoJob.date_work_schedule,
                next_time: null,
                time_schedule: (infoJob.type === "schedule") ? payload.time_schedule : null,
                is_auto_order: payload.is_auto_order,
                type: infoJob.type,
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
                convert_time: payload.convert_time || false,
                payment_method: payload.payment_method || "cash",
                city: city,
                district: district,
                id_view: tempIdView,
                ordinal_number: tempOrdinalNumber,
                id_favourite_collaborator: callPromiseAll[1].id_favourite_collaborator,
                id_block_collaborator: callPromiseAll[1].id_block_collaborator,
                phone_collaborator: null,
                name_collaborator: null,
                phone_customer: getCustomer.phone,
                name_customer: getCustomer.full_name,
                customer_version: version || '0',
                collaborator_version: '0',
                tip_collaborator: infoJob.tip_collaborator,
                date_tip_collaborator: payload.tip_collaborator > 0 ? new Date(Date.now()).toISOString() : null,
                day_loop: payload.day_loop,
                time_zone: payload.time_zone,
                timestamp: payload.timestamp
                // phần tạo cho nhiều CTV //
                // personal: 
                // kết thúc phần tạo cho nhiều CTV //
            })

            if (payload.id_collaborator && (payload.id_collaborator !== "" || payload.id_collaborator !== null)) {
                await this.collaboratorSystemService.checkCollaborator(lang, payload.id_collaborator, infoJob, pending_money);
            }
            const result = await newGroupOrder.save();
            if (result.type === 'loop') {
                result.personal === 1 ? await this.orderSystemService.processLoopOrder(result)
                    : await this.orderSystemService.processLoopOrderMultiple(result);
            }
            if (result.type === 'single') {

                await this.orderSystemService.processOrderSingle(result)
            }
            if (result.type === 'schedule') {
                await this.orderSystemService.processScheduleOrder(result, infoJob)
                // this.activityCustomerSystemService.createNewGroupOrder(getCustomer._id, result._id, infoJob.service._id, null)
            }

            // if (payload.id_collaborator &&( payload.id_collaborator !== "" || payload.id_collaborator !== null)) {
            //     await this.activityCustomerSystemService.createNewGroupOrder(result.id_customer, result._id, result.service['id'], result._id)
            // }
            if (admin !== null) {
                const isNoAddCollaborator = (!payload.id_collaborator || payload.id_collaborator === null || payload.id_collaborator === "") ? false : true;
                await this.activityAdminSystemService.createNewGroupOrder(getCustomer, result, result.service, admin, isNoAddCollaborator)
                if (isNoAddCollaborator) {
                    await this.activityAdminSystemService.adminAssignCollaborator(admin, payload.id_collaborator, result);
                }
            }

            if (admin === null) {
                await this.activityCustomerSystemService.createNewGroupOrder(result.id_customer, result._id, result.service['_id'])
            }
            if (payload.payment_method === "point") {
                const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCustomer(getCustomer);
                const payload_transaction: createTransactionDTO = {
                    id_customer: getCustomer._id.toString(),
                    money: infoJob.final_fee,
                    status: 'pending',
                    subject: 'customer',
                    type_transfer: 'pay_service',
                    transfer_note: _transfer_note,
                    payment_in: "cash_book",
                    payment_out: "pay_point",
                    id_group_order: newGroupOrder._id
                }
                const transaction = await this.transactionSystemService.createItem(payload_transaction);
                // await this.activityCustomerSystemService.customerCreateTransaction(resultTransaction);
                await this.activitySystemService.createTransaction(transaction)
                const resultTransaction = await this.transactionSystemService.verifyTransaction(lang, transaction._id,)
                await this.activitySystemService.verifyTransactionPaymentService(resultTransaction.transaction, resultTransaction.customer, newGroupOrder, admin)
                // await this.activityCustomerSystemService.customerSuccessPayment(newCustomer, result, resultTransaction);
            }
            if (getDefaultAddressCustomer.default_address = null) {
                this.setDefaultAddress(lang, getCustomer);
            }
            if (result.code_promotion !== null) {
                this.promotionService.increaseTotalUsedPromotionCode(lang, getCustomer, infoJob.code_promotion);
            }
            if (result.event_promotion.length > 0) {
                this.promotionService.increaseTotalUsedPromotionEvent(lang, getCustomer, infoJob.event_promotion);
            }
            // await this.promotionService.increaseTotalUsedCustomer(lang, user);
            const getGroupOrder = await this.groupOrderRepositoryService.findOneById(newGroupOrder._id);
            return getGroupOrder;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItemQueue(lang, infoJob, payload: createGroupOrderDTOAdmin, admin, version) {
        try {
            let checkAdmin = admin ? 'admin' : 'customer';
            const callPromiseAll = await Promise.all([
                // this.calculateFeeGroupOrder(lang, payload, checkAdmin),
                // this.getServiceFee(lang, payload),
                this.customerRepositoryService.findOneById(payload.id_customer)
            ]);

            if (payload.tip_collaborator && (payload.tip_collaborator > 0 && infoJob.type === 'schedule') || (payload.tip_collaborator > 0 && payload.is_auto_order === true)) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'tip collaborator')], HttpStatus.BAD_REQUEST);
            }
            // const infoJob = callPromiseAll[0];
            // const service_fee = callPromiseAll[1];
            const getDefaultAddressCustomer = callPromiseAll[0];
            const getCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);
            // const tempAddress = infoJob.address.split(",");
            // const administrative = {
            //     city: tempAddress[tempAddress.length - 1],
            //     district: tempAddress[tempAddress.length - 2]
            // }
            const previousBalance = {
                pay_point: getCustomer.pay_point
            }
            const callPromiseDistric = await Promise.all([
                this.generalHandleService.getCodeAdministrativeToString(infoJob.address),
                // this.serviceModel.findById(tempAddress.service["_id"])
            ]);
            const city: number = callPromiseDistric[0].city;
            const district: number = callPromiseDistric[0].district;

            // chặn tạo đơn ở các khu vực khác nếu ở trên admin 
            if (checkAdmin === 'admin') {
                const checkPermisstion = await this.globalService.checkPermissionArea(admin, city, district, infoJob.service._id);
                if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
                }
            }
            // kết thúc chặn tạo đơn ở các khu vực khác nếu ở trên admin 

            ////// tạo mã group order 
            let tempIdView: string = '0000000';
            let tempOrdinalNumber: number = -1;
            let currentYear: string = new Date().getUTCFullYear().toString();
            const dateCurrentStart = new Date(`${currentYear}-01-01`).toISOString();
            const dateCurrentEnd = new Date(`${currentYear}-12-31`).toISOString();
            const getArrGroupOrder = await this.groupOrderModel.find({
                city: city,
                date_create: {
                    $gte: dateCurrentStart,
                    $lt: dateCurrentEnd
                }
            }).sort({ ordinal_number: -1 });

            if (getArrGroupOrder.length > 0) {
                tempOrdinalNumber = getArrGroupOrder[0].ordinal_number + 1;
            } else {
                tempOrdinalNumber = 1;
            }
            const tempCity = city > 10 ? city : `0${city}`;// nếu mã code tỉnh bé hơn 10 thì thêm số 0 đằng trước
            tempIdView = `${tempIdView}${tempOrdinalNumber}`
            tempIdView = tempIdView.slice(-7);
            tempIdView = `#${currentYear.slice(-2)}${tempCity}${tempIdView}`
            //////
            // let calculateCodePromotion = {}
            // if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
            //     payload.code_promotion !== "") {
            //     calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion, getCustomer);
            // }
            // const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, payload.id_customer);
            // const loadcalculateFinalFee = {
            //     initial_fee: infoJob.initial_fee,
            //     code_promotion: infoJob.code_promotion || {},
            //     event_promotion: infoJob.event_promotion || [],
            //     service_fee: service_fee.service_fee,
            //     type: infoJob.type,
            //     tip_collaborator: payload.tip_collaborator || 0
            // }
            // let final_fee = await this.orderSystemService.calculateFinalFee(loadcalculateFinalFee)
            // if (payload.payment_method === "point" && getCustomer.pay_point - infoJob.final_fee < 0) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_CASH, lang, 'cash')], HttpStatus.BAD_REQUEST);
            // }
            // const temp = final_fee - infoJob.initial_fee;
            let refund_money = 0;
            let pending_money = 0;
            // if (temp > 0) pending_money = Math.abs(temp)
            // if (temp < 0) refund_money = Math.abs(temp)
            // if (final_fee < 0) {
            //     final_fee = 0;
            // }
            // final_fee = final_fee / 1000;
            // final_fee = Math.round(final_fee) * 1000;
            for (const item of infoJob.service_fee) {
                pending_money += item.fee;
            }
            // final_fee = (final_fee < 0) ? 0 : final_fee;
            // refund_money = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion["discount"] : 0;
            refund_money = (infoJob.code_promotion !== null) ? infoJob.code_promotion.discount : 0;

            for (const item of infoJob.event_promotion) {
                refund_money += item.discount;
            }

            const newGroupOrder = new this.groupOrderModel({
                id_customer: getCustomer._id,
                id_order: [],
                lat: infoJob.lat || "",
                lng: infoJob.lng || "",
                address: infoJob.address || "",
                type_address_work: infoJob.type_address_work,
                note_address: infoJob.note_address,
                date_create: new Date(Date.now()).toISOString(),
                date_work_schedule: infoJob.date_work_schedule,
                next_time: null,
                time_schedule: (infoJob.type === "schedule") ? payload.time_schedule : null,
                is_auto_order: payload.is_auto_order,
                type: infoJob.type,
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
                convert_time: payload.convert_time || false,
                payment_method: payload.payment_method || "cash",
                city: city,
                district: district,
                id_view: tempIdView,
                ordinal_number: tempOrdinalNumber,
                id_favourite_collaborator: callPromiseAll[0].id_favourite_collaborator,
                id_block_collaborator: callPromiseAll[0].id_block_collaborator,
                phone_collaborator: null,
                name_collaborator: null,
                phone_customer: getCustomer.phone,
                name_customer: getCustomer.full_name,
                customer_version: version || '0',
                collaborator_version: '0',
                tip_collaborator: infoJob.tip_collaborator,
                date_tip_collaborator: payload.tip_collaborator > 0 ? new Date(Date.now()).toISOString() : null,
                day_loop: payload.day_loop,
                time_zone: payload.time_zone,
                timestamp: payload.timestamp
                // phần tạo cho nhiều CTV //
                // personal: 
                // kết thúc phần tạo cho nhiều CTV //
            })

            if (payload.id_collaborator && (payload.id_collaborator !== "" || payload.id_collaborator !== null)) {
                await this.collaboratorSystemService.checkCollaborator(lang, payload.id_collaborator, infoJob, pending_money);
            }
            const result = await newGroupOrder.save();

            if (result.type === 'loop') {
                result.personal === 1 ? await this.orderSystemService.processLoopOrder(result)
                    : await this.orderSystemService.processLoopOrderMultiple(result);
            }
            if (result.type === 'single') {
                await this.orderSystemService.processOrderSingle(result)
            }
            if (result.type === 'schedule') {
                await this.orderSystemService.processScheduleOrder(result, infoJob)
                // this.activityCustomerSystemService.createNewGroupOrder(getCustomer._id, result._id, infoJob.service._id, null)
            }

            // if (payload.id_collaborator &&( payload.id_collaborator !== "" || payload.id_collaborator !== null)) {
            //     await this.activityCustomerSystemService.createNewGroupOrder(result.id_customer, result._id, result.service['id'], result._id)
            // }
            if (admin !== null) {
                const isNoAddCollaborator = (!payload.id_collaborator || payload.id_collaborator === null || payload.id_collaborator === "") ? false : true;
                await this.activityAdminSystemService.createNewGroupOrder(getCustomer, result, result.service, admin, isNoAddCollaborator)
            }
            if (admin === null) {
                await this.activityCustomerSystemService.createNewGroupOrder(result.id_customer, result._id, result.service['id'])
            }
            if (payload.payment_method === "point") {
                const findCustomer = await this.customerRepositoryService.findOneById(getCustomer._id);
                findCustomer.cash = findCustomer.cash - infoJob.final_fee;
                findCustomer.pay_point = findCustomer.pay_point - infoJob.final_fee;
                // this.activityCustomerSystemService.paymentMethodPayPoint(getCustomer, result, final_fee)

                // const timeZone = (payload.query.time_zone) ? payload.query.time_zone : 7;\
                const dateNow = new Date(Number(new Date(Date.now()).getTime()) + (7 * 60 * 60 * 1000));
                const getDate = dateNow.getUTCDate();
                const getMonth = dateNow.getUTCMonth();
                const getFullYear = dateNow.getUTCFullYear();
                let tempRandomID = await this.globalService.randomID(3)
                let transferNote = `${findCustomer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
                let checkDupTrans = await this.transitionCustomerModel.findOne({ id_view: transferNote });
                while (checkDupTrans) {
                    let tempRandomID = await this.globalService.randomID(3)
                    transferNote = `${findCustomer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
                    checkDupTrans = await this.transitionCustomerModel.findOne({ id_view: transferNote });
                }
                const newTransition = new this.transitionCustomerModel({
                    id_customer: findCustomer._id,
                    id_activity_history: null,
                    money: infoJob.final_fee,
                    date_create: new Date(Date.now()).toISOString(),
                    transfer_note: transferNote,
                    type_transfer: "payment_service",
                    method_transfer: "pay_point",
                    status: "done",
                    id_view: transferNote,
                    payment_discount: 0
                })
                const newTrans = await newTransition.save();
                const findCustomer1 = await this.customerRepositoryService.findOneById(newTransition.id_customer.toString());
                findCustomer1.pay_point -= Number(newTransition.money);
                await findCustomer1.save();
                await this.customerRepositoryService.findByIdAndUpdate(newTransition.id_customer.toString(), findCustomer1);
                this.activityCustomerSystemService.customerSuccessPayment(findCustomer1, result, newTrans);

                await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, findCustomer);
            }
            // return result;
            // await newGroupOrder.save();
            // await this.setDefaultAddress(lang, user);
            if (getDefaultAddressCustomer.default_address = null) {
                this.setDefaultAddress(lang, getCustomer);
            }
            if (result.code_promotion !== null) {
                this.promotionService.increaseTotalUsedPromotionCode(lang, getCustomer, infoJob.code_promotion);
            }
            if (result.event_promotion.length > 0) {
                this.promotionService.increaseTotalUsedPromotionEvent(lang, getCustomer, infoJob.event_promotion);
            }
            // await this.promotionService.increaseTotalUsedCustomer(lang, user);
            const getGroupOrder = await this.groupOrderModel.findById(newGroupOrder._id);
            return getGroupOrder;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async createLoopGroupOrder(lang, groupOrder: GroupOrderDocument) { // cần làm lại
        try {
            const currentDate = new Date(groupOrder.date_work_schedule[0].date).getTime();
            let nextDate;
            //////////////////// tính toán ngày tạo đơn tiếp theo của đơn lặp lại ////////////////
            if (groupOrder.day_loop) {
                if (groupOrder.day_loop.length > 0) {
                    const activeDay = await this.generalHandleService.formatDateWithTimeZone(new Date(groupOrder.date_work_schedule[0].date), groupOrder.time_zone ? groupOrder.time_zone : 'Asia/Ho_Chi_Minh')
                    let tempArrDayLoop = await this.generalHandleService.removeDuplicateValueArr(groupOrder.day_loop);
                    let arrDayLoop = tempArrDayLoop.sort((a, b) => a - b)
                    if (arrDayLoop[0] === 0) {
                        arrDayLoop.shift();
                        arrDayLoop.push(0);
                    }
                    let nextDay = undefined;

                    for (let i = 0; i < arrDayLoop.length; i++) {
                        if (arrDayLoop[i] === 0) {
                            nextDay = 0;
                            break;
                        } else if (arrDayLoop[i] > activeDay.day_of_week) {
                            nextDay = arrDayLoop[i];
                            break;
                        } else if (i === arrDayLoop.length - 1) {
                            nextDay = arrDayLoop[0];
                            break;
                        }
                    }
                    if (nextDay === 0) {
                        nextDate = nextSunday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 1) {
                        nextDate = nextMonday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 2) {
                        nextDate = nextTuesday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 3) {
                        nextDate = nextWednesday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 4) {
                        nextDate = nextThursday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 5) {
                        nextDate = nextFriday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 6) {
                        nextDate = nextSaturday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else {
                        nextDate = new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString();
                    }
                } else {
                    nextDate = new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString();
                }
            } else {
                nextDate = new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString();
            }
            //////////////////// kết thúc tính toán ngày tạo đơn tiếp theo của đơn lặp lại ////////////////

            const arrExtend: any = [];
            for (const optional of groupOrder.service.optional_service) {
                for (const extend of optional.extend_optional) {
                    arrExtend.push({
                        _id: extend._id.toString(),
                        count: Number(extend.count)
                    })
                }
            }
            const getCustomer = await this.customerRepositoryService.findOneById(groupOrder.id_customer.toString());
            const address = {
                lat: groupOrder.lat,
                lng: groupOrder.lng,
                address: groupOrder.address,
                type_address_work: groupOrder.type_address_work,
                note_address: groupOrder.note_address
            }
            const token = await this.globalService.encryptObject(address);
            const newPayload: createGroupOrderDTOAdmin = {
                token: token,
                date_work_schedule: [nextDate],
                is_auto_order: groupOrder.is_auto_order,
                time_schedule: null,
                code_promotion: "",
                extend_optional: arrExtend,
                note: groupOrder.note,
                payment_method: groupOrder.payment_method,
                id_customer: getCustomer._id,
                day_loop: groupOrder.day_loop,
                time_zone: groupOrder.time_zone
            }
            const infoJob = await this.calculateFeeGroupOrder(lang, newPayload);
            if (groupOrder.code_promotion && groupOrder.code_promotion["code"]) {
                const checkCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, groupOrder.code_promotion["code"], getCustomer, "system");
                newPayload.code_promotion = (checkCodePromotion !== null) ? checkCodePromotion.code : "";
            }
            const createGroupOrder = await this.createItem(lang, newPayload, null, 0)
            return true;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    // async createItem(lang, payload: createGroupOrderDTOCustomer, user) {
    //     try {
    //         const infoJob = await this.calculateFeeGroupOrder(lang, payload);
    //         let calculateCodePromotion = {}
    //         if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
    //             payload.code_promotion !== "") {
    //             calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion);
    //         }
    //         const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, user);
    //         const service_fee = await this.getServiceFee(lang, payload, user);

    //         // let discount_event_promotion = 0;
    //         // let final_fee = Number(infoJob.initial_fee) - Number(calculateCodePromotion['discount'] | 0);

    //         // for(let i = 0 ; i < calculateEventPromotion.event_promotion.length ; i++) {
    //         //     final_fee = final_fee - Number(calculateEventPromotion.event_promotion[i].discount);
    //         // }
    //         // for(let i = 0 ; i < service_fee.service_fee.length ; i++) {
    //         //     final_fee = final_fee + Number(service_fee.service_fee[i].fee)
    //         // }

    //         const getDefaultAddressCustomer = await this.authService.getInfoByToken(lang, user);

    //         const newGroupOrder = new this.groupOrderModel({
    //             id_customer: user._id,
    //             id_order: [],
    //             lat: infoJob.lat || "",
    //             lng: infoJob.lng || "",
    //             address: infoJob.address || "",
    //             date_create: new Date(Date.now()).toISOString(),
    //             date_work_schedule: infoJob.date_work_schedule,
    //             next_time: null,
    //             time_schedule: (infoJob.type === "schedule") ? payload.time_schedule : null,
    //             is_auto_order: payload.is_auto_order,
    //             status: payload.status,
    //             type: infoJob.type,
    //             code_promotion: (payload.code_promotion) ? calculateCodePromotion : null,
    //             event_promotion: calculateEventPromotion.event_promotion || [],
    //             initial_fee: infoJob.initial_fee,
    //             service: infoJob.service,
    //             service_fee: service_fee.service_fee,
    //             total_estimate: infoJob.total_estimate,
    //             final_fee: 0,
    //             note: payload.note
    //         })
    //         const result = await newGroupOrder.save();

    //         if (result.type === 'loop') {
    //             await this.orderSystemService.processLoopOrder(result._id)
    //         }
    //         if (result.type === 'single') {
    //             await this.orderSystemService.processOrderSingle(result._id)
    //         }

    //         // return result;
    //         await newGroupOrder.save();
    //         await this.setDefaultAddress(lang, user);

    //         if (getDefaultAddressCustomer.default_address = null) {
    //             await this.setDefaultAddress(lang, user);
    //         }
    //         if(result.code_promotion !== null) {
    //             await this.promotionService.increaseTotalUsedPromotionCode(lang, user, calculateCodePromotion);
    //         }
    //         if(result.event_promotion.length > 0) {
    //             await this.promotionService.increaseTotalUsedPromotionEvent(lang, user, calculateEventPromotion.event_promotion);
    //         }

    //         // await this.promotionService.increaseTotalUsedCustomer(lang, user);

    //         const getGroupOrder = await this.groupOrderModel.findById(newGroupOrder._id);
    //         return getGroupOrder;
    //     }
    //     catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    async setDefaultAddress(lang, user) {
        try {
            const groupOrderAddress = await this.getAddressLastOrder(lang, user)
            const getDefaultAddressCustomer = await this.getInfoByToken(lang, user);
            if (!getDefaultAddressCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getDefaultAddressCustomer.default_address = groupOrderAddress.data
            return await getDefaultAddressCustomer.save()
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getAddressLastOrder(lang, user) {
        try {
            const arrItem = await this.groupOrderModel.findOne({ id_customer: user._id }).sort({ date_create: -1 }).then();
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

    async getServiceFee(lang, payload: createGroupOrderDTOCustomer) {
        try {
            // const convertToken = await this.globalService.decryptObject(payload.token);
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

    async calculateFeeGroupOrder(lang, payload: createGroupOrderDTOCustomer, checkAdmin?: string) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: payload.type_address_work || "house",
                note_address: ""
            };
            if (payload.extend_optional.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
            if (!payload.token) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
            if (payload.date_work_schedule.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_EMPTY, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);

            if (payload.token) {
                const temp = await this.globalService.decryptObject(payload.token);
                convertToken.lat = temp.lat
                convertToken.lng = temp.lng
                convertToken.address = temp.address
            }
            const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);

            payload.date_work_schedule.sort()
            const listExtendOptionalPromise = []; // mảng chứa extendOptional
            const listOptionalServicePromise = []; // mảng chứa Optional service


            for (let i = 0; i < payload.extend_optional.length; i++) {
                listExtendOptionalPromise.push(await this.extendOptionalService.getDetailExtendOptional(lang, payload.extend_optional[i]._id));
            }
            const arrExtendOptional = await Promise.all(listExtendOptionalPromise);
            for (const item of arrExtendOptional) {
                listOptionalServicePromise.push(await this.optionalServiceService.getDetailOptionalService(lang, item.id_optional_service));
            }
            let arrOptionalService = await Promise.all(listOptionalServicePromise);

            const checkInvalidOptional = arrOptionalService.filter(item => item.id_service !== arrOptionalService[0].id_service);
            if (checkInvalidOptional.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);

            // lọc bỏ các Optional Service trùng lặp
            arrOptionalService = arrOptionalService.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t._id.toString() === value._id.toString()
                ))
            )
            let mainOptionalService = null;

            const tempOptionalServiceInOrder = [];
            for (const item of arrOptionalService) {
                tempOptionalServiceInOrder.push({
                    _id: item._id,
                    type: item.type,
                    title: item.title,
                    description: item.description,
                    position: item.position,
                    screen: item.screen,
                    extend_optional: []
                })
            }
            for (const item of arrExtendOptional) {
                const index = tempOptionalServiceInOrder.findIndex(a => a._id.toString() === item.id_optional_service.toString());

                // neu optional_service thuoc dich vu may lanh hoac ve sinh sofa thi cho phep nhap so luong
                let count = item.count;
                if (tempOptionalServiceInOrder[index].type === "multi_select_count_ac" || tempOptionalServiceInOrder[index].type === "multi_select_count_sofa" || tempOptionalServiceInOrder[index].type === "multi_select_count_wm") {
                    const countInPayload = payload.extend_optional.filter(x => x._id.toString() === item._id.toString())
                    if (countInPayload.length > 0) count = countInPayload[0].count;
                }


                const tempPayloadExtend = {
                    _id: item._id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    platform_fee: item.platform_fee,
                    area_fee: item.area_fee,
                    PriceIncreaseRushDays: [],
                    priceIncreaseHoliday: null,
                    estimate: item.estimate,
                    count: count,
                    personal: item.personal || 1,
                    id_extend_optional: item.id_extend_optional
                }
                tempOptionalServiceInOrder[index].extend_optional.push(tempPayloadExtend)

                // tempOptionalServiceInOrder[index].extend_optional.push(Object.assign(item, {PriceIncreaseRushDays: [], priceIncreaseHoliday: null, count:count}))
            }


            for (const item of tempOptionalServiceInOrder) {
                if (item.position === 0 && item.screen === 1) {
                    mainOptionalService = item;
                }
            }


            const getService = await this.serviceService.getDetailService(lang, arrOptionalService[0].id_service);

            const service = {
                _id: getService._id,
                id_service: getService._id,
                type_partner: getService.type_partner,
                time_schedule: (getService.type === "schedule") ? payload.time_schedule : null,
                optional_service: tempOptionalServiceInOrder
            }


            const infoJob: any = {
                lat: convertToken.lat,
                lng: convertToken.lng,
                address: convertToken.address,
                type_address_work: convertToken.type_address_work,
                note_address: convertToken.note_address,
                service: JSON.parse(JSON.stringify(service)),
                type: getService.type,
                city: getCodeAdministrative.city,
                district: getCodeAdministrative.district,
                tip_collaborator: payload.tip_collaborator || 0 * payload.date_work_schedule.length,
                payment_method: payload.payment_method,
                personal: (mainOptionalService !== null) ? mainOptionalService.extend_optional[0].personal : 1,
                total_estimate: (mainOptionalService !== null) ? mainOptionalService.extend_optional[0].estimate : 0,
                initial_fee: 0,
                total_fee: 0,
                platform_fee: 0,
                final_fee: 0,
                net_income_collaborator: 0,
                date_work_schedule: [],
                code_promotion: null,
                event_promotion: []
            }

            // reset gia de lay gia tong cho group order
            for (let y = 0; y < infoJob.service.optional_service.length; y++) {
                for (let z = 0; z < infoJob.service.optional_service[y].extend_optional.length; z++) {
                    infoJob.service.optional_service[y].extend_optional[z].price = 0
                    infoJob.service.optional_service[y].extend_optional[z].platform_fee = 0
                }
            }


            // bat dau tinh gia
            const temp_date_work = [];
            for (let i = 0; i < payload.date_work_schedule.length; i++) {
                let payloadItemDateWork = {
                    // total_fee: 0,
                    initial_fee: 0,
                    platform_fee: 0,
                    // final_fee: 0,
                    // service_fee: 0,
                    service: JSON.parse(JSON.stringify(service)),
                    date: payload.date_work_schedule[i],
                    is_rush_time: false
                }

                for (let y = 0; y < payloadItemDateWork.service.optional_service.length; y++) {
                    for (let z = 0; z < payloadItemDateWork.service.optional_service[y].extend_optional.length; z++) {
                        const itemExtendOptional = payloadItemDateWork.service.optional_service[y].extend_optional[z]

                        let priceUp = itemExtendOptional.price * itemExtendOptional.count;
                        let basePrice = priceUp;
                        let priceArea = 0;
                        let PriceIncreaseRushDays = []; // hien thi chi tiet
                        let priceIncreaseHoliday = null;
                        let percent_platform_fee = itemExtendOptional.platform_fee || 0;

                        const filterArrItemAreaFee = itemExtendOptional.area_fee.filter(a => a.area_lv_1 === getCodeAdministrative.city)

                        if (filterArrItemAreaFee.length > 0) {
                            const findItemAreaFee = filterArrItemAreaFee[0];

                            percent_platform_fee = findItemAreaFee.platform_fee;
                            // thay doi gia base theo khu vuc
                            const findIndexAreaLv2 = findItemAreaFee.area_lv_2.findIndex(x => x.area_lv_2.includes(getCodeAdministrative.district))
                            if (findIndexAreaLv2 > -1) {
                                let temp = 0;

                                if (findItemAreaFee.price_type_increase === "amount") {
                                    temp = findItemAreaFee.area_lv_2[findIndexAreaLv2].price;
                                } else if (findItemAreaFee.price_type_increase === "amount_by_root") {
                                    temp = itemExtendOptional.price + findItemAreaFee.area_lv_2[findIndexAreaLv2].price;
                                } else { // percent_by_root
                                    temp = itemExtendOptional.price * (findItemAreaFee.area_lv_2[findIndexAreaLv2].price / 100);
                                }
                                if (temp > 0) {
                                    priceArea = Math.ceil(temp * itemExtendOptional.count / 1000) * 1000;
                                    basePrice = priceArea;
                                    priceUp = priceArea;
                                }
                            } else {

                                let temp = 0;
                                if (findItemAreaFee.price_type_increase === "amount") {
                                    temp = findItemAreaFee.price;
                                } else if (findItemAreaFee.price_type_increase === "amount_by_root") {
                                    temp = itemExtendOptional.price + findItemAreaFee.price;
                                } else { // percent_by_root
                                    temp = itemExtendOptional.price * (findItemAreaFee.price / 100);
                                }

                                if (temp > 0) {
                                    priceArea = Math.ceil(temp * itemExtendOptional.count / 1000) * 1000;
                                    basePrice = priceArea;
                                    priceUp = priceArea;
                                }
                            }

                            // Tang gia theo ngay gio cao diem
                            for (const itemRushDay of findItemAreaFee.price_option_rush_day) {
                                const dayWork = new Date(payload.date_work_schedule[i]);
                                let dayCompare = Number(dayWork.getTime()) + (itemRushDay.time_zone_apply * 60 * 60 * 1000);
                                const dayOfWeek = new Date(dayCompare).getDay();
                                const getDay = payload.date_work_schedule[i].split("T")[0];
                                const timeStart = new Date(getDay + "T" + itemRushDay.start_time).getTime()
                                const endTime = new Date(getDay + "T" + itemRushDay.end_time).getTime()
                                if (itemRushDay.rush_days.findIndex(x => dayOfWeek === x) > -1 && timeStart < (dayCompare + 1) && (dayCompare - 1) < endTime) {
                                    let temp = 0;
                                    if (itemRushDay.price_type_increase === "percent_accumulate") {
                                        temp = priceUp * (itemRushDay.price / 100) || 0;
                                    }
                                    temp = (temp > 0) ? Math.ceil(temp / 1000) * 1000 : 0;
                                    priceUp += Math.ceil(temp);
                                    PriceIncreaseRushDays.push(Object.assign(itemRushDay, { fee: temp }))

                                }
                            }
                            // Tang gia theo ngay le
                            for (const itemRushHoliday of findItemAreaFee.price_option_holiday) {
                                const dateCompare = new Date(payload.date_work_schedule[i]).getTime();
                                const timeStart = new Date(itemRushHoliday.time_start).getTime();
                                const timeEnd = new Date(itemRushHoliday.time_end).getTime();
                                let temp = 0;
                                if (timeStart < dateCompare && dateCompare < timeEnd) {

                                    if (itemRushHoliday.price_type_increase === "percent_accumulate") {
                                        temp = priceUp * (itemRushHoliday.price / 100) || 0;

                                    }
                                    priceUp += Math.ceil(temp);
                                    priceIncreaseHoliday = Object.assign(itemRushHoliday, { fee: temp });
                                    break;
                                }
                            }
                        }

                        let tempPlatformFee = Math.ceil(Number(priceUp) * (Number(percent_platform_fee) / 100))
                        tempPlatformFee = Math.round(tempPlatformFee / 100)
                        tempPlatformFee = tempPlatformFee * 100;
                        let tempPriceUp = Math.ceil(priceUp / 1000)

                        // neu initial_fee k chia dc cho so nguoi lam viec, + len de cho tron so

                        while (mainOptionalService !== null && tempPriceUp % mainOptionalService.extend_optional[0].personal !== 0) {
                            tempPriceUp += 1
                        }
                        tempPriceUp = tempPriceUp * 1000
                        payloadItemDateWork.service.optional_service[y].extend_optional[z].price = tempPriceUp;
                        payloadItemDateWork.service.optional_service[y].extend_optional[z].platform_fee = tempPlatformFee

                        payloadItemDateWork.initial_fee += tempPriceUp;
                        payloadItemDateWork.platform_fee += tempPlatformFee

                        infoJob.initial_fee += tempPriceUp;
                        infoJob.platform_fee += tempPlatformFee

                        infoJob.service.optional_service[y].extend_optional[z].price += tempPriceUp;
                        infoJob.service.optional_service[y].extend_optional[z].platform_fee += tempPriceUp;
                        if (PriceIncreaseRushDays.length > 0 || priceIncreaseHoliday !== null) payloadItemDateWork.is_rush_time = true;
                    }
                }

                infoJob.date_work_schedule.push(payloadItemDateWork)
            }

            infoJob.net_income_collaborator = infoJob.initial_fee - infoJob.platform_fee;

            // phi dich vu duoc tinh cho ngay lam dau tien
            const service_fee = await this.getServiceFee(lang, payload);
            // tinh gia tri khuyen mai

            let calculateCodePromotion = null;
            if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
                payload.code_promotion !== "") {
                calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion, findCustomer);
            }
            const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, payload.id_customer);

            const loadcalculateFinalFee = {
                initial_fee: infoJob.initial_fee,
                code_promotion: calculateCodePromotion,
                event_promotion: calculateEventPromotion.event_promotion || [],
                service_fee: service_fee.service_fee,
                type: infoJob.type,
                tip_collaborator: payload.tip_collaborator || 0
            }
            let final_fee = await this.orderSystemService.calculateFinalFee(loadcalculateFinalFee)
            final_fee = final_fee / 1000;
            final_fee = Math.round(final_fee) * 1000;
            final_fee = (final_fee < 0) ? 0 : final_fee;
            infoJob.final_fee = final_fee
            infoJob.code_promotion = calculateCodePromotion
            infoJob.event_promotion = calculateEventPromotion.event_promotion || []
            infoJob.service_fee = service_fee.service_fee
            infoJob.total_fee = infoJob.initial_fee + (loadcalculateFinalFee.tip_collaborator * temp_date_work.length);
            for (const item of service_fee.service_fee) {
                infoJob.total_fee += item.fee
            }

            // sap xep lai data trong extend 
            for (let i = 0; i < infoJob.service.optional_service.length; i++) {
                infoJob.service.optional_service[i].extend_optional = await this.generalHandleService.sortExtendInIdExtend(infoJob.service.optional_service[i].extend_optional)
            }
            for (let i = 0; i < infoJob.date_work_schedule.length; i++) {
                for (let y = 0; y < infoJob.date_work_schedule[i].service.optional_service.length; y++) {
                    infoJob.date_work_schedule[i].service.optional_service[y].extend_optional = await this.generalHandleService.sortExtendInIdExtend(infoJob.date_work_schedule[i].service.optional_service[y].extend_optional)
                }
            }
            return infoJob;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async calculateFeeGroupOrderBackup(lang, payload: createGroupOrderDTOCustomer, checkAdmin?: string) {
        try {
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: payload.type_address_work || "house",
                note_address: ""
            };
            if (payload.extend_optional.length === 0) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
            }
            if (!payload.token) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
            }
            if (payload.token) {
                const temp = await this.globalService.decryptObject(payload.token);
                convertToken.lat = temp.lat
                convertToken.lng = temp.lng
                convertToken.address = temp.address
            }
            const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);

            payload.date_work_schedule.sort()
            const temp = []; // mảng chứa extendOptional
            const temp2 = []; // mảng chứa Optional service
            const temp3 = [];
            let initial_fee = 0;
            let net_income_collaborator = 0;
            let platform_fee = 0;
            let total_estimate = 0;
            let personal = 1;
            const temp_date_work = [];
            if (payload.date_work_schedule.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_EMPTY, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
            for (let i = 0; i < payload.date_work_schedule.length; i++) {
                temp_date_work.push({
                    status: "pending",
                    date: payload.date_work_schedule[i],
                    initial_fee: 0,
                    net_income_collaborator: 0,
                    platform_fee: 0,
                    is_rush_time: false
                })
            }
            for (let i = 0; i < payload.extend_optional.length; i++) {
                temp.push(await this.extendOptionalService.getDetailExtendOptional(lang, payload.extend_optional[i]._id));
            }
            const arrExtendOptional = await Promise.all(temp);
            for (const item of arrExtendOptional) {
                temp2.push(await this.optionalServiceService.getDetailOptionalService(lang, item.id_optional_service));
            }
            let arrOptionalService = await Promise.all(temp2);
            arrOptionalService = arrOptionalService.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t._id.toString() === value._id.toString()
                ))
            )
            let mainOptionalService = "";
            const idService = arrOptionalService[0].id_service;
            const getService = await this.serviceService.getDetailService(lang, idService);
            const dateNow = new Date().getTime();
            const firstDateWork = new Date(payload.date_work_schedule[0]).getTime();
            if ((checkAdmin && checkAdmin !== "admin") && ((firstDateWork - dateNow) < (getService.minimum_time_order * 3600000))) throw new HttpException([await this.customExceptionService.i18nError(ERROR.FIRST_DATE_WORK_OUT_DATE, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);

            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'date_work_schedule')], HttpStatus.NOT_FOUND);
            if (getService.type !== "schedule") {
                if (payload.date_work_schedule.length > 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_INVALID, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
            }
            if (getService._id.toString() === "644b7a344ea67acef3f02def" && getCodeAdministrative.city !== 79 && checkAdmin !== 'admin') {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADDRESS_NOT_SUPPORT, lang, 'address')], HttpStatus.BAD_REQUEST);
            }
            for (let i = 0; i < arrOptionalService.length; i++) {
                if (arrOptionalService[i].position === 0 && arrOptionalService[i].screen === 1) {
                    mainOptionalService = arrOptionalService[i]._id;
                }
                if (idService !== arrOptionalService[i].id_service) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
                }
                const tempArrExtendOfOptional = [];

                for (let y = 0; y < arrExtendOptional.length; y++) {
                    if (arrExtendOptional[y].id_optional_service === arrOptionalService[i]._id.toString()) {

                        const count = (arrOptionalService[i].type === "multi_select_count_ac" || arrOptionalService[i].type === "multi_select_count_sofa" || arrOptionalService[i].type === "multi_select_count_wm") ?
                            payload.extend_optional[y].count : arrExtendOptional[y].count;

                        tempArrExtendOfOptional.push({
                            _id: arrExtendOptional[y]._id,
                            title: arrExtendOptional[y].title,
                            description: arrExtendOptional[y].description,
                            price: arrExtendOptional[y].price,
                            count: count,
                            estimate: arrExtendOptional[y].estimate,
                            platform_fee: 0,
                            personal: arrExtendOptional[y].personal || 1
                        })
                        for (let z = 0; z < temp_date_work.length; z++) {
                            let priceUp = arrExtendOptional[y].price * count;
                            let maxPriceArea = 0;
                            let maxPriceRushDays = [];
                            let maxPriceRushDay = 0;
                            let maxPriceHoliday = 0;
                            let percent_platform_fee = arrExtendOptional[y].platform_fee || 0;
                            // console.log(arrExtendOptional[y].title, 'arrExtendOptional[y]');
                            for (const item of arrExtendOptional[y].area_fee) {

                                if (item.area_lv_1 === getCodeAdministrative.city) {
                                    percent_platform_fee = item.platform_fee;
                                    const findIndexArea_lv_2 = item.area_lv_2.findIndex(x => x.area_lv_2.findIndex(a => getCodeAdministrative.district === a) > -1)
                                    if (findIndexArea_lv_2 > -1) {
                                        let temp = 0;

                                        if (item.price_type_increase === "amount") {
                                            temp = item.area_lv_2[findIndexArea_lv_2].price;
                                        } else if (item.price_type_increase === "amount_by_root") {
                                            temp = arrExtendOptional[y].price + item.area_lv_2[findIndexArea_lv_2].price;
                                        } else { // percent_by_root
                                            temp = arrExtendOptional[y].price * (item.area_lv_2[findIndexArea_lv_2].price / 100);
                                        }
                                        if (temp > 0) {
                                            priceUp = Math.ceil(temp * count / 1000) * 1000;
                                            maxPriceArea = Math.ceil(temp * count / 1000) * 1000;;
                                        }
                                        // if (item.area_lv_2[findIndexArea_lv_2].is_platform_fee === true) percent_platform_fee = item.area_lv_2[findIndexArea_lv_2].platform_fee
                                    } else {
                                        let temp = 0;
                                        if (item.price_type_increase === "amount") {
                                            temp = item.price;
                                        } else if (item.price_type_increase === "amount_by_root") {
                                            temp = arrExtendOptional[y].price + item.price;
                                        } else { // percent_by_root
                                            temp = arrExtendOptional[y].price * (item.price / 100);
                                        }

                                        if (temp > 0) {
                                            priceUp = Math.ceil(temp * count / 1000) * 1000;
                                            maxPriceArea = Math.ceil(temp * count / 1000) * 1000;
                                        }
                                    }

                                    // Tang gia theo ngay gio cao diem
                                    for (const itemRushDay of item.price_option_rush_day) {
                                        // console.log(itemRushDay, 'itemRushDay');

                                        const dayWork = new Date(temp_date_work[z].date);
                                        let dayCompare = Number(dayWork.getTime()) + (itemRushDay.time_zone_apply * 60 * 60 * 1000);
                                        const dayOfWeek = new Date(dayCompare).getDay();
                                        const getDay = temp_date_work[z].date.split("T")[0];
                                        const timeStart = new Date(getDay + "T" + itemRushDay.start_time).getTime()
                                        const endTime = new Date(getDay + "T" + itemRushDay.end_time).getTime()
                                        if (itemRushDay.rush_days.findIndex(x => dayOfWeek === x) > -1 && timeStart < (dayCompare + 1) && (dayCompare - 1) < endTime) {

                                            let temp = 0;
                                            if (itemRushDay.price_type_increase === "percent_accumulate") {
                                                temp = priceUp * (itemRushDay.price / 100) || 0;
                                            } else {
                                                temp = priceUp + itemRushDay.price;
                                            }
                                            // console.log(temp, 'temp');

                                            // maxPriceRushDay = Math.ceil(temp);
                                            temp = (temp > 0) ? Math.ceil(temp / 1000) * 1000 : 0;
                                            maxPriceRushDay = temp;
                                            priceUp += Math.ceil(temp);
                                            maxPriceRushDays.push(temp)
                                        }
                                    }
                                    // Tang gia theo ngay le
                                    for (const itemRushHoliday of item.price_option_holiday) {
                                        const dateCompare = new Date(temp_date_work[z].date).getTime();
                                        const timeStart = new Date(itemRushHoliday.time_start).getTime();
                                        const timeEnd = new Date(itemRushHoliday.time_end).getTime();
                                        let temp = 0;
                                        if (timeStart < dateCompare && dateCompare < timeEnd) {
                                            if (itemRushHoliday.price_type_increase === "percent_accumulate") {
                                                temp = priceUp * (itemRushHoliday.price / 100) || 0;
                                            } else {
                                                temp = priceUp + itemRushHoliday.price;
                                            }
                                            maxPriceHoliday = Math.ceil(temp);
                                            priceUp += Math.ceil(temp);
                                            break;
                                        }
                                    }
                                }
                            }
                            // console.log(maxPriceArea, 'maxPriceArea');
                            // console.log(maxPriceRushDays, 'maxPriceRushDays');
                            // console.log(maxPriceRushDay, 'maxPriceRushDay');
                            // console.log(maxPriceHoliday, 'maxPriceHoliday');

                            // let tempPlatformFee = (arrExtendOptional[y].is_platform_fee === true) ?
                            //     Math.ceil(Number(priceUp) * (Number(arrExtendOptional[y].platform_fee) / 100)) :
                            //     Math.ceil(Number(priceUp) * (Number(arrOptionalService[i].platform_fee) / 100))

                            // console.log(percent_platform_fee, 'percent_platform_fee');

                            let tempPlatformFee = Math.ceil(Number(priceUp) * (Number(percent_platform_fee) / 100))

                            // console.log(tempPlatformFee, 'tempPlatformFee');


                            let tempPriceUp = Math.ceil(priceUp / 1000)
                            tempPlatformFee = Math.round(tempPlatformFee / 100)
                            tempPlatformFee = tempPlatformFee * 100;
                            // console.log(tempPriceUp, 'tempPriceUp');
                            // neu initial_fee k chia dc cho so nguoi lam viec, + len de cho tron so
                            while (tempPriceUp % arrExtendOptional[y].personal !== 0) {
                                // console.log(tempPriceUp, 'tempPriceUp');
                                tempPriceUp += 1
                            }
                            initial_fee += (tempPriceUp * 1000);
                            platform_fee += tempPlatformFee
                            // console.log(platform_fee, 'platform_fee');

                            temp_date_work[z].initial_fee += Math.ceil(priceUp / 1000) * 1000;
                            temp_date_work[z].platform_fee += tempPlatformFee
                            temp_date_work[z].is_rush_time = (temp_date_work[z].is_rush_time === true || maxPriceRushDay > 0 || maxPriceHoliday > 0) ? true : false;
                            tempArrExtendOfOptional[tempArrExtendOfOptional.length - 1].price = (tempPriceUp * 1000)
                            tempArrExtendOfOptional[tempArrExtendOfOptional.length - 1].platform_fee = tempPlatformFee
                        }
                    }
                }
                temp3.push({
                    _id: arrOptionalService[i]._id.toString(),
                    type: arrOptionalService[i].type,
                    extend_optional: tempArrExtendOfOptional
                })
            }
            const objectService = {
                _id: idService,
                type_partner: getService.type_partner,
                time_schedule: (getService.type === "schedule") ? payload.time_schedule : null,
                optional_service: temp3
            }

            for (let i = 0; i < objectService.optional_service.length; i++) {
                if (mainOptionalService.toString() === objectService.optional_service[i]._id.toString()) {
                    total_estimate = objectService.optional_service[i].extend_optional[0].estimate;
                    personal = objectService.optional_service[i].extend_optional[0].personal;
                }
            }
            net_income_collaborator = initial_fee - platform_fee;
            const infoJob: any = {
                lat: convertToken.lat,
                lng: convertToken.lng,
                address: convertToken.address,
                type_address_work: convertToken.type_address_work,
                note_address: convertToken.note_address,
                initial_fee: initial_fee,
                platform_fee: platform_fee,
                net_income_collaborator: net_income_collaborator,
                service: objectService,
                date_work_schedule: temp_date_work,
                type: getService.type,
                total_estimate: total_estimate,
                city: getCodeAdministrative.city,
                district: getCodeAdministrative.district,
                personal: personal,
                tip_collaborator: payload.tip_collaborator || 0 * temp_date_work.length,
                payment_method: payload.payment_method
            }

            const findCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);
            const service_fee = await this.getServiceFee(lang, payload);
            let calculateCodePromotion = null;
            if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
                payload.code_promotion !== "") {
                calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion, findCustomer);
            }
            const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, payload.id_customer);
            const loadcalculateFinalFee = {
                initial_fee: infoJob.initial_fee,
                code_promotion: calculateCodePromotion,
                event_promotion: calculateEventPromotion.event_promotion || [],
                service_fee: service_fee.service_fee,
                type: infoJob.type,
                tip_collaborator: payload.tip_collaborator || 0
            }
            let final_fee = await this.orderSystemService.calculateFinalFee(loadcalculateFinalFee)
            final_fee = final_fee / 1000;
            final_fee = Math.round(final_fee) * 1000;
            final_fee = (final_fee < 0) ? 0 : final_fee;
            infoJob["final_fee"] = final_fee
            infoJob["code_promotion"] = calculateCodePromotion
            infoJob["event_promotion"] = calculateEventPromotion.event_promotion || []
            infoJob["service_fee"] = service_fee.service_fee
            infoJob["total_fee"] = infoJob.initial_fee + (loadcalculateFinalFee.tip_collaborator * temp_date_work.length);
            for (const item of service_fee.service_fee) {
                infoJob["total_fee"] += item.fee
            }
            return infoJob;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }




    // sap toi bo
    // async calculateFeeGroupOrderBackup(lang, payload: createGroupOrderDTOCustomer, checkAdmin?: string) {
    //     try {
    //         let convertToken = {
    //             lat: 0,
    //             lng: 0,
    //             address: "",
    //             type_address_work: payload.type_address_work || "house",
    //             note_address: ""
    //         };
    //         if (payload.extend_optional.length === 0) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
    //         }
    //         if (!payload.token) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
    //         }
    //         if (payload.token) {
    //             const temp = await this.globalService.decryptObject(payload.token);
    //             convertToken.lat = temp.lat
    //             convertToken.lng = temp.lng
    //             convertToken.address = temp.address
    //         }
    //         const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);

    //         payload.date_work_schedule.sort()
    //         const temp = []; // mảng chứa extendOptional
    //         const temp2 = []; // mảng chứa Optional service
    //         const temp3 = [];
    //         let initial_fee = 0;
    //         let net_income_collaborator = 0;
    //         let platform_fee = 0;
    //         let total_estimate = 0;
    //         const temp_date_work = [];
    //         if (payload.date_work_schedule.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_EMPTY, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
    //         for (let i = 0; i < payload.date_work_schedule.length; i++) {
    //             temp_date_work.push({
    //                 status: "pending",
    //                 date: payload.date_work_schedule[i],
    //                 initial_fee: 0,
    //                 net_income_collaborator: 0,
    //                 platform_fee: 0,
    //                 is_rush_time: false
    //             })
    //         }
    //         for (let i = 0; i < payload.extend_optional.length; i++) {
    //             temp.push(await this.extendOptionalService.getDetailExtendOptional(lang, payload.extend_optional[i]._id));
    //         }
    //         const arrExtendOptional = await Promise.all(temp);
    //         for (const item of arrExtendOptional) {
    //             temp2.push(await this.optionalServiceService.getDetailOptionalService(lang, item.id_optional_service));
    //         }
    //         let arrOptionalService = await Promise.all(temp2);
    //         arrOptionalService = arrOptionalService.filter((value, index, self) =>
    //             index === self.findIndex((t) => (
    //                 t._id.toString() === value._id.toString()
    //             ))
    //         )
    //         let mainOptionalService = "";
    //         const idService = arrOptionalService[0].id_service;
    //         const getService = await this.serviceService.getDetailService(lang, idService);
    //         const dateNow = new Date().getTime();
    //         const firstDateWork = new Date(payload.date_work_schedule[0]).getTime();
    //         if ((checkAdmin && checkAdmin === "admin") && ((firstDateWork - dateNow) < (getService.minimum_time_order * 3600000))) throw new HttpException([await this.customExceptionService.i18nError(ERROR.FIRST_DATE_WORK_OUT_DATE, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
    //         // if ((checkAdmin && checkAdmin !== "admin") && ((firstDateWork - dateNow) < (getService.minimum_time_order * 3600000))) throw new HttpException([await this.customExceptionService.i18nError(ERROR.FIRST_DATE_WORK_OUT_DATE, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
    //         if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'date_work_schedule')], HttpStatus.NOT_FOUND);
    //         if (getService.type !== "schedule") {
    //             if (payload.date_work_schedule.length > 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_INVALID, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
    //         }

    //         for (let i = 0; i < arrOptionalService.length; i++) {
    //             if (arrOptionalService[i].position === 0 && arrOptionalService[i].screen === 1) {
    //                 mainOptionalService = arrOptionalService[i]._id;
    //             }
    //             if (idService !== arrOptionalService[i].id_service) {
    //                 throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
    //             }
    //             const tempArrExtendOfOptional = [];

    //             for (let y = 0; y < arrExtendOptional.length; y++) {
    //                 if (arrExtendOptional[y].id_optional_service === arrOptionalService[i]._id.toString()) {

    //                     const count = (arrOptionalService[i].type === "multi_select_count_ac") ?
    //                         payload.extend_optional[y].count : arrExtendOptional[y].count;

    //                     tempArrExtendOfOptional.push({
    //                         _id: arrExtendOptional[y]._id,
    //                         title: arrExtendOptional[y].title,
    //                         description: arrExtendOptional[y].description,
    //                         price: arrExtendOptional[y].price,
    //                         count: count,
    //                         estimate: arrExtendOptional[y].estimate,
    //                         platform_fee: 0
    //                     })
    //                     for (let z = 0; z < temp_date_work.length; z++) {
    //                         let priceUp = arrExtendOptional[y].price * count;
    //                         let maxPriceArea = 0;
    //                         let maxPriceRushDays = [];
    //                         let maxPriceRushDay = 0;
    //                         let maxPriceHoliday = 0;

    //                         for (const item of arrExtendOptional[y].price_option_area) {
    //                             if (item.city === getCodeAdministrative.city && item.district.findIndex(x => getCodeAdministrative.district === x) > -1) {
    //                                 let temp = 0;
    //                                 if (item.type_increase === "amount") {
    //                                     temp = item.value;
    //                                 } else if (item.type_increase === "amount_by_root") {
    //                                     temp = arrExtendOptional[y].price + item.value;
    //                                 } else { // percent_by_root
    //                                     temp = arrExtendOptional[y].price * (item.value / 100);
    //                                 }

    //                                 if (temp > 0) {
    //                                     priceUp = Math.ceil(temp * count / 1000) * 1000;
    //                                     maxPriceArea = Math.ceil(temp * count / 1000) * 1000;;
    //                                 }

    //                                 // Tang gia theo ngay gio cao diem
    //                                 for (const itemRushDay of item.price_option_rush_day) {
    //                                     const dayWork = new Date(temp_date_work[z].date);
    //                                     let dayCompare = Number(dayWork.getTime()) + (itemRushDay.time_zone_apply * 60 * 60 * 1000);
    //                                     const dayOfWeek = new Date(dayCompare).getDay();
    //                                     const getDay = temp_date_work[z].date.split("T")[0];
    //                                     const timeStart = new Date(getDay + "T" + itemRushDay.start_time).getTime()
    //                                     const endTime = new Date(getDay + "T" + itemRushDay.end_time).getTime()
    //                                     if (itemRushDay.rush_days.findIndex(x => dayOfWeek === x) > -1 && timeStart < (dayCompare + 1) && (dayCompare - 1) < endTime) {
    //                                         let temp = 0;
    //                                         if (itemRushDay.type_increase === "percent_accumulate") {
    //                                             temp = priceUp * (itemRushDay.value / 100) || 0;
    //                                         } else {
    //                                             temp = priceUp + itemRushDay.value;
    //                                         }
    //                                         maxPriceRushDay = Math.ceil(temp);
    //                                         priceUp += Math.ceil(temp);
    //                                         maxPriceRushDays.push(temp)
    //                                     }
    //                                 }

    //                                 // Tang gia theo ngay le
    //                                 for (const itemRushHoliday of item.price_option_holiday) {
    //                                     const dateCompare = new Date(temp_date_work[z].date).getTime();
    //                                     const timeStart = new Date(itemRushHoliday.time_start).getTime();
    //                                     const timeEnd = new Date(itemRushHoliday.time_end).getTime();
    //                                     let temp = 0;
    //                                     if (timeStart < dateCompare && dateCompare < timeEnd) {
    //                                         if (itemRushHoliday.type_increase === "percent_accumulate") {
    //                                             temp = priceUp * (itemRushHoliday.value / 100) || 0;
    //                                         } else {
    //                                             temp = priceUp + itemRushHoliday.value;
    //                                         }
    //                                         maxPriceHoliday = Math.ceil(temp);
    //                                         priceUp += Math.ceil(temp);
    //                                     }
    //                                 }
    //                             }
    //                         }

    //                         let tempPlatformFee = (arrExtendOptional[y].is_platform_fee === true) ?
    //                             Math.ceil(Number(priceUp) * (Number(arrExtendOptional[y].platform_fee) / 100)) :
    //                             Math.ceil(Number(priceUp) * (Number(arrOptionalService[i].platform_fee) / 100))

    //                         const tempPriceUp = Math.ceil(priceUp / 1000)
    //                         tempPlatformFee = Math.round(tempPlatformFee / 100)
    //                         tempPlatformFee = tempPlatformFee * 100;
    //                         initial_fee += (tempPriceUp * 1000);
    //                         platform_fee += tempPlatformFee
    //                         temp_date_work[z].initial_fee += Math.ceil(priceUp / 1000) * 1000;
    //                         temp_date_work[z].platform_fee += tempPlatformFee
    //                         temp_date_work[z].is_rush_time = (maxPriceRushDay > 0 || maxPriceHoliday > 0) ? true : false;
    //                         tempArrExtendOfOptional[tempArrExtendOfOptional.length - 1].price = (tempPriceUp * 1000)
    //                         tempArrExtendOfOptional[tempArrExtendOfOptional.length - 1].platform_fee = tempPlatformFee


    //                     }
    //                 }
    //             }
    //             temp3.push({
    //                 _id: arrOptionalService[i]._id.toString(),
    //                 type: arrOptionalService[i].type,
    //                 extend_optional: tempArrExtendOfOptional
    //             })
    //         }
    //         const objectService = {
    //             _id: idService,
    //             type_partner: getService.type_partner,
    //             time_schedule: (getService.type === "schedule") ? payload.time_schedule : null,
    //             optional_service: temp3
    //         }

    //         for (let i = 0; i < objectService.optional_service.length; i++) {
    //             if (mainOptionalService.toString() === objectService.optional_service[i]._id.toString()) {
    //                 total_estimate = objectService.optional_service[i].extend_optional[0].estimate;
    //             }
    //         }
    //         net_income_collaborator = initial_fee - platform_fee;
    //         const result = {
    //             lat: convertToken.lat,
    //             lng: convertToken.lng,
    //             address: convertToken.address,
    //             type_address_work: convertToken.type_address_work,
    //             note_address: convertToken.note_address,
    //             initial_fee: initial_fee,
    //             platform_fee: platform_fee,
    //             net_income_collaborator: net_income_collaborator,
    //             service: objectService,
    //             date_work_schedule: temp_date_work,
    //             type: getService.type,
    //             total_estimate: total_estimate,
    //             city: getCodeAdministrative.city,
    //             district: getCodeAdministrative.district
    //         }
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    // async calculateFeeGroupOrderBackup2(lang, payload: createGroupOrderDTOCustomer, checkAdmin?: string) {
    //     try {
    //         let convertToken = {
    //             lat: 0,
    //             lng: 0,
    //             address: "",
    //             type_address_work: payload.type_address_work || "house",
    //             note_address: ""
    //         };
    //         // let convertToken0 = { // for test
    //         //     lat: "11.2488498",
    //         //     lng: "106.1229564",
    //         //     address: "Số 122B, ấp Long yên, xã Long Thành Nam, huyện Hòa Thành , tỉnh Tây Ninh",
    //         //     type_address_work: "house",
    //         //     note_address: ""
    //         // };
    //         // const temp0 = await this.globalService.encryptObject(convertToken);
    //         // console.log(temp0, 'temp0');



    //         if (payload.extend_optional.length === 0) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
    //         }
    //         if (!payload.token) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
    //         }
    //         if (payload.token) {
    //             const temp = await this.globalService.decryptObject(payload.token);
    //             convertToken.lat = temp.lat
    //             convertToken.lng = temp.lng
    //             convertToken.address = temp.address
    //         }
    //         // const tempAddress = convertToken.address.split(",");
    //         // const tempAdministrative = {
    //         //     city: tempAddress[tempAddress.length - 1],
    //         //     district: tempAddress[tempAddress.length - 2]
    //         // }
    //         const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);
    //         // if (getCodeAdministrative.city !== 74 && getCodeAdministrative.city !== 79 && checkAdmin !== 'admin') {
    //         //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADDRESS_NOT_SUPPORT, lang, 'address')], HttpStatus.BAD_REQUEST);
    //         // }
    //         payload.date_work_schedule.sort()
    //         const temp = []; // mảng chứa extendOptional
    //         const temp2 = []; // mảng chứa Optional service
    //         const temp3 = [];
    //         let initial_fee = 0;
    //         let net_income_collaborator = 0;
    //         let platform_fee = 0;
    //         let total_estimate = 0;
    //         const temp_date_work = [];
    //         // số lượng CTV trong ca 
    //         // let personal = 1;
    //         if (payload.date_work_schedule.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_EMPTY, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
    //         for (let i = 0; i < payload.date_work_schedule.length; i++) {
    //             temp_date_work.push({
    //                 status: "pending",
    //                 date: payload.date_work_schedule[i],
    //                 initial_fee: 0,
    //                 net_income_collaborator: 0,
    //                 platform_fee: 0,
    //                 is_rush_time: false,
    //                 // personal: personal
    //                 // extend_optional_service: []
    //             })
    //         }
    //         for (let i = 0; i < payload.extend_optional.length; i++) {
    //             temp.push(await this.extendOptionalService.getDetailExtendOptional(lang, payload.extend_optional[i]._id));
    //         }
    //         const arrExtendOptional = await Promise.all(temp);
    //         for (const item of arrExtendOptional) {
    //             temp2.push(await this.optionalServiceService.getDetailOptionalService(lang, item.id_optional_service));
    //         }
    //         let arrOptionalService = await Promise.all(temp2);
    //         arrOptionalService = arrOptionalService.filter((value, index, self) =>
    //             index === self.findIndex((t) => (
    //                 t._id.toString() === value._id.toString()
    //             ))
    //         )
    //         // personal = arrExtendOptional[0].personal;
    //         let mainOptionalService = "";
    //         const idService = arrOptionalService[0].id_service;
    //         const getService = await this.serviceService.getDetailService(lang, idService);
    //         const dateNow = new Date().getTime();
    //         const firstDateWork = new Date(payload.date_work_schedule[0]).getTime();
    //         if ((checkAdmin && checkAdmin !== "admin") && ((firstDateWork - dateNow) < (getService.minimum_time_order * 3600000))) throw new HttpException([await this.customExceptionService.i18nError(ERROR.FIRST_DATE_WORK_OUT_DATE, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);

    //         if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'date_work_schedule')], HttpStatus.NOT_FOUND);
    //         if (getService.type !== "schedule") {
    //             if (payload.date_work_schedule.length > 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_INVALID, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
    //         }
    //         if (getService._id.toString() === "644b7a344ea67acef3f02def" && getCodeAdministrative.city !== 79 && checkAdmin !== 'admin') {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADDRESS_NOT_SUPPORT, lang, 'address')], HttpStatus.BAD_REQUEST);
    //         }
    //         if (payload.payment_method === "cash" && getService.type === "schedule") throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT.NOT_SUPPORT, lang, 'payment_method')], HttpStatus.BAD_REQUEST);


    //         for (let i = 0; i < arrOptionalService.length; i++) {
    //             if (arrOptionalService[i].position === 0 && arrOptionalService[i].screen === 1) {
    //                 mainOptionalService = arrOptionalService[i]._id;
    //             }
    //             if (idService !== arrOptionalService[i].id_service) {
    //                 throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
    //             }
    //             const tempArrExtendOfOptional = [];
    //             for (let y = 0; y < arrExtendOptional.length; y++) {
    //                 if (arrExtendOptional[y].id_optional_service === arrOptionalService[i]._id.toString()) {
    //                     const count = (arrOptionalService[i].type === "multi_select_count_ac") ?
    //                         payload.extend_optional[y].count : arrExtendOptional[y].count;
    //                     tempArrExtendOfOptional.push({
    //                         _id: arrExtendOptional[y]._id,
    //                         title: arrExtendOptional[y].title,
    //                         description: arrExtendOptional[y].description,
    //                         price: arrExtendOptional[y].price,
    //                         count: count,
    //                         estimate: arrExtendOptional[y].estimate,
    //                         ///// tong ve sinh //////////
    //                         // personal: arrExtendOptional[y].personal
    //                         ///// tong ve sinh //////////
    //                     })
    //                     console.log(tempArrExtendOfOptional, 'tempArrExtendOfOptional');

    //                     for (let z = 0; z < temp_date_work.length; z++) {
    //                         let priceUp = 0;
    //                         let maxPriceArea = 0;
    //                         let maxPriceRushHour = 0;
    //                         let maxPriceRushDay = 0;
    //                         let maxPriceHoliday = 0;
    //                         if (arrExtendOptional[y].is_price_option_area === true) {
    //                             for (const item of arrExtendOptional[y].price_option_area) {
    //                                 if (item.city === getCodeAdministrative.city && item.district.findIndex(x => getCodeAdministrative.district === x) > -1) {
    //                                     let temp = 0;
    //                                     if (item.type_increase === "amount") {
    //                                         temp = item.value;
    //                                     } else if (item.type_increase === "amount_by_root") {
    //                                         temp = arrExtendOptional[y].price + item.value;
    //                                     } else { // percent_by_root
    //                                         temp = arrExtendOptional[y].price * (item.value / 100);
    //                                     }
    //                                     if (maxPriceArea < temp) maxPriceArea = temp;
    //                                 }
    //                             }
    //                             if (maxPriceArea === 0) maxPriceArea = arrExtendOptional[y].price * count;
    //                         } else {
    //                             maxPriceArea = arrExtendOptional[y].price * count;
    //                         }
    //                         priceUp = maxPriceArea;
    //                         if (arrExtendOptional[y].is_price_option_rush_day === true) {
    //                             for (const item of arrExtendOptional[y].price_option_rush_day) {
    //                                 const dayCompare = new Date(temp_date_work[z].date).getDay();
    //                                 if (item.rush_day.findIndex(x => dayCompare === x) > -1) {
    //                                     let temp = 0;
    //                                     if (item.type_increase === "percent_accumulate") {
    //                                         temp = priceUp * (item.value / 100) || 0;
    //                                     } else {
    //                                         temp = priceUp + item.value;
    //                                     }
    //                                     maxPriceRushDay = temp;
    //                                 }
    //                             }
    //                         } else {
    //                             for (const item of arrOptionalService[i].price_option_rush_day) {
    //                                 const dayCompare = new Date(temp_date_work[z].date).getDay();
    //                                 if (item.rush_day.findIndex(x => dayCompare === x) > -1) {
    //                                     let temp = 0;
    //                                     if (item.type_increase === "percent_accumulate") {
    //                                         temp = priceUp * (item.value / 100) || 0;
    //                                     } else {
    //                                         temp = priceUp + item.value;
    //                                     }
    //                                     maxPriceRushDay = temp;
    //                                 }
    //                             }
    //                         }
    //                         priceUp += Math.ceil(maxPriceRushDay / 1000) * 1000;
    //                         if (arrExtendOptional[y].is_price_option_rush_hour === true) {
    //                             for (const item of arrExtendOptional[y].price_option_rush_hour) {
    //                                 const timeCompare = temp_date_work[z].date.split("T")[1];
    //                                 if ((item.time_start < timeCompare || item.time_start === timeCompare) &&
    //                                     (timeCompare < item.time_end || timeCompare === item.time_end)) {
    //                                     let temp = 0;
    //                                     if (item.type_increase === "percent_accumulate") {
    //                                         temp = priceUp * (item.value / 100) || 0;
    //                                     } else {
    //                                         temp = priceUp + item.value;
    //                                     }
    //                                     maxPriceRushHour = temp;
    //                                 }
    //                             }
    //                         } else {
    //                             for (const item of arrOptionalService[i].price_option_rush_hour) {
    //                                 const timeCompare = temp_date_work[z].date.split("T")[1];
    //                                 if ((item.time_start < timeCompare || item.time_start === timeCompare) &&
    //                                     (timeCompare < item.time_end || timeCompare === item.time_end)) {
    //                                     let temp = 0;
    //                                     if (item.type_increase === "percent_accumulate") {
    //                                         temp = priceUp * (item.value / 100) || 0;
    //                                     } else {
    //                                         temp = priceUp + item.value;
    //                                     }
    //                                     maxPriceRushHour = temp;
    //                                 }
    //                             }
    //                         }
    //                         priceUp += Math.ceil(maxPriceRushHour / 1000) * 1000;
    //                         if (arrExtendOptional[y].is_price_option_holiday === true) {
    //                             for (const item of arrExtendOptional[y].price_option_holiday) {
    //                                 const dateCompare = new Date(temp_date_work[z].date).getTime();
    //                                 const timeStart = new Date(item.time_start).getTime();
    //                                 const timeEnd = new Date(item.time_end).getTime();
    //                                 let temp = 0;
    //                                 if (timeStart < dateCompare && dateCompare < timeEnd) {
    //                                     if (item.type_increase === "percent_accumulate") {
    //                                         temp = priceUp * (item.value / 100) || 0;
    //                                     } else {
    //                                         temp = item.value;
    //                                     }
    //                                     if (maxPriceHoliday < temp) maxPriceHoliday = temp;
    //                                 }
    //                             }
    //                         } else {
    //                             for (const item of arrOptionalService[i].price_option_holiday) {
    //                                 const dateCompare = new Date(temp_date_work[z].date).getTime();
    //                                 const timeStart = new Date(item.time_start).getTime();
    //                                 const timeEnd = new Date(item.time_end).getTime();
    //                                 let temp = 0;
    //                                 if (timeStart < dateCompare && dateCompare < timeEnd) {
    //                                     if (item.type_increase === "percent_accumulate") {
    //                                         temp = priceUp * (item.value / 100) || 0;
    //                                     } else {
    //                                         temp = item.value;
    //                                     }
    //                                     if (maxPriceHoliday < temp) maxPriceHoliday = temp;
    //                                 }
    //                             }
    //                         }
    //                         priceUp += Math.ceil(maxPriceHoliday);
    //                         // const priceUp = Math.ceil(Number(arrExtendOptional[y].price) + maxPriceArea + maxPriceHoliday + maxPriceRushHour);
    //                         // let tempPlatformFee = Math.ceil(Number(priceUp) * (Number(arrOptionalService[i].platform_fee) / 100));

    //                         let tempPlatformFee = (arrExtendOptional[y].is_platform_fee === true) ?
    //                             Math.ceil(Number(priceUp) * (Number(arrExtendOptional[y].platform_fee) / 100)) :
    //                             Math.ceil(Number(priceUp) * (Number(arrOptionalService[i].platform_fee) / 100))

    //                         const tempPriceUp = Math.ceil(priceUp / 1000)
    //                         tempPlatformFee = Math.round(tempPlatformFee / 100)
    //                         tempPlatformFee = tempPlatformFee * 100;
    //                         initial_fee += (tempPriceUp * 1000);
    //                         platform_fee += tempPlatformFee
    //                         temp_date_work[z].initial_fee += Math.ceil(priceUp / 1000) * 1000;
    //                         // temp_date_work[z].net_income_collaborator = priceUp - tempPlatformFee;
    //                         temp_date_work[z].platform_fee += tempPlatformFee
    //                         temp_date_work[z].is_rush_time = (maxPriceRushHour > 0 || maxPriceRushDay > 0 || maxPriceHoliday > 0) ? true : false;
    //                         tempArrExtendOfOptional[tempArrExtendOfOptional.length - 1].price = (tempPriceUp * 1000)
    //                         // temp_date_work[z].personal = personal
    //                     }
    //                 }
    //             }
    //             temp3.push({
    //                 _id: arrOptionalService[i]._id.toString(),
    //                 type: arrOptionalService[i].type,
    //                 extend_optional: tempArrExtendOfOptional
    //             })
    //         }
    //         const objectService = {
    //             _id: idService,
    //             type_partner: getService.type_partner,
    //             time_schedule: (getService.type === "schedule") ? payload.time_schedule : null,
    //             optional_service: temp3
    //         }

    //         for (let i = 0; i < objectService.optional_service.length; i++) {
    //             if (mainOptionalService.toString() === objectService.optional_service[i]._id.toString()) {
    //                 total_estimate = objectService.optional_service[i].extend_optional[0].estimate;
    //             }
    //         }
    //         net_income_collaborator = initial_fee - platform_fee;
    //         const result = {
    //             lat: convertToken.lat,
    //             lng: convertToken.lng,
    //             address: convertToken.address,
    //             type_address_work: convertToken.type_address_work,
    //             note_address: convertToken.note_address,
    //             initial_fee: initial_fee,
    //             platform_fee: platform_fee,
    //             net_income_collaborator: net_income_collaborator,
    //             service: objectService,
    //             date_work_schedule: temp_date_work,
    //             type: getService.type,
    //             total_estimate: total_estimate,
    //             city: getCodeAdministrative.city,
    //             district: getCodeAdministrative.district,
    //             ///// tong ve sinh //////////
    //             // personal: personal
    //             ///// tong ve sinh //////////

    //         }
    //         // console.log('result ', result);

    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async getLoopItems(lang, user, iPage: iPageDTO, status) {
        try {
            const query = {
                $and: [
                    {
                        type: ["loop"]
                    },
                    {
                        status: status
                    },
                    {
                        is_auto_order: true,
                    },
                    {
                        id_customer: user._id
                    }
                ]
            }
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
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

    async getScheduleItems(lang, user, iPage: iPageDTO, status) {
        try {
            const query = {
                $and: [
                    {
                        status: status
                    },
                    {
                        type: ["schedule"]
                    },
                    {
                        id_customer: user._id
                    }
                ]
            }
            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
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

            const arrItem = await this.groupOrderModel.find(query).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
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
            const arrItem = await this.groupOrderModel.findOne().sort({ date_create: -1 })
            const result = {
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

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

                    if (getGroupOrder.payment_method === "cash" && getGroupOrder.temp_pending_money > 0) {
                        findCollaborator.gift_remainder += getGroupOrder.temp_pending_money;
                    }
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
                    if (getGroupOrder.payment_method === "cash" && getGroupOrder.temp_pending_money > 0) {
                        findCollaborator.gift_remainder += getGroupOrder.temp_pending_money;
                    }

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
                    await findCollaborator.save();
                }
            }
            let getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
            if (getGroupOrder.payment_method === "point") {
                for (let item of arrOrder) {
                    getCustomer.cash += item.final_fee;
                    getCustomer.pay_point += item.final_fee;
                }
            }
            await this.customerRepositoryService.findByIdAndUpdate(getGroupOrder.id_customer.toString(), getCustomer);
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

    async getLastGroupOrderForService(lang, user, idService) {
        try {
            const getGroupOrder = await this.groupOrderModel.findOne({ id_customer: user._id, "service._id": idService }).sort({ date_create: -1 })
            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInforGroupOrder(lang, user, id) {
        try {
            const item = await this.groupOrderModel.findOne({ _id: id, id_customer: user._id })
                .populate({ path: 'id_customer', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'id_collaborator', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .populate({ path: 'id_cancel_customer.id_reason_cancel', select: { title: 1, } })
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelGroupOrderV2(lang, idGroupOrder: string, idCancel, typeUserAction: string, user) {
        try {
            let getUser = null;
            let getCollaborator = null;
            const getGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder);
            this.checkStatusGroupOrder(getGroupOrder, ['cancel', 'done'], lang) // kiểm tra các trạng thái

            // if (typeUserAction === 'admin') { // tạm không sài
            //     if (getGroupOrder.city > 0) {
            //         const checkPermisstion = await this.globalService.checkPermissionArea(user, getGroupOrder.city);
            //         if (!checkPermisstion.permisstion) {
            //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            //         }
            //     }
            // }
            if (getGroupOrder.id_collaborator) {
                getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator.toString());
            }
            switch (typeUserAction) {
                case "admin":
                    getUser = await this.userSystemRepositoryService.findOneById(user._id);
                    if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    getGroupOrder.id_cancel_user_system = {
                        id_reason_cancel: idCancel,
                        id_user_system: getUser._id,
                        date_create: new Date(Date.now()).toISOString()
                    }
                    if (getGroupOrder.type === 'schedule') {
                        await this.cancelGroupOrderSchedule(getGroupOrder, 'admin', getUser, getCollaborator, idCancel)
                    } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
                        await this.cancelGroupOrderLoop(lang, getGroupOrder, 'admin', getUser, getCollaborator, idCancel)
                    } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
                        await this.cancelGroupOrderLoop(lang, getGroupOrder, 'admin', getUser, getCollaborator, idCancel)
                    }
                    break;
                case "customer":
                    getUser = await this.customerRepositoryService.findOneById(user._id);
                    if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    const getReasonCancel = await this.reasonCancelModel.findById(idCancel);
                    if (!getReasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    this.checkStatusGroupOrder(getGroupOrder, ['doing'], lang) // nếu đơn hàng đang làm thì sẽ không được hủy
                    getGroupOrder.id_cancel_customer = {
                        id_reason_cancel: idCancel,
                        date_create: new Date(Date.now()).toISOString()
                    }
                    if (getGroupOrder.type === 'schedule') {
                        console.log('log check');
                        
                        await this.cancelGroupOrderSchedule(getGroupOrder, 'customer', getUser, getCollaborator, idCancel)
                    } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
                        await this.cancelGroupOrderLoop(lang, getGroupOrder, 'customer', getUser, getCollaborator, idCancel)
                    } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
                        await this.cancelGroupOrderLoop(lang, getGroupOrder, 'customer', getUser, getCollaborator, idCancel)
                    }
                    break;
                default:
                    if (getUser === null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    break;
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelGroupOrderSchedule(groupOrder, typeUserAction, user, collaborator, idCancel) {
        try {
            const query = {
                $and: [
                    { id_group_order: groupOrder._id },
                    { status: { $in: ["pending", "confirm", "done"] } }
                ]
            }
            const getCustomer = await this.customerRepositoryService.findOneById(groupOrder.id_customer)
            const getArrOrder = await this.orderModel.find(query);
            const getService = await this.serviceModel.findById(groupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);
            const checkOrderIsDone = getArrOrder.findIndex(x => x.status === "done");
            groupOrder.status = (checkOrderIsDone >= 0) ? "done" : "cancel";
            for (let order of getArrOrder) {
                if (order.status === "pending" || order.status === "confirm" || order.status === "doing") {
                    order.status = "cancel"; // chuyển tất cả trạng thái pending - confirm - doing
                    // getCustomer.cash += order.final_fee; // trả lại tiền cho KH
                    // getCustomer.pay_point += order.final_fee;
                    if (typeUserAction === 'admin') {
                        if (idCancel) {
                            order.id_cancel_user_system = {
                                id_reason_cancel: idCancel,
                                id_cancel_user_system: user._id,
                                date_create: new Date(Date.now()).toISOString()
                            }
                        }
                    } else {
                        if (idCancel) {
                            order.id_cancel_customer = {
                                id_reason_cancel: idCancel,
                                date_create: new Date(Date.now()).toISOString()
                            }
                            if (getCustomer.reputation_score > 0) {
                                getCustomer.reputation_score -= 1;//tru diem uy tin
                            }
                        }
                    }

                    await order.save();
                    await this.customerRepositoryService.findByIdAndUpdate(groupOrder.id_customer, getCustomer)
                }
            }

            if (collaborator) {
                const findOrderIsUplicate = await this.orderModel.findOne({ is_duplicate: false, id_group_order: groupOrder._id })
                if (findOrderIsUplicate) {
                    const previousBalance: previousBalanceCollaboratorDTO = {
                        gift_remainder: collaborator.gift_remainder,
                        remainder: collaborator.remainder,
                        collaborator_wallet: collaborator.collaborator_wallet,
                        work_wallet: collaborator.work_wallet,
                    }
                    collaborator.work_wallet += findOrderIsUplicate.platform_fee
                    collaborator.work_wallet += findOrderIsUplicate.pending_money
                    this.activityCollaboratorSystemService.refundPlatformMoney(collaborator, (findOrderIsUplicate.platform_fee + findOrderIsUplicate.pending_money), groupOrder, getService, findOrderIsUplicate, previousBalance);
                    // if (groupOrder.payment_method === "cash") this.activityCollaboratorSystemService.refundMoney(collaborator, findOrderIsUplicate.pending_money, groupOrder, getService, findOrderIsUplicate);
                    await collaborator.save();
                }
            }
            this.activityCustomerSystemService.cancelGroupOrderV2(user, typeUserAction, groupOrder);
            if (groupOrder.payment_method === "point") {
                const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCustomer(getCustomer);
                const payload_transaction: createTransactionDTO = {
                    id_customer: getCustomer._id.toString(),
                    money: groupOrder.temp_final_fee,
                    status: 'pending',
                    subject: 'customer',
                    type_transfer: 'refund_service',
                    transfer_note: _transfer_note,
                    payment_in: "pay_point",
                    payment_out: "cash_book",
                    id_group_order: groupOrder._id,
                    id_admin_action: typeUserAction === ' admin' ? user._id : null,

                }
                console.log('check 2');
                
                const transaction = await this.transactionSystemService.createItem(payload_transaction);
                console.log('check 3');

                // await this.activityCustomerSystemService.customerCreateTransaction(resultTransaction);
                await this.activitySystemService.createTransaction(transaction);
                console.log('check 4');

                const resultTransaction = await this.transactionSystemService.verifyTransaction('vi', transaction._id)
                console.log('check 5');

                // this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, groupOrder.temp_final_fee, groupOrder, null, previousPaypoint)
                await this.activitySystemService.verifyTransactionRefundPaymentService(transaction, resultTransaction.customer, groupOrder);
            }
            await groupOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async cancelGroupOrderLoopV2(lang, groupOrder: GroupOrderDocument, typeUserAction, user, collaborator: CollaboratorDocument, idReasonCancel) { // chưa sài
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(groupOrder.id_customer.toString())
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getService = await this.serviceModel.findById(groupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);
            const previousPaypoint = {
                pay_point: getCustomer.pay_point
            }
            if (groupOrder.personal < 2) {
                const getOrder = await this.orderModel.findById(groupOrder.id_order[0]);
                if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
                groupOrder.status = "cancel";
                getOrder.status = "cancel";
                if (typeUserAction === 'admin') {
                    getOrder.id_cancel_user_system = {
                        id_reason_cancel: idReasonCancel,
                        date_create: new Date(Date.now()).toISOString(),
                        id_user_system: user._id
                    }
                } else {
                    getOrder.id_cancel_customer = {
                        id_reason_cancel: idReasonCancel,
                        date_create: new Date(Date.now()).toISOString(),
                    }
                }
                if (collaborator) {
                    const previousBalance: previousBalanceCollaboratorDTO = {
                        gift_remainder: collaborator.gift_remainder,
                        remainder: collaborator.remainder,
                        collaborator_wallet: collaborator.collaborator_wallet,
                        work_wallet: collaborator.work_wallet,
                    }
                    collaborator.gift_remainder += groupOrder.temp_platform_fee; // trả lại tiền cho CTV
                    let tempMoney = groupOrder.temp_platform_fee;
                    collaborator.gift_remainder += groupOrder.temp_pending_money;
                    tempMoney += groupOrder.temp_pending_money;
                    this.activityCollaboratorSystemService.refundPlatformMoney(collaborator, tempMoney, groupOrder, getService, getOrder, previousBalance);
                    await collaborator.save();
                }
                await getOrder.save();

            } else {
                const query: any = {
                    $and: [
                        { is_delete: false },
                        { id_group_order: groupOrder._id },
                        {
                            $or: [
                                { status: 'confirm' },
                                { status: 'doing' },
                            ]
                        }
                    ]
                }
                const arrConfirmOrder = await this.orderModel.find(query);
                for (let order of arrConfirmOrder) {
                    if (typeUserAction === 'admin') {
                        order.id_cancel_user_system = {
                            id_reason_cancel: idReasonCancel,
                            date_create: new Date(Date.now()).toISOString(),
                            id_user_system: user._id
                        }
                    } else {
                        order.id_cancel_customer = {
                            id_reason_cancel: idReasonCancel,
                            date_create: new Date(Date.now()).toISOString(),
                        }
                    }
                    order.status = 'cancel'
                    await order.save();
                    const getCollaborator = await this.collaboratorRepositoryService.findOneById(order.id_collaborator.toString());
                    const previousBalance: previousBalanceCollaboratorDTO = {
                        gift_remainder: collaborator.gift_remainder,
                        remainder: collaborator.remainder,
                        collaborator_wallet: collaborator.collaborator_wallet,
                        work_wallet: collaborator.work_wallet,
                    }
                    getCollaborator.gift_remainder += groupOrder.temp_platform_fee; // trả lại tiền cho CTV
                    let tempMoney = groupOrder.temp_platform_fee;
                    getCollaborator.gift_remainder += groupOrder.temp_pending_money;
                    tempMoney += groupOrder.temp_pending_money;
                    this.activityCollaboratorSystemService.refundPlatformMoney(getCollaborator, tempMoney, groupOrder, getService, order, previousBalance);
                    await this.collaboratorRepositoryService.findByIdAndUpdate(order.id_collaborator.toString(), getCollaborator)
                }
                query.$and[2] = { status: 'pending' };
                const arrPendingOrder = await this.orderModel.find(query);
                for (let order of arrPendingOrder) {
                    order.status = 'cancel'
                    if (typeUserAction === 'admin') {
                        order.id_cancel_user_system = {
                            id_reason_cancel: idReasonCancel,
                            date_create: new Date(Date.now()).toISOString(),
                            id_user_system: user._id
                        }
                    } else {
                        order.id_cancel_customer = {
                            id_reason_cancel: idReasonCancel,
                            date_create: new Date(Date.now()).toISOString(),
                        }
                    }
                    await order.save();
                }
            }
            if (groupOrder.payment_method === "point") {
                getCustomer.cash += groupOrder.final_fee; // trả lại tiền cho KH
                getCustomer.pay_point += groupOrder.final_fee;
            }
            this.activityCustomerSystemService.cancelGroupOrderV2(user, typeUserAction, groupOrder);
            if (groupOrder.payment_method === "point") {
                this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, groupOrder.final_fee, groupOrder, null, previousPaypoint)
            }
            await groupOrder.save();
            await this.customerRepositoryService.findByIdAndUpdate(groupOrder.id_customer.toString(), getCustomer);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelGroupOrderLoop(lang, groupOrder, typeUserAction, user, collaborator, idCancel) {
        try {
            const getOrder = await this.orderModel.findById(groupOrder.id_order[0]);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(groupOrder.id_customer)
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getService = await this.serviceModel.findById(groupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);
            const previousPaypoint = {
                pay_point: getCustomer.pay_point
            }
            groupOrder.status = "cancel";
            getOrder.status = "cancel";
            if (typeUserAction === ' admin') {
                getOrder.id_cancel_user_system = {
                    id_reason_cancel: idCancel,
                    date_create: new Date(Date.now()).toISOString(),
                    id_user_system: user._id
                }
            } else {
                getOrder.id_cancel_customer = {
                    id_reason_cancel: idCancel,
                    date_create: new Date(Date.now()).toISOString(),
                }
            }
            if (collaborator) {
                const previousBalance: previousBalanceCollaboratorDTO = {
                    gift_remainder: collaborator.gift_remainder,
                    remainder: collaborator.remainder,
                    collaborator_wallet: collaborator.collaborator_wallet,
                    work_wallet: collaborator.work_wallet
                }
                // collaborator.gift_remainder += groupOrder.temp_platform_fee; // trả lại tiền cho CTV
                collaborator.work_wallet += groupOrder.temp_platform_fee; // trả lại tiền cho CTV
                let tempMoney = groupOrder.temp_platform_fee;
                // if (groupOrder.payment_method === "cash" && groupOrder.temp_pending_money > 0) {
                // collaborator.gift_remainder += groupOrder.temp_pending_money;
                tempMoney += groupOrder.temp_pending_money;
                // }
                this.activityCollaboratorSystemService.refundPlatformMoney(collaborator, tempMoney, groupOrder, getService, getOrder, previousBalance);
                // if (groupOrder.payment_method === "cash") this.activityCollaboratorSystemService.refundMoney(collaborator, getOrder.pending_money, groupOrder, getService, getOrder);
                // await collaborator.save();
                await this.collaboratorRepositoryService.findByIdAndUpdate(collaborator._id, collaborator);
            }
            // if (groupOrder.payment_method === "point") {
            //     getCustomer.cash += groupOrder.final_fee; // trả lại tiền cho KH
            //     getCustomer.pay_point += groupOrder.final_fee;
            // }
            this.activityCustomerSystemService.cancelGroupOrderV2(user, typeUserAction, groupOrder);
            if (groupOrder.payment_method === "point") {

                const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCustomer(getCustomer);
                const payload_transaction: createTransactionDTO = {
                    id_customer: getCustomer._id.toString(),
                    money: groupOrder.temp_final_fee,
                    status: 'pending',
                    subject: 'customer',
                    type_transfer: 'refund_service',
                    transfer_note: _transfer_note,
                    payment_in: "pay_point",
                    payment_out: "cash_book",
                    id_group_order: groupOrder._id,
                    id_admin_action: typeUserAction === ' admin' ? user._id : null,
                }
                const transaction = await this.transactionSystemService.createItem(payload_transaction);
                // await this.activityCustomerSystemService.customerCreateTransaction(resultTransaction);
                await this.activitySystemService.createTransaction(transaction);
                const resultTransaction = await this.transactionSystemService.verifyTransaction('vi', transaction._id,)
                // this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, groupOrder.temp_final_fee, groupOrder, null, previousPaypoint)
                await this.activitySystemService.verifyTransactionRefundPaymentService(transaction, resultTransaction.customer, groupOrder);

                // ds fghbjk
                // this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, groupOrder.final_fee, groupOrder, null, previousPaypoint)
            }
            await getOrder.save();
            await groupOrder.save();
            await this.customerRepositoryService.findByIdAndUpdate(groupOrder.id_customer, getCustomer)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async editGroupOrder(lang, idGroupOrder, payload, idAdmin) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            let check = false;
            if (getGroupOrder.type !== 'loop') {
                check = true;
            }
            if (getGroupOrder.id_collaborator !== null) {
                check = true;
            }
            if (getGroupOrder.payment_method !== 'cash') {
                check = true;
            }
            if (getGroupOrder.status !== 'pending') {
                check = true;
            }
            if (check) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, null)], HttpStatus.BAD_REQUEST);
            if (getGroupOrder.code_promotion !== null) {
                await this.promotionService.decreaseTotalUsedPromotionCode(lang, getGroupOrder.code_promotion, getGroupOrder.id_customer);
            }
            if (getGroupOrder.event_promotion.length > 0) {
                await this.promotionService.decreaseTotalUsedPromotionEvent(lang, getGroupOrder.event_promotion);
            }
            const tempToken = {
                lat: getGroupOrder.lat,
                lng: getGroupOrder.lng,
                address: getGroupOrder.address
            }
            const token = await this.globalService.encryptObject(tempToken);
            const tempExtend = [];
            for (let extend of getGroupOrder.service["optional_service"]) {
                for (let item of extend.extend_optional) {
                    const temp = {
                        _id: item._id.toString(),
                        count: item.count,
                    }
                    tempExtend.push(temp);
                }
            }
            const tempInfo: any = {
                token: token,
                payment_method: getGroupOrder.payment_method,
                note: payload.note,
                code_promotion: payload.code_promotion || null,
                type_address_work: getGroupOrder.type_address_work,
                date_work_schedule: [payload.date_work_schedule],
                extend_optional: tempExtend,
                id_address: '',
                convert_time: false,
                is_auto_order: getGroupOrder.is_auto_order,
                time_schedule: getGroupOrder.time_schedule,
            }
            const infoJob = await this.calculateFeeGroupOrder(lang, tempInfo, 'admin');
            let calculateCodePromotion = {}
            if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
                payload.code_promotion !== "") {
                const getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
                calculateCodePromotion = await this.promotionService.calculateCodePromotion(lang, infoJob, payload.code_promotion, getCustomer);
            }
            const calculateEventPromotion = await this.promotionService.calculateEventPromotion(lang, infoJob, getGroupOrder.id_customer);
            let tempServiceFee = 0;
            for (let item of getGroupOrder.service_fee) {
                tempServiceFee += item["fee"];
            }
            const loadcalculateFinalFee = {
                initial_fee: infoJob.initial_fee,
                code_promotion: (payload.code_promotion) ? calculateCodePromotion : null,
                event_promotion: calculateEventPromotion.event_promotion || [],
                service_fee: getGroupOrder.service_fee,
                type: infoJob.type,
                tip_collaborator: getGroupOrder.tip_collaborator
            }
            let final_fee = await this.orderSystemService.calculateFinalFee(loadcalculateFinalFee);
            let refund_money = 0;
            let pending_money = tempServiceFee;
            final_fee = final_fee / 1000;
            final_fee = Math.round(final_fee) * 1000;
            final_fee = (final_fee < 0) ? 0 : final_fee;
            refund_money = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion["discount"] : 0;
            for (const item of calculateEventPromotion.event_promotion) {
                refund_money += item.discount;
            }
            getGroupOrder.code_promotion = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion : null
            getGroupOrder.event_promotion = calculateEventPromotion.event_promotion || []
            getGroupOrder.initial_fee = infoJob.initial_fee
            getGroupOrder.platform_fee = infoJob.platform_fee
            getGroupOrder.final_fee = final_fee
            getGroupOrder.net_income_collaborator = infoJob.net_income_collaborator
            getGroupOrder.temp_net_income_collaborator = infoJob.net_income_collaborator
            getGroupOrder.temp_initial_fee = infoJob.initial_fee
            getGroupOrder.temp_platform_fee = infoJob.platform_fee
            getGroupOrder.temp_pending_money = pending_money
            getGroupOrder.temp_refund_money = refund_money
            getGroupOrder.temp_final_fee = final_fee
            getGroupOrder.date_work_schedule[0] = {
                date: payload.date_work_schedule,
                status: "pending",
                initial_fee: infoJob.initial_fee,
                platform_fee: infoJob.platform_fee,
                net_income_collaborator: infoJob.net_income_collaborator
            }
            // return getGroupOrder;
            await getGroupOrder.save();
            const getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
            if (getGroupOrder.code_promotion !== null) {
                this.promotionService.increaseTotalUsedPromotionCode(lang, getCustomer, calculateCodePromotion);
            }
            if (getGroupOrder.event_promotion.length > 0) {
                this.promotionService.increaseTotalUsedPromotionEvent(lang, getCustomer, calculateEventPromotion.event_promotion);
            }

            const getArrOrder = await this.orderModel.find({ id_group_order: getGroupOrder._id });
            for (let order of getArrOrder) {
                order.event_promotion = getGroupOrder.event_promotion;
                order.code_promotion = getGroupOrder.code_promotion;
                order.date_work = getGroupOrder.date_work_schedule[0]["date"];
                const end_date_word = addHours(new Date(getGroupOrder.date_work_schedule[0]["date"]), getGroupOrder.total_estimate);
                order.end_date_work = end_date_word.toISOString();
                order.final_fee = getGroupOrder.final_fee;
                order.initial_fee = getGroupOrder.initial_fee;
                order.net_income_collaborator = getGroupOrder.net_income_collaborator;
                order.platform_fee = getGroupOrder.platform_fee;
                order.pending_money = getGroupOrder.temp_pending_money;
                order.refund_money = getGroupOrder.temp_refund_money;
                await order.save();
            }
            this.activityAdminSystemService.editGroupOrder(getGroupOrder.id_customer, getGroupOrder._id, getGroupOrder.service['_id'], idAdmin)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////
    async tipCollaborator(lang, idGroupOrder, payload: tipCollaboratorDTOCustomer) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group order')], HttpStatus.NOT_FOUND);

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////
    async findGroupOrderById(idGroupOrder) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', 'group order')], HttpStatus.NOT_FOUND);
            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param lang ngôn ngữ
     * @param infoJob thông tin đơn hàng
     * @param customer thông tin khách hàng
     * @returns 
     */
    async checkBalanceCustomer(lang, infoJob, customer) {
        try {
            if (infoJob.payment_method === "point" && customer.pay_point - infoJob.final_fee < 0) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_CASH, lang, 'cash')], HttpStatus.BAD_REQUEST);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
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
                if (i === 'cancel' && groupOrder.status === "cancel") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'confirm' && groupOrder.status === "confirm") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'doing' && groupOrder.status === "doing") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'done' && groupOrder.status === "done") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'pending' && groupOrder.status === "pending") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    // ------------------ NEW FUNCTION ----------------------


    async findItem(lang, idGroupOrder) {
        try {
            const getGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder);
            if(!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group_order')], HttpStatus.NOT_FOUND);
            return getGroupOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async unassignCollaboratorFromGroupOrder(lang, subjectAction, idGroupOrder, orderCancel) {
        try {
            const findGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder);
            if(!findGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);
            // if(findGroupOrder.status !== "confirm" && findGroupOrder.status !== "doing") throw new HttpException([await this.customExceptionService.i18nError(ERROR.INVALID_PASSWORD, lang, 'order')], HttpStatus.BAD_REQUEST);

            const getCollaborator = await this.collaboratorRepositoryService.findOneById(findGroupOrder.id_collaborator);

            const query = {
                $and: [
                    {status: {$in: ["confirm", "doing"]}},
                    {id_group_order: findGroupOrder._id}
                ]
            }
            const getOrderNotDone = await this.orderRepositoryService.getListDataByCondition(query, {_id: 1})


            for(let i = 0 ; i < getOrderNotDone.length ; i++) {
                await this.orderSystemService.unassignCollaboratorFromOrder(lang, subjectAction, getOrderNotDone[i]._id);
            }

            findGroupOrder.status = "pending";
            findGroupOrder.id_collaborator = null;
            findGroupOrder.name_collaborator = null;
            findGroupOrder.phone_collaborator = null;

            await this.groupOrderRepositoryService.findByIdAndUpdate(findGroupOrder._id, findGroupOrder)
            await this.notificationSystemService.unAssignCollaborator(subjectAction.type, findGroupOrder, getCollaborator, orderCancel)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // async cancelGroupOrderV2(lang, idGroupOrder: string, idCancel, typeUserAction: string, user) {
    //     try {
    //         let getUser = null;
    //         let getCollaborator = null;
    //         const getGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder);
    //         this.checkStatusGroupOrder(getGroupOrder, ['cancel', 'done'], lang) // kiểm tra các trạng thái

    //         // if (typeUserAction === 'admin') { // tạm không sài
    //         //     if (getGroupOrder.city > 0) {
    //         //         const checkPermisstion = await this.globalService.checkPermissionArea(user, getGroupOrder.city);
    //         //         if (!checkPermisstion.permisstion) {
    //         //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
    //         //         }
    //         //     }
    //         // }
    //         if (getGroupOrder.id_collaborator) {
    //             getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator.toString());
    //         }
    //         switch (typeUserAction) {
    //             case "admin":
    //                 getUser = await this.userSystemRepositoryService.findOneById(user._id);
    //                 if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //                 getGroupOrder.id_cancel_user_system = {
    //                     id_reason_cancel: idCancel,
    //                     id_user_system: getUser._id,
    //                     date_create: new Date(Date.now()).toISOString()
    //                 }
    //                 if (getGroupOrder.type === 'schedule') {
    //                     await this.cancelGroupOrderSchedule(getGroupOrder, 'admin', getUser, getCollaborator, idCancel)
    //                 } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
    //                     await this.cancelGroupOrderLoop(lang, getGroupOrder, 'admin', getUser, getCollaborator, idCancel)
    //                 } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
    //                     await this.cancelGroupOrderLoop(lang, getGroupOrder, 'admin', getUser, getCollaborator, idCancel)
    //                 }
    //                 break;
    //             case "customer":
    //                 getUser = await this.customerRepositoryService.findOneById(user._id);
    //                 if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //                 const getReasonCancel = await this.reasonCancelModel.findById(idCancel);
    //                 if (!getReasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //                 this.checkStatusGroupOrder(getGroupOrder, ['doing'], lang) // nếu đơn hàng đang làm thì sẽ không được hủy
    //                 getGroupOrder.id_cancel_customer = {
    //                     id_reason_cancel: idCancel,
    //                     date_create: new Date(Date.now()).toISOString()
    //                 }
    //                 if (getGroupOrder.type === 'schedule') {
    //                     console.log('log check');
                        
    //                     await this.cancelGroupOrderSchedule(getGroupOrder, 'customer', getUser, getCollaborator, idCancel)
    //                 } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
    //                     await this.cancelGroupOrderLoop(lang, getGroupOrder, 'customer', getUser, getCollaborator, idCancel)
    //                 } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
    //                     await this.cancelGroupOrderLoop(lang, getGroupOrder, 'customer', getUser, getCollaborator, idCancel)
    //                 }
    //                 break;
    //             default:
    //                 if (getUser === null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //                 break;
    //         }
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async cancelGroupOrder(lang, subjectAction, groupOrder, reasonCancel) {
        try {
            // const reasonCancel = await this.reasonsCancelRepositoryService.findOneById(idCancel);
            // const groupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder);
            if(!reasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);

            await this.checkStatusGroupOrder(groupOrder, ['cancel', 'done'], lang) // kiểm tra các trạng thái
            const query = {
                $and: [
                    { id_group_order: groupOrder._id },
                    { status: {$in: ["confirm", "pending", "doing"]} }
                ]
            }
            const arrOrder = await this.orderRepositoryService.getListDataByCondition(query, {}, {date_work: 1});

            if(arrOrder.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.BAD_REQUEST);
            // console.log(temp, 'temp');
            
            let refundCustomer = 0;
            let refundCollaborator = arrOrder[0].platform_fee + arrOrder[0].pending_money;
            const temp = []
            for(let i = 0 ; i < arrOrder.length ; i++) {
                arrOrder[i].status = "cancel"
                refundCustomer += arrOrder[i].final_fee;
                temp.push(this.orderRepositoryService.findByIdAndUpdate(arrOrder[i]._id, arrOrder[i]))
            }
            await Promise.all(temp);
            groupOrder.status = "cancel";


            if(subjectAction.type === "customer") {
                groupOrder.id_cancel_customer = {
                    id_reason_cancel: reasonCancel._id,
                    date_create: new Date(Date.now()).toISOString()
                }
            }
            else if(subjectAction.type === "collaborator") {
                groupOrder.id_cancel_collaborator.push({
                    id_reason_cancel: reasonCancel._id,
                    id_collaborator: groupOrder.id_collaborator,
                    date_create: new Date(Date.now()).toISOString()
                })
            }
            else if(subjectAction.type === "admin") {
                groupOrder.id_cancel_user_system = {
                    id_reason_cancel: reasonCancel._id,
                    id_user_system: new Types.ObjectId(subjectAction._id),
                    date_create: new Date(Date.now()).toISOString()
                }
            }

            await this.groupOrderRepositoryService.findByIdAndUpdate(groupOrder._id, groupOrder);
            
            const payloadDependency = {
                id_group_order: groupOrder._id,
                id_customer: groupOrder.id_customer,
                id_reason_cancel: reasonCancel._id
            }
            await this.activitySystemService.cancelGroupOrder(subjectAction, payloadDependency);

            await this.notificationSystemService.cancelOrder(subjectAction.type, reasonCancel, groupOrder, arrOrder[0])

            const result = {
                groupOrder,
                nearOrder: arrOrder[0], // order xu ly gan nhat de phat va hoan tien cho CTV
                refundCustomer: refundCustomer,
                refundCollaborator: refundCollaborator
            }

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}