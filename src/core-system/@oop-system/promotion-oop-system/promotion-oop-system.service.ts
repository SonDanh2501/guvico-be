import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
<<<<<<< HEAD
import { createPromotionDTOAdmin, ERROR, iPageDTO, iPagePromotionDTOAdmin, iPageUsedPromotionDTOAdmin } from 'src/@core'
import { PROMOTION_ACTION_TYPE, PROMOTION_STATUS, PROMOTION_TYPE } from 'src/@repositories/module/mongodb/@database/enum'
=======
import { createPromotionDTOAdmin, ERROR, iPageDTO, iPagePromotionDTOAdmin, iPageUsedPromotionDTOAdmin, searchQuery } from 'src/@core'
import { PROMOTION_STATUS, PROMOTION_TYPE } from 'src/@repositories/module/mongodb/@database/enum'
>>>>>>> son
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PromotionRepositoryService } from 'src/@repositories/repository-service/promotion-repository/promotion-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class PromotionOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private promotionRepositoryService: PromotionRepositoryService,
<<<<<<< HEAD
        private orderRepositoryService: OrderRepositoryService // de tam de lam cho kip dat don
    ) {}
=======
        private orderRepositoryService: OrderRepositoryService 
    ) { }
>>>>>>> son

    async getListItem(iPage: iPagePromotionDTOAdmin) {
        try {
<<<<<<< HEAD
            const query: any = {
                $and: [
                    {
                        
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
                    { is_delete: false },
                ]
            }
            if (payload['id_service'] !== "" && payload['id_service'] !== null && payload['id_service'] !== undefined) {
                query.$and.push({ service_apply: payload['id_service']  });
            } 
            if (payload['status'] !== "" && payload['status'] !== null && payload['status'] !== undefined) {
                query.$and.push({ status: payload['status'] });
            }
            if (iPage.typeSort === 'code') {
                query.$and.push({ type_promotion: iPage.typeSort });
                if (iPage.brand === 'guvi') {
                    query.$and.push({ brand: 'guvi' });
                } else {
                    query.$and.push({ brand: { $ne: 'guvi' } });
                }
                if (payload['exchange'] === 'exchange') {
                    query.$and.push({ is_exchange_point: true });
                } else if (payload['exchange'] === 'no_exchange') {
                    query.$and.push({ is_exchange_point: false });
                }
            } else if (iPage.typeSort === 'event') {
=======
            const query: any = searchQuery(["title.vi", "title.en", "code"], iPage)

            if (await this.generalHandleService.checkValueInput(iPage.id_service)) {
                const id_service = await this.generalHandleService.convertObjectId(iPage.id_service)
                query.$and.push({ service_apply: id_service });
            }

            if (await this.generalHandleService.checkValueInput(iPage.status)) {
                query.$and.push({ status: iPage.status });
            }

            if (await this.generalHandleService.checkValueInput(iPage.typeSort)) {
>>>>>>> son
                query.$and.push({ type_promotion: iPage.typeSort });
            }

            if (await this.generalHandleService.checkValueInput(iPage.brand)) {
                if (iPage.brand === "guvi") {
                    query.$and.push({ brand: iPage.brand });
                }
                else {
                    query.$and.push({ brand: { $ne: "guvi"} });
                }
            }

            if (iPage.exchange === 'exchange') {
                query.$and.push({ is_exchange_point: true });
            } else if (iPage.exchange === 'no_exchange') {
                query.$and.push({ is_exchange_point: false });
            }

            if (iPage.search === "") {
                query.$and.push({
                    $or: [
                        {
                            $and: [
                                { is_parent_promotion: false },
                                { is_child_promotion: false }
                            ]
                        },
                        {
                            $and: [
                                { is_parent_promotion: true },
                                { is_child_promotion: false }
                            ]
                        }
                    ]
                },);
            }
<<<<<<< HEAD
            if (payload['id_group_promotion'] !== "" && payload['id_group_promotion'] !== null && payload['id_group_promotion'] !== undefined)  {
                query.$and.push({ id_group_promotion: payload['id_group_promotion'] });
=======

            if (await this.generalHandleService.checkValueInput(iPage.id_group_promotion)) {
                const id_group_promotion = await this.generalHandleService.convertObjectId(iPage.id_group_promotion)
                query.$and.push({ id_group_promotion: id_group_promotion });
>>>>>>> son
            }
            const sort = {}
            sort[iPage.fieldSort] = +iPage.valueSort

            return await this.promotionRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sort)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(payload: createPromotionDTOAdmin) {
        try {
            const dateNow = new Date(Date.now()).getTime();
            const startLimitDate = new Date(payload.limit_start_date).getTime()

            const dataCreate = {
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
                is_affiliate: payload.is_affiliate || false
            }

            return await this.promotionRepositoryService.create(dataCreate);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateItem(promotion, payload) {
        try {
            promotion.code = payload.code || promotion.code;
            promotion.title = payload.title || promotion.title;
            promotion.short_description = payload.short_description || promotion.short_description;
            promotion.description = payload.description || promotion.description;
            promotion.thumbnail = payload.thumbnail || promotion.thumbnail;
            promotion.image_background = payload.image_background || promotion.image_background;
            promotion.is_limit_date = (payload.is_limit_date !== promotion.is_limit_date) ? payload.is_limit_date : promotion.is_limit_date
            promotion.limit_start_date = payload.limit_start_date || promotion.limit_start_date;
            promotion.limit_end_date = payload.limit_end_date || promotion.limit_end_date;
            if (promotion.is_limit_date === false) {
              promotion.limit_start_date = null;
              promotion.limit_end_date = null;
            }
    
            promotion.is_limit_count = (payload.is_limit_count !== promotion.is_limit_count) ? payload.is_limit_count : promotion.is_limit_count
            promotion.limit_count = payload.limit_count || promotion.limit_count;
            promotion.service_apply = payload.service_apply || promotion.service_apply;
            promotion.id_group_promotion = payload.id_group_promotion || promotion.id_group_promotion;
            promotion.id_group_customer = payload.id_group_customer || promotion.id_group_customer;
            promotion.is_limited_use = (payload.is_limited_use !== promotion.is_limited_use) ? payload.is_limited_use : promotion.is_limited_use
            promotion.limited_use = payload.limited_use || promotion.limited_use;
            promotion.type_discount = payload.type_discount || promotion.type_discount;
            promotion.type_promotion = payload.type_promotion || promotion.type_promotion;
            promotion.price_min_order = payload.price_min_order || promotion.price_min_order;
            promotion.discount_unit = payload.discount_unit || promotion.discount_unit;
            promotion.discount_value = payload.discount_value || promotion.discount_value;
            promotion.discount_max_price = payload.discount_max_price || promotion.discount_max_price;
            promotion.is_delete = (payload.is_delete !== promotion.is_delete) ? payload.is_delete : promotion.is_delete
            promotion.is_exchange_point = (payload.is_exchange_point !== promotion.is_exchange_point) ? payload.is_exchange_point : promotion.is_exchange_point
            promotion.exchange_point = payload.exchange_point || promotion.exchange_point
            promotion.brand = (payload.brand) ? payload.brand.toLowerCase() : promotion.brand
            promotion.id_customer = payload.id_customer || promotion.id_customer
            promotion.is_id_customer = (payload.is_id_customer !== promotion.is_id_customer) ? payload.is_id_customer : promotion.is_id_customer
            promotion.is_id_group_customer = (payload.is_id_group_customer !== promotion.is_id_group_customer) ? payload.is_id_group_customer : promotion.is_id_group_customer
            promotion.exp_date_exchange = payload.exp_date_exchange || promotion.exp_date_exchange
            promotion.type_date_apply = payload.type_date_apply || promotion.type_date_apply;
            promotion.is_show_in_app = (payload.is_show_in_app === true && promotion.is_show_in_app) ? promotion.is_show_in_app : payload.is_show_in_app
            promotion.day_apply = payload.day_apply || promotion.day_apply;
            promotion.type_date_apply = payload.type_date_apply || promotion.type_date_apply;
    
            promotion.position = payload.position || promotion.position
            if (promotion.is_limit_count === true && !(promotion.total_used_promotion < promotion.limit_count)) {
                promotion.is_enough_limit_used = true;
            } else {
                promotion.is_enough_limit_used = false;
            }

            const dateNow = new Date(Date.now()).getTime();
            const limitDateEnd = new Date(promotion.limit_end_date).getTime();
            const limitDateStart = new Date(promotion.limit_start_date).getTime();
            promotion.is_payment_method = payload.is_payment_method || promotion.is_payment_method;
            promotion.payment_method = payload.payment_method || promotion.payment_method;
    
            if (promotion.is_active === true || (promotion.is_limit_date === true && limitDateStart < dateNow && dateNow < limitDateEnd))  {
                promotion.status = PROMOTION_STATUS.doing;
            }
            if (promotion.is_limit_date === true && dateNow < limitDateStart) {
                promotion.status = PROMOTION_STATUS.upcoming
            } 
            if (promotion.is_limit_date === true && limitDateEnd < dateNow)  {
                promotion.status = PROMOTION_STATUS.out_of_date
            }
            if (promotion.is_limit_count === true && promotion.is_enough_limit_used === true) {
                promotion.status = PROMOTION_STATUS.out_of_stock
            } 
            if (promotion.is_active === false) {
                promotion.status = PROMOTION_STATUS.done
            }
    
            promotion.position_view_payment = payload.position_view_payment ? payload.position_view_payment : promotion.position_view_payment;
            promotion.is_loop = (payload.is_loop !== promotion.is_loop) ? payload.is_loop : promotion.is_loop;
            promotion.day_loop = (payload.day_loop) ? payload.day_loop : promotion.day_loop;
            promotion.timezone = (payload.timezone) ? payload.timezone : promotion.timezone;
            promotion.is_apply_area = (payload.is_apply_area !== promotion.is_apply_area) ? payload.is_apply_area : promotion.is_apply_area
            if (promotion.is_apply_area === true) {
                promotion.city = payload.city || promotion.city;
                promotion.district = payload.district || promotion.district;
            }

            return await this.promotionRepositoryService.findByIdAndUpdate(promotion._id, promotion);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async getListChildPromotionByCode(code, type_promotion, getForUpdating: boolean = true) {
        try {
            const query:any = {
                $and: [
                    { is_delete: false },
                    { parent_promotion: code },
                    { type_promotion: PROMOTION_TYPE[type_promotion] }
                ]
            }
            if(getForUpdating) {
                query.$and.push(
                    {
                        $expr: {
                            $lt: ['$total_used_promotion', '$limited_use']
                        }
                    },
                    { status: PROMOTION_STATUS.doing }
                )
            }

            return await this.promotionRepositoryService.getListDataByCondition(query)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkCodeExistedWithType(lang, payload) {
        try {
            const query = {
                $and: [
                    { code: payload.code },
                    { type_promotion: payload.type_promotion },
                    { is_delete: false }
                ]
            }
            const checkCodeExisted = await this.promotionRepositoryService.findOne(query);
            if (checkCodeExisted && checkCodeExisted.type_promotion === PROMOTION_TYPE.code) {
                if ((payload.code === "" || payload.code === checkCodeExisted.code)) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_EXISTS_CODE, lang, "code")], HttpStatus.BAD_REQUEST);
                }
            }

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    } 

    async checkCodeExistedWithId(lang, payload) {
        try {
            const query = {
                $and: [
                    {_id: {$ne: payload._id} },
                    { code: payload.code },
                    { type_promotion: PROMOTION_TYPE.code },
                    { is_delete: false }
                ]
            }
            const checkCodeExisted = await this.promotionRepositoryService.findOne(query);
            if (checkCodeExisted) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_EXISTS, lang, "code")], HttpStatus.BAD_REQUEST);
            }

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    } 

    async getPromotionByCode(code) {
        try {
            const query = {
                $and: [
                    { code: code },
                    { is_delete: false }
                ]
            }
            return await this.promotionRepositoryService.findOne(query);
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    } 

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.promotionRepositoryService.findOneById(idItem, {}, [{ path: 'id_customer', select: { _id: 1, id_view: 1, full_name: 1, phone: 1, code_phone_area: 1, }}]);
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "promotion")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItemForMobile(lang, idItem) {
        try {
            const getItem = await this.promotionRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "promotion")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async softDeleteItem(idItem) {
        try {
            return await this.promotionRepositoryService.findByIdAndSoftDelete(idItem)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async softDeleteListItems(code, type_promotion) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { parent_promotion: code },
                    { type_promotion: PROMOTION_TYPE[type_promotion] }
                ]
            }
            return await this.promotionRepositoryService.updateMany(query, { is_delete: true })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPromotionForAffiliate() {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_affiliate: true }
                ]
            }

            const sort = { date_create: -1 }

            const getItem = await this.promotionRepositoryService.findOne(query, {}, sort);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePromotion(lang, promotion) {
        try {
            await this.getDetailItem(lang, promotion._id)
            return await this.promotionRepositoryService.findByIdAndUpdate(promotion._id, promotion)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateEventPromotion(lang, infoJob, getCustomer) {
        try {
            const dateNow = new Date(Date.now()).toISOString();
            
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
                                    { id_customer: { $in: [getCustomer._id] } },
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
                        service_apply: { $in: [ new Types.ObjectId(infoJob.service._id)] }
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
                                    { city: { $in: [infoJob.city] } }
                                ]
                            }
                        ]
                    }
                ]
            }

            const findPromotion = await this.promotionRepositoryService.getListDataByCondition(query);
            
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
                const checkCountEvent2 = await this.orderRepositoryService.countDataByCondition(qeury2)
                if (item.is_limited_use === true && (Number(checkCountEvent2) > Number(item.limited_use) || Number(checkCountEvent2) === Number(item.limited_use))) continue;
                const qeury3 = {
                    $and: [
                        { event_promotion: { $elemMatch: { _id: item._id } } }
                    ]
                }
                const checkCountEvent3 = await this.orderRepositoryService.countDataByCondition(qeury3)
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
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateCodePromotion(lang, infoJob, codePromotion, getCustomer, callBy?) {
        try {
            console.log(getCustomer, 'getCustomer');
            
                const dateNow = new Date(Date.now()).toISOString();
                const checkCode = await this.promotionRepositoryService.findOne({
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
                                        { id_customer: { $in: [getCustomer._id] } },
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
                            service_apply: { $in: [ new Types.ObjectId(infoJob.service._id)] }
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
                    const countUsedPrmotion = await this.orderRepositoryService.countDataByCondition({ "code_promotion.code": checkCode.code, id_customer: getCustomer._id, status: { $ne: "cancel" }, is_delete: false });
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
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async increaseTotalUsedPromotionCode(lang, promotionCode) {
        try {
            const itemPromotion = await this.promotionRepositoryService.findOne({code: promotionCode})
            if (itemPromotion) {
                itemPromotion.total_used_promotion += 1
                if (itemPromotion.is_limit_count === true && !(itemPromotion.total_used_promotion < itemPromotion.limit_count)) {
                    itemPromotion.is_enough_limit_used = true;
                    itemPromotion.status = "out_of_stock"
                }
                await this.promotionRepositoryService.findByIdAndUpdate(itemPromotion._id, itemPromotion)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListPagination(subjectAction, iPage: iPageDTO, payload, customer) {
        try {
            const query: any = {
                $and: [
                { code: { $regex: iPage.search, $options: "i" } },
                { type_promotion: PROMOTION_TYPE.code },
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
                                            { id_customer: customer._id },
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
                                            { id_group_customer: { $in: customer.id_group_customer } },
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
                                            { limit_start_date: { $lte: payload['dateNow'] } },
                                            { limit_end_date: { $gte: payload['dateNow'] } },
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
                                { _id: { $in: payload['my_promotion'] } }
                            ]
                        }
                    ]
                },
                { is_enough_limit_used: false },
                { is_delete: false },
                { is_active: true },
                { is_parent_promotion: false },
                { is_child_promotion: false },
                {
                    $or: [
                        {
                        $and: [
                            { is_loop: true },
                            { is_turn_on_loop: true }
                        ]
                        },
                        { is_loop: false }
                    ]
                },
                ]
            }
        
            if (payload['address'] !== "" && payload['address'] !== null && payload['address'] !== undefined) {
                const resultCode = await this.generalHandleService.getCodeAdministrativeToString(payload.query['address']);
                query.$and.push({
                    $or: [
                    { is_apply_area: false },
                    {
                        $and: [
                        { is_apply_area: true },
                        { city: resultCode.city }
                        ]
                    }
                    ]
                })
            }
    
            if (subjectAction !== TYPE_SUBJECT_ACTION.admin) {
                query.$and.push({
                    $or: [
                    { is_show_in_app: true },
                    { is_show_in_app: { $exists: false } }
                    ]
                })
            }
    
            if (payload?.brand && payload['brand'] === "other") {
                query.$and.push({ brand: { $ne: "guvi" } })
            }
            if (payload?.brand && payload['brand'] === "guvi") {
                query.$and.push({ brand: "guvi" })
            } 
            if (payload['idService'] !== "" && payload['idService'] !== null && payload['idService'] !== undefined) {
                query.$and.push({ service_apply: payload.query['idService'] })
            }
            
            const sort = { position_view_payment: 1, date_create: -1, _id: 1 }
            return await this.promotionRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sort)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListPaginationForExchange(iPage: iPageDTO, my_promotion) {
        try {
            const query = {
                $and: [
                  { code: { $regex: iPage.search, $options: "i" } },
                  { type_promotion: "code" },
                  { _id: { $in: my_promotion } },
                  { is_delete: false },
                  { is_active: true },
                  { is_parent_promotion: false },
                  { is_child_promotion: false }
                ]
            }
            
            const sort = { position_view_payment: 1, date_create: -1, _id: 1 }
            return await this.promotionRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sort)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListPaginationChildByPromotion(iPage: iPageUsedPromotionDTOAdmin, code) {
        try {
            const query: any = {
                $and: [
                    { is_delete: false },
                    { parent_promotion: code },
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

            return await this.promotionRepositoryService.getListPaginationDataByCondition(iPage, query)            
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
 
     async getListPromotionByCustomer(payload) {
            try {
                const query: any = {
                    $and: [
                        { type_promotion: PROMOTION_TYPE.code },
                        {
                            $or: [
                                {
                                    $and: [
                                        { is_limit_date: true },
                                        { limit_start_date: { $lte: payload['dateNow'] } },
                                        { limit_end_date: { $gte: payload['dateNow'] } }
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
                        { brand: "guvi" },
                        { is_enough_limit_used: false },
                        { is_delete: false },
                        { is_active: true },
                        { is_parent_promotion: false },
                        { is_child_promotion: false },
                        {
                            $or: [
                                {
                                    $and: [
                                        { is_loop: true },
                                        { is_turn_on_loop: true }
                                    ]
                                },
                                { is_loop: false }
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

                if(payload?.my_promotion && payload?.my_promotion.length > 0) {
                    query.$and.push({ _id: { $not: { $in: payload?.my_promotion } } })
                }
                if(payload?.id_group_customer) {
                    query.$and.push({ id_group_customer: payload.id_group_customer })
                }
                
                return await this.promotionRepositoryService.getListDataByCondition(query)
    
            } catch (err) {
                throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
            }
        }
<<<<<<< HEAD
}
=======
    }

    async increaseTotalUsedPromotionEvent(lang, promotionEvent) {
        try {
            const promotionIds = promotionEvent.map((event) => event._id)

             // Cập nhật tất cả các promotion có _id trong danh sách
            await this.promotionRepositoryService.updateMany(
                { _id: { $in: promotionIds } },
                { $inc: { total_used_promotion: 1 } }
            );
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
>>>>>>> son
