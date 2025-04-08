import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { ObjectId } from 'bson'
import { endOfMonth, getMonth, startOfMonth } from 'date-fns'
import mongoose, { Model } from 'mongoose'
import { actiCollaboratorDTOAdmin, changeMoneyCollaborator, createCollaboratorDTOAdmin, Customer, CustomerDocument, deleteCollaboratorTransDTOAdmin, editCollaboratorDTOAdmin, editCollaboratorTransDTOAdmin, editDocumentCollaboratorDTOAdmin, editPersonalInforCollaboratorDTOAdmin, ERROR, GlobalService, HISTORY_ACTIVITY_WALLET, INFO_CUSTOMER, iPageDTO, iPageListCollaboratorDTOAdmin, iPageTransferCollaboratorDTOAdmin, iPageTransitionCollaboratorDTOAdmin, lockCollaboratorDTOAdmin, LOOKUP_ADMIN_VERIFY, LOOKUP_COLLABORATOR, Order, OrderDocument, POP_COLLABORATOR_INFO, POP_CUSTOMER_INFO, PunishCollaboratorDTOAdmin, STAR_ORDER, TEMP_DISCOUNT, TEMP_SERVICE_FEE, TOTAL_COLLABORATOR_FEE, TOTAL_DISCOUNT, TOTAL_GROSS_INCOME, TOTAL_HOUR, TOTAL_INCOME, TOTAL_NET_INCOME, TOTAL_NET_INCOME_BUSINESS, TOTAL_ORDER, TOTAL_ORDER_FEE, TOTAL_PUNISH_MONEY, TOTAL_REVIEW, TOTAL_SERVICE_FEE, TOTAL_TIP_COLLABORATOR, TranferMoneyCollaboratorDTOAdmin, verifyCollaboratorTransDTOAdmin, WithdrawMoneyCollaboratorDTOAdmin } from 'src/@core'
import { Collaborator, CollaboratorDocument } from 'src/@core/db/schema/collaborator.schema'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { DeviceToken, DeviceTokenDocument } from 'src/@core/db/schema/device_tokens.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema'
import { InfoTestCollaborator } from 'src/@core/db/schema/info_test_collaborator.schema'
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema'
import { TransitionCollaborator, TransitionCollaboratorDocument } from 'src/@core/db/schema/transition_collaborator.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { InviteCodeSystemService } from 'src/core-system/invite-code-system/invite-code-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'
import { NotificationService } from 'src/notification/notification.service'
import { Service, ServiceDocument } from '../../@core/db/schema/service.schema'
import { UserSystem, UserSystemDocument } from '../../@core/db/schema/user_system.schema'
import { changeHandleProfileDTOAdmin, dashBoardCollaboratorDTOAdmin, editAcounntBankCollaboratorDTOAdmin, iPageGetCollaboratorByTypeDTOAdmin, iPageGetCollaboratorCanConfirmJobDTOAdmin, iPageGetCollaboratorDTOAdmin, iPageHistoryActivityCollaboratorDTOAdmin, iPageHistoryOrderDTOCollaborator, lockCollaboratorV2DTOAdmin } from '../../@core/dto/collaborator.dto'
import { PunishManagerService } from '../punish-manager/punish-manager.service'
@Injectable()
export class CollaboratorManagerService {
    constructor(
        private globalService: GlobalService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private notificationService: NotificationService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        private orderSystemService: OrderSystemService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private gobalService: GlobalService,
        private punishManagerService: PunishManagerService,
        private collaboratorSystemService: CollaboratorSystemService,
        private orderRepositoryService: OrderRepositoryService,

        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private transactionSystemService: TransactionSystemService,

        // private i18n: I18nContext,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,

        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<InfoTestCollaborator>,


    ) { }


    async onApplicationBootstrap(): Promise<any> {
        const checkItemSeed = await this.collaboratorSettingModel.findOne()
        if (!checkItemSeed) {
            const newItem = new this.collaboratorSettingModel({
                max_distance_order: 10000,
                support_version_app: "1.0.0"
            });
            await newItem.save();
            console.log("seed data collaborator setting success");
        }

        // await this.collaboratorModel.updateMany({remainder: {$exists: false }}, {$set: {remainder: 0}});
        // await this.collaboratorModel.updateMany({point: {$exists: false }}, {$set: {point: 0}});
        // await this.collaboratorModel.updateMany({$set: {remainder: 5000000}});



        // const  = await this.collaboratorModel.find();
        // for (const item of ) {
        //     if(!item.gender) {
        //         item["gender"] = "other";
        //         item.save();
        //     } 
        //     console.log("check")
        // }
    }

