import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { AutomationRepositoryService } from 'src/@repositories/repository-service/automation-repository/automation-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class AutomationOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private automationRepositoryService: AutomationRepositoryService
    ) { }

    async getDetailItem(lang, idCustomer) {
        try {
            const getCustomer = await this.automationRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "automation")], HttpStatus.NOT_FOUND)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAutomationBySchedule(schedule_trigger) {
        try {
            const query = {
                $and: [
                    { type_trigger: 'schedule' },
                    { status: 'doing' },
                    { schedule_trigger: schedule_trigger }
                ]
            }

            const result = await this.automationRepositoryService.getListDataByCondition(query);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAutomationByAfterTrigger(action_trigger) {
        try {
            const query = {
                $and: [
                    { type_trigger: 'after_action' },
                    { status: 'doing' },
                    { action_trigger: action_trigger }
                ]
            }

            return await this.automationRepositoryService.getListDataByCondition(query);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
