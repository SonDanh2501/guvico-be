import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { OptionalServiceSystemService } from '../optional-service-system/optional-service-system.service';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument, TransitionCustomer, TransitionCustomerDocument } from 'src/@core';
import { Model } from 'mongoose';

@Injectable()
export class TransitionCustomerService {
    constructor(
        private optionalService: OptionalServiceSystemService,
        private customExceptionService: CustomExceptionService,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,

    ) { }
    async createTransitionCustomer(lang, payload) {
        try {
            const newTransition = new this.transitionCustomerModel({
                id_customer: payload._id,
                money: payload.amount,
                date_create: new Date(Date.now()).toISOString(),
                transfer_note: payload.transfer_note,
                type_transfer: "top_up",
                status: "pending",
                method_transfer: payload.method_transfer,
                id_view: payload.id_view,
                payment_discount: payload.payment_discount || 0,
                momo_payment_method: payload.momo_payment_method
            })
            const result = await newTransition.save();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
