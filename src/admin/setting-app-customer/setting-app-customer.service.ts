import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CustomerSetting, CustomerSettingDocument } from 'src/@core/db/schema/customer_setting.schema'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { editCustomerSettingDTOAdmin } from '../../@core/dto/customerSetting.dto'


@Injectable()
export class SettingAppCustomerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,
    ) { }

    async getSetting() {
        try {
            const getData = await this.customerSettingModel.findOne();
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editSetting(payload: editCustomerSettingDTOAdmin) {
        try {
            const getData = await this.customerSettingModel.findOne();
            getData.support_version_app = payload.support_version_app || getData.support_version_app;
            getData.background_header = payload.background_header || getData.background_header;
            getData.point_to_price = payload.point_to_price || getData.point_to_price;

            getData.ratio_of_price_to_point_member = payload.ratio_of_price_to_point_member || getData.ratio_of_price_to_point_member;
            getData.ratio_of_price_to_point_silver = payload.ratio_of_price_to_point_silver || getData.ratio_of_price_to_point_silver;
            getData.ratio_of_price_to_point_gold = payload.ratio_of_price_to_point_gold || getData.ratio_of_price_to_point_gold;
            getData.ratio_of_price_to_point_platium = payload.ratio_of_price_to_point_platium || getData.ratio_of_price_to_point_platium;

            getData.rank_member_minium_point = payload.rank_member_minium_point || getData.rank_member_minium_point;
            getData.rank_member_max_point = payload.rank_member_max_point || getData.rank_member_max_point;

            getData.rank_silver_minium_point = payload.rank_silver_minium_point || getData.rank_silver_minium_point;
            getData.rank_silver_max_point = payload.rank_silver_max_point || getData.rank_silver_max_point;

            getData.rank_gold_minium_point = payload.rank_gold_minium_point || getData.rank_gold_minium_point;
            getData.rank_gold_max_point = payload.rank_gold_max_point || getData.rank_gold_max_point;

            getData.rank_platinum_minium_point = payload.rank_platinum_minium_point || getData.rank_platinum_minium_point;
            getData.rank_platinum_max_point = payload.rank_platinum_max_point || getData.rank_platinum_max_point;

            getData.discount_change = payload.discount_change || getData.discount_change;
            getData.affiliate_discount_percentage = payload.affiliate_discount_percentage || getData.affiliate_discount_percentage;
            await getData.save();
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
