import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, ERROR, iPageDTO } from 'src/@core';
import { FeedBack, FeedBackDocument } from 'src/@core/db/schema/feedback.schema';
import { TypeFeedBack, TypeFeedBackDocument } from 'src/@core/db/schema/type_feedback.schema';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service';

@Injectable()
export class FeedbackService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private customerRepositoryService: CustomerRepositoryService,




        @InjectModel(FeedBack.name) private feedbackModel: Model<FeedBackDocument>,
        @InjectModel(TypeFeedBack.name) private typeFeedbackModel: Model<TypeFeedBackDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }


    async getListTypeFeedback(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [
                    {
                        is_active: true
                    },
                    {
                        $or: [
                            { is_delete: false },
                            { is_delete: { $exists: false } }
                        ]
                    }
                ]
            }
            const arrItem = await this.typeFeedbackModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.typeFeedbackModel.count(query)
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

    async createItem(lang, payload, user) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(user._id);
            if (!findCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'cash')], HttpStatus.BAD_REQUEST);
            const newItem = new this.feedbackModel({
                type: payload.type,
                body: payload.body,
                id_customer: findCustomer._id,
                name: findCustomer.name,
                full_name: findCustomer.full_name,
                phone: findCustomer.phone,
                code_phone_area: findCustomer.code_phone_area,
                date_create: new Date(Date.now()).toISOString(),
                id_admin_action: null,
            })
            const result = await newItem.save();
            this.activityCustomerSystemService.newFeedback(user._id, result._id);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
