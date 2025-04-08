import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createCustomerRequestDTOCustomer, ERROR } from 'src/@core';
import { Customer, CustomerDocument } from '../../@core/db/schema/customer.schema';
import { CustomerRequestDocument, CustomerRequest } from '../../@core/db/schema/customer_request.schema';
import { GlobalService } from '../../@core/service/global.service';
import { AddressDocument } from '../../@core/db/schema/address.schema';
import { ActivityCustomerSystemService } from '../../core-system/activity-customer-system/activity-customer-system.service';
import { GeneralHandleService } from '../../@share-module/general-handle/general-handle.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

@Injectable()
export class RequestService {
    constructor(
        private globalService: GlobalService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerRequest.name) private customerRequestModel: Model<CustomerRequestDocument>

    ) { }

    async createItem(lang, payload: createCustomerRequestDTOCustomer, user) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const convertToken = await this.globalService.decryptObject(payload.token);
            if (payload.token === "" || payload.token === null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            // const tempAddress = convertToken.address.split(",");
            // const tempAdministrative = {
            //     city: tempAddress[tempAddress.length - 1],
            //     district: tempAddress[tempAddress.length - 2]
            // }
            const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);
            // if (getCodeAdministrative.city !== 79) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADDRESS_NOT_SUPPORT, lang, 'address')], HttpStatus.BAD_REQUEST);
            // }
            const newItem = new this.customerRequestModel({
                address: payload.address,
                lat: convertToken.lat,
                lng: convertToken.lng,
                id_customer: getCustomer._id,
                description: payload.description,
                date_create: new Date(Date.now()).toISOString(),
                id_service: payload.id_service,
                is_delete: false,
                status: "pending",
                is_contacted: false,
                note_admin: "",
                name_customer: getCustomer.full_name,
                phone_customer: getCustomer.phone,
                district: getCodeAdministrative.district,
                city: getCodeAdministrative.city,
            })
            await newItem.save();
            await this.activityCustomerSystemService.customerRequest(getCustomer, newItem.id_service, newItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