    // khong dung nua
    // async getListItem(lang, iPage: iPageDTO, admin) {
    //     try {
    //         // const checkPermisstion = await this.gobalService.checkPermissionArea(admin);
    //         // if (!checkPermisstion.permisstion) {
    //         //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, 'city')], HttpStatus.BAD_REQUEST);
    //         // }
    //         let query: any = {
    //             $and: [
    //                 {
    //                     $or: [
    //                         {
    //                             phone: {
    //                                 $regex: iPage.search,
    //                                 $options: "i"
    //                             }
    //                         },
    //                         {
    //                             full_name: {
    //                                 $regex: iPage.search,
    //                                 $options: "i"
    //                             }
    //                         },
    //                         {
    //                             email: {
    //                                 $regex: iPage.search,
    //                                 $options: "i"
    //                             }
    //                         },
    //                         {
    //                             identity_number: {
    //                                 $regex: iPage.search,
    //                                 $options: "i"
    //                             }
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     $or: [
    //                         { is_delete: false },
    //                         { is_delete: { $exists: false } }
    //                     ]
    //                 },
    //             ],
    //         }
    //         // if (admin.id_role_admin["is_area_manager"]) {
    //         //     const city: number[] = checkPermisstion.city;
    //         //     city.push(-1)
    //         //     query.$and.push({ city: { $in: checkPermisstion.city } })
    //         // }
    //         const arrItem = await this.collaboratorModel.find(query)
    //             .sort({ date_create: -1, _id: 1 })
    //             .skip(iPage.start)
    //             .limit(iPage.length)
    //         const count = await this.collaboratorModel.count(query)
    //         const result = {
    //             start: iPage.start,
    //             length: iPage.length,
    //             totalItem: count,
    //             data: arrItem
    //         }
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async getDetailItem(lang, id: string, admin) {
        try {

            const getCollaborator = await this.collaboratorRepositoryService.findOneById(id)
            // .select({ password: 0, salt: 0 })
            // .populate({ path: 'service_apply', select: { title: 1, type_partner: 1, thumbnail: 1, description: 1 } })
            if (!getCollaborator) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const getPermisstion = await this.gobalService.checkPermissionArea(admin, getCollaborator.city);
            if (!getPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, 'city')], HttpStatus.BAD_REQUEST);
            }
            return getCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminCreateItem(lang, payload: createCollaboratorDTOAdmin, admin) {
        try {
            const getPermisstion = await this.gobalService.checkPermissionArea(admin, payload.city);
            if (!getPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, 'city')], HttpStatus.BAD_REQUEST);
            }
            //const checkPhoneExisted = await this.collaboratorModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            const checkPhoneExisted = await this.collaboratorRepositoryService.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });

            if (checkPhoneExisted) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            }
            //const checkEmailExisted = await this.collaboratorModel.findOne({ email: payload.email });
            const checkEmailExisted = await this.collaboratorRepositoryService.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            const salt = await bcrypt.genSalt();
            const password_default = await this.generalHandleService.GenerateRandomNumberString(6);
            const password = await bcrypt.hash(password_default, salt);

            let resultCode = "";
            let checkCodeInvite = false;
            do {
                resultCode = await this.generalHandleService.GenerateRandomString(6);
                const checkDuplicate = await Promise.all([
                    //this.customerModel.findOne({ invite_code: resultCode }),
                    //this.collaboratorModel.findOne({ invite_code: resultCode }),
                    this.collaboratorRepositoryService.findOne({ invite_code: resultCode }),
                    this.customerRepositoryService.findOne({ invite_code: resultCode }),
                ]);
                checkCodeInvite = (checkDuplicate[0] || checkDuplicate[1]) ? true : false;
            } while (checkCodeInvite === true);


            const getCollaboratorLastest = await this.collaboratorModel.find({ city: payload.city }).sort({ ordinal_number: -1 }).limit(1);




            let tempOrdinal;
            if (getCollaboratorLastest.length > 0) {
                tempOrdinal = getCollaboratorLastest[0].ordinal_number + 1;
            } else {
                tempOrdinal = 1;
            }

            let tempIdView = '00000';
            tempIdView = `${tempIdView}${tempOrdinal}`;
            tempIdView = tempIdView.slice(-5);
            let tempCity = `${payload.city}`;
            if (payload.city < 10) {
                tempCity = `0${payload.city}`
            }
            tempIdView = `CTV${tempCity}${tempIdView}`
            let getIdInviter = null;
            if (payload.id_inviter && payload.id_inviter !== "" && payload.id_inviter !== null) {
                //const getInviter = await this.collaboratorModel.findById(payload.id_inviter);
                const getInviter = await this.collaboratorRepositoryService.findOneById(payload.id_inviter);
                if (!getInviter) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                getIdInviter = getInviter._id;
            }
            const newCollaborator = new this.collaboratorModel({
                phone: payload.phone,
                code_phone_area: payload.code_phone_area,
                password: password,
                password_default: password_default,
                salt: salt,
                name: payload.full_name,
                full_name: payload.full_name,
                identity_number: payload.identity_number,
                email: payload.email,
                date_create: payload.date_create,
                id_view: tempIdView,
                ordinal_number: tempOrdinal,
                city: payload.city,
                district: payload.district || [],
                invite_code: resultCode,
                id_inviter: getIdInviter,
                type: payload.type,
                service_apply: payload.service_apply || [],
                id_business: payload.id_business || null
            });
            await newCollaborator.save();
            this.activityAdminSystemService.createCollaborator(admin._id, newCollaborator._id);
            // this.sendOTP(lang, payload);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async adminEditCollaborator(lang, payload: editCollaboratorDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            //const getItem = await this.collaboratorModel.findById(id);
            const getItem = await this.collaboratorRepositoryService.findOneById(id);

            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "collaborator")], HttpStatus.BAD_REQUEST);
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const checkEmailExisted = await this.collaboratorModel.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "" && checkEmailExisted.email !== getItem.email) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            const checkPhoneExisted = await this.collaboratorModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (checkPhoneExisted && checkPhoneExisted.phone !== getItem.phone) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (payload.id_inviter && getItem.id_inviter !== null) {
                if (getItem.id_inviter.toString().localeCompare(payload.id_inviter.toString()) > 0) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.INVITER_EXIST, lang, "id_inviter")], HttpStatus.BAD_REQUEST);
                }
            }
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.email = payload.email || getItem.email
            getItem.name = payload.full_name || getItem.full_name
            getItem.full_name = payload.full_name || getItem.full_name
            getItem.code_phone_area = payload.code_phone_area || getItem.code_phone_area
            getItem.phone = payload.phone || getItem.phone
            getItem.avatar = payload.avatar || getItem.avatar
            const low = getItem.full_name.toLocaleLowerCase()
            const nomark = await this.generalHandleService.cleanAccents(low);
            getItem.index_search = [getItem.phone, low, nomark]
            let getIdInviter = null;
            if (payload.id_inviter && payload.id_inviter !== "" && payload.id_inviter !== null) {
                //const getInviter = await this.collaboratorModel.findById(payload.id_inviter);
                const getInviter = await this.collaboratorRepositoryService.findOneById(payload.id_inviter);
                if (!getInviter) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                getIdInviter = getInviter._id;
                getItem.id_inviter = getIdInviter;
            }
            await getItem.save();
            this.activityAdminSystemService.editCollaborator(admin._id, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminActiCollaborator(lang, payload: actiCollaboratorDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            //const getItem = await this.collaboratorModel.findById(id);
            const getItem = await this.collaboratorRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            this.activityAdminSystemService.actiCollaborator(admin._id, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async adminLockCollaborator(lang, payload: lockCollaboratorDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            //const getItem = await this.collaboratorModel.findById(id);
            const getItem = await this.collaboratorRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.city);
            console.log('check permission ', checkPermisstion);

            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getItem.is_lock_time === true) {
                getItem.is_lock_time = false
                getItem.lock_time = null
            }
            else if (getItem.is_lock_time === false) {
                getItem.is_lock_time = true
                getItem.lock_time = payload.lock_time
            }
            await getItem.save();
            // this.activityAdminSystemService.lockCollaborator(admin._id, id, payload.is_lock_time)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async adminDeleteCollaborator(lang, id: string, admin: UserSystemDocument) {
        try {
            // const getAdmin = await this.userSystemModel.findById(admin._id);
            // if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (admin.role !== 'admin') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, null)], HttpStatus.FORBIDDEN);
            //const getItem = await this.collaboratorModel.findById(id);
            const getItem = await this.collaboratorRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteCollaborator(admin._id, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async verifyItem(lang, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.collaboratorRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            if (getItem.is_verify === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_verify = true;
            // this.inviteCodeSystemService.addGiftRemainder(lang, id);
            await getItem.save();
            // this.activityCollaboratorSystemService.adminContactedCollaborator(getItem, admin._id);
            // this.activityAdminSystemService.verifyCollaborator(admin._id, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // Chuẩn bị bỏ ở phiên bản tiếp theo
    async topupAccountCollaborator(lang, payload: TranferMoneyCollaboratorDTOAdmin, idCollaborator: string, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const newTransaction = await this.transactionSystemService.createItem({
                id_collaborator: getCollaborator._id,
                id_admin_action: admin._id,
                money: payload.money,
                subject: 'collaborator',
                transfer_note: payload.transfer_note,
                type_transfer: 'top_up',
                payment_out: 'other',
                payment_in: payload.type_wallet,
            });
            this.activityAdminSystemService.topUpCollaborator(admin, getCollaborator, newTransaction);
            return newTransaction;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Chuẩn bị bỏ ở phiên bản tiếp theo
    async withdrawAccount(lang, payload: WithdrawMoneyCollaboratorDTOAdmin, idCollaborator: string, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "collaborator")], HttpStatus.FORBIDDEN);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "permisstion")], HttpStatus.BAD_REQUEST);
            }
            if (getCollaborator.collaborator_wallet - Number(payload.money) < 0) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN.COLLABORATOR_NOT_ENOUGH_MONEY, lang, "money")], HttpStatus.BAD_REQUEST);
            }
            const newTransaction = await this.transactionSystemService.createItem({
                id_collaborator: getCollaborator._id,
                id_admin_action: admin._id,
                money: payload.money,
                subject: 'collaborator',
                transfer_note: payload.transfer_note,
                type_transfer: 'withdraw',
                payment_in: 'other',
                payment_out: payload.type_wallet || 'collaborator_wallet',
            })
            const previousBalance = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet,
            }
            await this.transactionSystemService.holdingMoney(lang, newTransaction._id);
            // log lich su
            this.activityAdminSystemService.withdrawCollaborator(admin._id, getCollaborator, newTransaction);
            this.activityAdminSystemService.holdingMoney(getCollaborator, newTransaction, admin, previousBalance)
            return newTransaction;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListTransitionsCollaborator(lang, iPage: iPageTransferCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            const queryCollaborator =
            {
                $and: [
                    {
                        $or: [
                            {
                                phone: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                full_name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },

                        ]
                    },
                    {
                        is_delete: false,
                    }
                ]

            };
            let arrIdCollaborator: mongoose.Schema.Types.ObjectId[] = [];
            if (iPage.search !== '') {
                const getCollaborator = await this.collaboratorModel.find(queryCollaborator);
                if (getCollaborator.length > 0) {
                    for (let item of getCollaborator) {
                        arrIdCollaborator.push(item._id);
                    }
                }
            }
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        transfer_note: {
                            $regex: iPage.transfer_note,
                            $options: "i"
                        }
                    }
                ],
            }
            let query2: any = {
                $and: [
                    { is_delete: false },
                    {
                        id_collaborator: arrIdCollaborator
                    },
                    {
                        transfer_note: {
                            $regex: iPage.transfer_note,
                            $options: "i"
                        }
                    }
                ],
            }

            if (iPage.type_transition !== "all") {
                query.$and.push({ type_transfer: iPage.type_transition });
                query2.$and.push({ type_transfer: iPage.type_transition });
            }
            const arrItem = await this.transitionCollaboratorModel.find(iPage.search === '' ? query : query2)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1, phone: 1, avatar: 1, id_view: 1 } })
                .populate({ path: 'id_admin_verify', select: { full_name: 1, _id: 1, role: 1 } })
                .then();

            const count = await this.transitionCollaboratorModel.count(iPage.search === '' ? query : query2)
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

    async getListTransitionsCollaboratorV2(lang, iPage: iPageTransferCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                "id_collaborator.full_name": {
                                    $regex: iPage.search
                                }
                            },
                            {
                                "id_collaborator.phone": {
                                    $regex: iPage.search
                                }
                            },
                            {
                                "id_collaborator.city": {
                                    $regex: iPage.search
                                }
                            },
                            {
                                "transfer_note": {
                                    $regex: iPage.search
                                }
                            }
                        ]
                    }
                ]
            }
            if (iPage.type_transition !== 'all') {
                query.$and.push({ type_transfer: iPage.type_transition })
            }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city;
            //     city.push(-1)
            //     query.$and.push({ 'id_collaborator.city': { $in: checkPermisstion.city } })
            // }
            const getListTransition = await this.transitionCollaboratorModel.aggregate([
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                {
                    $unwind: { path: "$id_collaborator" },
                },
                { $match: query },
                {
                    $lookup: LOOKUP_ADMIN_VERIFY
                },
                {
                    $unwind: { path: "$id_admin_verify", preserveNullAndEmptyArrays: true },
                },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) },
                {
                    $project: {
                        'id_collaborator.total_service_fee': 0,
                        'id_collaborator.password': 0,
                        'id_collaborator.salt': 0,
                        'id_admin_verify.password': 0,
                        'id_admin_verify.salt': 0,
                        'id_admin_verify.id_role_admin': 0,

                    }
                }
            ])
            const count = await this.transitionCollaboratorModel.aggregate([
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                {
                    $unwind: { path: "$id_collaborator" },
                },
                { $match: query },
                { $count: 'total' }
            ]);
            for (let item of getListTransition) {
                if (!item.id_admin_verify) {
                    item.id_admin_verify = null;
                }
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getListTransition
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminDeleteCollaboratorTrans(lang, payload: deleteCollaboratorTransDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            // if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (admin.role !== 'admin') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, null)], HttpStatus.FORBIDDEN);
            const getItem = await this.transitionCollaboratorModel.findById(id)
                .populate({ path: 'id_collaborator', select: { city: 1 } });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.id_collaborator["city"]);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteTransCollaborator(admin._id, getItem.id_collaborator, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Chuẩn bị bỏ ở bản sau
    async adminCancelCollaboratorTrans(lang, id: string, admin: UserSystemDocument) {
        try {
            // const getItem = await this.transitionCollaboratorModel.findById(id)
            //     .populate({ path: 'id_collaborator', select: { city: 1 } });
            // if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.id_collaborator["city"]);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (getItem.status === 'done' || getItem.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_DELETED, lang, null)], HttpStatus.FORBIDDEN);
            // getItem.status = "cancel";
            // await getItem.save();
            // await this.activityAdminSystemService.cancelTransCollaborator(admin, getItem.id_collaborator['_id'], getItem);
            // return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminVerifyCollaboratorTrans(lang, payload: verifyCollaboratorTransDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.transitionCollaboratorModel.findById(id);
            // .populate({ path: 'id_collaborator', select: { city: 1 } });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.id_collaborator["city"]);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            if (getItem.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_verify_money = true;
            getItem.status = "done";
            getItem.date_verify_created = new Date(Date.now()).toISOString();
            getItem.id_admin_verify = admin._id
            await getItem.save();
            //const getCollaborator = await this.collaboratorModel.findById(getItem.id_collaborator)
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getItem.id_collaborator.toString());
            const previousBalance = {
                remainder: getCollaborator.remainder,
                gift_remainder: getCollaborator.gift_remainder,
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet,
            }

            if (getItem.type_transfer === "top_up") {
                if (getItem.type_wallet === "gift_wallet" || getItem.type_wallet === "collaborator_wallet") {
                    getCollaborator.gift_remainder += Number(getItem.money);
                    getCollaborator.collaborator_wallet += Number(getItem.money);
                } else {
                    getCollaborator.remainder += Number(getItem.money);
                    getCollaborator.work_wallet += Number(getItem.money);
                }
            }
            else if (getItem.type_transfer === "withdraw") {




                if (getItem.type_wallet === "gift_wallet" || getItem.type_wallet === "work_wallet") {
                    if (getCollaborator.work_wallet - Number(getItem.money) < 0) {
                        throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN.COLLABORATOR_NOT_ENOUGH_MONEY, lang, "work_wallet")], HttpStatus.BAD_REQUEST);
                    }
                    getCollaborator.gift_remainder -= Number(getItem.money);
                    getCollaborator.work_wallet -= Number(getItem.money);
                } else {
                    if (getCollaborator.collaborator_wallet - Number(getItem.money) < 0) {
                        throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN.COLLABORATOR_NOT_ENOUGH_MONEY, lang, "collaborator_wallet")], HttpStatus.BAD_REQUEST);
                    }
                    getCollaborator.remainder -= Number(getItem.money)
                    getCollaborator.collaborator_wallet -= Number(getItem.money);
                }
            }
            await getCollaborator.save();
            if (getItem.type_transfer === "top_up") {
                this.activityAdminSystemService.verifyTopUpCollaborator(getItem._id, admin._id, getCollaborator, previousBalance)
            } else {
                this.activityAdminSystemService.verifyWithDrawCollaborator(getItem._id, admin._id, getCollaborator, previousBalance)
            }
            return { "Trans": getItem, "Collaborator": getCollaborator }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminEditCustomerTrans(lang, payload: editCollaboratorTransDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.transitionCollaboratorModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.is_verify_money === false && getItem.status !== 'done') {
                getItem.money = ((payload.money === getItem.money) || !payload.money) ? getItem.money : payload.money
                getItem.transfer_note = ((payload.transfer_note === getItem.transfer_note) || !payload.transfer_note) ? getItem.transfer_note : payload.transfer_note
                await getItem.save();
                await this.activityAdminSystemService.editTransCollaborator(idAdmin, getItem.id_collaborator, getItem._id)
                return getItem;
            } else if (getItem.is_verify_money === true) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_DONE, lang, null)], HttpStatus.NOT_FOUND);
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async editPersonalInformation(lang, payload: editPersonalInforCollaboratorDTOAdmin, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city, getCollaborator.district, payload.service_apply);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (payload.id_inviter && getCollaborator.id_inviter !== null) {
                if (getCollaborator.id_inviter.toString().localeCompare(payload.id_inviter.toString()) > 0) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.INVITER_EXIST, lang, "id_inviter")], HttpStatus.BAD_REQUEST);
                }
            }
            getCollaborator.gender = payload.gender || getCollaborator.gender;
            getCollaborator.full_name = payload.full_name || getCollaborator.full_name;
            getCollaborator.name = payload.full_name || getCollaborator.full_name;
            getCollaborator.type = payload.type || getCollaborator.type;
            getCollaborator.birthday = payload.birthday || getCollaborator.birthday;
            getCollaborator.permanent_address = payload.permanent_address || getCollaborator.permanent_address;
            getCollaborator.temporary_address = payload.temporary_address || getCollaborator.temporary_address;
            getCollaborator.folk = payload.folk || getCollaborator.folk;
            getCollaborator.religion = payload.religion || getCollaborator.religion;
            getCollaborator.edu_level = payload.edu_level || getCollaborator.edu_level;
            getCollaborator.identity_number = payload.identity_number || getCollaborator.identity_number;
            getCollaborator.identity_place = payload.identity_place || getCollaborator.identity_place;
            getCollaborator.identity_date = payload.identity_date || getCollaborator.identity_date;
            getCollaborator.avatar = payload.avatar || getCollaborator.avatar;
            getCollaborator.service_apply = payload.service_apply || getCollaborator.service_apply;
            getCollaborator.city = payload.city || getCollaborator.city;
            getCollaborator.district = payload.district || getCollaborator.district;
            getCollaborator.id_business = payload.id_business || getCollaborator.id_business;
            if (payload.birthday) {
                getCollaborator.month_birthday = getMonth(new Date(payload.birthday)).toString()
            }
            let getIdInviter = null;
            if (payload.id_inviter && payload.id_inviter !== "" && payload.id_inviter !== null) {
                const getInviter = await this.collaboratorRepositoryService.findOneById(payload.id_inviter);
                if (!getInviter) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                getIdInviter = getInviter._id;
                getCollaborator.id_inviter = getIdInviter;
            }
            await getCollaborator.save()
            this.activityAdminSystemService.editCollaborator(admin._id, idCollaborator)
            return getCollaborator
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async editPersonalDocument(lang, payload: editDocumentCollaboratorDTOAdmin, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            // getCollaborator.is_identity = payload.is_identity || getCollaborator.is_identity;
            // getCollaborator.identity_frontside = payload.identity_frontside || getCollaborator.identity_frontside;
            // getCollaborator.identity_backside = payload.identity_backside || getCollaborator.identity_backside;
            // getCollaborator.is_personal_infor = payload.is_personal_infor || getCollaborator.is_personal_infor;
            // getCollaborator.personal_infor_image = payload.personal_infor_image || getCollaborator.personal_infor_image;
            // getCollaborator.is_household_book = payload.is_household_book || getCollaborator.is_household_book;
            // getCollaborator.household_book_image = payload.household_book_image || getCollaborator.household_book_image;
            // getCollaborator.is_behaviour = payload.is_behaviour || getCollaborator.is_behaviour;
            // getCollaborator.behaviour_image = payload.behaviour_image || getCollaborator.behaviour_image;
            // getCollaborator.document_code = payload.document_code || getCollaborator.document_code;
            // getCollaborator.is_document_code = payload.is_document_code || getCollaborator.is_document_code;
            if (payload.is_identity) {
                getCollaborator.is_identity = true;
                getCollaborator.identity_frontside = payload.identity_frontside;
                getCollaborator.identity_backside = payload.identity_backside
            } else {
                getCollaborator.is_identity = false;
                getCollaborator.identity_frontside = '';
                getCollaborator.identity_backside = '';
            }
            ///
            if (payload.is_personal_infor) {
                getCollaborator.is_personal_infor = true;
                getCollaborator.personal_infor_image = payload.personal_infor_image;
            } else {
                getCollaborator.is_personal_infor = false;
                getCollaborator.personal_infor_image = [];
            }
            ///
            if (payload.is_household_book) {
                getCollaborator.is_household_book = true;
                getCollaborator.household_book_image = payload.household_book_image;
            } else {
                getCollaborator.is_household_book = false;
                getCollaborator.household_book_image = [];
            }
            ///
            if (payload.is_behaviour) {
                getCollaborator.is_behaviour = true;
                getCollaborator.behaviour_image = payload.behaviour_image;
            } else {
                getCollaborator.is_behaviour = false;
                getCollaborator.behaviour_image = [];
            }
            ///
            if (payload.is_document_code) {
                getCollaborator.is_document_code = true;
                getCollaborator.document_code = payload.document_code;
            } else {
                getCollaborator.is_document_code = false;
                getCollaborator.document_code = '';
            }
            await getCollaborator.save();
            this.activityAdminSystemService.editCollaborator(admin._id, idCollaborator);
            return getCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryTransfer(lang, idCollaborator, admin: UserSystemDocument) {
        try {
            const arrItem = await this.transitionCollaboratorModel.find({ id_collaborator: idCollaborator })
            const count = await this.transitionCollaboratorModel.count(idCollaborator)
            const result = {
                // start: iPage.start,
                // length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryRemainder(lang, iPage: iPageDTO, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const query = {
                $and: [
                    {
                        $or: HISTORY_ACTIVITY_WALLET
                    },
                    { "id_collaborator": new ObjectId(idCollaborator) }
                ]
            }
            const result = await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { "id_collaborator": 1, "date_create": -1 },
                [
                    { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, id_view: 1 } },
                    { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, id_view: 1 } },
                    { path: "id_admin_action", select: { full_name: 1, _id: 1 } },
                    { path: "id_order", select: { id_view: 1, _id: 1, id_group_order: 1 } },
                    { path: "id_transaction", select: { id_view: 1, _id: 1, } },
                    { path: "id_punish_ticket", select: { id_view: 1, _id: 1, } },
                ]
            )
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getHistoryActivity(lang, iPage: iPageHistoryActivityCollaboratorDTOAdmin, idCollaborator, admin: UserSystemDocument, typeFillter: string[]) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query: any = {
                $and: [{
                    $or: [
                        {
                            title_admin: {
                                $regex: iPage.search,
                                $options: "i"
                            }
                        },
                    ]
                },
                // {
                //     $or: [
                //         { type: "collaborator_create_new_account" },
                //         { type: "admin_verify_user" },
                //         { type: "collaborator_confirm_order" },
                //         { type: "collaborator_doing_order" },
                //         { type: "collaborator_done_order" },
                //         { type: "collaborator_cancel_order" },
                //         { type: "collaborator_edit_address" },
                //         { type: "collaborator_delete_address" },
                //         { type: "collaborator_set_default_address" },
                //         { type: "collaborator_create_new_address" },
                //         { type: "collaborator_create_new_account" },
                //         { type: "collaborator_edit_personal_infor" },
                //         { type: "collaborator_delete_account" },
                //         { type: "collaborator_edit_profile" },
                //         { type: "collaborator_update_aministrativ" },
                //         { type: "admin_change_status_to_order" },
                //         { type: "admin_contacted_collaborator" },
                //         { type: "admin_verify_info_reward_collaborator" },
                //         { type: "system_verify_info_reward_collaborator" },
                //         { type: "admin_cancel_punish" },
                //     ]
                // },
                { id_collaborator: idCollaborator }
                ]
            }

            if (typeFillter.length > 0) query.$and.push({ type: { $in: typeFillter } });

            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1 })
                .populate({ path: 'id_customer', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_user_system', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_admin_action', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_order', select: { address: 1, service: 1, date_create: 1, id_view: 1 } })
                .populate({ path: 'id_group_order', select: { address: 1, service: 1, date_create: 1, id_view: 1 } })
                .populate({ path: 'id_promotion', select: { title: 1 } })
                .populate({ path: 'id_transistion_collaborator', select: { money: 1, date_create: 1, transfer_note: 1 } })
                .populate({ path: 'id_transistion_customer', select: { money: 1, date_create: 1, transfer_note: 1 } })
                .populate({ path: 'id_reason_cancel', select: { title: 1, description: 1 } })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.historyActivityModel.count(query)
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

    async adminAddCollaboratorToOrder(lang, idCollaborator, admin: UserSystemDocument, idOrder) {
        try {
            const getOrder = await this.orderModel.findById(idOrder)

            const getOldCollaborator = await this.collaboratorRepositoryService.findOneById(getOrder.id_collaborator.toString());
            const getNewCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getNewCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            if (getNewCollaborator) {
                if (getOrder.id_collaborator || getOrder.id_collaborator !== null) {
                    getOrder.id_collaborator = idCollaborator
                    getOrder.status = "confirm"
                    getOldCollaborator.gift_remainder += getOrder.pending_money
                    getOldCollaborator.gift_remainder += getOrder.platform_fee
                    // await getOldCollaborator.save()
                    getOrder.platform_fee = Number(0.3 * getOrder.initial_fee)

                    if (getNewCollaborator.gift_remainder && getNewCollaborator.gift_remainder < getOrder.platform_fee) {
                        if (getNewCollaborator.remainder && getNewCollaborator.remainder > getOrder.platform_fee) {
                            getNewCollaborator.remainder = getNewCollaborator.remainder - getOrder.platform_fee
                        }
                        else if (getNewCollaborator.remainder && getNewCollaborator.remainder < getOrder.platform_fee) {
                            throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, null)], HttpStatus.NOT_FOUND)
                        }
                    }
                    else if (getNewCollaborator.gift_remainder && getNewCollaborator.gift_remainder > getOrder.platform_fee) {
                        getNewCollaborator.gift_remainder = getNewCollaborator.gift_remainder - getOrder.platform_fee
                    }
                    getOrder.name_collaborator = getNewCollaborator.full_name
                    getOrder.phone_collaborator = getNewCollaborator.phone
                    // await getOrder.save()
                    // await getNewCollaborator.save()
                    await Promise.all([
                        await getOldCollaborator.save(),
                        await getOrder.save(),
                        await getNewCollaborator.save()
                    ]);


                }
                if (!getOrder.id_collaborator || getOrder.id_collaborator === null) {
                    getOrder.id_collaborator = idCollaborator
                    getOrder.status = "confirm"
                    getOrder.platform_fee = Number(0.3 * getOrder.initial_fee)
                    if (getNewCollaborator.gift_remainder && getNewCollaborator.gift_remainder < getOrder.platform_fee) {
                        if (getNewCollaborator.remainder && getNewCollaborator.remainder > getOrder.platform_fee) {
                            getNewCollaborator.remainder = getNewCollaborator.remainder - getOrder.platform_fee
                        }
                        else if (getNewCollaborator.remainder && getNewCollaborator.remainder < getOrder.platform_fee) {
                            throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, null)], HttpStatus.NOT_FOUND)
                        }
                    }
                    else if (getNewCollaborator.gift_remainder && getNewCollaborator.gift_remainder > getOrder.platform_fee) {
                        getNewCollaborator.gift_remainder = getNewCollaborator.gift_remainder - getOrder.platform_fee
                    }
                    getOrder.name_collaborator = getNewCollaborator.full_name
                    getOrder.phone_collaborator = getNewCollaborator.phone
                    // await getOrder.save()
                    // await getNewCollaborator.save()
                    await Promise.all([
                        // await getOldCollaborator.save(),
                        await getOrder.save(),
                        await getNewCollaborator.save()
                    ]);
                }
                return true
            }

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getTransitionHistoryActivity(lang, iPage: iPageDTO, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [{
                    $or: [
                        {
                            title_admin: {
                                $regex: iPage.search,
                                $options: "i"
                            }
                        },
                    ]
                },
                {
                    $or: [
                        { type: "new_user" },
                        { type: "verify_user" },
                        { type: "confirm_order" },
                        { type: "doing_order" },
                        { type: "done_order" },
                        { type: "collaborator_cancel_order" }
                    ]
                },
                { id_collaborator: idCollaborator }
                ]
            }
            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.historyActivityModel.count(query)
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


    async getCollaboratorByTypeV2(lang, iPage: iPageGetCollaboratorByTypeDTOAdmin, admin: UserSystemDocument) {
        try {

            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city)
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district)
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            let query: any = {
                $and: [
                    {
                        $or: [
                            {
                                phone: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                full_name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                email: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                identity_number: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            }
                        ]
                    },
                    { is_delete: false },
                ]
            }
            if (iPage.collaborator_type === 'locked') {
                query.$and.push({ is_locked: true });
            } else if (iPage.collaborator_type === 'verify') {
                query.$and.push({ is_verify: true });
            } else if (iPage.collaborator_type === 'not_verify') {
                query.$and.push({ is_verify: false });
            } else if (iPage.collaborator_type === 'birthday') {
                const currentMonth = new Date().getUTCMonth().toString();
                query.$and.push({ month_birthday: currentMonth });
            } else if (iPage.collaborator_type === 'online') {
                query.$and.push({ is_verify: true, is_locked: false });
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const arrItem = await this.collaboratorModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.collaboratorModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItems: count,
                data: arrItem,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryCollaborators(lang, iPage, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [{
                    $or: [{
                        full_name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                        phone: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    },]
                },
                // {
                //     $or: [
                //         { type: { $eq: "verify_top_up" } },
                //         { type: { $eq: "verify_withdraw" } },
                //         { type: { $eq: "receive_done_order" } },
                //         { type: { $eq: "minus_discount_platform_fee" } },
                //         { type: { $eq: "minus_platform_fee" } },
                //         { type: { $eq: "refund_platform_fee_cancel_order" } },
                //         { type: { $eq: "refund_collaborator_fee" } },
                //         { type: { $eq: "receive_extra_collaborator_fee" } },
                //         { type: { $eq: "collaborator_minus_collaborator_fee" } },
                //         { type: { $eq: "refund" } }
                //     ]
                // },
                { id_collaborator: idCollaborator }
                ]
            }
            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1 })
                .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_admin_action', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_reason_cancel', select: { title: 1, description: 1, } })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.historyActivityModel.count(query)
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
    async getRequestTopupWithdraw(lang, iPage, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    },]
                },
                { id_collaborator: idCollaborator },
                {
                    $or: [
                        { type: "collaborator_top_up" },
                        { type: "collaborator_withdraw" },
                    ]
                }
                ]
            }
            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1 })
                .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1 } })
                .populate({ path: 'id_transistion_collaborator', select: { money: 1, transfer_note: 1, type_transfer: 1 } })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.historyActivityModel.count(query)
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

    async getCollaboratorCanConfirmJob(lang, iPage: iPageGetCollaboratorCanConfirmJobDTOAdmin, idOrder: string) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const query = {

            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editAcounntBank(lang, idCollaborator: string, payload: editAcounntBankCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getCollaborator.account_name = payload.account_name;
            getCollaborator.account_number = payload.account_number;
            getCollaborator.bank_name = payload.bank_name;
            //await getCollaborator.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, getCollaborator);
            this.activityAdminSystemService.updateAccountBank(idCollaborator, admin._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getRamainder(lang, idCollaborator: string, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const result = {
                // remainder: getCollaborator.remainder,
                // gift_remainder: getCollaborator.gift_remainder
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getTransition(lang, iPage, idCollaborator: string, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [{
                    $or: [{
                        type_transfer: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    },]
                },
                { id_collaborator: idCollaborator },
                ]
            }
            const arrItem = await this.transitionCollaboratorModel.find(query)
                .sort({ date_create: -1, date_created: -1, _id: -1 })
                .skip(Number(iPage.start))
                .limit(Number(iPage.length));
            const count = await this.transitionCollaboratorModel.count(query)
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


    async lockCollaborator(lang, idCollaborator, payload: lockCollaboratorV2DTOAdmin, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            if (payload.is_locked === true) {

                await this.outJob(getCollaborator, admin._id);
                // this.activityAdminSystemService.lockCollaborator(admin._id, getCollaborator._id, payload.is_locked);
                if (payload.date_lock !== null) {
                    getCollaborator.date_lock = payload.date_lock
                } else {
                    getCollaborator.date_lock = null;
                }
                getCollaborator.is_locked = true;
            } else {
                getCollaborator.is_locked = false;
                getCollaborator.date_lock = null;
                // this.activityAdminSystemService.lockCollaborator(admin._id, getCollaborator._id, payload.is_locked);
            }
            getCollaborator.status = 'locked';
            await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, getCollaborator);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async outJob(collaborator, idAdmin) {
    //     try {
    //         const getCollaborator = await this.collaboratorModel.findById(collaborator._id);
    //         let query: any = {
    //             $and: [
    //                 { id_collaborator: getCollaborator._id },
    //                 { is_delete: false },
    //                 { status: "confirm" },
    //             ]
    //         }
    //         const getArrConfirmGroupOrder = await this.groupOrderModel.find(query);
    //         query.$and[2].status = "doing";

    //         const getDoingGroupOrder = await this.groupOrderModel.findOne(query);
    //         if (getArrConfirmGroupOrder.length < 1) {
    //             return true;
    //         }
    //         if (getDoingGroupOrder) throw new HttpException("CTV có 1 công việc đang làm", HttpStatus.BAD_REQUEST);
    //         for (let getGroupOrder of getArrConfirmGroupOrder) {
    //             if (getGroupOrder.type === 'schedule') {
    //                 const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
    //                 const query2 = {
    //                     $and: [
    //                         { id_group_order: getGroupOrder._id },
    //                         { is_delete: false },
    //                         { status: "confirm" },
    //                         { id_collaborator: getCollaborator._id },
    //                     ]
    //                 }
    //                 const getArrOrder = await this.orderModel.find(query2);
    //                 for (let getOrder of getArrOrder) {
    //                     const previousBalance = {
    //                         gift_remainder: getCollaborator.gift_remainder,
    //                         remainder: getCollaborator.remainder,
    //                         work_wallet: getCollaborator.work_wallet,
    //                         collaborator_wallet: getCollaborator.collaborator_wallet
    //                     }
    //                     getOrder.status = 'pending';
    //                     getOrder.id_collaborator = null;
    //                     getOrder.phone_collaborator = null;
    //                     getOrder.name_collaborator = null;
    //                     getOrder.id_cancel_user_system = {
    //                         id_user_system: idAdmin,
    //                         date_create: new Date(Date.now()).toISOString(),
    //                     }
    //                     // getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.platform_fee;
    //                     // getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.pending_money;
    //                     getCollaborator.work_wallet = getCollaborator.work_wallet + getOrder.platform_fee;
    //                     if(getOrder.payment_method === "cash") {
    //                         getCollaborator.work_wallet = getCollaborator.work_wallet + getOrder.pending_money
    //                     }

    //                     await getOrder.save();
    //                     await getCollaborator.save();
    //                     this.activityCollaboratorSystemService.refundPlatformFee(collaborator, (getOrder.platform_fee + getOrder.pending_money), getOrder, getService, getGroupOrder._id, previousBalance)
    //                     // if (getOrder.pending_money > 0) {
    //                     //     getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.pending_money;
    //                     //     this.activityCollaboratorSystemService.refundCollaboratorFee(collaborator, getOrder.pending_money, getOrder, getService, )
    //                     // }
    //                 }
    //                 getGroupOrder.status = 'pending';

    //             } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
    //                 // const checkDone = await this.orderModel.find({
    //                 //     $and: [
    //                 //         { id_group_order: getGroupOrder._id },
    //                 //         { status: 'done' },
    //                 //         { id_collaborator: getCollaborator._id },
    //                 //     ]
    //                 // })
    //                 const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
    //                 const getOrder = await this.orderModel.findOne({
    //                     $and: [
    //                         { id_collaborator: getCollaborator._id },
    //                         { status: 'confirm' },
    //                         { id_group_order: getGroupOrder._id },
    //                     ]
    //                 });
    //                 const previousBalance = {
    //                     gift_remainder: getCollaborator.gift_remainder,
    //                     remainder: getCollaborator.remainder,
    //                     work_wallet: getCollaborator.work_wallet,
    //                     collaborator_wallet: getCollaborator.collaborator_wallet
    //                 }
    //                 getOrder.id_collaborator = null;
    //                 getOrder.phone_collaborator = null;
    //                 getOrder.name_collaborator = null;
    //                 getGroupOrder.id_collaborator = null;
    //                 getGroupOrder.phone_collaborator = null;
    //                 getGroupOrder.name_collaborator = null;
    //                 // getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.platform_fee;
    //                 getCollaborator.work_wallet = getCollaborator.work_wallet + getOrder.platform_fee;

    //                 getOrder.status = 'pending';
    //                 getGroupOrder.status = 'pending';
    //                 this.activityCollaboratorSystemService.refundPlatformFee(collaborator, getOrder.platform_fee, getOrder, getService, getGroupOrder._id, previousBalance)
    //                 if (getOrder.pending_money > 0) {
    //                     getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.pending_money;
    //                     getCollaborator.work_wallet = getCollaborator.gift_remainder + getOrder.platform_fee;

    //                     this.activityCollaboratorSystemService.refundCollaboratorFee(collaborator, getOrder.pending_money, getOrder, getService, previousBalance)
    //                 }
    //                 await getGroupOrder.save();
    //                 await getOrder.save();
    //                 await getCollaborator.save();
    //             } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
    //                 const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
    //                 const getOrder = await this.orderModel.findOne({
    //                     $and: [
    //                         { id_collaborator: getCollaborator._id },
    //                         { status: 'confirm' },
    //                         { id_group_order: getGroupOrder._id },
    //                     ]
    //                 })
    //                 const previousBalance = {
    //                     gift_remainder: getCollaborator.gift_remainder,
    //                     remainder: getCollaborator.remainder,
    //                 }
    //                 getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.platform_fee;
    //                 getOrder.status = 'pending';
    //                 getGroupOrder.status = 'pending';
    //                 getGroupOrder.id_collaborator = null;
    //                 getGroupOrder.phone_collaborator = null;
    //                 getGroupOrder.name_collaborator = null;
    //                 getOrder.id_collaborator = null;
    //                 getOrder.phone_collaborator = null;
    //                 getOrder.name_collaborator = null;
    //                 this.activityCollaboratorSystemService.refundPlatformFee(collaborator, getOrder.platform_fee, getOrder, getService, getGroupOrder._id, previousBalance)
    //                 if (getOrder.pending_money > 0) {
    //                     getCollaborator.gift_remainder = getCollaborator.gift_remainder + getOrder.pending_money;
    //                     this.activityCollaboratorSystemService.refundCollaboratorFee(collaborator, getOrder.pending_money, getOrder, getService, previousBalance)
    //                 }
    //                 await getGroupOrder.save();
    //                 await getOrder.save();
    //                 await getCollaborator.save();
    //             }
    //         }

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async outJob(collaborator: CollaboratorDocument, idAdmin) {
        try {
            let query: any = {
                $and: [
                    { id_collaborator: collaborator._id },
                    { is_delete: false },
                    { status: "confirm" },
                ]
            }
            const getArrConfirmGroupOrder = await this.groupOrderModel.find(query);
            query.$and[2].status = "doing";
            const getDoingGroupOrder = await this.groupOrderModel.findOne(query);
            if (getArrConfirmGroupOrder.length < 1) {
                return true;
            }
            if (getDoingGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, "vi", "order")], HttpStatus.BAD_REQUEST);

            for (let getGroupOrder of getArrConfirmGroupOrder) {

                if (getGroupOrder.type === 'schedule') {
                    let orders = getGroupOrder.id_order;
                    //refund tiền đơn confirm gần nhất 
                    const getOrder = await this.orderRepositoryService.findOneById(orders[0]);

                    if (!getOrder) return true;

                    let priceRefund = 0;
                    const previousBalance = {
                        work_wallet: collaborator.work_wallet,
                        collaborator_wallet: collaborator.collaborator_wallet
                    }
                    // collaborator.work_wallet += getOrder.platform_fee;
                    // priceRefund += getOrder.platform_fee + getOrder.pending_money;
                    priceRefund += getOrder.work_shift_deposit;

                    collaborator.work_wallet += priceRefund;
                    for (let i = 0; i <= orders.length; i++) {
                        // const getOrder = await this.orderModel.findOne({
                        //     id_collaborator: collaborator._id,
                        //     id_group_order: getGroupOrder._id,
                        //     status: "confirm",
                        //     is_duplicate: false
                        // })

                        const getOrder = await this.orderRepositoryService.findOneById(orders[i]);

                        if (!getOrder) return true;

                        getOrder.status = 'pending';
                        getOrder.id_collaborator = null;
                        getOrder.phone_collaborator = null;
                        getOrder.name_collaborator = null;
                        this.activityCollaboratorSystemService.refundPlatformFee(collaborator, priceRefund, getOrder, getOrder.service, getGroupOrder._id, previousBalance);
                        await this.orderRepositoryService.findByIdAndUpdate(orders[i], getOrder);
                    }

                } else {
                    const getOrder = await this.orderModel.findOne({ id_collaborator: collaborator._id, id_group_order: getGroupOrder._id, status: "confirm" });
                    let priceRefund = 0;
                    const previousBalance = {
                        work_wallet: collaborator.work_wallet,
                        collaborator_wallet: collaborator.collaborator_wallet
                    }

                    // collaborator.work_wallet += getOrder.platform_fee;
                    priceRefund += getOrder.work_shift_deposit;

                    collaborator.work_wallet += priceRefund;
                    // if (getOrder.payment_method === "cash") {
                    //     collaborator.work_wallet += getOrder.pending_money;
                    //     priceRefund += getOrder.pending_money;
                    // }


                    getOrder.status = 'pending';
                    getOrder.id_collaborator = null;
                    getOrder.phone_collaborator = null;
                    getOrder.name_collaborator = null;
                    this.activityCollaboratorSystemService.refundPlatformFee(collaborator, priceRefund, getOrder, getOrder.service, getGroupOrder._id, previousBalance);
                    getOrder.save();
                }
                getGroupOrder.status = 'pending';
                getGroupOrder.id_collaborator = null;
                getGroupOrder.phone_collaborator = null;
                getGroupOrder.name_collaborator = null;
                getGroupOrder.save();
                await collaborator.save();
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkLockCollaborator(lang, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND)
            const query = {
                $and: [
                    {
                        id_collaborator: getCollaborator._id,
                    },
                    {
                        status: "confirm"
                    }
                ]
            }
            const getArrOrderConfirm = await this.orderModel.find(query);
            query.$and[1].status = "doing";
            const getArrOrderDoing = await this.orderModel.find(query);
            return {
                confirm_order: getArrOrderConfirm,
                doing_order: getArrOrderDoing
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }

    }

    async revenueAndExpenditure(lang, iPage: iPageTransitionCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_verify_money: true },
                    { status: "done" },
                ]
            }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city;
            //     city.push(-1)
            //     query.$and.push({ 'id_collaborator.city': { $in: checkPermisstion.city } })
            // }
            const totalTopUp = await this.transitionCollaboratorModel.aggregate([
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                {
                    $unwind: { path: "$id_collaborator" },
                },
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$type_transfer",
                        total: { $sum: '$money' },
                    }
                },
                {
                    $sort: { '_id': 1 }
                }
            ]);

            let queryPunish: any = {
                $and: [
                    { is_delete: false },
                    { status: "done" }
                ]
            }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city;
            //     city.push(-1)
            //     queryPunish.$and.push({ 'id_collaborator.city': { $in: checkPermisstion.city } })
            // }
            const totalPunish = await this.punishModel.aggregate([
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                {
                    $unwind: { path: "$id_collaborator" },
                },
                {
                    $match: queryPunish
                },
                {
                    $group: {
                        _id: {},
                        total: { $sum: '$money' },
                    }
                }
            ]);

            return {
                totalTopUp: totalTopUp.length > 0 ? totalTopUp[0].total : 0,
                totalWithdraw: totalTopUp.length > 1 ? totalTopUp[1].total : 0,
                totalPunish: totalPunish.length > 0 ? totalPunish[0].total : 0
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalTopUpWithdraw(lang, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'user', null)], HttpStatus.NOT_FOUND)
            console.log(getCollaborator.full_name);

            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            let query: any = {
                $and: [
                    { status: "done" },
                    { 'id_collaborator._id': getCollaborator._id },
                    { is_delete: false },
                    { is_verify_money: true },
                ]
            }
            const total = await this.transitionCollaboratorModel.aggregate([
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                {
                    $unwind: { path: "$id_collaborator" },
                },
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$type_transfer",
                        total: { $sum: '$money' },
                    }
                },
            ]);
            let result = {
                totalWithdraw: 0,
                totalTopUp: 0,
            }
            for (let item of total) {
                if (item._id === 'top_up') {
                    result.totalTopUp = item.total;
                }
                if (item._id === 'withdraw') {
                    result.totalWithdraw = item.total;
                }
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async contactedCollaborator(lang, idCollaborator, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getCollaborator.is_contacted === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.NOT_FOUND)
            getCollaborator.is_contacted = true;
            await getCollaborator.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, getCollaborator);
            // await this.activityCollaboratorSystemService.adminContactedCollaborator(getCollaborator, admin._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async monetaryFineCollaborator(lang, idCollaborator, payload, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            let tempMoney = getCollaborator.gift_remainder - payload.money;
            if (tempMoney < 0) {
                getCollaborator.remainder += tempMoney;
                getCollaborator.gift_remainder = 0;
            } else {
                getCollaborator.gift_remainder = tempMoney;
            }
            await getCollaborator.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, getCollaborator);
            this.activityAdminSystemService.adminMonetaryFine(admin._id, getCollaborator._id, payload.money);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getReview(lang, idCollaborator, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city, getCollaborator.district, null, getCollaborator.id_business);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [
                    { star: { $gt: 0 } },
                    { is_delete: false },
                    { id_collaborator: getCollaborator._id },
                    { is_system_review: false }
                ]
            }

            const getReview = await this.orderModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create_review: -1 })
                .populate(POP_COLLABORATOR_INFO)
                .populate(POP_CUSTOMER_INFO)
                .select({ _id: 1, id_view: 1, star: 1, review: 1, id_collaborator: 1, address: 1, date_create_review: 1, short_review: 1, })
            const count = await this.orderModel.count(query)
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count,
                data: getReview
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // loai bo trong phien ban sap toi
    async getHistoryActivityV2(lang, idCollaborator, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: getCollaborator._id },
                ]
            }
            const getHistory = await this.orderModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_work: -1, _id: -1 })
                .populate(POP_COLLABORATOR_INFO)
                .populate(POP_CUSTOMER_INFO)
                .populate({ path: 'id_punish_ticket', select: {punish_money: 1, note_admin: 1} })
                .populate({ path: 'service._id', select: { kind: 1 } })
            const count = await this.orderModel.count(query);
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getHistory
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // loai bo trong phien ban sap toi
    async getDetailHistoryActivity(lang, payload, idOrder, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND)
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order)
                .populate({ path: 'service._id', select: { kind: 1 } })
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group order")], HttpStatus.NOT_FOUND)

            const query = {
                $and: [
                    { id_collaborator: getCollaborator._id },
                    { id_order: getOrder._id }
                ]
            }
            const getHistory = await this.historyActivityModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1, _id: -1 })
                .populate(POP_COLLABORATOR_INFO)
                .populate({ path: 'id_order', select: { _id: 1, id_view: 1, service: 1 } })
            const count = await this.historyActivityModel.count(query);

            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getHistory,
                order: getOrder,
                groupOrder: getGroupOrder
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getOrderHistory(lang, idCollaborator, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: getCollaborator._id },
                ]
            }
            const getHistory = await this.orderModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_work: -1, _id: -1 })
                .populate(POP_COLLABORATOR_INFO)
                .populate(POP_CUSTOMER_INFO)
                .populate({ path: 'service._id', select: { kind: 1 } })
            const count = await this.orderModel.count(query);
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getHistory
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getCollaboratorBlockOrFavorite(lang, idCustomer, iPage: iPageTransferCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const arrCollaborator = await this.collaboratorModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    {
                                        phone: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                    {
                                        full_name: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                    {
                                        name: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    },
                                ]
                            },
                            {
                                is_delete: false,
                            },
                            {
                                is_verify: true
                            },
                            {
                                is_locked: false
                            }
                        ]
                    }
                },
                { $addFields: { is_favorite: { $in: ["$_id", getCustomer.id_favourite_collaborator] } } }
                // { $addFields: { is_block: { $nin: ["$_id", getCustomer.id_block_collaborator] } } },
            ])
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.collaboratorModel.count({
                $and: [
                    {
                        $or: [
                            {
                                phone: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                full_name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },

                        ]
                    },
                    {
                        is_delete: false,
                    }
                ]
            })
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrCollaborator
            }
            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListCollaboratorBlockOrFavourite(lang, idCustomer, iPage: iPageListCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            const query = {
                $and: [
                    { is_delete: false },
                    { _id: { $in: getCustomer.id_block_collaborator } }
                ]
            }
            if (iPage.status === "favourite") {
                query.$and[1] = { _id: { $in: getCustomer.id_favourite_collaborator } }
            }
            const arrCollaborator = await this.collaboratorModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.collaboratorModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrCollaborator
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTopUpWithDrawCollaborator(lang, iPage: iPageHistoryOrderDTOCollaborator, admin: UserSystemDocument) {
        try {

            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    },
                ],
            }
            const getCollaborator = await this.transitionCollaboratorModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: {
                        tempTopUp: {
                            $cond: [{ $eq: ["$type_transfer", "top_up"] }, "$money", 0]
                        },
                    },
                },
                {
                    $addFields: {
                        tempWithdraw: {
                            $cond: [{ $eq: ["$type_transfer", "withdraw"] }, "$money", 0]
                        },
                    },
                },
                {
                    $addFields: {
                        tempCountTopUp: {
                            $cond: [{ $eq: ["$type_transfer", "top_up"] }, 1, 0]
                        },
                    },
                },
                {
                    $addFields: {
                        tempCountWithdraw: {
                            $cond: [{ $eq: ["$type_transfer", "withdraw"] }, 1, 0]
                        },
                    },
                },
                {
                    $group: {
                        _id: "$id_collaborator",
                        totalTopUp: { $sum: "$tempTopUp" },
                        totalWithdraw: { $sum: "$tempWithdraw" },
                        countTopUp: { $sum: "$tempCountTopUp" },
                        countWithdraw: { $sum: "$tempCountWithdraw" }
                    },
                },
                {
                    $lookup: LOOKUP_COLLABORATOR
                },
                { $sort: { date_work: -1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }

            ]);

            const count = await this.transitionCollaboratorModel.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                is_delete: false,
                            },
                            {
                                status: "done",
                            },
                        ],
                    },
                },

                {
                    $group: {
                        _id: "$id_collaborator",
                    }
                },
                { $count: 'total' },

            ]);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getCollaborator

            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    async getListInviteCollaborator(lang, iPage: iPageDTO, idCollaborator) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const query = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            { id_inviter: getCollaborator._id },
                            { id_collaborator_inviter: getCollaborator._id }
                        ]
                    }
                ]
            }
            let arrCustomer = []
            let arrCollaborator = []
            const totalCustomer = await this.customerModel.count(query);
            const getArrCustomer = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const totalCollaborator = await this.collaboratorModel.count(query);
            const getArrCollaborator = await this.collaboratorModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            for (let item of getArrCustomer) {
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
                    rank: item.rank,
                    date_create: item.date_create
                }
                arrCustomer.push(customer);
            }
            for (let item of getArrCollaborator) {
                const collaborator = {
                    _id: item._id,
                    full_name: item.full_name,
                    email: item.email,
                    phone: item.phone,
                    code_phone_area: item.code_phone_area,
                    id_view: item.id_view,
                    is_verify: item.is_verify,
                    date_create: item.date_create
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
    async punishExam() {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { is_verify: true },
                    { is_locked: false }
                ]
            }
            const getCollaborator = await this.collaboratorModel.find(query);
            for (let collaborator of getCollaborator) {
                const currentDate = new Date(Date.now());
                const startMonth = startOfMonth(currentDate).toISOString();
                const endMonth = endOfMonth(currentDate).toISOString();
                console.log('colllaob ', collaborator._id);

                const queryInfo = {
                    $and: [
                        { is_delete: false },
                        { id_collaborator: collaborator._id.toString() },
                        { date_create: { $gte: startMonth } },
                        { date_create: { $lte: endMonth } },
                        { type_exam: 'periodic' }
                    ]
                }
                const getInfoTest = await this.infoTestCollaboratorModel.findOne(queryInfo).sort({ date_create: -1 });
                let payload: PunishCollaboratorDTOAdmin;
                if (getInfoTest) {
                    payload = {
                        money: 10000,
                        punish_note: "Phạt tiền không đạt bài kiểm tra hàng tháng",
                        id_punish: "64a37768cbb868c3aa137f1b",
                        id_info_test_collaborator: getInfoTest._id.toString()
                    }
                    if (getInfoTest.correct_answers <= 17) {
                        console.log('qury 2',);

                        await this.punishManagerService.systemMonetaryFineCollaborator("vi", collaborator._id, payload);
                    }
                } else {
                    payload = {
                        money: 20000,
                        punish_note: "Phạt tiền không làm bài kiểm tra hàng tháng",
                        id_punish: "64a377abcbb868c3aa1386ba",
                    }
                    await this.punishManagerService.systemMonetaryFineCollaborator("vi", collaborator._id, payload);
                }
            }
            const count = await this.collaboratorModel.count(query);
            return {
                totalItem: count,
                data: getCollaborator
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorActivity(lang, iPage: iPageHistoryOrderDTOCollaborator, idCollaborator: string) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { id_collaborator: idCollaborator },
                    { date_work: { $gte: iPage.start_date } },
                    { date_work: { $lte: iPage.end_date } }
                ]
            }
            const getOrder = await this.orderModel.find(query)
                .populate(POP_CUSTOMER_INFO)
                .populate(POP_COLLABORATOR_INFO)
                .sort({ date_work: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const totalOrder = await this.orderModel.aggregate([
                { $match: query }, ,
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT,
                },
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        total_tip_collaborator: TOTAL_TIP_COLLABORATOR
                    },
                }
            ])
            const queryPunish = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { id_collaborator: idCollaborator },
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } }
                ]
            }
            const totalPunish = await this.punishModel.aggregate([
                { $match: queryPunish },
                {
                    $group: {
                        _id: {},
                        total_item: TOTAL_ORDER,
                        total_money: TOTAL_PUNISH_MONEY
                    }

                }
            ])
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // bo o phien ban toi
    async dashBoardCollaborator(lang, iPage: iPageDTO, idCollaborator: string) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND)
            let query_order = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: getCollaborator._id },
                    { status: 'done' },

                ]
            }
            const getData = await this.orderModel.aggregate([
                { $match: query_order },
                {
                    $group: {
                        _id: {},
                        total_jobs: TOTAL_ORDER,
                        total_hours: TOTAL_HOUR
                    }
                }
            ])
            query_order.$and.pop();
            const getOrder = await this.orderModel.find(query_order) // 5 đơn gần nhất
                .populate(POP_CUSTOMER_INFO)
                .populate({ path: 'service._id', select: { kind: 1 } })
                .sort({ date_work: -1 })
                .limit(5)
            const query_customer = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { id_favourite_collaborator: getCollaborator._id }
                ]
            }
            const customerFavorite = await this.customerModel.find(query_customer)
                .select(INFO_CUSTOMER)
            const result = {
                arr_order: getOrder,
                total_favourite: customerFavorite,
                total_order: getData.length > 0 ? getData[0].total_jobs : 0,
                total_hour: getData.length > 0 ? getData[0].total_hours : 0,
                remainder: getCollaborator.remainder,
                gift_remainder: getCollaborator.gift_remainder,
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async dashBoardOverviewCollaborator(lang, idCollaborator: string, iQuery: dashBoardCollaboratorDTOAdmin) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND)
            let query_order = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: getCollaborator._id },
                    { status: 'done' },

                ]
            }
            const getData = await this.orderModel.aggregate([
                { $match: query_order },
                {
                    $group: {
                        _id: {},
                        total_jobs: TOTAL_ORDER,
                        total_hours: TOTAL_HOUR,
                        total_review: TOTAL_REVIEW,
                        start_1: STAR_ORDER(1),
                        start_2: STAR_ORDER(2),
                        start_3: STAR_ORDER(3),
                        start_4: STAR_ORDER(4),
                        start_5: STAR_ORDER(5),
                    }
                }
            ])
            // query_order.$and.pop();
            // const getOrder = await this.orderModel.find(query_order) // 5 đơn gần nhất
            //     .populate(POP_CUSTOMER_INFO)
            //     .populate({ path: 'service._id', select: { kind: 1 } })
            //     .sort({ date_work: -1 })
            //     .limit(5)
            const query_customer_favorite = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { id_favourite_collaborator: getCollaborator._id }
                ]
            }
            const customerFavorite = await this.customerModel.countDocuments(query_customer_favorite)

            const query_customer_block = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { id_block_collaborator: getCollaborator._id }
                ]
            }
            const customerBlock = await this.customerModel.countDocuments(query_customer_block)



            const result = {
                total_order: getData.length > 0 ? getData[0].total_jobs : 0,
                total_hour: getData.length > 0 ? getData[0].total_hours : 0,
                total_customer_favourite: customerFavorite,
                total_customer_block: customerBlock,
                review: {
                    total_review: getData.length > 0 ? getData[0].total_review : 0,
                    star_1: getData.length > 0 ? getData[0].star_1 : 0,
                    star_2: getData.length > 0 ? getData[0].star_2 : 0,
                    star_3: getData.length > 0 ? getData[0].star_3 : 0,
                    star_4: getData.length > 0 ? getData[0].star_4 : 0,
                    star_5: getData.length > 0 ? getData[0].star_5 : 0,

                }
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeMoneyWallet(lang, payload: changeMoneyCollaborator, idCollaborator: string, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND)
            await this.collaboratorSystemService.changeMoneyWallet(getCollaborator, payload.money);
            this.activityAdminSystemService.adminChangeMoneyWallet(idCollaborator, payload.money, admin._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async test(idCollaborator) {
        try {
            const getCollaborator = await this.collaboratorSystemService.findCollaboratorById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', 'collaborator')], HttpStatus.NOT_FOUND)
            return getCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    // async updateHandleProfile(lang, idCollaborator, payload: changeHandleProfileDTOAdmin, admin: UserSystemDocument) {
    //     try {
    //         const getCollaborator = await this.collaboratorSystemService.findCollaboratorById(idCollaborator);
    //         if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', 'collaborator')], HttpStatus.NOT_FOUND)


    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async updateStatusCollaborator(lang, idCollaborator: string, req: changeHandleProfileDTOAdmin, admin: UserSystemDocument) {
        try {
            const getCollaborator = await this.collaboratorSystemService.findCollaboratorById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', 'collaborator')], HttpStatus.NOT_FOUND)
            const newObject = {
                status: (req.status && req.status !== getCollaborator.status) ? req.status : null,
                note_handle_admin: (req.note_handle_admin && req.note_handle_admin !== getCollaborator.note_handle_admin) ? req.note_handle_admin : null,
            }

            if(getCollaborator.id_view.includes('undefined')) {
                const getArrCollaborator = await this.collaboratorModel.find({ city: getCollaborator.city }).sort({ ordinal_number: -1 });
                let tempOrdinalNumber;
                if (getArrCollaborator.length > 0) {
                    tempOrdinalNumber = getArrCollaborator[0].ordinal_number + 1;
                } else {
                    tempOrdinalNumber = 1;
                }
                let tempIdView = '00000';
    
                const temp_city = Number(getCollaborator.city) > 10 ? getCollaborator.city : `0${getCollaborator.city}`
                tempIdView = `${tempIdView}${tempOrdinalNumber}`;
    
                tempIdView = `CTV${temp_city}${tempIdView.slice(-5)}`;

                getCollaborator.id_view = tempIdView
            }

            getCollaborator.note_handle_admin = (newObject.note_handle_admin !== null) ? newObject.note_handle_admin : getCollaborator.note_handle_admin;
            getCollaborator.status = (newObject.status !== null) ? newObject.status : getCollaborator.status;
            getCollaborator.id_user_system_handle = admin._id;

            if (getCollaborator.status === "actived" && getCollaborator.is_verify === true) {
                if (getCollaborator.city < 0) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ESTABLISHED_PROVINCE, 'vi', 'collaborator')], HttpStatus.NOT_FOUND)
                }
                getCollaborator.date_actived = new Date().toISOString();
            }

            const result = await getCollaborator.save();

            if (newObject.note_handle_admin !== null) this.activityAdminSystemService.adminUpdateHandleNoteAdminCollaborator(getCollaborator, admin, newObject.note_handle_admin)
            if (newObject.status !== null) this.activityAdminSystemService.adminUpdateHandleStatusCollaborator(getCollaborator, admin, newObject.status)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getTotalCollaboratorByStatus(lang, admin: UserSystemDocument, arrStatus, search, city) {
        try {
            // console.log(arrStatus, 'arrStatus');
            arrStatus = arrStatus.toString().split(",")
            const query: any = {
                $and: [
                    {
                        $or: [
                            {
                                index_search: {
                                    $regex: search,
                                    $options: "i"
                                }
                            },
                            {
                                email: {
                                    $regex: search,
                                    $options: "i"
                                }
                            },
                            {
                                identity_number: {
                                    $regex: search,
                                    $options: "i"
                                }
                            }
                        ]
                    },
                    { status: { $in: arrStatus } },
                    { is_delete: false },
                ]

            }

            if (city !== null && city !== "") {
                query.$and.push({ city: Number(city) })
            }



            const getTotal = await this.collaboratorModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: '$status',
                        total: { $sum: 1 }
                    },
                }
            ]);
            return getTotal;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getTotalCollaboratorByArea(lang, admin: UserSystemDocument, arrStatus, search, city) {
        try {
            // console.log(arrStatus, 'arrStatus');
            arrStatus = arrStatus.toString().split(",")
            const query: any = {
                $and: [
                    {
                        $or: [
                            {
                                index_search: {
                                    $regex: search,
                                    $options: "i"
                                }
                            },
                            {
                                email: {
                                    $regex: search,
                                    $options: "i"
                                }
                            },
                            {
                                identity_number: {
                                    $regex: search,
                                    $options: "i"
                                }
                            }
                        ]
                    },
                    { status: { $in: arrStatus } },
                    { is_delete: false },
                ]

            }

            if (city !== null && city !== "") {
                query.$and.push({ city: Number(city) })
            }



            const getTotal = await this.collaboratorModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: '$city',
                        total: { $sum: 1 }
                    },
                }
            ]);
            return getTotal;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getListItem(lang, iPage: iPageGetCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {

            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city)
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district)
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }

            console.log(iPage.status, 'iPage.status');


            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            iPage.search = iPage.search.toLocaleLowerCase().trim()
            let query: any = {
                $and: [
                    {
                        $or: [
                            {
                                index_search: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                email: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                identity_number: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            }
                            // {
                            //     phone: {
                            //         $regex: iPage.search,
                            //         $options: "i"
                            //     }
                            // },
                            // {
                            //     full_name: {
                            //         $regex: iPage.search,
                            //         $options: "i"
                            //     }
                            // },
                            // {
                            //     email: {
                            //         $regex: iPage.search,
                            //         $options: "i"
                            //     }
                            // },
                            // {
                            //     identity_number: {
                            //         $regex: iPage.search,
                            //         $options: "i"
                            //     }
                            // }
                        ]
                    },
                    { is_delete: false },
                    { status: { $in: iPage.status } }
                ]
            }
            // if (iPage.collaborator_type === 'locked') {
            //     query.$and.push({ is_locked: true });
            // } else if (iPage.collaborator_type === 'verify') {
            //     query.$and.push({ is_verify: true });
            // } else if (iPage.collaborator_type === 'not_verify') {
            //     query.$and.push({ is_verify: false });
            // } else if (iPage.collaborator_type === 'birthday') {
            //     const currentMonth = new Date().getUTCMonth().toString();
            //     query.$and.push({ month_birthday: currentMonth });
            // } else if (iPage.collaborator_type === 'online') {
            //     query.$and.push({ is_verify: true, is_locked: false });
            // }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
            const arrItem = await this.collaboratorModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.collaboratorModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItems: count,
                data: arrItem,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



}
