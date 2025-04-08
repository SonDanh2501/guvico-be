import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ERROR, MILLISECOND_IN_HOUR, stepCancelDTO } from 'src/@core'
import { createGroupOrderDTO, createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto'
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto'
<<<<<<< HEAD
import { PAYMENT_METHOD, STATUS_GROUP_ORDER, STATUS_TRANSACTION, TYPE_GROUP_ORDER, TYPE_RESPONSE_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_ACTION, TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
=======
import { PAYMENT_METHOD, STATUS_GROUP_ORDER, STATUS_ORDER, STATUS_TRANSACTION, TYPE_RESPONSE_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
>>>>>>> son
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { ExtendOptionalOopSystemService } from 'src/core-system/@oop-system/extend-optional-oop-system/extend-optional-oop-system.service'
import { GroupOrderOopSystemService } from 'src/core-system/@oop-system/group-order-oop-system/group-order-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { NotificationOopSystemService } from 'src/core-system/@oop-system/notification-oop-system/notification-oop-system.service'
import { OptionalServiceOopSystemService } from 'src/core-system/@oop-system/optional-service-oop-system/optional-service-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PromotionOopSystemService } from 'src/core-system/@oop-system/promotion-oop-system/promotion-oop-system.service'
import { PunishPolicyOopSystemService } from 'src/core-system/@oop-system/punish-policy-oop-system/punish-policy-oop-system.service'
import { PunishTicketOopSystemService } from 'src/core-system/@oop-system/punish-ticket-oop-system/punish-ticket-oop-system.service'
import { ReasonCancelOopSystemService } from 'src/core-system/@oop-system/reason-cancel-oop-system/reason-cancel-oop-system.service'
import { ServiceFeeOopSystemService } from 'src/core-system/@oop-system/service-fee-oop-system/service-fee-oop-system.service'
import { ServiceOopSystemService } from 'src/core-system/@oop-system/service-oop-system/service-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { TransactionOopSystemService } from 'src/core-system/@oop-system/transaction-oop-system/transaction-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { JobSystemService } from '../job-system/job-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { OrderSystemService2 } from '../order-system/order-system.service'
import { PaymentSystemService } from '../payment-system/payment-system.service'
<<<<<<< HEAD
=======
import { PunishTicketSystemService } from '../punish-ticket-system/punish-ticket-system.service'
import { PushNotificationSystemService } from '../push-notification-system/push-notification-system.service'
>>>>>>> son

@Injectable()
export class GroupOrderSystemService2 {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private notificationSystemService: NotificationSystemService,
        private orderSystemService: OrderSystemService2,

        private extendOptionalOopSystemService: ExtendOptionalOopSystemService,
        private optionalServiceOopSystemService: OptionalServiceOopSystemService,
        private serviceOopSystemService: ServiceOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private groupOrderOopSystemService: GroupOrderOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private reasonCancelOopSystemService: ReasonCancelOopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
        private notificationOopSystemService: NotificationOopSystemService,
        private punishTicketOopSystemService: PunishTicketOopSystemService,
        private punishPolicyOopSystemService: PunishPolicyOopSystemService,
        private promotionOopSystemService: PromotionOopSystemService,
        private serviceFeeOopSystemService: ServiceFeeOopSystemService,
        private settingOopSystemService: SettingOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
        private transactionOopSystemService: TransactionOopSystemService,
        
        private paymentSystemService: PaymentSystemService,
<<<<<<< HEAD
        private orderSystemService2: OrderSystemService2,
        @Inject(forwardRef(() => JobSystemService))
        private jobSystemService: JobSystemService,
=======
        private punishTicketSystemService: PunishTicketSystemService,
>>>>>>> son


    ) { }


    async createGroupOrder(lang, subjectAction, request, stepByStep, payload: createGroupOrderDTO, user) {
        try {
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, payload.id_customer)
            const version = subjectAction?.version ? subjectAction?.version.toString() : "1.0.0"
            const arrVersion = version.split(".") 
            const fixVersion = Number(arrVersion[2])
            let payloadDependency = {
                customer: getCustomer,
                group_order: null,
                collaborator: null,
                admin_action: null,
                order: null
            }
            if(subjectAction.type == "admin") {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }
            if(payload.id_collaborator) {
                const collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, payload.id_collaborator);
                payloadDependency.collaborator = collaborator
            }
            // console.log(payload, 'payload');
            

            // if(payload.payment_method === "point" && subjectAction.type !== "admin") {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_MAIN_TAIN, lang, null)], HttpStatus.NOT_FOUND);
            // }

            // 0.1
            // if(payload.tip_collaborator !== 0 && payload.payment_method === 'cash') {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_CASH_NOT_SUPPORT_TIP, lang, "payment_method")], HttpStatus.BAD_REQUEST)
            // }

            // 0.2 xac dinh khu vuc dat ca
            const codePayloadArea = await this.identifyArea(payload);

            //// 1. tinh gia tien ban dau va kiem tra khuyen mai co hop le hay ko
            let infoJob = await this.calculateFeeGroupOrder(lang, payload, subjectAction)

            // 2. kiem tra ma khuyen mai co hop le voi don hang do hay khong
            // infoJob = await this.calculatePromotion(infoJob);

            // Kiem tra trung gio neu co id_collaborator
            if(payload.id_collaborator && payload.check_time) {
                await this.orderSystemService2.checkOverlapOrderWhenCreating(lang, payload.id_collaborator, infoJob.date_work_schedule, infoJob.total_estimate)
            }

            // 3. check phuong thuc thanh toan cua KH
            if(stepByStep.is_check_wallet_customer === true && payload.payment_method === "point") {
                await this.customerOopSystemService.checkBalancePayPoint(lang, payload.id_customer, infoJob.final_fee)
            }

            // 4. check xem CTV co du so tien de nhan don hay khong
            if(stepByStep.is_check_wallet_collaborator === true && payload.id_collaborator) {
                // console.log(infoJob.platform_fee, "infoJob.platform_fee");
                
                // add tam 2k phi dich vu
                await this.collaboratorOopSystemService.checkBalanceWallet(lang, payload.id_collaborator, infoJob.date_work_schedule[0].platform_fee + 2000)
            }
            
            // 5. tao group order
            const createGroupOrder = await this.groupOrderOopSystemService.createItem(lang, infoJob, payload, codePayloadArea, getCustomer, payloadDependency.collaborator)

            payloadDependency.group_order = createGroupOrder
            if (payload.payment_method === PAYMENT_METHOD.cash || payload.payment_method === PAYMENT_METHOD.point) {
                await this.historyActivityOopSystemService.createGroupOrder(subjectAction, payloadDependency)
            }

            // tạo đơn rồi thì update lại số lượng sử dụng
            await this.promotionOopSystemService.increaseTotalUsedPromotionCode(lang, payload.code_promotion)
            // 6. tao ra order rieng le
            const listOrder = await this.orderOopSystemService.createOrderByGroupOrder(lang, createGroupOrder, infoJob)
            // update ListOrder trong groupOrder va tra ve ca lam dau tien de tru phi collaborator
            
            payloadDependency.order = await this.groupOrderOopSystemService.updateListOrder(lang, createGroupOrder, listOrder)

            // 7. tru tien KH
            if (stepByStep.is_payment_service_customer === true && createGroupOrder.payment_method === PAYMENT_METHOD.point) {
                let customer = await this.customerOopSystemService.redeemPayPoint(lang, payload.id_customer, infoJob.final_fee)
                payloadDependency.customer = customer;
                // await this.historyActivityOopSystemService.paymentPayPointCustomer(subjectAction, payloadDependency, infoJob.final_fee)
                await this.historyActivityOopSystemService.paymentServiceCustomer(subjectAction, payloadDependency, infoJob.final_fee, PAYMENT_METHOD.point)
            }
            // Thanh toan bang Momo
            // Thanh toan lien ket vi

            // Thanh toan thong thuong
            // Thanh toan giu tien (isAutoCapture = false)
            let resultPayment:any
            // if (stepByStep.is_payment_service_customer === true && createGroupOrder.payment_method === PAYMENT_METHOD.momo && payloadDependency.group_order.type !== TYPE_GROUP_ORDER.schedule) {
            //     resultPayment = await this.paymentSystemService.useNormalMomoPayment(lang, payloadDependency, subjectAction, user, false)
            // }

            // Thanh toan momo tru tien luon (isAutoCapture = true)
            // Hoac thanh toan vnpay
            if (stepByStep.is_payment_service_customer === true && createGroupOrder.payment_method !== PAYMENT_METHOD.cash && createGroupOrder.payment_method !== PAYMENT_METHOD.point) {
                resultPayment = await this.paymentSystemService.payForOrderWithEWallet(lang, subjectAction, payloadDependency, user, createGroupOrder.payment_method, request, true)
            }



            // 8. thu phi CTV neu co
            if(stepByStep.is_minus_collaborator === true && payload.id_collaborator) {
                    await this.jobSystemService.pendingToConfirm(lang, payloadDependency.order._id, payload.id_collaborator, subjectAction, payload.check_time)
            }
            
            if (resultPayment) {
                if(fixVersion < 41) {
                    // Cap nhat deep link cho order va group order
                    await this.orderOopSystemService.updateDeepLinkOrder(lang, payloadDependency.order._id, resultPayment.deeplink)
                    await this.groupOrderOopSystemService.updateDeepLinkGroupOrder(lang, payloadDependency.group_order._id, resultPayment.deeplink)
                    return resultPayment
                } 
                // Cap nhat deep link cho order va group order
                let deep_link:any 
                if(resultPayment?.deeplink) {
                    deep_link = resultPayment.deeplink
                } else {
                    deep_link = resultPayment
                }
                await this.orderOopSystemService.updateDeepLinkOrder(lang, payloadDependency.order._id, deep_link)
                await this.groupOrderOopSystemService.updateDeepLinkGroupOrder(lang, payloadDependency.group_order._id, deep_link)

                let type:any
                if(createGroupOrder.payment_method === PAYMENT_METHOD.momo) {
                    type = TYPE_RESPONSE_ORDER.deep_link
                }
                if(createGroupOrder.payment_method === PAYMENT_METHOD.vnpay || createGroupOrder.payment_method === PAYMENT_METHOD.vnbank || createGroupOrder.payment_method === PAYMENT_METHOD.intcard) {
                    type = TYPE_RESPONSE_ORDER.url
                }

                return { result:resultPayment, type }
            }
            
            // ban thong bao don moi
            await this.notificationSystemService.createGroupOrder(lang, subjectAction, payloadDependency, getCustomer, (payload.id_collaborator) ? false : true)
            if(fixVersion < 41 || subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                return true
            }
            return { type: TYPE_RESPONSE_ORDER.none };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async identifyArea(payload) {
        try {
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: payload.type_address_work || "house",
                note_address: ""
            };
            if (payload.token) {
                const temp = await this.generalHandleService.decryptObject(payload.token);
                convertToken.lat = temp.lat
                convertToken.lng = temp.lng
                convertToken.address = temp.address
            }
            const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);
            return getCodeAdministrative;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async calculateFeeGroupOrder(lang, payload: createGroupOrderDTOCustomer, subjectAction) {
        try {
            const findCustomer = await this.customerOopSystemService.getDetailItem(lang, payload.id_customer);
            if (payload.extend_optional.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
            if (!payload.token) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
            if (payload.date_work_schedule.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_EMPTY, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: payload.type_address_work || "house",
                note_address: ""
            };
            if (payload.token) {
                const temp = await this.generalHandleService.decryptObject(payload.token);
                convertToken.lat = temp.lat
                convertToken.lng = temp.lng
                convertToken.address = temp.address
            }
            const getCodeAdministrative = await this.identifyArea(payload);
            payload.date_work_schedule.sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1)

            // lay extend optional va kiem tra xem cac extend dua len co cung service hay ko
            const tempData = await this.processServiceFromPayload(lang, payload.extend_optional, getCodeAdministrative);

            // Kiem tra gio dat don hang co lon hon hoac bang gio toi thieu cua service hay khong
            // Danh cho khach hang
            if (subjectAction.type === 'customer') {
                const period = (new Date(payload.date_work_schedule[0]).getTime() - new Date().getTime())/ (1000 * 60 * 60)
                if (period < tempData.service.minimum_time_order) {
                    const hours = new Date(payload.date_work_schedule[0]).getHours().toString().padStart(2, '0')
                    const minutes = new Date(payload.date_work_schedule[0]).getMinutes().toString().padStart(2, '0')

                    const time = `${hours}:${minutes}`
                    const property = {
                        property: time
                    }
                    throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.ORDER_TIME_OVERLAP, lang, property, 'order_time_overlap') ], HttpStatus.BAD_REQUEST);
                }
            }
            
            // const getTotalEstimate

            const service = tempData.service;
            const totalEstimate = tempData.getTotalEstimate

            let infoJob: any = {
                lat: convertToken.lat,
                lng: convertToken.lng,
                address: convertToken.address,
                type_address_work: convertToken.type_address_work,
                note_address: convertToken.note_address,
                service: JSON.parse(JSON.stringify(service)),
                type: service.type,
                city: getCodeAdministrative.city,
                district: getCodeAdministrative.district,
                tip_collaborator: payload.tip_collaborator || 0 * payload.date_work_schedule.length,
                payment_method: payload.payment_method,
                personal: 1, // ko ap dung cho tong ve sinh
                // personal: (mainOptionalService !== null) ? mainOptionalService.extend_optional[0].personal : 1,
                total_estimate: totalEstimate,
                initial_fee: 0,
                total_fee: 0,
                platform_fee: 0,
                final_fee: 0,
                net_income_collaborator: 0,
                date_work_schedule: [],
                code_promotion: null,
                event_promotion: [],
                total_discount: 0
            }

            // reset gia tien trong service chinh
            for (let y = 0; y < service.optional_service.length; y++) {
                for (let z = 0; z < service.optional_service[y].extend_optional.length; z++) {
                    service.optional_service[y].extend_optional[z].price = 0;
                }
            }

            const dateWorkSchedule = []
            for (let i = 0; i < payload.date_work_schedule.length; i++) {
                let payloadItemDateWork = {
                    initial_fee: 0,
                    platform_fee: 0,
                    discount: 0,
                    final_fee: 0,
                    service: null,
                    date: payload.date_work_schedule[i],
                    is_rush_time: false,
                    code_promoition: null,
                    event_promotion: []
                }
                let tempService = infoJob.service;
                const dayWork = new Date(payload.date_work_schedule[i]);
                let initialFee = 0;
                let mainExtendFee = 0; // dung de trong tuong lai xac dinh gia dich vu chinh ap dung khuyen mai
                let secondExtendFee = 0; // dung de trong tuong lai xac dinh gia dich vu ko duoc ap dung khuyen mai
                let serviceFee = 0;
                let PriceIncreaseRushDays = []; // hien thi chi tiet
                let priceIncreaseHoliday = null;
                let percentPlatformFee = 28;
                for (let y = 0; y < tempService.optional_service.length; y++) {
                    for (let z = 0; z < tempService.optional_service[y].extend_optional.length; z++) {
                        let priceUp = 0;
                        let platformFee = 0;
                        // console.log(tempService.optional_service[y].extend_optional[z].count, 'tempService.optional_service[y].extend_optional[z].count');
                        // console.log(tempService.optional_service[y].extend_optional[z].price, 'tempService.optional_service[y].extend_optional[z].price');
                        
                        priceUp = tempService.optional_service[y].extend_optional[z].price * tempService.optional_service[y].extend_optional[z].count
                        // console.log(priceUp, 'priceUp');
                        
                        // console.log(tempService.optional_service[y].extend_optional.percent_platform_fee, 'tempService.optional_service[y].extend_optional.percent_platform_fee');
                        
                        percentPlatformFee = tempService.optional_service[y].extend_optional[z].percent_platform_fee;
                        tempService.optional_service[y].extend_optional[z].initial_fee = tempService.optional_service[y].extend_optional[z].price;
                        // console.log(tempService.optional_service[y].extend_optional[z].area_fee, 'tempService.optional_service[y].extend_optional[z].area_fee');
                        
                        if (tempService.optional_service[y].extend_optional[z].area_fee !== null) {
                            percentPlatformFee = tempService.optional_service[y].extend_optional[z].area_fee.platform_fee;
                            if (tempService.optional_service[y].extend_optional[z].area_fee.area_lv_2 !== null) {
                                // tempService.optional_service[y].extend_optional[z].initial_fee = tempService.optional_service[y].extend_optional[z].area_fee.area_lv_2.price
                                priceUp = tempService.optional_service[y].extend_optional[z].area_fee.area_lv_2.price * tempService.optional_service[y].extend_optional[z].count
                            } else {
                                // tempService.optional_service[y].extend_optional[z].initial_fee = tempService.optional_service[y].extend_optional[z].area_fee.price
                                priceUp = tempService.optional_service[y].extend_optional[z].area_fee.price * tempService.optional_service[y].extend_optional[z].count
                            }
                            

                            // tang gia ngay gio cao diem
                            for (const itemRushDay of tempService.optional_service[y].extend_optional[z].area_fee.price_option_rush_day) {
                                // const dayWork = new Date(payload.date_work_schedule[i]);
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
                                    tempService.optional_service[y].extend_optional[z].fee_up_rush_day = Math.ceil(temp)
                                    PriceIncreaseRushDays.push(Object.assign(itemRushDay, { fee: temp }))

                                }
                            }

                            // Tang gia theo ngay le
                            for (const itemRushHoliday of tempService.optional_service[y].extend_optional[z].area_fee.price_option_holiday) {
                                const dateCompare = new Date(payload.date_work_schedule[i]).getTime();
                                const timeStart = new Date(itemRushHoliday.time_start).getTime();
                                const timeEnd = new Date(itemRushHoliday.time_end).getTime();
                                let temp = 0;
                                if (timeStart < dateCompare && dateCompare < timeEnd) {

                                    if (itemRushHoliday.price_type_increase === "percent_accumulate") {
                                        temp = priceUp * (itemRushHoliday.price / 100) || 0;
                                    }
                                    // if(temp > 0) {
                                    //     console.log(temp, 'temp');
                                    //     console.log(Math.ceil(temp / 1000), 'Math.ceil(temp / 1000)');
                                    //     console.log(Math.ceil(temp / 1000) * 1000, 'Math.ceil(temp / 1000) * 1000');
                                    // }
                                    temp = (temp > 0) ? Math.ceil(temp / 1000) * 1000 : 0;
                                    priceUp += Math.ceil(temp);
                                    tempService.optional_service[y].extend_optional[z].fee_up_holiday = Math.ceil(temp)
                                    priceIncreaseHoliday = Object.assign(itemRushHoliday, { fee: temp });
                                    break;
                                }
                            }
                        }
                        // console.log(priceUp, 'priceUp');
                        
                        initialFee = priceUp;
                        // console.log(initialFee, 'initialFee');
                        
                        if (PriceIncreaseRushDays.length > 0 || priceIncreaseHoliday !== null) payloadItemDateWork.is_rush_time = true;
                        
                        let tempPlatformFee = 0;
                        if(initialFee) {
                            tempPlatformFee = Math.ceil(Number(initialFee) * (Number(percentPlatformFee) / 100))
                            tempPlatformFee = Math.round(tempPlatformFee / 100)
                            platformFee = tempPlatformFee * 100;
                        }
                        
                        // set gia chi tiet cho tung dich vu 
                        tempService.optional_service[y].extend_optional[z].platform_fee = platformFee;
                        tempService.optional_service[y].extend_optional[z].initial_fee = initialFee;
                        // console.log(platformFee, 'platformFee');
                        
                        // set gia tong cho ngay hom do
                        payloadItemDateWork.platform_fee += platformFee;
                        payloadItemDateWork.initial_fee += initialFee
                        payloadItemDateWork.service = tempService
                        tempService.optional_service[y].extend_optional[z].price = initialFee
                        // console.log(service.optional_service[y].extend_optional[z].price, 'service.optional_service[y].extend_optional[z].price');
                        
                        service.optional_service[y].extend_optional[z].price += initialFee
                        // console.log(service.optional_service[y].extend_optional[z].price, 'service.optional_service[y].extend_optional[z].price');

                    }
                }
                infoJob.platform_fee += payloadItemDateWork.platform_fee;
                infoJob.initial_fee += payloadItemDateWork.initial_fee;
                infoJob.date_work_schedule.push(payloadItemDateWork)
            }

            infoJob.service = {...service};


            let calculateCodePromotion = null;
            if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
                payload.code_promotion !== "") {
                calculateCodePromotion = await this.promotionOopSystemService.calculateCodePromotion(lang, infoJob, payload.code_promotion, findCustomer);
            }
            const calculateEventPromotion = await this.promotionOopSystemService.calculateEventPromotion(lang, infoJob, findCustomer);
            
            
            let loadcalculateFinalFee = {
                initial_fee: infoJob.initial_fee,
                code_promotion: calculateCodePromotion,
                event_promotion: calculateEventPromotion.event_promotion || [],
                service_fee: await this.serviceFeeOopSystemService.getServiceFeeByinfoJob(lang, infoJob),
                type: infoJob.type,
                total_tip_collaborator: payload.tip_collaborator * infoJob.date_work_schedule.length || 0,
                total_discount: 0,
                final_fee: 0,
                total_fee: 0,
            }
            
            loadcalculateFinalFee = await this.calculateFinalFee(loadcalculateFinalFee)

            
            infoJob.service_fee = loadcalculateFinalFee.service_fee
            infoJob.final_fee = (loadcalculateFinalFee.final_fee < 0) ? 0 : loadcalculateFinalFee.final_fee
            infoJob.total_fee = loadcalculateFinalFee.total_fee
            infoJob.total_discount = loadcalculateFinalFee.total_discount
            
            infoJob.code_promotion = calculateCodePromotion || null
            
            infoJob.event_promotion = calculateEventPromotion.event_promotion || []
            
            if(infoJob.date_work_schedule.length > 1) {
                infoJob = await this.calculateDiscountPerDate(infoJob)
            } else {
                infoJob.date_work_schedule[0].code_promotion = infoJob.code_promotion
                infoJob.date_work_schedule[0].event_promotion = infoJob.event_promotion
                infoJob.date_work_schedule[0].discount = infoJob.total_discount
                console.log(infoJob.date_work_schedule[0], 'date_work_schedule[0]');
                
            }
            return infoJob;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // lay extend optional va kiem tra xem cac extend dua len co cung service hay ko
    async processServiceFromPayload(lang, arrExtend, getCodeAdministrative) {
        // async checkExtendOptionalPayloadIsAvaiable(lang, arrExtend) {
        try {

            let listExtendOptional = []; // mảng chứa extendOptional
            let listOptionalService = []; // mảng chứa Optional service

            const tempArrIdExtend = []
            for (let i = 0; i < arrExtend.length; i++) {
                tempArrIdExtend.push(arrExtend[i]._id)
            }

            listExtendOptional = await this.extendOptionalOopSystemService.getListWithArrId(tempArrIdExtend)

            let tempArrIdOptionalService = []
            for (let i = 0; i < listExtendOptional.length; i++) {
                tempArrIdOptionalService.push(listExtendOptional[i].id_optional_service)
            }
            // // xu ly optionalTrung
            tempArrIdOptionalService = await this.generalHandleService.removeDuplicateValueArr(tempArrIdOptionalService);

            listOptionalService = await this.optionalServiceOopSystemService.getListWithArrId(tempArrIdOptionalService);
            const checkInvalidOptional = listOptionalService.filter(item => item.id_service !== listOptionalService[0].id_service);
            if (checkInvalidOptional.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);




            for (let i = 0; i < listExtendOptional.length; i++) {
                const temp = listOptionalService.findIndex(item => item._id.toString() === listExtendOptional[i].id_optional_service)
                const findCountExtend = arrExtend.findIndex(item => item._id === listExtendOptional[i]._id.toString())

                // xac dinh khu vuc ap dung tinh gia cho don hang
                let areaFee = null
                for (const itemCity of listExtendOptional[i].area_fee) {
                    if (itemCity.area_lv_1 === getCodeAdministrative.city) {
                        areaFee = itemCity
                        break;
                    }
                }
                if (areaFee !== null) {
                    let temp = null
                    for (const itemDistrict of areaFee.area_lv_2) {
                        if (itemDistrict.area_lv_2.findIndex(item => item === getCodeAdministrative.district) > -1) {
                            temp = itemDistrict
                        }
                    }
                    areaFee.area_lv_2 = temp
                }

                // if(areaFee !== null) {
                //     if(areaFee.area_lv_2 !== null) {
                //         console.log(areaFee.area_lv_2, 'areaFee');

                //     }
                // }
                
                listExtendOptional[i]['optional_service'] = listOptionalService[temp]
                // console.log(listExtendOptional[i].platform_fee, 'listExtendOptional[i].platform_fee');
                if (listOptionalService[temp]['extend_optional'] && listOptionalService[temp]['extend_optional'].length > 0) {                    
                    listOptionalService[temp]['extend_optional'].push({
                        _id: listExtendOptional[i]._id,
                        title: listExtendOptional[i].title,
                        description: listExtendOptional[i].description,
                        price: listExtendOptional[i].price,
                        count: (listOptionalService[temp].type.toString().search(/count/i) > -1) ? arrExtend[findCountExtend].count : 1,
                        estimate: listExtendOptional[i].estimate,
                        area_fee: areaFee || null,
                        personal: listExtendOptional[i].personal,
                        note: listExtendOptional[i].note,
                        percent_platform_fee: listExtendOptional[i].platform_fee,
                        initial_fee: 0,
                        platform_fee: 0,
                        fee_up_holiday: 0,
                        fee_up_rush_day: 0
                    })
                }
                else {
                    listOptionalService[temp]['extend_optional'] = [{
                        _id: listExtendOptional[i]._id,
                        title: listExtendOptional[i].title,
                        description: listExtendOptional[i].description,
                        price: listExtendOptional[i].price,
                        count: (listOptionalService[temp].type.toString().search(/count/i) > -1) ? arrExtend[findCountExtend].count : 1,
                        estimate: listExtendOptional[i].estimate,
                        area_fee: areaFee || null,
                        personal: listExtendOptional[i].personal,
                        note: listExtendOptional[i].note,
                        percent_platform_fee: listExtendOptional[i].platform_fee,
                        initial_fee: 0,
                        platform_fee: 0,
                        fee_up_holiday: 0,
                        fee_up_rush_day: 0
                    }]
                }
            }

            const optionalServiceInService = []
            for (const item of listOptionalService) {
                optionalServiceInService.push({
                    _id: item._id,
                    id_service: item.id_service,
                    extend_optional: item.extend_optional
                })
            }


            const service = await this.createObjectService(lang, optionalServiceInService);

            // console.log(listExtendOptional, 'listExtendOptional');
            

            const getTotalEstimate = await this.getTotalEstimate(service.type, listExtendOptional)

            const payloadResult = {
                service,
                getTotalEstimate
            }

            return payloadResult;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }


    // tao bo service de dua vao 
    async createObjectService(lang, listOptionalService) {
        try {
            const getServivce = await this.serviceOopSystemService.getDetailItem(lang, listOptionalService[0].id_service);
            const service = {
                _id: getServivce._id,
                type: getServivce.type,
                minimum_time_order: getServivce.minimum_time_order,
                optional_service: listOptionalService
            }
            return service;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMainOptionalOrder(listExtendOptional) {
        try {
            listExtendOptional = listExtendOptional.sort((a, b) => a.estimate < b.estimate ? 1 : (a.estimate > b.estimate ? -1 : 0));
            return listExtendOptional[0];
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelGroupOrder(lang, subjectAction, idGroupOrder, idCancel, stepCancel: stepCancelDTO, isPaymentFail: boolean = false, isExpired: boolean = false) {
        try {
            const dateNow = new Date();
            
            const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, idGroupOrder);
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, getGroupOrder.id_customer)
            // lay ca lam dang lam hien tai de hoan phi cho CTV

            const findOrderCurrent = await this.orderOopSystemService.findCurrentOrderInGroupOrder(lang, idGroupOrder)
            let currentOrder = {
                nearOrder: findOrderCurrent,
                refundCollaborator: (findOrderCurrent.subtotal_fee === findOrderCurrent.initial_fee) ? findOrderCurrent.pending_money + findOrderCurrent.platform_fee : findOrderCurrent.payment_method === PAYMENT_METHOD.cash ? findOrderCurrent.work_shift_deposit : 0
            };
            // const refundCollaborator = getOrder.platform_fee + getOrder.pending_money;
            // chuan bi thong tin
            const payloadDependency = {
                customer: getCustomer,
                collaborator: null,
                group_order: getGroupOrder,
                punish_ticket: null,
                admin_action: null,
                reason_cancel: null,
                order: findOrderCurrent
            }

            if(subjectAction.type === "admin") {
                const getAdmin = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id);
                payloadDependency.admin_action = getAdmin;
            }
            if (getGroupOrder.id_collaborator !== null) {
                const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
                payloadDependency.collaborator = getCollaborator;
            }

            let resultCancel: any;
            // let resultCancel = {
            //     groupOrder: {},
            //     nearOrder: {},
            //     refundCustomer: 0,
            //     refundCollaborator: 0
            // }
            // // 1. huy don

            let getFinalFeeRemain = 0

            if (stepCancel.isCancel === true) {
                const getReasonCancel = await this.reasonCancelOopSystemService.getDetailItem(lang, idCancel);
                payloadDependency.reason_cancel = getReasonCancel
                const groupOrder = await this.groupOrderOopSystemService.cancel(lang, getGroupOrder._id, subjectAction, getReasonCancel._id)
                getFinalFeeRemain = await this.orderOopSystemService.totalFinalFeeRemain(lang, getGroupOrder._id);
                await this.orderOopSystemService.cancelAllOrderByGroupOrder(lang, getGroupOrder._id);
                await this.historyActivityOopSystemService.cancelGroupOrder(subjectAction, payloadDependency);
                const dateNow = new Date();
                const minute = await this.generalHandleService.calculateTimeInterval(findOrderCurrent.date_work, dateNow, "minute")
                await this.notificationSystemService.cancelGroupOrder(lang, subjectAction, { type: "customer", _id: getCustomer._id, customer: getCustomer }, groupOrder, findOrderCurrent, minute, isPaymentFail, isExpired)
                if (payloadDependency.collaborator) {
                    await this.notificationSystemService.cancelGroupOrder(lang, subjectAction, { type: "collaborator", _id: payloadDependency.collaborator._id, collaborator: payloadDependency.collaborator }, groupOrder, findOrderCurrent, minute)
                }
            }

            // 2. hoan tien cho KH
            if (stepCancel.isRefundCustomer === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                if (getGroupOrder.payment_method === 'point') {
                    // const getFinalFeeRemain = await this.orderOopSystemService.totalFinalFeeRemain(lang, getGroupOrder._id);
                    const customer = await this.customerOopSystemService.addPayPoint(lang, getFinalFeeRemain, getCustomer._id)
                    payloadDependency.customer = customer;
                    
                    await this.historyActivityOopSystemService.refundPayPointCustomer({ type: "system", _id: null }, payloadDependency, getFinalFeeRemain)

                    await this.notificationSystemService.refundCustomer(lang, payloadDependency, getFinalFeeRemain);
                }

                if (getGroupOrder.payment_method !== PAYMENT_METHOD.cash && getGroupOrder.payment_method !== PAYMENT_METHOD.point) {
                    const customer = await this.customerOopSystemService.addPayPoint(lang, getFinalFeeRemain, getCustomer._id)
                    payloadDependency.customer = customer;
                    await this.historyActivityOopSystemService.refundPayPointCustomer({type: "system", _id: null}, payloadDependency, getFinalFeeRemain)
                    await this.notificationSystemService.refundCustomer(lang, payloadDependency, getFinalFeeRemain);
                }
            }

            // 3. hoan tien cho CTV
            if (stepCancel.isRefundCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                if (getGroupOrder.id_collaborator !== null) {
                    const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
                    const previousBalance = {
                        work_wallet: getCollaborator.work_wallet,
                        collaborator_wallet: getCollaborator.collaborator_wallet,
                    }
                    if (currentOrder.refundCollaborator > 0) {
                        payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, getGroupOrder.id_collaborator, "work_wallet", currentOrder.refundCollaborator);
                        await this.historyActivityOopSystemService.refundPointWalletCollaborator({ type: "system", _id: null }, payloadDependency, previousBalance, currentOrder.refundCollaborator);
                        await this.notificationSystemService.refundCollaborator(lang, payloadDependency, currentOrder.refundCollaborator);
                    } else {
                        payloadDependency.collaborator = getCollaborator
                    }
                   
                }
            }


            // 4. check xem co phat CTV hay ko
            // old
            // if (stepCancel.isPunishCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
            //     let collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
            //     let timeInterval = await this.generalHandleService.calculateTimeInterval(currentOrder.nearOrder.date_work, dateNow, "millisecond")
            //     timeInterval = Math.abs(timeInterval)
            //     let payload: createPunishTicketFromPolicyDTO = {
            //         id_collaborator: collaborator._id,
            //         id_punish_policy: '',
            //         id_order: currentOrder.nearOrder._id,
            //         is_verify_now: true,
            //     }
            //     if (timeInterval < 2 * MILLISECOND_IN_HOUR) {
            //         payload.id_punish_policy = '6634662361c1079edc4cf069';
            //     } else if (timeInterval < 8 * MILLISECOND_IN_HOUR) {
            //         payload.id_punish_policy = '6634664761c1079edc4cf09a';
            //     } else {
            //         payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
            //     }
            //     const getPolicy = await this.punishPolicyOopSystemService.getDetailItem(lang, payload.id_punish_policy);
            //     const ticket = await this.punishTicketOopSystemService.createItemFromPolicy(lang, payload, getPolicy, payloadDependency);

            //     if (ticket.punish_money > 0) {
            //         const previousBalance = {
            //             work_wallet: collaborator.work_wallet,
            //             collaborator_wallet: collaborator.collaborator_wallet,
            //         }
            //         payloadDependency.punish_ticket = ticket;
            //         collaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, collaborator._id, ticket.punish_money, TYPE_GROUP_ORDER.single, TYPE_ACTION.other, false);
            //         payloadDependency.collaborator = collaborator
            //         await this.historyActivityOopSystemService.punishMoney({ type: "system", _id: null }, payloadDependency, previousBalance, ticket.punish_money)
            //         await this.notificationSystemService.sendNotiPunish(lang, { type: "collaborator", _id: collaborator._id }, payloadDependency, ticket.punish_money)
            //         payloadDependency.punish_ticket = null
            //     }

            //     // Cập nhật phiếu phạt vào trong đơn hàng
            //     const punishTicket = {
            //         id_punish_ticket: ticket._id,
            //         date_create: ticket.date_create,
            //         execution_date: new Date().toISOString(),
            //         revocation_date: null
            //     }
            //     currentOrder.nearOrder.list_of_punish_ticket.push(punishTicket)
            //     currentOrder.nearOrder.total_punish += ticket.punish_money
            //     currentOrder.nearOrder.incurrence_time.push({ date_create: ticket.date_create, fee: ticket.punish_money })
            //     await this.orderOopSystemService.updateOrder(lang, currentOrder.nearOrder)

            //     this.punishTicketOopSystemService.doingToDonePunishTicket(lang, ticket._id);
            // }
            // new
            if (stepCancel.isPunishCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                let collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
                let timeInterval = await this.generalHandleService.calculateTimeInterval(currentOrder.nearOrder.date_work, dateNow, "millisecond")
                timeInterval = Math.abs(timeInterval)
                let payload: createPunishTicketFromPolicyDTO = {
                    id_collaborator: collaborator._id,
                    id_punish_policy: '',
                    id_order: currentOrder.nearOrder._id,
                }
                if (timeInterval < 2 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634662361c1079edc4cf069';
                } else if (timeInterval < 8 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634664761c1079edc4cf09a';
                } else {
                    payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
                }
                const newPayloadDependency = await this.punishTicketSystemService.createPunishTicket(lang, subjectAction, payload);
                const getPunishTicket = await this.punishTicketSystemService.executePunishTicket(lang, subjectAction, newPayloadDependency);

                // Cập nhật phiếu phạt vào trong đơn hàng
                const punishTicket = {
                    id_punish_ticket: getPunishTicket._id,
                    date_create: getPunishTicket.date_create,
                    execution_date: new Date().toISOString(),
                    revocation_date: null
                }
                currentOrder.nearOrder.list_of_punish_ticket.push(punishTicket)
                currentOrder.nearOrder.total_punish += getPunishTicket.punish_money
                currentOrder.nearOrder.incurrence_time.push({ date_create: getPunishTicket.date_create, fee: getPunishTicket.punish_money })
                payloadDependency.order = await this.orderOopSystemService.updateOrder(lang, currentOrder.nearOrder)
            }

            // 5 check xem co phat KH hay ko
            if (stepCancel.isPunishCustomer === true) {

            }

            // 6. check xen co day CTV ra ko, huy ca goi dich vu ko ap dung cho collaborator nen ko can buoc nay
            if (stepCancel.isUnassignCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                const infoLinkedCollaborator = await this.orderSystemService.setObjectInfoLinkedCollaborator(payloadDependency, STATUS_ORDER.cancel)
                await Promise.all([                  
                    this.orderOopSystemService.multiUnassignCollaboratorOfGroupOrder(lang, subjectAction, payloadDependency),
                    this.orderOopSystemService.setMultiInfoLinkedCollaborator(payloadDependency.order, infoLinkedCollaborator),
                    this.groupOrderOopSystemService.unassignCollaborator(lang, payloadDependency.group_order._id),
                ])
                if(subjectAction.type === "admin") {
                    await this.historyActivityOopSystemService.unassignCollaborator(subjectAction, payloadDependency)
                }
                // await this.unassignCollaboratorFromGroupOrder(lang, subjectAction, idGroupOrder, currentOrder.nearOrder);
            }

            // 7 xu ly tru tien cho don tiep theo, vi huy ca goi dich vu nen ko can tinh buoc nay
            if (stepCancel.isMinusNextOrderCollaborator === true) {
                // const nextOrder = await this.orderSystemService.findNextOrderInGroupOrder(lang, idOrder);
                // const minusFee = nextOrder.platform_fee + nextOrder.pending_money;
                // await this.collaboratorSystemService.minusPlatformFee(lang, "system", nextOrder.id_collaborator, nextOrder, minusFee)
            }

            // 8. Huy transaction doi voi don hang co trang thai transaction la processing
            const getTransaction = await this.transactionOopSystemService.getDetailItemByIdGroupOrder(lang, getGroupOrder._id)
            if(getTransaction && getTransaction.status === STATUS_TRANSACTION.processing) {
                getTransaction.status = STATUS_TRANSACTION.cancel
                await this.transactionOopSystemService.updateTransaction(lang, getTransaction)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getHistoryActivityGroupOrder(idGroupOrder, iPage) {
        try {
            const resultData = await this.historyActivityOopSystemService.getListForGroupOrder(idGroupOrder, iPage);
            return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async unassignCollaboratorFromGroupOrder(lang, subjectAction, idGroupOrder, orderCancel) {
        try {

            const findGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, idGroupOrder);
            await this.collaboratorOopSystemService.getDetailItem(lang, findGroupOrder.id_collaborator);

            const query = {
                $and: [
                    { status: { $in: ["confirm", "doing"] } },
                    { id_group_order: findGroupOrder._id }
                ]
            }
            const getOrderNotDone = await this.orderOopSystemService.getListNoPagination(query)


            for (let i = 0; i < getOrderNotDone.length; i++) {
                await this.orderOopSystemService.unassignCollaborator(lang, getOrderNotDone[i]._id);
            }

            await this.groupOrderOopSystemService.unassignCollaborator(lang, findGroupOrder._id)

            // await this.notificationSystemService.unAssignCollaborator(subjectAction.type, findGroupOrder, getCollaborator, orderCancel)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async calculateFinalFee(loadcalculateFinalFee) {
        try {
            loadcalculateFinalFee.total_fee = loadcalculateFinalFee.initial_fee + loadcalculateFinalFee.total_tip_collaborator;
            loadcalculateFinalFee.final_fee = loadcalculateFinalFee.initial_fee + loadcalculateFinalFee.total_tip_collaborator;
    
            if (loadcalculateFinalFee.code_promotion !== null) {
                loadcalculateFinalFee.final_fee = loadcalculateFinalFee.final_fee - Number(loadcalculateFinalFee.code_promotion['discount'] | 0);
                loadcalculateFinalFee.total_discount += Number(loadcalculateFinalFee.code_promotion['discount'] | 0)
            }
            for (let i = 0; i < loadcalculateFinalFee.event_promotion.length; i++) {
                loadcalculateFinalFee.final_fee = loadcalculateFinalFee.final_fee - Number(loadcalculateFinalFee.event_promotion[i]['discount'] | 0);
                loadcalculateFinalFee.total_discount += Number(loadcalculateFinalFee.event_promotion[i]['discount'] | 0);
            }
            for (let i = 0; i < loadcalculateFinalFee.service_fee.length; i++) {
                loadcalculateFinalFee.final_fee = loadcalculateFinalFee.final_fee + Number(loadcalculateFinalFee.service_fee[i]['fee'] || 0);
                loadcalculateFinalFee.total_fee = loadcalculateFinalFee.total_fee + Number(loadcalculateFinalFee.service_fee[i]['fee'] || 0);
            }
            return loadcalculateFinalFee;
        } catch (err ) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async calculateDiscountPerDate(infoJob) {
        try {
            const totalDate = infoJob.date_work_schedule.length;

            if(infoJob.code_promotion !== null) {
                let temp = (infoJob.code_promotion.discount / 1000).toString().split(".");
                const soNguyen = Number(temp[0]);
                let soDuLeCuoi = 0;
                if(temp.length > 1) soDuLeCuoi = Number(temp[1]) * 100;
    
                let tempSoDu = soNguyen;
                let soDuDiemCuoi = 0
                while ((tempSoDu % totalDate) !== 0) {
                    tempSoDu -= 1;
                    soDuDiemCuoi++ 
                }
                const tempDiscountPerDate = tempSoDu / totalDate;
                for(let i = 0 ; i < totalDate - 1 ; i++) {
                    infoJob.date_work_schedule[i].code_promotion = {...infoJob.code_promotion};
                    infoJob.date_work_schedule[i].code_promotion.discount = tempDiscountPerDate * 1000
                }
                infoJob.date_work_schedule[totalDate - 1].code_promotion = {...infoJob.code_promotion};
                infoJob.date_work_schedule[totalDate - 1].code_promotion.discount = ((tempDiscountPerDate + soDuDiemCuoi) * 1000) + soDuLeCuoi
            }
            
            if(infoJob.event_promotion.length > 0) {
                for(let y = 0 ; y < infoJob.event_promotion.length ; y++) {
                    let temp = (infoJob.event_promotion[y].discount / 1000).toString().split(".");
                    const soNguyen = Number(temp[0]);
                    let soDuLeCuoi = 0;
                    if(temp.length > 1) soDuLeCuoi = Number(temp[1]) * 100;
        
                    let tempSoDu = soNguyen;
                    let soDuDiemCuoi = 0
                    while ((tempSoDu % totalDate) !== 0) {
                        tempSoDu -= 1;
                        soDuDiemCuoi++ 
                    }
                    const tempDiscountPerDate = tempSoDu / totalDate;
                    for(let i = 0 ; i < totalDate - 1 ; i++) {
                        infoJob.date_work_schedule[i].event_promotion.push({...infoJob.event_promotion[y]})
                        infoJob.date_work_schedule[i].event_promotion[infoJob.date_work_schedule[i].event_promotion.length - 1].discount = tempDiscountPerDate * 1000
                    }
                    const lengthEvent = infoJob.date_work_schedule[0].event_promotion.length;
                    
                    infoJob.date_work_schedule[totalDate - 1].event_promotion.push({...infoJob.event_promotion[y]})
                    infoJob.date_work_schedule[totalDate - 1].event_promotion[lengthEvent - 1].discount = ((tempDiscountPerDate + soDuDiemCuoi) * 1000) + soDuLeCuoi
                }
            }

            for(let i = 0 ; i < totalDate ; i++) {
                if(infoJob.code_promotion) {
                    infoJob.date_work_schedule[i].discount += infoJob.date_work_schedule[i].code_promotion.discount;
                }
                if(infoJob.event_promotion.length > 0 ) {
                    for(const item of infoJob.date_work_schedule[i].event_promotion) {
                        
                        infoJob.date_work_schedule[i].discount += item.discount
                    }
                }
            }
            

            return infoJob;
        } catch (err ) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalEstimate(serviceType, listExtendOptional) {
        try {
            
            let resultEstimate = 0;
            if(serviceType === "schedule" || serviceType === "loop") {
                const temp = await this.generalHandleService.sortArrObject(listExtendOptional, "estimate", -1);
                resultEstimate = temp[0].estimate
            }

            return resultEstimate
        } catch (err ) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async getGroupOrderByCustomer(idCustomer, iPage) {
        try {
            const resultData = await this.groupOrderOopSystemService.getGroupOrderByCustomer(idCustomer, iPage);
            return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getGroupOrderHistoryByCustomer(idCustomer, iPage) {
        try {
            const resultData = await this.groupOrderOopSystemService.getGroupOrderHistoryByCustomer(idCustomer, iPage);
            return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTransactionExecutionDate(lang, idGroupOrder) {
        try {
            const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, idGroupOrder)
            getGroupOrder.transaction_execution_date = new Date(Date.now()).toISOString()
            await this.groupOrderOopSystemService.updateGroupOrder(lang, getGroupOrder)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getInforGroupOrder(lang, subjectAction, idGroupOrder) {
        try {
            const [item, getCustomerSetting] = await Promise.all([
                this.groupOrderOopSystemService.getInforGroupOrder(lang, idGroupOrder, subjectAction._id),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])
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

            let paymentInformation = getCustomerSetting.payment_method.find((e) => e.method === item.payment_method)
            if (paymentInformation) {
                item._doc['payment_method_name'] = {
                    vi: paymentInformation.title.vi,
                    en: paymentInformation.title.en,
                }
            }
            return { item, type };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
