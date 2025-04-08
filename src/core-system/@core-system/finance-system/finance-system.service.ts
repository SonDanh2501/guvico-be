import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { RewardTicketOopSystemService } from 'src/core-system/@oop-system/reward-ticket-oop-system/reward-ticket-oop-system.service'
import { ServiceOopSystemService } from 'src/core-system/@oop-system/service-oop-system/service-oop-system.service'

@Injectable()
export class FinanceSystemService {
    constructor (
        private orderOopSystemService: OrderOopSystemService,
        private serviceOopSystemService: ServiceOopSystemService,
        private rewardTicketOopSystemService: RewardTicketOopSystemService,
    ) {}

    // async statisticIncome(lang, subjectAction, iPage, group, dataOrder) {
    //     try {
    //         const getData = await this.orderOopSystemService.statisticIncomeCollaborator(lang, subjectAction, iPage, group, dataOrder, iPage.start_date, iPage.end_date)
    //         return getData;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async statisticIncome(lang, subjectAction, group, startDate, endDate) {
        try {
            const getData = await this.orderOopSystemService.statisticIncome(lang, subjectAction, group, startDate, endDate)
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async  getOrderByGroupDate(lang, subjectAction, iPage, group) {
        try {
            const getData = await this.orderOopSystemService.getOrderByGroupDate(lang, subjectAction, iPage, group, iPage.start_date, iPage.end_date)
            return getData;
            // return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async statisticIncomeByService(lang, subjectAction, group, startDate, endDate) {
        try {
            const getData = await this.orderOopSystemService.statisticIncomeByService(lang, subjectAction, group, startDate, endDate)

            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async totalStatisticIncome(lang, subjectAction) {
        try {
            let [getData, totalRewardMoney]:any = await Promise.all([
                this.orderOopSystemService.totalStatisticIncome(lang, subjectAction),
                this.rewardTicketOopSystemService.getTotalRewardMoneyByIdCollaborator(subjectAction._id)
            ]) 
            getData = { ...getData, ...totalRewardMoney }
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalRewardMoneyByTimeFrame(subjectAction, group, startDate, endDate) {
        try {
            return await this.rewardTicketOopSystemService.getTotalRewardMoneyByIdCollaboratorAndTimeFrame(subjectAction._id, group, startDate, endDate)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
