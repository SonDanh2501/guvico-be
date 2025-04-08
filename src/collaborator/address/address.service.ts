import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { deleteAddressDTOAdmin, actiAddressDTOAdmin, iPageDTO, editAddressDTOAdmin, ERROR, GlobalService, createAddressDTOCustomer, addressDTO, Customer, CustomerDocument, Collaborator, CollaboratorDocument, createAddressDTOCollaborator, editAddressDTOCollaborator } from 'src/@core';
import { Address, AddressDocument } from 'src/@core/db/schema/address.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service';
import { AuthService } from '../auth/auth.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';

@Injectable()
export class AddressService {

    constructor(
        private customExceptionService: CustomExceptionService,
        private globalService: GlobalService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private generalHandleService: GeneralHandleService,
        private collaboratorRepositoryService:CollaboratorRepositoryService,

        // private i18n: I18nContext,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,

    ) { }

    async getListItem(lang, iPage: iPageDTO, user) {
        try {
            // const query = {
            //     $and: [{
            //         $or: [{
            //             name: {
            //                 $regex: iPage.search,
            //                 $options: "i"
            //             },

            //             // phone: {
            //             //     $regex: iPage.search,
            //             //     $options: "i"
            //             // }
            //         }]
            //     },
            //     { id_user: user._id },
            //     ]
            // }

            let queryNotDefault: any = {
                $and: [
                    {
                        $or: [{
                            name: {
                                $regex: iPage.search,
                                $options: "i"
                            },
    
                            // phone: {
                            //     $regex: iPage.search,
                            //     $options: "i"
                            // }
                        }]
                    },
                    { id_user: user._id },
                    { is_delete: false },
                    { is_default_address: false },
                ]
            }

            let queryDefault: any = {
                $and: [
                    {
                        $or: [{
                            name: {
                                $regex: iPage.search,
                                $options: "i"
                            },
    
                            // phone: {
                            //     $regex: iPage.search,
                            //     $options: "i"
                            // }
                        }]
                    },
                    { id_user: user._id },
                    { is_delete: false },
                    { is_default_address: true },
                ]
            }

            const arrItemNotDefault = await this.addressModel.find(queryNotDefault).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);

            const count = await this.addressModel.count(queryNotDefault)

            let arrItemDefault = await this.addressModel.find(queryDefault).sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count2 = await this.addressModel.count(queryDefault);

            arrItemDefault = arrItemDefault.concat(arrItemNotDefault);

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

    async createItem(lang, payload: createAddressDTOCollaborator, user) {
        try {
            const convertToken = await this.globalService.decryptObject(payload.token);
            const checkAddress = await this.addressModel.count({ id_user: user._id })
            const newItem = new this.addressModel({
                name: user.full_name,
                address: convertToken.address,
                lat: convertToken.lat,
                lng: convertToken.lng,
                type_address_work: "house",
                note_address: "",
                id_user: user._id,
                type_user: 'collaborator',
                is_default_address: (checkAddress > 0) ? false : true,
                is_delete: false,
            });
            const result = await newItem.save();
            const checkNotDefault = await this.addressModel.count({ id_user: user._id, is_default_address: true })
            if (checkNotDefault === 0) {
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);

                const lastAddress = await this.addressModel.findOne({ id_user: user._id }).sort({ date_create: -1 })
                lastAddress.is_default_address = true
                getCollaborator.default_address = lastAddress._id;
                await lastAddress.save();
                await this.collaboratorRepositoryService.findByIdAndUpdate(user._id, getCollaborator);
            }
            // const getCountAddress = await this.addressModel.count({ id_user: user._id })
            // if (getCountAddress < 2) await this.setDefaultAddress(lang, result._id.toString(), user);
            // await this.activityCollaboratorSystemService.collaboratorCreateAddress(user, newItem)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async setDefaultAddress(lang, idAddress, user) {
        try {
            const getAddressDefault = await this.addressModel.findOne({ id_user: user._id, is_default_address: true })
            if (getAddressDefault) {
                getAddressDefault.is_default_address = false;
                await getAddressDefault.save();
            }
            const newDefault = await this.addressModel.findById(idAddress);
            if (!newDefault) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            newDefault.is_default_address = true;
            await newDefault.save();
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(newDefault.id_user);

            getCollaborator.default_address = newDefault._id;
            await getCollaborator.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(newDefault.id_user, getCollaborator);
            await this.activityCollaboratorSystemService.collaboratorsetDefaultAddress(user, newDefault)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getFirstAddress(lang, user) {
        try {
            const arrItem = await this.addressModel.findOne({ id_user: user._id }).sort({ date_create: 1, _id: 1 }).then();
            const result = {
                data: arrItem.address
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async editItem(lang, idAddress, payload: editAddressDTOCollaborator, user) {
        try {
            const getItem = await this.addressModel.findOne({ _id: idAddress, id_user: user._id });
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const convertToken = await this.globalService.decryptObject(payload.token);
            getItem.address = convertToken.address || getItem.address;
            getItem.lat = convertToken.lat || getItem.lat;
            getItem.lng = convertToken.lng || getItem.lng;
            if (payload.is_default_address) {
                if (getItem.is_default_address === false) {
                    await this.setDefaultAddress(lang, getItem._id, user);
                }
            }
            const result = await getItem.save();
            this.activityCollaboratorSystemService.collaboratorEditAddress(user, getItem)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async adminActiAddress(lang, payload: actiAddressDTOAdmin, user) {
    //     try {
    //         const getItem = await this.addressModel.findOne({ id_user: user._id });
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
    //         await getItem.save();
    //         return getItem;
    //     } catch (err) {
    //         throw new HttpException([{ message: err, type: null }], HttpStatus.FORBIDDEN);
    //     }
    // }
    async deleteAddress(lang, idAddress, user) {
        try {
            const getItem = await this.addressModel.findOne({ _id: idAddress, id_user: user._id });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // const result = await getItem.deleteOne({ _id: idAddress })
            getItem.is_delete = true
            await getItem.save()
            // getItem.is_delete = (payload.is_delete !== getItem.is_delete) ? payload.is_delete : getItem.is_delete
            // await getItem.save();
            this.activityCollaboratorSystemService.collaboratorDeleteAddress(user, getItem)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async detailItem(lang, idAddress, user) {
        try {
            const getItem = await this.addressModel.findOne({ _id: idAddress, id_user: user._id });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
