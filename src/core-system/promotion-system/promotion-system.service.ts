import { Injectable } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { HttpException } from '@nestjs/common/exceptions'
import { InjectModel } from '@nestjs/mongoose'
import { endOfDay, startOfDay } from 'date-fns'
import { Model } from 'mongoose'
import { Customer, CustomerDocument, ERROR, GlobalService, GroupCustomer, GroupCustomerDocument, iPageDTO, Order, OrderDocument, Promotion, PromotionDocument } from 'src/@core'
import { PROMOTION_ACTION_TYPE } from 'src/@repositories/module/mongodb/@database/enum'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { GroupOrder, GroupOrderDocument } from '../../@core/db/schema/group_order.schema'
import { ActivityCustomerSystemService } from '../activity-customer-system/activity-customer-system.service'

@Injectable()
export class PromotionSystemService {
    constructor(
        private globalService: GlobalService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(GroupCustomer.name) private groupCustomerModel: Model<GroupCustomerDocument>,

    ) { }
    async getLimitCount(lang, user) {
        try {
            const arrItem = await this.promotionModel.findOne({ id_customer: user._id })
            const result = {
                limit_count: arrItem.limit_count
            }
            return result.limit_count;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getLimitUsed(lang, user) {
        try {
            const arrItem = await this.promotionModel.findOne({ id_customer: user._id })
            const result = {
                limited_use: arrItem.limited_use

            }
            return result.limited_use;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getExchangePointForCustomer(lang, iPage: iPageDTO, user, brand) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                my_promotion.push(item["'id_promotion'"])
            }
            const query: any = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { _id: { $not: { $in: my_promotion } } },
                { is_exchange_point: true },
                {
                    $or: [
                        {
                            $and: [
                                { is_limit_date: true },
                                { limit_start_date: { $lte: dateNow } },
                                { limit_end_date: { $gte: dateNow } },
                            ]
                        },
                        {
                            $and: [
                                { is_limit_date: false },
                            ]
                        }
                    ]
                },
                {
                    $or: [
                        {
                            $and: [
                                { is_id_customer: true },
                                { id_customer: { $in: user._id } },
                            ]
                        },
                        {
                            $and: [
                                { is_id_customer: false },
                            ]
                        }
                    ]
                },
                {
                    $or: [
                        {
                            $and: [
                                { is_id_group_customer: true },
                                { id_group_customer: { $in: getCustomer.id_group_customer } },
                            ]
                        },
                        {
                            $and: [
                                { is_id_group_customer: false },
                            ]
                        }
                    ]
                },
                { is_enough_limit_used: false },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })
            const arrItem = await this.promotionModel.find(query).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.promotionModel.count(query)
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

    async getCodeForCustomer(lang, iPage: iPageDTO, user) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            console.log(getCustomer.my_promotion, 'getCustomer.my_promotion')
            const dateNow = new Date(Date.now()).toISOString();
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { type_promotion: "code" },
                { _id: { $in: getCustomer.my_promotion } },
                {
                    $or: [
                        {
                            $and: [
                                { is_limit_date: true },
                                { limit_start_date: { $lte: dateNow } },
                                { limit_end_date: { $gte: dateNow } }
                            ]
                        },
                        {
                            $and: [
                                { is_limit_date: false }
                            ]
                        }
                    ]
                },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            const arrItem = await this.promotionModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.promotionModel.count(query)
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
    async getPrmotionCodeForCustomerPayment(lang, iPage: iPageDTO) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { type_promotion: "code" },
                { brand: "guvi" },
                {
                    $or: [
                        {
                            $and: [
                                { is_limit_date: true },
                                { limit_start_date: { $lte: dateNow } },
                                { limit_end_date: { $gte: dateNow } }
                            ]
                        },
                        {
                            $and: [
                                { is_limit_date: false }
                            ]
                        }
                    ]
                },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            const arrItem = await this.promotionModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service_apply', select: { kind: 1, _id: 1, title: 1 } })
            const count = await this.promotionModel.count(query)
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

    async getListPromotion(lang, iPage: iPageDTO, user) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const query: any = {
                $and: [{
                    $or: [{
                        code: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { type_promotion: "code" },
                {
                    $or: [
                        {
                            $and: [
                                { is_id_customer: true },
                                { id_customer: { $in: user._id } },
                            ]
                        },
                        {
                            $and: [
                                { is_id_customer: false },
                            ]
                        }
                    ]
                },
                {
                    $or: [
                        {
                            $and: [
                                { is_id_group_customer: true },
                                { id_group_customer: { $in: getCustomer.id_group_customer } },
                            ]
                        },
                        {
                            $and: [
                                { is_id_group_customer: false },
                            ]
                        }
                    ]
                },
                {
                    $or: [
                        {
                            $and: [
                                { is_limit_date: true },
                                { limit_start_date: { $lte: dateNow } },
                                { limit_end_date: { $gte: dateNow } }
                            ]
                        },
                        {
                            $and: [
                                { is_limit_date: false }
                            ]
                        }
                    ]
                },
                { brand: "guvi" },
                { is_enough_limit_used: false },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            const arrItem = await this.promotionModel.find(query).sort({ position: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.promotionModel.count(query)
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

    async getListPromotionGuest(lang, iPage: iPageDTO) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const query: any = {
                $and: [{
                    $or: [{
                        code: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { type_promotion: "code" },
                {
                    $or: [
                        {
                            $and: [
                                { is_limit_date: true },
                                { limit_start_date: { $lte: dateNow } },
                                { limit_end_date: { $gte: dateNow } }
                            ]
                        },
                        {
                            $and: [
                                { is_limit_date: false }
                            ]
                        }
                    ]
                },
                { is_id_customer: false },
                { is_id_group_customer: false },
                { brand: "guvi" },
                { is_enough_limit_used: false },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            const arrItem = await this.promotionModel.find(query).sort({ position: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.promotionModel.count(query)
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

    /**
     * 
     * @param lang ngôn ngữ
     * @param infoJob thông tin ban đầu của công việc
     * @param codePromotion mã code của khuyến mãi
     * @param getCustomer thông tin KH
     * @param callBy người gọi hàm này (phân biệt được gọi bởi system hoặc KH)
     * @returns _id: mã id của khuyến mãi ---
                code: mã code của khuyến mãi ---
                title: tên của mã khuyến mãi ---
                discount: số tiền được giảm giá
     */
    async calculateCodePromotion(lang, infoJob, codePromotion, getCustomer, callBy?) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const checkCode = await this.promotionModel.findOne({
                $and: [
                    { code: codePromotion },
                    // { price_min_order: { $lte: infoJob.initial_fee } },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_limit_date: true },
                                    { limit_start_date: { $lte: dateNow } },
                                    { limit_end_date: { $gte: dateNow } }
                                ]
                            },
                            {
                                $and: [
                                    { is_limit_date: false }
                                ]
                            }
                        ]
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_id_customer: true },
                                    { id_customer: { $in: getCustomer._id } },
                                ]
                            },
                            {
                                $and: [
                                    { is_id_customer: false },
                                ]
                            }
                        ]
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_id_group_customer: true },
                                    { id_group_customer: { $in: getCustomer.id_group_customer } },
                                ]
                            },
                            {
                                $and: [
                                    { is_id_group_customer: false },
                                ]
                            }
                        ]
                    },
                    {
                        service_apply: { $in: infoJob.service._id }
                    },
                    { is_enough_limit_used: false },
                    {
                        is_delete: false
                    },
                    {
                        is_active: true
                    },
                    {
                        brand: "guvi"
                    },
                    {
                        type_action: PROMOTION_ACTION_TYPE.use_in_app,
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_loop: true },
                                    { is_turn_on_loop: true }
                                ]
                            },
                            {
                                is_loop: false
                            }
                        ]
                    },
                    { is_parent_promotion: false },
                    // {
                    //     $or: [
                    //         {is_apply_area: false},
                    //         {
                    //             $and: [
                    //                 {is_apply_area: true},
                    //                 {city: {$in: infoJob.city}},
                    //                 {district: {$in: infoJob.district}}
                    //             ]
                    //         }
                    //     ]
                    // }
                    // {
                    //     $or: [
                    //         {
                    //             $and: [
                    //                 { type_date_apply: 'date_work' }
                    //             ]
                    //         },
                    //         {
                    //             type_date_apply: 'date_create'
                    //         }
                    //     ]
                    // }
                ]
            });

            const dateNowTime = new Date(dateNow).getTime();
            if (!checkCode) {
                if (callBy && callBy === "system") {
                    return null;
                } else throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'code_promotion')], HttpStatus.BAD_REQUEST);
            }
            // if (checkCode.type_date_apply === 'date_work') {
            //     // kiểm tra nếu loại ngày áp dụng khuyến mãi là ngày làm thì cần kiểm tra lại
            //     const format_date_work = await this.generalHandleService.formatDateWithTimeZone(new Date(infoJob.date_work_schedule[0]["date"]), checkCode.timezone);
            //     const arr_day_apply = checkCode.day_apply.filter(i => i["is_day_apply"] === true && i["day_local"] === format_date_work.day_of_week);
            //     // lọc ra mảng có ngày trùng với ngày làm dựa theo mảng các ngày trong tuần nhưng với điều kiện is_check_day_apply =  true;
            //     if (arr_day_apply.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_CONDITION, lang, 'arr_day_apply')], HttpStatus.BAD_REQUEST);
            //     let check_start_end_time_date_work = false;
            //     if (arr_day_apply.length > 0 && arr_day_apply[0]["time_apply"].length > 0) {
            //         check_start_end_time_date_work = arr_day_apply[0]["time_apply"].filter(i => i.start_time_local <= format_date_work.time && i.end_time_local >= format_date_work.time).length > 0;
            //         // kiểm tra ngày làm có nằm trong khoảng thời gian của ngày đó hay không. giả sử ko có khoảng thời gian thì mặc định là cả ngày
            //     }
            //     if (!check_start_end_time_date_work && arr_day_apply[0]["time_apply"].length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_CONDITION, lang, 'check_start_end_time_date_work exist')], HttpStatus.BAD_REQUEST);
            // }
            // tính năng áp mã cho ngày làm
            // else throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_CONDITION, lang, null)], HttpStatus.BAD_REQUEST);

            if (checkCode.price_min_order > infoJob.initial_fee) {
                if (callBy && callBy === "system") {
                    return null;
                } else throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_ENOUGH_PRICE, lang, "code_promotion")], HttpStatus.BAD_REQUEST);

            }

            if (checkCode.is_limited_use === true) {
                const countUsedPrmotion = await this.groupOrderModel.count({ "code_promotion.code": checkCode.code, id_customer: getCustomer._id, status: { $ne: "cancel" }, is_delete: false });
                if (!(checkCode.limited_use > countUsedPrmotion)) {
                    if (callBy && callBy === "system") {
                        return null;
                    } else throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "code_promotion")], HttpStatus.BAD_REQUEST);
                }
            }



            if (checkCode.is_exchange_point === true) {
                const myPromotion = getCustomer.my_promotion;
                const checkCodeOwned = myPromotion.findIndex(x => x.id_promotion.toString().localeCompare(checkCode._id.toString()) === 0);
                if (checkCodeOwned < 0) {
                    if (callBy && callBy === "system") {
                        return null;
                    } else throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_OWNED, lang, "code_promotion")], HttpStatus.BAD_REQUEST);
                }
                else {
                    if (!(myPromotion[checkCodeOwned].used < myPromotion[checkCodeOwned].limit_used) ||
                        dateNowTime > new Date(myPromotion[checkCodeOwned].exp_date).getTime()) {
                        if (callBy && callBy === "system") {
                            return null;
                        } else throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "code_promotion")], HttpStatus.BAD_REQUEST);
                    }
                }
            }

            if (checkCode.is_apply_area === true) {
                const includeCity = checkCode.city.indexOf(infoJob.city);
                const includeDistrict = (checkCode.district.length > 0) ? checkCode.district.indexOf(infoJob.district) : -2;
                if ((includeCity < 0) || (includeCity > -1 && includeDistrict === -1)) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.NOT_APPLY_AREA, lang, "area")], HttpStatus.BAD_REQUEST);
            }

            // update lại số lần sử dụng của KH nếu KH đó đã đổi mã khuyến mãi
            // for (let item of getCustomer.my_promotion) {
            //     if (item.id_promotion === checkCode._id.toString()) {
            //         item.used += 1;
            //         await getCustomer.save();
            //     }
            // }
            // const limit_start_date = new Date(checkCode.limit_start_date).getTime()
            // const limit_end_date = new Date(checkCode.limit_end_date).getTime()



            // if (checkCode.is_limit_date === true &&
            //     (limit_start_date > dateNow ||
            //         limit_end_date < dateNow)
            // ) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION_IS_OUT_DATE, lang, null)], HttpStatus.BAD_REQUEST);
            // }
            let initial_fee = infoJob.initial_fee;
            let discount = 0;
            switch (checkCode.discount_unit) {
                case "percent":
                    discount = Number(initial_fee) * (Number(checkCode.discount_value) / 100)
                    discount = (Number(discount) > Number(checkCode.discount_max_price)) ? Number(checkCode.discount_max_price) : Number(discount);
                    break;
                case "amount":
                    discount = discount + Number(checkCode.discount_max_price)
                    break;
                // case "same_price":
                //     discount = Number(initial_fee) - (Number(checkCode.discount_max_price))
                //     break;
                // case "free_":
                //     discount = Number(initial_fee) - (Number(checkCode.discount_max_price))
                //     break;
                default:
                    discount = 0;
            }


            const result = {
                _id: checkCode._id,
                code: codePromotion,
                title: checkCode.title,
                discount: Math.round(discount / 1000) * 1000,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async calculateEventPromotion(lang, infoJob, idCustomer) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer not fond')], HttpStatus.NOT_FOUND);
            // let my_promotion = [];
            // for (const item of getCustomer.my_promotion) {
            //     if((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
            //         my_promotion.push(item["id_promotion"])
            //     }
            // }
            const query: any = {
                $and: [
                    { type_promotion: "event" },
                    { price_min_order: { $lte: infoJob.initial_fee } },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_limit_date: true },
                                    { limit_start_date: { $lte: dateNow } },
                                    { limit_end_date: { $gte: dateNow } }
                                ]
                            },
                            {
                                $and: [
                                    { is_limit_date: false }
                                ]
                            }
                        ]
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_id_customer: true },
                                    { id_customer: { $in: getCustomer._id } },
                                ]
                            },
                            {
                                $and: [
                                    { is_id_customer: false },
                                ]
                            }
                        ]
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_id_group_customer: true },
                                    { id_group_customer: { $in: getCustomer.id_group_customer } },
                                ]
                            },
                            {
                                $and: [
                                    { is_id_group_customer: false },
                                ]
                            }
                        ]
                    },
                    {
                        service_apply: { $in: infoJob.service._id }
                    },
                    { is_enough_limit_used: false },
                    {
                        is_delete: false
                    },
                    {
                        is_active: true
                    },
                    {
                        brand: "guvi"
                    },
                    {
                        type_action: PROMOTION_ACTION_TYPE.use_in_app,
                    },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_loop: true },
                                    { is_turn_on_loop: true }
                                ]
                            },
                            {
                                is_loop: false
                            }
                        ]
                    },
                    {
                        $or: [
                            { is_apply_area: false },
                            {
                                $and: [
                                    { is_apply_area: true },
                                    { city: { $in: infoJob.city } }
                                ]
                            }
                        ]
                    }
                ]
            }
            const findPromotion = await this.promotionModel.find(query);
            const result = {
                event_promotion: []
            }
            for (const item of findPromotion) {
                let initial_fee = infoJob.initial_fee;
                let discount = 0;
                // //////////////////// Bắt đầu kiểm tra event của ngày làm /////////////////////////////////////////
                // if (item.type_date_apply === 'date_work') {
                //     // kiểm tra nếu loại ngày áp dụng khuyến mãi là ngày làm thì cần kiểm tra lại
                //     const format_date_work = await this.generalHandleService.formatDateWithTimeZone(new Date(infoJob.date_work_schedule[0]["date"]), item.timezone);
                //     const arr_day_apply = item.day_apply.filter(i => i["is_day_apply"] === true && i["day_local"] === format_date_work.day_of_week);
                //     // lọc ra mảng có ngày trùng với ngày làm dựa theo mảng các ngày trong tuần nhưng với điều kiện is_check_day_apply =  true;
                //     console.log('arr_day_apply ', arr_day_apply);

                //     if (arr_day_apply.length === 0) continue;
                //     let check_start_end_time_date_work = false;
                //     if (arr_day_apply.length > 0 && arr_day_apply[0]["time_apply"].length > 0) {
                //         check_start_end_time_date_work = arr_day_apply[0]["time_apply"].filter(i => i.start_time_local <= format_date_work.time && i.end_time_local >= format_date_work.time).length > 0;
                //         // kiểm tra ngày làm có nằm trong khoảng thời gian của ngày đó hay không. giả sử ko có khoảng thời gian thì mặc định là cả ngày
                //     }
                //     if (!check_start_end_time_date_work && arr_day_apply[0]["time_apply"].length > 0) continue;
                // }
                // //////////////////// Kết thúc kiểm tra event của ngày làm /////////////////////////////////////////

                const qeury2 = {
                    $and: [
                        { id_customer: getCustomer._id },
                        { event_promotion: { $elemMatch: { _id: item._id } } }
                    ]
                }
                const checkCountEvent2 = await this.orderModel.count(qeury2)
                if (item.is_limited_use === true && (Number(checkCountEvent2) > Number(item.limited_use) || Number(checkCountEvent2) === Number(item.limited_use))) continue;
                const qeury3 = {
                    $and: [
                        { event_promotion: { $elemMatch: { _id: item._id } } }
                    ]
                }
                const checkCountEvent3 = await this.orderModel.count(qeury3)
                if (item.is_limit_count === true && Number(checkCountEvent3) > Number(item.limit_count || Number(checkCountEvent3) === Number(item.limit_count))) continue;

                switch (item.discount_unit) {
                    case "percent":
                        discount = Number(initial_fee) * (Number(item.discount_value) / 100)
                        discount = (Number(discount) > Number(item.discount_max_price)) ? Number(item.discount_max_price) : Math.round(Number(discount));
                        break;
                    case "amount":
                        discount = (Number(item.discount_max_price))
                        break;
                    // case "same_price":
                    //     discount = Number(initial_fee) - (Number(item.discount_max_price))
                    //     break;
                    default:
                        discount = 0;
                }
                result.event_promotion.push({
                    _id: item._id,
                    title: item.title,
                    discount: Math.round(discount / 1000) * 1000
                })
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async exchangePoint(lang, idPromotion, user) {
        try {
            const getPromotion = await this.promotionModel.findById(idPromotion);
            if (!getPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const promotionPoints = Number(getPromotion.exchange_point);
            const promotionId = getPromotion._id;
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const previousPoint = {
                point: getCustomer.point
            }
            if (getPromotion.is_limit_count === true && (getPromotion.limit_count < getPromotion.total_used_promotion)) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.OVER_USE_PROMOTION, lang, null)], HttpStatus.BAD_REQUEST);
            }
            for (const item of getCustomer.my_promotion) {
                if (item["id_promotion"].toString().localeCompare(idPromotion) === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION_HAVE_BEEN_EXCHANGED, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const customerPoints = Number(getCustomer.point)
            const remainingPoints = customerPoints - promotionPoints;
            if (remainingPoints < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_POINTS, lang, null)], HttpStatus.BAD_REQUEST);
            const customerPromotion = getCustomer.my_promotion;
            for (let i = 0; i < customerPromotion.length; i++) {
                if (customerPromotion[i]["_id"].toString() === getPromotion._id.toString()) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION_EXISTED, lang, null)], HttpStatus.BAD_REQUEST);
                }
            }
            getCustomer.point = remainingPoints;
            const expDate = new Date(new Date(Date.now()).getTime() + getPromotion.exp_date_exchange * 24 * 60 * 60 * 1000);
            getCustomer.my_promotion.push({
                id_promotion: promotionId,
                status: "exchanged",
                exp_date: expDate.toISOString(),
                date_created: new Date(Date.now()).toISOString(),
                limit_used: 1,
                used: 0,
            })
            // }
            // getPromotion.limited_use += 1 --- chỉ cộng dồn lên khi khách hàng dùng mã cho Order
            await this.checkPromotion(lang, user, idPromotion); 
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            await getPromotion.save();
            this.activityCustomerSystemService.customerRedeemPointsByPromotion(user._id, getPromotion._id, promotionPoints, previousPoint);
            return getPromotion;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkPromotion(lang, user, idPromotion) {
        try {
            const dateNow = new Date(Date.now()).getTime()
            const getCustomer = await this.customerModel.findOne({ _id: user._id });
            const getPromotion = await this.promotionModel.findById(idPromotion)
            const customerPromotion = getCustomer.my_promotion
            // Check limit count
            if (getPromotion.is_limit_count === true && getPromotion.limited_use > getPromotion.limit_count) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.OVER_USE_PROMOTION, lang, null)], HttpStatus.BAD_REQUEST);
            }
            // Check limit date range
            const limit_end = new Date(getPromotion.limit_end_date).getTime();
            if (getPromotion.is_limit_date === true && dateNow >= limit_end) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.OVER_DATE, lang, null)], HttpStatus.BAD_REQUEST);
            }
        }
        catch (err) {
            console.log("check error: " + err)
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // khong dung nua
    async increaseTotalUsedPromotion(lang, user) {
        try {
            const arrItemOrder = await this.orderModel.findOne({ id_customer: user._id })
            const idPromotion = arrItemOrder.code_promotion["_id"]
            const arrItem = await this.promotionModel.find()
            for (let i = 0; i < arrItem.length; i++) {
                if (arrItem[i]._id = idPromotion)
                    arrItem[i].total_used_promotion += 1
                await arrItem[i].save()
                return arrItem[i];
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async increaseTotalUsedPromotionCode(lang, user, promotionCode) {
        try {
            const itemPromotion = await this.promotionModel.findById(promotionCode._id)
            if (!itemPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'promotion')], HttpStatus.NOT_FOUND);
            itemPromotion.total_used_promotion += 1
            if (itemPromotion.is_limit_count === true && !(itemPromotion.total_used_promotion < itemPromotion.limit_count)) {
                itemPromotion.is_enough_limit_used = true;
                itemPromotion.status = "out_of_stock"
            }
            if (itemPromotion.is_child_promotion === true) {
                await this.updateParrentPromotion(itemPromotion.parrent_promotion, 'increase');
            }
            await itemPromotion.save();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);

            for (let item of getCustomer.my_promotion) {
                if (item["id_promotion"].toString() === itemPromotion["_id"].toString()) {
                    item["used"] += 1;
                    await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async decreaseTotalUsedPromotionCode(lang, promotionCode, idCustomer) {
        try {
            const itemPromotion = await this.promotionModel.findById(promotionCode._id)
            if (!itemPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            itemPromotion.total_used_promotion -= 1
            if (itemPromotion.is_limit_count === true && itemPromotion.status === "out_of_stock" && (itemPromotion.total_used_promotion < itemPromotion.limit_count)) {
                itemPromotion.is_enough_limit_used = false;
                itemPromotion.status = "doing"
            }
            if (itemPromotion.is_child_promotion && itemPromotion.type_promotion === 'code') {
                await this.updateParrentPromotion(itemPromotion.parrent_promotion, 'decrease');
            }
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            for (let i = 0; i < getCustomer.my_promotion.length; i++) {
                if (getCustomer.my_promotion[i]["id_promotion"].toString() === itemPromotion._id.toString()) {
                    getCustomer.my_promotion[i]["limit_used"] -= 1;
                }
            }
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            await itemPromotion.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async decreaseTotalUsedPromotionEvent(lang, promotionEvent) {
        try {
            for (const item of promotionEvent) {
                const itemPromotion = await this.promotionModel.findById(item._id)
                if (!itemPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
                itemPromotion.total_used_promotion -= 1;
                if (itemPromotion.is_limit_count === true && itemPromotion.status === "out_of_stock" && (itemPromotion.total_used_promotion < itemPromotion.limit_count)) {
                    itemPromotion.is_enough_limit_used = false;
                    itemPromotion.status = "doing"
                }
                await itemPromotion.save();
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async increaseTotalUsedPromotionEvent(lang, user, promotionEvent) {
        try {
            for (const item of promotionEvent) {
                const itemPromotion = await this.promotionModel.findById(item._id)
                if (!itemPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
                itemPromotion.total_used_promotion += 1;
                if (itemPromotion.is_limit_count === true && !(itemPromotion.total_used_promotion < itemPromotion.limit_count)) {
                    itemPromotion.is_enough_limit_used = true;
                    itemPromotion.status = "out_of_stock"
                }
                await itemPromotion.save();
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async increaseTotalUsedCustomer(lang, user) {
        try {
            const arrItemOrder = await this.orderModel.findOne({ id_customer: user._id })
            const idPromotion = arrItemOrder.code_promotion["id"]

            const arrItem = await this.promotionModel.find()
            for (let i = 0; i < arrItem.length; i++) {
                if (arrItem[i]._id = idPromotion) {
                    arrItem[i].total_used_customer += 1
                }
                await arrItem[i].save()
                return arrItem[i];
            }
        } catch (err) {
            console.log(err, 'err 3')
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailPromotion(lang, idPromotion) {
        try {
            const getItem = await this.promotionModel.findById(idPromotion)
                .populate({ path: 'service_apply', select: { kind: 1, _id: 1, title: 1 } })
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async codeAvailable(lang, iPage: iPageDTO, brand, idService, userCustomer, address, admin?) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = (userCustomer._id) ? userCustomer : await this.customerRepositoryService.findOneById(userCustomer);

            // if(idCustomer) getCustomer = await this.customerModel.findById(idCustomer);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] > item["used"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                    my_promotion.push(item["id_promotion"])
                }
            }

            const query: any = {
                $and: [{
                    $or: [{
                        code: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { type_promotion: "code" },
                {
                    $or: [
                        {
                            $and: [
                                { is_exchange_point: false },
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { is_id_customer: true },
                                                { id_customer: { $in: getCustomer._id } },
                                            ]
                                        },
                                        {
                                            $and: [
                                                { is_id_customer: false },
                                            ]
                                        }
                                    ]
                                },
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { is_id_group_customer: true },
                                                { id_group_customer: { $in: getCustomer.id_group_customer } },
                                            ]
                                        },
                                        {
                                            $and: [
                                                { is_id_group_customer: false },
                                            ]
                                        },
                                    ]
                                },
                                {
                                    $or: [
                                        {
                                            $and: [
                                                { is_limit_date: true },
                                                { limit_start_date: { $lte: dateNow } },
                                                { limit_end_date: { $gte: dateNow } },
                                            ]
                                        },
                                        {
                                            $and: [
                                                { is_limit_date: false },
                                            ]
                                        }
                                    ]
                                },
                            ]
                        },
                        {
                            $and: [
                                { is_exchange_point: true },
                                { _id: { $in: my_promotion } }
                            ]
                        }
                    ]
                },
                { is_enough_limit_used: false },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                },
                {
                    type_action: PROMOTION_ACTION_TYPE.use_in_app,
                },
                {
                    is_parent_promotion: false,
                },
                {
                    is_child_promotion: false,
                },
                {
                    $or: [
                        {
                            $and: [
                                { is_loop: true },
                                { is_turn_on_loop: true }
                            ]
                        },
                        {
                            is_loop: false
                        }
                    ]
                },
                    // {
                    //     $or: [
                    //         { is_show_in_app: true },
                    //         { is_show_in_app: { $exists: false } }
                    //     ]
                    // }
                    // {
                    //     $or: [
                    //         { is_show_in_app: true },
                    //         { is_show_in_app: { $exists: false } }
                    //     ]
                    // }
                ]
            }

            if (address !== "") {
                // const tempAddress = address.split(",");
                // const tempAdministrative = {
                //     city: tempAddress[tempAddress.length - 1],
                //     district: tempAddress[tempAddress.length - 2]
                // }
                const resultCode = await this.generalHandleService.getCodeAdministrativeToString(address);
                query.$and.push({
                    $or: [
                        { is_apply_area: false },
                        {
                            $and: [
                                { is_apply_area: true },
                                { city: { $in: resultCode.city } }
                            ]
                        }
                    ]
                })
            }


            if (!admin) {
                query.$and.push({
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
                })
            }

            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })

            if (idService !== null) query.$and.push({ service_apply: { $in: idService } })

            const arrItem = await this.promotionModel.find(query)
                .sort({ position_view_payment: 1, date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            // const count = await this.promotionModel.count(query)

            const newArrPromotion = [];
            for (const item of arrItem) {
                const countUsedPrmotion = await this.groupOrderModel.count({ "code_promotion.code": item.code, id_customer: getCustomer._id, status: { $ne: "cancel" }, is_delete: false });
                if (item.is_limited_use === true && !(item.limited_use > countUsedPrmotion)) continue;
                newArrPromotion.push(item)
            }

            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: newArrPromotion.length,
                data: newArrPromotion
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async codeHasExchange(lang, iPage: iPageDTO, brand, user) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                    my_promotion.push(item["id_promotion"])
                }
            }
            const query = {
                $and: [{
                    $or: [{
                        code: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                { type_promotion: "code" },
                { _id: { $in: my_promotion } },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                }
                ]
            }
            const arrItem = await this.promotionModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.promotionModel.count(query)
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

    async checkLoopPromotion(idCustomer, currentdate) {
        try {
            let getDay = new Date(currentdate).getUTCDay();
            let getCurrentHour = new Date(currentdate).getUTCHours();
            let getCurrentMinute = new Date(currentdate).getUTCMinutes();
            let a: number = Number(`${getCurrentHour}${getCurrentMinute}`)
            let activeDate = new Date(currentdate).toLocaleDateString();
            let startDay = startOfDay(new Date(activeDate));
            let endDay = endOfDay(new Date(activeDate));

            let event = [];
            const queryLoop = {
                $and: [
                    { is_delete: false },
                    { type_promotion: 'event' },
                    { is_loop: true },
                    { day_loop: { $in: getDay } },
                    // { start_time_loop: { $lte: a } },
                    // { end_time_loop: { $gte: a } },
                    { status: "doing" },
                    { is_active: true },
                ]
            }
            const getLoopPromotion = await this.promotionModel.find(queryLoop)
            for (const item of getLoopPromotion) {
                const getGroupOrder = await this.groupOrderModel.findOne({
                    $and: [
                        { is_delete: false },
                        { id_customer: idCustomer },
                        { event_promotion: { $in: item._id } },
                        { date_create: { $gte: startDay, $lte: endDay } }
                    ]
                })
                if (!getGroupOrder) {
                    event.push(item);
                }
            }
            return event;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async renderPromotionCode(promotion) {
        try {
            const a = this.generalHandleService.renderCodePromotion();
            return a;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateParrentPromotion(code: string, increaseOrDecrease: string) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { code: code },
                    { is_parent_promotion: true }
                ]
            }
            const getPromotion = await this.promotionModel.findOne(query);
            if (increaseOrDecrease === 'increase') {
                getPromotion.total_used_promotion += 1;
            } else if (increaseOrDecrease === 'decrease') {
                getPromotion.total_used_promotion -= 1;
            }

            await getPromotion.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
