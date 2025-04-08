import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyArray, Model } from 'mongoose';
import { ERROR, GlobalService, GroupCustomer, GroupCustomerDocument, iPageDTO } from 'src/@core';
import { Promotion, PromotionDocument } from 'src/@core/db/schema/promotion.schema';
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema';
import { Order, OrderDocument } from 'src/@core/db/schema/order.schema';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { AuthService } from '../auth/auth.service';
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { TypePromotion, TypePromotionDocument } from 'src/@core/db/schema/type_promotion.schema';
import { GroupPromotion, GroupPromotionDocument } from 'src/@core/db/schema/group_promotion.schema';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

// import { GroupOrderService } from '../group-order/group-order.service';

@Injectable()
export class PromotionService {
    constructor(
        private globalService: GlobalService,
        private authService: AuthService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,



        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(GroupCustomer.name) private groupCustomerModel: Model<GroupCustomerDocument>,
        @InjectModel(GroupPromotion.name) private groupPromotionModel: Model<GroupPromotionDocument>,

    ) { }


    // async getForCustomer(lang, iPage: iPageDTO) {
    //     try {
    //         const query = {
    //             $and: [{
    //                 $or: [{
    //                     name: {
    //                         $regex: iPage.search,
    //                         $options: "i"
    //                     },
    //                 },]
    //             },
    //             ]
    //         }
    //         const arrItem = await this.promotionModel.find(query)
    //             .skip(iPage.start)
    //             .limit(iPage.length).then();
    //         const count = await this.promotionModel.count(query)
    //         const result = {
    //             start: iPage.start,
    //             length: iPage.length,
    //             totalItem: count,
    //             data: arrItem
    //         }
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
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
            // for (const item of getCustomer.my_promotion) {
            //     if(item["status"] === "exchanged" && new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime()) {
            //         my_promotion.push(item["id_promotion"])
            //     }
            // }

