import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { addDays, eachDayOfInterval, eachMonthOfInterval, subMinutes } from 'date-fns'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, GlobalService, HistoryActivity, HistoryActivityDocument, ID_ORDER_DAILY, LOOKUP_ADMIN_VERIFY, LOOKUP_COLLABORATOR, LOOKUP_CUSTOMER, LOOKUP_GROUP_ID_COLLABORATOR, LOOKUP_GROUP_ID_CUSTOMER, LOOKUP_ID_ORDER, LOOKUP_ID_REASON_CANCEL, LOOKUP_PUNISH, LOOKUP_PUNISH_TICKET_DONE, LOOKUP_PUNISH_TICKET_DONE_BY_COLLABORATOR, LOOKUP_REASON_CANCEL, LOOKUP_TRANSACTION_PUNISH, LOOKUP_TRANSACTION_PUNISH_DONE, Order, OrderDocument, PERCENT_INCOME, PERCENT_INCOME_ENVENUE, POP_COLLABORATOR_INFO, POP_CUSTOMER_INFO, POP_SERVICE_TITLE, POP_USER_SYSTEM, PROJECT_ADMIN_VERIFY, PROJECT_COLLABORATOR, PROJECT_CUSTOMER, SORT_DATE_CREATE, SORT_DATE_WORK, Service, ServiceDocument, TEMP_DATE_CREATE, TEMP_DATE_WORK, TEMP_DISCOUNT, TEMP_PUNISH, TEMP_PUNISH_TICKET, TEMP_SERVICE_FEE, TEMP_TRANSACTION_PUNISH, TOTAL_COLLABORATOR_FEE, TOTAL_DISCOUNT, TOTAL_GROSS_INCOME, TOTAL_HOUR, TOTAL_INCOME, TOTAL_NET_INCOME, TOTAL_NET_INCOME_BUSINESS, TOTAL_ORDER, TOTAL_ORDER_CONFIRM, TOTAL_ORDER_DOING, TOTAL_ORDER_DONE, TOTAL_ORDER_FEE, TOTAL_ORDER_TAX, TOTAL_PUNISH, TOTAL_SERVICE_FEE, TOTAL_TIP_COLLABORATOR, TransitionCollaborator, TransitionCollaboratorDocument, TransitionCustomer, TransitionCustomerDocument, UserSystem, UserSystemDocument, iPageHistoryOrderDTOCollaborator, iPageReportCancelOrderDTOAdmin, iPageReportConnecting, iPageReportCustomerDTOAdmin, iPageReportGroupOrderDTOAdmin, iPageReportOrderByCustomerDTOAdmin, iPageReportOrderByDayDTOAdmin, iPageReportReviewDTOAdmin, iPageReportTypeServiceDTOAdmin, iPageTopCustomerInviterDTOAdmin } from 'src/@core'
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { iPageDTO } from '../../@core/dto/general.dto'
import { AuthService } from '../auth/auth.service'


