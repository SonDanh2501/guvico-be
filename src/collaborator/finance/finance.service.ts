import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { eachMonthOfInterval, endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, ERROR, HISTORY_ACTIVITY_WALLET, iPageCollaboratorDTO, iPageHistoryOrderDTOCollaborator, iPageHistoryRemainderDTOCollaborator, iPageHistoryTransferDTOCollaborator, LOOKUP_ID_SERVICE, LOOKUP_SERVICE, Order, OrderDocument, SORT_DATE_WORK, TEMP_DATE_WORK, TEMP_DISCOUNT, TEMP_SERVICE_FEE, topupCollaboratorDTOCollaborator, TOTAL_COLLABORATOR_FEE, TOTAL_DISCOUNT, TOTAL_FINAL_FEE, TOTAL_GROSS_INCOME, TOTAL_ORDER, withdrawCollaboratorDTOCollaborator } from 'src/@core'
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema'
import { TransitionCollaborator, TransitionCollaboratorDocument } from 'src/@core/db/schema/transition_collaborator.schema'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { GlobalService } from 'src/@core/service'
import { PAYMENT_ENUM, TYPE_TRANSFER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum'
import { TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { PushNotiSystemService } from 'src/core-system/push-noti-system/push-noti-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'

@Injectable()
export class FinanceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private globalService: GlobalService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private generalHandleService: GeneralHandleService,
        private transactionRepositoryService: TransactionRepositoryService,
        private transactionSystemService: TransactionSystemService,
        private activitySystemService: ActivitySystemService,
        private pushNotiSystemService: PushNotiSystemService,
       private settingOopSystemService: SettingOopSystemService,

        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
    ) { }


    async getRemainder(lang, user) {
        try {
            const getDetailItem = await this.collaboratorModel.findOne({ _id: user._id });
            if (!getDetailItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const result = {
                remainder: getDetailItem.remainder,
                gift_remainder: getDetailItem.gift_remainder,
                work_wallet: getDetailItem.work_wallet,
                collaborator_wallet: getDetailItem.collaborator_wallet
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async historyFinanceJob(lang, iPage: iPageHistoryOrderDTOCollaborator, idUser) {
        try {
            const query = {
                $and: [
                    { id_collaborator: idUser },
                    {
                        $and: [
                            { date_work: { $lte: iPage.end_date } },
                            { date_work: { $gte: iPage.start_date } }
                        ]
                    },
                    { status: "done" },
                    { is_delete: false }
                ]
            }
            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
            const count = await this.orderModel.count(query)
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



    async historyFinanceJobWeek(lang, iPage: iPageHistoryOrderDTOCollaborator, idUser) {
        try {
            let timeStart = new Date(iPage.start_date).getTime();
            const timeEnd = new Date(iPage.end_date).getTime();
            const increaseDay = 86400000;
            const arrPromise = []
            const arrDate = [];
            const arrData = [];
            for (let i = timeStart; i < timeEnd; i = i + increaseDay) {
                const date = {
                    start: new Date(i),
                    end: new Date(i + increaseDay - 1)
                }
                const query = {
                    $and: [
                        {
                            id_collaborator: idUser
                        },
                        {
                            $and: [
                                { date_work: { $lte: new Date(date.end).toISOString() } },
                                { date_work: { $gte: new Date(date.start).toISOString() } }
                            ]
                        },
                        {
                            status: "done"
                        },
                        {
                            is_delete: false
                        }
                    ]
                }
                arrPromise.push(this.orderModel.find(query).select({ net_income_collaborator: 1 }));

                const arrItem = await this.orderModel
                    .find(query)
                    .sort({ date_work: -1, _id: 1 })
                    .skip(iPage.start)
                    .limit(iPage.length)
                    .populate({ path: 'service._id', select: { title: 1 } })
                    .populate({
                        path: 'id_customer',
                        select: {
                            avatar: 1,
                            name: 1,
                            code_phone_area: 1,
                            phone: 1,
                            gender: 1,
                        },
                    })
                    .populate({
                        path: 'service.optional_service._id',
                        select: { position: 1, screen: 1, type: 1, title: 1 },
                    })
                    .then();

                arrDate.push(date);
                arrData.push(arrItem);
                console.log("<<<<<<<<<<<<<<<,CHECK arrDate", arrDate);
            }
            const arrOrder = await Promise.all(arrPromise);
            const arrResult = [];
            for (let i = 0; i < arrOrder.length; i++) {
                let totalIncome = 0;
                for (const item of arrOrder[i]) {
                    totalIncome = totalIncome + item.net_income_collaborator;
                }
                const payload = {
                    date_start: arrDate[i].start,
                    date_end: arrDate[i].end,
                    total_income: totalIncome,
                    total_job: arrOrder[i].length,
                    data: arrData[i],
                }
                console.log(payload, 'payload')
                arrResult.push(payload);
            }
            return arrResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async historyFinanceJobMonth(lang, iPage: iPageHistoryOrderDTOCollaborator, idUser) {
        try {
            let timeStart = new Date(iPage.start_date).getTime();
            const timeEnd = new Date(iPage.end_date).getTime();
            const increaseDay = 604800000;
            const arrPromise = []
            const arrDate = [];
            for (let i = timeStart; i < timeEnd; i = i + increaseDay) {
                const date = {
                    start: new Date(i),
                    end: new Date(i + increaseDay - 1)
                }
                const query = {
                    $and: [
                        {
                            id_collaborator: idUser
                        },
                        {
                            $and: [
                                { date_work: { $lte: new Date(date.end).toISOString() } },
                                { date_work: { $gte: new Date(date.start).toISOString() } }
                            ]
                        },
                        {
                            status: "done"
                        },
                        {
                            is_delete: false
                        }
                    ]
                }
                arrPromise.push(this.orderModel.find(query).select({ net_income_collaborator: 1 }));
                arrDate.push(date);
            }
            const arrOrder = await Promise.all(arrPromise);
            console.log(arrOrder, "arrOrder")
            const arrResult = [];
            for (let i = 0; i < arrOrder.length; i++) {
                let totalIncome = 0;
                for (const item of arrOrder[i]) {
                    console.log(item, 'item')
                    totalIncome = totalIncome + item.net_income_collaborator;
                }
                const payload = {
                    date_start: arrDate[i].start,
                    date_end: arrDate[i].end,
                    total_income: totalIncome,
                    total_job: arrOrder[i].length
                }
                arrResult.push(payload);
            }
            return arrResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getGrossIncome(lang, idUser) {
        try {
            const query = {
                $and: [
                    {
                        id_collaborator: idUser
                    },
                    {
                        status: "done"
                    },
                    {
                        is_delete: false
                    }
                ]
            }
            const getOrder = await this.orderModel.find(query).select({ net_income_collaborator: 1, platform_fee: 1 });
            let totalGrossIncome = 0;
            for (const item of getOrder) {
                totalGrossIncome = totalGrossIncome + Number(item.net_income_collaborator);
            }
            const result = {
                totalGrossIncome: totalGrossIncome,
                totalJobDone: getOrder.length
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryRemainder(lang, iPage: iPageHistoryRemainderDTOCollaborator, idUser) {
        try {
            console.log('idUser ', idUser);
            const sixMonthsAgo  = new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)).toISOString()
            const query = {
                $and: [
                    {
                        $or: HISTORY_ACTIVITY_WALLET
                    },
                    {
                        id_collaborator: idUser
                    },
                    // {
                    //     $or: [
                    //         { type: "verify_top_up" },
                    //         { type: "verify_withdraw" },
                    //         { type: "receive_done_order" },
                    //         { type: "refund_platform_fee_cancel_order" },
                    //         { type: "minus_discount_platform_fee" },
                    //         { type: "minus_platform_fee" },
                    //         { type: "collaborator_minus_collaborator_fee" },
                    //         { type: "refund_collaborator_fee" },
                    //         { type: "verify_punish" },
                    //         { type: "collaborator_minus_platform_fee" },
                    //         { type: "collaborator_minus_pending_money" },
                    //         { type: "collaborator_refund_platform_fee" },
                    //         { type: "collaborator_refund_pending_money" },
                    //         { type: "collaborator_receive_platform_fee" },
                    //         { type: "collaborator_receive_refund_money" },
                    //         { type: "collaborator_penalty_cancel_job" },
                    //         { type: "system_given_money" },
                    //         { type: "receive_extra_collaborator_fee" },
                    //         { type: "system_verify_punish" },
                    //         { type: "collaborator_receive_bonus_money" },
                    //         { type: "admin_verify_info_reward_collaborator" },
                    //         { type: "system_verify_info_reward_collaborator" },
                    //         { type: "admin_cancel_punish" },
                    //         { type: "collaborator_change_money_wallet" },
                    //         { type: "auto_change_money_from_work_to_collaborator" },
                    //         { type: "collaborator_change_money_wallet" },
                    //         { type: "admin_support_change_money_wallet" },
                    //         // { type: "collaborator_holding" },
                    //     ]
                    // },
                    {
                        $and: [
                            { date_create: { $lte: iPage.end_date } },
                            { date_create: { $gte: iPage.start_date } }, 
                            { date_create: { $gte: sixMonthsAgo}}
                        ]
                    },
                    {
                        is_delete: false
                    }
                ]
            }
            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)

            const count = await this.historyActivityModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                start_date: iPage.start_date,
                end_date: iPage.end_date,
                data: arrItem,

            }

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailRemainderItem(lang, id: string) {
        try {
            const item = await this.historyActivityModel.findById(id);
            const transaction = await this.transactionRepositoryService.findOneById(item.id_transaction);
            return transaction;
        } catch (err) {
            throw new HttpException(
                err.response || [{ message: err.toString(), field: null }],
                HttpStatus.FORBIDDEN,
            );
        }
    }

    async topupAccount(lang, user, payload: topupCollaboratorDTOCollaborator) {
        try {
            const findCurrentTrasitionPending = await this.transactionRepositoryService.findOne({ id_collaborator: user._id, status: "pending", type_transfer: "top_up", payment_out: "bank" });
            if (findCurrentTrasitionPending) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.COLLABORATOR_HAVE_TRANSITION_EXISTED, lang, "transaction")], HttpStatus.BAD_REQUEST);
            const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCollaborator(user);
            const dataCreate: createTransactionDTO = {
                id_collaborator: user._id,
                money: payload.money,
                subject: 'collaborator',
                transfer_note: _transfer_note,
                type_transfer: TYPE_TRANSFER.top_up,
                payment_in: PAYMENT_ENUM.bank,
                payment_out: PAYMENT_ENUM.bank,
                type_wallet: TYPE_WALLET.work_wallet
            }
            const result = await this.transactionSystemService.createItem(dataCreate);
            this.activitySystemService.createTransaction(result)
            this.pushNotiSystemService.pushNotiCreateTopUpCollaborator(result);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async withdrawAccount(lang, user, payload: withdrawCollaboratorDTOCollaborator) {
        try {
            const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCollaborator(user);
            const getCollaboratorSetting = await this.settingOopSystemService.getCollaboratorSetting(lang)

            if(payload.money < getCollaboratorSetting.minimum_withdrawal_money) {
                const property = {
                    property: getCollaboratorSetting.minimum_withdrawal_money
                }
                throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.MONEY_MUST_BE_THAN_MINIMUM_WITHDRAWAL_MONEY, lang, property, 'minimum_withdrawal_money')], HttpStatus.NOT_FOUND);
            }

            if (payload.money > user.collaborator_wallet) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, "collaborator")], HttpStatus.BAD_REQUEST);
            }

            const remainingMoney = user.collaborator_wallet - payload.money
            if(remainingMoney < getCollaboratorSetting.minimum_collaborator_wallet) {
                const property = {
                    property: getCollaboratorSetting.minimum_collaborator_wallet
                }
                throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.MONEY_MUST_BE_THAN_MINIMUM_COLLABORATOR_WALLET, lang, property, 'minimum_collaborator_wallet')], HttpStatus.NOT_FOUND);
            }


            const dataCreate: createTransactionDTO = {
                id_collaborator: user._id,
                money: payload.money,
                subject: 'collaborator',
                transfer_note: _transfer_note,
                type_transfer: TYPE_TRANSFER.withdraw,
                payment_in: PAYMENT_ENUM.bank,
                payment_out: PAYMENT_ENUM.bank,
                type_wallet: TYPE_WALLET.collaborator_wallet
            }
            const transaction = await this.transactionSystemService.createItem(dataCreate);
            this.activitySystemService.createTransaction(transaction)
            this.pushNotiSystemService.pushNotiCreateWithdrawCollaborator(transaction);
            const previousBalance = {
                work_wallet: user.work_wallet,
                collaborator_wallet: user.collaborator_wallet,
            }
            const result = await this.transactionSystemService.holdingMoney(lang, transaction._id);
            this.activitySystemService.holdingMoney(result.collaborator, result.transaction, previousBalance);
            return result.transaction
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryTransfer(lang, iPage: iPageHistoryTransferDTOCollaborator, idUser) {
        try {
            const query = {
                $and: [
                    { "id_collaborator._id": idUser },
                    { type_transfer: { $in: ['withdraw', 'top_up'] } }
                ]
            }
            const arrItem = await this.transactionRepositoryService.getListPaginationDataByCondition(
                iPage, query
                ,
                {}, { date_create: -1, _id: 1 },
                [{ path: "id_collaborator", select: { name: 1, _id: 1 } }]
            );
            const count = await this.transactionRepositoryService.countDataByCondition({ id_collaborator: idUser });
            arrItem.totalItem = count;
            return arrItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItem(lang, id: string) {
        try {
            const item = await this.transactionRepositoryService.findOneById(id)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async transferedMoney(lang, user, id: string) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const item = await this.transactionRepositoryService.findOneById(id);
            if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transactions')], HttpStatus.NOT_FOUND);
            if (item.status === 'done') return item;
            if (item.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.BAD_REQUEST);
            item.status = 'transferred';
            await this.transactionRepositoryService.findByIdAndUpdate(id, item);
            this.activityCollaboratorSystemService.confirmTranfed(getCollaborator, item);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelTransaction(lang, user, id: string) {
        try {
            await this.transactionSystemService.cancelTransaction(lang, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeMoneyWallet(lang, payload, user) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // await this.collaboratorSystemService.changeMoneyWallet(getCollaborator, payload.money);
            if (payload.money > getCollaborator.collaborator_wallet) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN_COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, 'collaborator')], HttpStatus.FORBIDDEN);
            }
            const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCollaborator(user);
            const dataCreate: createTransactionDTO = {
                id_collaborator: user._id,
                money: payload.money,
                subject: 'collaborator',
                transfer_note: _transfer_note,
                type_transfer: TYPE_TRANSFER.change,
                payment_in: PAYMENT_ENUM.work_wallet,
                payment_out: PAYMENT_ENUM.collaborator_wallet,
                type_wallet: TYPE_WALLET.other
            }
            const transaction: TransactionDocument = await this.transactionSystemService.createItem(dataCreate);
            // transaction.status = 'done';
            // transaction.date_verify = new Date(Date.now()).toISOString();
            // await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
            this.activitySystemService.createTransaction(transaction);
            const previousBalance = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            const { collaborator } = await this.transactionSystemService.verifyTransaction(lang, transaction._id);
            this.activityCollaboratorSystemService.collaboratorChangeMoneyWallet(collaborator._id, Math.abs(transaction.money), previousBalance, transaction.payment_in)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    /**
     * 
     * @param lang ngôn ngữ trả lỗi
     * @param iPage  start_date : ngày bắt đầu  --- end_date : ngày kết thúc 
     * @param user thông tin CTV
     * @returns số công việc hoàn thành, số tiền nhận được, thông tin công việc 7 ngày gần nhất
     */
    async statisticMonth(lang, iPage: iPageCollaboratorDTO, user: CollaboratorDocument) {
        try {
            // console.log(iPage, 'iPage');
            // console.log(user._id, "user");
            // console.log(iPage.start_date, 'iPage.start_date');
            // console.log(iPage.end_date, 'iPage.end_date');

            
            
            
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: user._id },
                    { status: 'done' },
                    { date_work: { $gte: iPage.start_date } },
                    { date_work: { $lte: iPage.end_date } }
                ]
            }
            const report = await this.orderModel.aggregate([
                { $match: query },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: {},
                        total_job_done: TOTAL_ORDER,
                        total_income: TOTAL_COLLABORATOR_FEE,
                        total_final_fee: TOTAL_FINAL_FEE,
                        total_discount: TOTAL_DISCOUNT,
                        total_gross_income: TOTAL_GROSS_INCOME
                    }
                }
            ]);
            const totalItem = await this.orderModel.count(query);
            const getDataOrder = await this.orderModel.aggregate([
                { $match: query },
                { $addFields: TEMP_DATE_WORK },
                { $lookup: LOOKUP_ID_SERVICE },
                { $unwind: '$id_service' },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $addFields: {
                        order: {
                            _id: '$_id',
                            name_customer: '$name_customer',
                            id_collaborator: '$id_collaborator',
                            address: '$address',
                            net_income_collaborator: TOTAL_COLLABORATOR_FEE,
                            pending_money: '$pending_money',
                            final_fee: '$final_fee',
                            date_work: '$date_work',
                            end_date_work: '$end_date_work',
                            platform_fee: '$platform_fee',
                            payment_method: '$payment_method',
                            service: '$id_service.title',
                            id_view: '$id_view',
                            total_gross_income: TOTAL_GROSS_INCOME,
                            total_discount: TOTAL_DISCOUNT
                        }
                    }
                },
                { $sort: { date_work: 1 } },
                {
                    $group: {
                        _id: { "$dateToString": { "format": "%d/%m/%Y", "date": "$tempDate" } },
                        total_item: TOTAL_ORDER,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_final_fee: TOTAL_FINAL_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_discount: TOTAL_DISCOUNT,
                        data: { $push: '$order' },
                        sort_date_work: SORT_DATE_WORK,
                    },
                },
                { $sort: { sort_date_work: -1 } },
            ]);
            const resutl = {
                start: iPage.start,
                length: iPage.length,
                totalItem: totalItem,
                total_job_done: report.length > 0 ? report[0].total_job_done : 0,
                total_income: report.length > 0 ? report[0].total_income : 0,
                total_gross_income: report.length > 0 ? report[0].total_gross_income : 0,
                total_final_fee: report.length > 0 ? report[0].total_final_fee : 0,
                total_discount: report.length > 0 ? report[0].total_discount : 0,
                data: getDataOrder
            }
            return resutl;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async statisticCurrentMonth(lang, user) {
        try {
            const today = new Date();
            const startMonth = startOfMonth(today);
            const endMonth = endOfMonth(today);
            const start_date = (await this.generalHandleService.customStartAndEndOfDay(startMonth)).startDate;
            const end_date = (await this.generalHandleService.customStartAndEndOfDay(endMonth)).endDate;
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: user._id },
                    { status: 'done' },
                    { date_work: { $gte: start_date } },
                    { date_work: { $lte: end_date } }
                ]
            }
            const report = await this.orderModel.aggregate([
                { $match: query },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: '$service._id',
                        total_job_done: TOTAL_ORDER,
                        total_income: TOTAL_COLLABORATOR_FEE,
                        total_final_fee: TOTAL_FINAL_FEE,
                        total_discount: TOTAL_DISCOUNT,
                        total_gross_income: TOTAL_GROSS_INCOME
                    }
                },
                { $lookup: LOOKUP_SERVICE },
                { $unwind: '$id_service' },
                {
                    $project: {
                        'id_service.title': 1, total_job_done: 1, total_income: 1, total_final_fee: 1, _id: 1,
                        total_discount: 1, total_gross_income: 1
                    }
                },
                { $sort: { '_id': 1 } }
            ]);
            return report;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async overSixMonthAgo(lang, user) {
        try {
            const today = new Date();
            const arrMonth = eachMonthOfInterval(
                {
                    start: subMonths(today, 5),
                    end: today
                }
            )
            const data = [];
            for (let month of arrMonth) {
                const startMonth = startOfMonth(month);
                const endMonth = endOfMonth(month);
                const start_date = (await this.generalHandleService.customStartAndEndOfDay(startMonth)).startDate;
                const end_date = (await this.generalHandleService.customStartAndEndOfDay(endMonth)).endDate;
                const query = {
                    $and: [
                        { is_delete: false },
                        { id_collaborator: user._id },
                        { status: 'done' },
                        { date_work: { $gte: start_date } },
                        { date_work: { $lte: end_date } }
                    ]
                }
                const report = await this.orderModel.aggregate([
                    { $match: query },
                    {
                        $addFields: TEMP_SERVICE_FEE
                    },
                    {
                        $addFields: TEMP_DISCOUNT
                    },
                    {
                        $group: {
                            _id: {},
                            total_job_done: TOTAL_ORDER,
                            total_income: TOTAL_COLLABORATOR_FEE,
                            total_final_fee: TOTAL_FINAL_FEE,
                            total_discount: TOTAL_DISCOUNT,
                            total_gross_income: TOTAL_GROSS_INCOME
                        }
                    },
                    { $sort: { '_id': 1 } }
                ]);
                if (report.length > 0) {
                    const temp = {
                        ...report[0],
                        _id: start_date
                    }
                    data.push(temp);
                } else {
                    const temp = {
                        _id: start_date,
                        total_job_done: 0,
                        total_income: 0,
                        total_final_fee: 0,
                        total_discount: 0,
                        total_gross_income: 0
                    }
                    data.push(temp);
                }

            }
            return data;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
