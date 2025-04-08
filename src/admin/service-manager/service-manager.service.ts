import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { eachDayOfInterval, eachHourOfInterval, eachMinuteOfInterval, endOfDay, startOfDay, addHours, addMinutes, subDays, subHours } from 'date-fns';
import { Model } from 'mongoose';
import { createServiceDTOAdmin, ERROR, GlobalService, iPageDTO, editServiceDTOAdmin, activeServiceDTOAdmin, iPagePriceServiceDTOAdmin } from 'src/@core';
import { Service, ServiceDocument } from 'src/@core/db/schema/service.schema';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { ExtendOptionalSystemService } from 'src/core-system/extend-optional-system/extend-optional-system.service';
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
import { OptionalServiceSystemService } from 'src/core-system/optional-service-system/optional-service-system.service';
import { ServiceSystemService } from 'src/core-system/service-system/service-system.service';


@Injectable()
export class ServiceManagerService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private serviceSystemService: ServiceSystemService,
        private optionalServiceSystemService: OptionalServiceSystemService,
        private extendOptionalSystemService: ExtendOptionalSystemService,
        private groupOrderSystemService: GroupOrderSystemService,

        // private i18n: I18nContext,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }

    async getListItem(lang, iPage: iPageDTO) {
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
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            const arrItem = await this.serviceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.serviceModel.count(query)
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

    async getListServiceByGroupService(lang, iPage: iPageDTO, id) {
        try {
            console.log('id ', id);

            const query = {
                $and: [
                    { id_group_service: id },
                    { is_delete: false },
                ]
            }
            console.log('query ', query.$and);

            const arrItem = await this.serviceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.serviceModel.count(query)
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
            const findItem = await this.serviceModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createItem(lang, payload: createServiceDTOAdmin, idAdmin: string) {
        try {
            const newCustomer = new this.serviceModel({
                title: payload.title,
                thumbnail: payload.thumbnail || 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1678156195/ik1vi5jkrilnxgatpr6h.png',
                description: payload.description,
                id_group_service: payload.id_group_service,
                position: payload.position,
                type: payload.type,
                kind: payload.kind,
                type_loop_or_schedule: payload.type_loop_or_schedule,
                is_auto_order: payload.is_auto_order,
                time_repeat: payload.time_repeat,
                time_schedule: payload.time_schedule || [],
                type_page: payload.type_page,
                note: payload.note,
                max_estimate: payload.max_estimate || 4,
                minimum_time_order: payload.minimum_time_order || [],
                platform_fee: payload.platform_fee || 28,
                type_partner: payload.type_partner || 'collaborator',
                date_create: new Date(Date.now()).toISOString(),
            });
            await newCustomer.save();
            await this.activityAdminSystemService.createService(idAdmin, newCustomer._id);
            return newCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.serviceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.title = payload.title || getItem.title;
            getItem.thumbnail = payload.thumbnail || getItem.thumbnail;
            getItem.description = payload.description || getItem.description;
            getItem.position = payload.position || getItem.position;
            getItem.type = payload.type || getItem.type;
            getItem.kind = payload.kind || getItem.kind;
            getItem.type_loop_or_schedule = payload.type_loop_or_schedule || getItem.type_loop_or_schedule;
            getItem.is_auto_order = payload.is_auto_order || getItem.is_auto_order;
            getItem.time_repeat = payload.time_repeat || getItem.time_repeat
            getItem.time_schedule = payload.time_schedule || getItem.time_schedule;
            getItem.type_page = payload.type_page || getItem.type_page;
            getItem.note = payload.note || getItem.note;
            getItem.max_estimate = payload.max_estimate || getItem.max_estimate;
            getItem.minimum_time_order = payload.minimum_time_order || getItem.minimum_time_order;
            getItem.type_partner = payload.type_partner || getItem.type_partner
            await getItem.save();
            await this.activityAdminSystemService.editService(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeItem(lang, payload: activeServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            await this.serviceSystemService.activeItem(lang, payload, id, idAdmin)
            await this.activityAdminSystemService.actiService(idAdmin, id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            await this.serviceSystemService.deleteItem(lang, id, idAdmin)
            await this.activityAdminSystemService.deleteService(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async priceOnService(lang, idExtend: string, iPage: iPagePriceServiceDTOAdmin) {
        try {
            const start_date = startOfDay(Date.parse(iPage.start_date));
            const end_date = startOfDay(Date.parse(iPage.end_date));
            const arrDate = eachDayOfInterval({
                start: start_date,
                end: end_date
            })
            let tempArr = [];
            const result = [];
            for (let i = 0; i < arrDate.length; i++) {
                let start_a = addHours(arrDate[i], Number(iPage.start_time));
                let end = addHours(arrDate[i], Number(iPage.end_time));
                start_a = addMinutes(start_a, Number(iPage.start_minute));
                end = addMinutes(end, Number(iPage.end_minute));
                tempArr = eachMinuteOfInterval({
                    start: Date.parse(start_a.toISOString()),
                    end: Date.parse(end.toISOString())
                }, { step: Number(iPage.step) });
                result.push(
                    {
                        date: arrDate[i],
                        arr_time: []
                    }
                )
                for (let temp of tempArr) {
                    // console.log('temp ',temp);
                    temp = subHours(temp, Number(iPage.timezone));
                    const price = await this.calculatePriceGroupOrder(lang, idExtend, temp.toISOString(), iPage.city, iPage.district);
                    // const tempPriceExtend = await this.groupOrderSystemService.calculateFeeFromExtend(lang, idExtend, temp.toISOString(), iPage.city, iPage.district);

                    result[i].arr_time.push({
                        time: temp,
                        price: price
                    })

                    // result[i].arr_time.push({
                    //     time: temp,
                    //     price: tempPriceExtend.tempExtendOptional.price
                    // })
                }

            }
            return { data: result };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async calculatePriceGroupOrder(lang, idExtend, date, city, district) {
        try {
            let initial_fee = 0;
            let platform_fee = 0;
            const getDetailExtendservice = await this.extendOptionalSystemService.getDetailExtendOptional(lang, idExtend)
            const getDetailOptionalService = await this.optionalServiceSystemService.getDetailOptionalService(lang, getDetailExtendservice.id_optional_service);
            const tempExtendOptional = {
                _id: getDetailExtendservice._id,
                title: getDetailExtendservice.title,
                description: getDetailExtendservice.description,
                price: getDetailExtendservice.price,
                count: getDetailExtendservice.count,
                estimate: getDetailExtendservice.estimate
            }
            let priceUp = 0;
            let maxPriceArea = 0;
            let maxPriceRushHour = 0;
            let maxPriceRushDay = 0;
            let maxPriceHoliday = 0;
            ///// tính giá tăng theo khu vực
            if (getDetailExtendservice.is_price_option_area === true) {
                for (const item of getDetailExtendservice.price_option_area) {
                    if (item.city === Number(city) && item.district.findIndex(x => Number(district) === x) > -1) {
                        let temp = 0;
                        if (item.type_increase === "amount") {
                            temp = item.value;
                        } else if (item.type_increase === "amount_by_root") {
                            temp = getDetailExtendservice.price + item.value;
                        } else { // percent_by_root
                            temp = getDetailExtendservice.price * (item.value / 100);
                        }
                        if (maxPriceArea < temp) maxPriceArea = temp;
                    }
                }
                if (maxPriceArea === 0) maxPriceArea = getDetailExtendservice.price;
            } else {
                maxPriceArea = getDetailExtendservice.price;
            }
            priceUp = maxPriceArea;
            ///// tính giá tăng theo khu vực theo ngày cao điểm
            if (getDetailExtendservice.is_price_option_rush_day === true) {
                for (const item of getDetailExtendservice.price_option_rush_day) {
                    const dayCompare = new Date(date).getDay();
                    if (item.rush_day.findIndex(x => dayCompare === x) > -1) {
                        let temp = 0;
                        if (item.type_increase === "percent_accumulate") {
                            temp = priceUp * (item.value / 100) || 0;
                        } else {
                            temp = priceUp + item.value;
                        }
                        maxPriceRushDay = temp;
                    }
                }
            } else {
                for (const item of getDetailOptionalService.price_option_rush_day) {
                    const dayCompare = new Date(date).getDay();
                    if (item.rush_day.findIndex(x => dayCompare === x) > -1) {
                        let temp = 0;
                        if (item.type_increase === "percent_accumulate") {
                            temp = priceUp * (item.value / 100) || 0;
                        } else {
                            temp = priceUp + item.value;
                        }
                        maxPriceRushDay = temp;
                    }
                }
            }
            priceUp += maxPriceRushDay;
            ///// tính giá tăng theo khu vực theo giờ cao điểm
            if (getDetailExtendservice.is_price_option_rush_hour === true) {
                for (const item of getDetailExtendservice.price_option_rush_hour) {
                    const timeCompare = date.split("T")[1];
                    if ((item.time_start < timeCompare || item.time_start === timeCompare) &&
                        (timeCompare < item.time_end || timeCompare === item.time_end)) {
                        let temp = 0;
                        if (item.type_increase === "percent_accumulate") {
                            temp = priceUp * (item.value / 100) || 0;
                        } else {
                            temp = priceUp + item.value;
                        }
                        maxPriceRushHour = temp;
                    }
                }
            } else {
                for (const item of getDetailOptionalService.price_option_rush_hour) {
                    const timeCompare = date.split("T")[1];
                    if ((item.time_start < timeCompare || item.time_start === timeCompare) &&
                        (timeCompare < item.time_end || timeCompare === item.time_end)) {
                        let temp = 0;
                        if (item.type_increase === "percent_accumulate") {
                            temp = priceUp * (item.value / 100) || 0;
                        } else {
                            temp = priceUp + item.value;
                        }
                        maxPriceRushHour = temp;
                    }
                }
            }
            priceUp += maxPriceRushHour;
            ///// tính giá tăng theo khu vực theo ngày lễ
            if (getDetailExtendservice.is_price_option_holiday === true) {
                for (const item of getDetailExtendservice.price_option_holiday) {
                    const dateCompare = new Date(date).getTime();
                    const timeStart = new Date(item.time_start).getTime();
                    const timeEnd = new Date(item.time_end).getTime();
                    let temp = 0;
                    if (timeStart < dateCompare && dateCompare < timeEnd) {
                        if (item.type_increase === "percent_accumulate") {
                            temp = priceUp * (item.value / 100) || 0;
                        } else {
                            temp = item.value;
                        }
                        if (maxPriceHoliday < temp) maxPriceHoliday = temp;
                    }
                }
            } else {
                for (const item of getDetailOptionalService.price_option_holiday) {
                    const dateCompare = new Date(date).getTime();
                    const timeStart = new Date(item.time_start).getTime();
                    const timeEnd = new Date(item.time_end).getTime();
                    let temp = 0;
                    if (timeStart < dateCompare && dateCompare < timeEnd) {
                        if (item.type_increase === "percent_accumulate") {
                            temp = priceUp * (item.value / 100) || 0;
                        } else {
                            temp = item.value;
                        }
                        if (maxPriceHoliday < temp) maxPriceHoliday = temp;
                    }
                }
            }
            priceUp += maxPriceHoliday;
            let tempPlatformFee = (getDetailExtendservice.is_platform_fee === true) ?
                Math.ceil(Number(priceUp) * (Number(getDetailExtendservice.platform_fee) / 100)) :
                Math.ceil(Number(priceUp) * (Number(getDetailOptionalService.platform_fee) / 100))
            const tempPriceUp = Math.ceil(priceUp / 1000)
            tempPlatformFee = Math.round(tempPlatformFee / 100)
            tempPlatformFee = tempPlatformFee * 100;
            initial_fee += (tempPriceUp * 1000);
            platform_fee += tempPlatformFee
            initial_fee += Math.ceil(priceUp / 1000) * 1000;
            platform_fee += tempPlatformFee
            tempExtendOptional.price = (tempPriceUp * 1000)
            return {
                price: tempExtendOptional.price,
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
