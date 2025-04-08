import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerSetting, CustomerSettingDocument } from 'src/@core/db/schema/customer_setting.schema';

@Injectable()
export class SettingService {
    constructor(
        @InjectModel(CustomerSetting.name) private customerSettingSchema: Model<CustomerSettingDocument>,
    ) { }

    async getSetting() {
        try {
            const getItem = await this.customerSettingSchema.findOne();
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
