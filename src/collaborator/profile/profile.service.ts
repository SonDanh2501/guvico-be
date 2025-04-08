import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { autoChangeMoneyCollaboratorDTO, Collaborator, CollaboratorDocument, Customer, CustomerDocument, editAministrativeDTOCollaborator, editInforDTOCollaborator, ERROR, HistoryActivity, HistoryActivityDocument, iPageDTO, Order, OrderDocument, phoneDTO } from 'src/@core';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service';

@Injectable()
export class ProfileService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private jwtService: JwtService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,


        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,

    ) { }


    async editInfor(lang, payload: editInforDTOCollaborator, user) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            const checkEmailExisted = await this.collaboratorModel.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "" && checkEmailExisted.email !== getCollaborator.email) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            // const checkPhoneExisted = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            // if (checkPhoneExisted && checkPhoneExisted.phone !== getCustomer.phone) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            // }
            getCollaborator.email = payload.email || getCollaborator.email,
                getCollaborator.name = payload.name || getCollaborator.name,
                getCollaborator.avatar = payload.avatar || getCollaborator.avatar,
                getCollaborator.gender = payload.gender || getCollaborator.gender,
                getCollaborator.birthday = payload.birthday || getCollaborator.birthday,
                getCollaborator.city = payload.city || getCollaborator.city,
                getCollaborator.district = payload.district || getCollaborator.district,
                getCollaborator.avatar = payload.avatar || getCollaborator.avatar
            await getCollaborator.save();
            const payloadToken = {
                name: getCollaborator.name,
                email: getCollaborator.email,
                avatar: getCollaborator.avatar,
                phone: getCollaborator.phone,
                code_phone_area: getCollaborator.code_phone_area,
                _id: getCollaborator._id,
            }
            // getCollaborator.set({
            //     name: payload.name || null,
            //     avatar: payload.avatar || null,
            //     gender: payload.gender || null,
            //     birthday: payload.birthday || null,
            //     city: payload.city || null,
            //     district: payload.district || null,
            // });

            // await getCollaborator.save();
            const accessToken = await this.jwtService.sign(payloadToken);
            this.activityCollaboratorSystemService.editProfile(getCollaborator)

            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    } // không sài nữa

    async updateAministrative(lang, payload: editAministrativeDTOCollaborator, user) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            getCollaborator.city = payload.city || getCollaborator.city,
                getCollaborator.district = payload.district || getCollaborator.district,
                await this.collaboratorRepositoryService.findByIdAndUpdate(user._id, getCollaborator);
            const payloadToken = {
                name: getCollaborator.name,
                email: getCollaborator.email,
                avatar: getCollaborator.avatar,
                phone: getCollaborator.phone,
                code_phone_area: getCollaborator.code_phone_area,
                _id: getCollaborator._id,
            }
            const accessToken = await this.jwtService.sign(payloadToken);
            this.activityCollaboratorSystemService.editProfile(getCollaborator)
            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }// không sài nữa
    async getListInvite(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_inviter: user._id }
                ]
            }
            let arrCustomer = []
            let arrCollaborator = []
            const totalCustomer = await this.customerModel.count(query);
            const getCustomer = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const totalCollaborator = await this.collaboratorModel.count(query);
            const getCollaborator = await this.collaboratorModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            for (let item of getCustomer) {
                const total_order = await this.orderModel.count({
                    is_delete: false, id_customer: item._id
                })
                const total_done_order = await this.orderModel.count({
                    is_delete: false, id_customer: item._id, status: 'done'
                })
                const customer = {
                    _id: item._id,
                    full_name: item.full_name,
                    email: item.email,
                    phone: item.phone,
                    code_phone_area: item.code_phone_area,
                    id_view: item.id_view,
                    total_order: total_order,
                    total_done_order: total_done_order,
                    avatar: item.avatar,
                    rank_point: item.rank_point,
                    rank: item.rank
                }
                arrCustomer.push(customer);
            }
            for (let item of getCollaborator) {
                const total_done_job = await this.orderModel.count({
                    is_delete: false, id_collaborator: item._id, status: 'done'
                })

                const collaborator = {
                    _id: item._id,
                    full_name: item.full_name,
                    email: item.email,
                    phone: item.phone,
                    code_phone_area: item.code_phone_area,
                    id_view: item.id_view,
                    is_verify: item.is_verify,
                    total_done_job: total_done_job
                }
                arrCollaborator.push(collaborator);
            }
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total_customer: totalCustomer,
                customer: arrCustomer,
                total_collaborator: totalCollaborator,
                collaborator: arrCollaborator
            }
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getMoneyFromInvite(lang, user) {
        try {
            const query = {
                $and: [
                    { type: 'system_given_money' },
                    { id_collaborator: user._id }
                ]
            }
            const getTotalMoney = await this.historyActivityModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {},
                        total_money: {
                            $sum: '$value'
                        }
                    }
                }
            ])
            const result = {
                total_money: getTotalMoney.length > 0 ? getTotalMoney[0].total_money : 0
            }
            return result
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInfoByToken(lang, payload: phoneDTO) {
        try {
            const getCollaborator = await this.collaboratorModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] })
                .select({ password: 0, salt: 0 });
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getCollaborator;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getTotalFavourite(lang, user) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_favourite_collaborator: user._id }
                ]
            }
            const totalFavourite = await this.customerModel.count(query)
            return totalFavourite;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async setAutoChangeMoney(lang, payload: autoChangeMoneyCollaboratorDTO, user: any) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);
            getCollaborator.is_auto_change_money = (payload.is_auto_change_money !== getCollaborator.is_auto_change_money) ? payload.is_auto_change_money : getCollaborator.is_auto_change_money
            await this.collaboratorRepositoryService.findByIdAndUpdate(user._id, getCollaborator);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
