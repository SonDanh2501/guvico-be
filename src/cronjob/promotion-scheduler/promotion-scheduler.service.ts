import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from 'src/@core';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';

@Injectable()
export class PromotionSchedulerService {

    constructor(
        private generalHandleService: GeneralHandleService,
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,

    ) { }
    @Cron('00 * * * * *')
    // @Cron('0 57 16 * * *')
    async handleCron() {
        this.processPromotion();
    }



    async processPromotion() {
        try {
            const page = {
                start: 0,
                length: 10
            }

            let arrPromotion = [];
            do {
                arrPromotion = await this.promotionModel.find({ is_delete: false }).skip(page.start).limit(page.length)

                const dateNow = new Date(Date.now()).getTime();

                for (const item of arrPromotion) {
                    if (item.is_limit_date === true) {
                        const startDate = new Date(item.limit_start_date).getTime();
                        const endDate = new Date(item.limit_end_date).getTime();
                        if (startDate < dateNow && dateNow < endDate && item.status === "upcoming") {
                            item.status = "doing";
                        }
                        if (endDate < dateNow && item.status === "doing") {
                            item.status = "out_of_date";
                        }
                    }
                    await item.save();
                }
                page.start += 10;
                // console.log(page.start, 'page.start')
                // console.log(arrPromotion.length, 'arrPromotion.length');

            } while (arrPromotion.length === page.length)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async turnOnLoopPromotion() {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { is_loop: true },
                    { status: 'doing' }
                ]//
            }//
            const getPromotion = await this.promotionModel.find(query) //
            const currenTime = new Date(Date.now()) //
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
                if (arr_day_loop[0]["time_loop"].length === 0) { // nếu time loop rỗng thì thời gian áp dụng cả ngày
                    is_turn_on = true;
                    promotion.is_turn_on_loop = true;
                    await promotion.save();
                    continue;
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
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}