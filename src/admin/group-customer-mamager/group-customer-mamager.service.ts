import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { activeGroupServiceDTOAdmin, coditionDTOGroupCustomer, createGroupCustomerDTOAdmin, Customer, CustomerDocument, editGroupCustomerDTOAdmin, ERROR, GlobalService, GroupCustomer, GroupCustomerDocument, iPageDTO } from 'src/@core';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class GroupCustomerMamagerService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(GroupCustomer.name) private groupCustomerModel: Model<GroupCustomerDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }


    async getListItem(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {
                        $or: [
                            {
                                name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            }
                        ]
                    },
                    {
                        $or: [
                            { is_delete: false },
                            { is_delete: { $exists: false } }
                        ]
                    }
                ]
            }
            const arrItem = await this.groupCustomerModel.find(query)
                .sort({ date_create: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.groupCustomerModel.count(query)
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


    async getDetailItem(lang, id: string) {
        try {
            const findItem = await this.groupCustomerModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createItem(lang, payload: createGroupCustomerDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.groupCustomerModel({
                name: payload.name,
                description: payload.description,
                date_create: new Date(Date.now()).toISOString(),
                condition_in: payload.condition_in,
                condition_out: payload.condition_out
            });
            await newItem.save();
            await this.activityAdminSystemService.createGroupCustomer(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editGroupCustomerDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.groupCustomerModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.name = payload.name || getItem.name,
                getItem.description = payload.description || getItem.description,
                getItem.condition_in = payload.condition_in || getItem.condition_in,
                getItem.condition_out = payload.condition_out || getItem.condition_out
            await getItem.save();
            await this.activityAdminSystemService.createGroupCustomer(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            // await this.groupCustomerModel.findByIdAndDelete(id);
            // await this.activityAdminSystemService.createGroupCustomer(idAdmin, id);
            // return `Delete ${id} successfully`;

            const groupCustomer = await this.groupCustomerModel.findById(id);
            if (!groupCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            await this.filterCustomer(id);
            groupCustomer.is_delete = true;
            await groupCustomer.save();
            await this.activityAdminSystemService.deleteGroupCustomer(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async actiItem(lang, payload: activeGroupServiceDTOAdmin, id, idAdmin) {
        try {
            console.log('.....>>> ', payload);

            const groupCustomer = await this.groupCustomerModel.findById(id);
            if (!groupCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            console.log('>>>>>@>,', groupCustomer.is_active);

            groupCustomer.is_active = (payload.is_active === groupCustomer.is_active) ? groupCustomer.is_active : payload.is_active;
            await groupCustomer.save();
            if (payload.is_active === false) {
                await this.filterCustomer(id);
            }
            await this.activityAdminSystemService.actiGroupCustomer(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async filterCustomer(idGroupCustomer: string) {
        try {
            const query = {
                $and: [
                    {
                        id_group_customer: { $in: idGroupCustomer }
                    }
                ]
            }
            const arrCustomer = await this.customerModel.find(query);
            let arrTemp = [];
            for (const item of arrCustomer) {
                arrTemp = item.id_group_customer.filter((i: string) => i !== idGroupCustomer);
                item.id_group_customer = arrTemp;
                await item.save();
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListCustomerByGroupCustomer(lang, iPage: iPageDTO, idGroupCustomer, user) {
        try {
            const query = {
                $and: [
                    {
                        $or: [
                            {
                                full_name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                                phone: {
                                    $regex: iPage.search,
                                    $options: "i"
                                },
                            }
                        ]
                    },
                    { is_delete: false },
                    { id_group_customer: idGroupCustomer }
                ]
            }
            const arrItem = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.customerModel.count(query);
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


    async addCustomerInGroup(lang, req, id, arrCustomer, user) {
        try {
            const checkGroupCustomer = await this.groupCustomerModel.findById(id);
            if (!checkGroupCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);

            const getListCustomer = await this.customerModel.find({ $and: [{ _id: arrCustomer }, { id_group_customer: checkGroupCustomer._id }] }).select({ _id: 1 });
            if (getListCustomer) {
                getListCustomer
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async removeCustomerOutGroup(lang, req, id, arrCustomer, user) {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