@Injectable()
export class ReportManangerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private globalService: GlobalService,
        private authService: AuthService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private orderRepositoryService: OrderRepositoryService,

        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>

    ) { }
    async getCountCustomer(lang, payload) {
        try {
            const query = {
                $and: [
                    // { date_create: { $lte: payload.endDate, $gte: payload.startDate  } },
                    { is_delete: false },
                    { is_active: true }
                ]
            };
            const count = await this.customerModel.count(query);
            return count;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getCountCollaborator(lang, payload) {
        try {
            const query = {
                $and: [
                    // { date_create: { $lte: payload.endDate } },
                    // { date_create: { $gte: payload.startDate } },
                    { is_delete: false },
                    { is_active: true },
                    { is_verify: true },
                    { is_locked: false },
                    { status: "actived"}
                ]
            };
            const count = await this.collaboratorModel.count(query);
            return count;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getRevenueByOrder(lang, payload) {
        try {
            // const query = {
            //     $and: [
            //         // {
            //         //     $and: [
            //         //         { date_work: { $lte: payload.endDate } },
            //         //         { date_work: { $gte: payload.startDate } }
            //         //     ]
            //         // },
            //         {
            //             city: { $exists: true }
            //         },
            //         {
            //             district: { $exists: true }
            //         },
            //         {
            //             status: "done"
            //         },
            //         {
            //             is_delete: false
            //         }
            //     ]
            // }
            // if (payload.city !== -1) query.$and[1] = { city: payload.city }
            // if (payload.district !== -1) query.$and[2] = { district: payload.district }
            // const arrItem = await this.orderModel.find(query).select({ final_fee: 1 });
            const getOrder = await this.orderModel.aggregate([
                {
                    $match: {
                        status: "done",
                        is_delete: false,
                    },
                },
                {
                    $group: {
                        _id: {},
                        total_income: TOTAL_INCOME,
                        total_item: TOTAL_ORDER,
                    }
                },
            ]);

            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    }
                ],
            };
            const getTotal = await this.orderModel.aggregate([
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
                        total_income: TOTAL_INCOME,
                        total_item: TOTAL_ORDER,
                    }
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);


            const result = {
                total_revenue: getTotal.length > 0 ? getTotal[0].total_income : 0,
                total_order: getTotal.length > 0 ? getTotal[0].total_item : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getTotalReport(lang, payload) {
        try {
            const result = await Promise.all([
                await this.getCountCustomer(lang, payload),
                await this.getCountCollaborator(lang, payload),
                await this.getRevenueByOrder(lang, payload)
            ]);
            const total = {
                total_customer: result[0],
                total_collaborator: result[1],
                total_order: result[2].total_order,
                total_revenue: result[2].total_revenue
            };
            return total;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async historyFinanceJobSystem(lang, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {

            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        $or: [
                            {status: "confirm"},
                            {status: "done"},
                            {status: "doing"}
                        ]
                    },
                    {
                        end_date_work: {
                            $gte: iPage.start_date,
                        },
                    },
                    {
                        end_date_work: {
                            $lte: iPage.end_date,
                        },
                    },
                ],
            };
            // if (iPage.type !== 'date_work') {
            //     query.$and[2] = {
            //         date_create: {
            //             $gte: iPage.start_date,
            //         },
            //     };
            //     query.$and[3] = {
            //         date_create: {
            //             $lte: iPage.end_date,
            //         },
            //     };
            // }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            // if (iPage.city) {
            //     query.$and.push({ city: { $in: iPage.city } });
            // } else if (checkPermisstion.city.length > 0) {
            //     query.$and.push({ city: { $in: checkPermisstion.city } });
            // }
            // if (iPage.district) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: iPage.district } },
            //             { district: [] }
            //         ]
            //     });
            // } else if (checkPermisstion.district.length > 0) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: checkPermisstion.district } },
            //             { district: [] }
            //         ]
            //     });
            // }
            // if (admin.id_business) {
            //     /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
            //     query.$and.push({ 'id_business': admin.id_business });
            // }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const getDataOrder = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                // {
                //     $addFields: iPage.type === 'date_create' ? TEMP_DATE_CREATE : TEMP_DATE_WORK
                // },
                {
                    $addFields: TEMP_DATE_WORK
                },
                {
                    $group: {
                        // _id: { "$dateToString": { "format": "%d-%m-%Y", "date": "$tempDate" } },
                        _id: ID_ORDER_DAILY,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        sort_date_create: SORT_DATE_CREATE,
                        sort_date_work: SORT_DATE_WORK,
                    },
                },

                { $sort: { sort_date_work: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);
            const count = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_DATE_WORK
                },
                {
                    $group: {
                        _id: { "$dateToString": { "format": "%Y-%m-%d", "date": "$tempDate" } },
                    }
                },
                { $count: 'total' },
            ]);

            const getTotal = await this.orderModel.aggregate([
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
                        total_gross_income: TOTAL_GROSS_INCOME,
                    }
                }
            ]);

            const totalCollaborator = await this.collaboratorModel.count({ is_delete: false, is_active: true, is_verify: true, is_locked: false });
            const totalCustomer = await this.customerModel.count({ is_delete: false, is_active: true, is_locked: false });

            const result = {
                // start: Number(iPage.start),
                // length: Number(iPage.length),
                // total: getTotal,
                arrResult: getDataOrder,
                numberCustomer: totalCustomer,
                numberCollaborator: totalCollaborator,
                total_money: getTotal[0].total_gross_income || 0,
            };
            return result;




            // // const totalCustomer = this.customerModel.count()
            // // // return totalCustomer
            // // const totalCollaborator = this.collaboratorModel.count()
            // // return totalCollaborator
            // let timeStart = new Date(iPage.start_date).getTime();
            // const timeEnd = new Date(iPage.end_date).getTime();
            // let increaseDay;
            // switch (iPage.typeSort) {
            //     // 1 day
            //     case "day":
            //         increaseDay = 86400000;
            //         break;
            //     // 7 days
            //     case "week":
            //         increaseDay = 604800000;
            //         break;
            //     // 30 days
            //     case "month":
            //         increaseDay = 2592000000;
            //         break;
            //     // 90 days
            //     case "quarter":
            //         increaseDay = 7776000000;
            //         break;
            //     // 365 days
            //     case "year":
            //         increaseDay = 31536000000;
            // }
            // const arrPromise = []
            // const arrDate = [];
            // for (let i = timeStart; i < timeEnd; i = i + increaseDay) {
            //     const date = {
            //         start: new Date(i),
            //         end: new Date(i + increaseDay - 1)
            //     }
            //     const query = {
            //         $and: [
            //             {
            //                 $and: [
            //                     { end_date_work: { $lte: new Date(date.end).toISOString() } },
            //                     { end_date_work: { $gte: new Date(date.start).toISOString() } }
            //                 ]
            //             },
            //             {
            //                 status: "done"
            //             },
            //             {
            //                 is_delete: false
            //             }
            //         ]
            //     }
            //     arrPromise.push(this.orderModel.find(query).select({ final_fee: 1 }));
            //     arrDate.push(date);
            // }
            // // return totalCollaborator
            // const arrOrder = await Promise.all(arrPromise);
            // const arrResult = [];
            // for (let i = 0; i < arrOrder.length; i++) {
            //     let totalIncome = 0;
            //     for (const item of arrOrder[i]) {
            //         totalIncome = totalIncome + item.initial_fee;
            //     }
            //     const payload = {
            //         date_start: arrDate[i].start,
            //         date_end: arrDate[i].end,
            //         total_income: totalIncome,
            //         total_job: arrOrder[i].length,
            //     }
            //     arrResult.push(payload);
            // }
            // let total_money = 0;
            // for (let item of arrResult) {
            //     total_money += item.total_income;
            // }
            // const totalCustomer = await this.customerModel.count()
            // const totalCollaborator = await this.collaboratorModel.count()
            // const result = {
            //     arrResult: arrResult,
            //     numberCustomer: totalCustomer,
            //     numberCollaborator: totalCollaborator,
            //     total_money: total_money,
            // }
            // return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCollaborator(lang, iPage: iPageHistoryOrderDTOCollaborator) {
        try {
            //     let total_income = 0; // tổng doanh thu
            //     let total_discount = 0; // tổng tiền giảm giá
            //     let total_net_income = 0; // tổng doanh thu thuần
            //     let total_gross_income = 0; // tổng doanh số
            //     let total_net_income_business = 0; // tổng lợi nhuận
            //     let total_collabotator_fee = 0; // tổng phí dịch vụ
            //     let percent_income = 0; // phần trăm lợi nhuận
            //     let total_serviceFee = 0; // tổng phí áp dụng
            //     let total_order_fee = 0; // tổng hóa đơn
            //         total_income += order.initial_fee - order.net_income_collaborator;
            //         total_net_income += order.initial_fee - order.net_income_collaborator - tempDiscount;
            //         total_gross_income += order.initial_fee;
            //         total_collabotator_fee += order.net_income_collaborator;
            //         total_net_income_business += order.initial_fee - order.net_income_collaborator - tempDiscount + tempServiceFee;
            //         total_order_fee += order.final_fee;
            //         total_serviceFee += tempServiceFee;
            // let total = {
            //     income: 0, // tổng doanh thu
            //     discount: 0, // tổng tiền giảm giá
            //     net_income: 0, // tổng doanh thu thuần
            //     gross_income: 0, // tổng doanh số
            //     net_income_business: 0, // tổng lợi nhuận
            //     collabotator_fee: 0, // tổng phí dịch vụ
            //     percent_income: 0, // phần trăm lợi nhuận
            //     order_fee: 0, // tổng hóa đơn
            //     serviceFee: 0, // tổng phí áp dụng
            //     total_order: 0 // tổng số ca
            // }
            const getTotal = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false },
                            // { date_work: { $gte: iPage.start_date, $lte: iPage.end_date } }
                            { end_date_work: { $gte: iPage.start_date } },
                            { end_date_work: { $lte: iPage.end_date } }
                        ]
                    }
                },
                { $addFields: TEMP_SERVICE_FEE },
                { $addFields: TEMP_DISCOUNT },
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
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    }
                },
                // {
                //     $sort: { date_work: -1 }
                // }
            ]);
            const getCollaborator = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false },
                            { end_date_work: { $gte: iPage.start_date } },
                            { end_date_work: { $lte: iPage.end_date } },

                            {
                                $or: [
                                    {
                                        phone_collaborator: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                    {
                                        name_collaborator: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                ]
                            },
                        ]
                    }
                },
                { $addFields: TEMP_SERVICE_FEE },
                { $addFields: TEMP_DISCOUNT },
                { $addFields: { tempNetIncome: { $sum: { $subtract: [{ $subtract: ["$initial_fee", "$net_income_collaborator"] }, "$tempDiscount"] } } } },
                { $addFields: { tempBusiness: { $sum: { $add: ["$tempNetIncome", "$tempServiceFee"] } } } },
                { $addFields: { tempTotalIncome: { $sum: { $subtract: ["$initial_fee", "$net_income_collaborator"] } } } },
                {
                    $group: {
                        _id: "$id_collaborator",
                        id_view: { $first: "$id_view" },
                        code_collaborator: { $first: "$id_collaborator" },
                        full_name: { $first: "$name_collaborator" },
                        total_order: { $count: {} },
                        total_gross_income: { $sum: "$initial_fee" },
                        total_collabotator_fee: { $sum: "$net_income_collaborator" },
                        total_income: { $sum: "$tempTotalIncome" },
                        total_discount: { $sum: "$tempDiscount" },
                        total_net_income: { $sum: "$tempNetIncome" },
                        total_serviceFee: { $sum: "$tempServiceFee" },
                        total_order_fee: { $sum: "$final_fee" },
                        total_net_income_business: { $sum: "$tempBusiness" },
                        percent_income: { $first: 0 },
                    }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                { $sort: { end_date_work: -1 } }
            ]);

            const totalItem = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false },
                            { end_date_work: { $gte: iPage.start_date } },
                            { end_date_work: { $lte: iPage.end_date } },
                        ]
                    }
                },
                { $addFields: TEMP_SERVICE_FEE },
                { $addFields: TEMP_DISCOUNT },
                { $addFields: { tempNetIncome: { $sum: { $subtract: [{ $subtract: ["$initial_fee", "$net_income_collaborator"] }, "$tempDiscount"] } } } },
                { $addFields: { tempBusiness: { $sum: { $add: ["$tempNetIncome", "$tempServiceFee"] } } } },
                { $addFields: { tempTotalIncome: { $sum: { $subtract: ["$initial_fee", "$net_income_collaborator"] } } } },
                {
                    $group: {
                        _id: "$id_collaborator",
                        id_view: { $first: "$id_view" },
                        code_collaborator: { $first: "$id_collaborator" },
                        full_name: { $first: "$name_collaborator" },
                        total_order: { $count: {} },
                        total_gross_income: { $sum: "$initial_fee" },
                        total_collabotator_fee: { $sum: "$net_income_collaborator" },
                        total_income: { $sum: "$tempTotalIncome" },
                        total_discount: { $sum: "$tempDiscount" },
                        total_net_income: { $sum: "$tempNetIncome" },
                        total_serviceFee: { $sum: "$tempServiceFee" },
                        total_order_fee: { $sum: "$final_fee" },
                        total_net_income_business: { $sum: "$tempBusiness" },
                        percent_income: { $first: 0 },
                    }
                },
                {
                    $count: "totalItem"
                },
                { $sort: { end_date_work: -1 } }
            ]);


            for (let item of getCollaborator) {
                item.percent_income = ((item.total_net_income_business / item.total_income) * 100).toFixed(2);
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                total: getTotal.length > 0 ? getTotal[0] : 0,
                totalItem: totalItem.length > 0 ? totalItem[0].totalItem : 0,
                data: getCollaborator
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // khong dung nua
    async reportCollaboratorDetail(lang, id: string, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(id);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.BAD_REQUEST);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city, getCollaborator.district, getCollaborator.id_business);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            let query: any = {
                $and: [
                    {
                        id_collaborator: getCollaborator._id,
                    },
                    {
                        status: 'done'
                    },
                    {
                        end_date_work: { $gte: iPage.start_date }
                    },
                    {
                        end_date_work: { $lte: iPage.end_date }
                    }
                ]
            };
            const getOrder = await this.orderModel.find(query)
                .sort({ date_work: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const countOrder = await this.orderModel.count(query);
            let arrOrder = [];
            for (let order of getOrder) {
                let tempServiceFee = 0;
                let tempDiscount = 0;
                let total_net_income_business = 0; // tổng doanh thu công ty
                let percent_income = 0; // phần trăm lợi nhuận
                for (let item of order.service_fee) {
                    tempServiceFee += Number(item['fee']);
                }
                if (order.code_promotion) {
                    tempDiscount = order.code_promotion['discount'];
                }
                if (order.event_promotion.length > 0) {
                    for (const item of order.event_promotion) {
                        tempDiscount += item['discount'];
                    }
                }
                total_net_income_business = order.initial_fee - tempDiscount - order.net_income_collaborator + tempServiceFee;
                percent_income = (total_net_income_business / (order.initial_fee - order.net_income_collaborator - tempDiscount)) * 100;
                if (typeof percent_income === "number") {
                    percent_income = Number(percent_income.toFixed(2));
                }
                const orderOfColaborator = {
                    _id: getCollaborator._id,
                    id_view: getCollaborator.id_view,
                    date_work: order.date_work,
                    total_estimate: order.total_estimate,
                    code_collaborator: getCollaborator._id,
                    full_name: getCollaborator.full_name,
                    total_order: 1,
                    total_gross_income: order.initial_fee,
                    total_collabotator_fee: order.net_income_collaborator,
                    total_income: order.initial_fee - order.net_income_collaborator,
                    total_discount: tempDiscount,
                    total_net_income: order.initial_fee - order.net_income_collaborator - tempDiscount,
                    total_serviceFee: tempServiceFee,
                    total_order_fee: order.final_fee,
                    total_net_income_business: total_net_income_business,
                    percent_income: percent_income,
                    id_view_order: order.id_view
                };
                arrOrder.push(orderOfColaborator);
            }
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: countOrder,
                data: arrOrder
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCollaboratorV2(lang, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    },
                    {
                        end_date_work: {
                            $gte: iPage.start_date,
                        },
                    },
                    {
                        end_date_work: {
                            $lte: iPage.end_date,
                        },
                    },
                ],
            };
            if (iPage.type !== 'date_work') {
                query.$and[2] = {
                    date_create: {
                        $gte: iPage.start_date,
                    },
                };
                query.$and[3] = {
                    date_create: {
                        $lte: iPage.end_date,
                    },
                };
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const getCollaborator = await this.orderModel.aggregate([
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
                        _id: "$id_collaborator",
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
                    }
                },
                {
                    $lookup: LOOKUP_GROUP_ID_COLLABORATOR
                },
                {
                    $addFields: PERCENT_INCOME
                },
                {
                    $unwind: { path: '$id_collaborator' }
                },
                {
                    $project: {
                        'id_collaborator.password': 0, 'id_collaborator.salt': 0,
                    }
                },
                { $sort: { total_item: -1, _id: -1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);

            const count = await this.orderModel.aggregate([
                {
                    $match: query
                },

                {
                    $group: {
                        _id: "$id_collaborator",
                    }
                },
                { $count: 'total' },
            ]);

            const getTotal = await this.orderModel.aggregate([
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
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    }
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: getTotal,
                data: getCollaborator,
                totalItem: count.length > 0 ? count[0].total : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportDetailCustomerInviter(lang, idCustomer, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            let getUser = null;
            getUser = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getUser) {
                getUser = await this.collaboratorRepositoryService.findOneById(idCustomer);

            }
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "customer")], HttpStatus.BAD_REQUEST);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            const query = {
                $and: [
                    { id_inviter: getUser._id },
                    { is_delete: false },
                ]
            };
            const arrCustomer = [];
            const getArrInviter = await this.customerModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1, id_view: -1 })
                .select({
                    _id: 1, id_view: 1, full_name: 1, phone: 1, code_phone_area: 1, date_create: 1,
                    email: 1, name: 1, point: 1, birthday: 1, rank_point: 1, avatar: 1, rank: 1
                });
            const count = await this.customerModel.count(query);
            for (let item of getArrInviter) {
                let total_order = await this.orderModel.count({ is_delete: false, id_customer: item._id });
                let total_done_order = await this.orderModel.count({ is_delete: false, id_customer: item._id, status: 'done' });
                if (item.date_create < '2023-05-30T17:00:00.577Z' && item.total_price === 0) {
                    total_done_order = 1;
                    total_order = 1;
                }
                const customer = {
                    _id: item._id,
                    id_view: item.id_view,
                    full_name: item.full_name,
                    phone: item.phone,
                    code_phone_area: item.code_phone_area,
                    date_create: item.date_create,
                    email: item.email,
                    name: item.name,
                    point: item.point,
                    birthday: item.birthday,
                    rank_point: item.rank_point,
                    avatar: item.avatar,
                    rank: item.rank,
                    total_order: total_order,
                    total_done_order: total_done_order,
                    total_price: item.total_price
                };
                arrCustomer.push(customer);
            }
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrCustomer
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomerInviter(lang, iPage: iPageTopCustomerInviterDTOAdmin) {
        try {
            const customerInviter = await this.customerModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { date_create: { $gte: iPage.start_date } },
                            { date_create: { $lt: iPage.end_date } },
                            { id_inviter: { $ne: null } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "$id_inviter",
                        total: { $sum: 1 }
                    }
                },
                {
                    $sort: { date_create: -1, ordinal_number: -1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                }
            ]);

            const count = await this.customerModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { date_create: { $gte: iPage.start_date } },
                            { date_create: { $lt: iPage.end_date } },
                            { id_inviter: { $ne: null } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "$id_inviter",
                        total: { $sum: 1 }
                    }
                },
                {
                    $sort: { date_create: -1, ordinal_number: -1 }
                },
                { $count: "count" },
            ]);
            let arrCustomer = [];
            for (let item of customerInviter) {
                const getCustomer = await this.customerModel.findById(item._id)
                    .select({ _id: 1, id_view: 1, full_name: 1, phone: 1, code_phone_area: 1 });
                let collaborator = null;
                if (!getCustomer) {
                    collaborator = await this.collaboratorModel.findById(item._id)
                        .select({ _id: 1, id_view: 1, full_name: 1, phone: 1, code_phone_area: 1 });

                }
                arrCustomer.push({
                    _id: getCustomer ? getCustomer._id : collaborator._id,
                    id_view: getCustomer ? getCustomer.id_view : collaborator.id_view,
                    full_name: getCustomer ? getCustomer.full_name : collaborator.full_name,
                    phone: getCustomer ? getCustomer.phone : collaborator.phone,
                    code_phone_area: getCustomer ? getCustomer.code_phone_area : collaborator.code_phone_area,
                    totalInvite: item.total,
                    is_customer: getCustomer ? true : false,
                    rank: getCustomer ? getCustomer.rank : 'collaborator',
                });
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: (count.length > 0) ? count[0].count : 0,
                data: arrCustomer
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async topCustomerInviter(lang, iPage: iPageTopCustomerInviterDTOAdmin) {
        try {
            const topCustomer = await this.customerModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            // { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                            { date_create: { $gte: iPage.start_date } },
                            { date_create: { $lte: iPage.end_date } },
                            { id_inviter: { $ne: null } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "$id_inviter",
                        total: { $count: {} },
                    },
                },
                // {
                //     $lookup: {
                //         from: 'customers',
                //         foreignField: '_id',
                //         localField: '_id',
                //         as: 'customer'
                //     }
                // },
                // {$project: {
                //     'customer'
                // }},
                { $sort: { total: -1 } },
                { $limit: 10 }
            ]);
            let arrTopCustomer = [];
            for (let item of topCustomer) {
                const customer = await this.customerModel.findById(item._id)
                    .select({
                        full_name: 1, name: 1, phone: 1, code_phone_area: 1, _id: 1, id_view: 1,
                        rank_point: 1, date_create: 1,
                    });
                let collaborator = null;
                if (!customer) {
                    collaborator = await this.collaboratorModel.findById(item._id)
                        .select({
                            full_name: 1, name: 1, phone: 1, code_phone_area: 1, _id: 1, id_view: 1,
                            rank_point: 1, date_create: 1,
                        });
                }

                arrTopCustomer.push(
                    {
                        customer: customer ? customer.full_name : null,
                        total_inviter: item.total,
                        collaborator: collaborator ? collaborator.full_name : null,
                        _id: customer ? customer._id : collaborator._id
                    }
                );
            }
            return arrTopCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportGroupOrder(lang, iPage: iPageReportGroupOrderDTOAdmin) {
        try {
            const arrIdCustomer = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                            { status: "done" },
                        ]
                    }
                },
                {
                    $group: {
                        _id: {
                            id_customer: '$id_customer',
                        },
                        count: { $sum: 1 },
                    }
                }
            ]);

            let oldCustomer = [];
            let newCustomer = [];
            for (let item of arrIdCustomer) {
                const check = await this.orderModel.count({
                    id_customer: item._id.id_customer.toString(),
                    date_create: { $lt: iPage.start_date }
                });
                if (check > 0) {
                    oldCustomer.push(item._id.id_customer);
                } else {
                    newCustomer.push(item._id.id_customer);
                }
            }
            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date, $lt: iPage.end_date } },
                    { is_delete: false },
                    { status: "done" },
                    { id_customer: { $in: newCustomer } }
                ]
            };
            const getArrNew = await this.orderModel.find(query)
                .populate({ path: 'id_customer', select: { id_view: 1, _id: 1, full_name: 1, phone: 1, code_phone_area: 1, avatar: 1 } })
                .populate({ path: 'id_collaborator', select: { id_view: 1, _id: 1, full_name: 1, phone: 1, code_phone_area: 1, avatar: 1 } });
            const totalNewCustomer = await this.orderModel.count(query);

            query.$and[3].id_customer = { $in: oldCustomer };
            const totalOldCustomer = await this.orderModel.count(query);

            const getArrOld = await this.orderModel.find(query)
                .populate({ path: 'id_customer', select: { id_view: 1, _id: 1, full_name: 1, phone: 1, code_phone_area: 1, avatar: 1 } })
                .populate({ path: 'id_collaborator', select: { id_view: 1, _id: 1, full_name: 1, phone: 1, code_phone_area: 1, avatar: 1 } });

            const totalMoneyOld = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                            { status: "done" },
                            { id_customer: { $nin: newCustomer } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: {},
                        total: { $sum: "$final_fee" },
                    }
                }
            ]);

            const totalMoneyNew = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                            { status: "done" },
                            { id_customer: { $nin: oldCustomer } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: {},
                        total: { $sum: "$final_fee" },
                    }
                }
            ]);

            const result = {
                oldCustomer: {
                    totalItem: totalOldCustomer,
                    totalMoney: totalMoneyOld.length > 0 ? totalMoneyOld[0].total : 0,
                    data: getArrOld
                },
                newCustomer: {
                    start: iPage.start,
                    length: iPage.length,
                    totalItem: totalNewCustomer,
                    totalMoney: totalMoneyNew.length > 0 ? totalMoneyNew[0].total : 0,
                    data: getArrNew
                },
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomer(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const getTotal = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false },
                            // { date_work: { $gte: iPage.start_date, $lte: iPage.end_date } }
                            { date_work: { $gte: iPage.start_date } },
                            { date_work: { $lte: iPage.end_date } }
                        ]
                    }
                },
                { $addFields: { tempServiceFee: { $sum: { $sum: "$service_fee.fee" } } } },
                { $addFields: { tempDiscount: { $sum: { $add: [{ $sum: "$event_promotion.discount" }, { $cond: { if: { $ne: ["$code_promotion", null] }, then: "$code_promotion.discount", else: 0 } }] } } } },
                {
                    $group: {
                        _id: {},
                        total_order_fee: { $sum: "$final_fee" },
                        total_income: { $sum: { $subtract: ["$initial_fee", "$net_income_collaborator"] } },
                        total_service_fee: { $sum: { $sum: "$service_fee.fee" } },
                        total_collabotator_fee: { $sum: "$net_income_collaborator" },
                        total_gross_income: { $sum: "$initial_fee" },
                        total_item: { $count: {} },
                        total_discount: { $sum: "$tempDiscount" },
                        total_net_income: { $sum: { $subtract: [{ $subtract: ["$initial_fee", "$net_income_collaborator"] }, "$tempDiscount"] } },
                        total_net_income_business: { $sum: { $add: [{ $subtract: [{ $subtract: ["$initial_fee", "$net_income_collaborator"] }, "$tempDiscount"] }, "$tempServiceFee"] } }
                    }
                },
                // {
                //     $sort: { date_work: -1 }
                // }
            ]);
            const getCustomer = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false },
                            { date_work: { $gte: iPage.start_date } },
                            { date_work: { $lte: iPage.end_date } },

                            {
                                $or: [
                                    {
                                        phone_collaborator: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                    {
                                        name_collaborator: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                ]
                            },
                        ]
                    }
                },
                { $addFields: { tempServiceFee: { $sum: { $sum: "$service_fee.fee" } } } },
                { $addFields: { tempDiscount: { $sum: { $add: [{ $sum: "$event_promotion.discount" }, { $cond: { if: { $ne: ["$code_promotion", null] }, then: "$code_promotion.discount", else: 0 } }] } } } },
                { $addFields: { tempNetIncome: { $sum: { $subtract: [{ $subtract: ["$initial_fee", "$net_income_collaborator"] }, "$tempDiscount"] } } } },
                { $addFields: { tempBusiness: { $sum: { $add: ["$tempNetIncome", "$tempServiceFee"] } } } },
                { $addFields: { tempTotalIncome: { $sum: { $subtract: ["$initial_fee", "$net_income_collaborator"] } } } },
                {
                    $group: {
                        _id: "$id_customer",
                        id_view: { $first: "$id_view" },
                        code_customer: { $first: "$id_customer" },
                        full_name: { $first: "$name_customer" },
                        total_order: { $count: {} },
                        total_gross_income: { $sum: "$initial_fee" },
                        total_collabotator_fee: { $sum: "$net_income_collaborator" },
                        total_income: { $sum: "$tempTotalIncome" },
                        total_discount: { $sum: "$tempDiscount" },
                        total_net_income: { $sum: "$tempNetIncome" },
                        total_serviceFee: { $sum: "$tempServiceFee" },
                        total_order_fee: { $sum: "$final_fee" },
                        total_net_income_business: { $sum: "$tempBusiness" },
                        percent_income: { $first: 0 },
                    }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                { $sort: { date_work: -1 } }
            ]);

            const totalItem = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false },
                            { date_work: { $gte: iPage.start_date } },
                            { date_work: { $lte: iPage.end_date } },
                        ]
                    }
                },
                { $addFields: { tempServiceFee: { $sum: { $sum: "$service_fee.fee" } } } },
                { $addFields: { tempDiscount: { $sum: { $add: [{ $sum: "$event_promotion.discount" }, { $cond: { if: { $ne: ["$code_promotion", null] }, then: "$code_promotion.discount", else: 0 } }] } } } },
                { $addFields: { tempNetIncome: { $sum: { $subtract: [{ $subtract: ["$initial_fee", "$net_income_collaborator"] }, "$tempDiscount"] } } } },
                { $addFields: { tempBusiness: { $sum: { $add: ["$tempNetIncome", "$tempServiceFee"] } } } },
                { $addFields: { tempTotalIncome: { $sum: { $subtract: ["$initial_fee", "$net_income_collaborator"] } } } },
                {
                    $group: {
                        _id: "$id_customer",
                        id_view: { $first: "$id_view" },
                        code_customer: { $first: "$id_customer" },
                        full_name: { $first: "$name_customer" },
                        total_order: { $count: {} },
                        total_gross_income: { $sum: "$initial_fee" },
                        total_collabotator_fee: { $sum: "$net_income_collaborator" },
                        total_income: { $sum: "$tempTotalIncome" },
                        total_discount: { $sum: "$tempDiscount" },
                        total_net_income: { $sum: "$tempNetIncome" },
                        total_serviceFee: { $sum: "$tempServiceFee" },
                        total_order_fee: { $sum: "$final_fee" },
                        total_net_income_business: { $sum: "$tempBusiness" },
                        percent_income: { $first: 0 },
                    }
                },
                {
                    $count: "totalItem"
                },
                { $sort: { date_work: -1 } }
            ]);


            for (let item of getCustomer) {
                item.percent_income = ((item.total_net_income_business / item.total_income) * 100).toFixed(2);
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                total: getTotal.length > 0 ? getTotal[0] : 0,
                totalItem: totalItem.length > 0 ? totalItem[0].totalItem : 0,
                data: getCustomer
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomerV2(lang, iPage: iPageReportCustomerDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    },
                    {
                        end_date_work: {
                            $gte: iPage.start_date,
                        },
                    },
                    {
                        end_date_work: {
                            $lte: iPage.end_date,
                        },
                    },
                ],
            };
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getTotal = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT,
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
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);

            const getCustomer = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                is_delete: false,
                            },
                            {
                                status: "done",
                            },
                            {
                                end_date_work: {
                                    $gte: iPage.start_date,
                                },
                            },
                            {
                                end_date_work: {
                                    $lte: iPage.end_date,
                                },
                            },
                        ],
                    },
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: "$id_customer",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
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
                { $sort: { total_item: iPage.valueSort === '1' ? 1 : -1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);

            const count = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                is_delete: false,
                            },
                            {
                                status: "done",
                            },
                            {
                                end_date_work: {
                                    $gte: iPage.start_date,
                                },
                            },
                            {
                                end_date_work: {
                                    $lte: iPage.end_date,
                                },
                            },
                        ],
                    },
                },
                {
                    $group: {
                        _id: "$id_customer",
                    }
                },
                { $count: 'total' }
            ]);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: getTotal,
                data: getCustomer,
                totalItem: count.length > 0 ? count[0].total : 0
            };
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomerInviterForTime(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            if (iPage.type === 'daily') {
                return this.reportCustomerInviterDaily(lang, iPage);
            } else if (iPage.type === 'year') {
                const result = eachMonthOfInterval({
                    start: new Date(iPage.start_date),
                    end: new Date(iPage.end_date)
                });
                let specialDay = subMinutes(addDays(result[result.length - 1], 1), 1).toISOString();
                let arrDayly = [];
                for (let i = 0; i < result.length; i++) {
                    const payload = {
                        start_date: new Date(result[i]).toISOString(),
                        end_date: result.length - 1 === i ? specialDay : subMinutes(new Date(result[i + 1]), 1).toISOString(),
                    };
                    console.log('>>>> ', payload);

                    const total = await this.totalCustomer('vi', payload);
                    let item = {
                        day: result[i],
                        total: total.totalCustomer
                    };
                    arrDayly.push(item);
                }
                return arrDayly;
            }

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async reportCustomerInviterDaily(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const result = eachDayOfInterval({
                start: new Date(iPage.start_date),
                end: new Date(iPage.end_date)
            });
            let arrDayly = [];
            let specialDay = subMinutes(addDays(result[result.length - 1], 1), 1).toISOString();
            for (let i = 0; i < result.length; i++) {
                const payload = {
                    start_date: new Date(result[i]).toISOString(),
                    end_date: result.length - 1 === i ? specialDay : subMinutes(new Date(result[i + 1]), 1).toISOString(),
                };
                const total = await this.totalCustomer('vi', payload);
                let item = {
                    day: result[i],
                    total: total.totalCustomer
                };
                arrDayly.push(item);
            }
            return arrDayly;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalCustomer(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const query = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { id_inviter: { $ne: null } }
                ]
            };
            const getCustomer = await this.customerModel.count(query);
            return { totalCustomer: getCustomer };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async conversionRateNewCustomer(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const queryNewCustomer = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { is_delete: false },
                    { is_active: true }
                ]
            };
            const totalNewCustomer = await this.customerModel.count(queryNewCustomer);
            const getNewCustomer = await this.customerModel.find(queryNewCustomer).select({ _id: 1 });
            const arr = [];
            for (let item of getNewCustomer) {
                arr.push(item._id.toString());
            }
            // console.log(arr);
            // const find = await this.groupOrderModel.find({
            //     date_create: { $gte: iPage.start_date }, id_customer: { $in: arr }
            // }, { $op})
            // console.log(find);
            const totalOrderNewCustomer = await this.groupOrderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { date_create: { $gte: iPage.start_date } },
                            { id_customer: { $in: arr } }
                        ]
                    }
                },
                // {
                //     $group: {
                //         _id: "$id_customer",
                //         // total1: { $count: {} }
                //         // code_customer: { $first: "$id_customer" }
                //     }
                // },
                // {
                //     $match: {
                //         $and: [
                //             { code_customer: { $in: getNewCustomer } }
                //         ]
                //     }
                // },
                // {
                //     $count: "total"
                // }
            ]);

            console.log('>>> ', totalOrderNewCustomer);

            // return find;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async reportReview(lang, iPage: iPageReportReviewDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    // { date_create: { $gte: iPage.start_date } },
                    // { date_create: { $lte: iPage.end_date } },
                    { date_create_review: { $ne: null } },
                    { date_create_review: { $gte: iPage.start_date } },
                    { date_create_review: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { star: { $gt: 0 } },
                    // {
                    //     $or: [
                    //         {
                    //             phone_collaborator: {
                    //                 $regex: iPage.search,
                    //                 $options: "i"
                    //             }
                    //         },
                    //         {
                    //             name_collaborator: {
                    //                 $regex: iPage.search,
                    //                 $options: "i"
                    //             }
                    //         },
                    //         {
                    //             phone_customer: {
                    //                 $regex: iPage.search,
                    //                 $options: "i"
                    //             }
                    //         },
                    //         {
                    //             name_customer: {
                    //                 $regex: iPage.search,
                    //                 $options: "i"
                    //             }
                    //         },
                    //         {
                    //             short_review: {
                    //                 $regex: iPage.search,
                    //                 $options: "i"
                    //             }
                    //         },
                    //     ]
                    // },
                    { is_system_review: false }
                ]
            };
            if (Number(iPage.star) !== 0) {
                query.$and[3].star = Number(iPage.star);
            }
            if (iPage.type === "is_check") {
                query.$and.push({
                    is_check_admin: true
                });
            }
            if (iPage.type === "is_not_check") {
                query.$and.push({
                    is_check_admin: false
                });
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các đánh giá đơn hàng của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            const count = await this.orderModel.count(query);
            const getReview = await this.orderModel.find(query)
                .sort({ date_create_review: -1, _id: 1 })
                .skip(Number(iPage.start))
                .limit(Number(iPage.length))
                .populate(POP_CUSTOMER_INFO)
                .populate(POP_COLLABORATOR_INFO)
                .populate(POP_SERVICE_TITLE)
                .populate(POP_USER_SYSTEM("id_user_system_handle_review"))
                .populate(POP_USER_SYSTEM("history_user_system_handle_review.id_user_system_handle_review"))
                .select({ _id: 1, review: 1, short_review: 1, date_create_review: 1, star: 1, id_view: 1, id_group_order: 1, is_check_admin: 1, note_admin: 1,
                    id_service: 1, status_handle_review: 1, history_user_system_handle_review: 1, id_user_system_handle_review: 1
                 });
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getReview
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTypeService(lang, iPage: iPageReportTypeServiceDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { status: "done" },
                    { city: iPage.city }
                ]
            };
            if (Number(iPage.district) !== Number(-1)) {
                query.$and.push({ district: iPage.district });
            }
            const totalOrder = await this.orderModel.count(query);
            query.$and.push({ total_estimate: 2 });
            const getCountOrder2Hour = await this.orderModel.count(query);
            query.$and[Number(iPage.district) !== -1 ? 6 : 5].total_estimate = Number(3);
            const getCountOrder3Hour = await this.orderModel.count(query);
            query.$and[Number(iPage.district) !== -1 ? 6 : 5].total_estimate = Number(4);
            const getCountOrder4Hour = await this.orderModel.count(query);
            const percent2Hours = ((getCountOrder2Hour / totalOrder) * 100).toFixed(2);
            const percent3Hours = ((getCountOrder3Hour / totalOrder) * 100).toFixed(2);
            const percent4Hours = (100 - Number(percent2Hours) - Number(percent3Hours)).toFixed(2);
            const arrPercent = [
                { name: "2_hour", value: Number(percent2Hours) },
                { name: "3_hour", value: Number(percent3Hours) },
                { name: "4_hour", value: Number(percent4Hours) },
            ];
            const result = {
                total_order: totalOrder,
                total_order_2_hours: getCountOrder2Hour,
                total_order_3_hours: getCountOrder3Hour,
                total_order_4_hours: getCountOrder4Hour,
                percent: arrPercent
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCancelOrder(lang, iPage: iPageReportCancelOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { status: 'cancel' },
                    { city: iPage.city },
                ]
            };
            if (Number(iPage.district) !== -1) {
                query.$and.push({ district: iPage.district });
            }
            const totalOrderCancel = await this.orderModel.count(query);
            query.$and.push({ id_cancel_customer: { $ne: null } });
            const totalCustomerCancel = await this.orderModel.count(query);
            query.$and[query.$and.length - 1] = { id_cancel_user_system: { $ne: null } };
            const totalUserSystemCancel = await this.orderModel.count(query);
            query.$and[query.$and.length - 1] = { id_cancel_system: { $ne: null } };
            const totalSystemCancel = await this.orderModel.count(query);

            const percentSystem = Number((totalSystemCancel / totalOrderCancel) * 100).toFixed(2);
            const percentCustomer = Number((totalCustomerCancel / totalOrderCancel) * 100).toFixed(2);
            const percentAdmin = Number(100 - Number(percentSystem) - Number(percentCustomer)).toFixed(2);

            const arrPercent = [
                { name: 'system_cancel', value: Number(percentSystem) },
                { name: 'customer_cancel', value: Number(percentCustomer) },
                { name: 'user_system_cancel', value: Number(percentAdmin) }
            ];
            const result = {
                total_cancel_order: totalOrderCancel,
                total_cancel_order_by_system: totalSystemCancel,
                total_cancel_order_by_customer: totalCustomerCancel,
                total_cancel_order_by_user_system: totalUserSystemCancel,
                percent: arrPercent
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomerCancelOrder(lang, iPage: iPageReportCancelOrderDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { status: 'cancel' },
                    { city: Number(iPage.city) },
                    { id_cancel_customer: { $ne: null } },
                    { is_delete: false },
                ]
            };
            if (Number(iPage.district) !== -1) {
                query.$and.push({ district: iPage.district });
            }
            const totalOrderCancel = await this.orderModel.count(query);
            const getTotal = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$id_cancel_customer.id_reason_cancel",
                        total: { $sum: 1 },
                    }
                },
                {
                    $addFields: { tempId: { $toObjectId: "$_id" } }
                },
                {
                    $lookup: {
                        from: 'reasoncancels',
                        localField: 'tempId',
                        foreignField: '_id',
                        as: 'reason_cancel',
                    },
                },
                {
                    $project: {
                        tempId: 0,
                        reason_cancel: {
                            punish_type: 0,
                            punish: 0,
                            date_create: 0,
                            is_delete: 0,
                            is_active: 0,
                            __v: 0
                        }
                    }
                }
            ]);
            const arrPercent = [];
            for (let item of getTotal) {
                const percent = ((item.total / totalOrderCancel) * 100).toFixed(2);
                const i = {
                    name: item.reason_cancel.length > 0 ? item.reason_cancel[0].title : '',
                    value: Number(percent)
                };
                arrPercent.push(i);
            }
            const result = {
                total: getTotal.length > 0 ? getTotal : 0,
                total_cancel_order_by_customer: totalOrderCancel,
                arrPercent: arrPercent
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportOverviewCancelOrder(lang, iPage: iPageReportCancelOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    { status: 'cancel' },
                    { is_delete: false },
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    {
                        $or: [
                            {
                                phone_customer: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                name_customer: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                id_view: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                        ]
                    }
                ]
            };
            if (iPage.type === "customer") {
                query.$and.push({ id_cancel_customer: { $ne: null } });
            }
            if (iPage.type === "system") {
                query.$and.push({ id_cancel_system: { $ne: null } });
            }
            if (iPage.type === "usersystem") {
                query.$and.push({ id_cancel_user_system: { $ne: null } });
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const count = await this.orderModel.count(query);
            const getCancelOrder = await this.orderModel.find(query)
                .sort({ 'id_cancel_customer.date_create': -1, 'id_cancel_user_system.date_create': -1, 'id_cancel_system.date_create': -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({
                    path: 'id_cancel_customer', populate: {
                        path: 'id_reason_cancel', select: { title: 1 }
                    }
                })
                .populate({
                    path: 'id_cancel_user_system', populate: {
                        path: 'id_reason_cancel', select: { title: 1 }
                    },
                })
                .populate({
                    path: 'id_cancel_user_system', populate: {
                        path: 'id_user_system', select: { full_name: 1, name: 1, }
                    },
                })
                .populate({
                    path: 'id_cancel_system', populate: {
                        path: 'id_reason_cancel', select: { title: 1 }
                    }
                })
                .select({ id_view: 1, address: 1, name_customer: 1, phone_customer: 1, date_create: 1 });
            query.$and.splice(query.$and.length - 2, 1);
            const getTotalOrder = await this.orderModel.count(query);
            const percent = Number((count / getTotalOrder) * 100).toFixed(2);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count,
                data: getCancelOrder,
                total: {
                    total_order_cancel: count,
                    total_order: getTotalOrder,
                    percent: Number(percent),
                }
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTotalCollaboratorBalance(lang, iPage: iPageReportCancelOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            let queryCollaborator: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { is_verify: true }
                ]
            };
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     queryCollaborator.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getTotalRemainderCollaborator = await this.collaboratorModel.aggregate([
                {
                    $match: queryCollaborator
                },
                {
                    $group: {
                        _id: {},
                        total_remainder: { $sum: "$remainder" },
                        total_gift_remainder: { $sum: "$gift_remainder" },
                    }
                }
            ]);
            let queryTransfer: any = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { is_verify_money: true }
                ]
            };
            // if (admin.id_role_admin["is_area_manager"]) {
            //     queryTransfer.$and.push({ 'id_collaborator.city': { $in: checkPermisstion.city } })
            // }
            const getTotalTopUp = await this.transitionCollaboratorModel.aggregate([
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                { $unwind: { path: '$id_collaborator' } },
                {
                    $match: queryTransfer
                },
                {
                    $group: {
                        _id: '$type_transfer',
                        total: { $sum: "$money" }
                    }
                }
            ]);
            const result = {
                total_remainder: getTotalRemainderCollaborator.length > 0 ? getTotalRemainderCollaborator[0].total_remainder : 0,
                total_gift_remainder: getTotalRemainderCollaborator.length > 0 ? getTotalRemainderCollaborator[0].total_gift_remainder : 0,
                total_top_up: getTotalTopUp.length > 0 ? getTotalTopUp[0].total : 0,
                total_withdraw: getTotalTopUp.length > 1 ? getTotalTopUp[1].total : 0,
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTransitionCollaboratorForTime(lang, iPage: iPageReportCancelOrderDTOAdmin, admin: UserSystemDocument) {

        try {

            let queryGetTotal: any = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { is_verify_money: true },
                    {
                        $or: [
                            {
                                $and: [
                                    { date_created: { $gte: iPage.start_date } },
                                    { date_created: { $lte: iPage.end_date } },
                                ]
                            },
                            {
                                $and: [
                                    { date_create: { $gte: iPage.start_date } },
                                    { date_create: { $lte: iPage.end_date } },
                                ]
                            }
                        ]
                    }
                ]
            };
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     queryGetTotal.$and.push({ 'id_collaborator.city': { $in: checkPermisstion.city } })
            // }
            const getTotal = await this.transitionCollaboratorModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                {
                    $match: queryGetTotal
                },
                {
                    $group: {
                        _id: "$type_transfer",
                        total: { $sum: "$money" }
                    }
                }
            ]);
            const getTransition = await this.transitionCollaboratorModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: queryGetTotal },
                { $lookup: LOOKUP_ADMIN_VERIFY },
                { $unwind: { path: '$id_admin_verify' } },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) },
                { $project: PROJECT_ADMIN_VERIFY }
            ]);

            const count = await this.transitionCollaboratorModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: queryGetTotal },
                { $count: 'total' },
            ]);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getTransition,
                total_top_up: getTotal.length > 0 ? getTotal[0].total : 0,
                total_withdraw: getTotal.length > 1 ? getTotal[1].total : 0,
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTotalCustomerBalance(lang, iPage: iPageReportCancelOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                ]
            };

            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getTotalPayPointCustomer = await this.customerModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: {},
                        total_pay_point: { $sum: "$pay_point" },
                    }
                }
            ]);

            const getTotalTopUp = await this.transitionCustomerModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { status: 'done' },
                            { date_create: { $gte: iPage.start_date } },
                            { date_create: { $lte: iPage.end_date } },
                            { is_verify_money: true },
                            { type_transfer: 'top_up' }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "",
                        total: { $sum: "$money" },
                        total_payment_discount: { $sum: "$payment_discount" },
                    }
                }
            ]);

            const getTotalTopUpVnpay = await this.transitionCustomerModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { status: 'done' },
                            { date_create: { $gte: iPage.start_date } },
                            { date_create: { $lte: iPage.end_date } },
                            { method_transfer: 'vnpay' },
                        ]
                    }
                },
                {
                    $group: {
                        _id: "",
                        total: { $sum: "$money" },
                    }
                }
            ]);

            const getTotalCustomerUsePoint = await this.groupOrderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { status: 'done' },
                            { date_create: { $gte: iPage.start_date } },
                            { date_create: { $lte: iPage.end_date } },
                            { payment_method: 'point' }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "",
                        total: { $sum: "$final_fee" }
                    }
                }
            ]);

            const result = {
                total_pay_point: getTotalPayPointCustomer.length > 0 ? getTotalPayPointCustomer[0].total_pay_point : 0,
                total_top_up: getTotalTopUp.length > 0 ? getTotalTopUp[0].total : 0,
                total_payment_discount: getTotalTopUp.length > 0 ? getTotalTopUp[0].total_payment_discount : 0,
                total_use_point: getTotalCustomerUsePoint.length > 0 ? getTotalCustomerUsePoint[0].total : 0,
                total_vnpay: getTotalTopUpVnpay.length > 0 ? getTotalTopUpVnpay[0].total : 0,
            };

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportConnectionRateCustomer(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const queryCustomer = {
                $and: [
                    { is_delete: false },
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } }
                ]
            };


            // const getCustomer = await this.customerModel.find(queryCustomer).select({ _id: 1 });
            // const countCustomer = await this.customerModel.count(queryCustomer);
            // const arrId = [];
            // for (let item of getCustomer) {
            //     arrId.push(item._id);
            // }
            // const queryGroupOrder = {
            //     $and: [
            //         { is_delete: false },
            //         // { date_create: { $gte: iPage.start_date } },
            //         // { date_create: { $lte: iPage.end_date } },
            //         { id_cancel_customer: null },
            //         { id_cancel_user_system: null },
            //         { id_customer: { $in: arrId } }
            //     ]
            // }
            // const getGroupOrder = await this.groupOrderModel.find(queryGroupOrder)
            //     .sort({ date_create: -1 })
            //     .skip(iPage.start)
            //     .limit(iPage.length)
            //     .populate({
            //         path: 'id_customer', select: {
            //             _id: 1, id_view: 1, full_name: 1, code_phone_area: 1, phone: 1,
            //             rank: 1, rank_point: 1
            //         }
            //     });
            // const countGroupOrder = await this.groupOrderModel.count(queryGroupOrder);
            // const percent = ((countGroupOrder / countCustomer) * 100).toFixed(2);
            // const result = {
            //     start: iPage.start,
            //     length: iPage.length,
            //     percent: Number(percent),
            //     total: {
            //         total_customer: countCustomer,
            //         total_group_order: countGroupOrder
            //     },
            //     data: getGroupOrder
            // }
            // return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    //  Updated upstream
    async reportCustomerByCity(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const tempArr = AministrativeDivision.filter(item => {
                return item.code === 79;
            });
            console.log('AD ', AministrativeDivision);

            const query = {
                $and: [
                    { is_delete: false },
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } }
                ]
            };
            const getTotal = await this.customerModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$city",
                        total: {
                            $sum: 1,
                        },
                    },
                },
            ]);
            return tempArr;
            return getTotal;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportConnecting(lang, iPage: iPageReportConnecting) {
        try {
            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { status: { $nin: ['cancel', 'pending'] } }
                ]
            };

            let query2: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { id_cancel_customer: null },
                    { id_cancel_user_system: null },
                    {
                        $or: [
                            {
                                $and: [
                                    { id_cancel_system: { $ne: null } },
                                    { id_cancel_collaborator: { $gt: { $size: 0 } } }
                                    // { id_cancel_collaborator: { $size: 0 } }
                                ]
                            },
                            {
                                $and: [
                                    { id_cancel_system: null },
                                ]
                            }
                        ]
                    },
                    {
                        $or: [
                            { id_cancel_collaborator: { $size: 0 } },
                            { id_cancel_collaborator: { $gt: { $size: 0 } } }
                        ]
                    }
                ]
            };

            const num = [iPage.district];
            const digits = num.toString().split(",");
            const realDigits = digits.map(Number);

            if (iPage.district.length > 0) {
                query.$and.push({ district: { $in: realDigits } });
                query2.$and.push({ district: { $in: realDigits } });
            }

            if (iPage.city !== 0) {
                query.$and.push({ city: iPage.city });
                query2.$and.push({ city: iPage.city });
            }

            // if (iPage.district.length > 0){
            //     console.log(iPage.district)
            //     query.$and.push({district: iPage.district})
            //     query2.$and.push({district: iPage.district})                            
            // }
            // const getOrder = await this.groupOrderModel.find(query)
            const totalOrderConnect = await this.groupOrderModel.count(query);

            // const getTotal1 = await this.groupOrderModel.find(query2)
            const totalAll = await this.groupOrderModel.count(query2);
            const percent = Number(((totalOrderConnect / totalAll) * 100).toFixed(2));

            const result = {
                totalOrderConnect: totalOrderConnect,
                totalAll: totalAll,
                percent: percent,
                // data1: getOrder,
                // data2: getTotal1
            };
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    //////////////////////////////////////////////////
    async reportCustomerByCityV2(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } }
                ]
            };
            const getTotal = await this.customerModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$city",
                        total: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: { _id: -1 }
                }
            ]);
            const count = await this.customerModel.count(query);

            const arrItem = [];
            for (let item of getTotal) {
                const tempNameCity = AministrativeDivision.filter(division => division.code === item._id);
                const temp = {
                    _id: item._id,
                    city: tempNameCity.length > 0 ? tempNameCity[0].name : 'Khác',
                    total: item.total,
                    percent: Number((item.total / count * 100).toFixed(2))
                };
                arrItem.push(temp);
            }
            const result = {
                total: count,
                data: arrItem
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    /////////////////////////////////////////// thiếu 1 cái báo cáo chi tiết khàng theo từng khu vực ////////////////////////////////////////////////////
    async reportCustomerOldNew(lang, iPage: iPageReportCustomerDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { end_date_work: { $gte: iPage.start_date } },
                    { end_date_work: { $lte: iPage.end_date } },
                    { status: 'done' },
                    { is_delete: false },
                ]
            };
            if (iPage.type === 'old') {
                query.$and.push({ 'id_customer.date_create': { $lte: iPage.start_date } });
            }
            if (iPage.type === 'new') {
                query.$and.push({ 'id_customer.date_create': { $gte: iPage.start_date } });
                query.$and.push({ 'id_customer.date_create': { $lte: iPage.end_date } });
            }
            if (iPage.type_date !== 'all') {
                query.$and[0] = {
                    date_create: {
                        $gte: iPage.start_date,
                    },
                };
                query.$and[1] = {
                    date_create: {
                        $lte: iPage.end_date,
                    },
                };
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getCustomerTotal = await this.orderModel.aggregate([
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

            const getCustomer = await this.orderModel.aggregate([
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

            const totalCustomer = await this.orderModel.aggregate([
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

            const count = await this.orderModel.aggregate([
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
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    /////////////////////////////
    async reportCustomerOldCustomerNewOrder(lang, iPage: iPageReportCustomerDTOAdmin) {
        try {
            const queryCustomer = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { date_create: { $lte: iPage.start_date } },
                ]
            };
            const getId = await this.orderModel.aggregate([
                {
                    $match: queryCustomer
                },
                {
                    $group: {
                        _id: '$id_customer',
                    }
                }
            ]);
            const tempId = [];
            for (let item of getId) {
                tempId.push(item._id.toString());
            }
            const getIdCustomer = await this.customerModel.find({
                $and: [
                    { is_delete: false },
                    { _id: { $nin: tempId } }
                ]
            }).select({ _id: 1, });
            const arrIdCustomer = [];
            for (let item of getIdCustomer) {
                arrIdCustomer.push(item._id);
            }
            let query: any = {
                $and: [
                    { end_date_work: { $gte: iPage.start_date } },
                    { end_date_work: { $lte: iPage.end_date } },
                    { status: 'done' },
                    { is_delete: false },
                    { 'id_customer._id': { $in: arrIdCustomer } },
                    { 'id_customer.date_create': { $lte: iPage.start_date } }
                ]
            };
            const getCustomerTotal = await this.orderModel.aggregate([
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer",
                    },
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $addFields: {
                        tempServiceFee: {
                            $sum: {
                                $sum: "$service_fee.fee",
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        tempDiscount: {
                            $sum: {
                                $add: [
                                    {
                                        $sum: "$event_promotion.discount",
                                    },
                                    {
                                        $cond: {
                                            if: {
                                                $ne: ["$code_promotion", null],
                                            },
                                            then: "$code_promotion.discount",
                                            else: 0,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: {},
                        total_order_fee: {
                            $sum: "$final_fee",
                        },
                        total_income: {
                            $sum: {
                                $subtract: [
                                    "$initial_fee",
                                    "$net_income_collaborator",
                                ],
                            },
                        },
                        total_service_fee: {
                            $sum: {
                                $sum: "$service_fee.fee",
                            },
                        },
                        total_collabotator_fee: {
                            $sum: "$net_income_collaborator",
                        },
                        total_gross_income: {
                            $sum: "$initial_fee",
                        },
                        total_item: {
                            $sum: 1,
                        },
                        total_discount: {
                            $sum: "$tempDiscount",
                        },
                        total_net_income: {
                            $sum: {
                                $subtract: [
                                    {
                                        $subtract: [
                                            "$initial_fee",
                                            "$net_income_collaborator",
                                        ],
                                    },
                                    "$tempDiscount",
                                ],
                            },
                        },
                        total_net_income_business: {
                            $sum: {
                                $add: [
                                    {
                                        $subtract: [
                                            {
                                                $subtract: [
                                                    "$initial_fee",
                                                    "$net_income_collaborator",
                                                ],
                                            },
                                            "$tempDiscount",
                                        ],
                                    },
                                    "$tempServiceFee",
                                ],
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        percent_income: { $round: [{ $multiply: [{ $divide: ['$total_net_income_business', "$total_income"] }, 100] }, 2] }
                    }
                },
            ]);

            const getCustomer = await this.orderModel.aggregate([
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer",
                    },
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $addFields: {
                        tempServiceFee: {
                            $sum: {
                                $sum: "$service_fee.fee",
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        tempDiscount: {
                            $sum: {
                                $add: [
                                    {
                                        $sum: "$event_promotion.discount",
                                    },
                                    {
                                        $cond: {
                                            if: {
                                                $ne: ["$code_promotion", null],
                                            },
                                            then: "$code_promotion.discount",
                                            else: 0,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: '$id_customer._id',
                        total_order_fee: {
                            $sum: "$final_fee",
                        },
                        total_income: {
                            $sum: {
                                $subtract: [
                                    "$initial_fee",
                                    "$net_income_collaborator",
                                ],
                            },
                        },
                        total_service_fee: {
                            $sum: {
                                $sum: "$service_fee.fee",
                            },
                        },
                        total_collabotator_fee: {
                            $sum: "$net_income_collaborator",
                        },
                        total_gross_income: {
                            $sum: "$initial_fee",
                        },
                        total_item: {
                            $sum: 1,
                        },
                        total_discount: {
                            $sum: "$tempDiscount",
                        },
                        total_net_income: {
                            $sum: {
                                $subtract: [
                                    {
                                        $subtract: [
                                            "$initial_fee",
                                            "$net_income_collaborator",
                                        ],
                                    },
                                    "$tempDiscount",
                                ],
                            },
                        },
                        total_net_income_business: {
                            $sum: {
                                $add: [
                                    {
                                        $subtract: [
                                            {
                                                $subtract: [
                                                    "$initial_fee",
                                                    "$net_income_collaborator",
                                                ],
                                            },
                                            "$tempDiscount",
                                        ],
                                    },
                                    "$tempServiceFee",
                                ],
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        percent_income: { $round: [{ $multiply: [{ $divide: ['$total_net_income_business', "$total_income"] }, 100] }, 2] }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "id_customer",
                    },
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $sort: { end_date_work: -1, _id: 1 }
                },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);

            const count = await this.orderModel.aggregate([
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer",
                    },
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $addFields: {
                        tempServiceFee: {
                            $sum: {
                                $sum: "$service_fee.fee",
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        tempDiscount: {
                            $sum: {
                                $add: [
                                    {
                                        $sum: "$event_promotion.discount",
                                    },
                                    {
                                        $cond: {
                                            if: {
                                                $ne: ["$code_promotion", null],
                                            },
                                            then: "$code_promotion.discount",
                                            else: 0,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: '$id_customer._id',
                        total_order_fee: {
                            $sum: "$final_fee",
                        },
                        total_income: {
                            $sum: {
                                $subtract: [
                                    "$initial_fee",
                                    "$net_income_collaborator",
                                ],
                            },
                        },
                        total_service_fee: {
                            $sum: {
                                $sum: "$service_fee.fee",
                            },
                        },
                        total_collabotator_fee: {
                            $sum: "$net_income_collaborator",
                        },
                        total_gross_income: {
                            $sum: "$initial_fee",
                        },
                        total_item: {
                            $sum: 1,
                        },
                        total_discount: {
                            $sum: "$tempDiscount",
                        },
                        total_net_income: {
                            $sum: {
                                $subtract: [
                                    {
                                        $subtract: [
                                            "$initial_fee",
                                            "$net_income_collaborator",
                                        ],
                                    },
                                    "$tempDiscount",
                                ],
                            },
                        },
                        total_net_income_business: {
                            $sum: {
                                $add: [
                                    {
                                        $subtract: [
                                            {
                                                $subtract: [
                                                    "$initial_fee",
                                                    "$net_income_collaborator",
                                                ],
                                            },
                                            "$tempDiscount",
                                        ],
                                    },
                                    "$tempServiceFee",
                                ],
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        percent_income: { $round: [{ $multiply: [{ $divide: ['$total_net_income_business', "$total_income"] }, 100] }, 2] }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "id_customer",
                    },
                },
                {
                    $unwind: { path: "$id_customer" },
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
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    ///////////////////////////////////////////
    async reportOrderDayly(lang, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            const tempStatus =  iPage.status.split(',');
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: {$in: tempStatus}
                    }
                ],
            };
            if (iPage.type !== 'date_work') {
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
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }

            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const getDataOrder = await this.orderModel.aggregate([
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
                    $addFields: (iPage.type === 'date_create') ? TEMP_DATE_CREATE : TEMP_DATE_WORK
                },
                // {
                //     $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                // },
                // {
                //     $addFields: TEMP_TRANSACTION_PUNISH
                // },
                {
                    $lookup: LOOKUP_PUNISH_TICKET_DONE
                },
                {
                    $addFields: TEMP_PUNISH_TICKET
                },
                {
                    $group: {
                        _id: ID_ORDER_DAILY,
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        total_hour: TOTAL_HOUR,
                        sort_date_create: SORT_DATE_CREATE,
                        sort_date_work: SORT_DATE_WORK,
                        punish: TOTAL_PUNISH,
                        //
                        total_fee: { $sum: "$total_fee"},
                        total_net_income_new: { $sum: "$net_income"},
                        total_discount_new: {$sum: "$total_discount"},
                        total_tax: {$sum: "$value_added_tax"}, // Thuế
                        id_group_order: { $push: '$id_group_order' }
                        
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
                // Doanh thu
                {
                    $addFields: {
                        revenue: { $subtract: ["$total_fee","$total_net_income_new"]}
                    }
                },
                // Doanh thu thuan
                {
                $addFields: {
                    net_revenue: { $subtract: ["$revenue","$total_discount_new"]}
                    }
                },
                 // Tong hoa don
                 {
                    $addFields: {
                        invoice: { $subtract: ["$total_fee","$total_discount"]}
                    }
                },
                // Lợi nhuận sau thuế
                {
                    $addFields: {
                        profit_after_tax: { $subtract: ["$net_revenue","$total_tax"]}
                    }
                },
                // % Lợi nhuận
                {
                    $addFields: PERCENT_INCOME_ENVENUE
                },
                // { $sort: iPage.type === 'date_create' ? { sort_date_create: -1 } : { sort_date_work: -1 } },
                { $sort: (iPage.typeSort === "date_work") ? { sort_date_work: (iPage.valueSort === 1) ? 1 : -1 } : { sort_date_create: (iPage.valueSort === 1) ? 1 : -1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);

            const count = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: (iPage.type === 'date_create') ? TEMP_DATE_CREATE : TEMP_DATE_WORK
                },
                {
                    $group: {
                        _id: { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } },
                    }
                },
                { $count: 'total' },
            ]);

            const getTotal = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                // {
                //     $lookup: LOOKUP_PUNISH
                // },
                // {
                //     $addFields: TEMP_PUNISH
                // },
                // {
                //     $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                // },
                // {
                //     $addFields: TEMP_TRANSACTION_PUNISH
                // },
                {
                    $lookup: LOOKUP_PUNISH_TICKET_DONE
                },
                {
                    $addFields: TEMP_PUNISH_TICKET
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
                        punish: TOTAL_PUNISH,
                        //
                        total_fee: { $sum: "$total_fee"},
                        total_net_income_new: { $sum: "$net_income"},
                        total_discount_new: {$sum: "$total_discount"},
                        total_tax: {$sum: "$value_added_tax"}, // Thuế
                    }
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: getTotal,
                data: getDataOrder,
                totalItem: count.length > 0 ? count[0].total : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportOrderCity(lang, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        $or: [
                            {status: "confirm"},
                            {status: "done"},
                            {status: "doing"}
                        ]
                    }
                ],
            };


            if (iPage.type !== 'date_work') {
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


            if (iPage.city !== 0) {
                query.$and.push({ city: iPage.city });
            }

            const getCollaborator = await this.orderModel.aggregate([
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
                        _id: "$city",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
                { $sort: { _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);
            if (iPage.city !== 0) {
                query.$and.pop();
            }
            const count = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                is_delete: false,
                            },
                            {
                                status: "done",
                            },
                            {
                                end_date_work: {
                                    $gte: iPage.start_date,
                                },
                            },
                            {
                                end_date_work: {
                                    $lte: iPage.end_date,
                                },
                            },
                        ],
                    },
                },
                {
                    $group: {
                        _id: "$city",
                    }
                },
                { $count: 'total' },
            ]);
            const getTotal = await this.orderModel.aggregate([
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
            let arrItem = [];
            for (let item of getCollaborator) {
                const tempNameCity = AministrativeDivision.filter(division => division.code === item._id);
                const temp = {
                    _id: item._id,
                    city: tempNameCity.length > 0 ? tempNameCity[0].name : 'Khác',
                    total_order_fee: item.total_order_fee,
                    total_income: item.total_income,
                    total_service_fee: item.total_service_fee,
                    total_collabotator_fee: item.total_collabotator_fee,
                    total_gross_income: item.total_gross_income,
                    total_item: item.total_item,
                    total_discount: item.total_discount,
                    total_net_income: item.total_net_income,
                    total_net_income_business: item.total_net_income_business,
                    percent_income: item.percent_income
                };
                arrItem.push(temp);
            }
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: getTotal,
                data: arrItem,
                totalItem: count.length > 0 ? count[0].total : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportPercentOrderCity(lang, iPage: iPageHistoryOrderDTOCollaborator) {
        try {
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    },
                    {
                        end_date_work: {
                            $gte: iPage.start_date,
                        },
                    },
                    {
                        end_date_work: {
                            $lte: iPage.end_date,
                        },
                    },
                ],
            };
            const totalOrder = await this.orderModel.count(query);
            if (iPage.city !== 0) {
                query.$and.push({ city: iPage.city });
            }
            const getCity = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$city",
                        total_item: TOTAL_ORDER
                    },
                },
                {
                    $addFields: {
                        percent_income: {
                            $round: [{
                                $multiply: [{
                                    $cond: [{ $eq: ["$total_item", 0] }, 0, {
                                        $divide: ['$total_item', totalOrder]
                                    }]
                                }, 100]
                            }, 2]
                        }
                    }
                },
                { $sort: { _id: 1 } },
            ]);
            let arrItem = [];
            for (let item of getCity) {
                const tempNameCity = AministrativeDivision.filter(division => division.code === item._id);
                const temp = {
                    _id: item._id,
                    city: tempNameCity.length > 0 ? tempNameCity[0].name : 'Khác',
                    total_item: item.total_item,
                    percent: item.percent_income
                };
                arrItem.push(temp);
            }
            const result = {
                totalOrder: totalOrder,
                data: arrItem,
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async reportServiceByArea(lang, iPage: iPageReportTypeServiceDTOAdmin, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    { date_work: { $gte: iPage.start_date } },
                    { date_work: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { 
                        $or: [
                            {status: "confirm"},
                            {status: "done"},
                            {status: "doing"}
                        ]
                     },
                ]
            };
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


            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            // if (iPage.city) {
            //     query.$and.push({ city: { $in: iPage.city } });
            // } else if (checkPermisstion.city.length > 0) {
            //     query.$and.push({ city: { $in: checkPermisstion.city } });
            // }
            // if (iPage.district) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: iPage.district } },
            //             { district: [] }
            //         ]
            //     });
            // } else if (checkPermisstion.district.length > 0) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: checkPermisstion.district } },
            //             { district: [] }
            //         ]
            //     });
            // }
            // if (admin.id_business) {
            //     /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
            //     query.$and.push({ 'id_business': admin.id_business });
            // }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const totalOrder = await this.orderModel.count(query);
            const data = await this.orderModel.aggregate([
                { $addFields: TEMP_DISCOUNT },
                { $match: query },
                {
                    $group: {
                        _id: '$service._id',
                        total_order: TOTAL_ORDER,
                        total_income: TOTAL_INCOME,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_net_income: TOTAL_NET_INCOME
                    }
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "_id",
                        foreignField: "_id",
                        as: "info_service"
                    }
                },
                {
                    $unwind: "$info_service"
                },
                {
                    $project: {
                        _id: '$_id',
                        total_order: '$total_order',
                        total_income: '$total_income',
                        total_gross_income: '$total_gross_income',
                        total_net_income: '$total_net_income',
                        percent: { $round: [{ $multiply: [{ $divide: ["$total_order", totalOrder] }, 100] }, 2] },
                        title: '$info_service.title',
                        thumbnail: '$info_service.thumbnail'
                    }
                }
            ]);
            const result = {
                totalOrder,
                data
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportDetailServiceByArea(lang, iPage: iPageReportTypeServiceDTOAdmin, admin: UserSystemDocument) {
        try {
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            let query: any = {
                $and: [
                    { date_work: { $gte: iPage.start_date } },
                    { date_work: { $lte: iPage.end_date } },
                    { is_delete: false },
                    { status: "done" },
                    { city: Number(iPage.city) },
                ]
            };
            if (Number(iPage.district) !== -1) {
                query.$and.push({ district: iPage.district });
            }
            const totalOrder = await this.orderModel.count(query);

            const detailData = await this.orderModel.aggregate([
                {
                    $match: query,
                },

                {
                    $group: {
                        _id: "$service._id",
                        total: { $sum: 1 },
                        total_2_hour: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$total_estimate", 2] }, 1, 0
                                ]
                            }
                        },
                        total_3_hour: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$total_estimate", 3] }, 1, 0
                                ]
                            }
                        },
                        total_4_hour: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$total_estimate", 4] }, 1, 0
                                ]
                            }
                        },
                        total_exception: {
                            $sum: {
                                $cond: {
                                    if: {
                                        $not: { $in: ["$total_estimate", [2, 3, 4]] }
                                    },
                                    then: 1,
                                    else: 0
                                }
                            }
                        }
                    }
                },

                {
                    $lookup: {
                        from: "services",
                        localField: "_id",
                        foreignField: "_id",
                        as: "info_service"
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "total": 1,
                        "percent": 1,
                        "title": "$info_service.title",
                        "total_2_hour": 1,
                        "percent_2_hour": { $round: [{ $multiply: [{ $divide: ["$total_2_hour", "$total"] }, 100] }, 2] },
                        "total_3_hour": 1,
                        "percent_3_hour": { $round: [{ $multiply: [{ $divide: ["$total_3_hour", "$total"] }, 100] }, 2] },
                        "total_4_hour": 1,
                        "percent_4_hour": { $round: [{ $multiply: [{ $divide: ["$total_4_hour", "$total"] }, 100] }, 2] },
                        "total_exception": 1,
                        "percent_exception": { $round: [{ $multiply: [{ $divide: ["$total_exception", "$total"] }, 100] }, 2] },
                    }
                },
                { $sort: { total: -1 } }
            ]);
            const result = {
                totalOrder,
                detailData
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalOrderDaily(lang, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    // {
                    //     $or: [
                    //         {status: "confirm"},
                    //         {status: "done"},
                    //         {status: "doing"}
                    //     ]
                    // },
                    // {
                    //     end_date_work: {
                    //         $gte: iPage.start_date,
                    //     },
                    // },
                    // {
                    //     end_date_work: {
                    //         $lte: iPage.end_date,
                    //     },
                    // },
                ],
            };
            if (iPage.status === "done") {
                query.$and.push({
                    status: "done"
                })
            }
            else if (iPage.status === "doing") {
                query.$and.push({
                    status: "doing"
                })
            }
            else if (iPage.status === "confirm") {
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
                // query.$and.push({
                //     $or: [
                //         {status: "confirm"},
                //         {status: "done"},
                //         {status: "doing"}
                //     ]
                // });
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
                // query.$and.push({
                //     status: "done"
                // });
            }


            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            console.log(query.$and, 'query.$and total');
            const getData = await this.orderModel.aggregate([
                { $match: query },
                // { $addFields: TEMP_DATE_WORK },
                { $addFields: (iPage.type_date === 'date_create') ? TEMP_DATE_CREATE : TEMP_DATE_WORK },
                { $addFields: TEMP_SERVICE_FEE },
                { $addFields: TEMP_DISCOUNT },
                {
                    $group: {
                        _id: ID_ORDER_DAILY,
                        total_item: TOTAL_ORDER,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        sort_date_create: SORT_DATE_CREATE,
                        sort_date_work: SORT_DATE_WORK,
                    },
                },
                { $sort: (iPage.type_date === "date_work") ? { sort_date_work: 1, _id: 1 } : { sort_date_create: 1, _id: 1 } },
                // { $sort: { sort_date_create: 1, _id: 1 } },
                // { $sort: { sort_date_work: 1, _id: 1 } },
            ]);

            const count = await this.orderModel.aggregate([
                { $match: query },
                {
                    $addFields: TEMP_DATE_WORK
                },
                {
                    $group: { _id: ID_ORDER_DAILY, }
                },
                { $count: 'total' },
            ]);

            const getTotal = await this.orderModel.aggregate([
                { $match: query },
                { $addFields: TEMP_SERVICE_FEE },
                { $addFields: TEMP_DISCOUNT },
                {
                    $group: {
                        _id: {},
                        total_item: TOTAL_ORDER,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    },
                },
            ]);
            const result = {
                totalItem: count.length > 0 ? count[0].total : 0,
                totalOrder: getTotal,
                data: getData,
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportUserSystemCancelOrder(lang, iPage: iPageReportCancelOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    { status: 'cancel' },
                    { city: Number(iPage.city) },
                    { id_cancel_user_system: { $ne: null } },
                    { is_delete: false },
                ]
            };
            if (Number(iPage.district) !== -1) {
                query.$and.push({ district: iPage.district });
            }
            const totalOrderCancel = await this.orderModel.count(query);
            const getTotal = await this.orderModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: "$id_cancel_user_system.id_reason_cancel",
                        total: { $sum: 1 },
                    }
                },
                {
                    $addFields: { tempId: { $toObjectId: "$_id" } }
                },
                { $lookup: LOOKUP_REASON_CANCEL },
                {
                    $project: {
                        tempId: 0,
                        reason_cancel: {
                            punish_type: 0,
                            punish: 0,
                            date_create: 0,
                            is_delete: 0,
                            is_active: 0,
                            __v: 0
                        }
                    }
                }
            ]);
            const arrPercent = [];
            for (let item of getTotal) {
                const percent = ((item.total / totalOrderCancel) * 100).toFixed(2);
                const i = {
                    name: item.reason_cancel.length > 0 ? item.reason_cancel[0].title : '',
                    value: Number(percent)
                };
                arrPercent.push(i);
            }
            const result = {
                //total: getTotal.length > 0 ? getTotal : 0,
                total_cancel_order_by_admin: totalOrderCancel,
                arrPercent: arrPercent
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    } //

    /////
    async reportOrderByDay(lang, iPage: iPageReportOrderByDayDTOAdmin, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    },
                    {
                        end_date_work: {
                            $gte: iPage.start_date,
                        },
                    },
                    {
                        end_date_work: {
                            $lte: iPage.end_date,
                        },
                    },
                ],
            };
            if (iPage.type !== 'date_work') {
                query.$and[2] = {
                    date_create: {
                        $gte: iPage.start_date,
                    },
                };
                query.$and[3] = {
                    date_create: {
                        $lte: iPage.end_date,
                    },
                };
            } /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const getOrder = await this.orderModel.aggregate([
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
                    $addFields: {
                        convertDateFromString: {
                            $dateFromString: {
                                dateString: iPage.type === 'date_work' ? "$date_work" : "$date_create",
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        partDateToLocal: {
                            $dateToParts: {
                                date: "$convertDateFromString",
                                timezone: "Asia/Ho_Chi_Minh",
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        day: {
                            $dayOfWeek: {
                                date: "$convertDateFromString",
                                timezone: "Asia/Ho_Chi_Minh",
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: "$day",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        temp: { $first: iPage.type === 'date_work' ? "$date_work" : "$date_create" }
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
                { $sort: { _id: 1 } },
            ]);
            let arrTotal = [];
            for (let i = 0; i < 7; i++) { // tạo mảng gồm 7 phần tử chứa các ngày trong tuần
                const item = {
                    _id: i,
                    total_order_fee: 0,
                    total_income: 0,
                    total_service_fee: 0,
                    total_collabotator_fee: 0,
                    total_gross_income: 0,
                    total_item: 0,
                    total_discount: 0,
                    total_net_income: 0,
                    total_net_income_business: 0,
                };
                arrTotal.push(item);
            }
            for (let total of getOrder) {
                let tempID = 0;
                if (total._id === 1) {
                    tempID = 0;
                } else if (total._id === 2) {
                    tempID = 1;
                }
                else if (total._id === 3) {
                    tempID = 2;
                }
                else if (total._id === 4) {
                    tempID = 3;
                }
                else if (total._id === 5) {
                    tempID = 4;
                }
                else if (total._id === 6) {
                    tempID = 5;
                } else if (total._id === 7) {
                    tempID = 6;
                }
                const payload = {
                    _id: tempID,
                    total_order_fee: total.total_order_fee,
                    total_income: total.total_income,
                    total_service_fee: total.total_service_fee,
                    total_collabotator_fee: total.total_collabotator_fee,
                    total_gross_income: total.total_gross_income,
                    total_item: total.total_item,
                    total_discount: total.total_discount,
                    total_net_income: total.total_net_income,
                    total_net_income_business: total.total_net_income_business,
                };
                arrTotal[tempID] = payload;
            }
            return arrTotal;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTotalJobHourCollaborator(lang, iPage: iPageReportOrderByDayDTOAdmin, idCollaborator: string) {
        try {
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportGov(lang, user) {
        try {
            const checkAccount = await this.authService.login(lang, { email: user.UserName, password: user.PassWord });
            if (!checkAccount.token) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "user_system")], HttpStatus.BAD_REQUEST);
            const currentYear = new Date().getFullYear();
            const firstDay = new Date(currentYear, 0, 1);
            const lastDay = new Date(currentYear, 11, 31);
            const countCustomerNew = await this.customerModel.count({
                $and: [
                    {
                        end_date_work: {
                            $gte: firstDay.toISOString(),
                        },
                    },
                    {
                        end_date_work: {
                            $lte: lastDay.toISOString(),
                        },
                    },
                    { is_delete: false },
                    { is_active: true }
                ]
            });
            const countCustomer = await this.customerModel.count({ is_delete: false });
            const countCustomerActive = await this.customerModel.count({ is_delete: false, is_active: true });
            const countService = await this.serviceModel.count({ is_delete: false, is_active: true });
            const countServiceNew = await this.serviceModel.count({
                $and: [
                    {
                        end_date_work: {
                            $gte: firstDay.toISOString(),
                        },
                    },
                    {
                        end_date_work: {
                            $lte: lastDay.toISOString(),
                        },
                    },
                    { is_delete: false },
                    { is_active: true }
                ]
            });
            const countOrderDone = await this.orderModel.count({ status: "done", is_delete: false, is_active: true });
            const countOrderCancel = await this.orderModel.count({ status: "cancel", is_delete: false, is_active: true });
            // const totalPriceOrder = await this.orderModel.f
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    }
                ],
            };

            const totalFinalFee = await this.orderModel.aggregate([
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
                        total_order_fee: TOTAL_NET_INCOME_BUSINESS,
                    },
                }
            ]);
            console.log(totalFinalFee, 'total');

            const result = {
                soLuongTruyCap: countCustomerActive,
                soNguoiBan: countCustomer,
                soNguoiBanMoi: countCustomerNew,
                tongSoSanPham: countService,
                soSanPhamMoi: countServiceNew,
                soLuongGiaoDich: countOrderDone + countOrderCancel,
                tongSoDonHangThanhCong: countOrderDone,
                tongSoDonHangKhongThanhCong: countOrderCancel,
                tongGiaTriGiaoDich: totalFinalFee[0].total_order_fee
            };
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportBalance(lang, iPage: iPageReportOrderByDayDTOAdmin) {
        try {
            let query_collaborator: any = {
                $and: [
                    { id_collaborator: { $ne: null } },
                    { 'id_collaborator.is_verify': true },
                    { 'id_collaborator.is_active': true },
                    { status_current_remainder: { $ne: 'none' } },
                    { value: { $ne: 0 } },
                    {
                        date_create: { $lte: iPage.end_date }
                    },
                    { 'id_collaborator.is_delete': false },
                    { 'id_collaborator.is_locked': false },
                ]
            };
            const totalEndingRemainderCollaborator = await this.totalMoneyCollaborator(query_collaborator, true);
            // tính toán gift remainder phải sửa lại status khác
            query_collaborator.$and[3] = { status_current_gift_remainder: { $ne: 'none' } };
            const totalEndingGiftRemainderCollaborator = await this.totalMoneyCollaborator(query_collaborator, false);
            query_collaborator.$and[5].date_create = { $lte: iPage.start_date };
            query_collaborator.$and[3] = { status_current_remainder: { $ne: 'none' } };
            const totalOpeningRemainderCollaborator = await this.totalMoneyCollaborator(query_collaborator, true);
            query_collaborator.$and[3] = { status_current_gift_remainder: { $ne: 'none' } };
            const totalOpeningGiftRemainderCollaborator = await this.totalMoneyCollaborator(query_collaborator, false);

            let query_customer = {
                $and: [
                    { id_customer: { $ne: null } },
                    { status_current_pay_point: { $ne: 'none' } },
                    { status_current_pay_point: { $exists: true } },
                    {
                        date_create: { $lte: iPage.end_date }
                    },
                    { 'id_customer.is_delete': false },
                    { 'id_customer.is_active': true },
                ]
            };
            const totalEndingBalanceCustomer = await this.totalMoneyCustomer(query_customer);
            query_customer.$and[3].date_create = { $lte: iPage.start_date };
            const totalOpeningBalanceCustomer = await this.totalMoneyCustomer(query_customer);
            const result = {
                total_ending_remainder: totalEndingRemainderCollaborator.length > 0 ? totalEndingRemainderCollaborator[0].total_remainder : 0,
                total_ending_gift_remainder: totalEndingGiftRemainderCollaborator.length > 0 ? totalEndingGiftRemainderCollaborator[0].total_gift_remainder : 0,
                total_opening_remainder: totalOpeningRemainderCollaborator.length > 0 ? totalOpeningRemainderCollaborator[0].total_remainder : 0,
                total_opening_gift_remainder: totalOpeningGiftRemainderCollaborator.length > 0 ? totalOpeningGiftRemainderCollaborator[0].total_gift_remainder : 0,
                total_ending_pay_point: totalEndingBalanceCustomer.length > 0 ? totalEndingBalanceCustomer[0].total_pay_point : 0,
                total_opening_pay_point: totalOpeningBalanceCustomer.length > 0 ? totalOpeningBalanceCustomer[0].total_pay_point : 0,
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalMoneyCollaborator(query, is_remainder) {
        try {
            let total_collaborator;
            if (is_remainder) {
                total_collaborator = await this.historyActivityModel.aggregate([
                    { $lookup: LOOKUP_COLLABORATOR },
                    { $unwind: { path: '$id_collaborator', preserveNullAndEmptyArrays: true } },
                    { $match: query },
                    { $sort: { date_create: -1 } },
                    {
                        $group: {
                            _id: "$id_collaborator",
                            temp_current_remainder: { $first: '$current_remainder' },
                        }
                    },
                    {
                        $group: {
                            _id: {},
                            total_remainder: { $sum: '$temp_current_remainder' },
                        }
                    }
                ]);
            } else {
                total_collaborator = await this.historyActivityModel.aggregate([
                    { $lookup: LOOKUP_COLLABORATOR },
                    { $unwind: { path: '$id_collaborator', preserveNullAndEmptyArrays: true } },
                    { $match: query },
                    { $sort: { date_create: -1 } },
                    {
                        $group: {
                            _id: "$id_collaborator",
                            temp_current_gift_remainder: { $first: '$current_gift_remainder' },
                        }
                    },
                    {
                        $group: {
                            _id: {},
                            total_gift_remainder: { $sum: '$temp_current_gift_remainder' }
                        }
                    }
                ]);
            }

            return total_collaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalMoneyCustomer(query) {
        try {
            const total_customer = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                { $unwind: { path: '$id_customer', preserveNullAndEmptyArrays: true } },
                { $match: query },
                { $sort: { date_create: -1 } },
                {
                    $group: {
                        _id: "$id_customer",
                        temp_current_pay_point: { $first: '$current_pay_point' },
                    }
                },
                {
                    $group: {
                        _id: {},
                        total_pay_point: { $sum: '$temp_current_pay_point' },
                    }
                }
            ]);
            return total_customer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomerByOrderFromArea(lang) {
        try {
            const query = {
                $and: [
                    { is_delete: false }
                ]
            };
            const getData = await this.orderModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                {
                    $unwind: { path: "$id_customer" },
                },
                { $match: query },
                {
                    $group: {
                        _id: '$id_customer.city',
                        total_item: TOTAL_ORDER
                    }
                }
            ]);
            const arrItem = [];
            for (let item of getData) {
                const tempNameCity = AministrativeDivision.filter(division => division.code === item._id);
                const temp = {
                    _id: item._id,
                    city: tempNameCity.length > 0 ? tempNameCity[0].name : 'Khác',
                    total: item.total_item,
                };
                arrItem.push(temp);
            }
            return arrItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportDetailBalanceCustomer(lang, iPage: iPageReportOrderByDayDTOAdmin) {
        try {
            const query = {
                $and: [
                    { id_customer: { $ne: null } },
                    { status_current_pay_point: { $ne: 'none' } },
                    { value: { $ne: 0 } },
                    {
                        date_create: { $lte: iPage.end_date }
                    },
                    {
                        date_create: { $gte: iPage.start_date }
                    },
                    { 'id_customer.is_delete': false },
                    // { 'id_customer.is_active': false },
                ]
            };
            const getHistoryActivity = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                { $unwind: { path: '$id_customer' } },
                { $lookup: LOOKUP_ID_ORDER },
                { $unwind: { path: '$id_order', preserveNullAndEmptyArrays: true } },
                { $match: query },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) },
                { $project: PROJECT_CUSTOMER }
            ]);
            const count = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                { $unwind: { path: '$id_customer' } },
                { $match: query },
                { $count: 'total' },
            ]);
            const total = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                { $unwind: { path: '$id_customer' } },
                { $match: query },
                {
                    $group: {
                        _id: '$status_current_pay_point',
                        total: { $sum: '$value' }
                    }
                }
            ]);
            let total_expenditure = 0;
            let total_revenue = 0;
            for (let item of total) {
                if (item._id === 'up') {
                    total_revenue += item.total;
                } else {
                    total_expenditure += item.total;
                }
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                total: count.length > 0 ? count[0].total : 0,
                data: getHistoryActivity,
                total_revenue: total_revenue,
                total_expenditure: total_expenditure,
                profit: Math.abs(total_revenue) - Math.abs(total_expenditure)
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportDetailBalanceCollaborator(lang, iPage: iPageReportOrderByDayDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { id_collaborator: { $ne: null } },
                    {
                        $or: [
                            { status_current_gift_remainder: { $ne: 'none' } },
                            { status_current_remainder: { $ne: 'none' } }, //
                        ]
                    },
                    { value: { $ne: 0 } },
                    {
                        date_create: { $lte: iPage.end_date }
                    },
                    {
                        date_create: { $gte: iPage.start_date }
                    },
                    { 'id_collaborator.is_delete': false },
                    { 'id_collaborator.is_active': true },
                    { 'id_collaborator.is_verify': true },
                ]
            };
            const getHistoryActivity = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $lookup: LOOKUP_ID_ORDER },
                { $unwind: { path: '$id_order', preserveNullAndEmptyArrays: true } },
                { $lookup: LOOKUP_ID_REASON_CANCEL },
                { $unwind: { path: '$id_reason', preserveNullAndEmptyArrays: true } },
                { $match: query },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) },
                { $project: PROJECT_COLLABORATOR }
            ]);
            const count = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: query },
                { $count: 'total' },
            ]);
            query.$and[1] = { status_current_gift_remainder: { $ne: 'none' } };
            const total_gift_remainder = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: query },
                {
                    $group: {
                        _id: '$status_current_gift_remainder',
                        total: { $sum: '$value' }
                    }
                }
            ]);
            query.$and[1] = { status_current_remainder: { $ne: 'none' } };
            const total_remainder = await this.historyActivityModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: query },
                {
                    $group: {
                        _id: '$status_current_remainder',
                        total: { $sum: '$value' }
                    }
                }
            ]);
            let total_expenditure_gift_remainder = 0;
            let total_revenue_gift_remainder = 0;
            for (let item of total_gift_remainder) {
                if (item._id === 'up') {
                    total_expenditure_gift_remainder += item.total;
                } else {
                    total_revenue_gift_remainder += item.total;
                }
            }
            let total_expenditure_remainder = 0;
            let total_revenue_remainder = 0;
            for (let item of total_remainder) {
                if (item._id === 'up') {
                    total_expenditure_remainder += item.total;
                } else {
                    total_revenue_remainder += item.total;
                }
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                total: count.length > 0 ? count[0].total : 0,
                data: getHistoryActivity,
                gift_remainder: {
                    total_revenue: total_revenue_gift_remainder,
                    total_expenditure: total_expenditure_gift_remainder,
                    profit: Math.abs(total_revenue_gift_remainder) - Math.abs(total_expenditure_gift_remainder)
                },
                remainder: {
                    total_revenue: total_revenue_remainder,
                    total_expenditure: total_expenditure_remainder,
                    profit: Math.abs(total_revenue_remainder) - Math.abs(total_expenditure_remainder)
                }
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportCustomerRate(lang, iPage: iPageReportOrderByDayDTOAdmin) {
        try {
            const query = {
                $and: [
                    { status: 'done' },
                    { is_delete: false },
                    { date_work: { $gte: iPage.start_date } },
                    { date_work: { $lte: iPage.end_date } },
                ]
            };
            const total = await this.orderModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        total_purchase_value: TOTAL_ORDER_FEE,
                        total_order: { $sum: 1 }
                    }
                }
            ]);
            const total_customer = await this.orderModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: "$id_customer",
                        total_customer: TOTAL_ORDER
                    }
                    // Tổng hợp số lượng đơn mà từng khách hàng đã đặt
                },
                {
                    $group: {
                        _id: {},
                        total: TOTAL_ORDER
                    }
                    // Tổng hợp lại số khách hàng
                }
            ]);
            // Tổng số tháng sử dụng dịch vụ
            const total_month_using_service = await this.orderModel.aggregate([
                {
                  // Câu lệnh query
                  $match: query
                },
                {
                  // Nhóm các đơn của từng khách hàng trong cùng một tháng lại với nhau
                  $group: {
                    _id: {
                      id_customer: "$id_customer",
                      month: {
                        $month: { $toDate: "$date_create" }
                      }
                    }
                  }
                },
                {
                  // Nhóm theo từng khách hàng và tính tổng số tháng mà các khách hàng đó có sử dụng dịch vụ
                  $group: {
                    _id: "$_id.id_customer",
                    totalMonths: { $sum: 1 }
                  }
                },
                {
                  // Tính tổng số tháng sử dụng dịch vụ
                  $group: {
                    _id: null,
                    totalMonths: { $sum: "$totalMonths" }
                  }
                }
              ])
            // AOV (Giá trị mua hàng trung bình): Tổng doanh thu / Tổng số đơn hàng
            let average_purchase_value = total.length > 0 ? total[0].total_purchase_value / total[0].total_order : 0;
            average_purchase_value = Math.floor(average_purchase_value);
            // Tần suất mua hàng trung bình: Tổng số đơn hàng / Tổng số khách hàng
            let average_frequency_of_purchases = total.length > 0 ? total[0].total_order / total_customer[0].total : 0;
            // Thời gian giữ chân khách hàng: Tổng số tháng sử dụng dịch vụ / Tổng số lượng khách hàng
            let customer_lifetime_value = total_month_using_service[0].totalMonths / total_customer[0].total;
            // Giá trị khách hàng: AOV × Tần suất mua hàng trung bình × Thời gian giữ chân khách hàng
            let customer_value =  Math.floor(average_purchase_value * average_frequency_of_purchases * customer_lifetime_value);
            const result = {
                average_purchase_value: average_purchase_value,
                average_frequency_of_purchases: average_frequency_of_purchases,
                customer_value: customer_value
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportGroupOrderV2(lang, iPage: iPageReportGroupOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const tempStatus = iPage.status.split(',');
            
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                       status: {$in: tempStatus}  
                    }
                    // {
                    //     $or: [
                    //         {status: "confirm"},
                    //         {status: "done"},
                    //         {status: "doing"}
                    //     ]
                    // },
                    // {
                    //     end_date_work: {
                    //         $gte: iPage.start_date,
                    //     },
                    // },
                    // {
                    //     end_date_work: {
                    //         $lte: iPage.end_date,
                    //     },
                    // },
                ],
            };
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
                // query.$and.push({
                //     $or: [
                //         {status: "confirm"},
                //         {status: "done"},
                //         {status: "doing"}
                //     ]
                // });

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
                // query.$and.push({
                //     status: "done"
                // });
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            // if (iPage.city) {
            //     query.$and.push({ city: { $in: iPage.city } });
            // } else if (checkPermisstion.city.length > 0) {
            //     query.$and.push({ city: { $in: checkPermisstion.city } });
            // }
            // if (iPage.district) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: iPage.district } },
            //             { district: [] }
            //         ]
            //     });
            // } else if (checkPermisstion.district.length > 0) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: checkPermisstion.district } },
            //             { district: [] }
            //         ]
            //     });
            // }
            // if (admin.id_business) {
            //     /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
            //     query.$and.push({ 'id_business': admin.id_business });
            // }
            // console.log('query  ', query.$and);

            const total = await this.orderModel.aggregate([
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
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_order_done: TOTAL_ORDER_DONE,
                        total_order_doing: TOTAL_ORDER_DOING,
                        total_order_confirm: TOTAL_ORDER_CONFIRM,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        //
                        total_fee: { $sum: "$total_fee"}, // Tổng giá trị giao dịch
                        total_net_income_new: {$sum: "$net_income"}, // Thu hộ dịch vụ
                        total_discount_new: {$sum: "$total_discount"}, // Giảm giá
                        total_service_fee: TOTAL_SERVICE_FEE, // Phí áp dụng
                        total_tax: {$sum: "$value_added_tax"}, // Thuế
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                }
            ]);

            const getGroupOrder = await this.orderModel.aggregate([
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
                // {$match: {$or: [
                //     {$and: [
                //         { tempPunish: {$ne: 0} },
                //         { status: {$in: ["cancel", "pending"]}},
                //     ]},
                //     {
                //         status: {$in: ["doing", "confirm", "done"]}
                //     }
                // ]}},
                {
                    $group: {
                        _id: "$_id",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        //
                        total_fee: { $sum: "$total_fee"}, // Tổng giá trị giao dịch
                        total_net_income_new: {$sum: "$net_income"}, // Thu hộ dịch vụ
                        total_discount_new: {$sum: "$total_discount"}, // Giảm giá
                        total_service_fee: TOTAL_SERVICE_FEE, // Phí áp dụng
                        total_tax: {$sum: "$value_added_tax"}, // Thuế
                        status: {$push : "$status"},
                        id_view: {$push : "$id_view"},
                        date_work: { $push: '$date_work' },
                        date_create: { $push: '$date_create' },
                        id_group_order: { $push: '$id_group_order' }
                    },
                },
                // {
                //     $lookup: LOOKUP_GROUP_ORDER
                // },
                // {
                //     $sort: { 'id_group_order.date_create': -1, _id: 1 }
                // },
                // {
                //     $unwind: { path: '$id_group_order' }
                // },
                {
                    $sort: (iPage.type_date === "date_work") ? {date_work: -1, _id: 1} : {date_create: -1, _id: 1}
                },
                // Doanh thu
                {
                    $addFields: {
                        revenue: { $subtract: ["$total_fee","$total_net_income_new"]}
                    }
                },
                // Doanh thu thuan
                {
                    $addFields: {
                        net_revenue: { $subtract: ["$revenue","$total_discount_new"]}
                    }
                },
                // Tong hoa don
                {
                    $addFields: {
                        invoice: { $subtract: ["$total_fee","$total_discount"]}
                    }
                },
                // Lợi nhuận trước thuế
                {
                    $addFields: {
                        profit_after_tax: { $subtract: ["$net_revenue","$total_tax"]}
                    }
                },
                {
                    $addFields: PERCENT_INCOME
                }, 
                {
                    $addFields: PERCENT_INCOME_ENVENUE
                },
                {
                    $unwind: { path: '$status' }
                },
                {
                    $skip: Number(iPage.start)
                },
                {
                    $limit: Number(iPage.length)
                }
            ]);

            // const count = await this.orderModel.aggregate([
            //     {
            //         $match: query
            //     },
            //     {
            //         $group: { _id: '$id_group_order' }
            //     },
            //     {
            //         $count: 'total'
            //     }
            // ]);


            const count = await this.orderModel.count(query)


            console.log(count, 'countcountcount');
            
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: total,
                // totalItem: count.length > 0 ? count[0].total : 0,
                totalItem: count || 0,
                data: getGroupOrder
            };

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    /////////////////////////////////////////// Báo cáo đơn hàng theo khách hàng ////////////////////////////////////////////////////
    async reportOrderByCustomer(lang, iPage: iPageReportOrderByCustomerDTOAdmin, admin: UserSystemDocument) {
        try {

            // khach hang moi: KH tạo tk ngoai thoi gian da chon, nhung moi len don lan dau tien thi cung duoc goi la KH moi
            let query: any = {
                $and: [
                    // { end_date_work: { $gte: iPage.start_date } },
                    // { end_date_work: { $lte: iPage.end_date } },
                    {
                        $or: [
                        {status: "confirm"},
                        {status: "done"},
                        {status: "doing"}
                    ]},
                    { is_delete: false },
                ]
            };

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


            // Logic thống kê cũ: chọn giá trị ngày bắt đầu và ngày kết thúc sau đó thống kê ra những khách hàng nào là KH mới và KH cũ theo logic bên đưới
            // logic mới: không check theo ngày tạo nữa mà check theo đơn đã hoàn thành 
            // (trường total_price = 0 thì mới là KH mới (chưa đặt đơn nào), còn nếu > 0 là KH cũ (đã từng đặt đơn))\
            // Nếu lọc theo ngày thì: 

            // Ngày tạo tài khoản của khách hàng phải nhỏ hơn ngày bắt đầu của bộ lọc thì mới tính là khách hàng cũ => bủn
            if (iPage.type_customer === 'old') {
                query.$and.push({ 'id_customer.date_create': { $lte: iPage.start_date } });
            }
            // Nếu là khách hàng mới thì ngày tạo phải trong khoảng thời gian của bộ lọc đã chọn
            if (iPage.type_customer === 'new') {
                query.$and.push({ 'id_customer.date_create': { $gte: iPage.start_date } });
                query.$and.push({ 'id_customer.date_create': { $lte: iPage.end_date } });
            }

            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getCustomerTotal = await this.orderModel.aggregate([
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
                    $lookup: LOOKUP_TRANSACTION_PUNISH_DONE
                },
                {
                    $addFields: TEMP_TRANSACTION_PUNISH
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
                        punish: TOTAL_PUNISH,
                        total_hour: TOTAL_HOUR
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);

            const getCustomer = await this.orderModel.aggregate([
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

            const totalCustomer = await this.orderModel.aggregate([
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

            const count = await this.orderModel.aggregate([
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
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTotalOrderByCustomer(lang, iPage: iPageReportOrderByCustomerDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    // { end_date_work: { $gte: iPage.start_date } },
                    // { end_date_work: { $lte: iPage.end_date } },
                    {
                        $or: [
                        {status: "confirm"},
                        {status: "done"},
                        {status: "doing"}
                    ]},
                    { is_delete: false },
                ]
            };
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
            const getTotal = await this.orderModel.aggregate([
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

            const count = await this.orderModel.aggregate([
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

    async addQueryDateByType(startDate, endDate, typeDate) {
        try {
            const temp = []
            if (typeDate !== 'date_work') {
                temp.push({
                    date_create: {
                        $gte: startDate,
                    }
                });
                temp.push({
                    date_create: {
                        $lte: endDate,
                    }
                });
            } else {
                temp.push({
                    end_date_work: {
                        $gte: startDate,
                    }
                });
                temp.push({
                    end_date_work: {
                        $lte: endDate,
                    }
                });
            }
            return temp;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async reportOrderByCollaborator(lang, iPage, admin) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const tempStatus = iPage.status.split(',');
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: {$in: tempStatus}  
                    }
                ],
            };
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


            const queryAggregate = [
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                // {
                //     $lookup: LOOKUP_PUNISH
                // },
                // {
                //     $lookup: LOOKUP_TRANSACTION_PUNISH
                // },
                // {
                //     $addFields: TEMP_TRANSACTION_PUNISH
                // },
                {
                    $lookup: LOOKUP_PUNISH_TICKET_DONE_BY_COLLABORATOR
                },
                {
                    $addFields: TEMP_PUNISH_TICKET
                },

            ]

            const dataResult = await Promise.all([
                this.orderRepositoryService.aggregateQuery([
                    ...queryAggregate,
                    {
                        $group: {
                            _id: "$id_collaborator",
                            total_order_fee: TOTAL_ORDER_FEE,
                            total_income: TOTAL_INCOME,
                            total_service_fee: TOTAL_SERVICE_FEE,
                            total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                            total_gross_income: TOTAL_GROSS_INCOME,
                            total_item: TOTAL_ORDER,
                            total_discount: TOTAL_DISCOUNT,
                            total_net_income: TOTAL_NET_INCOME,
                            total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                            punish: TOTAL_PUNISH,
                            total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
                            total_hour: TOTAL_HOUR
                        }
                    },
                    {
                        $lookup: LOOKUP_GROUP_ID_COLLABORATOR
                    },
                    {
                        $addFields: PERCENT_INCOME
                    },
                    // {
                    //     $unwind: { path: '$id_collaborator' }
                    // },
                    {
                        $project: {
                            'id_collaborator.password': 0, 'id_collaborator.salt': 0,
                        }
                    },
                    { $sort: { total_item: -1, _id: -1 } },
                    { $skip: Number(iPage.start) },
                    { $limit: Number(iPage.length) }
                ]),
                this.orderRepositoryService.aggregateQuery([
                    {
                        $match: query
                    },
    
                    {
                        $group: {
                            _id: "$id_collaborator",
                        }
                    },
                    { $count: 'total' },
                ]),
                this.orderRepositoryService.aggregateQuery([
                    ...queryAggregate,
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
                            punish: TOTAL_PUNISH,
                            total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
                            total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                        }
                    },
                    {
                        $addFields: PERCENT_INCOME
                    },
                ])
            ])

            // const getData = await this.orderModel.aggregate([
            //     {
            //         $match: query
            //     },
            //     {
            //         $addFields: TEMP_SERVICE_FEE
            //     },
            //     {
            //         $addFields: TEMP_DISCOUNT
            //     },
            //     // {
            //     //     $lookup: LOOKUP_PUNISH
            //     // },
            //     {
            //         $lookup: LOOKUP_TRANSACTION_PUNISH
            //     },
            //     {
            //         $addFields: TEMP_PUNISH
            //     },
            //     {
            //         $group: {
            //             _id: "$id_collaborator",
            //             total_order_fee: TOTAL_ORDER_FEE,
            //             total_income: TOTAL_INCOME,
            //             total_service_fee: TOTAL_SERVICE_FEE,
            //             total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
            //             total_gross_income: TOTAL_GROSS_INCOME,
            //             total_item: TOTAL_ORDER,
            //             total_discount: TOTAL_DISCOUNT,
            //             total_net_income: TOTAL_NET_INCOME,
            //             total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
            //             punish: TOTAL_PUNISH,
            //             total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
            //             total_hour: TOTAL_HOUR
            //         }
            //     },
            //     {
            //         $lookup: LOOKUP_GROUP_ID_COLLABORATOR
            //     },
            //     {
            //         $addFields: PERCENT_INCOME
            //     },
            //     {
            //         $unwind: { path: '$id_collaborator' }
            //     },
            //     {
            //         $project: {
            //             'id_collaborator.password': 0, 'id_collaborator.salt': 0,
            //         }
            //     },
            //     { $sort: { total_item: -1, _id: -1 } },
            //     { $skip: Number(iPage.start) },
            //     { $limit: Number(iPage.length) }
            // ]);

            // const count = await this.orderModel.aggregate([
            //     {
            //         $match: query
            //     },

            //     {
            //         $group: {
            //             _id: "$id_collaborator",
            //         }
            //     },
            //     { $count: 'total' },
            // ]);
            
            // const getTotal = await this.orderRepositoryService.aggregateQuery([
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
            //         $lookup: LOOKUP_PUNISH
            //     },
            //     {
            //         $addFields: TEMP_PUNISH
            //     },
            //     {
            //         $group: {
            //             _id: {},
            //             total_order_fee: TOTAL_ORDER_FEE,
            //             total_income: TOTAL_INCOME,
            //             total_service_fee: TOTAL_SERVICE_FEE,
            //             total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
            //             total_gross_income: TOTAL_GROSS_INCOME,
            //             total_item: TOTAL_ORDER,
            //             total_discount: TOTAL_DISCOUNT,
            //             total_net_income: TOTAL_NET_INCOME,
            //             punish: TOTAL_PUNISH,
            //             total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
            //             total_net_income_business: TOTAL_NET_INCOME_BUSINESS
            //         }
            //     },
            //     {
            //         $addFields: PERCENT_INCOME
            //     },
            // ]);

            // dataResult[0] data bao cao
            // dataResult[1] tong so luong collaborator tim thay tren 1 trang
            // dataResult[0] tong so luong collaborator khop voi ket qua

            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: dataResult[2],
                data: dataResult[0],
                totalItem: dataResult[1].length > 0 ? dataResult[1][0].total : 0
            };
            
            // const result = {
            //     start: Number(iPage.start),
            //     length: Number(iPage.length),
            //     total: getTotal,
            //     data: getCollaborator,
            //     totalItem: count.length > 0 ? count[0].total : 0
            // };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async reportOrderByCollaboratorbackup(lang, iPage, admin) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city);
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const tempStatus = iPage.status.split(',');
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: {$in: tempStatus}  
                    },
                    // {
                    //     end_date_work: {
                    //         $gte: iPage.start_date,
                    //     },
                    // },
                    // {
                    //     end_date_work: {
                    //         $lte: iPage.end_date,
                    //     },
                    // },
                ],
            };
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
                // query.$and.push({
                //     $or: [
                //         {status: "confirm"},
                //         {status: "done"},
                //         {status: "doing"}
                //     ]
                // });

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
                // query.$and.push({
                //     status: "done"
                // });
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            // if (iPage.city) {
            //     query.$and.push({ city: { $in: iPage.city } });
            // } else if (checkPermisstion.city.length > 0) {
            //     query.$and.push({ city: { $in: checkPermisstion.city } });
            // }
            // if (iPage.district) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: iPage.district } },
            //             { district: [] }
            //         ]
            //     });
            // } else if (checkPermisstion.district.length > 0) {
            //     query.$and.push({
            //         $or: [
            //             { 'district': { $in: checkPermisstion.district } },
            //             { district: [] }
            //         ]
            //     });
            // }
            // if (admin.id_business) {
            //     /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
            //     query.$and.push({ 'id_business': admin.id_business });
            // }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const getCollaborator = await this.orderModel.aggregate([
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
                    $lookup: LOOKUP_PUNISH
                },
                {
                    $addFields: TEMP_PUNISH
                },
                {
                    $group: {
                        _id: "$id_collaborator",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
                        total_hour: TOTAL_HOUR
                    }
                },
                {
                    $lookup: LOOKUP_GROUP_ID_COLLABORATOR
                },
                {
                    $addFields: PERCENT_INCOME
                },
                {
                    $unwind: { path: '$id_collaborator' }
                },
                {
                    $project: {
                        'id_collaborator.password': 0, 'id_collaborator.salt': 0,
                    }
                },
                { $sort: { total_item: -1, _id: -1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);

            const count = await this.orderModel.aggregate([
                {
                    $match: query
                },

                {
                    $group: {
                        _id: "$id_collaborator",
                    }
                },
                { $count: 'total' },
            ]);

            const getTotal = await this.orderModel.aggregate([
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
                    $lookup: LOOKUP_PUNISH
                },
                {
                    $addFields: TEMP_PUNISH
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
                        punish: TOTAL_PUNISH,
                        total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    }
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: getTotal,
                data: getCollaborator,
                totalItem: count.length > 0 ? count[0].total : 0
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportDetailOrderByCollaborator(lang, id: string, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(id);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.BAD_REQUEST);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city, getCollaborator.district, getCollaborator.id_business);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const tempStatus = iPage.status.split(',');
            let query: any = {
                $and: [
                    {
                        id_collaborator: getCollaborator._id,
                    },
                    {
                        status: {$in: tempStatus}  
                    },
                    {
                        end_date_work: { $gte: iPage.start_date }
                    },
                    {
                        end_date_work: { $lte: iPage.end_date }
                    }
                ]
            };



            // const countOrder = await this.orderModel.count(query);

            // const getReportOrder = await this.orderModel.aggregate([
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
            //         $lookup: LOOKUP_TRANSACTION_PUNISH
            //     },
            //     {
            //         $addFields: TEMP_TRANSACTION_PUNISH
            //     },
            //     {
            //         $group: {
            //             _id: "$_id",
            //             total_order_fee: TOTAL_ORDER_FEE,
            //             total_income: TOTAL_INCOME,
            //             total_service_fee: TOTAL_SERVICE_FEE,
            //             total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
            //             total_gross_income: TOTAL_GROSS_INCOME,
            //             total_item: TOTAL_ORDER,
            //             total_discount: TOTAL_DISCOUNT,
            //             total_net_income: TOTAL_NET_INCOME,
            //             total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
            //             punish: TOTAL_PUNISH,
            //             status: {$push : "$status"},
            //             id_view: {$push : "$id_view"},
            //             date_work: { $push: '$date_work' },
            //             date_create: { $push: '$date_create' }
            //         },
            //     },
            //     {
            //         $sort: (iPage.type_date === "date_work") ? {date_work: -1, _id: 1} : {date_create: -1, _id: 1}
            //     },
            //     {
            //         $addFields: PERCENT_INCOME
            //     },
            //     {
            //         $unwind: { path: '$status' }
            //     },
            //     {
            //         $skip: Number(iPage.start)
            //     },
            //     {
            //         $limit: Number(iPage.length)
            //     }
            // ]);

            // const getTotal = await this.orderModel.aggregate([
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
            //         $lookup: LOOKUP_TRANSACTION_PUNISH
            //     },
            //     {
            //         $addFields: TEMP_TRANSACTION_PUNISH
            //     },
            //     {
            //         $group: {
            //             _id: {},
            //             total_order_fee: TOTAL_ORDER_FEE,
            //             total_income: TOTAL_INCOME,
            //             total_service_fee: TOTAL_SERVICE_FEE,
            //             total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
            //             total_gross_income: TOTAL_GROSS_INCOME,
            //             total_item: TOTAL_ORDER,
            //             total_order_done: TOTAL_ORDER_DONE,
            //             total_order_doing: TOTAL_ORDER_DOING,
            //             total_order_confirm: TOTAL_ORDER_CONFIRM,
            //             total_discount: TOTAL_DISCOUNT,
            //             total_net_income: TOTAL_NET_INCOME,
            //             punish: TOTAL_PUNISH,
            //             total_net_income_business: TOTAL_NET_INCOME_BUSINESS
            //         }
            //     },
            //     {
            //         $addFields: PERCENT_INCOME
            //     },
            // ]);


            const dataResult = await Promise.all([                
                this.orderRepositoryService.aggregateQuery([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                // {
                //     $lookup: LOOKUP_TRANSACTION_PUNISH
                // },
                // {
                //     $addFields: TEMP_TRANSACTION_PUNISH
                // },
                {
                    $lookup: LOOKUP_PUNISH_TICKET_DONE_BY_COLLABORATOR
                },
                {
                    $addFields: TEMP_PUNISH_TICKET
                },
                {
                    $group: {
                        _id: "$_id",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        status: {$push : "$status"},
                        id_view: {$push : "$id_view"},
                        date_work: { $push: '$date_work' },
                        date_create: { $push: '$date_create' },
                        id_group_order: { $push: '$id_group_order' },
                    },
                },
                {
                    $sort: (iPage.type_date === "date_work") ? {date_work: -1, _id: 1} : {date_create: -1, _id: 1}
                },
                {
                    $addFields: PERCENT_INCOME
                },
                {
                    $unwind: { path: '$status' }
                },
                {
                    $skip: Number(iPage.start)
                },
                {
                    $limit: Number(iPage.length)
                }
                ]),
                this.orderRepositoryService.countDataByCondition(query),
                this.orderRepositoryService.aggregateQuery([
                    {
                        $match: query
                    },
                    {
                        $addFields: TEMP_SERVICE_FEE
                    },
                    {
                        $addFields: TEMP_DISCOUNT
                    },
                    // {
                    //     $lookup: LOOKUP_TRANSACTION_PUNISH
                    // },
                    // {
                    //     $addFields: TEMP_TRANSACTION_PUNISH
                    // },
                    {
                        $lookup: LOOKUP_PUNISH_TICKET_DONE_BY_COLLABORATOR
                    },
                    {
                        $addFields: TEMP_PUNISH_TICKET
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
                            total_order_done: TOTAL_ORDER_DONE,
                            total_order_doing: TOTAL_ORDER_DOING,
                            total_order_confirm: TOTAL_ORDER_CONFIRM,
                            total_discount: TOTAL_DISCOUNT,
                            total_net_income: TOTAL_NET_INCOME,
                            punish: TOTAL_PUNISH,
                            total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                        }
                    },
                    {
                        $addFields: PERCENT_INCOME
                    },
                ])
            ])

            return {
                start: iPage.start,
                length: iPage.length,
                data: dataResult[0],
                totalItem: dataResult[1],
                total: dataResult[2]
            };
            // return {
            //     start: iPage.start,
            //     length: iPage.length,
            //     totalItem: countOrder,
            //     data: getReportOrder,
            //     total: getTotal
            // };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportViolationCollaborator(lang, id: string, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {
            const tempStatus = iPage.status.split(',');
            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: {$in: tempStatus}  
                    },
                ],
            };
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

            const getData = await this.orderModel.aggregate([
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
                    $lookup: LOOKUP_PUNISH
                },
                {
                    $addFields: TEMP_PUNISH
                },
                {
                    $group: {
                        _id: "$id_punish",
                        id_collaborator: {$push: "$id_collaborator"},
                        arrPunish: {$push: "$punish"},
                    }
                },
                {
                    $group: {
                        _id: "$id_collaborator",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
                        total_hour: TOTAL_HOUR,
                        // arrPunish: {$push: "$punish"},
                    }
                },

                //  {
                //     $group:{
                //         _id: 
                //     }
                // },
                {
                    $lookup: LOOKUP_GROUP_ID_COLLABORATOR
                },
                // {
                //     $addFields: PERCENT_INCOME
                // },
                {
                    $unwind: { path: '$id_collaborator' }
                },
               
                {
                    $project: {
                        'id_collaborator.password': 0, 'id_collaborator.salt': 0,
                    }
                },
                { $sort: { total_item: -1, _id: -1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);


            const getTotal = await this.orderModel.aggregate([
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
                    $lookup: LOOKUP_PUNISH
                },
                {
                    $addFields: TEMP_PUNISH
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
                        punish: TOTAL_PUNISH,
                        total_tip_collaborator: TOTAL_TIP_COLLABORATOR,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS
                    }
                },
                {
                    $addFields: PERCENT_INCOME
                },
            ]);

            const count = await this.orderModel.aggregate([
                {
                    $match: query
                },

                {
                    $group: {
                        _id: "$id_collaborator",
                    }
                },
                { $count: 'total' },
            ]);

            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: getTotal,
                data: getData,
                totalItem: count.length > 0 ? count[0].total : 0
            };


            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}