import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { deleteAddressDTOAdmin, actiAddressDTOAdmin, iPageDTO, editAddressDTOAdmin, ERROR, GlobalService, createAddressDTOCustomer, addressDTO, Customer, CustomerDocument } from 'src/@core';
import { Address, AddressDocument } from 'src/@core/db/schema/address.schema';
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service';
import { AuthService } from '../auth/auth.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

@Injectable()
export class AddressService {

    constructor(
        private globalService: GlobalService,
        private authService: AuthService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,

        // private i18n: I18nContext,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,

    ) { }

    async getListItem(lang, iPage: iPageDTO, user) {
        try {
            let queryNotDefault: any = {
                $and: [
                    { id_user: user._id },
                    { is_delete: false },
                    { is_default_address: false },
                ]
            }
            const arrItemNotDefault = await this.addressModel.find(queryNotDefault).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.addressModel.count(queryNotDefault);
            let queryDefault: any = {
                $and: [
                    { id_user: user._id },
                    { is_delete: false },
                    { is_default_address: true },
                ]
            }
            let arrItemDefault = await this.addressModel.find(queryDefault).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count2 = await this.addressModel.count(queryDefault);
            arrItemDefault = arrItemDefault.concat(arrItemNotDefault);
            // query.$and.push({ is_default_address: true });
            // const getDefault = await this.addressModel.find(query)
            // let list = [];
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count + count2,
                data: arrItemDefault
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createAddressDTOCustomer, user) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            let result = { _id: null };
            if (payload.token && payload.token !== "" && payload.token !== null) {
                const convertToken = await this.globalService.decryptObject(payload.token);
                const newItem = new this.addressModel({
                    name: getCustomer.full_name || "",
                    address: convertToken.address,
                    lat: convertToken.lat,
                    lng: convertToken.lng,
                    type_address_work: payload.type_address_work,
                    note_address: payload.note_address || "",
                    id_user: getCustomer._id,
                    is_delete: false,
                });
                result = await newItem.save();
            } else {
                const newItem = new this.addressModel({
                    name: getCustomer.full_name || "",
                    address: payload.address,
                    lat: payload.lat,
                    lng: payload.lng,
                    type_address_work: payload.type_address_work,
                    note_address: payload.note_address || "",
                    id_user: getCustomer._id,
                    is_delete: false,
                });
                result = await newItem.save();
            }
            // const getCountAddress = await this.addressModel.count({ _id: user._id })
            const getDefaultAddress = await this.addressModel.findOne({ id_user: getCustomer._id, is_delete: false, is_default_address: true })
            if (!getDefaultAddress) { this.setIsDefaultAddress(lang, result._id, user); }
            this.activityCustomerSystemService.setDefaultAddress(user, result);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async setIsDefaultAddress(lang, idAddress, user) {
        try {
            const getAddressDefault = await this.addressModel.findOne({ id_user: user._id, is_default_address: true, is_delete: false })
            if (getAddressDefault) {
                getAddressDefault.is_default_address = false;
                await getAddressDefault.save();
            }
            const newDefault = await this.addressModel.findById(idAddress);
            if (!newDefault) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            newDefault.is_default_address = true;
            await newDefault.save();

            const getCustomer = await this.customerRepositoryService.findOneById(newDefault.id_user);
            getCustomer.default_address = newDefault._id;
            // const tempAddress = newDefault.address.split(",");
            // const administrative = {
            //     city: tempAddress[tempAddress.length - 1],
            //     district: tempAddress[tempAddress.length - 2]
            // }
            const callPromiseDistric = await Promise.all([
                this.generalHandleService.getCodeAdministrativeToString(newDefault.address),
                // this.serviceModel.findById(tempAddress.service["_id"])
            ]);
            const city: number = callPromiseDistric[0].city;
            const district: number = callPromiseDistric[0].district;
            getCustomer.city = city;
            getCustomer.district = district;
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id,getCustomer);
            this.activityCustomerSystemService.setIsDefaultAddress(user, newDefault)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getFirstAddress(lang, user) {
        try {
            const arrItem = await this.addressModel.findOne({ id_customer: user._id }).sort({ date_create: 1 }).then();
            const result = {
                data: arrItem.address
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async editItem(lang, idAddress, payload: editAddressDTOAdmin, user) {
        try {
            const getItem = await this.addressModel.findOne({ _id: idAddress, id_customer: user._id, is_delete: false });
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            let result = {};
            if (payload.token && payload.token !== "" && payload.token !== null) {
                const convertToken = await this.globalService.decryptObject(payload.token);
                getItem.address = convertToken.address || getItem.address;
                getItem.lat = convertToken.lat || getItem.lat;
                getItem.lng = convertToken.lng || getItem.lng;
                getItem.type_address_work = payload.type_address_work || getItem.type_address_work;
                getItem.name = payload.name || getItem.name;
                getItem.note_address = payload.note_address || getItem.note_address;
                if (payload.is_default_address) {
                    if (getItem.is_default_address === false) {
                        await this.setIsDefaultAddress(lang, getItem._id, user);
                    }
                }
                result = await getItem.save();
            } else {
                getItem.address = payload.address || getItem.address,
                    getItem.lat = payload.lat || getItem.lat,
                    getItem.lng = payload.lng || getItem.lng,
                    getItem.type_address_work = payload.type_address_work || getItem.type_address_work,
                    getItem.name = payload.name || getItem.name,
                    getItem.note_address = payload.note_address || getItem.note_address,
                    result = await getItem.save();
                if (payload.is_default_address) {
                    if (getItem.is_default_address === false) {
                        await this.setIsDefaultAddress(lang, getItem._id, user);
                    }
                }
            }
            // getItem.address = payload.address || getItem.address,
            // getItem.lat = payload.lat || getItem.lat,
            // getItem.lng = payload.lng || getItem.lng,
            // getItem.type_address_work = payload.type_address_work || getItem.type_address_work,
            // await getItem.save();
            this.activityCustomerSystemService.editAddress(user, getItem)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async adminActiAddress(lang, payload: actiAddressDTOAdmin, user) {
    //     try {
    //         const getItem = await this.addressModel.findOne({ id_customer: user._id });
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
    //         await getItem.save();
    //         return getItem;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    async deleteAddress(lang, idAddress, payload: deleteAddressDTOAdmin, user) {
        try {
            const getItem = await this.addressModel.findOne({ _id: idAddress, id_customer: user._id, is_delete: false });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const check = await this.addressModel.count({ id_user: getItem.id_user, is_delete: false });
            if (check < 2) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_DELETED, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            if (getItem.is_default_address) {
                const getLast = await this.addressModel.findOne({ is_delete: false, is_default_address: false }).sort({ date_create: -1 });
                const getCustomer = await this.customerRepositoryService.findOneById(getLast.id_user);
                if (getLast) {
                    getLast.is_default_address = true;
                    await getLast.save();
                    getCustomer.default_address = getLast._id;
                } else {
                    getCustomer.default_address = null;
                }
                await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            }
            getItem.is_default_address = false;
            await getItem.save();
            this.activityCustomerSystemService.deleteAddress(user, getItem)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async detailItem(lang, idAddress, user) {
        try {
            const getItem = await this.addressModel.findOne({ _id: idAddress, id_user: user._id, is_delete: false });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }






}
