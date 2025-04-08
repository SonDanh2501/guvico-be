import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { add, addHours, isEqual, sub, subMinutes } from 'date-fns'
import { Model, Types } from 'mongoose'
import { createOrderDTO, Customer, CustomerDocument, editOrderV2DTOAdmin, ERROR, GlobalService, LANGUAGE, MILLISECOND_IN_HOUR, Order, OrderDocument, previousBalanceCollaboratorDTO, Service, ServiceDocument, UserSystem, UserSystemDocument } from 'src/@core'
import { Collaborator, CollaboratorDocument } from 'src/@core/db/schema/collaborator.schema'
import { CollaboratorBonus, CollaboratorBonusDocument } from 'src/@core/db/schema/collaborator_bonus.schema'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { CustomerSetting, CustomerSettingDocument } from 'src/@core/db/schema/customer_setting.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { ServiceFee, ServiceFeeDocument } from 'src/@core/db/schema/service_fee.schema'
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto'
import { STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { JobSystemService } from '../@core-system/job-system/job-system.service'
import { NotificationSystemService } from '../@core-system/notification-system/notification-system.service'
import { PaymentSystemService } from '../@core-system/payment-system/payment-system.service'
import { PushNotificationSystemService } from '../@core-system/push-notification-system/push-notification-system.service'
import { CustomerOopSystemService } from '../@oop-system/customer-oop-system/customer-oop-system.service'
import { GroupOrderOopSystemService } from '../@oop-system/group-order-oop-system/group-order-oop-system.service'
import { HistoryActivityOopSystemService } from '../@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { OrderOopSystemService } from '../@oop-system/order-oop-system/order-oop-system.service'
import { UserSystemOoopSystemService } from '../@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from '../activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from '../activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
import { CollaboratorSystemService } from '../collaborator-system/collaborator-system.service'
import { CustomerSystemService } from '../customer-system/customer-system.service'
import { GroupCustomerSystemService } from '../group-customer-system/group-customer-system.service'
import { HistoryPointService } from '../history-point/history-point.service'
import { InviteCodeSystemService } from '../invite-code-system/invite-code-system.service'
import { PromotionSystemService } from '../promotion-system/promotion-system.service'
import { PunishSystemService } from '../punish-system/punish-system.service'
import { PunishTicketSystemService } from '../punish-ticket-system/punish-ticket-system.service'
import { TransactionSystemService } from '../transaction-system/transaction-system.service'
@Injectable()
export class OrderSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private groupCustomerSystemService: GroupCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private historyPointService: HistoryPointService,
        @Inject(forwardRef(() => NotificationSystemService))
        private notificationSystemService: NotificationSystemService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        // private groupOrderSystemService: GroupOrderSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private orderRepositoryService: OrderRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private customerSystemService: CustomerSystemService,
        private customerRepositoryService: CustomerRepositoryService,
        private globalService: GlobalService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private punishSystemService: PunishSystemService,
        private promotionSystemService: PromotionSystemService,
        private transactionRepositoryService: TransactionRepositoryService,
        private punishPolicyRepositoryService: PunishPolicyRepositoryService,
        private punishTicketSystemService: PunishTicketSystemService,
        private activitySystemService: ActivitySystemService,
        private transactionSystemService: TransactionSystemService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        private reasonsCancelRepositoryService: ReasonsCancelRepositoryService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        private groupOrderOopSystemService: GroupOrderOopSystemService,


        private pushNotificationSystemService: PushNotificationSystemService,
        private jobSystemService: JobSystemService,
        private paymentSystemService: PaymentSystemService,

        // private groupOrderSystemService: GroupOrderSystemService,
        // private roomService: RoomService,
        // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(ServiceFee.name) private serviceFeeModel: Model<ServiceFeeDocument>,
        @InjectModel(CollaboratorBonus.name) private collaboratorBonusModel: Model<CollaboratorBonusDocument>,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
    ) { }

    async getOrderById(id: string) {
        try {
            const order = await this.orderModel.findById(id);
            if (!order) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            return order;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createOrder(payload: createOrderDTO) {
        try {
            // const getService = await this.serviceModel.findById(payload.service["_id"]);
            // const callPromiseAll = 
            // const temp = payload.address.split(",");
            // const administrative = {
            //     city: temp[temp.length - 1],
            //     district: temp[temp.length - 2]
            // }
            // const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(administrative);
            const callPromiseAll = await Promise.all([
                this.generalHandleService.getCodeAdministrativeToString(payload.address),
                this.serviceModel.findById(payload.service["_id"])
            ]);
            // const city = getCodeAdministrative.city ;
            // const district = getCodeAdministrative.district;

            const city = callPromiseAll[0].city;
            const district = callPromiseAll[0].district;

            const location = {
                coordinates: [Number(payload.lng), Number(payload.lat)]
            }
            let collaboratorFee = 0;
            if (payload.payment_method === "cash") {
                collaboratorFee = (payload.initial_fee - payload.platform_fee) - payload.final_fee;
                // collaboratorFee = payload.final_fee - payload.initial_fee;
                // for(const item of payload.service_fee) {
                //     collaboratorFee += item.fee;
                // }
            } else {
                collaboratorFee = payload.initial_fee - payload.platform_fee
            }
            const getCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);
            const end_date_work = new Date(new Date(payload.date_work).getTime() + (payload.total_estimate * 60 * 60 * 1000)).toISOString();
            const newItem = new this.orderModel({
                id_customer: payload.id_customer,
                phone_customer: getCustomer.phone,
                name_customer: getCustomer.full_name,
                id_collaborator: payload.id_collaborator || null,
                phone_collaborator: (payload.id_collaborator) ? getCollaborator.phone : null,
                name_collaborator: (payload.id_collaborator) ? getCollaborator.full_name : null,
                lat: payload.lat.toString(),
                lng: payload.lng.toString(),
                location: location,
                address: payload.address,
                city: city,
                district: district,
                date_create: payload.date_create,
                date_work: payload.date_work,
                end_date_work: end_date_work,
                service: payload.service,
                final_fee: payload.final_fee,
                initial_fee: payload.initial_fee,
                net_income_collaborator: payload.net_income_collaborator,
                refund_money: payload.refund_money,
                pending_money: payload.pending_money,
                platform_fee: payload.platform_fee,
                change_money: payload.change_money,
                collaborator_fee: collaboratorFee,
                service_fee: payload.service_fee,
                status: payload.status,
                code_promotion: payload.code_promotion,
                event_promotion: payload.event_promotion,
                id_group_order: payload.id_group_order,
                total_estimate: payload.total_estimate,
                note: payload.note,
                type_address_work: payload.type_address_work,
                note_address: payload.note_address || "",
                is_duplicate: payload.is_duplicate,
                payment_method: payload.payment_method,
                convert_time: payload.convert_time,
                id_view: payload.id_view,
                ordinal_number: payload.ordinal_number,
                id_favourite_collaborator: (payload.id_favourite_collaborator) ? payload.id_favourite_collaborator : [],
                id_block_collaborator: (payload.id_block_collaborator) ? payload.id_block_collaborator : [],
                tip_collaborator: payload.tip_collaborator,
                date_tip_collaborator: payload.tip_collaborator > 0 ? new Date(Date.now()).toISOString() : null

            });
            const result = await newItem.save();
            return result;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param id id nhóm đơn hàng (group order)
     * @param payload Object 
     * {
     * date_work_schedule: [],
     * id_order: [],
     * }
     */
    async updateIdOrderGroupOrder(getItem, payload) {
        try {
            // const getItem = await this.groupOrderModel.findById(id);
            // if (!getItem) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            // }
            getItem.date_work_schedule = payload.date_work_schedule;
            getItem.id_order.push(payload.id_order.toString());
            getItem.code_promotion = payload.code_promotion || getItem.code_promotion;
            getItem.event_promotion = payload.event_promotion || getItem.event_promotion;
            getItem.final_fee = payload.final_fee || getItem.final_fee;
            await getItem.save();
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async processOrderSingle(groupOrder) {
        try {
            const getDateWorkSchedule = groupOrder.date_work_schedule[0].date;
            let tempIdView = '001';
            let tempOrdinalNumber: number = 1;
            const payload: createOrderDTO = {
                id_customer: groupOrder.id_customer.toString(),
                id_collaborator: null,
                lat: groupOrder.lat.toString(),
                lng: groupOrder.lng.toString(),
                address: groupOrder.address,
                date_create: new Date(Date.now()).toISOString(),
                initial_fee: groupOrder.initial_fee,
                final_fee: groupOrder.final_fee,
                platform_fee: groupOrder.platform_fee,
                net_income_collaborator: groupOrder.net_income_collaborator,
                refund_money: groupOrder.temp_refund_money,
                pending_money: groupOrder.temp_pending_money,
                change_money: 0,
                collaborator_fee: 0,
                service: groupOrder.service,
                date_work: getDateWorkSchedule,
                status: "pending",
                code_promotion: groupOrder.code_promotion,
                event_promotion: groupOrder.event_promotion,
                total_estimate: groupOrder.total_estimate,
                service_fee: groupOrder.service_fee,
                id_group_order: groupOrder._id,
                note: groupOrder.note,
                type_address_work: groupOrder.type_address_work,
                note_address: groupOrder.note_address || "",
                payment_method: groupOrder.payment_method || "cash",
                is_duplicate: false,
                convert_time: groupOrder.convert_time,
                id_view: `${groupOrder.id_view}.${tempIdView.slice(-3)}`,
                ordinal_number: tempOrdinalNumber,
                id_favourite_collaborator: (groupOrder.id_favourite_collaborator) ? groupOrder.id_favourite_collaborator : [],
                id_block_collaborator: (groupOrder.id_block_collaborator) ? groupOrder.id_block_collaborator : [],
            }
            const result = await this.createOrder(payload);
            result.bonus_collaborator = await this.caculateAndAddBonusCollaborator(result);
            for (let i = 0; i < groupOrder.date_work_schedule.length; i++) {
                if (getDateWorkSchedule === groupOrder.date_work_schedule[i].date) {
                    groupOrder.date_work_schedule[i].status = "pending";
                    break;
                }
            }
            const update = {
                date_work_schedule: groupOrder.date_work_schedule,
                id_order: result._id,
            }
            groupOrder.bonus_collaborator = result.bonus_collaborator;

            await this.updateIdOrderGroupOrder(groupOrder, update);
            // console.log("check 1");

            // const getGroupOrder = await this.groupOrderModel.findById(groupOrder._id);
            // console.log(getGroupOrder, 'getGroupOrder');

            // console.log(result._id, "result");

            // groupOrder.id_order = [result._id];
            // await groupOrder.save();
            // await this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrder._id, getGroupOrder)
            // console.log("check 2");

            this.groupCustomerSystemService.updateConditionIn(groupOrder.id_customer);
            this.groupCustomerSystemService.updateConditionOut(groupOrder.id_customer);
        } catch (err) {
            throw new HttpException(err.response || err.toString().toString(), HttpStatus.FORBIDDEN);
        }
    }


    async processLoopOrder(groupOrder) {
        try {
            const getDateWorkSchedule = groupOrder.date_work_schedule[0].date;
            let tempIdView = '001';
            let tempOrdinalNumber: number = 1;
            const payload: createOrderDTO = {
                id_customer: groupOrder.id_customer.toString(),
                id_collaborator: null,
                lat: groupOrder.lat.toString(),
                lng: groupOrder.lng.toString(),
                address: groupOrder.address,
                date_create: new Date(Date.now()).toISOString(),
                initial_fee: groupOrder.initial_fee,
                final_fee: groupOrder.final_fee,
                platform_fee: groupOrder.platform_fee,
                net_income_collaborator: groupOrder.net_income_collaborator,
                refund_money: groupOrder.temp_refund_money,
                pending_money: groupOrder.temp_pending_money,
                change_money: 0,
                collaborator_fee: 0,
                service: groupOrder.service,
                date_work: getDateWorkSchedule,
                status: "pending",
                code_promotion: groupOrder.code_promotion,
                event_promotion: groupOrder.event_promotion,
                total_estimate: groupOrder.total_estimate,
                service_fee: groupOrder.service_fee,
                id_group_order: groupOrder._id,
                note: groupOrder.note,
                type_address_work: groupOrder.type_address_work,
                note_address: groupOrder.note_address || "",
                payment_method: groupOrder.payment_method || "cash",
                is_duplicate: false,
                convert_time: groupOrder.convert_time,
                id_view: `${groupOrder.id_view}.${tempIdView.slice(-3)}`,
                ordinal_number: tempOrdinalNumber,
                id_favourite_collaborator: (groupOrder.id_favourite_collaborator) ? groupOrder.id_favourite_collaborator : [],
                id_block_collaborator: (groupOrder.id_block_collaborator) ? groupOrder.id_block_collaborator : [],
                tip_collaborator: Number(groupOrder.tip_collaborator),
                date_tip_collaborator: groupOrder.tip_collaborator > 0 ? new Date(Date.now()).toISOString() : null
            }
            const result = await this.createOrder(payload);
            result.bonus_collaborator = await this.caculateAndAddBonusCollaborator(result);
            // await this.activityCustomerSystemService.createNewGroupOrder(groupOrder.id_customer, groupOrder._id, groupOrder.service['id'], result._id)
            for (let i = 0; i < groupOrder.date_work_schedule.length; i++) {
                if (getDateWorkSchedule === groupOrder.date_work_schedule[i].date) {
                    groupOrder.date_work_schedule[i].status = "pending";
                    break;
                }
            }
            const update = {
                date_work_schedule: groupOrder.date_work_schedule,
                id_order: result._id,
                // code_promotion: null,
                // event_promotion: [],
                // final_fee: final_fee
            }
            groupOrder.bonus_collaborator = result.bonus_collaborator;
            await this.updateIdOrderGroupOrder(groupOrder, update);
            await result.save();
            // const getGroupOrder = await this.groupOrderModel.findById(groupOrder._id);
            // getGroupOrder.id_order = [result._id]
            // getGroupOrder.bonus_collaborator = result.bonus_collaborator;
            // await getGroupOrder.save();
            this.groupCustomerSystemService.updateConditionIn(groupOrder.id_customer)
            this.groupCustomerSystemService.updateConditionOut(groupOrder.id_customer)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async processLoopOrderMultiple(groupOrder) {
        try {
            const getDateWorkSchedule = groupOrder.date_work_schedule[0].date;
            let tempIdView = '000';
            let tempOrdinalNumber: number = 1;
            let result;
            const tempIdOrder = [];
            // hiện thì nhiều CTV trên ca làm không có phần bonus
            // không có luôn phần tip
            for (let i = 0; i < groupOrder.personal; i++) {
                tempIdView = `${tempIdView}${tempOrdinalNumber}`
                tempOrdinalNumber += 1;
                const payload: createOrderDTO = {
                    id_customer: groupOrder.id_customer.toString(),
                    id_collaborator: null,
                    lat: groupOrder.lat.toString(),
                    lng: groupOrder.lng.toString(),
                    address: groupOrder.address,
                    date_create: new Date(Date.now()).toISOString(),
                    initial_fee: groupOrder.initial_fee / groupOrder.personal,
                    final_fee: groupOrder.final_fee / groupOrder.personal,
                    platform_fee: groupOrder.platform_fee / groupOrder.personal,
                    net_income_collaborator: groupOrder.net_income_collaborator / groupOrder.personal,
                    refund_money: i === 0 ? groupOrder.temp_refund_money : 0,
                    pending_money: i === 0 ? groupOrder.temp_pending_money : 0,
                    change_money: 0,
                    collaborator_fee: 0,
                    service: groupOrder.service,
                    date_work: getDateWorkSchedule,
                    status: "pending",
                    code_promotion: i === 0 ? groupOrder.code_promotion : 0,
                    event_promotion: i === 0 ? groupOrder.event_promotion : 0,
                    total_estimate: groupOrder.total_estimate,
                    service_fee: groupOrder.service_fee,
                    id_group_order: groupOrder._id,
                    note: groupOrder.note,
                    type_address_work: groupOrder.type_address_work,
                    note_address: groupOrder.note_address || "",
                    payment_method: groupOrder.payment_method || "cash",
                    is_duplicate: i === 0 ? false : true,
                    convert_time: groupOrder.convert_time,
                    id_view: `${groupOrder.id_view}.${tempIdView.slice(-3)}`,
                    ordinal_number: tempOrdinalNumber,
                    id_favourite_collaborator: (groupOrder.id_favourite_collaborator) ? groupOrder.id_favourite_collaborator : [],
                    id_block_collaborator: (groupOrder.id_block_collaborator) ? groupOrder.id_block_collaborator : [],
                    is_captain: i === 0 ? true : false,
                    personal: groupOrder.personal
                }
                result = await this.createOrder(payload);
                tempIdOrder.push(result._id);
            }
            await result.save();
            const getGroupOrder = await this.groupOrderModel.findById(groupOrder._id);
            getGroupOrder.id_order = tempIdOrder;
            await getGroupOrder.save();
            this.groupCustomerSystemService.updateConditionIn(groupOrder.id_customer)
            this.groupCustomerSystemService.updateConditionOut(groupOrder.id_customer)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async processLoopOrder(id) {
    //     try {
    //         const findGroupOrder = await this.groupOrderModel.findById(id);

    //         if (!findGroupOrder) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         }
    //         let getDateWorkSchedule = "";
    //         // findGroupOrder.date_work_schedule.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0))
    //         if (findGroupOrder.is_auto_order === true) {
    //             for (let i = 0; i < findGroupOrder.date_work_schedule.length; i++) {
    //                 if (findGroupOrder.date_work_schedule[i].status === "pending") {
    //                     getDateWorkSchedule = findGroupOrder.date_work_schedule[i].date;
    //                     break;
    //                 }
    //             }
    //         } else {
    //             getDateWorkSchedule = findGroupOrder.date_work_schedule[0].date;
    //         }
    //         const getOrder = await this.orderModel.find({
    //             id_group_order: findGroupOrder._id
    //         })
    //             .sort({ ordinal_number: -1, })
    //             .then();
    //         let tempIdView = '000';
    //         let tempOrdinalNumber: number;

    //         if (getOrder.length > 0) {
    //             tempIdView = `${tempIdView}${getOrder[0].ordinal_number}`;
    //             tempOrdinalNumber = getOrder[0].ordinal_number + 1;
    //         } else {
    //             tempIdView = `${tempIdView}${1}`;
    //             tempOrdinalNumber = 1;
    //         }
    //         // let final_fee = 0;
    //         // let serviceFee = 0;
    //         // for (let i = 0; i < findGroupOrder.service_fee.length; i++) {
    //         //     serviceFee = serviceFee + Number(findGroupOrder.service_fee[i]['fee'] | 0)
    //         // }
    //         // date_work_schedule co 2 ngay tro len => tu ngay thu 2 se k ap dung khuyen mai
    //         // if (findGroupOrder.is_auto_order === true && findGroupOrder.date_work_schedule.length > 1) {
    //         //     final_fee = Number(findGroupOrder.initial_fee)
    //         //         final_fee = final_fee + serviceFee;
    //         // } else {
    //         //     final_fee = await this.calculateFinalFee(findGroupOrder);
    //         // }
    //         // final_fee = (final_fee < 0) ? 0 : final_fee;
    //         const payload: createOrderDTO = {
    //             id_customer: findGroupOrder.id_customer.toString(),
    //             id_collaborator: null,
    //             lat: findGroupOrder.lat.toString(),
    //             lng: findGroupOrder.lng.toString(),
    //             address: findGroupOrder.address,
    //             date_create: new Date(Date.now()).toISOString(),
    //             initial_fee: findGroupOrder.initial_fee,
    //             final_fee: findGroupOrder.final_fee,
    //             platform_fee: findGroupOrder.platform_fee,
    //             net_income_collaborator: findGroupOrder.net_income_collaborator,
    //             refund_money: findGroupOrder.temp_refund_money,
    //             pending_money: findGroupOrder.temp_pending_money,
    //             change_money: 0,
    //             collaborator_fee: 0,
    //             service: findGroupOrder.service,
    //             date_work: getDateWorkSchedule,
    //             status: "pending",
    //             code_promotion: findGroupOrder.code_promotion,
    //             event_promotion: findGroupOrder.event_promotion,
    //             total_estimate: findGroupOrder.total_estimate,
    //             service_fee: findGroupOrder.service_fee,
    //             id_group_order: findGroupOrder._id,
    //             note: findGroupOrder.note,
    //             type_address_work: findGroupOrder.type_address_work,
    //             note_address: findGroupOrder.note_address || "",
    //             payment_method: findGroupOrder.payment_method || "cash",
    //             is_duplicate: false,
    //             convert_time: findGroupOrder.convert_time,
    //             id_view: `${findGroupOrder.id_view}.${tempIdView.slice(-3)}`,
    //             ordinal_number: tempOrdinalNumber
    //         }
    //         const result = await this.createOrder(payload);
    //         await this.activityCustomerSystemService.createNewGroupOrder(findGroupOrder.id_customer, findGroupOrder._id, findGroupOrder.service['id'], result._id)

    //         for (let i = 0; i < findGroupOrder.date_work_schedule.length; i++) {
    //             if (getDateWorkSchedule === findGroupOrder.date_work_schedule[i].date) {
    //                 findGroupOrder.date_work_schedule[i].status = "pending";
    //                 break;
    //             }
    //         }
    //         const update = {
    //             date_work_schedule: findGroupOrder.date_work_schedule,
    //             id_order: result._id,
    //             // code_promotion: null,
    //             // event_promotion: [],
    //             // final_fee: final_fee
    //         }
    //         await this.updateIdOrderGroupOrder(findGroupOrder._id, update);

    //         const getCustomer = await this.customerModel.findById(findGroupOrder.id_customer);

    //         await getCustomer.save();

    //         this.groupCustomerSystemService.updateConditionIn(findGroupOrder.id_customer)
    //         this.groupCustomerSystemService.updateConditionOut(findGroupOrder.id_customer)
    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }


    async processScheduleOrder(groupOrder, infoJob) {
        try {
            const arrNewOrder = [];

            // // let discountPerOrder = 0;
            // // discountPerOrder = ((groupOrder.code_promotion && groupOrder.code_promotion["discount"])) ?
            // //     groupOrder.code_promotion["discount"] : 0;

            // // for (const item of groupOrder.event_promotion) {
            // //     discountPerOrder += item.discount;
            // // }
            // // discountPerOrder = Math.floor(discountPerOrder / groupOrder.date_work_schedule.length);


            // let discountPerOrder = 0;
            // let discountPerOrderPromotion = null;
            // let discountPerOrderEvent = [];
            // let discountPerOrderAllEvent = 0;

            // // discountPerOrder = (groupOrder.code_promotion && groupOrder.code_promotion["discount"]) ? groupOrder.code_promotion["discount"] : 0;
            // // discountPerOrderPromotion = ((groupOrder.code_promotion && groupOrder.code_promotion["discount"])) ?
            // //     {...groupOrder.code_promotion} : {};
            // // const discountPerOrderPromotionFee = (groupOrder.code_promotion["discount"]) ? Math.floor(discountPerOrderPromotion["discount"] / groupOrder.date_work_schedule.length) : 0;

            // if(groupOrder.code_promotion && groupOrder.code_promotion["discount"]) {
            //     const discountPerOrderPromotionFee = Math.floor(groupOrder.code_promotion["discount"] / groupOrder.date_work_schedule.length);
            //     // console.log(discountPerOrderPromotionFee, 'discountPerOrderPromotionFee');
            //     discountPerOrderPromotion = groupOrder.code_promotion;
            //     // console.log(discountPerOrderPromotion, 'discountPerOrderPromotion');
            //     discountPerOrderPromotion.discount = discountPerOrderPromotionFee;
            //     discountPerOrder += discountPerOrderPromotionFee;
            // } else {
            //    discountPerOrderPromotion  = null;
            // }


            // for (const item of groupOrder.event_promotion) {
            //     // discountPerOrder += item.discount;
            //     item.discount = Math.floor(item.discount / groupOrder.date_work_schedule.length);
            //     discountPerOrder += item.discount
            //     discountPerOrderEvent.push(item)

            // }

            // discountPerOrder = discountPerOrderAllEvent + discountPerOrderPromotionFee

            // discountPerOrder = Math.floor(discountPerOrder / groupOrder.date_work_schedule.length);

            // const discount = groupOrder.code_promotion.discount / groupOrder.date_work_schedule.length
            let resultCodePromotion = {
                perOrder: 0,
                sumLastOrder: 0
            }
            let newCodePerOrder: Object = {}
            let newCodeForLastOrder: Object = {}
            const length = groupOrder.date_work_schedule.length;
            if (groupOrder.code_promotion !== null && groupOrder.code_promotion["discount"]) {
                let tempPromotion = (groupOrder.code_promotion["discount"] / 1000) + 1
                do {
                    tempPromotion = tempPromotion - 1
                } while (tempPromotion % length !== 0)
                resultCodePromotion = {
                    perOrder: tempPromotion / length * 1000,
                    sumLastOrder: groupOrder.code_promotion["discount"] - (tempPromotion * 1000)
                }
                newCodePerOrder = {
                    _id: groupOrder.code_promotion["_id"],
                    code: groupOrder.code_promotion["code"],
                    discount: resultCodePromotion.perOrder
                }
                newCodeForLastOrder = {
                    _id: groupOrder.code_promotion["_id"],
                    code: groupOrder.code_promotion["code"],
                    discount: resultCodePromotion.perOrder + resultCodePromotion.sumLastOrder
                }
            }
            const arrEvent = []
            for (const item of groupOrder.event_promotion) {
                let tempPromotion = (item.discount / 1000) + 1
                do {
                    tempPromotion = tempPromotion - 1
                } while (tempPromotion % length !== 0)
                arrEvent.push({
                    perOrder: tempPromotion / length * 1000,
                    sumLastOrder: item.discount - (tempPromotion * 1000)
                })
            }
            let perOrder = resultCodePromotion.perOrder;
            let lastOrder = resultCodePromotion.perOrder + resultCodePromotion.sumLastOrder;
            const arrNewEventPerOder = []
            const arrNewEventForLastOder = []
            for (let i = 0; i < arrEvent.length; i++) {
                perOrder += arrEvent[i].perOrder;
                lastOrder += arrEvent[i].perOrder + arrEvent[i].sumLastOrder;
                const payload = {
                    _id: groupOrder.event_promotion[i]["_id"],
                    discount: arrEvent[i].perOrder
                }
                const payload2 = {
                    _id: groupOrder.event_promotion[i]["_id"],
                    discount: arrEvent[i].perOrder + arrEvent[i].sumLastOrder
                }
                arrNewEventPerOder.push(payload),
                    arrNewEventForLastOder.push(payload2)
            }
            for (let i = 0; i < groupOrder.date_work_schedule.length; i++) {
                let refund_money = 0;
                let pending_money = 0;
                let isCheckDuplicate = true;
                // xu ly don dau tien
                if (i === 0) {
                    for (const item of groupOrder.service_fee) {
                        pending_money += item.fee;
                    }
                    isCheckDuplicate = false;
                }
                let final_fee = (i === groupOrder.date_work_schedule.length - 1) ?
                    groupOrder.date_work_schedule[i].initial_fee - lastOrder + pending_money
                    : groupOrder.date_work_schedule[i].initial_fee - perOrder + pending_money;
                refund_money = (i === groupOrder.date_work_schedule.length - 1) ? lastOrder : perOrder;
                const tempOrdinal = i + 1;
                const tempIdView = `000${tempOrdinal}`;
                const payload: createOrderDTO = {
                    id_customer: groupOrder.id_customer.toString(),
                    id_collaborator: null,
                    lat: groupOrder.lat.toString(),
                    lng: groupOrder.lng.toString(),
                    address: groupOrder.address,
                    date_create: new Date(Date.now()).toISOString(),
                    initial_fee: groupOrder.date_work_schedule[i].initial_fee,
                    final_fee: final_fee,
                    net_income_collaborator: groupOrder.date_work_schedule[i].initial_fee - groupOrder.date_work_schedule[i].platform_fee,
                    platform_fee: groupOrder.date_work_schedule[i].platform_fee,
                    refund_money: refund_money,
                    pending_money: pending_money,
                    collaborator_fee: 0,
                    change_money: 0,
                    // service: groupOrder.service,
                    service: infoJob.date_work_schedule[i].service,
                    date_work: groupOrder.date_work_schedule[i].date,
                    status: "pending",
                    code_promotion: (resultCodePromotion.perOrder === 0) ? null :
                        (i === groupOrder.date_work_schedule.length - 1) ? newCodeForLastOrder : newCodePerOrder,
                    event_promotion: (i === groupOrder.date_work_schedule.length - 1) ? arrNewEventForLastOder : arrNewEventPerOder,

                    total_estimate: groupOrder.total_estimate,
                    service_fee: (isCheckDuplicate) ? [] : groupOrder.service_fee,
                    id_group_order: groupOrder._id,
                    note: groupOrder.note,
                    type_address_work: groupOrder.type_address_work,
                    note_address: groupOrder.note_address || "",
                    payment_method: groupOrder.payment_method || "cash",
                    is_duplicate: isCheckDuplicate,
                    id_view: `${groupOrder.id_view}.${tempIdView.slice(-3)}`,
                    ordinal_number: tempOrdinal,
                    id_favourite_collaborator: (groupOrder.id_favourite_collaborator) ? groupOrder.id_favourite_collaborator : [],
                    id_block_collaborator: (groupOrder.id_block_collaborator) ? groupOrder.id_block_collaborator : [],
                }
                arrNewOrder.push(this.createOrder(payload));
            }
            const result = await Promise.all(arrNewOrder);
            // update id_order
            const arrOrder = [];
            for (let i = 0; i < result.length; i++) {
                arrOrder.push(result[i]._id);
            }
            const getGroupOrder = await this.groupOrderModel.findById(groupOrder._id);
            getGroupOrder.id_order = arrOrder;
            await getGroupOrder.save();
            await this.updateBonusCollaborator(getGroupOrder);
            this.groupCustomerSystemService.updateConditionIn(groupOrder.id_customer)
            this.groupCustomerSystemService.updateConditionOut(groupOrder.id_customer)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async processScheduleOrder(id) {
    //     try {
    //         const findGroupOrder = await this.groupOrderModel.findById(id);
    //         if (!findGroupOrder) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         }

    //         const query = {
    //             id_group_order: findGroupOrder._id
    //         }
    //         const findCountOrder = await this.orderModel.count(query);
    //         if (findCountOrder === 0) {
    //             let serviceFee = 0;
    //             for (const item of findGroupOrder.service_fee) {
    //                 serviceFee += item["fee"];
    //             }

    //             // const initialFeePerOrder = Math.round(findGroupOrder.initial_fee / countDateWork);
    //             // const finalFeePerOrder = Math.round((findGroupOrder.final_fee - serviceFee) / countDateWork);
    //             // const netIncomeCollaboratorPerOrder = findGroupOrder.net_income_collaborator / countDateWork;
    //             // const platformFeePerOrder = findGroupOrder.platform_fee / countDateWork;
    //             // console.log(findGroupOrder.date_work_schedule, 'findGroupOrder.date_work_schedule')
    //             let finalFeeNotPromotion = 0;
    //             for (let i = 0; i < findGroupOrder.date_work_schedule.length; i++) {
    //                 // console.log("check ")
    //                 finalFeeNotPromotion += findGroupOrder.date_work_schedule[i].initial_fee;
    //             }
    //             // console.log("check 0")

    //             finalFeeNotPromotion += serviceFee;
    //             const arrNewOrder = [];
    //             const countDateWork = findGroupOrder.date_work_schedule.length;
    //             const priceSalePromotionPerOrder = (finalFeeNotPromotion - findGroupOrder.final_fee) / countDateWork;
    //             // console.log("check 1")
    //             for (let i = 0; i < findGroupOrder.date_work_schedule.length; i++) {
    //                 const finalFeePerOrder = Math.round(findGroupOrder.date_work_schedule[i].initial_fee) - priceSalePromotionPerOrder;
    //                 const isCheckDuplicate = (i === 0) ? false : true;
    //                 const temp = (isCheckDuplicate) ? finalFeePerOrder - findGroupOrder.date_work_schedule[i].initial_fee
    //                     : (finalFeePerOrder + serviceFee) - findGroupOrder.date_work_schedule[i].initial_fee
    //                 // const temp = finalFeePerOrder - initialFeePerOrder;
    //                 // console.log("check 2")
    //                 let refund_money = 0;
    //                 let pending_money = 0;
    //                 if (temp > 0) pending_money = Math.abs(temp)
    //                 if (temp < 0) refund_money = Math.abs(temp)
    //                 //////////////////////////// tao id_view order /////////////////////////////
    //                 const getOrder = await this.orderModel.find({
    //                     id_group_order: findGroupOrder._id
    //                 })
    //                     .sort({ ordinal_number: -1, })
    //                     .then();
    //                 let tempIdView = '000';
    //                 let tempOrdinal = 0;
    //                 if (getOrder.length > 0) {
    //                     tempIdView = `${tempIdView}${getOrder[0].ordinal_number}`;
    //                     tempOrdinal = getOrder[0].ordinal_number + 1;
    //                 } else {
    //                     tempIdView = `${tempIdView}${1}`;
    //                     tempOrdinal = 1;
    //                 }
    //                 /////////////////////////////////////////////////////////////////////////////////////////
    //                 const payload: createOrderDTO = {
    //                     id_customer: findGroupOrder.id_customer.toString(),
    //                     id_collaborator: null,
    //                     lat: findGroupOrder.lat.toString(),
    //                     lng: findGroupOrder.lng.toString(),
    //                     address: findGroupOrder.address,
    //                     date_create: new Date(Date.now()).toISOString(),
    //                     initial_fee: findGroupOrder.date_work_schedule[i].initial_fee,
    //                     final_fee: (isCheckDuplicate) ? finalFeePerOrder : (finalFeePerOrder + serviceFee),
    //                     net_income_collaborator: findGroupOrder.date_work_schedule[i].net_income_collaborator,
    //                     platform_fee: findGroupOrder.date_work_schedule[i].platform_fee,
    //                     refund_money: refund_money,
    //                     pending_money: pending_money,
    //                     collaborator_fee: 0,
    //                     change_money: 0,
    //                     service: findGroupOrder.service,
    //                     date_work: findGroupOrder.date_work_schedule[i].date,
    //                     status: "pending",
    //                     code_promotion: findGroupOrder.code_promotion,
    //                     event_promotion: findGroupOrder.event_promotion,
    //                     total_estimate: findGroupOrder.total_estimate,
    //                     service_fee: (isCheckDuplicate) ? [] : findGroupOrder.service_fee,
    //                     id_group_order: findGroupOrder._id,
    //                     note: findGroupOrder.note,
    //                     type_address_work: findGroupOrder.type_address_work,
    //                     note_address: findGroupOrder.note_address || "",
    //                     payment_method: findGroupOrder.payment_method || "cash",
    //                     is_duplicate: isCheckDuplicate,
    //                     convert_time: findGroupOrder.convert_time,
    //                     id_view: `${findGroupOrder.id_view}.${tempIdView.slice(-3)}`,
    //                     ordinal_number: tempOrdinal
    //                 }
    //                 arrNewOrder.push(this.createOrder(payload));
    //                 // const result = await this.createOrder(payload);
    //             }
    //             const result = await Promise.all(arrNewOrder);

    //         }
    //         await findGroupOrder.save();
    //         this.groupCustomerSystemService.updateConditionIn(findGroupOrder.id_customer)
    //         this.groupCustomerSystemService.updateConditionOut(findGroupOrder.id_customer)

    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }

    async calculateFinalFee(findGroupOrder) {
        let final_fee = findGroupOrder.initial_fee;
        if (findGroupOrder.code_promotion !== null) {
            final_fee = final_fee - Number(findGroupOrder.code_promotion['discount'] | 0);
        }
        for (let i = 0; i < findGroupOrder.event_promotion.length; i++) {
            final_fee = final_fee - Number(findGroupOrder.event_promotion[i]['discount'] | 0);
        }
        // if (findGroupOrder.type !== "schedule") {
        //     for (let i = 0; i < findGroupOrder.service_fee.length; i++) {
        //         console.log(findGroupOrder.service_fee[i], 'ssssss')
        //         final_fee = final_fee + Number(findGroupOrder.service_fee[i]['fee'] || 0)
        //     }
        // }
        // console.log(final_fee, 'final_fee');

        for (let i = 0; i < findGroupOrder.service_fee.length; i++) {
            final_fee = final_fee + Number(findGroupOrder.service_fee[i]['fee'] || 0);
        }
        if (findGroupOrder.tip_collaborator) {
            final_fee += findGroupOrder.tip_collaborator;
        }
        return final_fee;
    }

    async calculateAccumulatePoints(idOrder, idGroupOrder) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer.toString());
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            const getSetting = await this.customerSettingModel.findOne();
            const previousBalancePoints = {
                point: getCustomer.point
            }
            const tempPoint = Math.floor(Number(getOrder.final_fee) / Number(getSetting.point_to_price));
            let accumulatePoints: number = 0;
            if (getCustomer.rank === 'member') {
                accumulatePoints = tempPoint * getSetting.ratio_of_price_to_point_member;
            } else if (getCustomer.rank === 'silver') {
                accumulatePoints = tempPoint * getSetting.ratio_of_price_to_point_silver;
            }
            else if (getCustomer.rank === 'gold') {
                accumulatePoints = tempPoint * getSetting.ratio_of_price_to_point_gold;
            }
            else if (getCustomer.rank === 'platinum') {
                accumulatePoints = tempPoint * getSetting.ratio_of_price_to_point_platium;
            }
            getCustomer.point = Number(getCustomer.point) + accumulatePoints;
            getCustomer.rank_point = Number(getCustomer.rank_point) + accumulatePoints;
            getCustomer.total_price = Number(getCustomer.total_price) + Number(getOrder.final_fee);

            if (getCustomer.rank_point >= getSetting.rank_platinum_minium_point) {
                getCustomer.rank = 'platinum';
            } else if (getCustomer.rank_point >= getSetting.rank_gold_minium_point) {
                getCustomer.rank = 'gold';
            } else if (getCustomer.rank_point >= getSetting.rank_silver_minium_point) {
                getCustomer.rank = 'silver';
            } else {
                getCustomer.rank = 'member';
            }

            await getCustomer.save();
            await this.customerRepositoryService.findByIdAndUpdate(getOrder.id_customer.toString(), getCustomer);
            const payload = {
                creator_object: "customer",
                id_creator: getOrder.id_customer,
                owner_object: "customer",
                owner_id: getOrder.id_customer,
                value: Math.round(accumulatePoints),
                related_id: getOrder._id,
                related: "order",
            }
            this.historyPointService.newActivityPoint(payload);
            this.activityCustomerSystemService.customerReceivcePointsByDoneOrder(getCustomer._id, idOrder, Math.round(accumulatePoints), idGroupOrder, previousBalancePoints)
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async calculatePlatformFee(idOrder, refund?: string, userCancel?: string) {
    //     try {
    //         const getOrder = await this.orderModel.findById(idOrder);
    //         if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         const getService = await this.serviceModel.findById(getOrder.service["_id"]);
    //         const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
    //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         let platform_fee = 0;
    //         if(refund && refund === "refund") {
    //             if(getGroupOrder.type === "single" || getGroupOrder.type === "loop" ) {
    //                 platform_fee = Math.round(Number(getOrder.final_fee) * (Number(getService.platform_fee) / 100));
    //             } else if(getGroupOrder.type === "schedule") {
    //                 if(userCancel && userCancel === "customer") {
    //                     platform_fee = Math.round(Number(getOrder.final_fee) * (Number(getService.platform_fee) / 100));
    //                 } else {
    //                     const countOrder = await this.orderModel.count({id_group_order: getGroupOrder._id, status: "confirm"});
    //                     platform_fee = Math.round(Number(getOrder.final_fee) * (Number(getService.platform_fee) / 100) * countOrder);
    //                 }
    //             }
    //             return platform_fee;
    //         } else {
    //             if(getGroupOrder.type === "single" || getGroupOrder.type === "loop" ) {
    //                 platform_fee = Math.round(Number(getOrder.final_fee) * (Number(getService.platform_fee) / 100));
    //             } else if(getGroupOrder.type === "schedule") {
    //                 const countOrder = await this.orderModel.count({id_group_order: getGroupOrder._id, status: "pending"});
    //                 platform_fee = Math.round(Number(getOrder.final_fee) * (Number(getService.platform_fee) / 100) * countOrder);
    //             }
    //             return platform_fee;
    //         }
    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }

    // async calculatePlatformFee(idOrder) {
    //     try {
    //         const getOrder = await this.orderModel.findById(idOrder);
    //         if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         const getService = await this.serviceModel.findById(getOrder.service["_id"]);
    //         const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
    //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         let platform_fee = 0;
    //         platform_fee = Math.round(Number(getOrder.initial_fee) * (Number(getService.platform_fee) / 100));
    //         return platform_fee;
    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }

    async sumServiceFee(order: any) {
        try {
            let service_fee = 0;
            for (const item of order.service_fee) {
                service_fee += item.fee;
            }
            return service_fee;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderSchedule(lang, order: OrderDocument, groupOrder: GroupOrderDocument, idCancel, typeUserAction, idAdmin?) {
        try {
            const query = {
                $and: [
                    { id_group_order: groupOrder._id },
                    {
                        $or: [
                            { status: "pending" },
                            { status: "confirm" },
                            { status: "doing" }
                        ]
                    }
                ]
            }
            const getOrderPendingConfirm = await this.orderModel.find(query)
                .select({
                    platform_fee: 1, id_collaborator: 1, date_work: 1, service_fee: 1, final_fee: 1, initial_fee: 1, status: 1, pending_money: 1, refund_money: 1, is_duplicate: 1,
                    name_customer: 1
                });
            const getService = await this.serviceModel.findById(groupOrder.service["_id"]);
            const arrTemp = await this.generalHandleService.sortArrObject(getOrderPendingConfirm, "date_work", 1)
            const findGetOrder = arrTemp.findIndex(x => x.date_work === order.date_work);
            const checkIsConfirm = arrTemp.findIndex(x => x.status === "confirm");
            if (findGetOrder === 0 && arrTemp.length > 1) {
                let fee_service = 0;
                for (const item of order.service_fee) {
                    fee_service += item["fee"];
                }
                const nextOrder = arrTemp[findGetOrder + 1];
                const temp_service_fee = order.service_fee;
                const temp_pending_money = order.pending_money;
                nextOrder.service_fee = temp_service_fee;
                nextOrder.pending_money = temp_pending_money;
                nextOrder.final_fee += fee_service;
                await nextOrder.save();
                order.service_fee = [];
                order.final_fee -= fee_service;
            }
            if (order.is_duplicate === false && arrTemp.length > 1) {
                order.is_duplicate = true;
                arrTemp[1].is_duplicate = false;
                groupOrder.status = arrTemp[1].status;
                if (checkIsConfirm > -1) {
                    const findCollaborator = await this.collaboratorRepositoryService.findOneById(arrTemp[checkIsConfirm].id_collaborator);
                    let previousBalance: any = {
                        refundPlatformFee: {
                            gift_remainder: findCollaborator.gift_remainder,
                            remainder: findCollaborator.remainder,
                            work_wallet: findCollaborator.work_wallet,
                            collaborator_wallet: findCollaborator.collaborator_wallet,
                            date_create: new Date().toISOString()
                        },
                        minusPlatformFee: {
                            gift_remainder: 0,
                            remainder: 0,
                            work_wallet: 0,
                            collaborator_wallet: 0,
                            date_create: null
                        }
                    }

                    findCollaborator.gift_remainder += order.work_shift_deposit;
                    // don dau tien khi nhan cong viec se tru tien trong work_wallet, cac don ve sau tru trong collaborator_wallet, neu da tung co don hoan thanh roi thi tra vao vi collaborator_wallet
                    const checkCollaboratorDone = await this.orderModel.findOne({ id_collaborator: findCollaborator._id, status: "done", id_group_order: groupOrder._id });
                    if (checkCollaboratorDone) findCollaborator.collaborator_wallet += order.work_shift_deposit;
                    else findCollaborator.work_wallet += order.work_shift_deposit;
                    await this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, order.work_shift_deposit, order, getService, groupOrder._id, previousBalance.refundPlatformFee)
                    previousBalance.minusPlatformFee.gift_remainder = findCollaborator.gift_remainder
                    previousBalance.minusPlatformFee.remainder = findCollaborator.remainder
                    previousBalance.minusPlatformFee.work_wallet = findCollaborator.work_wallet
                    previousBalance.minusPlatformFee.collaborator_wallet = findCollaborator.collaborator_wallet
                    previousBalance.minusPlatformFee.date_create = new Date().toISOString()


                    let tempRemainder = (checkCollaboratorDone) ? findCollaborator.collaborator_wallet : findCollaborator.work_wallet;
                    tempRemainder = tempRemainder - arrTemp[1].platform_fee - arrTemp[1].pending_money;
                    if (tempRemainder < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN_COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);

                    if (checkCollaboratorDone) findCollaborator.collaborator_wallet = tempRemainder
                    else findCollaborator.work_wallet = tempRemainder
                    // await this.collaboratorSystemService.checkBalanceMiniusOrder(lang, findCollaborator, groupOrder, arrTemp[1]);
                    const tempConfirmOrder = await this.collaboratorSystemService.calculateBalance(lang, findCollaborator, (arrTemp[1].pending_money + arrTemp[1].platform_fee))
                    findCollaborator.gift_remainder = tempConfirmOrder.gift_remainder;
                    findCollaborator.remainder = tempConfirmOrder.remainder;

                    await findCollaborator.save();
                    this.activityCollaboratorSystemService.minusPlatformFee(findCollaborator, (arrTemp[1].platform_fee + arrTemp[1].pending_money), arrTemp[1], getService, groupOrder._id, previousBalance.minusPlatformFee)
                }
                await arrTemp[1].save();
            } else if (order.is_duplicate === true && arrTemp.length > 1) {
                groupOrder.status = arrTemp[1].status;
            } else {
                groupOrder.status = "cancel";
                if (checkIsConfirm > -1) {
                    const findCollaborator = await this.collaboratorRepositoryService.findOneById(arrTemp[checkIsConfirm].id_collaborator);
                    const previousBalance = {
                        gift_remainder: findCollaborator.gift_remainder,
                        remainder: findCollaborator.remainder,
                        work_wallet: findCollaborator.work_wallet,
                        collaborator_wallet: findCollaborator.collaborator_wallet
                    }
                    findCollaborator.gift_remainder += order.work_shift_deposit
                    // findCollaborator.gift_remainder += order.pending_money;

                    const checkCollaboratorDone = await this.orderModel.findOne({ id_collaborator: findCollaborator._id, status: "done", id_group_order: groupOrder._id });
                    if (checkCollaboratorDone) findCollaborator.collaborator_wallet += order.work_shift_deposit;
                    else findCollaborator.work_wallet += order.work_shift_deposit;

                    await findCollaborator.save();
                    const getService = await this.serviceModel.findById(groupOrder.service["_id"]);
                    if (getService) {
                        this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, order.work_shift_deposit, order, getService, groupOrder._id, previousBalance)
                    }
                }
            }
            const getCustomer = await this.customerRepositoryService.findOneById(groupOrder.id_customer.toString());
            const previousBalance = getCustomer.pay_point
            if (groupOrder.payment_method === "point") {
                getCustomer.cash = getCustomer.cash + order.final_fee;
                getCustomer.pay_point = getCustomer.pay_point + order.final_fee;
                await getCustomer.save();
                this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, order.final_fee, groupOrder, order, previousBalance)
            }
            if (typeUserAction === 'admin') {
                const query = {
                    $and: [
                        { is_delete: false },
                        { apply_user: 'admin' },
                        { _id: idCancel }
                    ]
                }
                const checkReasonCancel = await this.reasonCancelModel.findOne(query);
                if (!checkReasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'reason')], HttpStatus.BAD_REQUEST);
                order.id_cancel_user_system = {
                    id_reason_cancel: checkReasonCancel._id,
                    date_create: new Date(Date.now()).toISOString(),
                    id_user_system: idAdmin
                }
                if (groupOrder.status === "cancel" || groupOrder.status === "done") {
                    groupOrder.id_cancel_user_system = {
                        id_reason_cancel: checkReasonCancel._id,
                        date_create: new Date(Date.now()).toISOString(),
                        id_user_system: idAdmin
                    }
                }
                this.activityAdminSystemService.adminCancelOrder(groupOrder.id_customer, order._id, groupOrder._id, idCancel, idAdmin);
            } else {
                const query = {
                    $and: [
                        { is_delete: false },
                        { apply_user: 'customer' },
                        { _id: idCancel }
                    ]
                }
                const checkReasonCancel = await this.reasonCancelModel.findOne(query);
                if (!checkReasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'reason')], HttpStatus.BAD_REQUEST);
                order.id_cancel_customer = {
                    id_reason_cancel: checkReasonCancel._id,
                    date_create: new Date(Date.now()).toISOString()
                }
                if (groupOrder.status === "cancel" || groupOrder.status === "done") {
                    groupOrder.id_cancel_customer = {
                        id_reason_cancel: checkReasonCancel._id,
                        date_create: new Date(Date.now()).toISOString(),
                    }
                }
                this.activityCustomerSystemService.cancelOrder(getCustomer._id, order._id, groupOrder._id)
                if (getCustomer.reputation_score > 0) {
                    getCustomer.reputation_score = getCustomer.reputation_score - 1; // tru diem uy tin
                    await getCustomer.save()
                }
                this.activityCustomerSystemService.cancelOrder(groupOrder.id_customer, order._id, groupOrder._id);
            }
            order.status = "cancel";
            for (let i of groupOrder.date_work_schedule) {
                let check = isEqual(new Date(order.date_work), new Date(i.date));
                if (check) {
                    i.status = 'cancel'
                }
            }
            order.pending_money = 0;
            groupOrder.temp_net_income_collaborator = groupOrder.temp_net_income_collaborator - order.net_income_collaborator;
            groupOrder.temp_pending_money = groupOrder.temp_pending_money - order.pending_money;
            groupOrder.temp_refund_money = groupOrder.temp_refund_money - order.refund_money;
            groupOrder.temp_initial_fee = groupOrder.temp_initial_fee - order.initial_fee;
            groupOrder.temp_final_fee = groupOrder.temp_final_fee - order.final_fee;
            groupOrder.temp_platform_fee = groupOrder.temp_platform_fee - order.platform_fee;
            await groupOrder.save();
            await order.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderSingle(lang, order: OrderDocument, groupOrder: GroupOrderDocument, idCancel, typeUserAction, idAdmin?) {
        try {
            const query = {
                $and: [
                    {
                        $or: [
                            { status: "confirm" },
                            { status: "doing" }
                        ]
                    },
                    { id_group_order: groupOrder._id }
                ]
            }
            const checkIsConfirmOrDoing = await this.orderModel.findOne(query);
            if (checkIsConfirmOrDoing) {
                const findCollaborator = await this.collaboratorRepositoryService.findOneById(checkIsConfirmOrDoing.id_collaborator.toString());
                if (!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
                const previousBalance: previousBalanceCollaboratorDTO = {
                    gift_remainder: findCollaborator.gift_remainder,
                    remainder: findCollaborator.remainder,
                    collaborator_wallet: findCollaborator.collaborator_wallet,
                    work_wallet: findCollaborator.work_wallet
                }
                findCollaborator.gift_remainder += checkIsConfirmOrDoing.work_shift_deposit;
                // findCollaborator.gift_remainder += checkIsConfirmOrDoing.pending_money;

                findCollaborator.work_wallet += checkIsConfirmOrDoing.work_shift_deposit;
                // findCollaborator.work_wallet += checkIsConfirmOrDoing.pending_money;
                await findCollaborator.save();
                const getService = await this.serviceModel.findById(groupOrder.service["_id"]);
                if (getService) {
                    this.activityCollaboratorSystemService.refundPlatformFee(findCollaborator, order.work_shift_deposit, order, getService, groupOrder._id, previousBalance)
                }
            }
            groupOrder.status = "cancel";
            const getCustomer = await this.customerRepositoryService.findOneById(groupOrder.id_customer.toString());
            const previousBalance = getCustomer.pay_point
            if (groupOrder.payment_method === "point") {
                getCustomer.cash = getCustomer.cash + order.final_fee;
                getCustomer.pay_point = getCustomer.pay_point + order.final_fee;
                await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
                this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, order.final_fee, groupOrder, order, previousBalance)
            }
            if (typeUserAction === 'admin') {
                order.id_cancel_user_system = {
                    id_reason_cancel: idCancel,
                    date_create: new Date(Date.now()).toISOString(),
                    id_user_system: idAdmin
                }
                if (groupOrder.status === "cancel" || groupOrder.status === "done") {
                    groupOrder.id_cancel_user_system = {
                        id_reason_cancel: idCancel,
                        date_create: new Date(Date.now()).toISOString(),
                        id_user_system: idAdmin
                    }
                }
                this.activityAdminSystemService.adminCancelOrder(order.id_customer, order._id, groupOrder._id, idCancel, idAdmin);
            } else {
                order.id_cancel_customer = {
                    id_reason_cancel: idCancel,
                    date_create: new Date(Date.now()).toISOString()
                }
                if (groupOrder.status === "cancel" || groupOrder.status === "done") {
                    groupOrder.id_cancel_customer = {
                        id_reason_cancel: idCancel,
                        date_create: new Date(Date.now()).toISOString(),
                    }
                }
                this.activityCustomerSystemService.cancelOrder(getCustomer._id, order._id, groupOrder._id)
                if (getCustomer.reputation_score > 0) {
                    getCustomer.reputation_score = getCustomer.reputation_score - 1; // tru diem uy tin
                    await getCustomer.save()
                }
            }
            order.status = "cancel";
            for (let i of groupOrder.date_work_schedule) {
                let check = isEqual(new Date(order.date_work), new Date(i.date));
                if (check) {
                    i.status = 'cancel'
                }
            }
            groupOrder.temp_net_income_collaborator = groupOrder.temp_net_income_collaborator - order.net_income_collaborator;
            groupOrder.temp_pending_money = groupOrder.temp_pending_money - order.pending_money;
            groupOrder.temp_refund_money = groupOrder.temp_refund_money - order.refund_money;
            groupOrder.temp_initial_fee = groupOrder.temp_initial_fee - order.initial_fee;
            groupOrder.temp_final_fee = groupOrder.temp_final_fee - order.final_fee;
            groupOrder.temp_platform_fee = groupOrder.temp_platform_fee - order.platform_fee;
            await groupOrder.save();
            await order.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async calculateChangeMoney(payment_method, final_fee, collaborator_fee) {
        try {
            let changeMoney = 0;
            // const getOrder = await this.orderModel.findById(idOrder);
            // if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            // const getService = await this.serviceModel.findById(getOrder.service["_id"]);
            // const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
            // if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            // if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            switch (payment_method) {
                case "cash": {
                    changeMoney = final_fee - collaborator_fee;
                    break;
                }
                case "point": {
                    changeMoney = collaborator_fee;
                    break;
                }
                default: {
                    changeMoney = 0;
                }
            }
            return changeMoney;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async changeStatusOrderLoop(order, groupOrder, idAdmin, collaborator, service) {
        try {
            if (order.status === 'confirm') {
                order.status = 'doing';
                groupOrder.status = 'doing';
                for (let i of groupOrder.date_work_schedule) {
                    if (i.status === 'confirm') {
                        i.status = 'doing';
                    }
                }
                await this.activityAdminSystemService.adminChangeStatusOrderToDoing(idAdmin, order._id);
            } else if (order.status === 'doing') {
                order.status = 'done';
                groupOrder.status = 'done';
                for (let i of groupOrder.date_work_schedule) {
                    if (i.status === 'doing') {
                        i.status = 'done';
                    }
                }
                this.calculateAccumulatePoints(order._id, groupOrder._id);
                this.activityCollaboratorSystemService.doneOrder(groupOrder.id_collaborator, order._id, groupOrder._id);
                if (order.refund_money > 0 && order.payment_method === "cash") {
                    const previousBalance: previousBalanceCollaboratorDTO = {
                        remainder: collaborator.remainder,
                        gift_remainder: collaborator.gift_remainder,
                        collaborator_wallet: collaborator.wallet,
                        work_wallet: collaborator.wallet
                    }
                    collaborator.remainder += order.refund_money;
                    await collaborator.save();
                    this.activityCollaboratorSystemService.receiveRefundMoney(collaborator, order.refund_money, order, service, groupOrder._id, previousBalance);
                }
                if (groupOrder.is_auto_order === true) {
                    // tạo đơn hàng mới nếu là lặp lại theo tuần
                    //    await this.groupOrderSystemService.processGroupOrderLoopWeek('vi', groupOrder._id);
                }
            } else {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, "vi", null)], HttpStatus.BAD_REQUEST);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param lang ngôn ngữ trả lỗi
     * @param idOrder thông tin của đơn hàng
     * @param collaborator thông tin của ctv
     * @param admin thông tin của admin
     * @param version version của ctv
     * @param checkTime kiểm tra trùng giờ
     * @returns thông tin đơn hàng sau khi xử lý
     */
    async orderPendingToConfirm(lang, idOrder, collaborator: CollaboratorDocument, subjectAction, admin?: UserSystemDocument, version?: string, checkTime?: boolean) {
        try {
            const dateNow = new Date(Date.now()).getTime();
            const getItem = await this.orderModel.findById(idOrder).populate({ path: 'id_customer', select: { avatar: 1, name: 1, code_phone_area: 1, phone: 1 } })
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
            await this.checkStatusOrder(getItem, ['cancel', 'doing', 'done', 'confirm'], lang)
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
            if (new Date(getItem.date_work).getTime() - dateNow < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_OUTDATED, lang, null)], HttpStatus.NOT_FOUND);
            ///////////////////////////////////////// check xem co trung gio khong ///////////////////////////////////////////////
            if (checkTime) await this.checkOverlapOrder(collaborator._id, getGroupOrder._id, lang);

            let getCustomer = await this.customerOopSystemService.getDetailItem(lang, getItem.id_customer)

            // Khoi tao thong tin
            const payloadDependency = {
                order: getItem,
                group_order: getGroupOrder,
                collaborator: null,
                admin_action: null,
            }

            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            //////////////////////////////////////// check xem có bị chặn không //////////////////////////////////////////////
            const checkBlockCollaborator = getItem.id_block_collaborator.includes(collaborator._id);
            if (checkBlockCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER_BLOCK_COLLABORATOR, lang, null)], HttpStatus.NOT_FOUND);
            //////////////////////////////////////// check xem CTV đã từng hủy đơn //////////////////////////////////
            let checkCancelCollaborator: boolean = false;
            for (let item of getItem.id_cancel_collaborator) {
                if (item["id_collaborator"].toString() === collaborator._id.toString()) {
                    checkCancelCollaborator = true;
                }
            }
            if (checkCancelCollaborator && !admin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED_BY_COLLABORATOR, lang, null)], HttpStatus.NOT_FOUND);
            ///////////////////////////////////////// tinh phi tru nen tang///////////////////////////////////////////////
            const previousBalance: previousBalanceCollaboratorDTO = {
                collaborator_wallet: collaborator.collaborator_wallet,
                work_wallet: collaborator.work_wallet,
            }
            let tempWallet = 0;
            tempWallet = collaborator.work_wallet - getItem.platform_fee - getItem.pending_money;

            ///////////////////////////////////////// OPEN chuyển đổi tiền tệ giữa các ví /////////////////////////////////////////
            if (collaborator.is_auto_change_money
                && collaborator.collaborator_wallet >= tempWallet
                && tempWallet < 0) {
                collaborator = await this.collaboratorSystemService.changeMoneyWallet(collaborator, -tempWallet)
                previousBalance.remainder = collaborator.remainder;
                previousBalance.gift_remainder = collaborator.gift_remainder;
                previousBalance.collaborator_wallet = collaborator.collaborator_wallet;
                previousBalance.work_wallet = collaborator.work_wallet;
                tempWallet = collaborator.work_wallet - getItem.platform_fee - getItem.pending_money;
            }
            ///////////////////////////////////////// END chuyển đổi tiền tệ giữa các ví /////////////////////////////////////////
            if (tempWallet < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.BAD_REQUEST);
            collaborator.work_wallet = tempWallet;
            ///////////////////////////////////////// OPEN update id doanh nghiệp khi nhận việc /////////////////////////////////////////
            if (collaborator.id_business) {
                getItem.id_business = collaborator.id_business
            }
            ///////////////////////////////////////// END update id doanh nghiệp khi nhận việc /////////////////////////////////////////
            ///////////////////////////////////////// dua viec cho CTV ///////////////////////////////////////////////
            if (getGroupOrder.type === 'schedule') {
                const arrOrderByGroupOrder = await this.orderModel.find({ $and: [{ id_group_order: getGroupOrder._id }, { status: "pending" }] })
                const arrPromiseOrder = [];
                for (let i = 0; i < arrOrderByGroupOrder.length; i++) {
                    arrOrderByGroupOrder[i].status = "confirm";
                    arrOrderByGroupOrder[i].id_collaborator = collaborator._id;
                    arrOrderByGroupOrder[i].index_search_collaborator = collaborator.index_search;

                    /// update id doanh nghiệp khi nhận việc
                    if (collaborator.id_business) {
                        arrOrderByGroupOrder[i].id_business = collaborator.id_business
                    }
                    /// update id doanh nghiệp khi nhận việc
                    getGroupOrder.date_work_schedule[i].status = "confirm"
                    arrPromiseOrder.push(arrOrderByGroupOrder[i].save());
                }
                await Promise.all(arrPromiseOrder)
                getGroupOrder.status = "confirm";
                getGroupOrder.id_collaborator = collaborator._id;
                getGroupOrder.phone_collaborator = collaborator.phone;
                getGroupOrder.name_collaborator = collaborator.full_name;
                getGroupOrder.index_search_collaborator = collaborator.index_search;
            } else {
                getGroupOrder.status = "confirm";
                getGroupOrder.date_work_schedule[0].status = "confirm";
                getItem.status = "confirm";
                getGroupOrder.id_collaborator = collaborator._id;
                getGroupOrder.phone_collaborator = collaborator.phone;
                getGroupOrder.name_collaborator = collaborator.full_name;
                getGroupOrder.index_search_collaborator = collaborator.index_search;
                
                getItem.id_collaborator = collaborator._id
                getItem.phone_collaborator = collaborator.phone;
                getItem.name_collaborator = collaborator.full_name;
                getItem.index_search_collaborator = collaborator.index_search;

            }
            ///////////////////////////////////////// dua viec cho CTV ///////////////////////////////////////////////
            ///////////////////////////////////////// luu thong tin lai ///////////////////////////////////////////////
            payloadDependency.order = await getItem.save();
            payloadDependency.collaborator = await collaborator.save();
            getGroupOrder.collaborator_version = (version) ? version.toString() : '0';
            payloadDependency.group_order = await getGroupOrder.save();
            ///////////////////////////////////////// luu thong tin lai ///////////////////////////////////////////////
            // Log he thong
            await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, getItem.platform_fee + getItem.pending_money, previousBalance)
            await this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency)

            // Tao va ban thong bao
            await this.notificationSystemService.minusPlatformFee(lang, getGroupOrder._id, payloadDependency.order, payloadDependency.collaborator, payloadDependency.order.platform_fee + payloadDependency.order.pending_money)
            await this.notificationSystemService.confirmOrder(lang, payloadDependency.group_order._id, payloadDependency.order, getCustomer, payloadDependency.collaborator)

            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async orderPendingToConfirmV2(lang, idOrder, collaborator, admin?, version?, checkTime?: boolean) {
        try {
            const dateNow = new Date(Date.now()).getTime();
            const getItem = await this.orderModel.findById(idOrder).populate({ path: 'id_customer', select: { avatar: 1, name: 1, code_phone_area: 1, phone: 1 } })
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
            if (getItem.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.status === "confirm") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
            if (new Date(getItem.date_work).getTime() - dateNow < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_OUTDATED, lang, null)], HttpStatus.NOT_FOUND);
            ///////////////////////////////////////// check xem có trùng giờ làm không ///////////////////////////////////////////////
            if (checkTime) {
                if (getGroupOrder.type === 'schedule') {
                    const getArrOrder = await this.orderModel.find({
                        $and: [
                            { id_group_order: getGroupOrder._id },
                            { status: 'pending' }
                        ]
                    });
                    for (let item of getArrOrder) {
                        const checkTimeStart = sub(new Date(item.date_work), { minutes: 30 }).toISOString();
                        const checkTimeEnd = add(new Date(item.end_date_work), { minutes: 30 }).toISOString();
                        const queryOrder = {
                            $and: [
                                { id_collaborator: collaborator._id },
                                { status: { $in: ['confirm', 'doing'] } },
                                {
                                    $or: [
                                        { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                        { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                    ]
                                }
                            ]
                        }
                        const getOrder = await this.orderModel.find(queryOrder);
                        if (getOrder.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
                    }
                } else {
                    const checkTimeStart = sub(new Date(getItem.date_work), { minutes: 30 }).toISOString();
                    const checkTimeEnd = add(new Date(getItem.end_date_work), { minutes: 30 }).toISOString();
                    const queryOrder = {
                        $and: [
                            { id_collaborator: collaborator._id },
                            { status: { $in: ['confirm', 'doing'] } },
                            {
                                $or: [
                                    { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                    { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                ]
                            }
                        ]
                    }
                    const getOrder = await this.orderModel.find(queryOrder);
                    if (getOrder.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
                }
            }
            //////////////////////////////////////// check xem có bị chặn không //////////////////////////////////////////////
            const checkBlockCollaborator = getItem.id_block_collaborator.includes(collaborator._id);
            if (checkBlockCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
            //////////////////////////////////////// check xem CTV đã từng hủy đơn //////////////////////////////////
            let checkCancelCollaborator: boolean = false;
            for (let item of getItem.id_cancel_collaborator) {
                if (item["id_collaborator"].toString() === collaborator._id.toString()) {
                    checkCancelCollaborator = true;
                }
            }
            // const checkAdmin = await 
            if (checkCancelCollaborator && !admin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
            ///////////////////////////////////////// Tính phí trừ nền tảng ///////////////////////////////////////////////
            const previousBalance = {
                remainder: collaborator.remainder,
                gift_remainder: collaborator.gift_remainder
            }

            let tempRemainder = 0;
            tempRemainder = collaborator.gift_remainder - getItem.platform_fee;
            // if (getGroupOrder.payment_method === "cash") {
            tempRemainder = tempRemainder - getItem.pending_money;
            // }
            if (tempRemainder < 0) {
                const tempRemainderAbs = Math.abs(tempRemainder);
                if (collaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
                collaborator.remainder = collaborator.remainder - tempRemainderAbs;
                collaborator.gift_remainder = 0;
            } else {
                collaborator.gift_remainder = tempRemainder;
            }

            ///////////////////////////////////////// End Tính phí trừ nền tảng ///////////////////////////////////////////////
            ///////////////////////////////////////// Kiểm tra xem có phải có nhiều người làm không ///////////////////////////////////////////////

            ///////////////////////////////////////// End Tính phí trừ nền tảng ///////////////////////////////////////////////
            /// update id doanh nghiệp khi nhận việc
            if (collaborator.id_business) {
                getItem.id_business = collaborator.id_business
            }
            /// update id doanh nghiệp khi nhận việc
            ///////////////////////////////////////// Đưa việc cho CTV ///////////////////////////////////////////////
            if (getGroupOrder.type === 'schedule') {
                const arrOrderByGroupOrder = await this.orderModel.find({ $and: [{ id_group_order: getGroupOrder._id }, { status: "pending" }] })
                const arrPromiseOrder = [];
                for (let i = 0; i < arrOrderByGroupOrder.length; i++) {
                    arrOrderByGroupOrder[i].status = "confirm";
                    arrOrderByGroupOrder[i].id_collaborator = collaborator._id;
                    /// update id doanh nghiệp khi nhận việc
                    if (collaborator.id_business) {
                        arrOrderByGroupOrder[i].id_business = collaborator.id_business
                    }
                    /// update id doanh nghiệp khi nhận việc
                    getGroupOrder.date_work_schedule[i].status = "confirm"
                    arrPromiseOrder.push(arrOrderByGroupOrder[i].save());
                }
                await Promise.all(arrPromiseOrder)
                getGroupOrder.status = "confirm";
                getGroupOrder.id_collaborator = collaborator._id;
                getGroupOrder.phone_collaborator = collaborator.phone;
                getGroupOrder.name_collaborator = collaborator.full_name;
            } else if (getGroupOrder.type !== 'schedule' && getGroupOrder.personal > 1) {
                const query = {
                    is_delete: false,
                    status: 'pending',
                    id_group_order: getGroupOrder._id
                }
                const countPendingOrder = await this.orderModel.count(query)
                if (countPendingOrder === 1) {
                    // nếu là đơn cuối cùng thì chuyển đơn sang trạng thái confirm
                    getGroupOrder.status = "confirm";
                    getGroupOrder.date_work_schedule[0].status = "confirm";
                } else if (countPendingOrder === getGroupOrder.personal) {
                    // nếu là đơn đầu tiên thì lưu thông CTV trưởng vào  group order
                    getGroupOrder.id_collaborator = collaborator._id;
                    getGroupOrder.phone_collaborator = collaborator.phone;
                    getGroupOrder.name_collaborator = collaborator.full_name;
                }
                getGroupOrder.group_id_collaborator_second.push({
                    gross_income_collaborator: 0,
                    net_income_collaborator: Number(getItem.net_income_collaborator),
                    pending_money: Number(getItem.pending_money),
                    refund_money: Number(getItem.refund_money),
                    _id: collaborator._id
                })
            } else {
                getGroupOrder.status = "confirm";
                getGroupOrder.date_work_schedule[0].status = "confirm";
                getGroupOrder.id_collaborator = collaborator._id;
                getGroupOrder.phone_collaborator = collaborator.phone;
                getGroupOrder.name_collaborator = collaborator.full_name;
            }
            // sau đó thì lưu lại thông tin của CTV vào ca làm
            getItem.status = "confirm";
            getItem.id_collaborator = collaborator._id
            getItem.phone_collaborator = collaborator.phone;
            getItem.name_collaborator = collaborator.full_name;
            ///////////////////////////////////////// End Đưa việc cho CTV ///////////////////////////////////////////////

            ///////////////////////////////////////// Mở khóa các đơn hàng dulicate của các đơn liên quan ///////////////////////////////////////////////
            if (getItem.is_captain && getGroupOrder.personal > 1) {
                const query = {
                    is_delete: false,
                    // status: 'pending',
                    id_group_order: getGroupOrder._id,
                    is_duplicate: false
                }
                const duplicateOrder = await this.orderModel.find(query)
                for (let item of duplicateOrder) {
                    item.is_duplicate = false;
                    await item.save();
                }
            }
            ///////////////////////////////////////// END Mở khóa các đơn hàng dulicate của các đơn liên quan ///////////////////////////////////////////////

            ///////////////////////////////////////// Lưu lại thông tin ///////////////////////////////////////////////
            const result = await getItem.save();
            await collaborator.save();
            getGroupOrder.collaborator_version = (version) ? version.toString() : '0';
            await getGroupOrder.save();
            ///////////////////////////////////////// End Lưu lại thông tin ///////////////////////////////////////////////
            await this.activityCollaboratorSystemService.confirmOrder(collaborator, getItem._id, getGroupOrder)
            this.activityCollaboratorSystemService.minusPlatformFee(collaborator, (getItem.platform_fee + getItem.pending_money), getItem, getService, getGroupOrder._id, previousBalance)
            // if (getItem.payment_method === "cash") {
            //     this.activityCollaboratorSystemService.minusPendingMoney(collaborator, getItem.pending_money, getItem, getService, getGroupOrder._id)
            // }

            //////////// Tạo phòng chat tự động /////////////////////////////////
            // const payload = {
            //     id_order: result._id
            // }
            // await this.roomService.create(lang, payload);
            //////////// Kết thúc Tạo phòng chat tự động /////////////////////////////////
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async orderConfirmToDoingV2(lang, idOrder, collaborator, admin?: UserSystemDocument) {
        try {
            const getItem = await this.orderModel.findById(idOrder);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.BAD_REQUEST);
            if (getItem.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.BAD_REQUEST);
            if (getItem.status === 'doing') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.BAD_REQUEST);
            const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getGroupOrder.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.BAD_REQUEST);
            if (getGroupOrder.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.BAD_REQUEST);
            if (getGroupOrder.status === 'doing') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.BAD_REQUEST);
            if (getGroupOrder.status === 'started') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.BAD_REQUEST);
            const getOrderCaptain = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, is_captain: true })
            if (!getOrderCaptain) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);

            // OPEN Kiểm tra xem CTV còn ca làm nào chưa hoàn thành không
            const query = {
                $and: [
                    {
                        id_collaborator: collaborator._id,
                    },
                    {
                        status: "doing",
                    }
                ]
            }
            const getOrderDoing = await this.orderModel.find(query);
            if (getOrderDoing.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NEED_DONE_ORDER, lang, null)], HttpStatus.FORBIDDEN);
            // END Kiểm tra xem CTV còn ca làm nào chưa hoàn thành không

            // const dateWork = new Date(getItem.date_work).getTime();
            // const dateNow = new Date(Date.now()).getTime();
            // if ((dateWork - dateNow) > 900000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_YET_TIME_WORK, lang, null)], HttpStatus.NOT_FOUND);

            if (getGroupOrder.personal > 1) {
                // nếu đơn hàng có hơn 1 CTV thì rơi vào trường hợp này
                if (!getItem.is_captain) {
                    getItem.status = "started";
                    if (admin) {
                        this.activityAdminSystemService.adminChangeStatusOrderToStated(admin._id, getItem._id);
                    }
                    this.activityCollaboratorSystemService.startedOrder(collaborator._id, getItem, getGroupOrder._id, getOrderCaptain.id_collaborator);
                } else {
                    const query = {
                        $and: [
                            { is_delete: false },
                            { id_group_order: getGroupOrder._id },
                            { status: 'started' },
                            { is_captain: false }
                        ]
                    }
                    const getArrOrder = await this.orderModel.find(query);
                    if (getArrOrder.length < getGroupOrder.personal - 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    // nếu các đơn hàng của CTV phụ nhỏ hơn tổng số CTV phụ thì không bắt đầu ca làm được
                    for (let item of getArrOrder) {
                        item.status = 'doing';
                        item.collaborator_start_date_work = new Date(Date.now()).toDateString();
                        await item.save();
                    }
                    getItem.status = 'doing';
                    getGroupOrder.status = 'doing';
                    if (admin) {
                        this.activityAdminSystemService.adminChangeStatusOrderToDoing(admin._id, getItem._id)
                    }
                    this.activityCollaboratorSystemService.doingOrder(collaborator._id, getItem, getGroupOrder._id)
                }
            } else {
                getItem.status = "doing"
                getItem.collaborator_start_date_work = new Date(Date.now()).toDateString();
                getGroupOrder.status = 'doing';
                if (admin) {
                    this.activityAdminSystemService.adminChangeStatusOrderToDoing(admin._id, getItem._id)
                }
                this.activityCollaboratorSystemService.doingOrder(collaborator._id, getItem, getGroupOrder._id)
            }
            await getItem.save();
            await getGroupOrder.save();
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async orderDoingToDoneV2(lang, idOrder, collaborator, admin?, version?) {
        try {
            const previousBalance: previousBalanceCollaboratorDTO = {
                gift_remainder: collaborator.gift_remainder,
                remainder: collaborator.remainder,
                collaborator_wallet: collaborator.wallet,
                work_wallet: collaborator.wallet
            }
            const currentTime = new Date(Date.now()).toISOString();
            const getItem = await this.orderModel.findById(idOrder);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const subEndTime = subMinutes(new Date(getItem.end_date_work), 15);
            const check = new Date(currentTime).getTime() - subEndTime.getTime();
            // if (check < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_TIME_TO_FINISH, lang, "time")], HttpStatus.BAD_REQUEST);
            if (getItem.status === 'done' || getItem.status === 'cancel' || getItem.status === 'confirm' || getItem.status === 'pending') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_DONE_ORDER, lang, "status")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getGroupOrder.personal > 1 && !getItem.is_captain) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
            const getCustomer = await this.customerRepositoryService.findOneById(getItem.id_customer.toString());
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);

            if (getGroupOrder.personal < 2) {
                getItem.status = "done"
                getItem.collaborator_end_date_work = new Date(Date.now()).toISOString();
                if (getGroupOrder.type === "schedule") {
                    getItem.is_duplicate = true;
                    const index = getGroupOrder.date_work_schedule.findIndex(x => x.date === getItem.date_work);
                    // await getItem.save();
                    if (index + 1 < getGroupOrder.date_work_schedule.length) {
                        const getNextOrder = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, date_work: getGroupOrder.date_work_schedule[index + 1].date })
                        if (getNextOrder) getNextOrder.is_duplicate = false;
                        await getNextOrder.save();

                        getGroupOrder.status = 'confirm';
                    } else {
                        getGroupOrder.status = "done";
                    }
                    if (index > -1) getGroupOrder.date_work_schedule[index].status = "done"
                } else {
                    getGroupOrder.status = "done";
                    getGroupOrder.date_work_schedule[0].status = "done"
                }
                const tempReceiveMoney = (getItem.payment_method === "cash") ? getItem.refund_money : getItem.final_fee + getItem.refund_money;
                collaborator.remainder += tempReceiveMoney;
                if (tempReceiveMoney > 0) {
                    await this.activityCollaboratorSystemService.receiveRefundMoney(collaborator, tempReceiveMoney, getItem, getService, getGroupOrder._id, previousBalance)
                }
                // if (getGroupOrder.payment_method !== "cash") {
                //     collaborator.remainder += getItem.initial_fee;
                //     collaborator.remainder += getItem.pending_money;
                // } else {
                //     collaborator.remainder += getItem.refund_money;
                // }
                // neu don hang la theo goi, tiep tuc nhan viec va tru tiep tien tiep theo
                if (getGroupOrder.type === "schedule") {
                    const query = {
                        $and: [
                            { id_group_order: getGroupOrder._id },
                            { status: "confirm" },
                            { date_work: { $gt: getItem.date_work } }
                        ]
                    }
                    const getOrder = await this.orderModel.find(query).sort({ date_work: 1 });
                    if (getOrder.length > 0) {
                        const previousBalance = {
                            gift_remainder: collaborator.gift_remainder,
                            remainder: collaborator.remainder
                        }
                        const getNextOrder = getOrder[0];
                        getItem.is_duplicate = true;
                        getOrder[0].is_duplicate = false;
                        let tempRemainder = 0;
                        tempRemainder = collaborator.gift_remainder - (getItem.platform_fee + getNextOrder.pending_money);
                        if (tempRemainder < 0) {
                            const tempRemainderAbs = Math.abs(tempRemainder);
                            if (collaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
                            collaborator.remainder = collaborator.remainder - tempRemainderAbs;
                            collaborator.gift_remainder = 0;
                        } else {
                            collaborator.gift_remainder = tempRemainder;
                        }
                        await collaborator.save();
                        this.activityCollaboratorSystemService.minusPlatformFee(collaborator, (getNextOrder.platform_fee + getNextOrder.pending_money), getNextOrder, getService, getGroupOrder._id, previousBalance)
                        // if (getNextOrder.payment_method === "cash") {
                        //     this.activityCollaboratorSystemService.minusPendingMoney(collaborator, , getNextOrder, getService, getGroupOrder._id)
                        // }
                    }
                }
                getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - getItem.net_income_collaborator;
                getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - getItem.pending_money;
                getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - getItem.refund_money;
                getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - getItem.initial_fee;
                getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - getItem.final_fee;
                getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - getItem.platform_fee;
                ////// thêm id của doanh nghiệp để biết doanh nghiệp đó nhận và hoàn thành đơn đó /////////
                if (collaborator.id_business) {
                    getItem.id_business = collaborator.id_business;
                }
                ////// kết thúc thêm id của doanh nghiệp để biết doanh nghiệp đó nhận và hoàn thành đơn đó /////////
                await collaborator.save();
                getGroupOrder.collaborator_version = (version) ? version.toString() : "0";
                await getGroupOrder.save();
                await getItem.save();
                const getCustomer = await this.customerRepositoryService.findOneById(getItem.id_customer.toString());
                if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                if (getCustomer.reputation_score < 100) {
                    getCustomer.reputation_score = getCustomer.reputation_score + 1; //cong lai diem uy tin
                }
                await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
                this.calculateAccumulatePoints(getItem._id, getGroupOrder._id);
                if (admin) {
                    this.activityAdminSystemService.adminChangeStatusOrderToDone(admin._id, getItem._id, collaborator._id, getGroupOrder._id)
                }
                this.activityCollaboratorSystemService.doneOrder(collaborator._id, idOrder, getGroupOrder._id);
                await this.activityCollaboratorSystemService.updateNetCollaborator(collaborator._id, getItem._id);

                ///// logic thêm tiền thưởng cho CTV
                if (getItem.bonus_collaborator !== null && getGroupOrder.personal < 2) {
                    const previousBalanceCollaborator = {
                        gift_remainder: collaborator.gift_remainder,
                        remainder: collaborator.remainder
                    }
                    const collaboratorSetting = await this.collaboratorSettingModel.findOne();
                    let totalBonus: number = getItem.bonus_collaborator["bonus_rush_day"] + getItem.bonus_collaborator["bonus_holiday"] + getItem.bonus_collaborator["bonus_order_hot"] + getItem.bonus_collaborator["bonus_area"];
                    if (collaboratorSetting.bonus_wallet === 'remainder') {
                        collaborator.remainder += totalBonus
                    } else {
                        collaborator.gift_remainder += totalBonus
                    }
                    await collaborator.save();
                    this.activityCollaboratorSystemService.receiveBonusMoney(collaborator, totalBonus, getItem, getService, getGroupOrder._id, previousBalanceCollaborator)
                }
                //// kết thúc logic thêm tiền thưởng ////

                //// logic thêm tiền tip //////
                // if (getItem.tip_collaborator > 0 && getItem.payment_method !== 'cash') {
                //     const previousBalanceCollaborator = {
                //         gift_remainder: collaborator.gift_remainder,
                //         remainder: collaborator.remainder
                //     }
                //     collaborator.remainder += getItem.tip_collaborator
                //     await collaborator.save();
                //     this.activityCollaboratorSystemService.receiveBonusMoney(collaborator, getItem.tip_collaborator, getItem, getService, getGroupOrder._id, previousBalanceCollaborator)
                // }
                //// kết thúc logic thêm tiền tip //////
                ///////////////////////////// cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
                const query = {
                    $and: [
                        { status: 'done' },
                        { is_delete: false },
                        { id_customer: getCustomer._id },
                    ]
                }
                const checkTotalDone = await this.orderModel.count(query);
                if (checkTotalDone === 1 && getCustomer.id_inviter !== null) {
                    // X nhận đc 20K
                    let getInviter = null;
                    let is_customer = true;
                    getInviter = await this.customerRepositoryService.findOneById(getCustomer.id_inviter);
                    if (!getInviter) {
                        getInviter = await this.collaboratorRepositoryService.findOneById(getCustomer.id_inviter);
                        is_customer = false;
                    }
                    if (getInviter) {
                        if (is_customer && (getCustomer.date_create > '2023-05-30T17:00:00.577Z')) {
                            this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 20000);// tặng cho người giới thiệu
                            this.customerSystemService.systemGivePayPoint(lang, getCustomer._id, getInviter.full_name, 20000); // tặng cho chình khách hàng đó
                        } else if (!is_customer) {
                            this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 20000);
                        }
                    }

                }
                //////////////////////////// kết thúc cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
            } else {
                const query = {
                    $and: [
                        { is_delete: false },
                        { id_group_order: getGroupOrder._id },
                        { status: 'doing' }
                    ]
                }
                const getArrOrder = await this.orderModel.find(query);
                for (let i = 0; i < getArrOrder.length; i++) {
                    getItem.status = "done"
                    getItem.collaborator_end_date_work = new Date(Date.now()).toISOString();
                    const getCollaborator = await this.collaboratorRepositoryService.findOneById(getArrOrder[i].id_collaborator.toString());
                    if (getGroupOrder.type === "schedule") {
                        getItem.is_duplicate = true;
                        const index = getGroupOrder.date_work_schedule.findIndex(x => x.date === getItem.date_work);
                        // await getItem.save();
                        if (index + 1 < getGroupOrder.date_work_schedule.length) {
                            const getNextOrder = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, date_work: getGroupOrder.date_work_schedule[index + 1].date })
                            if (getNextOrder) getNextOrder.is_duplicate = false;
                            await getNextOrder.save();
                            getGroupOrder.status = 'confirm';
                        } else {
                            getGroupOrder.status = "done";
                        }
                        if (index > -1) getGroupOrder.date_work_schedule[index].status = "done"
                    } else {
                        getGroupOrder.status = "done";
                        getGroupOrder.date_work_schedule[0].status = "done"
                    }
                    const tempReceiveMoney = (getItem.payment_method === "cash") ? getItem.refund_money : getItem.final_fee + getItem.refund_money;
                    getCollaborator.remainder += tempReceiveMoney;
                    if (tempReceiveMoney > 0) {
                        await this.activityCollaboratorSystemService.receiveRefundMoney(getCollaborator, tempReceiveMoney, getItem, getService, getGroupOrder._id, previousBalance)
                    }
                    getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - getItem.net_income_collaborator;
                    getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - getItem.pending_money;
                    getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - getItem.refund_money;
                    getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - getItem.initial_fee;
                    getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - getItem.final_fee;
                    getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - getItem.platform_fee;
                    if (getCollaborator.id_business) {
                        getItem.id_business = collaborator.id_business;
                    }
                    await this.activityCollaboratorSystemService.updateNetCollaborator(getCollaborator._id, getItem._id);
                    ///////////////////////////// cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
                    const query = {
                        $and: [
                            { status: 'done' },
                            { is_delete: false },
                            { id_customer: getCustomer._id },
                        ]
                    }
                    const checkTotalDone = await this.orderModel.count(query);
                    if (checkTotalDone === 1 && getCustomer.id_inviter !== null) {
                        // X nhận đc 20K
                        let getInviter = null;
                        let is_customer = true;
                        getInviter = await this.customerRepositoryService.findOneById(getCustomer.id_inviter);
                        if (!getInviter) {
                            getInviter = await this.collaboratorRepositoryService.findOneById(getCustomer.id_inviter);
                            is_customer = false;
                        }
                        if (getInviter) {
                            if (is_customer && (getCustomer.date_create > '2023-05-30T17:00:00.577Z')) {
                                this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 20000);// tặng cho người giới thiệu
                                this.customerSystemService.systemGivePayPoint(lang, getCustomer._id, getInviter.full_name, 20000); // tặng cho chình khách hàng đó
                            } else if (!is_customer) {
                                this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 20000);
                            }
                        }

                    }
                    //////////////////////////// kết thúc cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
                    this.activityCollaboratorSystemService.doneOrder(collaborator._id, idOrder, getGroupOrder._id, i !== 0);
                }
                getGroupOrder.collaborator_version = (version) ? version.toString() : "0";
                await getGroupOrder.save();
                await getItem.save();
                if (getCustomer.reputation_score < 100) {
                    getCustomer.reputation_score = getCustomer.reputation_score + 1;
                }
                await getCustomer.save();
                this.calculateAccumulatePoints(getItem._id, getGroupOrder._id);
            }
            const result = {
                groupOrder: getGroupOrder,
                order: getItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * 
     * @param lang ngôn ngữ trả lỗi
     * @param idOrder thông tin id của đơn hàng
     * @param idReasonCancel thông tin id lý do huỷ ca làm
     * @param admin thông tin của admin thực hiện thao tác (*có thể có hoặc không*) 
     * @param is_punish có phạt ctv hay không
     * @returns true or false
     */
    async collaboratorCancelOrder(lang: LANGUAGE, idOrder: string, idReasonCancel: string, admin?: UserSystemDocument, is_punish?: boolean): Promise<boolean> {
        try {
            const getItem = await this.orderModel.findById(idOrder);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            await this.checkStatusOrder(getItem, ['doing', 'done', 'pending', 'cancel'], lang)
            const getCancel = await this.reasonCancelModel.findById(idReasonCancel);
            if (!getCancel || (getCancel && getCancel.apply_user !== "collaborator")) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getItem.id_collaborator.toString());
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const getGroupOrderItem = await this.groupOrderModel.findById(getItem.id_group_order);
            const getService = await this.serviceModel.findById(getGroupOrderItem.service["_id"]);
            const dateWork = new Date(getItem.date_work).getTime();
            const dateNow = new Date(Date.now()).getTime();
            if (admin) {
                await this.activityAdminSystemService.adminChangeStatusOrderToCancel(admin._id, getItem._id, getCollaborator._id, getGroupOrderItem._id)
            }
            const timeCancelJob = dateWork - dateNow;
            // Truyền số phút để bắn thông báo tương ứng: timeCancelJob/60000
            await this.activityCollaboratorSystemService.cancelOrder(getCollaborator, getItem, getCancel, getGroupOrderItem._id, timeCancelJob / 60000);


            let previousBalanceRefund = {
                gift_remainder: getCollaborator.gift_remainder,
                remainder: getCollaborator.remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet,
                date_create: new Date(Date.now()).toISOString()
            }
            getCollaborator.work_wallet += getItem.work_shift_deposit;
            await getCollaborator.save();
            await this.activityCollaboratorSystemService.refundPlatformFee(getCollaborator, getItem.work_shift_deposit, getItem, getService, getGroupOrderItem._id, previousBalanceRefund)
            if (is_punish) {
                let payload: createPunishTicketFromPolicyDTO = {
                    id_collaborator: getCollaborator._id,
                    id_punish_policy: '',
                    id_order: getItem._id,
                    is_verify_now: true,
                }
                const previousBalance = {
                    work_wallet: getCollaborator.work_wallet,
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                }
                if (timeCancelJob < 2 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634662361c1079edc4cf069';
                } else if (timeCancelJob < 8 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634664761c1079edc4cf09a';
                } else {
                    payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
                }
                let ticket = await this.punishTicketSystemService.createPunishTicketFromPolicy("vi", payload);
                await this.activitySystemService.createPunishTicket(ticket);
                ticket = await this.punishTicketSystemService.standbyToWaitingPunishTicket("vi", ticket);
                const punishTicket = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi", ticket);
                const transaction = await this.transactionRepositoryService.findOneById(punishTicket.id_transaction);
                if (transaction) {
                    await this.activitySystemService.createTransaction(transaction);
                    await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction);
                    await this.activitySystemService.verifyPunishCollaboratorTransaction(transaction, previousBalance)
                }
                await this.punishTicketSystemService.doingToDonePunishTicket('vi', punishTicket);
            }
            const query = {
                $and: [
                    { is_delete: false },
                    { status: 'confirm' },
                    { id_group_order: getItem.id_group_order }
                ]
            }
            const arrOrder = await this.orderModel.find(query).sort({ date_work: 1 });
            for (let order of arrOrder) {
                order.status = "pending";
                order.id_collaborator = null;
                order.phone_collaborator = null;
                order.name_collaborator = null;
                order.id_cancel_collaborator.push({
                    id_reason_cancel: idReasonCancel,
                    id_collaborator: getCollaborator._id,
                    date_create: new Date(Date.now()).toISOString()
                })
                // await order.save();
                this.orderRepositoryService.findByIdAndUpdate(order._id, order);
            }
            getGroupOrderItem.id_collaborator = null;
            getGroupOrderItem.phone_collaborator = null;
            getGroupOrderItem.name_collaborator = null;
            getGroupOrderItem.status = "pending";
            getGroupOrderItem.id_cancel_collaborator.push({
                id_reason_cancel: idReasonCancel,
                id_collaborator: getCollaborator._id,
                date_create: new Date(Date.now()).toISOString()
            })
            for (let i of getGroupOrderItem.date_work_schedule) {
                if (i.status === 'confirm') {
                    i.status = 'pending'
                }
            }
            // await getGroupOrderItem.save();
            this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrderItem._id, getGroupOrderItem)
            console.log('this here 7');
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async orderConfirmToDoing(lang, idOrder, collaborator, subjectAction, admin?) {
        try {
            const getItem = await this.orderModel.findById(idOrder);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);

            // Khoi tao thong tin
            const payloadDependency = {
                order: getItem,
                group_order: null,
                collaborator: collaborator,
                admin_action: null,
            }

            const getCustomer = await this.customerModel.findById(getItem.id_customer);

            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            const query = {
                $and: [
                    {
                        id_collaborator: collaborator._id,
                    },
                    {
                        status: "doing",
                    }
                ]
            }
            const getOrderDoing = await this.orderModel.find(query);
            if (getOrderDoing.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NEED_DONE_ORDER, lang, null)], HttpStatus.FORBIDDEN);
            const dateWork = new Date(getItem.date_work).getTime();
            const dateNow = new Date(Date.now()).getTime();
            if ((dateWork - dateNow) > 900000 && (!admin || admin === null)) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_YET_TIME_WORK, lang, null)], HttpStatus.NOT_FOUND);
            getItem.status = "doing"
            getItem.collaborator_start_date_work = new Date(Date.now()).toDateString();
            const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            getGroupOrder.status = 'doing';

            // for (let item of getGroupOrder.date_work_schedule) {
            //     if (item.status === 'confirm') {
            //         item.status = 'doing'
            //         break; // dừng vòng lặp. chỉ cần thay đổi trạng thái cộng việc tiếp theo
            //     }
            // }
            await getGroupOrder.save();
            getItem.id_collaborator = collaborator._id
            const result = await getItem.save();
            payloadDependency.order = result
            // this.activityCollaboratorSystemService.doingOrder(collaborator._id, result, getGroupOrder._id);
            // admin ? this.activityAdminSystemService.adminChangeStatusOrderToDoing(admin._id, getItem._id) : null

            // Log he thong
            await this.historyActivityOopSystemService.doingOrder(subjectAction, payloadDependency)

            // Tao va ban thong bao
            await this.notificationSystemService.doingOrder(lang, getGroupOrder._id, payloadDependency.order, getCustomer, payloadDependency.collaborator)

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async orderDoingToDoneBackup(lang, idOrder, collaborator: CollaboratorDocument, admin?, version?) {
    //     try {
    //         // let collaboratorFee = 0;
    //         const previousBalance: previousBalanceCollaboratorDTO = {
    //             gift_remainder: collaborator.gift_remainder,
    //             remainder: collaborator.remainder,
    //             collaborator_wallet: collaborator.collaborator_wallet,
    //             work_wallet: collaborator.work_wallet,
    //         }
    //         const currentTime = new Date(Date.now()).toISOString();
    //         const getItem = await this.orderModel.findById(idOrder);
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         const subEndTime = subMinutes(new Date(getItem.end_date_work), 15);
    //         const check = new Date(currentTime).getTime() - subEndTime.getTime();
    //         // if (check < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_TIME_TO_FINISH, lang, "time")], HttpStatus.BAD_REQUEST);
    //         this.checkStatusOrder(getItem, ['cancel', 'confirm', 'pending'], lang)
    //         // if (getItem.status === 'done' || getItem.status === 'cancel' || getItem.status === 'confirm' || getItem.status === 'pending') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_DONE_ORDER, lang, "status")], HttpStatus.NOT_FOUND);
    //         getItem.status = "done"
    //         getItem.collaborator_end_date_work = new Date(Date.now()).toISOString();
    //         const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
    //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
    //         if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);

    //         //////////////////////////////////////// OPEN Trả tiền cho CTV ////////////////////////////////////////
    //         // const tempReceiveMoney = (getItem.payment_method === "cash") ? getItem.refund_money : getItem.final_fee + getItem.refund_money;
    //         const tempReceiveMoney = (getItem.payment_method === "cash") ? getItem.refund_money : getItem.initial_fee;
    //         collaborator.collaborator_wallet += tempReceiveMoney;
    //         if (tempReceiveMoney > 0) {
    //             await this.activityCollaboratorSystemService.receiveRefundMoney(collaborator, tempReceiveMoney, getItem, getService, getGroupOrder._id, previousBalance)
    //         }
    //         //////////////////////////////////////// END Trả tiền cho CTV ////////////////////////////////////////

    //         //////////////////////////// lua chon ngay tiep theo de cho hien thi len //////////////////////////////////////
    //         // if (getGroupOrder.type === "schedule") {
    //         //     getItem.is_duplicate = true;
    //         //     const index = getGroupOrder.date_work_schedule.findIndex(x => x.date === getItem.date_work);
    //         //     getGroupOrder.date_work_schedule[index].status = "done"

    //         //     const checkStillOrderDone = await this.orderModel.findOne({status: "confirm", id_group_order: getGroupOrder._id, _id: {$ne: getItem._id}}).sort({date_work: 1});
    //         //     if(checkStillOrderDone) {
    //         //         checkStillOrderDone.is_duplicate = false;
    //         //         checkStillOrderDone.save();
    //         //     } else {
    //         //         getGroupOrder.status = "done";
    //         //     }

    //         // } else {
    //         //     getGroupOrder.status = "done";
    //         //     getGroupOrder.date_work_schedule[0].status = "done"
    //         // }

    //         // if (getGroupOrder.type === "schedule") {
    //         //     getItem.is_duplicate = true;
    //         //     const index = getGroupOrder.date_work_schedule.findIndex(x => x.date === getItem.date_work);
    //         //     // await getItem.save();
    //         //     if (index + 1 < getGroupOrder.date_work_schedule.length) {
    //         //         const getNextOrder = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, date_work: getGroupOrder.date_work_schedule[index + 1].date })
    //         //         if (getNextOrder) getNextOrder.is_duplicate = false;
    //         //         await getNextOrder.save();
    //         //         getGroupOrder.status = 'confirm';
    //         //     } else {
    //         //         getGroupOrder.status = "done";
    //         //     }
    //         //     if (index > -1) getGroupOrder.date_work_schedule[index].status = "done"
    //         // } else {
    //         //     getGroupOrder.status = "done";
    //         //     getGroupOrder.date_work_schedule[0].status = "done"
    //         // }
    //         //////////////////////////// END lua chon ngay tiep theo de cho hien thi len //////////////////////////////////////

    //         //////////////////////////////////////// OPEN kiểm tra tiền của CTV ////////////////////////////////////////

    //         let checkMoneyWallet = true;

    //         //////////////////////////////////////// END kiểm tra tiền của CTV ////////////////////////////////////////
    //         // neu don hang la theo goi, tiep tuc nhan viec va tru tiep tien tiep theo
    //         if (getGroupOrder.type === "schedule") {
    //             const query = {
    //                 $and: [
    //                     { id_group_order: getGroupOrder._id },
    //                     { status: "confirm" },
    //                     { date_work: { $gt: getItem.date_work } }
    //                 ]
    //             }
    //             const getNextOrder = await this.orderModel.findOne(query).sort({ date_work: 1 });
    //             if (getNextOrder) {
    //                 const previousBalance: previousBalanceCollaboratorDTO = {
    //                     gift_remainder: collaborator.gift_remainder,
    //                     remainder: collaborator.remainder,
    //                     collaborator_wallet: collaborator.collaborator_wallet,
    //                     work_wallet: collaborator.work_wallet,
    //                 }

    //                 collaborator.collaborator_wallet -= (getNextOrder.platform_fee + getNextOrder.pending_money);
    //                 this.activityCollaboratorSystemService.minusPlatformFee(collaborator, (getNextOrder.platform_fee + getNextOrder.pending_money), getNextOrder, getService, getGroupOrder._id, previousBalance)
    //                 // if (collaborator.work_wallet - (getNextOrder.platform_fee + getNextOrder.pending_money) < 0) {
    //                 //     const tempMoneyCollaborator = collaborator.work_wallet + collaborator.collaborator_wallet;
    //                 //     if (tempMoneyCollaborator - (getNextOrder.platform_fee + getNextOrder.pending_money) > 0) {
    //                 //         if (collaborator.is_auto_change_money) {
    //                 //             await this.collaboratorSystemService.changeMoneyWallet(collaborator, Math.abs(collaborator.work_wallet - getNextOrder.platform_fee - getNextOrder.pending_money))
    //                 //             getItem.is_duplicate = true;
    //                 //             getOrder[0].is_duplicate = false;
    //                 //             let tempRemainder = 0;
    //                 //             collaborator.work_wallet -= (getNextOrder.platform_fee + getNextOrder.pending_money)
    //                 //             tempRemainder = collaborator.gift_remainder - (getItem.platform_fee + getNextOrder.pending_money);
    //                 //             if (tempRemainder < 0) {
    //                 //                 const tempRemainderAbs = Math.abs(tempRemainder);
    //                 //                 if (collaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
    //                 //                 collaborator.remainder = collaborator.remainder - tempRemainderAbs;
    //                 //                 collaborator.gift_remainder = 0;
    //                 //             } else {
    //                 //                 collaborator.gift_remainder = tempRemainder;
    //                 //             }
    //                 //             await collaborator.save();
    //                 //             this.activityCollaboratorSystemService.minusPlatformFee(collaborator, (getNextOrder.platform_fee + getNextOrder.pending_money), getNextOrder, getService, getGroupOrder._id, previousBalance)
    //                 //         } else {
    //                 //             checkMoneyWallet = false;
    //                 //             for (let order of getOrder) {
    //                 //                 order.status = 'pending';
    //                 //                 order.id_collaborator = null;
    //                 //                 order.name_collaborator = null;
    //                 //                 order.phone_collaborator = null;
    //                 //                 await order.save();
    //                 //             }
    //                 //         }
    //                 //     } else {
    //                 //         checkMoneyWallet = false;
    //                 //         for (let order of getOrder) {
    //                 //             order.status = 'pending';
    //                 //             order.id_collaborator = null;
    //                 //             order.name_collaborator = null;
    //                 //             order.phone_collaborator = null;
    //                 //             await order.save();
    //                 //         }

    //                 //     }
    //                 // } else {
    //                 //     getItem.is_duplicate = true;
    //                 //     getOrder[0].is_duplicate = false;
    //                 //     let tempRemainder = 0;
    //                 //     collaborator.work_wallet -= (getNextOrder.platform_fee + getNextOrder.pending_money)
    //                 //     tempRemainder = collaborator.gift_remainder - (getItem.platform_fee + getNextOrder.pending_money);
    //                 //     if (tempRemainder < 0) {
    //                 //         const tempRemainderAbs = Math.abs(tempRemainder);
    //                 //         if (collaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
    //                 //         collaborator.remainder = collaborator.remainder - tempRemainderAbs;
    //                 //         collaborator.gift_remainder = 0;
    //                 //     } else {
    //                 //         collaborator.gift_remainder = tempRemainder;
    //                 //     }
    //                 //     await collaborator.save();
    //                 //     this.activityCollaboratorSystemService.minusPlatformFee(collaborator, (getNextOrder.platform_fee + getNextOrder.pending_money), getNextOrder, getService, getGroupOrder._id, previousBalance)
    //                 // }
    //                 // if (getNextOrder.payment_method === "cash") {
    //                 //     this.activityCollaboratorSystemService.minusPendingMoney(collaborator, , getNextOrder, getService, getGroupOrder._id)
    //                 // }

    //                 /////////////////////// gan gia tri duplicate cho don tiep theo ///////////////////////
    //                 getItem.is_duplicate = true;
    //                 getItem.status = "done"
    //                 getNextOrder.is_duplicate = false;
    //                 getItem.save();
    //                 getNextOrder.save();
    //                 /////////////////////// end gan gia tri duplicate cho don tiep theo ///////////////////////
    //             } else {
    //                 getItem.status = "done";
    //                 getGroupOrder.status = "done";
    //                 getItem.save();
    //                 getGroupOrder.save();
    //             }
    //         }

    //         getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - getItem.net_income_collaborator;
    //         getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - getItem.pending_money;
    //         getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - getItem.refund_money;
    //         getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - getItem.initial_fee;
    //         getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - getItem.final_fee;
    //         getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - getItem.platform_fee;
    //         ////// thêm id của doanh nghiệp để biết doanh nghiệp đó nhận và hoàn thành đơn đó /////////
    //         if (collaborator.id_business) {
    //             getItem.id_business = collaborator.id_business;
    //         }
    //         ////// kết thúc thêm id của doanh nghiệp để biết doanh nghiệp đó nhận và hoàn thành đơn đó /////////
    //         await collaborator.save();
    //         // getGroupOrder.collaborator_version = (version) ? version.toString() : "0";
    //         const resultGroupOrder = await getGroupOrder.save();
    //         const resultOrder = await getItem.save();

    //         const getCustomer = await this.customerModel.findById(getItem.id_customer);
    //         if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //         if (getCustomer.reputation_score < 100) {
    //             getCustomer.reputation_score = getCustomer.reputation_score + 1; //cong lai diem uy tin
    //         }
    //         await getCustomer.save();

    //         // tich diem thuoc khach hang, khong can phai await
    //         this.calculateAccumulatePoints(getItem._id, resultGroupOrder._id);
    //         this.activityCollaboratorSystemService.doneOrder(collaborator._id, idOrder, resultGroupOrder._id);
    //         admin ? this.activityAdminSystemService.adminChangeStatusOrderToDone(admin._id, getItem._id, collaborator._id, getGroupOrder._id) : null
    //         // if (getItem.refund_money > 0 && getItem.payment_method === "cash") {
    //         // }
    //         // if (getGroupOrder.payment_method !== "cash") {
    //         //     this.activityCollaboratorSystemService.receiveInitialFeeMoney(collaborator, tempReceiveMoney, getItem, getService, getGroupOrder, previousBalance)
    //         // }
    //         await this.activityCollaboratorSystemService.updateNetCollaborator(collaborator._id, getItem._id);

    //         ///// logic thêm tiền thưởng cho CTV
    //         if (getItem.bonus_collaborator !== null) {
    //             const previousBalanceCollaborator: previousBalanceCollaboratorDTO = {
    //                 remainder: collaborator.remainder,
    //                 gift_remainder: collaborator.gift_remainder,
    //                 collaborator_wallet: collaborator.collaborator_wallet,
    //                 work_wallet: collaborator.work_wallet
    //             }
    //             const collaboratorSetting = await this.collaboratorSettingModel.findOne();
    //             let totalBonus: number = getItem.bonus_collaborator["bonus_rush_day"] + getItem.bonus_collaborator["bonus_holiday"] + getItem.bonus_collaborator["bonus_order_hot"] + getItem.bonus_collaborator["bonus_area"];
    //             if (collaboratorSetting.bonus_wallet === 'remainder') {
    //                 collaborator.remainder += totalBonus;
    //                 collaborator.collaborator_wallet += totalBonus;
    //             } else {
    //                 collaborator.work_wallet += totalBonus
    //             }
    //             await collaborator.save();
    //             this.activityCollaboratorSystemService.receiveBonusMoney(collaborator, totalBonus, getItem, getService, getGroupOrder._id, previousBalanceCollaborator)
    //         }
    //         //// kết thúc logic thêm tiền thưởng ////

    //         //// logic thêm tiền tip //////
    //         // if (getItem.tip_collaborator > 0 && getItem.payment_method !== 'cash') {
    //         //     const previousBalanceCollaborator = {
    //         //         gift_remainder: collaborator.gift_remainder,
    //         //         remainder: collaborator.remainder
    //         //     }
    //         //     collaborator.remainder += getItem.tip_collaborator
    //         //     await collaborator.save();
    //         //     this.activityCollaboratorSystemService.receiveBonusMoney(collaborator, getItem.tip_collaborator, getItem, getService, getGroupOrder._id, previousBalanceCollaborator)
    //         // }
    //         //// kết thúc logic thêm tiền tip //////
    //         // check 

    //         const result = {
    //             groupOrder: resultGroupOrder,
    //             order: resultOrder
    //         }
    //         // cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
    //         const query = {
    //             $and: [
    //                 { status: 'done' },
    //                 { is_delete: false },
    //                 { id_customer: getCustomer._id },
    //             ]
    //         }
    //         const checkTotalDone = await this.orderModel.count(query);
    //         if (checkTotalDone === 1 && getCustomer.id_inviter !== null) {
    //             // X nhận đc 20K
    //             let getInviter = null;
    //             let is_customer = true;
    //             getInviter = await this.customerModel.findById(getCustomer.id_inviter);
    //             if (!getInviter) {
    //                 getInviter = await this.collaboratorModel.findById(getCustomer.id_inviter);
    //                 is_customer = false;
    //             }
    //             if (getInviter) {
    //                 if (is_customer && (getCustomer.date_create > '2023-05-30T17:00:00.577Z')) {
    //                     this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 20000);// tặng cho người giới thiệu
    //                     this.customerSystemService.systemGivePayPoint(lang, getCustomer._id, getInviter.full_name, 20000); // tặng cho chình khách hàng đó
    //                 } else if (!is_customer) {
    //                     this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 20000);
    //                 }
    //             }

    //         }
    //         // kết thúc cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
    //         if (!checkMoneyWallet) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, "collaborator")], HttpStatus.NOT_FOUND);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async orderDoingToDone(lang, idOrder, collaborator: CollaboratorDocument, subjectAction, admin?, version?) {
        try {
            // let collaboratorFee = 0;
            const previousBalance: previousBalanceCollaboratorDTO = {
                collaborator_wallet: collaborator.collaborator_wallet,
                work_wallet: collaborator.work_wallet,
            }
            const currentTime = new Date(Date.now()).toISOString();
            const getItem = await this.orderModel.findById(idOrder);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const subEndTime = subMinutes(new Date(getItem.end_date_work), 15);
            const check = new Date(currentTime).getTime() - subEndTime.getTime();
            if (check < 0 && (!admin || admin === null)) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_TIME_TO_FINISH, lang, "time")], HttpStatus.BAD_REQUEST);
            await this.checkStatusOrder(getItem, ['cancel', 'confirm', 'pending', 'done'], lang)
            getItem.status = "done"
            getItem.collaborator_end_date_work = new Date(Date.now()).toISOString();
            const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);

            const doneOrders = await this.orderOopSystemService.countOrdersByCustomer(getItem.id_customer, STATUS_ORDER.done)
            
            const payloadDependency = {
                order: getItem,
                group_order: getGroupOrder,
                collaborator: null,
                customer: null,
                inviter: null,
                admin_action: null,
            }

            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            const getCustomerSetting = await this.customerSettingModel.findOne()

            //////////////////////////////////////// OPEN Trả tiền cho CTV ////////////////////////////////////////
            // const tempReceiveMoney = (getItem.payment_method === "cash") ? getItem.refund_money : getItem.final_fee + getItem.refund_money;
            const tempReceiveMoney = (getItem.payment_method === "cash") ? getItem.refund_money : getItem.final_fee + getItem.refund_money;
            collaborator.collaborator_wallet += tempReceiveMoney;
            if (tempReceiveMoney > 0) {
                await this.activityCollaboratorSystemService.receiveRefundMoney(collaborator, tempReceiveMoney, getItem, getService, getGroupOrder._id, previousBalance)
            }

            // neu don hang la theo goi, tiep tuc nhan viec va tru tiep tien tiep theo

            if (getGroupOrder.type === "schedule") {
                const query = {
                    $and: [
                        { id_group_order: getGroupOrder._id },
                        { status: "confirm" },
                        { date_work: { $gt: getItem.date_work } }
                    ]
                }
                const getNextOrder = await this.orderModel.findOne(query).sort({ date_work: 1 });
                if (getNextOrder) {
                    const previousBalance: previousBalanceCollaboratorDTO = {
                        collaborator_wallet: collaborator.collaborator_wallet,
                        work_wallet: collaborator.work_wallet,
                    }
                    collaborator.collaborator_wallet -= (getNextOrder.platform_fee + getNextOrder.pending_money);
                    this.activityCollaboratorSystemService.minusPlatformFee(collaborator, (getNextOrder.platform_fee + getNextOrder.pending_money), getNextOrder, getService, getGroupOrder._id, previousBalance)


                    payloadDependency.collaborator = collaborator;

                    // Log lại lịch sử thu tiền của đơn hàng tiếp theo
                // await this.historyActivityOopSystemService.minusPlatformFee({type: "system", _id: null}, payloadDependency, getNextOrder.platform_fee + getNextOrder.pending_money, previousBalance)

                // Tao thong bao
                await this.notificationSystemService.minusPlatformFee(lang, getGroupOrder._id, getNextOrder, payloadDependency.collaborator, getNextOrder.platform_fee + getNextOrder.pending_money)

                    /////////////////////// gan gia tri duplicate cho don tiep theo ///////////////////////
                    getItem.is_duplicate = true;
                    getItem.status = "done"
                    getNextOrder.is_duplicate = false;
                    // getItem.save();
                    getGroupOrder.status = 'confirm';
                    await getNextOrder.save();
                    /////////////////////// end gan gia tri duplicate cho don tiep theo ///////////////////////
                } else {
                    getItem.status = "done";
                    getGroupOrder.status = "done";
                    // getItem.save();
                    // getGroupOrder.save();
                }
            } else {
                getGroupOrder.status = "done";
            }

            getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - getItem.net_income_collaborator;
            getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - getItem.pending_money;
            getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - getItem.refund_money;
            getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - getItem.initial_fee;
            getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - getItem.final_fee;
            getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - getItem.platform_fee;
            ////// thêm id của doanh nghiệp để biết doanh nghiệp đó nhận và hoàn thành đơn đó /////////
            if (collaborator.id_business) {
                getItem.id_business = collaborator.id_business;
            }
            
            ////// kết thúc thêm id của doanh nghiệp để biết doanh nghiệp đó nhận và hoàn thành đơn đó /////////
            collaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(collaborator._id, collaborator)
            // getGroupOrder.collaborator_version = (version) ? version.toString() : "0";
            const resultGroupOrder = await getGroupOrder.save();
            const resultOrder = await getItem.save();

            ////////////// + diem reputation cho KH //////////////
            this.customerSystemService.calReputationSrore(lang, getItem.id_customer, 1);
            ////////////// end + diem reputation cho KH //////////////

            // tich diem thuoc khach hang, khong can phai await
            // this.calculateAccumulatePoints(getItem._id, resultGroupOrder._id);

            const getCustomer = await this.customerRepositoryService.findOneById(getItem.id_customer.toString());
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "customer", null)], HttpStatus.BAD_REQUEST);

            const previousBalancePoints = {
                point: getCustomer.point
            }

            const currentPoint = Math.floor(+getItem.final_fee / +getCustomerSetting.point_to_price);
            const resultAddPoint = await this.customerOopSystemService.addPointsWhenDoneOrder(lang, +getItem.final_fee, currentPoint, getCustomer._id, getCustomerSetting)

            payloadDependency.customer = resultAddPoint.getCustomer
            await this.historyActivityOopSystemService.addPointForCustomerWhenDoneOrder(subjectAction, payloadDependency, previousBalancePoints, resultAddPoint.accumulatePoints)
            // this.activityCollaboratorSystemService.doneOrder(collaborator._id, idOrder, resultGroupOrder._id);
            // admin ? this.activityAdminSystemService.adminChangeStatusOrderToDone(admin._id, getItem._id, collaborator._id, getGroupOrder._id) : null
            // if (getItem.refund_money > 0 && getItem.payment_method === "cash") {
            // }
            // if (getGroupOrder.payment_method !== "cash") {
            //     this.activityCollaboratorSystemService.receiveInitialFeeMoney(collaborator, tempReceiveMoney, getItem, getService, getGroupOrder, previousBalance)
            // }
            payloadDependency.collaborator = await this.activityCollaboratorSystemService.updateNetCollaborator(collaborator._id, getItem._id);

            ///// logic thêm tiền thưởng cho CTV
            // if (getItem.bonus_collaborator !== null) {
            //     const previousBalanceCollaborator: previousBalanceCollaboratorDTO = {
            //         remainder: collaborator.remainder,
            //         gift_remainder: collaborator.gift_remainder,
            //         collaborator_wallet: collaborator.collaborator_wallet,
            //         work_wallet: collaborator.work_wallet
            //     }
            //     const collaboratorSetting = await this.collaboratorSettingModel.findOne();
            //     let totalBonus: number = getItem.bonus_collaborator["bonus_rush_day"] + getItem.bonus_collaborator["bonus_holiday"] + getItem.bonus_collaborator["bonus_order_hot"] + getItem.bonus_collaborator["bonus_area"];
            //     if (collaboratorSetting.bonus_wallet === 'remainder') {
            //         collaborator.remainder += totalBonus;
            //         collaborator.collaborator_wallet += totalBonus;
            //     } else {
            //         collaborator.work_wallet += totalBonus
            //     }
            //     await collaborator.save();
            //     this.activityCollaboratorSystemService.receiveBonusMoney(collaborator, totalBonus, getItem, getService, getGroupOrder._id, previousBalanceCollaborator)
            // }
            //// kết thúc logic thêm tiền thưởng ////

            //// logic thêm tiền tip //////
            // if (getItem.tip_collaborator > 0 && getItem.payment_method !== 'cash') {
            //     const previousBalanceCollaborator = {
            //         gift_remainder: collaborator.gift_remainder,
            //         remainder: collaborator.remainder
            //     }
            //     collaborator.remainder += getItem.tip_collaborator
            //     await collaborator.save();
            //     this.activityCollaboratorSystemService.receiveBonusMoney(collaborator, getItem.tip_collaborator, getItem, getService, getGroupOrder._id, previousBalanceCollaborator)
            // }
            //// kết thúc logic thêm tiền tip //////
            // check 

            const result = {
                groupOrder: resultGroupOrder,
                order: resultOrder
            }

            payloadDependency.order = result.order
            payloadDependency.group_order = result.groupOrder
            // Log he thong
            await this.historyActivityOopSystemService.doneOrder(subjectAction, payloadDependency)

            // cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
            await this.jobSystemService.addPayPointsForInviter(lang, payloadDependency.customer, subjectAction)

            // const query = {
            //     $and: [
            //         { status: 'done' },
            //         { is_delete: false },
            //         { id_customer: getCustomer._id },
            //     ]
            // }
            // const checkTotalDone = await this.orderModel.count(query);
            // if (checkTotalDone === 1 && getCustomer.id_inviter !== null) {
            //     // X nhận đc 20K
            //     let getInviter = null;
            //     let is_customer = true;
            //     getInviter = await this.customerRepositoryService.findOneById(getCustomer.id_inviter);
            //     if (!getInviter) {
            //         getInviter = await this.collaboratorRepositoryService.findOneById(getCustomer.id_inviter);
            //         is_customer = false;
            //     }
            //     if (getInviter) {
            //         if (is_customer && (getCustomer.date_create > '2023-05-30T17:00:00.577Z')) {
            //             this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 50000);// tặng cho người giới thiệu
            //             // this.customerSystemService.systemGivePayPoint(lang, getCustomer._id, getInviter.full_name, 20000); // tặng cho chình khách hàng đó
            //         } else if (!is_customer) {
            //             this.customerSystemService.addMoneyReferring(lang, getInviter, getCustomer.full_name, is_customer, 50000);
            //         }
            //     }

            // }
            // kết thúc cộng tiền mã giới thiệu khi hoàn thành ca đầu tiên
            // if (!checkMoneyWallet) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, "collaborator")], HttpStatus.NOT_FOUND);
            // Xac thanh toan qua momo
            // if (getGroupOrder.type !== TYPE_GROUP_ORDER.schedule && payloadDependency.order.payment_method === PAYMENT_METHOD.momo) {
            //     const payloadMomo = {
            //         id_order: payloadDependency.order._id,
            //         money: payloadDependency.order.final_fee
            //     }
            //     await this.paymentSystemService.confirmPayment(lang, payloadMomo, true)
            // }

            // Tao thong bao
            await this.notificationSystemService.doneOrder(lang, getGroupOrder._id, getItem, payloadDependency.customer, payloadDependency.collaborator),
            await this.notificationSystemService.addPoint(lang, getItem, getCustomer, resultAddPoint.accumulatePoints),
            await this.notificationSystemService.receiveRefundMoney(lang, getGroupOrder._id, getItem, payloadDependency.collaborator, tempReceiveMoney)

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async orderCancel(lang, idOrder, idCancel, admin?) {
        try {
            const getItem = await this.orderModel.findById(idOrder);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            if (getItem.status === "cancel" || getItem.status === "doing" || getItem.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            const getCancel = await this.reasonCancelModel.findById(idCancel);
            if (!getCancel || (getCancel && getCancel.apply_user !== "collaborator")) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);
            // const index = getItem.id_cancel_collaborator.findIndex((x: any) => x.id_collaborator.toString() === user._id.toString())
            // if (index > -1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getItem.id_collaborator.toString())

            const getGroupOrderItem = await this.groupOrderModel.findById(getItem.id_group_order)
            const getService = await this.serviceModel.findById(getGroupOrderItem.service["_id"])
            const previousBalance: previousBalanceCollaboratorDTO = {
                gift_remainder: getCollaborator.gift_remainder,
                remainder: getCollaborator.remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet,
            }
            getCollaborator.gift_remainder += getItem.work_shift_deposit;
            // if (getGroupOrderItem.payment_method === "cash") {
            // getCollaborator.gift_remainder += getItem.pending_money;
            // }

            getCollaborator.work_wallet += getItem.work_shift_deposit;
            // getCollaborator.work_wallet += getItem.platform_fee + getItem.pending_money;

            if (getGroupOrderItem.payment_method === "point") {
                const getCustomer = await this.customerRepositoryService.findOneById(getItem.id_customer.toString());
                if (getCustomer) {
                    getCustomer.cash = getCustomer.cash + getItem.final_fee;
                    getCustomer.pay_point = getCustomer.pay_point + getItem.final_fee;
                }
            }
            await getCollaborator.save()
            await getGroupOrderItem.save()
            await getItem.save();
            // this.activityCollaboratorSystemService.cancelOrder(user, getItem, getCancel)
            // activityCollaboratorSystemService.
            this.activityCollaboratorSystemService.refundPlatformFee(getCollaborator, getItem.work_shift_deposit, getItem, getService, getGroupOrderItem._id, previousBalance)
            if (getGroupOrderItem.temp_pending_money > 0) {
                // this.activityCollaboratorSystemService.refundCollaboratorFee(user, getItem.pending_money, getItem, getService)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editOrderNoChangePrice(lang, idOrder, payload: editOrderV2DTOAdmin, admin: UserSystemDocument) {
        try {
            const dateNow = new Date(Date.now()).getTime();
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group order')], HttpStatus.NOT_FOUND);
            // if (new Date(getOrder.date_work).getTime() - dateNow < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_OUTDATED, lang, null)], HttpStatus.NOT_FOUND);
            if (getOrder.status === 'doing') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, 'order order')], HttpStatus.NOT_FOUND);
            if (getOrder.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, 'order order')], HttpStatus.NOT_FOUND);
            if (getOrder.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, 'order done')], HttpStatus.NOT_FOUND);

            ///////////////////////////////////////// check xem co trung gio khong ///////////////////////////////////////////////
            const checkTimeStart = sub(new Date(payload.date_work), { minutes: 30 }).toISOString();
            const checkTimeEnd = add(new Date(payload.end_date_work), { minutes: 30 }).toISOString();
            const queryOrder = {
                $and: [
                    { id_collaborator: getOrder.id_collaborator },
                    { status: { $in: ['confirm', 'doing'] } },
                    { _id: { $ne: getOrder._id } },
                    {
                        $or: [
                            { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                            { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                        ]
                    }
                ]
            }
            if (!payload.is_check_date_work) {
                queryOrder.$and.pop();
            }
            const getItem = await this.orderModel.find(queryOrder);
            if (payload.is_check_date_work && getItem.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
            ///// trên admin ko check trùng giờ
            const tempDate = getOrder.date_work;

            getOrder.date_work = payload.date_work;
            const end_date_work = addHours(new Date(payload.date_work), getOrder.total_estimate).toISOString();
            if (end_date_work.toString() !== payload.end_date_work.toString()) {
                payload.end_date_work = end_date_work;
            }
            getOrder.end_date_work = payload.end_date_work;
            for (let item of getGroupOrder.date_work_schedule) {
                if (item.date === tempDate) {
                    item.date = payload.date_work;
                    await getGroupOrder.save();
                }
            }
            await getOrder.save();

            // Cap nhat lai thu tu don hang
            await this.groupOrderOopSystemService.sortDateWorkSchedule(lang, getGroupOrder._id)
            // Cap nhat lai id view cua don hang
            await this.orderOopSystemService.updateOrderListOrdersByGroupOrder(getGroupOrder)
            // Lay don hang co dang giu phi dich vu va chuyen phi dich vu sang don hang khac
            await this.transferServiceFeeToAnotherOrder(lang, getGroupOrder._id)

            this.activityAdminSystemService.adminChangeDateWorkOrder(getOrder._id, admin._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async transferServiceFeeToAnotherOrder(lang, idGroupOrder) {
        try {
            let getOrderHasPendingMoney = await this.orderOopSystemService.getOrderHasPendingMoney(idGroupOrder)
            // Kiem tra _id bang _id cua don hang co ngay lam gan nhat hay khong
            // Neu khac thi se cap nhat lai phi dich vu cho don hang co ngay lam gan nhat 
            if (getOrderHasPendingMoney) {
                let getOrderWithTheLatestDateWork = await this.orderOopSystemService.getOrderWithTheLatestDateWork(idGroupOrder)
                if (getOrderWithTheLatestDateWork) {
                    if (getOrderHasPendingMoney._id.toString() !== getOrderWithTheLatestDateWork._id.toString()) {
                        getOrderWithTheLatestDateWork.pending_money = getOrderHasPendingMoney.pending_money
                        getOrderWithTheLatestDateWork.service_fee = getOrderHasPendingMoney.service_fee

                        getOrderHasPendingMoney.pending_money = 0
                        getOrderHasPendingMoney.service_fee = []

                        await Promise.all([
                            this.orderOopSystemService.updateOrder(lang, getOrderWithTheLatestDateWork),
                            this.orderOopSystemService.updateOrder(lang, getOrderHasPendingMoney),
                        ])
                    } 
                }
            }

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editOrderChangePrice(lang, idOrder, payload: editOrderV2DTOAdmin, admin: UserSystemDocument) {
        // try {
        //     const dateNow = new Date(Date.now()).getTime();
        //     const getOrder = await this.orderModel.findById(idOrder);
        //     if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);
        //     // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
        //     // if (!checkPermisstion.permisstion) {
        //     //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
        //     // }
        //     const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
        //     if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group order')], HttpStatus.NOT_FOUND);
        //     if (getOrder.status === 'doing') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, 'order order')], HttpStatus.NOT_FOUND);
        //     if (getOrder.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, 'order order')], HttpStatus.NOT_FOUND);
        //     if (getOrder.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, 'order done')], HttpStatus.NOT_FOUND);
        //     // kiểm tra các tình huống để thay đổi ca làm việc
        //     let check = false;
        //     if (getGroupOrder.type === 'schedule') {
        //         check = true;
        //     }
        //     if (getGroupOrder.id_collaborator !== null) {
        //         check = true;
        //     }
        //     if (getGroupOrder.payment_method !== 'cash') {
        //         check = true;
        //     }
        //     if (getGroupOrder.status !== 'pending') {
        //         check = true;
        //     }
        //     if (check) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, null)], HttpStatus.BAD_REQUEST);
        //     if (getGroupOrder.code_promotion !== null) {
        //         await this.promotionSystemService.decreaseTotalUsedPromotionCode(lang, getGroupOrder.code_promotion, getGroupOrder.id_customer);
        //     }
        //     if (getGroupOrder.event_promotion.length > 0) {
        //         await this.promotionSystemService.decreaseTotalUsedPromotionEvent(lang, getGroupOrder.event_promotion);
        //     }
        //     const tempToken = {
        //         lat: getGroupOrder.lat,
        //         lng: getGroupOrder.lng,
        //         address: getGroupOrder.address
        //     }
        //     const token = await this.globalService.encryptObject(tempToken);
        //     const tempExtend = [];
        //     for (let extend of getGroupOrder.service["optional_service"]) {
        //         for (let item of extend.extend_optional) {
        //             const temp = {
        //                 _id: item._id.toString(),
        //                 count: item.count,
        //             }
        //             tempExtend.push(temp);
        //         }
        //     }
        //     const tempInfo: any = {
        //         token: token,
        //         payment_method: getGroupOrder.payment_method,
        //         note: payload.note,
        //         code_promotion: payload.code_promotion || null,
        //         type_address_work: getGroupOrder.type_address_work,
        //         date_work_schedule: [payload.date_work],
        //         extend_optional: tempExtend,
        //         id_address: '',
        //         convert_time: false,
        //         is_auto_order: getGroupOrder.is_auto_order,
        //         time_schedule: getGroupOrder.time_schedule,
        //     }
        //     const infoJob = await this.groupOrderSystemService.calculateFeeGroupOrder(lang, tempInfo, 'admin');
        //     let calculateCodePromotion = {}
        //     if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
        //         payload.code_promotion !== "") {
        //         const getCustomer = await this.customerModel.findById(getGroupOrder.id_customer);
        //         calculateCodePromotion = await this.promotionSystemService.calculateCodePromotion(lang, infoJob, payload.code_promotion, getCustomer);
        //     }
        //     const calculateEventPromotion = await this.promotionSystemService.calculateEventPromotion(lang, infoJob, getGroupOrder.id_customer);
        //     let tempServiceFee = 0;
        //     for (let item of getGroupOrder.service_fee) {
        //         tempServiceFee += item["fee"];
        //     }
        //     const loadcalculateFinalFee = {
        //         initial_fee: infoJob.initial_fee,
        //         code_promotion: (payload.code_promotion) ? calculateCodePromotion : null,
        //         event_promotion: calculateEventPromotion.event_promotion || [],
        //         service_fee: getGroupOrder.service_fee,
        //         type: infoJob.type,
        //         tip_collaborator: getGroupOrder.tip_collaborator
        //     }
        //     let final_fee = await this.calculateFinalFee(loadcalculateFinalFee);
        //     let refund_money = 0;
        //     let pending_money = tempServiceFee;
        //     final_fee = final_fee / 1000;
        //     final_fee = Math.round(final_fee) * 1000;
        //     final_fee = (final_fee < 0) ? 0 : final_fee;
        //     refund_money = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion["discount"] : 0;
        //     for (const item of calculateEventPromotion.event_promotion) {
        //         refund_money += item.discount;
        //     }
        //     getGroupOrder.code_promotion = (calculateCodePromotion && calculateCodePromotion["discount"]) ? calculateCodePromotion : null
        //     getGroupOrder.event_promotion = calculateEventPromotion.event_promotion || []
        //     getGroupOrder.initial_fee = infoJob.initial_fee
        //     getGroupOrder.platform_fee = infoJob.platform_fee
        //     getGroupOrder.final_fee = final_fee
        //     getGroupOrder.net_income_collaborator = infoJob.net_income_collaborator
        //     getGroupOrder.temp_net_income_collaborator = infoJob.net_income_collaborator
        //     getGroupOrder.temp_initial_fee = infoJob.initial_fee
        //     getGroupOrder.temp_platform_fee = infoJob.platform_fee
        //     getGroupOrder.temp_pending_money = pending_money
        //     getGroupOrder.temp_refund_money = refund_money
        //     getGroupOrder.temp_final_fee = final_fee
        //     getGroupOrder.date_work_schedule[0] = {
        //         date: payload.date_work,
        //         status: "pending",
        //         initial_fee: infoJob.initial_fee,
        //         platform_fee: infoJob.platform_fee,
        //         net_income_collaborator: infoJob.net_income_collaborator
        //     }
        //     // return getGroupOrder;
        //     await getGroupOrder.save();
        //     const getCustomer = await this.customerModel.findById(getGroupOrder.id_customer);
        //     if (getGroupOrder.code_promotion !== null) {
        //         this.promotionSystemService.increaseTotalUsedPromotionCode(lang, getCustomer, calculateCodePromotion);
        //     }
        //     if (getGroupOrder.event_promotion.length > 0) {
        //         this.promotionSystemService.increaseTotalUsedPromotionEvent(lang, getCustomer, calculateEventPromotion.event_promotion);
        //     }

        //     const getArrOrder = await this.orderModel.find({ id_group_order: getGroupOrder._id });
        //     for (let order of getArrOrder) {
        //         order.event_promotion = getGroupOrder.event_promotion;
        //         order.code_promotion = getGroupOrder.code_promotion;
        //         order.date_work = getGroupOrder.date_work_schedule[0]["date"];
        //         const end_date_word = addHours(new Date(getGroupOrder.date_work_schedule[0]["date"]), getGroupOrder.total_estimate);
        //         order.end_date_work = end_date_word.toISOString();
        //         order.final_fee = getGroupOrder.final_fee;
        //         order.initial_fee = getGroupOrder.initial_fee;
        //         order.net_income_collaborator = getGroupOrder.net_income_collaborator;
        //         order.platform_fee = getGroupOrder.platform_fee;
        //         order.pending_money = getGroupOrder.temp_pending_money;
        //         order.refund_money = getGroupOrder.temp_refund_money;
        //         await order.save();
        //     }
        //     this.activityAdminSystemService.adminChangeDateWorkOrder(getOrder._id, admin._id);
        //     return true;
        // } catch (err) {
        //     throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        // }
    }
    /////////////////////

    async caculateAndAddBonusCollaborator(payload: OrderDocument) {
        try {
            let bonus_area = 0;
            let bonus_rush_day = 0;
            let bonus_holiday = 0;
            const bonus_order_hot = 0;
            for (let optional of payload.service["optional_service"]) {
                const getBonus = await this.collaboratorBonusModel.findOne({ id_optional: optional._id });
                if (getBonus) {
                    if (getBonus.is_bonus_area) {
                        for (let area of getBonus.bonus_area) {
                            const checkDistrict: boolean = area["level_2"].findIndex(item => item === payload.district) >= 0;
                            if (area["level_1"] === payload.city && checkDistrict) {
                                if (area["type_bonus"] === "percent") {
                                    bonus_area += (Number(payload.initial_fee) / 100) * Number(area["value"]);
                                } else if (area["type_bonus"] === "amount") {
                                    bonus_area = Number(area["value"]);
                                }
                            }
                        }
                    }

                    if (getBonus.is_bonus_holiday) {
                        for (let holiday of getBonus.bonus_holiday) {
                            const currentDate = new Date(payload.date_work).toISOString();
                            let checkDate: boolean = new Date(holiday["time_start"]) < new Date(currentDate);
                            checkDate = new Date(currentDate) < new Date(holiday["time_end"]);
                            if (checkDate) {
                                if (holiday["type_bonus"] === "percent") {
                                    bonus_holiday += (Number(payload.initial_fee) / 100) * Number(holiday["value"]);
                                } else if (holiday["type_bonus"] === "amount") {
                                    bonus_holiday = Number(holiday["value"]);
                                }
                            }
                        }
                    }

                    if (getBonus.is_bonus_rush_day) {
                        for (let rush_day of getBonus.bonus_rush_day) {
                            const currentDate = new Date(payload.date_work);
                            const obDate = await this.generalHandleService.formatDateWithTimeZone(currentDate, rush_day["timezone"]);
                            let checkDate: boolean = rush_day["day_loop"].findIndex(item => item === obDate.day_of_week) > -1;
                            if (checkDate) {
                                if (rush_day["type_bonus"] === "percent") {
                                    (Number(payload.initial_fee) / 100) * Number(rush_day["value"]);
                                } else if (rush_day["type_bonus"] === "amount") {
                                    bonus_rush_day = Number(rush_day["value"]);
                                }
                            }
                        }
                    }
                }


                for (let extend_optional of optional["extend_optional"]) {
                    const getBonus = await this.collaboratorBonusModel.findOne({ id_extend_optional: extend_optional._id })
                    if (getBonus) {
                        if (getBonus.is_bonus_area) {
                            for (let area of getBonus.bonus_area) {
                                const checkDistrict: boolean = area["level_2"].findIndex(item => item === payload.district) >= 0;
                                if (area["level_1"] === payload.city && checkDistrict) {
                                    if (area["type_bonus"] === "percent") {
                                        (Number(payload.initial_fee) / 100) * Number(area["value"]);
                                    } else if (area["type_bonus"] === "amount") {
                                        bonus_area = Number(area["value"]);
                                    }

                                }
                            }
                        }

                        if (getBonus.is_bonus_holiday) {
                            for (let holiday of getBonus.bonus_holiday) {
                                const currentDate = new Date(payload.date_work).toISOString();
                                let checkDate: boolean = new Date(holiday["time_start"]) < new Date(currentDate);
                                checkDate = new Date(currentDate) < new Date(holiday["time_end"]);
                                if (checkDate) {
                                    if (holiday["type_bonus"] === "percent") {
                                        bonus_holiday += (Number(payload.initial_fee) / 100) * Number(holiday["value"]);
                                    } else if (holiday["type_bonus"] === "amount") {
                                        bonus_holiday = Number(holiday["value"]);
                                    }
                                }
                            }
                        }

                        if (getBonus.is_bonus_rush_day) {
                            for (let rush_day of getBonus.bonus_rush_day) {
                                const currentDate = new Date(payload.date_work);
                                const obDate = await this.generalHandleService.formatDateWithTimeZone(currentDate, rush_day["timezone"]);
                                let checkDate: boolean = rush_day["day_loop"].findIndex(item => item === obDate.day_of_week) > -1;
                                if (checkDate) {
                                    if (rush_day["type_bonus"] === "percent") {
                                        bonus_rush_day += (Number(payload.initial_fee) / 100) * Number(rush_day["value"]);
                                    } else if (rush_day["type_bonus"] === "amount") {
                                        bonus_rush_day = Number(rush_day["value"]);
                                    }
                                }
                            }
                        }
                    }

                }
            }
            bonus_area = (await this.generalHandleService.roundUpMoney(bonus_area)).money;
            bonus_rush_day = (await this.generalHandleService.roundUpMoney(bonus_rush_day)).money;
            bonus_holiday = (await this.generalHandleService.roundUpMoney(bonus_holiday)).money;
            const result = {
                bonus_area: bonus_area,
                bonus_rush_day: bonus_rush_day,
                bonus_holiday: bonus_holiday,
                bonus_order_hot: bonus_order_hot
            }
            let check: boolean = false;
            check = check === false ? bonus_area > 0 : true;
            check = check === false ? bonus_rush_day > 0 : true;
            check = check === false ? bonus_holiday > 0 : true;
            return check ? result : null;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateBonusCollaborator(groupOrder) {
        try {
            const getOrder = await this.orderModel.find({ id_group_order: groupOrder._id });
            const tempBonus = {
                bonus_area: 0,
                bonus_rush_day: 0,
                bonus_holiday: 0,
                bonus_order_hot: 0
            }
            for (let order of getOrder) {
                order.bonus_collaborator = await this.caculateAndAddBonusCollaborator(order);
                if (order.bonus_collaborator !== null) {
                    tempBonus.bonus_area = order.bonus_collaborator["bonus_collaborator"];
                    tempBonus.bonus_order_hot = order.bonus_collaborator["bonus_order_hot"];
                    tempBonus.bonus_holiday = order.bonus_collaborator["bonus_holiday"];
                    tempBonus.bonus_rush_day = order.bonus_collaborator["bonus_rush_day"];
                }
                await order.save();
            }
            const checkGreaterZero: number = tempBonus.bonus_area + tempBonus.bonus_order_hot + tempBonus.bonus_holiday + tempBonus.bonus_rush_day;
            groupOrder.bonus_collaborator = checkGreaterZero > 0 ? tempBonus : null;
            groupOrder.save()
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }///
    async resetOrder(idOrder) { //////////// chỉ danh cho test
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
            getOrder.id_collaborator = null;
            getOrder.phone_collaborator = null;
            getOrder.name_collaborator = null;
            getOrder.status = 'pending';


            getGroupOrder.id_collaborator = null;
            getGroupOrder.phone_collaborator = null;
            getGroupOrder.name_collaborator = null;
            getGroupOrder.status = 'pending';
            getGroupOrder.date_work_schedule[0].status = 'pending';
            await getOrder.save();
            await getGroupOrder.save();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    /**
     * @param idCollaborator id cộng tác viên
     * @param idGroupOrder id nhóm đơn hàng
     * @param lang ngôn ngữ trả lỗi
     * @returns kiểm tra xem có trùng giờ khi CTV viên nhận việc mới không.
     */
    async checkOverlapOrder(idCollaborator, idGroupOrder, lang) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { status: 'pending' },
                    { id_group_order: idGroupOrder }
                ]
            }
            const arrOrder = await this.orderModel.find(query)
            for (let order of arrOrder) {
                const checkTimeStart = sub(new Date(order.date_work), { minutes: 30 }).toISOString();
                const checkTimeEnd = add(new Date(order.end_date_work), { minutes: 30 }).toISOString();
                const queryOrder = {
                    $and: [
                        { is_delete: false },
                        { id_collaborator: idCollaborator },
                        { status: { $in: ['confirm', 'doing'] } },
                        {
                            $or: [
                                { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                            ]
                        }
                    ]
                }
                const numberConfirmOrder = await this.orderModel.countDocuments(queryOrder);
                if (numberConfirmOrder > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param order đơn hàng cần kiểm tra 
     * @param status các trạng thái cần kiểm tra
     * @param lang ngôn ngữ trả lỗi
     * @returns kiểm tra trạng thái đơn hàng với các status cần kiểm tra, trả lỗi nếu trạng thái của đơn hàng
     * trùng với 1 trong các trạng thái truyền vào 
     */
    async checkStatusOrder(order: OrderDocument, status: string[], lang) {
        try {
            for (let i of status) {
                if (i === 'cancel' && order.status === "cancel") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'confirm' && order.status === "confirm") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'doing' && order.status === "doing") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'done' && order.status === "done") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'pending' && order.status === "pending") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    // ------------------ NEW FUNCTION ----------------------


    async unassignCollaboratorFromOrder(lang, subjectAction, idOrder) {
        try {
            const findOrder = await this.orderRepositoryService.findOneById(idOrder);
            if(!findOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);
            if(findOrder.status !== "confirm" && findOrder.status !== "doing") throw new HttpException([await this.customExceptionService.i18nError(ERROR.INVALID_PASSWORD, lang, 'order')], HttpStatus.BAD_REQUEST);
            const findCollaborator = await this.collaboratorRepositoryService.findOneById(findOrder.id_collaborator);
            if(!findCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);

            // xoa CTV khoi order
            findOrder.status = "pending";
            findOrder.id_collaborator = null;
            findOrder.name_collaborator = null;
            findOrder.phone_collaborator = null;
            findOrder.index_search_collaborator = []

            await this.orderRepositoryService.findByIdAndUpdate(findOrder._id, findOrder);


            
            return findOrder;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelOrder(lang, subjectAction, idOrder, idCancel) {
        try {
            const getOrder = await this.orderRepositoryService.findOneById(idOrder, {}, [{path: "id_group_order", select: {type: 1, _id: 1, id_view: 1, is_customer: 1}}]);
            const reasonCancel = await this.reasonsCancelRepositoryService.findOneById(idCancel);
            
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, getOrder.is_customer)

            if(getOrder.id_group_order.type === "schedule") {
                const arrOrder = await this.orderRepositoryService.getListDataByCondition({id_group_order: getOrder.id_group_order._id, status: {$in: ["confirm", "pending", "doing", "done"]}}, {}, {date_work: 1});
                const findIndexCurrentOrder = arrOrder.findIndex(item => {
                    return item._id.toString() === getOrder._id.toString()
                });
                const findOrderNotDone = arrOrder.filter(item => item.status === "confirm" || item.status === "pending" || item.status === "doing");

                // neu chua co don nao hoan thanh hoac don bi huy la don dau tien, phi dich vu se day ve cho don tiep theo
                if(findIndexCurrentOrder === 0 && findOrderNotDone.length > 1) {
                    arrOrder[findIndexCurrentOrder + 1].service_fee = getOrder.service_fee
                    arrOrder[findIndexCurrentOrder + 1].pending_money = getOrder.pending_money
                    arrOrder[findIndexCurrentOrder + 1].final_fee += getOrder.pending_money
                    arrOrder[findIndexCurrentOrder + 1].is_duplicate = false;

                    getOrder.service_fee = [];
                    getOrder.pending_money = 0;
                    getOrder.final_fee -= arrOrder[findIndexCurrentOrder + 1].pending_money
                    getOrder.is_duplicate = true;
                    this.orderRepositoryService.findByIdAndUpdate(arrOrder[findIndexCurrentOrder + 1]._id, arrOrder[findIndexCurrentOrder + 1])
                }

                // neu don dang bi huy la don cuoi cung => groupOrder se bi huy theo
                if(findOrderNotDone.length === 1) {
                    const getGroupOrder = await this.groupOrderRepositoryService.findOneById(getOrder.id_group_order._id);
                    getGroupOrder.status = "cancel"
                    this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrder._id, getGroupOrder);
                }

            } else {
                const getGroupOrder = await this.groupOrderRepositoryService.findOneById(getOrder.id_group_order._id);
                getGroupOrder.status = "cancel"
                this.groupOrderRepositoryService.findByIdAndUpdate(getGroupOrder._id, getGroupOrder);

            }

            getOrder.status = "cancel";
            let idAdminAction = null;
            // let typeSubject = "system"
            

            if(subjectAction.type === "customer") {
                getOrder.id_cancel_customer = {
                    id_reason_cancel: reasonCancel._id,
                    date_create: new Date(Date.now()).toISOString()
                }
            }
            else if(subjectAction.type === "collaborator") {
                // typeSubject = "collaborator";

                getOrder.id_cancel_collaborator.push({
                    id_reason_cancel: reasonCancel._id,
                    id_collaborator: getOrder.id_collaborator,
                    date_create: new Date(Date.now()).toISOString()
                })
                // this.colla
                // this.notificationSystemService.cancelOrder('collaborator')
            }
            else if(subjectAction.type === "admin") {
                // typeSubject = "admin";

                getOrder.id_cancel_user_system = {
                    id_reason_cancel: reasonCancel._id,
                    id_user_system: new Types.ObjectId(subjectAction._id),
                    date_create: new Date(Date.now()).toISOString()
                }
                idAdminAction = new Types.ObjectId(subjectAction._id)
            }
            this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder);
            
            const payloadDependency = {
                id_admin_action: idAdminAction,
                id_customer: getOrder.id_customer,
                id_order: idOrder,
                id_group_order: getOrder.id_group_order._id,
                id_reason_cancel: idCancel,
                id_collaborator: getOrder.id_collaborator || null
            }
            
            this.activitySystemService.cancelOrder(subjectAction, payloadDependency)
            // const getGroupOrder = await this.groupOrderRepositoryService.findOneById()
            await this.notificationSystemService.cancelOrder(lang, subjectAction.type, reasonCancel, getOrder.id_group_order, getOrder, getCustomer)

            let refundCustomer = getOrder.final_fee || 0;
            const result = {
                order: getOrder,
                refundCustomer: refundCustomer,
            }
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findNextOrderInGroupOrder(lang, idOrder) {
        try {
            const getOrder = await this.orderRepositoryService.findOneById(idOrder);
            if(!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);

            const query = {
                $and: [
                    {id_group_order: getOrder.id_group_order},
                    {status: {$in: ["confirm", "doing"]}},
                    {date_work: {$gt: getOrder.date_work}}
                ]
            }

            const nextOrder = await this.orderRepositoryService.findOne(query, {}, {date_work: 1});
            // const findIndexCurrentOrder = arrOrder.findIndex(item => item._id.toString() === getOrder._id.toString());

            // neu chinh order do nam cuoi mang thi tra ve null
            // return (arrOrder.length > 1 && findIndexCurrentOrder < arrOrder.length - 1) ? arrOrder[findIndexCurrentOrder + 1] : null;
            return (nextOrder) ? nextOrder : null;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async findCurrentOrderInGroupOrder(lang, idGroupOrder) {
        try {

            // chi xet trong truong hop co CTV nhan don
            const query = {
                $and: [
                    {id_group_order: new Types.ObjectId(idGroupOrder)},
                    {status: ["confirm", "doing"]},
                ]
            }
            const getCurrentOrder = await this.orderRepositoryService.findOne(query,{},{date_work: 1});
            if(!getCurrentOrder) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.GROUP_ORDER.GROUP_ORDER_IS_PENDING, lang, 'status_group_order')], HttpStatus.NOT_FOUND);
            }

            return getCurrentOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @param lang ngôn ngữ trả lỗi
     * @param idCollaborator id cộng tác viên
     * @param lstDateWorkSchedule danh sách ngày làm việc
     * @returns kiểm tra xem có trùng giờ khi tạo việc và gán đơn cho CTV.
     */
    async checkOverlapOrderWhenCreating(lang, idCollaborator, lstDateWorkSchedule, total_estimate) {
        try {
            for (let i = 0; i < lstDateWorkSchedule.length; i++) {
                const endDateWork = new Date(new Date(lstDateWorkSchedule[i].date).getTime() + (total_estimate * 60 * 60 * 1000)).toISOString();
                const checkTimeStart = sub(new Date(lstDateWorkSchedule[i].date), { minutes: 30 }).toISOString();
                const checkTimeEnd = add(new Date(endDateWork), { minutes: 30 }).toISOString();
                const queryOrder = {
                    $and: [
                        { is_delete: false },
                        { id_collaborator: idCollaborator },
                        { status: { $in: ['confirm', 'doing'] } },
                        {
                            $or: [
                                { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                            ]
                        }
                    ]
                }
                const numberConfirmOrder = await this.orderModel.countDocuments(queryOrder);
                if (numberConfirmOrder > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}

