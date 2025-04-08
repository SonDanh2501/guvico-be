import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerRequest, CustomerRequestDocument } from '../../@core/db/schema/customer_request.schema';
import { Customer, CustomerDocument } from '../../@core/db/schema/customer.schema';
import { UserSystem, UserSystemDocument } from '../../@core/db/schema/user_system.schema';
import { GlobalService } from '../../@core/service/global.service';
import { LOOKUP_CUSTOMER, POP_CUSTOMER_CITY, iPageCustomerRequestDTOAdmin, iPageCustomerRequestDTOAdminV2 } from 'src/@core';
import { ERROR } from '../../@core/constant/i18n.field';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from '../../core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class CustomerRequestManagerService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        @InjectModel(CustomerRequest.name) private customerRequestModel: Model<CustomerRequestDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,


    ) { }

    async getListV2(lang, iPage: iPageCustomerRequestDTOAdminV2, admin: UserSystemDocument) {
        try {
            /////////////////// 111 phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city)
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district)
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district, iPage.id_service);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            ///////////////////  111 phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                'id_customer.phone': {
                                    $regex: iPage.search,
                                }
                            },
                            {
                                'id_customer.full_name': {
                                    $regex: iPage.search,
                                }
                            }
                        ]
                    }
                ]
            }
            if (iPage.status !== "all") {
                query.$and.push({ status: iPage.status })
            }
            if (iPage.contacted !== "all") {
                if (iPage.contacted === "contacted") {
                    query.$and.push({ is_contacted: true })
                    // query.$and.push({ date_admin_contact_create: { $gte: iPage.start_date } })
                    // query.$and.push({ date_admin_contact_create: { $lte: iPage.end_date } })
                } else if (iPage.contacted === "not_contacted") {
                    query.$and.push({ is_contacted: false })
                }
            }
            /////////////////// 222 phần phân quyền/ nhượng quyền khu vực ///////////////////
            // if (iPage.id_service !== 'all') {
            //     query.$and.push({ 'service._id': iPage.id_service });
            // } else if (checkPermisstion.id_service.length > 0) {
            //     query.$and.push({ 'service._id': { $in: checkPermisstion.id_service } });
            // }
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });

            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({ 'district': { $in: iPage.district } });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({ 'district': { $in: checkPermisstion.district } });
            }
            /////////////////// 222 phần phân quyền/nhượng quyền khu vực ///////////////////

            const getRequest = await this.customerRequestModel.aggregate([
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $match: query
                },
                {
                    $sort: { date_create: -1, _id: 1 }
                },
                {
                    $skip: Number(iPage.start)
                },
                {
                    $limit: Number(iPage.length)
                },
                {
                    $project: {
                        'id_customer.password': 0, 'id_customer.salt': 0,
                    }
                }
            ])
            const count = await this.customerRequestModel.aggregate(
                [
                    {
                        $lookup: LOOKUP_CUSTOMER
                    },
                    {
                        $unwind: { path: "$id_customer" },
                    },
                    {
                        $match: query
                    },
                    {
                        $count: 'total'
                    },

                ])
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getRequest,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getDetail(lang, idRequest, admin: UserSystemDocument) {
        try {
            const getRequest = await this.customerRequestModel.findById(idRequest)
                .populate(POP_CUSTOMER_CITY)
            if (!getRequest) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getRequest.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            return getRequest;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async contact(lang, idRequest, admin: UserSystemDocument) {
        try {
            const getRequest = await this.customerRequestModel.findById(idRequest).populate(POP_CUSTOMER_CITY)
            if (!getRequest) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getRequest.id_customer["city"]);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getRequest.is_contacted === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            getRequest.is_contacted = true;
            getRequest.date_admin_contact_create = new Date(Date.now()).toISOString();
            await getRequest.save();
            this.activityAdminSystemService.adminContactCustomerRequest(admin._id, getRequest._id, getRequest.id_customer["_id"]);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeStatus(lang, idRequest, admin: UserSystemDocument, payload) {
        try {
            const getRequest = await this.customerRequestModel.findById(idRequest).populate(POP_CUSTOMER_CITY)
            if (!getRequest) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getRequest.id_customer["city"]);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (payload.status === null && payload.status === "") throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            getRequest.status = payload.status;
            if(payload.status === "done") {
                getRequest.date_admin_contact_create = new Date().toISOString();
                getRequest.id_admin = admin._id;
                getRequest.full_name_admin = admin.full_name;
            } 
            getRequest.note_admin = payload.note_admin || "";
            await getRequest.save();
            this.activityAdminSystemService.adminChangeStatusCustomerRequest(admin._id, getRequest._id, getRequest.id_customer["_id"], getRequest.status);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async deleteRequest(lang, idRequest, admin: UserSystemDocument) {
        try {
            const getRequest = await this.customerRequestModel.findById(idRequest).populate({ path: 'id_customer', select: { city: 1 } })
            if (!getRequest) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getRequest.id_customer["city"]);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getRequest.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            getRequest.is_delete = true;
            await getRequest.save();
            this.activityAdminSystemService.adminDeleteCustomerRequest(admin._id, getRequest._id, getRequest.id_customer);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async adminNoteRequest(lang, idRequest, idAdmin, payload) {
        try {
            const getRequest = await this.customerRequestModel.findById(idRequest);
            if (!getRequest) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (getRequest.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            getRequest.note_admin = payload.note_admin;
            await getRequest.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
