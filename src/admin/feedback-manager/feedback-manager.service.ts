import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, ERROR, GlobalService, iPageDTO, LOOKUP_CUSTOMER, POP_USER_SYSTEM, UserSystem, UserSystemDocument } from 'src/@core';
import { FeedBack, FeedBackDocument } from 'src/@core/db/schema/feedback.schema';
import { changeProcessHandleDTOAdmin, changeStatusDTOAdmin, createFeedbackDTOAdmin, editFeedbackDTOAdmin, iPageFeedbackDTOAdmin } from 'src/@core/dto/feedback.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { TypeFeedBack, TypeFeedBackDocument } from '../../@core/db/schema/type_feedback.schema';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

@Injectable()
export class FeedbackManagerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private globalService: GlobalService,
        private customerRepositoryService: CustomerRepositoryService,

        @InjectModel(FeedBack.name) private feedbackModel: Model<FeedBackDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(TypeFeedBack.name) private typeFeedBackModel: Model<TypeFeedBackDocument>,
    ) { }

    async getListItem(lang, iPage: iPageFeedbackDTOAdmin) {
        try {
            let query: any = {
                $and: [{
                    $or: [{
                        full_name: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    },
                    {
                        phone: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    }
                    ]
                },
                {
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                },

                ]
            }
            if (iPage.type !== "all") {
                const getTypeFeedback = await this.typeFeedBackModel.findOne({ type: iPage.type });
                if (getTypeFeedback) {
                    query.$and.push({
                        type: getTypeFeedback._id
                    })
                }

            }
            if (iPage.type_status !== "all") {
                query.$and.push({ status: iPage.type_status })
            }
            const arrItem = await this.feedbackModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'type', select: { name: 1 } })
                // .populate({ path: 'id_admin_action', select: { name: 1, full_name: 1, role: 1 } })
                .populate({ path: 'id_customer', select: { full_name: 1, phone: 1 } })
                .populate(POP_USER_SYSTEM("id_user_system_handle"))
                .populate(POP_USER_SYSTEM("history_user_system_handle.id_user_system_handle"));
            const count = await this.feedbackModel.count(query)
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
    async getListItemV2(lang, iPage: iPageFeedbackDTOAdmin, admin: UserSystemDocument) {
        try {

            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            { 'id_customer.full_name': { $regex: iPage.search } },
                            { 'id_customer.phone': { $regex: iPage.search } },
                            { 'id_customer.email': { $regex: iPage.search } },
                            { 'id_customer.id_view': { $regex: iPage.search } },
                        ]
                    }
                ]
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city;
            //     city.push(-1)
            //     query.$and.push({ 'id_customer.city': { $in: checkPermisstion.city } })
            // }
            if (iPage.type_status !== "all") {
                query.$and.push({ status: iPage.type_status })
            }
            const getList = await this.feedbackModel.aggregate([
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
                    $lookup: {
                        foreignField: '_id',
                        from: 'typefeedbacks',
                        localField: 'type',
                        as: 'type'
                    }
                },
                {
                    $unwind: { path: "$type" },
                },
                {
                    $project: {
                        'id_customer.password': 0, 'id_customer.salt': 0
                    }
                }
            ])

            const count = await this.feedbackModel.aggregate([
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
                lengh: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getList
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItem(lang, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.feedbackModel.findById(id)
                .populate({ path: 'type', select: { name: 1 } })
                .populate({ path: 'id_admin_action', select: { name: 1, full_name: 1, role: 1 } });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getCustomer = await this.customerModel.findById(getItem.id_customer).select({ city: 1 })
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createItem(lang, payload: createFeedbackDTOAdmin, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'cash')], HttpStatus.BAD_REQUEST);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const newItem = new this.feedbackModel({
                type: payload.type,
                body: payload.body,
                date_create: new Date(Date.now()).toISOString(),
                id_customer: payload.id_customer,
                name: getCustomer.name,
                phone: getCustomer.phone,
                code_phone_area: getCustomer.code_phone_area,
            });
            await newItem.save();
            this.activityAdminSystemService.createFeedBack(admin._id, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editFeedbackDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.feedbackModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(payload.id_customer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.ACCOUNT_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getItem.type = payload.type || getItem.type
            getItem.body = payload.body || getItem.body
            getItem.id_customer = payload.id_customer || getItem.id_customer
            getItem.name = getCustomer.name || getItem.name
            getItem.phone = getCustomer.phone || getItem.phone
            getItem.code_phone_area = getCustomer.code_phone_area || getItem.code_phone_area
            await getItem.save();
            this.activityAdminSystemService.editFeedBack(admin._id, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteFeedback(lang, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.feedbackModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(getItem.id_customer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.ACCOUNT_NOT_FOUND, lang, 'cash')], HttpStatus.BAD_REQUEST);
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteFeedBack(admin._id, getItem._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // khong dung nua
    // async processedItem(lang, id: string, admin: UserSystemDocument) {
    //     try {
    //         const getItem = await this.feedbackModel.findById(id);
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         const getCustomer = await this.customerModel.findById(getItem.id_customer);
    //         if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.ACCOUNT_NOT_FOUND, lang, 'cash')], HttpStatus.BAD_REQUEST);
    //         const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
    //         if (!checkPermisstion.permisstion) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
    //         }
    //         getItem.is_processed = true;
    //         getItem.date_processed = new Date(Date.now()).toISOString();
    //         getItem.id_admin_action = admin._id;
    //         await getItem.save();
    //         this.activityAdminSystemService.processedFeedBack(admin._id, getItem._id)
    //         return getItem;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    // khong dung nua
    // async changeStatus(lang, id: string, payload: changeStatusDTOAdmin, admin: UserSystemDocument) {
    //     try {
    //         const getItem = await this.feedbackModel.findById(id);
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         const getCustomer = await this.customerModel.findById(getItem.id_customer);
    //         if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.ACCOUNT_NOT_FOUND, lang, 'cash')], HttpStatus.BAD_REQUEST);
    //         const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
    //         if (!checkPermisstion.permisstion) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
    //         }
    //         getItem.status = payload.status;
    //         await getItem.save();
    //         this.activityAdminSystemService.changeStatusFeedback(admin._id, getItem._id);
    //         if (getItem.status === 'done') {
    //             this.processedItem(lang, getItem._id, admin._id);
    //         }
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }



    async updateHandleFeedback(lang, id: string, req: changeProcessHandleDTOAdmin, admin: UserSystemDocument) {
        try {
            const getItem = await this.feedbackModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const newObject = {
                id_user_system_handle: admin._id,
                status_handle: (req.status_handle) ? req.status_handle : getItem.status_handle,
                note_handle_admin: (req.note_handle_admin) ? req.note_handle_admin : getItem.note_handle_admin,
                date_create: new Date(Date.now()).toISOString()
            }
            getItem.note_handle_admin = newObject.note_handle_admin;
            getItem.status_handle = newObject.status_handle;
            getItem.id_user_system_handle = newObject.id_user_system_handle;
            getItem.history_user_system_handle.unshift(newObject);
            const result = await getItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
