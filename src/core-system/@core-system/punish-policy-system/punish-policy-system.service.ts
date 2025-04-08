import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { iPageDTO } from 'src/@core'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { PunishPolicyOopSystemService } from 'src/core-system/@oop-system/punish-policy-oop-system/punish-policy-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'

@Injectable()
export class PunishPolicySystemService {
  constructor(
    private punishPolicyOopSystemService: PunishPolicyOopSystemService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService,
  ) {}

  async createNewItem(lang, subjectAction, payload) {
    try {
      const payloadDependency = {
        punish_policy: null,
        admin_action: null,
      }

      if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
      }

      payloadDependency.punish_policy = await this.punishPolicyOopSystemService.createItem(payload)
      await this.historyActivityOopSystemService.createPunishPolicy(subjectAction, payloadDependency)

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getListItem(lang, iPage: iPageDTO) {
    try {
        return await this.punishPolicyOopSystemService.getList(iPage)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDetailItem(lang, idItem) {
    try {
        return this.punishPolicyOopSystemService.getDetailItem(lang, idItem)
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateItem(lang, subjectAction, idItem, payload) {
    try {
      const payloadDependency = {
        punish_policy: null,
        admin_action: null,
      }
      if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
      }
      payloadDependency.punish_policy = await this.punishPolicyOopSystemService.updateItem(lang, idItem, payload)
      await this.historyActivityOopSystemService.updatePunishPolicy(subjectAction, payloadDependency)
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
