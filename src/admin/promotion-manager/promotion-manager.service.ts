import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { activePromotionDTOAdmin, Collaborator, CollaboratorDocument, createPromotionDTOAdmin, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, editPromotionDTOAdmin, ERROR, GlobalService, GroupCustomer, GroupCustomerDocument, HistoryActivity, HistoryActivityDocument, iPageDTO, iPagePromotionDTOAdmin, iPageUsedPromotionDTOAdmin, Order, OrderDocument, querySetupPositionPromotion, updatePositionPromotion } from 'src/@core'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Promotion, PromotionDocument } from 'src/@core/db/schema/promotion.schema'
import { createNotificationDTOAdmin } from 'src/@core/dto/notification.dto'
import { PROMOTION_ACTION_TYPE } from 'src/@repositories/module/mongodb/@database/enum'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service'
import { NotificationSystemService } from 'src/core-system/notification-system/notification-system.service'
import { PromotionSystemService } from 'src/core-system/promotion-system/promotion-system.service'
import { GeneralHandleService } from '../../@share-module/general-handle/general-handle.service'
import { ActivitySystemService } from '../../core-system/activity-system/activity-system.service'

@Injectable()
export class PromotionManagerService implements OnApplicationBootstrap {
    constructor(
        private globalService: GlobalService,
        private notificationSystemService: NotificationSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private promotionSystemService: PromotionSystemService,
        private generalHandleService: GeneralHandleService,
        private activitySystemService: ActivitySystemService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,

        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(GroupCustomer.name) private groupCustomerModel: Model<GroupCustomerDocument>,




    ) { }


    async onApplicationBootstrap(): Promise<any> {
        // const checkItemSeed = await this.promotionModel.updateMany({brand: {$exists: true}}, {brand: })
        // const getArrItems = await this.promotionModel.find();
        // for(const item of getArrItems) {
        //     item.brand = item.brand.toLowerCase();
        //     item.save();
        // }
    }

