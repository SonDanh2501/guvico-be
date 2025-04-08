import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../@core/db/schema/customer.schema';
import { CustomerSetting, CustomerSettingDocument } from '../../@core/db/schema/customer_setting.schema';
import { TransitionCustomer, TransitionCustomerDocument } from '../../@core/db/schema/transition_customer.schema';
import { ActivitySystemService } from '../activity-system/activity-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

@Injectable()
export class PaymentSystemService {
    constructor(
        private activitySystemService: ActivitySystemService,
        // private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,

    ) { }

    async paymentDiscount(idCustomer, idTransitionCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getCustomerSettings = await this.customerSettingModel.findOne();
            const getTransitionCustomer = await this.transitionCustomerModel.findById(idTransitionCustomer);
            if (getCustomerSettings.discount_change.length < 1) return true;
            for (let item of getCustomerSettings.discount_change) {
                if (getTransitionCustomer.money >= item["min_money"] && item["value"] > 0) {
                    let check: boolean = false;
                    for (let method of item["method"]) {
                        if (getTransitionCustomer.method_transfer === method) {
                            check = true;
                        }
                        if (check) {
                            let money: number;
                            if (item["type"] === "percent") {
                                money = ((getTransitionCustomer.money) / 100) * item["value"];
                            } else if (item["type"] === "amount") {
                                money = item["value"];
                            }
                            if (money > 0) {
                                if (item["is_max_money"] && money > item["max_money"]) {
                                    money = Number(item["max_money"]);
                                }
                                getCustomer.pay_point += money;
                                getTransitionCustomer.payment_discount += money;
                                getTransitionCustomer.pay_point_current = getCustomer.pay_point;
                                await getTransitionCustomer.save();
                                await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
                                this.activitySystemService.systemGiveMoneyPaymentDiscount(getCustomer._id, getTransitionCustomer._id, money)
                                return true;
                            }
                        }
                    }

                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