            // for (const item of getCustomer.my_promotion) {
            //     if((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
            //         my_promotion.push(item["id_promotion"])
            //     }
            // }


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
                },
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
                }

                ]
            }

            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })

            const arrItem = await this.promotionModel.find(query).sort({ date_create: -1, _id: 1 })
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
            const arrIdPromotion = [];
            for (let item of getCustomer.my_promotion) {
                if (item['status'] = 'exchanged') arrIdPromotion.push(item['id_promotion'].toString());
            }
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
                { _id: { $in: arrIdPromotion } },
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
                },
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
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
                },
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
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
                },
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
                }
                ]
            }

            // if(brand === "other") query.$and.push({brand: {$ne: "guvi"}})
            // if(brand === "guvi") query.$and.push({brand: "guvi"})
            const arrItem = await this.promotionModel.find(query).sort({ position: 1, _id: 1 })
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
                },
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
                }
                ]
            }


            const arrItem = await this.promotionModel.find(query).sort({ position: 1, _id: 1 })
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


    async calculateCodePromotion(lang, infoJob, codePromotion, getCustomer) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            // console.log(infoJob.service._id , 'infoJob.service._id ');
            // 6321598ea6c81260452bf4f5
            const checkCode = await this.promotionModel.findOne({
                $and: [
                    { code: codePromotion },
                    { is_parent_promotion: false },

                    // { price_min_order: { $lte: infoJob.initial_fee } },
                    {
                        $or: [
                            {
                                $and: [
                                    { is_limit_date: true },
                                    { limit_start_date: { $gte: dateNow } },
                                    { limit_end_date: { $lte: dateNow } }
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
                    // {
                    //     $and: [
                    //         { is_exchange_point: true },
                    //         { _id: { $in: my_promotion } }
                    //     ]
                    // },
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
                    }
                ]
            });

            const dateNowTime = new Date(dateNow).getTime();
            if (!checkCode) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }

            if (checkCode.price_min_order > infoJob.initial_fee) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_ENOUGH_PRICE, lang, null)], HttpStatus.BAD_REQUEST);
            }

            if (checkCode.is_exchange_point === true) {
                const myPromotion = getCustomer.my_promotion;
                const checkCodeOwned = myPromotion.findIndex(x => x.id_promotion.toString().localeCompare(checkCode._id.toString()) === 0);
                if (checkCodeOwned < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_OWNED, lang, null)], HttpStatus.BAD_REQUEST);
                else {
                    if (!(myPromotion[checkCodeOwned].limit_used < myPromotion[checkCodeOwned].limit_count) ||
                        dateNowTime > new Date(myPromotion[checkCodeOwned].exp_date).getTime()) {
                        throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    }
                }
            }

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
                discount: Math.floor(discount / 1000) * 1000,
                promotion: checkCode
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async calculateEventPromotion(lang, infoJob, user) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            // let my_promotion = [];
            // for (const item of getCustomer.my_promotion) {
            //     if((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
            //         my_promotion.push(item["id_promotion"])
            //     }
            // }
            console.log(infoJob.service._id, 'infoJob.service._id')
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
                    }
                ]
            }


            const findPromotion = await this.promotionModel.find(query).sort({
                position_view_payment: 1
            });
            const result = {
                event_promotion: []
            }

            for (const item of findPromotion) {
                let initial_fee = infoJob.initial_fee;
                let discount = 0;
                // console.log(item, "item");

                const qeury2 = {
                    $and: [
                        { id_customer: user._id },
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
                        discount = (Number(discount) > Number(item.discount_max_price)) ? Number(item.discount_max_price) : Number(discount);
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
                    discount: Math.floor(discount / 1000) * 1000
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

            // Check limit use of each customer  - Dùng trong lúc tạo Group Order
            // const isLimitedUse = getPromotion.is_limited_use
            // const limitedUsePromotion = getPromotion.limited_use
            // const limitedCountPromotion = getPromotion.limit_count
            // for (let i = 0; i < customerPromotion.length; i++) {
            //     console.log("check customerPromotion", customerPromotion)
            //     if (customerPromotion[i]["_id"] == getPromotion._id) {
            //         const limitedUseCustomer = customerPromotion[i]["limit_used"]
            //         const limitedCountCustomer = customerPromotion[i]["limit_count"]
            //         if (isLimitedUse === true && limitedUsePromotion >= limitedCountPromotion && limitedUseCustomer >= limitedCountCustomer) {
            //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.OVER_USE_PROMOTION, lang, null)], HttpStatus.BAD_REQUEST);
            //         }
            //     }
            // }

            // Promotion is expired (15 days) -> cronjob
            // const getPromotion = await this.promotionModel.findById(idPromotion)
            // const getCustomer = await this.customerModel.findById(user._id)
            // if (getPromotion.is_exchange_point === false) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.DONT_EXCHANGE_POINTS, lang, null)], HttpStatus.BAD_REQUEST);
            // }

            //  if (getPromotion.is_exchange_point === true) {
            //     const customerPromotion = getCustomer.my_promotion
            //     let resultPromotion = customerPromotion.map(a => a);
            //     let resultDateCreated = customerPromotion.map(a => a["date_created"]);
            //     for (let x = 0; x < resultPromotion.length; x++) {
            //         for (let y = 0; y < resultDateCreated.length; y++) {
            //             const date = new Date(resultDateCreated[y]).getTime();
            //             // const dateAfter15days = date + (15 * 86400000);
            //             const dateAfter15days = date + 1;

            //             const dateNow = new Date(Date.now()).getTime()
            //             if (dateNow > dateAfter15days && resultPromotion[x]["status"] === "exchanged") {
            //                 const newArrPromotion = resultPromotion.filter(resultPromotion => {
            //                     return resultPromotion["status"] !== "exchanged";
            //                 });
            //                 getCustomer.my_promotion = [...newArrPromotion];
            //                 console.log(" check new array", newArrPromotion)
            //                 await getCustomer.save()
            //                 return getCustomer
            //             }
            //         }
            //     }
            // }


        }
        catch (err) {
            console.log("check error: " + err)
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async checkPromotion(lang, user) {
    //     try {
    //         const limitCountPromotion = await this.getLimitCount(lang, user)
    //         const limitUsedPromotion = await this.getLimitUsed(lang, user)
    //         const arrItemPromotion = await this.promotionModel.find({ id_customer: user._id }, "_id")
    //         let idPromotion = []
    //         for (let i = 0; i < arrItemPromotion.length; i++) {
    //             idPromotion.push(arrItemPromotion[i]["_id"]);
    //         }
    //         const getGroupOrder = await this.groupOrderModel.find({ id_customer: user._id }, "code_promotion._id")
    //         let idCodePromotion = []
    //         for (let i = 0; i < getGroupOrder.length; i++) {
    //             idCodePromotion.push(getGroupOrder[i]["code_promotion"]["_id"]);
    //         }
    //         const query = {
    //             $and: [
    //                 { is_exchange_point: false },
    //                 { is_limit_count: true },
    //                 { is_limited_use: true },
    //                 { _id: idCodePromotion },
    //                 {
    //                     $and: [
    //                         { total_used_promotion: { $lt: limitCountPromotion } },
    //                     ]
    //                 },
    //                 {
    //                     $and: [
    //                         { total_used_customer: { $lt: limitUsedPromotion } },
    //                     ]
    //                 },
    //                 {
    //                     $and: [
    //                         { type_discount: "same_price" },
    //                     ]
    //                 }
    //             ]
    //         }
    //         const arrItem = await this.promotionModel.find(query)
    //         for (let i = 0; i < getGroupOrder.length; i++) {
    //             for (let j = 0; j < arrItem.length; j++) {
    //                 getGroupOrder[i]["final_fee"] = arrItem[j]["discount_value"]
    //                 await getGroupOrder[i].save()
    //                 return getGroupOrder[i]["final_fee"]
    //             }
    //         }
    //     }
    //     catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // khong dung nua
    async increaseTotalUsedPromotion(lang, user) {
        try {

            const arrItemOrder = await this.orderModel.findOne({ id_customer: user._id })
            console.log(arrItemOrder, 'arrItemOrder')
            const idPromotion = arrItemOrder.code_promotion["_id"]
            console.log(idPromotion, 'idPromotion');


            const arrItem = await this.promotionModel.find()

            console.log(arrItem, 'arrItem');

            for (let i = 0; i < arrItem.length; i++) {

                console.log(arrItem[i], 'arrItem[i]')

                if (arrItem[i]._id = idPromotion)
                    arrItem[i].total_used_promotion += 1
                await arrItem[i].save()
                return arrItem[i];
            }
        } catch (err) {
            console.log(err, 'err 2')
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async increaseTotalUsedPromotionCode(lang, user, promotionCode) {
        try {

            const itemPromotion = await this.promotionModel.findById(promotionCode._id)
            if (!itemPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            itemPromotion.total_used_promotion += 1
            if (itemPromotion.is_limit_count === true && !(itemPromotion.total_used_promotion < itemPromotion.limit_count)) {
                itemPromotion.is_enough_limit_used = true;
                itemPromotion.status = "out_of_stock"
            }
            await itemPromotion.save();
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



    async codeAvailable(lang, iPage: iPageDTO, brand, idService, user) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
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
                }
                ]
            }

            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })

            if (idService !== null) query.$and.push({ service_apply: { $in: idService } })

            const arrItem = await this.promotionModel.find(query)
                .sort({ date_create: -1, _id: 1 })
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

            console.log(my_promotion, 'my_promotion')

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


    async getExchangePointForCustomerV2(lang, iPage: iPageDTO, user, brand) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                my_promotion.push(item["id_promotion"])
            }
            const query: any = {
                $and: [
                    {
                        $or: [{
                            name: {
                                $regex: iPage.search,
                                $options: "i"
                            },
                        },]
                    },
                    { _id: { $nin: my_promotion } },
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
                                is_limit_date: false
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
                    {
                        $or: [
                            { is_show_in_app: true },
                            { is_show_in_app: { $exists: false } }
                        ]
                    }
                ]
            }

            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })

            const arrItem = await this.promotionModel.find(query).sort({ date_create: -1, _id: 1 })
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

    async getPrmotionCodeForCustomerPaymentV2(lang, iPage: iPageDTO) {
        try {
            const dateNow = new Date(Date.now()).toISOString();

            // const get

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
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
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

    async getCodeForCustomerV2(lang, iPage: iPageDTO, user) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const arrIdPromotion = [];
            for (let item of getCustomer.my_promotion) {
                if (item['status'] === 'exchanged') arrIdPromotion.push(item['id_promotion'].toString());
            }
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
                { _id: { $in: arrIdPromotion } },
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
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
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

    async getListPromotionV2(lang, iPage: iPageDTO, user, id_group_promotion, brand) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                    my_promotion.push(item["id_promotion"])
                }
            }
            let query: any = {
                $and: [
                    // loại bỏ các promotion có trong tài khoản
                    { _id: { $not: { $in: my_promotion } } },
                    {
                        $or: [
                            {
                                code: {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            }
                        ]
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
                    // { // tạm thời bỏ đk này , hiển thị khuyến mãi BK cho các rank khách coi và ngược lại
                    //     $or: [
                    //         {
                    //             $and: [
                    //                 { is_id_group_customer: true },
                    //                 { id_group_customer: { $in: getCustomer.id_group_customer } },
                    //             ]
                    //         },
                    //         {
                    //             $and: [
                    //                 { is_id_group_customer: false },
                    //             ]
                    //         }
                    //     ]
                    // },
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
                    {
                        $or: [
                            { is_show_in_app: true },
                            { is_show_in_app: { $exists: false } }
                        ]
                    }
                ]
            }

            // if(brand === "other") query.$and.push({brand: {$ne: "guvi"}})
            // if(brand === "guvi") query.$and.push({brand: "guvi"})
            if (brand !== '') {
                query.$and.push({ brand: brand })
            }
            if (id_group_promotion !== '') {
                query.$and.push({ id_group_promotion: id_group_promotion })
                query.$and[5] = { brand: { $ne: 'guvi' } }
            }
            const arrItem = await this.promotionModel.find(query)
                // .select({_id: 1, title: 1, thumbnail: 1, image_background: 1, limit_start_date: 1, 
                //     limit_end_date: 1, is_limit_date: 1, service_apply: 1})
                .sort({ position: 1, _id: 1 })
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

    async getListPromotionGuestV2(lang, iPage: iPageDTO, id_group_promotion: string) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            let query: any = {
                $and: [
                    {
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
                    // { is_id_group_customer: false },
                    { brand: "guvi" },
                    { is_enough_limit_used: false },
                    {
                        is_delete: false,
                    },
                    {
                        is_active: true,
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
                    {
                        $or: [
                            { is_show_in_app: true },
                            { is_show_in_app: { $exists: false } }
                        ]
                    }
                ]
            }
            if (id_group_promotion !== '') query.$and.push({ id_group_promotion: id_group_promotion })
            const arrItem = await this.promotionModel.find(query)
                // .select({_id: 1, title: 1, thumbnail: 1, image_background: 1, limit_start_date: 1, 
                //     limit_end_date: 1, is_limit_date: 1, service_apply: 1})
                .sort({ position: 1, _id: 1 })
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

    async codeHasExchangeV2(lang, iPage: iPageDTO, brand, user) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] > item["used"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
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
                },
                {
                    is_parent_promotion: false,
                },
                {
                    is_child_promotion: false,
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

    async codeAvailableV2(lang, iPage: iPageDTO, brand, idService, user) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
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
                {
                    $or: [
                        { is_show_in_app: true },
                        { is_show_in_app: { $exists: false } }
                    ]
                }
                ]
            }

            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })

            if (idService !== null) query.$and.push({ service_apply: { $in: idService } })

            const arrItem = await this.promotionModel.find(query)
                .sort({ date_create: -1, _id: 1 })
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

    async getListGroupPromotion(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true }
                ]
            }
            const arrItem = await this.groupPromotionModel.find(query)
                .sort({ position: 1, date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.groupPromotionModel.count(query)
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


    async getListPromotionByBrand(lang, iPage: iPageDTO, user, brand: string) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                    my_promotion.push(item["id_promotion"])
                }
            }
            let query: any = {
                $and: [
                    // loại bỏ các promotion có trong tài khoản
                    // { _id: { $not: { $in: my_promotion } } },
                    {
                        $or: [
                            { is_exchange_point: false },
                            {
                                $and: [
                                    { is_exchange_point: true },
                                    { _id: { $in: my_promotion } }
                                ]
                            }
                        ]
                    },
                    {
                        $or: [
                            {
                                code: {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            }
                        ]
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
                    { is_enough_limit_used: false },
                    {
                        is_delete: false,
                    },
                    {
                        is_active: true,
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
                    {
                        $or: [
                            { is_show_in_app: true },
                            { is_show_in_app: { $exists: false } }
                        ]
                    }
                ]
            }
            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })
            if (brand !== "other" && brand !== "guvi" && brand !== "") query.$and.push({ brand: brand });
            const arrItem = await this.promotionModel.find(query)
                .sort({ position: 1, _id: 1 })
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

    async getMyListPromotion(lang, iPage: iPageDTO, user, brand: string) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const my_promotion = [];
            const has_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if (item["status"] === "is_exchange_point" && item["exp_date"] < dateNow && item["used"] < item["limit_used"]) {
                    // nếu promotion đã được KH đổi thì sẽ được thêm vào danh sách khuyến mãi của khách hàng
                    // và cần đạt được thêm 3 điều kiện nữa
                    // trạng thái của item phải là is_exchange_point
                    // hạn sử dụng "exp_date" phải nhỏ hơn thời gian hiện tại
                    // số lần sử dụng "used" phải nhỏ hơn tổng số lần được sử dụng "limit_used"
                    has_promotion.push(item["id_promotion"]);
                }
                if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                    my_promotion.push(item["id_promotion"])
                }
            }
            let query: any = {
                $and: [
                    // loại bỏ các promotion có trong tài khoản
                    // { _id: { $not: { $in: my_promotion } } },
                    {is_show_in_app: true},
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
                    { is_enough_limit_used: false },
                    {
                        is_delete: false,
                    },
                    {
                        is_active: true,
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
                    {
                        $or: [
                            {
                                $and: [
                                    { is_exchange_point: true },
                                    { _id: { $in: has_promotion } },
                                ]
                            },
                            { is_exchange_point: false },
                        ]
                    }
                ]
            }
            if (brand === "other") query.$and.push({ brand: { $ne: "guvi" } })
            if (brand === "guvi") query.$and.push({ brand: "guvi" })
            const arrItem = await this.promotionModel.find(query)
                .sort({ position: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.promotionModel.count(query)

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
}
