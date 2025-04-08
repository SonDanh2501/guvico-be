import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { endOfMonth, startOfMonth, subDays } from 'date-fns';
import { Model } from 'mongoose';
import { AVG_COLLABORATOR_STAR, AVG_ORDER_STAR, Collaborator, CollaboratorDocument, ID_ORDER, InfoRewardCollaborator, InfoRewardCollaboratorDocument, LOOKUP_COLLABORATOR, ORDER_STAR, Order, OrderDocument, TEMP_COLLABORATOR_DATE_START, TEMP_ORDER_DATE_WORK, TIME_DIFFERRENT, TOTAL_HOUR, TOTAL_LATE_START, TOTAL_ORDER, collaboratorReward, payloadCreateInfoRewardCollaborator } from 'src/@core';
import { RewardCollaborator, RewardCollaboratorDocument } from 'src/@core/db/schema/reward_collaborator.schema';
import { InfoRewardCollaboratorService } from 'src/admin/info-reward-collaborator/info-reward-collaborator.service';

@Injectable()
export class FirstMonthService {
    constructor(
        private infoRewardCollaboratorService: InfoRewardCollaboratorService,
        @InjectModel(RewardCollaborator.name) private rewardCollaboratorModel: Model<RewardCollaboratorDocument>,
        @InjectModel(InfoRewardCollaborator.name) private infoRewardCollaboratorModel: Model<InfoRewardCollaboratorDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    @Cron(
        '0 0 02 01 * *',
        {
            timeZone: 'Asia/Ho_Chi_Minh'
        })
    async handleCron() {
        console.log('test time zone ');
        this.processRewarkCollaborator();
    }


    async processRewarkCollaborator() {
        try {
            const currentDate = new Date(Date.now()).toISOString();
            const prevDate = subDays(new Date(Date.now()), 10)
            const startMonth = startOfMonth(prevDate).toISOString();
            const endMonth = endOfMonth(prevDate).toISOString();
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    {
                        $or: [
                            { is_limit_date: false },
                            {
                                $and: [
                                    { is_limit_date: true },
                                    { start_date: { $lte: currentDate } },
                                    { end_date: { $gte: currentDate } }
                                ]
                            }
                        ]
                    },
                    { status: 'doing' }
                ]
            }
            const countReward = await this.rewardCollaboratorModel.count(query);
            let payload = {
                start: 0,
                length: 20
            }
            do {
                const getReward = await this.rewardCollaboratorModel.find(query)
                    .sort({ _id: 1, date_create: 1 })
                    .skip(payload.start)
                    .limit(payload.length);
                for (let reward of getReward) {
                    const { city, is_city, is_type_collaborator,
                        type_collaborator, is_service_apply,
                        service_apply, type_wallet } = reward
                    let getCollaborator = [];
                    let queryCollaborator: any = {
                        $and: [
                            { is_delete: false },
                            { status: 'done' },
                            { date_work: { $gte: startMonth } },
                            { date_work: { $lte: endMonth } },
                        ]
                    }
                    if (is_city) {
                        queryCollaborator.$and.push({ city: { $in: city } })
                    }
                    if (is_service_apply) {
                        queryCollaborator.$and.push({ 'service._id': { $in: service_apply } })
                    }
                    getCollaborator = await this.orderModel.aggregate([
                        { $lookup: LOOKUP_COLLABORATOR },
                        { $unwind: { path: '$id_collaborator' } },
                        { $addFields: TEMP_ORDER_DATE_WORK },
                        { $addFields: TEMP_COLLABORATOR_DATE_START },
                        { $addFields: TIME_DIFFERRENT },
                        { $match: queryCollaborator },
                        {
                            $group: {
                                _id: '$id_collaborator',
                                total_order: TOTAL_ORDER,
                                total_hour: TOTAL_HOUR,
                                avg_order_star: AVG_ORDER_STAR,
                                order_star: ORDER_STAR,
                                avg_collaborator_star: AVG_COLLABORATOR_STAR,
                                id_order: ID_ORDER,
                                total_late_start: TOTAL_LATE_START,

                            }
                        },
                        { $sort: { total_hour: -1, _id: -1 } }
                    ])
                    const arrCollaboratorReward = []
                    for (let item of getCollaborator) {
                        const temp_collaborator = {
                            _id: item._id._id.toString(),
                            total_order: item.total_order ? item.total_order : 0,
                            total_hour: item.total_hour ? item.total_hour : 0,
                            avg_order_star: item.avg_order_star ? item.avg_order_star : 0,
                            order_star: item.order_star ? item.order_star : [],
                            avg_collaborator_star: item.avg_collaborator_star ? item.avg_collaborator_star : 0,
                            id_order: item.id_order ? item.id_order : []
                        }
                        arrCollaboratorReward.push(temp_collaborator)
                    }
                    for (let collaborator of arrCollaboratorReward) { // duyệt qua mảng ctv để so sánh từng ctv với từng reward
                        const queryCancel = {
                            $and: [
                                { is_delete: false },
                                { date_work: { $gte: startMonth } },
                                { date_work: { $lte: endMonth } },
                                {
                                    $and: [
                                        { "id_cancel_collaborator.id_collaborator": { $exists: true } },
                                        { id_cancel_collaborator: { $elemMatch: { id_collaborator: collaborator._id } } }
                                    ]
                                },
                            ]
                        }
                        const countCancel = await this.orderModel.count(queryCancel);
                        if (countCancel > 2) {
                            console.log('toi day ', countCancel);

                            continue; // nếu số ca hủy lớn hơn thì ko cần duyệt các điều kiện còn lại nữa cho qua ctv tiếp theo luôn
                        }
                        let arr_info_collaborator_and_reward = [];
                        const temp_check = [];
                        let check_lv2 = false;
                        for (let condition_level_1 of reward.condition["condition_level_1"]) {
                            const { money, type_condition } = condition_level_1
                            const arr_condition_lv2 = [];
                            // kiểm tra tính đúng sai của 1 cộng tác viên so với các điều kiện đưa ra 
                            // => đây là vòng lặp kiểm tra cộng tác viên có được thưởng hay không
                            for (let condition_level_2 of condition_level_1.condition_level_2) { // chỉ cần lv2 đúng hết thì có thể nhận đc tiền từ 1 mức nào đó
                                const { condition, type_condition } = condition_level_2
                                const arr_child_condition_lv2 = [] // đây là màng các phần tử con của các condition lv2(object bé nhất trong list object)

                                for (let condition_lv2 of condition) { // kiểm tra từng điều kiện nhỏ nhất của condition lv2
                                    const { kind, value, operator } = condition_lv2
                                    const check_condition = await this.checkReward(kind, collaborator, operator, value)//hàm kiểm tra các condition nhỏ nhất
                                    arr_child_condition_lv2.push(check_condition); // push các kết quả vào một mảng
                                }

                                // sau khi kiểm tra xong ta có mảng boolean arr_child_condition_lv2
                                // sau khi chạy vòng lặp đầu tiên ta có mảng boolean arr_child_condition_lv2
                                let condition_child = await this.checkWithTypeCondition(type_condition, arr_child_condition_lv2);
                                // kế đó ta dựa vào mảng đó và type condition để check 1 đk của 1 trong N các điều kiện của condition lv2
                                // push kết quả đó vào 1 mảng tạm
                                arr_condition_lv2.push(condition_child); // đây là mảng các phần tử true false của condition lv2
                            }
                            // kiểm tra kết quả dựa theo type condition lv2 và mảng arr_condition_lv2
                            check_lv2 = await this.checkWithTypeCondition(type_condition, arr_condition_lv2, 1); // kiểm tra tính đúng đắn của các điều kiện condition_lv2
                            if (check_lv2 === true) { // nếu check_lv2 === true thì cộng tác viên đó đã đạt đk để nhận phần thưởng ở condition_lv_2
                                const temp = {
                                    _id: collaborator._id.toString(),
                                    money: money,
                                    total_order: collaborator.total_order,
                                    total_hour: collaborator.total_hour,
                                    avg_collaborator_star: collaborator.avg_collaborator_star,
                                    avg_order_star: collaborator.avg_order_star,
                                    order_star: collaborator.order_star,
                                    id_reward_collaborator: reward._id.toString(),
                                    id_order: collaborator.id_order,
                                    total_late_start: collaborator.total_late_start
                                }
                                arr_info_collaborator_and_reward.push(temp);
                            }
                        }
                        // tiếp theo nên kiểm tra tiếp xem cộng tác viên đó có đạt các điều kiện tiếp theo hay nói cách khác là có đạt đk
                        // của role thưởng tiếp theo không 
                        if (arr_info_collaborator_and_reward.length > 0) {
                            await this.chooseRewardBasedOnTypeCondition(reward.condition["type_condition"], arr_info_collaborator_and_reward);
                        }
                    }
                    return getCollaborator
                }
                payload.start += 20;

            } while (countReward > payload.start);


        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async checkReward(kind, collaborator: collaboratorReward, operator, value) {
        try {
            let condition: boolean = false;
            let valueCollaborator: any;
            let valueCompare: any;
            switch (kind) {
                case "total_order":
                    if (operator === ">") condition = (Number(collaborator.total_order) > Number(value)) ? true : false;
                    else if (operator === "<") condition = (collaborator.total_order < Number(value)) ? true : false;
                    else if (operator === "==") condition = (collaborator.total_order === Number(value)) ? true : false;
                    else if (operator === "!=") condition = (collaborator.total_order !== Number(value)) ? true : false;
                    else if (operator === ">=") condition = (collaborator.total_order > Number(value) || collaborator.total_order === Number(value)) ? true : false;
                    else if (operator === "<=") condition = (collaborator.total_order < Number(value) || collaborator.total_order === Number(value)) ? true : false;
                    break;
                case "total_hour":
                    if (operator === ">") condition = (collaborator.total_hour > Number(value)) ? true : false;
                    else if (operator === "<") condition = (collaborator.total_hour < Number(value)) ? true : false;
                    else if (operator === "==") condition = (collaborator.total_hour === Number(value)) ? true : false;
                    else if (operator === "!=") condition = (collaborator.total_hour !== Number(value)) ? true : false;
                    else if (operator === ">=") condition = (collaborator.total_hour > Number(value) || collaborator.total_hour === Number(value)) ? true : false;
                    else if (operator === "<=") condition = (collaborator.total_hour < Number(value) || collaborator.total_hour === Number(value)) ? true : false;
                    break;
                case "avg_order_star":
                    if (operator === ">") condition = (Number(collaborator.avg_order_star) > Number(value)) ? true : false;
                    else if (operator === "<") condition = (collaborator.avg_order_star < Number(value)) ? true : false;
                    else if (operator === "==") condition = (collaborator.avg_order_star === Number(value)) ? true : false;
                    else if (operator === "!=") condition = (collaborator.avg_order_star !== Number(value)) ? true : false;
                    else if (operator === ">=") condition = (collaborator.avg_order_star > Number(value) || collaborator.avg_order_star === Number(value)) ? true : false;
                    else if (operator === "<=") condition = (collaborator.avg_order_star < Number(value) || collaborator.avg_order_star === Number(value)) ? true : false;
                    break;
                case "avg_collaborator_star":
                    if (operator === ">") condition = (Number(collaborator.avg_collaborator_star) > Number(value)) ? true : false;
                    else if (operator === "<") condition = (collaborator.avg_collaborator_star < Number(value)) ? true : false;
                    else if (operator === "==") condition = (collaborator.avg_collaborator_star === Number(value)) ? true : false;
                    else if (operator === "!=") condition = (collaborator.avg_collaborator_star !== Number(value)) ? true : false;
                    else if (operator === ">=") condition = (collaborator.avg_collaborator_star > Number(value) || collaborator.avg_collaborator_star === Number(value)) ? true : false;
                    else if (operator === "<=") condition = (collaborator.avg_collaborator_star < Number(value) || collaborator.avg_collaborator_star === Number(value)) ? true : false;
                    break;
                case "order_star":
                    if (operator === ">") condition = (collaborator.order_star.filter(item => item < Number(value)).length > 0) ? false : true;
                    else if (operator === "<") condition = (collaborator.order_star.filter(item => item > Number(value)).length > 0) ? false : true;
                    else if (operator === "==") condition = (collaborator.order_star.filter(item => item !== Number(value)).length > 0) ? false : true;
                    else if (operator === "!=") condition = (collaborator.order_star.filter(item => item === Number(value)).length > 0) ? false : true;
                    else if (operator === ">=") condition = (collaborator.order_star.filter(item => item < Number(value)).length > 0) ? false : true;
                    else if (operator === "<=") condition = (collaborator.order_star.filter(item => item > Number(value)).length > 0) ? false : true;
                    break;
                case "total_late_start":
                    if (operator === ">") condition = (Number(collaborator.total_late_start) > Number(value)) ? true : false;
                    else if (operator === "<") condition = (collaborator.total_late_start < Number(value)) ? true : false;
                    else if (operator === "==") condition = (collaborator.total_late_start === Number(value)) ? true : false;
                    else if (operator === "!=") condition = (collaborator.total_late_start !== Number(value)) ? true : false;
                    else if (operator === ">=") condition = (collaborator.total_late_start > Number(value) || collaborator.total_late_start === Number(value)) ? true : false;
                    else if (operator === "<=") condition = (collaborator.total_late_start < Number(value) || collaborator.total_late_start === Number(value)) ? true : false;
                    break;
                default:
                    break;
            }
            return condition;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkWithTypeCondition(type_condition, arrValue: boolean[], a?) {
        try {
            let result = false;
            if (type_condition === 'or') {
                arrValue.filter(i => i === true).length > 0 ? result = true : result = false;
            } else if (type_condition === 'and') {
                arrValue.filter(i => i === false).length > 0 ? result = false : result = true;
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async chooseRewardBasedOnTypeCondition(type_condition, arr_collaborator) {
        try {
            arr_collaborator = await this.sortArr(arr_collaborator);
            if (type_condition === 'or') {
                const payload: payloadCreateInfoRewardCollaborator = {
                    id_collaborator: arr_collaborator[0]._id,
                    id_reward_collaborator: arr_collaborator[0].id_reward_collaborator,
                    total_order: arr_collaborator[0].total_order,
                    total_job_hour: arr_collaborator[0].total_hour,
                    id_order: arr_collaborator[0].id_order,
                    money: arr_collaborator[0].money,
                    total_late_start: arr_collaborator[0].total_late_start
                }
                await this.infoRewardCollaboratorService.createItem('vi', payload)
            } else if (type_condition === 'and') {
                for (let collaborator of arr_collaborator) {
                    const payload: payloadCreateInfoRewardCollaborator = {
                        id_collaborator: collaborator._id1,
                        id_reward_collaborator: collaborator.id_reward_collaborator,
                        total_order: collaborator.total_order,
                        total_job_hour: collaborator.total_hour,
                        id_order: collaborator.id_order,
                        money: collaborator.money,
                        total_late_start: arr_collaborator[0].total_late_start

                    }
                    await this.infoRewardCollaboratorService.createItem('vi', payload)
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async sortArr(arr_collaborator) {
        try {
            const sortedValues = arr_collaborator.sort((a, b) => b.money - a.money);
            return sortedValues;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
