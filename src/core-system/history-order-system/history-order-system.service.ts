import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryOrder, HistoryOrderDocument } from 'src/@core/db/schema/history_order.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';
@Injectable()
export class HistoryOrderSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        // @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        // @InjectModel(HistoryCustomer.name) private historyCustomerModel: Model<HistoryCustomerDocument>,
        @InjectModel(HistoryOrder.name) private historyOrderModel: Model<HistoryOrderDocument>,
    ) { }


    async newActivityOrder(payload, status) {
        try {
            const newItem = new this.historyOrderModel({
                id_customer: payload.id_customer,
                id_collaborator: (payload.id_collaborator) ? payload.id_collaborator : null,
                status: status,
                id_order: payload.id_order,
                date_create: new Date(Date.now()).toISOString(),
                creator: payload.creator,
                id_creator: payload.id_creator
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async newOrder(payload, status) {
        try {
            const newItem = new this.historyOrderModel({
                id_customer: payload.id_customer,
                id_collaborator: null,
                status: "pending",
                id_order: payload.id_order,
                date_create: new Date(Date.now()).toISOString(),
                creator: payload.creator,
                id_creator: payload.id_creator
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrder(payload, status) {
        try {
            const newItem = new this.historyOrderModel({
                id_customer: payload.id_customer,
                id_collaborator: null,
                status: "pending",
                id_order: payload.id_order,
                date_create: new Date(Date.now()).toISOString(),
                creator: payload.creator,
                id_creator: payload.id_creator
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

}
