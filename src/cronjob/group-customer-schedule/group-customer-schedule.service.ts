import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'
import { Model } from 'mongoose'
import { Customer, CustomerDocument } from 'src/@core'
import { GroupCustomerSystemService } from 'src/core-system/group-customer-system/group-customer-system.service'

@Injectable()
export class GroupCustomerScheduleService {
  constructor(
    private groupCustomerSystemService: GroupCustomerSystemService,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) { }

  private readonly logger = new Logger(GroupCustomerScheduleService.name);

  @Cron('0 0 20 * * *')
  // @Cron('0 * * * * *')
  async handleCron() {
    // xu ly order tim CTV
    // this.processConditionGroupCustomer();
    // this.logger.debug('processConditionGroupCustomer Called when second 1');
  }

  async processConditionGroupCustomer() {
    try {
      const iPageCustomer = {
        search: "",
        start: 0,
        length: 10,
      }
      let arrCustomer = []
      do {
        arrCustomer = await this.customerModel.find().select({ _id: 1 }).skip(iPageCustomer.start).limit(iPageCustomer.length);
        for (const item of arrCustomer) {
          await this.groupCustomerSystemService.updateConditionIn(item._id)
          await this.groupCustomerSystemService.updateConditionOut(item._id)
        }
        iPageCustomer.start = iPageCustomer.start + iPageCustomer.length;
      } while (Number(arrCustomer.length) == Number(iPageCustomer.length))


    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