    async getListItem(lang, iPage: iPagePromotionDTOAdmin, status, id_service, exchange, id_group_promotion) {
        try {
            let query: any = {
                $and: [
                    {
                        // $or: [
                        //     {
                        //         "title.vi": new RegExp(iPage.search, 'i')
                        //     },
                        //     {
                        //         code: new RegExp(iPage.search, 'i')
                        //     }
                        // ]
                        $or: [
                            {
                                "title.vi": {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            },
                            {
                                "title.en": {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            },
                            {
                                code: {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            },
                        ]
                    },
                    {
                        is_delete: false,
                    },
                ]
            }
            if (id_service !== "") query.$and.push({ service_apply: { $eq: id_service } });
            if (status !== null) query.$and.push({ status: status });
            if (iPage.typeSort === 'code') {
                query.$and.push({ type_promotion: iPage.typeSort });
                if (iPage.brand === 'guvi') {
                    query.$and.push({ brand: 'guvi' });
                } else {
                    query.$and.push({ brand: { $nin: 'guvi' } });
                }
                if (exchange === 'exchange') {
                    query.$and.push({ is_exchange_point: true });
                } else if (exchange === 'no_exchange') {
                    query.$and.push({ is_exchange_point: false });
                }
            } else if (iPage.typeSort === 'event') {
                query.$and.push({ type_promotion: iPage.typeSort });
            }
            if (iPage.search === "") {
                query.$and.push({
                    $or: [
                        {
                            $and: [
                                {
                                    is_parent_promotion: false,
                                },
                                {
                                    is_child_promotion: false,
                                }
                            ]
                        },
                        {
                            $and: [
                                {
                                    is_parent_promotion: true,
                                },
                                {
                                    is_child_promotion: false,
                                }
                            ]
                        }
                    ]
                },);
            }
            if (id_group_promotion !== "") query.$and.push({ id_group_promotion: id_group_promotion });
            const sort = {}
            sort[iPage.fieldSort] = iPage.valueSort

            const arrItem = await this.promotionModel.find(query)
                .sort({ [iPage.fieldSort]: iPage.valueSort === "1" ? 1 : -1 })
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


    async getDetailItem(lang, id: string) {
        try {
            const findItem = await this.promotionModel.findById(id)
                .populate({ path: 'id_customer', select: { _id: 1, id_view: 1, full_name: 1, phone: 1, code_phone_area: 1, } })
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createPromotionDTOAdmin, idAdmin: string) {
        try {
            const checkCodeExistedCode = await this.promotionModel.findOne({ $and: [{ code: payload.code }, { type_promotion: payload.type_promotion }, { is_delete: false }] });
            if (checkCodeExistedCode && checkCodeExistedCode.type_promotion === "code") {
                if ((payload.code === "" || payload.code === checkCodeExistedCode.code)) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_EXISTS_CODE, lang, "code")], HttpStatus.BAD_REQUEST);
                }
            }
            if (payload.service_apply.length > 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.SERVICE_APPLY_NOT_MULTI_ITEM, lang, "service_apply")], HttpStatus.BAD_REQUEST);
            // if (payload.is_loop === true && payload.type_promotion === "code") {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.PROMOTION_NOT_WORKING_WITH_CODE, lang, "is_loop")], HttpStatus.BAD_REQUEST);
            // }
            const dateNow = new Date(Date.now()).getTime();
            const startLimitDate = new Date(payload.limit_start_date).getTime()
            const newItem = new this.promotionModel({
                code: payload.code,
                title: payload.title,
                short_description: payload.short_description,
                description: payload.description,
                thumbnail: payload.thumbnail,
                image_background: payload.image_background,
                is_limit_date: payload.is_limit_date,
                limit_start_date: (payload.is_limit_date === true) ? payload.limit_start_date : null,
                limit_end_date: (payload.is_limit_date === true) ? payload.limit_end_date : null,
                is_limit_count: payload.is_limit_count,
                limit_count: payload.limit_count,
                service_apply: payload.service_apply,
                id_group_customer: payload.id_group_customer || [],
                id_customer: payload.id_customer || [],
                is_limited_use: payload.is_limited_use,
                limited_use: payload.limited_use,
                type_discount: payload.type_discount,
                type_promotion: payload.type_promotion,
                price_min_order: payload.price_min_order,
                discount_unit: payload.discount_unit,
                discount_value: payload.discount_value,
                discount_max_price: payload.discount_max_price,
                is_exchange_point: payload.is_exchange_point,
                exchange_point: payload.exchange_point,
                brand: (payload.brand) ? payload.brand.toLowerCase() : "guvi",
                is_id_customer: payload.is_id_customer,
                is_id_group_customer: payload.is_id_group_customer,
                exp_date_exchange: payload.exp_date_exchange,
                position: payload.position,
                status: (payload.is_limit_date === true && dateNow < startLimitDate) ? "upcoming" : "doing",
                is_payment_method: payload.is_payment_method,
                payment_method: payload.payment_method,
                is_loop: payload.is_loop ? payload.is_loop : false,
                day_loop: payload.day_loop ? payload.day_loop : [],
                start_time_loop: payload.start_time_loop ? payload.start_time_loop : null,
                end_time_loop: payload.end_time_loop ? payload.end_time_loop : null,
                position_view_payment: payload.position_view_payment ? payload.position_view_payment : 0,
                is_parent_promotion: payload.is_parent_promotion ? payload.is_parent_promotion : false,
                total_child_promotion: payload.total_child_promotion ? payload.total_child_promotion : 0,
                is_turn_on_loop: payload.is_turn_on_loop ? payload.is_turn_on_loop : false,
                is_show_in_app: payload.is_show_in_app,
                date_create: new Date(Date.now()).toISOString(),
                city: (payload.is_apply_area === true) ? payload.city : [],
                district: (payload.is_apply_area === true) ? payload.district : [],
                is_apply_area: payload.is_apply_area ? payload.is_apply_area : false,
                id_group_promotion: payload.id_group_promotion,
                timezone: payload.timezone,
                type_date_apply: payload.type_date_apply,
                day_apply: payload.day_apply,
                is_affiliate: payload.is_affiliate || false,
                type_action: payload.type_action || PROMOTION_ACTION_TYPE.use_in_app,
            })
            const result = await newItem.save();
            await this.activityAdminSystemService.createPromotion(idAdmin, newItem._id);
            if (result.is_parent_promotion && result.total_child_promotion > 0) {
                await this.renderPromotion(result._id);
            }
            if (payload.send_notification === true) { // tính năng này đang bị sai nhưng vẫn tận dụng được 
                const title = { // tận dụng cho việc gửi vào mục thông báo tạo notification cho chung tất cả các KH
                    vi: `${result.title.vi}`,
                    en: `${result.title.en}`
                }
                const description = {
                    vi: `${result.short_description.vi}`,
                    en: `${result.short_description.en}`
                }
                const payloadNotification: createNotificationDTOAdmin = {
                    title: title,
                    description: description,
                    type_notification: "promotion",
                    id_customer: '',
                    id_promotion: result._id
                }
                await this.notificationSystemService.newActivity(payloadNotification);
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async editItem(lang, payload: editPromotionDTOAdmin, id: string) {
    //     try {

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

    //     }
    // }

    async editItem(lang, payload: editPromotionDTOAdmin, id: string, idAdmin: string) {
        try {
            const query = {
                $and: [
                    {
                        _id: { $ne: id }
                    },
                    {
                        code: payload.code,
                    },
                    {
                        type_promotion: "code",
                    },
                    {
                        is_delete: false,
                    }
                ]
            }
            // const checkCodeExisted = await this.promotionModel.findOne({ _id: { $ne: id }, code: payload.code, type_promotion: "code" });
            const checkCodeExisted = await this.promotionModel.findOne(query);
            console.log('check =>>>>> ', checkCodeExisted);

            if (checkCodeExisted) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_EXISTS, lang, "code")], HttpStatus.BAD_REQUEST);
            }
            if (payload.service_apply.length > 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.SERVICE_APPLY_NOT_MULTI_ITEM, lang, "service_apply")], HttpStatus.BAD_REQUEST);
            const getItem = await this.promotionModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.code = payload.code || getItem.code;
            getItem.title = payload.title || getItem.title;
            getItem.short_description = payload.short_description || getItem.short_description;
            getItem.description = payload.description || getItem.description;
            getItem.thumbnail = payload.thumbnail || getItem.thumbnail;
            getItem.image_background = payload.image_background || getItem.image_background;
            // getItem.is_limit_date = payload.is_limit_date || getItem.is_limit_date;
            getItem.is_limit_date = (payload.is_limit_date !== getItem.is_limit_date) ? payload.is_limit_date : getItem.is_limit_date
            getItem.limit_start_date = payload.limit_start_date || getItem.limit_start_date;
            getItem.limit_end_date = payload.limit_end_date || getItem.limit_end_date;
            // getItem.is_limit_count = payload.is_limit_count || getItem.is_limit_count;
            getItem.is_limit_count = (payload.is_limit_count !== getItem.is_limit_count) ? payload.is_limit_count : getItem.is_limit_count
            getItem.limit_count = payload.limit_count || getItem.limit_count;
            getItem.service_apply = payload.service_apply || getItem.service_apply;
            getItem.id_group_customer = payload.id_group_customer || getItem.id_group_customer;
            // getItem.is_limited_use = payload.is_limited_use || getItem.is_limited_use;
            getItem.is_limited_use = (payload.is_limited_use !== getItem.is_limited_use) ? payload.is_limited_use : getItem.is_limited_use
            getItem.limited_use = payload.limited_use || getItem.limited_use;
            getItem.type_discount = payload.type_discount || getItem.type_discount;
            getItem.type_promotion = payload.type_promotion || getItem.type_promotion;
            getItem.price_min_order = payload.price_min_order || getItem.price_min_order;
            getItem.discount_unit = payload.discount_unit || getItem.discount_unit;
            getItem.discount_value = payload.discount_value || getItem.discount_value;
            getItem.discount_max_price = payload.discount_max_price || getItem.discount_max_price;
            // getItem.is_delete = payload.is_delete || getItem.is_delete;
            getItem.is_delete = (payload.is_delete !== getItem.is_delete) ? payload.is_delete : getItem.is_delete
            // getItem.is_exchange_point = payload.is_exchange_point || getItem.is_exchange_point
            getItem.is_exchange_point = (payload.is_exchange_point !== getItem.is_exchange_point) ? payload.is_exchange_point : getItem.is_exchange_point
            getItem.exchange_point = payload.exchange_point || getItem.exchange_point
            getItem.brand = (payload.brand) ? payload.brand.toLowerCase() : getItem.brand
            getItem.id_customer = payload.id_customer || getItem.id_customer
            getItem.is_id_customer = (payload.is_id_customer !== getItem.is_id_customer) ? payload.is_id_customer : getItem.is_id_customer
            getItem.is_id_group_customer = (payload.is_id_group_customer !== getItem.is_id_group_customer) ? payload.is_id_group_customer : getItem.is_id_group_customer
            getItem.exp_date_exchange = payload.exp_date_exchange || getItem.exp_date_exchange
            getItem.position = payload.position || getItem.position
            if (getItem.is_limit_count === true && !(getItem.total_used_promotion < getItem.limit_count)) {
                getItem.is_enough_limit_used = true;
            } else {
                getItem.is_enough_limit_used = false;
            }
            if (getItem.is_limit_date === true) {

            }
            const dateNow = new Date(Date.now()).getTime();
            const limitDateEnd = new Date(getItem.limit_end_date).getTime();
            const limitDateStart = new Date(getItem.limit_start_date).getTime();
            getItem.is_payment_method = payload.is_payment_method || getItem.is_payment_method;
            getItem.payment_method = payload.payment_method || getItem.payment_method;

            if (getItem.is_active === true) getItem.status = "doing";
            if (getItem.is_limit_date === true && dateNow < limitDateStart) getItem.status = "upcoming";
            if (getItem.is_limit_date === true && limitDateStart < dateNow && dateNow < limitDateEnd) getItem.status = "doing";
            if (getItem.is_limit_date === true && limitDateEnd < dateNow) getItem.status = "out_of_date";
            if (getItem.is_limit_count === true && getItem.is_enough_limit_used === true) getItem.status = "out_of_stock";
            if (getItem.is_active === false) getItem.status = "done";
            getItem.position_view_payment = payload.position_view_payment ? payload.position_view_payment : getItem.position_view_payment;

            const result = await getItem.save();
            await this.activityAdminSystemService.editPromotion(idAdmin, getItem._id);
            return getItem
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async activeItem(lang, payload: activePromotionDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.promotionModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active;
            getItem.status = (getItem.is_active === false) ? "done" : "doing";
            await getItem.save();
            await this.activityAdminSystemService.actiPromotion(idAdmin, getItem._id);
            if (getItem.is_parent_promotion) {
                await this.activeChildPromotion(getItem, payload, idAdmin)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteSoftItem(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.promotionModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            if (getItem.is_parent_promotion && getItem.is_delete === true) {
                await this.deleteChildPromotion(idAdmin, getItem);
            }
            await this.activityAdminSystemService.deletePromotion(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async historyActivity(lang, id: string, iPage: iPageDTO) {
        try {
            const getItem = await this.promotionModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const query = {
                $and: [
                    { is_delete: false },
                    { id_promotion: getItem._id }
                ]
            }
            const histortActivityPromotion = await this.historyActivityModel.find({ id_promotion: getItem._id })
                .sort({ date_create: -1, _id: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.historyActivityModel.count({ id_promotion: getItem._id });
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: histortActivityPromotion
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async codeAvailable(lang, iPage: iPageDTO, brand, idCustomer, idAdmin, idService) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const my_promotion = [];
            for (const item of getCustomer.my_promotion) {
                if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                    my_promotion.push(item["id_promotion"])
                }
            }

            let query: any = {
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
                { is_parent_promotion: false },
                { is_child_promotion: false },
                { is_enough_limit_used: false },
                {
                    is_delete: false,
                },
                {
                    is_active: true,
                },
                // { id_service: id_service }

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

            // if(brand === "other") query.$and.push({brand: {$ne: "guvi"}})
            if (brand === "guvi") query.$and.push({ brand: "guvi" });

            // if (id_service !== "") query.$and.push({ id_service: id_service });
            // console.log('>>> ', query.$and[6]);
            if (idService !== null) query.$and.push({ service_apply: { $in: idService } })
            const arrItem = await this.promotionModel.find(query).sort({ date_create: -1 })
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

    async detailUsedPromotion(lang, id: string, iPage: iPageUsedPromotionDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                ]
            }
            const getPromotion = await this.promotionModel.findById(id);
            if (!getPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getPromotion.type_promotion === 'code') {
                query.$and.push({
                    "code_promotion._id": getPromotion._id,
                })
            } else if (getPromotion.type_promotion === 'event') {
                query.$and.push({
                    "event_promotion._id": getPromotion._id,
                })
            }
            if (iPage.status === "cancel") {
                query.$and.push({
                    status: "cancel"
                });
            } else if (iPage.status === "pending") {
                query.$and.push({
                    status: { $in: ["pending", "doing", "confirm"] }
                });
            } else if (iPage.status === "done") {
                query.$and.push({
                    status: "done"
                });
            }
            const getGroupOrder = await this.groupOrderModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1, id_view: -1 });
            const count = await this.groupOrderModel.count(query);
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getGroupOrder
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async renderPromotion(idPromotion) {
        try {
            const getPromotion = await this.promotionModel.findById(idPromotion);
            if (!getPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.BAD_REQUEST);
            if (!getPromotion.is_parent_promotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.BAD_REQUEST);

            for (let i = 0; i < getPromotion.total_child_promotion; i++) {
                let temp = '';
                let checkCode = false;
                do {
                    temp = await this.generalHandleService.renderCodePromotion();
                    const get = await this.promotionModel.findOne({
                        is_delete: false,
                        code: `${getPromotion}${temp}`
                    })
                    if (get) {
                        checkCode = true;
                    }
                } while (checkCode || temp === '')
                const dateNow = new Date(Date.now()).getTime();
                const startLimitDate = new Date(getPromotion.limit_start_date).getTime()
                const newItem = new this.promotionModel({
                    code: `${getPromotion.code}${temp}`,
                    title: getPromotion.title,
                    short_description: getPromotion.short_description,
                    description: getPromotion.description,
                    thumbnail: getPromotion.thumbnail,
                    image_background: getPromotion.image_background,
                    is_limit_date: getPromotion.is_limit_date,
                    limit_start_date: (getPromotion.is_limit_date === true) ? getPromotion.limit_start_date : null,
                    limit_end_date: (getPromotion.is_limit_date === true) ? getPromotion.limit_end_date : null,
                    is_limit_count: true,
                    limit_count: 1,
                    service_apply: getPromotion.service_apply,
                    id_group_customer: getPromotion.id_group_customer || [],
                    id_customer: getPromotion.id_customer || [],
                    is_limited_use: true,
                    limited_use: 1,
                    type_discount: getPromotion.type_discount,
                    type_promotion: getPromotion.type_promotion,
                    price_min_order: getPromotion.price_min_order,
                    discount_unit: getPromotion.discount_unit,
                    discount_value: getPromotion.discount_value,
                    discount_max_price: getPromotion.discount_max_price,
                    is_exchange_point: getPromotion.is_exchange_point,
                    exchange_point: getPromotion.exchange_point,
                    brand: "guvi",
                    is_id_customer: getPromotion.is_id_customer,
                    is_id_group_customer: getPromotion.is_id_group_customer,
                    exp_date_exchange: getPromotion.exp_date_exchange,
                    position: getPromotion.position,
                    status: (getPromotion.is_limit_date === true && dateNow < startLimitDate) ? "upcoming" : "doing",
                    is_payment_method: getPromotion.is_payment_method,
                    payment_method: getPromotion.payment_method,
                    is_loop: getPromotion.is_loop ? getPromotion.is_loop : false,
                    day_loop: getPromotion.day_loop ? getPromotion.day_loop : [],
                    start_time_loop: getPromotion.start_time_loop ? getPromotion.start_time_loop : null,
                    end_time_loop: getPromotion.end_time_loop ? getPromotion.end_time_loop : null,
                    position_view_payment: getPromotion.position_view_payment ? getPromotion.position_view_payment : 0,
                    is_parent_promotion: false,
                    total_child_promotion: 0,
                    is_child_promotion: true,
                    parrent_promotion: getPromotion.code,
                    date_create: new Date(Date.now()).toISOString(),
                })
                await newItem.save();
                // this.activitySystemService.systemCreatePromotion(newItem._id);
                getPromotion.child_promotion.push(newItem.code);
                await getPromotion.save();
            }
        } catch (err) {

            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItemV2(lang, payload: editPromotionDTOAdmin, id: string, idAdmin: string) {

        try {
            const query = {
                $and: [
                    {
                        _id: { $ne: id }
                    },
                    {
                        code: payload.code,
                    },
                    {
                        type_promotion: "code",
                    },
                    {
                        is_delete: false,
                    }
                ]
            }
            const checkCodeExisted = await this.promotionModel.findOne(query);
            if (checkCodeExisted) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_EXISTS, lang, "code")], HttpStatus.BAD_REQUEST);
            }
            if (payload.service_apply.length > 1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PROMOTION.SERVICE_APPLY_NOT_MULTI_ITEM, lang, "service_apply")], HttpStatus.BAD_REQUEST);
            const getItem = await this.promotionModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.is_child_promotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.is_parent_promotion) {
                await this.updateParrentPromotion(getItem, payload);
            } else {
                getItem.code = payload.code || getItem.code;
                getItem.title = payload.title || getItem.title;
                getItem.short_description = payload.short_description || getItem.short_description;
                getItem.description = payload.description || getItem.description;
                getItem.thumbnail = payload.thumbnail || getItem.thumbnail;
                getItem.image_background = payload.image_background || getItem.image_background;

                // getItem.is_limit_date = payload.is_limit_date || getItem.is_limit_date;
                getItem.is_limit_date = (payload.is_limit_date !== getItem.is_limit_date) ? payload.is_limit_date : getItem.is_limit_date
                getItem.limit_start_date = payload.limit_start_date || getItem.limit_start_date;
                getItem.limit_end_date = payload.limit_end_date || getItem.limit_end_date;
                if (getItem.is_limit_date === false) {
                    getItem.limit_start_date = null;
                    getItem.limit_end_date = null;
                }
                // getItem.is_limit_count = payload.is_limit_count || getItem.is_limit_count;
                getItem.is_limit_count = (payload.is_limit_count !== getItem.is_limit_count) ? payload.is_limit_count : getItem.is_limit_count
                getItem.limit_count = payload.limit_count || getItem.limit_count;
                getItem.service_apply = payload.service_apply || getItem.service_apply;
                getItem.id_group_promotion = payload.id_group_promotion || getItem.id_group_promotion;
                getItem.id_group_customer = payload.id_group_customer || getItem.id_group_customer;
                // getItem.is_limited_use = payload.is_limited_use || getItem.is_limited_use;
                getItem.is_limited_use = (payload.is_limited_use !== getItem.is_limited_use) ? payload.is_limited_use : getItem.is_limited_use
                getItem.limited_use = payload.limited_use || getItem.limited_use;
                getItem.type_discount = payload.type_discount || getItem.type_discount;
                getItem.type_promotion = payload.type_promotion || getItem.type_promotion;
                getItem.price_min_order = payload.price_min_order || getItem.price_min_order;
                getItem.discount_unit = payload.discount_unit || getItem.discount_unit;
                getItem.discount_value = payload.discount_value || getItem.discount_value;
                getItem.discount_max_price = payload.discount_max_price || getItem.discount_max_price;
                // getItem.is_delete = payload.is_delete || getItem.is_delete;
                getItem.is_delete = (payload.is_delete !== getItem.is_delete) ? payload.is_delete : getItem.is_delete
                // getItem.is_exchange_point = payload.is_exchange_point || getItem.is_exchange_point
                getItem.is_exchange_point = (payload.is_exchange_point !== getItem.is_exchange_point) ? payload.is_exchange_point : getItem.is_exchange_point
                getItem.exchange_point = payload.exchange_point || getItem.exchange_point
                getItem.brand = (payload.brand) ? payload.brand.toLowerCase() : getItem.brand
                getItem.id_customer = payload.id_customer || getItem.id_customer
                getItem.is_id_customer = (payload.is_id_customer !== getItem.is_id_customer) ? payload.is_id_customer : getItem.is_id_customer
                getItem.is_id_group_customer = (payload.is_id_group_customer !== getItem.is_id_group_customer) ? payload.is_id_group_customer : getItem.is_id_group_customer
                getItem.exp_date_exchange = payload.exp_date_exchange || getItem.exp_date_exchange
                getItem.type_date_apply = payload.type_date_apply || getItem.type_date_apply;
                getItem.is_show_in_app = (payload.is_show_in_app === true && getItem.is_show_in_app) ? getItem.is_show_in_app : payload.is_show_in_app
                getItem.day_apply = payload.day_apply || getItem.day_apply;
                getItem.type_date_apply = payload.type_date_apply || getItem.type_date_apply;
                getItem.is_affiliate = payload.is_affiliate || getItem.is_affiliate;
                getItem.type_action = payload.type_action || getItem.type_action;


                getItem.position = payload.position || getItem.position
                if (getItem.is_limit_count === true && !(getItem.total_used_promotion < getItem.limit_count)) {
                    getItem.is_enough_limit_used = true;
                } else {
                    getItem.is_enough_limit_used = false;
                }
                if (getItem.is_limit_date === true) {

                }
                const dateNow = new Date(Date.now()).getTime();
                const limitDateEnd = new Date(getItem.limit_end_date).getTime();
                const limitDateStart = new Date(getItem.limit_start_date).getTime();
                getItem.is_payment_method = payload.is_payment_method || getItem.is_payment_method;
                getItem.payment_method = payload.payment_method || getItem.payment_method;

                if (getItem.is_active === true) getItem.status = "doing";
                if (getItem.is_limit_date === true && dateNow < limitDateStart) getItem.status = "upcoming";
                if (getItem.is_limit_date === true && limitDateStart < dateNow && dateNow < limitDateEnd) getItem.status = "doing";
                if (getItem.is_limit_date === true && limitDateEnd < dateNow) getItem.status = "out_of_date";
                if (getItem.is_limit_count === true && getItem.is_enough_limit_used === true) getItem.status = "out_of_stock";
                if (getItem.is_active === false) getItem.status = "done";
                getItem.position_view_payment = payload.position_view_payment ? payload.position_view_payment : getItem.position_view_payment;
                getItem.is_loop = (payload.is_loop !== getItem.is_loop) ? payload.is_loop : getItem.is_loop;
                getItem.day_loop = (payload.day_loop) ? payload.day_loop : getItem.day_loop;
                getItem.timezone = (payload.timezone) ? payload.timezone : getItem.timezone;
                getItem.is_apply_area = (payload.is_apply_area !== getItem.is_apply_area) ? payload.is_apply_area : getItem.is_apply_area
                if (getItem.is_apply_area === true) {
                    getItem.city = payload.city || getItem.city;
                    getItem.district = payload.district || getItem.district;
                }

                const result = await getItem.save();
                await this.activityAdminSystemService.editPromotion(idAdmin, getItem._id);
                return result
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateParrentPromotion(promotion: PromotionDocument, payload: editPromotionDTOAdmin) {
        try {
            promotion.title = payload.title || promotion.title;
            promotion.short_description = payload.short_description || promotion.short_description;
            promotion.description = payload.description || promotion.description;
            promotion.thumbnail = payload.thumbnail || promotion.thumbnail;
            promotion.image_background = payload.image_background || promotion.image_background;
            promotion.position = payload.position || promotion.position;
            promotion.position_view_payment = payload.position_view_payment ? payload.position_view_payment : promotion.position_view_payment;
            promotion.is_payment_method = payload.is_payment_method || promotion.is_payment_method;
            promotion.payment_method = payload.payment_method || promotion.payment_method;
            promotion.service_apply = payload.service_apply || promotion.service_apply;

            promotion.is_id_group_customer = (payload.is_id_group_customer !== promotion.is_id_group_customer) ? payload.is_id_group_customer : promotion.is_id_group_customer;
            promotion.id_group_customer = payload.id_group_customer || promotion.id_group_customer;

            promotion.is_id_customer = (payload.is_id_customer !== promotion.is_id_customer) ? payload.is_id_customer : promotion.is_id_customer;
            promotion.id_customer = (payload.id_customer !== promotion.id_customer) ? payload.id_customer : promotion.id_customer;
            promotion.type_discount = payload.type_discount || promotion.type_discount;

            promotion.discount_max_price = payload.discount_max_price || promotion.discount_max_price;
            promotion.discount_value = payload.discount_value || promotion.discount_value;
            promotion.discount_unit = payload.discount_unit || promotion.discount_unit;
            promotion.price_min_order = payload.price_min_order || promotion.price_min_order;
            promotion.is_affiliate = payload.is_affiliate || promotion.is_affiliate;
            promotion.type_action = payload.type_action || promotion.type_action;

            await promotion.save();
            const query = {
                $and: [
                    { is_delete: false },
                    { parrent_promotion: promotion.code },
                    {
                        $expr: {
                            $lt: ['$total_used_promotion', '$limited_use']
                        }
                    },
                    { status: 'doing' }
                ]
            }
            const getChildPromotion = await this.promotionModel.find(query);
            for (let item of getChildPromotion) {
                item.title = promotion.title
                item.short_description = promotion.short_description
                item.description = promotion.description
                item.thumbnail = promotion.thumbnail
                item.image_background = promotion.image_background
                item.position = promotion.position
                item.position_view_payment = promotion.position_view_payment
                item.is_payment_method = promotion.is_payment_method;
                item.payment_method = promotion.payment_method;
                item.service_apply = promotion.service_apply
                item.is_id_group_customer = promotion.is_id_group_customer;
                item.id_group_customer = promotion.id_group_customer;
                item.type_discount = promotion.type_discount
                item.id_customer = promotion.id_customer;
                item.is_id_customer = promotion.is_id_customer;
                item.price_min_order = promotion.price_min_order
                item.discount_unit = promotion.discount_unit
                item.discount_value = promotion.discount_value;
                item.discount_max_price = promotion.discount_max_price;
                item.is_affiliate = promotion.is_affiliate;
                item.type_action = promotion.type_action;
                await item.save();
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeChildPromotion(promotion: PromotionDocument, payload: activePromotionDTOAdmin, idAdmin) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { parrent_promotion: promotion.code },
                ]
            }
            const getChildPromotion = await this.promotionModel.find(query);
            for (let item of getChildPromotion) {
                item.is_active = (payload.is_active) ? payload.is_active : item.is_active;
                item.status = (item.is_active === false) ? "done" : "doing";
                await item.save();
                await this.activityAdminSystemService.actiPromotion(idAdmin, item._id);

            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async deleteChildPromotion(idAdmin, promotion: PromotionDocument) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { parrent_promotion: promotion.code },
                    { is_child_promotion: true },
                    { parrent_promotion: { $ne: null } }
                ]
            }
            const count = await this.promotionModel.count(query);
            await this.promotionModel.updateMany(query, {
                is_delete: true
            })
            // const iPage = {
            //     start: 0,
            //     length: 100
            // }
            // do {
            //     const getChildPromotion = await this.promotionModel.find(query)
            //         .sort({ date_create: -1, _id: -1 })
            //         .skip(iPage.start)
            //         .limit(iPage.length);
            //     for (let item of getChildPromotion) {
            //         item.is_delete = true;
            //         await item.save();
            //         // await this.activityAdminSystemService.deletePromotion(idAdmin, item._id);
            //     }
            //     iPage.start += 100;
            // } while (iPage.start < count)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getChildPromotion(lang, code, iPage: iPageUsedPromotionDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { parrent_promotion: code },
                ]
            }
            if (iPage.status === 'used') {
                query.$and.push({
                    total_used_promotion: { $gt: 0 }
                });
            } else if (iPage.status === 'not-used') {
                query.$and.push({
                    total_used_promotion: 0
                });
            }
            const getChildPromotion = await this.promotionModel.find(query)
                .sort({ _id: 1, code: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.promotionModel.count(query);
            const ressult = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getChildPromotion
            }
            return ressult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async testV2() {
        try {
            // const page = {
            //     start: 0,
            //     length: 10
            // }
            const currentDate = new Date().toLocaleString();
            console.log('current date: ', currentDate);

            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { is_loop: true }
                ]
            }
            const getPromotion = await this.promotionModel.find(query)
            const currenTime = new Date(Date.now())
            for (let promotion of getPromotion) {
                for (let item of promotion.day_loop) {
                    const date = await this.generalHandleService.formatDateWithTimeZone(currenTime, item['timezone']);
                    const checkDay = item["day_local"] === date.day_of_week;
                    const checkStart = item["start_time_local"] < date.time
                    const checkEnd = item["end_time_local"] > date.time
                    if (checkDay && checkStart && checkEnd) {
                        if (promotion.is_turn_on_loop) break;
                        promotion.is_turn_on_loop = true;
                        await promotion.save();
                        break;
                    } else {
                        if (promotion.is_turn_on_loop) {
                            promotion.is_turn_on_loop = false;
                            await promotion.save();
                        }
                    }
                }
            }
            return getPromotion
        } catch (err) {
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async testV3() {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { is_loop: true },
                    { status: 'doing' }
                ]
            }
            const getPromotion = await this.promotionModel.find(query)
            const currenTime = new Date(Date.now())
            for (let promotion of getPromotion) {
                let is_turn_on = false;
                const current_day = (await this.generalHandleService.formatDateWithTimeZone(currenTime, promotion.timezone));
                const arr_day_loop = promotion.day_loop.filter(i => i["is_check_loop"] === true && i["day_local"] === current_day.day_of_week);
                if (arr_day_loop.length === 0) { // nếu không có phần tử is_check_loop nào trong day_loop bằng true thì cho tắt tính năng lặp lại của promotion đó
                    if (promotion.is_turn_on_loop) {
                        promotion.is_turn_on_loop = false;
                        await promotion.save();
                    }
                    continue; // dừng các đoạn code phía sau và kiểm tra 1 protion mới
                }
                for (let item of arr_day_loop[0]["time_loop"]) { //chạy vòng lặp kiểm tra thời gian lặp lại trong ngày
                    const check_time: boolean = item["start_time_local"] <= current_day.time && item["end_time_local"] >= current_day.time // nếu  thời gian hiện tại lớn hơn thời gian bắt đầu và bé hơn thời gian kết thúc thì check_time = true
                    if (check_time) {
                        is_turn_on = true;
                        break; // nếu có 1 điều kiện đúng thì ngưng vòng lặp này
                    };

                }
                if (is_turn_on && !promotion.is_turn_on_loop) { // nếu is_turn_on == true và promotion.is_turn_on_loop == false thì set lại điều kiện is_turn_on_loop == true để bật promotion lặp lại 
                    promotion.is_turn_on_loop = true;
                    await promotion.save();
                } else if (!is_turn_on && promotion.is_turn_on_loop) { // nếu is_turn_on == false và promotion.is_turn_on_loop = true thì set lại điều kiện is_turn_on_loop = false để tắt promotion lặp lại
                    promotion.is_turn_on_loop = false;
                    await promotion.save();
                }
            }
            return {
                total: getPromotion.length,
                data: getPromotion
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getPromotionByPosition(lang, payload: querySetupPositionPromotion) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            let query: any = {
                $and: [
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

            if (payload.customer !== null) {
                const getCustomer = await this.customerRepositoryService.findOneById(payload.customer);
                if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND);
                const my_promotion = [];
                for (const item of getCustomer.my_promotion) {
                    if ((item["limit_used"] < item["limit_count"]) && (new Date(dateNow).getTime() < new Date(item["exp_date"]).getTime())) {
                        my_promotion.push(item["id_promotion"])
                    }
                }
                query.$and.push({ _id: { $not: { $in: my_promotion } } })
            }

            if (payload.group_customer !== null) {
                const getGroupCustomer = await this.groupCustomerModel.findById(payload.group_customer);
                if (!getGroupCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_customer")], HttpStatus.NOT_FOUND);
                query.$and.push({ id_group_customer: { $in: getGroupCustomer._id } })
            }
            const arrItem = await this.promotionModel.find(query)
                .select({ _id: 1, position: 1, title: 1, thumbnail: 1 })
                .sort({ position: 1, id: 1 })
            const result = {
                data: arrItem
            }
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async setPositionPromotion(lang, arrPromotion: updatePositionPromotion) {
        let arrCheckPromotion = [];
        let updatePositionPromotion = [];
        for (const item of arrPromotion.arr_promotion) {
            arrCheckPromotion.push(this.promotionModel.findById(item._id));
            updatePositionPromotion.push(this.promotionModel.findByIdAndUpdate(item._id, { $set: { position: item.position } }))
        }
        const checkPromotion = await Promise.all(arrCheckPromotion);
        const updatePromotion = await Promise.all(updatePositionPromotion);
        return true;
    } catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
}
