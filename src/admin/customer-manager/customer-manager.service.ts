import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { addDays, endOfMonth, getMonth, startOfMonth, subSeconds } from 'date-fns'
import { Model } from 'mongoose'
import { actiCustomerDTOAdmin, Collaborator, CollaboratorDocument, createCustomerDTOAdmin, deleteCustomerDTOAdmin, deleteCustomerTransDTOAdmin, editCustomerDTOAdmin, ERROR, GlobalService, INFO_CUSTOMER, iPageDTO, iPageTransferCollaboratorDTOAdmin, lockCustomerDTOAdmin, LOOKUP_CUSTOMER, POP_COLLABORATOR_INFO, POP_CUSTOMER_ADDRESS, POP_CUSTOMER_CITY, POP_CUSTOMER_INFO, POP_SERVICE_TITLE, POPULATE_ID_GROUP_ORDER, TOTAL_ORDER, TranferMoneyCustomerDTOAdmin, UserSystem, UserSystemDocument, verifyCustomerTransDTOAdmin, WithDrawMoneyCustomerDTOAdmin } from 'src/@core'
import { Address, AddressDocument } from 'src/@core/db/schema/address.schema'
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema'
import { CustomerRequest, CustomerRequestDocument } from 'src/@core/db/schema/customer_request.schema'
import { CustomerSetting, CustomerSettingDocument } from 'src/@core/db/schema/customer_setting.schema'
import { DeviceToken, DeviceTokenDocument } from 'src/@core/db/schema/device_tokens.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Order, OrderDocument } from 'src/@core/db/schema/order.schema'
import { TransitionCustomer, TransitionCustomerDocument } from 'src/@core/db/schema/transition_customer.schema'
import { searchQuery } from 'src/@core/query/queryMongo'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service'
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { CustomerSystemService } from 'src/core-system/customer-system/customer-system.service'
import { GroupCustomerSystemService } from 'src/core-system/group-customer-system/group-customer-system.service'
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service'
import { NotificationSystemService } from 'src/core-system/notification-system/notification-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'
import { NotificationService } from 'src/notification/notification.service'
import { HistoryActivity, HistoryActivityDocument } from '../../@core/db/schema/history_activity.schema'
import { TransitionPoint, TransitionPointDocument } from '../../@core/db/schema/transition_point.schema'
import { createAddressCustomerDTOAdmin, createTopUpPointCustomerDTOAdmin, editPointAndRankPointCustomerDTOAdmin, iPageCustomerPointDTOAdmin, iPageCustomerScoreDTOAdmin, iPageGetCustomerByTypeDTOAdmin, iPageGetHistoryPointCustomerDTOAdmin, iPageGetTotalCustomerDTOAdmin, iPageReportCustomerDTOAdmin, setIsStaffDTOAdmin } from '../../@core/dto/customer.dto'

@Injectable()
export class CustomerManagerService implements OnApplicationBootstrap {
    constructor(
        private notificationService: NotificationService,
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        private groupCustomerSystemService: GroupCustomerSystemService,
        private notificationSystemService: NotificationSystemService,
        private customerSystemService: CustomerSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private transactionSystemService: TransactionSystemService,
        private customerRepositoryService: CustomerRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private groupOrderSystemService: GroupOrderSystemService,
        private orderRepositoryService: OrderRepositoryService,
        private reasonCancelRepositoryService: ReasonsCancelRepositoryService,
        private userSystemRepositorySystem: UserSystemRepositoryService,

        // private i18n: I18nContext,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(TransitionPoint.name) private transitionPointModel: Model<TransitionPointDocument>,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(CustomerRequest.name) private customerRequestModel: Model<CustomerRequestDocument>


    ) { }

    async onApplicationBootstrap(): Promise<any> {
        const checkItemSeed = await this.customerSettingModel.findOne()
        if (!checkItemSeed) {
            const newItem = new this.customerSettingModel({
                point_to_price: 1000,
                support_version_app: "1.0.0",
                background_header: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1672740228/guvi/z4010054597277_9777775fafbb4addadb8f10ee3969c4a_uest8p.jpg"
            });
            await newItem.save();
        }
    }

    async getTotalOrder(lang, id: string) {
        try {
            const query_2 = {
                $and: [
                    {
                        id_customer: id
                    },
                    {
                        status: "done"
                    }
                ]
            }
            const count_2 = await this.orderModel.count(query_2)
            return count_2;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getLastedGrOrder(lang, id: string) {
        try {
            const query_last_gr_order = {
                $and: [
                    {
                        id_customer: id
                    },
                    {
                        status: "done"
                    }
                ]
            }

            const getLastedGrOrder = await this.groupOrderModel.findOne(query_last_gr_order)
                .sort({ date_create: -1 })
                .populate({ path: 'service._id', select: { title: 1 } })
                .then();

            // ràng lại nếu ko có group order
            const payload = {
                title: getLastedGrOrder.service["_id"]["title"],
                total_time: getLastedGrOrder.total_estimate
            }
            return payload
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getListItem(lang, iPage: iPageDTO) {
        try {
            const query = searchQuery(["phone", "full_name", "email"], iPage)

            const arrItem = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.customerModel.count(query)
            let temObject = []
            for (let item of arrItem) {
                const total_order = await this.orderModel.count({
                    $and: [
                        {
                            id_customer: item._id
                        },
                        {
                            status: "done"
                        }
                    ]
                })

                const last_order = await this.orderModel.findOne({
                    $and: [
                        {
                            id_customer: item._id
                        },
                        {
                            status: "done"
                        }
                    ]
                }).sort({ date_work: -1 }).populate({ path: 'service._id', select: { title: 1 } }).then();

                temObject.push({
                    total_order: total_order,
                    id_order: (last_order) ? last_order._id : null,
                    title_service: (last_order) ? last_order["service"] : null,
                    full_name: item.full_name,
                    name: item.full_name,
                    phone: item.phone,
                    default_address: item.default_address,
                    _id: item._id,
                    cash: item.cash,
                    pay_point: item.pay_point,
                    total_price: item.total_price,
                    id_view: item.id_view
                })
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: temObject,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItem(lang, id: string, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerModel.findById(id)
                .populate(POP_CUSTOMER_ADDRESS);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminCreateItem(lang, payload: createCustomerDTOAdmin, admin: UserSystemDocument) {
        try {
            const checkPhoneExisted = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (checkPhoneExisted) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const checkEmailExisted = await this.customerModel.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            const salt = await bcrypt.genSalt();
            payload.password = await bcrypt.hash(payload.password, salt);
            let getInviter = null
            let is_customer = true;
            if (payload.code_inviter && payload.code_inviter !== "" && payload.code_inviter !== null) {
                getInviter = await this.customerModel.findOne({ invite_code: payload.code_inviter, is_delete: false });
                if (!getInviter) {
                    getInviter = await this.collaboratorModel.findOne({ invite_code: payload.code_inviter, is_delete: false });
                    if (!getInviter) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                }
            }

            const getLastestCustomer = await this.customerModel.find().sort({ ordinal_number: -1 }).then();
            let tempIdview = '00000000'
            let tempOrdinalNumber;
            if (getLastestCustomer) {
                tempOrdinalNumber = getLastestCustomer[0].ordinal_number + 1;
            } else {
                tempOrdinalNumber = 1;
            }
            tempIdview = `${tempIdview}${tempOrdinalNumber}`;
            tempIdview = tempIdview.slice(-8);
            tempIdview = `KH${tempIdview}`;

            const low = payload.full_name.toLocaleLowerCase()
            const nomark = await this.generalHandleService.cleanAccents(low);
            const indexSearch = [payload.phone, low, nomark]

            const newCustomer = new this.customerModel({
                phone: payload.phone,
                code_phone_area: payload.code_phone_area,
                password: payload.password,
                salt: salt,
                name: payload.name,
                full_name: payload.full_name,
                email: payload.email,
                date_create: new Date(Date.now()).toISOString(),
                ordinal_number: tempOrdinalNumber,
                id_view: tempIdview,
                id_inviter: getInviter ? getInviter._id : null,
                invite_code: payload.phone,
                pay_point: 0,
                index_search: indexSearch
            });
            await newCustomer.save();
            // const getSetting = await this.customerSettingModel.findOne();
            // thay đổi chính sách tặng tiền khi đăng ký
            // let money: number = (getSetting.money_invite && (getSetting.money_invite > 0)) ? getSetting.money_invite : 2000
            // if (getInviter && is_customer) {
            //     this.customerSystemService.addMoneyInviterByCustomer(lang, getInviter._id, newCustomer.full_name, money)
            // } else if (getInviter && !is_customer) {
            //     this.collaboratorSystemService.addMoneyReferingByCollaborator(lang, getInviter._id, newCustomer.full_name, money)
            // }
            this.activityAdminSystemService.createCustomer(admin._id, newCustomer._id, newCustomer.pay_point);
            this.groupCustomerSystemService.updateConditionIn(newCustomer._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminEditItem(lang, payload: editCustomerDTOAdmin, id: string, idAdmin) {
        try {
            const getItem = await this.customerRepositoryService.findOneById(id);

            const checkEmailExisted = await this.customerModel.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "" && checkEmailExisted.email !== getItem.email) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            const checkPhoneExisted = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (checkPhoneExisted && checkPhoneExisted.phone !== getItem.phone) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // cap nhat ten KH cho tat ca moi noi\
            if (getItem.full_name !== payload.full_name) {
                await this.orderModel.updateMany({ id_customer: id }, { $set: { name_customer: payload.full_name } })
                await this.groupOrderModel.updateMany({ id_customer: id }, { $set: { name_customer: payload.full_name } })
                await this.customerRequestModel.updateMany({ id_customer: id }, { $set: { name_customer: payload.full_name } })
            }
            // cap nhat ten KH
            getItem.email = payload.email || getItem.email;
            getItem.full_name = payload.full_name || getItem.full_name;
            getItem.avatar = payload.avatar || getItem.avatar;
            getItem.gender = payload.gender || getItem.gender;
            getItem.birthday = payload.birthday || getItem.birthday;
            getItem.name = getItem.full_name;
            getItem.month_birthday = new Date(getItem.birthday).getUTCMonth().toString();
            await getItem.save();

            await this.activityAdminSystemService.editCustomer(idAdmin, getItem._id)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelTransition(lang, id: string, admin: UserSystemDocument) {
        try {
            // const getTrans = await this.transitionCustomerModel.findById(id)
            //     .populate(POP_CUSTOMER_CITY);
            // if (!getTrans) throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "transition")], HttpStatus.BAD_REQUEST);
            // if (getTrans.id_customer["city"] > 0) {
            //     const checkPermisstion = await this.globalService.checkPermissionArea(admin, getTrans.id_customer["city"]);
            //     if (!checkPermisstion.permisstion) {
            //         throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            //     }
            // }
            // if (getTrans.status === 'cancel' || getTrans.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, "transition")], HttpStatus.BAD_REQUEST);
            // getTrans.status = 'cancel';
            // await getTrans.save();
            // this.activityAdminSystemService.cancelTransCustomer(admin._id, getTrans.id_customer["_id"], getTrans);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async adminActiCustomer(lang, payload: actiCustomerDTOAdmin, id: string, idAdmin: string) {
        try {
            //const getItem = await this.customerModel.findById(id);
            const getItem = await this.customerRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active 
            const updatedCustomer = await this.customerRepositoryService.findByIdAndUpdate(id, getItem);
            // lock tai khoan KH
            if (updatedCustomer.is_active === false) {
                const reasonCanel = await this.reasonCancelRepositoryService.findOne({ apply_user: 'admin_lock_customer' });
                if (!reasonCanel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
                const getAdmin = await this.userSystemRepositorySystem.findOneById(idAdmin);
                if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
                // Xử lý hủy đơn và hoàn tiền với đơn trả pay_point
                const groupOrderDoing = await this.groupOrderRepositoryService.getListDataByCondition({ status: 'doing', id_customer: getItem._id });
                if (groupOrderDoing.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DOING, "vi", "order")], HttpStatus.BAD_REQUEST);

                const arrGroupOrderConfirm = await this.groupOrderRepositoryService.getListDataByCondition({ status: 'confirm', id_customer: getItem._id });
                for (let i = 0; i < arrGroupOrderConfirm.length; i++) {
                    const doingOrder =
                        await this.groupOrderSystemService.cancelGroupOrderV2(lang, arrGroupOrderConfirm[i]._id, reasonCanel._id, 'admin', getAdmin);
                }

                const arrGroupOrderPending = await this.groupOrderRepositoryService.getListDataByCondition({ status: 'pending', id_customer: getItem._id });
                for (let i = 0; i < arrGroupOrderPending.length; i++) {
                    await this.groupOrderSystemService.cancelGroupOrderV2(lang, arrGroupOrderPending[i]._id, reasonCanel._id, 'admin', getAdmin);
                }
            }
            await this.activityAdminSystemService.activeCustomer(idAdmin, id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async adminDeleteCustomer(lang, payload: deleteCustomerDTOAdmin, id: string, idAdmin: string) {
        try {
            const getAdmin = await this.userSystemRepositorySystem.findOneById(idAdmin);
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (getAdmin.role !== 'admin') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, null)], HttpStatus.FORBIDDEN);
            const getItem = await this.customerRepositoryService.findOneById(id);

            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            await this.activityAdminSystemService.deleteCustomer(idAdmin, id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async adminLockCustomer(lang, payload: lockCustomerDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.customerRepositoryService.findOneById(id);

            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.is_lock_time === true) {
                getItem.is_lock_time = false
                getItem.is_active = true
                getItem.lock_time = null
            }
            else if (getItem.is_lock_time === false) {
                getItem.is_active = false
                getItem.is_lock_time = true
                getItem.lock_time = payload.lock_time
            }
            await getItem.save();
            await this.activityAdminSystemService.lockCustomer(idAdmin, id, payload.is_lock_time);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // chuẩn bị bỏ ở bản sau
    async topupAccountCustomer(lang, idCustomer, payload: TranferMoneyCustomerDTOAdmin, admin) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            if (getCustomer.city > 0) {
                const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
                if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
                }
            }
            //console.log(customer);

            const transaction = await this.transactionSystemService.createItem({
                id_customer: getCustomer._id,
                id_admin_action: admin._id,
                money: payload.money,
                subject: 'customer',
                transfer_note: payload.transfer_note,
                type_transfer: 'top_up',
                payment_out: 'other',
                payment_in: 'pay_point',
            })
            this.activityAdminSystemService.topUpCustomer(admin._id, getCustomer, transaction);
            return transaction;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // chuẩn bị bỏ ở bản sau
    async withdrawAccountCustomer(lang, payload: WithDrawMoneyCustomerDTOAdmin, idCustomer, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            if (getCustomer.city > 0) {
                const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
                if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
                }
            }
            const transaction = await this.transactionSystemService.createItem({
                id_customer: idCustomer,
                id_admin_action: admin._id,
                money: payload.money,
                subject: 'customer',
                transfer_note: payload.transfer_note,
                type_transfer: 'withdraw',
                payment_in: 'other',
                payment_out: 'pay_point',
            })
            this.activityAdminSystemService.withdrawCustomer(admin._id, getCustomer, transaction);
            return transaction;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminDeleteCustomerTrans(lang, payload: deleteCustomerTransDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.transitionCustomerModel.findById(id)
                .populate(POP_CUSTOMER_CITY);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.id_customer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getItem.status === 'done' || getItem.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, 'status')], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteTransCustomer(admin._id, getItem.id_customer["_id"], getItem);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // ko sài nữa
    async adminVerifyCustomerTrans(lang, payload: verifyCustomerTransDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            // const getItem = await this.transitionCustomerModel.findById(id)
            //     .populate(POP_CUSTOMER_CITY);
            // if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getItem.id_customer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (getItem.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_DONE, lang, null)], HttpStatus.FORBIDDEN);
            // getItem.is_verify_money = true;
            // getItem.status = "done";
            // getItem.date_verify_created = new Date(Date.now()).toISOString();
            // getItem.date_verify_create = new Date(Date.now()).toISOString();
            // getItem.id_admin_verify = admin._id;
            // await getItem.save();
            // const moneyTransfer = getItem.money
            // const getCustomer = await this.customerModel.findById(getItem.id_customer);
            // const previousBalance = {
            //     pay_point: getCustomer.pay_point
            // }
            // if (getItem.is_verify_money === true) {
            //     if (getItem.type_transfer === "top_up") {
            //         getCustomer.cash += moneyTransfer
            //         getCustomer.pay_point += moneyTransfer
            //     }
            //     else if (getItem.type_transfer === "withdraw") {
            //         getCustomer.cash -= moneyTransfer
            //         getCustomer.pay_point -= moneyTransfer
            //     }
            //     await getCustomer.save();
            // }

            // if (getItem.type_transfer === 'top_up') {
            //     // this.activityAdminSystemService.verifyTransCustomer(admin._id, getCustomer._id, getItem, previousBalance);
            //     this.activityCustomerSystemService.adminTopUpMoneyForCustomer(getItem, getCustomer._id, admin._id)
            // } else {
            //     //this.activityAdminSystemService.verifyWithdrawTransCustomer(admin._id, getCustomer._id, getItem, previousBalance);
            //     this.activityCustomerSystemService.adminWithdrawMoneyForCustomer(getItem, getCustomer._id, admin._id)

            // }
            // return { getItem, "getCustomer": getCustomer };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async adminEditCustomerTrans(lang, payload: editCustomerTransDTOAdmin, id: string, idAdmin) {
    //     try {
    //         const getItem = await this.transitionCustomerModel.findById(id);
    //         if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         if (getItem.is_verify_money === false) {
    //             getItem.money = ((payload.money === getItem.money) || !payload.money) ? getItem.money : payload.money
    //             getItem.transfer_note = ((payload.transfer_note === getItem.transfer_note) || !payload.transfer_note) ? getItem.transfer_note : payload.transfer_note
    //             await getItem.save();
    //             await this.activityAdminSystemService.editTransCustomer(idAdmin, getItem.id_customer, getItem);
    //             return getItem;
    //         }
    //         else if (getItem.is_verify_money === true) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_DONE, lang, null)], HttpStatus.NOT_FOUND);
    //         }
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    async getCustomerByTypeV2(lang, iPage: iPageGetCustomerByTypeDTOAdmin, admin: UserSystemDocument) {
        try {
            const currentMonth = getMonth(new Date(Date.now()));
            iPage.search = iPage.search.toLocaleLowerCase().trim()
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                index_search: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
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
                            // }
                        ]
                    },
                ]
            }

            if (iPage.customer_type !== "all") {
                if (iPage.customer_type === "silver") {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'member') {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'gold') {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'platinum') {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'birthday') {
                    query.$and.push({ month_birthday: currentMonth })
                } else if (iPage.customer_type === 'block') {
                    query.$and.push({ is_active: false })
                }
            }
            if (iPage.id_group_customer !== 'all') {
                query.$and.push({ id_group_customer: iPage.id_group_customer })
            }
            if (admin.id_business) {

            }


            const arrItem = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate(POP_CUSTOMER_ADDRESS)
            const count = await this.customerModel.count(query);
            let temObject = []


            for (let item of arrItem) {
                const total_order = await this.orderModel.count({
                    $and: [
                        {
                            id_customer: item._id
                        },
                        {
                            is_delete: false
                        },
                        {
                            status: "done"
                        }
                    ]
                })
                const last_order = await this.groupOrderModel.findOne({
                    $and: [
                        {
                            id_customer: item._id
                        },
                        {
                            is_delete: false
                        }
                    ]
                }).sort({ date_create: -1 }).populate(POP_SERVICE_TITLE);
                temObject.push({
                    total_order: total_order,
                    id_group_order: (last_order) ? last_order._id : null,
                    id_view_group_order: (last_order) ? last_order.id_view : null,
                    title_service: (last_order) ? last_order["service"] : null,
                    full_name: item.full_name,
                    name: item.full_name,
                    phone: item.phone,
                    date_create: item.date_create,
                    default_address: item.default_address,
                    _id: item._id,
                    cash: item.cash,
                    pay_point: item.pay_point,
                    total_price: item.total_price,
                    id_view: item.id_view,
                    birthday: item.birthday,
                    rank_point: item.rank_point,
                    rank: item.rank,
                    is_active: item.is_active,
                    id_group_customer: item.id_group_customer
                })
            }
            const getTotalMoney = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false }
                        ]
                    },
                },
                {
                    $group: {
                        _id: {},
                        total_revenue: { $sum: "$final_fee" },
                        total_order: { $count: {} },
                    }
                },
            ])
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItems: count,
                data: temObject,
                total: getTotalMoney.length > 0 ? getTotalMoney[0] : 0,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getCustomerByTypeV3(lang, iPage: iPageGetCustomerByTypeDTOAdmin, admin: UserSystemDocument) {
        try {
            const sortOptions = {}
            sortOptions[iPage.valueSort] = iPage.typeSort === '1' ? 1 : -1; // 
            const currentMonth = getMonth(new Date(Date.now()));
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                phone: {
                                    $regex: iPage.search,
                                    // $options: "i"
                                }
                            },
                            {
                                full_name: {
                                    $regex: iPage.search,
                                    // $options: "i"
                                }
                            },
                            {
                                email: {
                                    $regex: iPage.search,
                                    // $options: "i"
                                }
                            },
                            {
                                id_view: {
                                    $regex: iPage.search,
                                    // $options: "i"
                                }
                            }
                        ]
                    },
                ]
            }
            if (iPage.customer_type !== "all") {
                if (iPage.customer_type === "silver") {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'member') {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'gold') {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'platinum') {
                    query.$and.push({ rank: iPage.customer_type })
                } else if (iPage.customer_type === 'birthday') {
                    query.$and.push({ month_birthday: currentMonth })
                } else if (iPage.customer_type === 'block') {
                    query.$and.push({ is_active: false })
                }
            }
            if (iPage.id_group_customer !== 'all') {
                query.$and.push({ id_group_customer: iPage.id_group_customer })
            }
            // if (admin.id_business) {
            //     if (admin.area_manager_lv_1.length > 0) {
            //         query.$and.push({ city: 1 })
            //     }
            //     if (admin.area_manager_lv_2.length > 0) {
            //         query.$and.push({ district: { $in: admin.area_manager_lv_2 } })
            //     }
            // }
            console.log('query.$and   ', query.$and);

            const getCusomter = await this.customerModel.aggregate([
                {
                    $lookup: {
                        from: 'grouporders',
                        foreignField: 'id_customer',
                        localField: '_id',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$is_delete", false] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'temp_id_group_order'
                    }
                },
                {
                    $lookup: {
                        from: "orders",
                        localField: "_id",
                        foreignField: "id_customer",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$is_delete", false] },
                                            { $eq: ["$status", "done"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "id_order"
                    }
                },
                {
                    $addFields: {
                        id_view_group_order: { $arrayElemAt: [{ $slice: ['$temp_id_group_order.id_view', -1] }, 0] }
                    }
                },
                {
                    $addFields: {
                        id_group_order: { $arrayElemAt: [{ $slice: ['$temp_id_group_order._id', -1] }, 0] }
                    }
                },
                {
                    $addFields: {
                        total_order: {
                            $size: {
                                $filter: {
                                    input: "$id_order",
                                    as: "order",
                                    cond: { $eq: ["$$order.status", "done"] }
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        temp_order_city: {
                            $cond: {
                                if: { $gt: [{ $size: "$id_order" }, 0] },
                                then: "$id_order.city",
                                else: []
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        temp_order_district: "$id_order.district"
                    }
                },
                { $match: query },
                {
                    $sort: sortOptions
                },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) },
                {
                    $project: {
                        temp_id_group_order: 0,
                        // temp_order_city: 0, temp_order_district: 0,
                        id_order: 0, salt: 0, password: 0, id_inviter: 0, my_promotion: 0,
                        client_id: 0
                    }
                }
            ])
            const count = await this.customerModel.aggregate([
                {
                    $lookup: {
                        from: 'grouporders',
                        foreignField: 'id_customer',
                        localField: '_id',
                        as: 'temp_id_group_order'
                    }
                },
                {
                    $lookup: {
                        from: "orders",
                        localField: "_id",
                        foreignField: "id_customer",
                        as: "id_order"
                    }
                },
                {
                    $addFields: {
                        id_view_group_order: { $arrayElemAt: [{ $slice: ['$temp_id_group_order.id_view', -1] }, 0] }
                    }
                },
                {
                    $addFields: {
                        id_group_order: { $arrayElemAt: [{ $slice: ['$temp_id_group_order._id', -1] }, 0] }
                    }
                },
                {
                    $addFields: {
                        total_order: {
                            $size: {
                                $filter: {
                                    input: "$id_order",
                                    as: "order",
                                    cond: { $eq: ["$$order.status", "done"] }
                                }
                            }
                        }
                    }
                },
                { $match: query },
                {
                    $count: 'total'
                },
            ])
            const getTotalMoney = await this.orderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { status: "done" },
                            { is_delete: false }
                        ]
                    },
                },
                {
                    $group: {
                        _id: {},
                        total_revenue: { $sum: "$final_fee" },
                        total_order: { $count: {} },
                    }
                },
            ])
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItems: count.length > 0 ? count[0].total : 0,
                data: getCusomter,
                total: getTotalMoney.length > 0 ? getTotalMoney[0] : 0
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getCustomerByReputation(lang, iPage: iPageCustomerScoreDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { is_active: true },
                    { is_delete: false },
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
                            }
                        ]
                    },
                    { reputation_score: { $gte: iPage.start_point } },
                    { reputation_score: { $lte: iPage.end_point } }
                ]
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city;
            //     city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const arrItem = await this.customerModel.find(query).sort({ reputation_score: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate(POP_CUSTOMER_ADDRESS);
            const count = await this.customerModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItems: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async editPointAndRankPoint(lang, id: string, idAdmin: string, payload: editPointAndRankPointCustomerDTOAdmin) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(id);

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const customerSetting = await this.customerSettingModel.findOne();
            getCustomer.point = payload.point || getCustomer.point;
            getCustomer.rank_point = payload.rank_point || getCustomer.rank_point;
            if (getCustomer.rank_point >= customerSetting.rank_platinum_minium_point) {
                getCustomer.rank = 'platinum'
            } else if (getCustomer.rank_point >= customerSetting.rank_gold_minium_point) {
                getCustomer.rank = 'gold'
            } else if (getCustomer.rank_point >= customerSetting.rank_silver_minium_point) {
                getCustomer.rank = 'silver'
            } else {
                getCustomer.rank = 'member'
            }
            await getCustomer.save();
            if (payload.point) {
                await this.activityAdminSystemService.editPointCustomer(idAdmin, getCustomer._id, getCustomer.point);
            }
            if (payload.rank_point) {
                await this.activityAdminSystemService.editRankPointCustomer(idAdmin, getCustomer._id, getCustomer.rank_point);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalCustomer(lang, iPage: iPageGetTotalCustomerDTOAdmin) {
        try {
            const query = {
                $and: [
                    { date_create: { $gt: iPage.start_date } },
                    { date_create: { $lt: iPage.end_date } },
                    { is_delete: false }
                ]
            }
            const getCustomer = await this.customerModel.count(query);
            const query2 = {
                $and: [
                    { is_delete: false },
                    { date_create: { $lt: iPage.start_date } }
                ]
            }
            const totalCustomerOld = await this.customerModel.count(query2)
            const totalAllCustomer = getCustomer + totalCustomerOld
            return {
                totalCustomer: getCustomer,
                totalCustomerOld: totalCustomerOld,
                totalAllCustomer: totalAllCustomer,
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalCustomerMonthly(lang, year) {
        try {
            if (!year) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_EXISTS, lang, null)], HttpStatus.NOT_FOUND);
            let arrTotalMonthly = [];
            for (let i = 0; i < 12; i++) {
                var activeDate = new Date(year, i, 1).toLocaleDateString();
                let startMonth = startOfMonth(new Date(activeDate)).toISOString();
                let endMonth = endOfMonth(new Date(activeDate)).toISOString();
                const payload: iPageGetTotalCustomerDTOAdmin = {
                    start_date: startMonth,
                    end_date: endMonth,
                }
                const total = await this.totalCustomer('vi', payload)
                let item = {
                    totalNew: total.totalCustomer,
                    totalOld: total.totalCustomerOld,
                    totalAll: total.totalAllCustomer
                }
                arrTotalMonthly.push(item)
            }
            return arrTotalMonthly;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async totalCustomerDayly(lang, iPage: iPageGetTotalCustomerDTOAdmin) {
        try {
            const result = await this.generalHandleService.eachDayOfInterval(iPage.start_date, iPage.end_date);
            let arrDayly = [];
            let specialDay = subSeconds(addDays(result[result.length - 1], 1), 1).toISOString();
            for (let i = 0; i < result.length; i++) {
                const payload: iPageGetTotalCustomerDTOAdmin = {
                    start_date: result[i].toISOString(),
                    end_date: result.length - 1 === i ? specialDay : subSeconds(new Date(result[i + 1]), 1).toISOString(),
                };
                const total = await this.totalCustomer('vi', payload)
                let item = {
                    day: result[i],
                    total: total.totalCustomer
                }
                arrDayly.push(item)
            }
            return arrDayly;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async detailTotalCustomerDayly(lang, iPage: iPageGetTotalCustomerDTOAdmin) {
        try {
            const getCustomer = await this.customerModel.find({
                $and: [
                    { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                    { is_delete: false }
                ]
            })
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.customerModel.count({
                $and: [
                    { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                    { is_delete: false }
                ]
            })
            return {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count,
                data: getCustomer
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryActivityCustomer(lang, iPage: iPageGetHistoryPointCustomerDTOAdmin, idCustomer, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer)

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            const query = {
                $and: [
                    {
                        $or: [
                            { type: "customer_success_top_up_pay_point" },
                            { type: "customer_payment_pay_point_service" },
                            { type: "customer_payment_point_service" },
                            { type: "customer_payment_momo_service" },
                            { type: "customer_payment_vnpay_service" },
                            { type: "customer_refund_pay_point" },
                            { type: "payment_method_pay_point" },
                            { type: "system_give_pay_point_customer" },
                            { type: "verify_top_up" },
                            { type: "verify_withdraw" },
                            { type: "verify_transaction_withdraw" },
                            { type: "verify_transaction_top_up" },
                            { type: "verify_transaction_punish" },
                            { type: "verify_transaction_payment_service" },
                            { type: "verify_transaction_refund_payment_service" },
                            { type: "customer_refund_money" },
                        ]
                    },
                    {
                        id_customer: getCustomer._id
                    },
                    // { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                    // {
                    //     is_delete: false
                    // }
                ]
            }



            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({path: "id_group_order", select: POPULATE_ID_GROUP_ORDER})
                .populate({path: "id_order", select: {id_view: 1, _id: 1}})
            const count = await this.historyActivityModel.count(query)
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListTransitionsCustomerV2(lang, iPage: iPageTransferCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                "id_customer.full_name": {
                                    $regex: iPage.search
                                }
                            },
                            {
                                "id_customer.phone": {
                                    $regex: iPage.search
                                }
                            },
                            {
                                "id_customer.email": {
                                    $regex: iPage.search
                                }
                            },
                            {
                                transfer_note: {
                                    $regex: iPage.search
                                }
                            },
                        ]
                    },
                    {
                        $or: [
                            { type_transfer: "top_up" },
                            { type_transfer: "withdraw" }
                        ]
                    },
                ]
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city
            //     city.push(-1)
            //     query.$and.push({ 'id_customer.city': { $in: city } })
            // }
            console.log('=>  ', query.$and[3]);

            const getListTransition = await this.transitionCustomerModel.aggregate([
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
                    $sort: { date_create: -1, date_created: -1, _id: 1 }
                },
                {
                    $skip: Number(iPage.start)
                },
                {
                    $limit: Number(iPage.length)
                },
                {
                    $project: {
                        'id_customer.password': 0, 'id_customer.salt': 0
                    }
                }
            ])

            const count = await this.transitionCustomerModel.aggregate([
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
                data: getListTransition
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryPointsCustomer(lang, iPage: iPageGetHistoryPointCustomerDTOAdmin, idCustomer, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            let query: any = {
                $and: [
                    {
                        $or: [
                            { is_delete: false },
                            { is_delete: { $exists: false } },
                        ]
                    },
                    { date_create: { $gte: iPage.start_date, $lte: iPage.end_date } },
                    { id_customer: getCustomer._id }
                ]
            }
            const arrItem = await this.transitionCustomerModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate(POP_CUSTOMER_INFO)
            const count = await this.transitionCustomerModel.count(query)
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

    async topUpPointCustomer(lang, payload: createTopUpPointCustomerDTOAdmin, idCustomer, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const newItem = new this.transitionPointModel({
                date_create: new Date(Date.now()).toISOString(),
                name_customer: getCustomer.full_name,
                phone_customer: getCustomer.phone,
                id_customer: getCustomer._id.toString(),
                type_point: payload.type_point,
                current_point: getCustomer.point,
                current_rank_point: getCustomer.rank_point,
                date_verify: null,
                id_admin_verify: null,
                id_admin_action: admin._id.toString(),
                status: "pending",
                is_delete: false,
                note: payload.note || "",
                value: payload.value,
            })
            await newItem.save();
            this.activityAdminSystemService.adminTopUpPointCustomer(admin._id, newItem._id, getCustomer._id, newItem.value);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async verifyPointCustomer(lang, idTransitionPoint, admin: UserSystemDocument) {
        try {
            const getTransitionPoint = await this.transitionPointModel.findById(idTransitionPoint);
            if (!getTransitionPoint) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'transition')], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(getTransitionPoint.id_customer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getTransitionPoint.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, 'customer')], HttpStatus.NOT_FOUND);
            getTransitionPoint.id_admin_verify = admin._id;
            getTransitionPoint.status = "done";
            getTransitionPoint.is_verify = true;
            getTransitionPoint.date_verify = new Date(Date.now()).toISOString();
            if (getTransitionPoint.type_point === "point") {
                getCustomer.point += getTransitionPoint.value;
                await getCustomer.save();
                this.activityAdminSystemService.editPointCustomer(admin._id, getCustomer._id, getCustomer.point);

            } else {
                getCustomer.rank_point += getTransitionPoint.value;
                await this.customerRepositoryService.findByIdAndUpdate(getTransitionPoint.id_customer, getCustomer);
                this.setRankCustomer(lang, getCustomer._id);
                this.activityAdminSystemService.editRankPointCustomer(admin._id, getCustomer._id, getCustomer.rank_point);
            }
            await getTransitionPoint.save();
            this.activityAdminSystemService.adminVerifyPointCustomer(admin._id._id, getTransitionPoint._id, getCustomer._id, getTransitionPoint.value);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelPointCustomer(lang, idTransitionPoint, admin: UserSystemDocument) {
        try {
            const getTransitionPoint = await this.transitionPointModel.findById(idTransitionPoint);
            if (!getTransitionPoint) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'transition')], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(getTransitionPoint.id_customer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getTransitionPoint.status === "done" || getTransitionPoint.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, 'customer')], HttpStatus.NOT_FOUND);
            getTransitionPoint.status = "cancel";
            await getTransitionPoint.save();
            this.activityAdminSystemService.adminCancelPointCustomer(admin._id, getTransitionPoint._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deletePointCustomer(lang, idTransitionPoint, admin: UserSystemDocument) {
        try {
            const getTransitionPoint = await this.transitionPointModel.findById(idTransitionPoint);
            if (!getTransitionPoint) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'transition')], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(getTransitionPoint.id_customer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getTransitionPoint.status === "done") throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, 'customer')], HttpStatus.NOT_FOUND);
            getTransitionPoint.is_delete = true;
            await getTransitionPoint.save();
            this.activityAdminSystemService.adminDeletePointCustomer(admin._id, getTransitionPoint._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListTransitionPointCustomer(lang, iPage: iPageCustomerPointDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    {
                        $or: [
                            {
                                phone_customer: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                name_customer: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                        ]
                    }
                ]
            }
            if (iPage.status !== "all") {
                query.$and.push({ status: iPage.status });
            }
            if (iPage.verify === "verify") {
                query.$and.push({ is_verify: true })
            }
            if (iPage.verify === "not_verify") {
                query.$and.push({ is_verify: false })
            }
            if (iPage.type_point !== "all") {
                query.$and.push({ type_point: iPage.type_point })
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ 'id_customer.city': { $in: checkPermisstion.city } })
            // }
            const getList = await this.transitionPointModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                { $unwind: { path: '$id_customer' } },
                {
                    $match: query
                },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ])
            const count = await this.transitionPointModel.aggregate([
                { $lookup: LOOKUP_CUSTOMER },
                { $unwind: { path: '$id_customer' } },
                {
                    $match: query
                },
                { $count: 'total' },
            ])
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getList
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async setRankCustomer(lang, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const customerSetting = await this.customerSettingModel.findOne();
            if (getCustomer.rank_point >= customerSetting.rank_platinum_minium_point) {
                getCustomer.rank = 'platinum'
            } else if (getCustomer.rank_point >= customerSetting.rank_gold_minium_point) {
                getCustomer.rank = 'gold'
            } else if (getCustomer.rank_point >= customerSetting.rank_silver_minium_point) {
                getCustomer.rank = 'silver'
            } else {
                getCustomer.rank = 'member'
            }
            await getCustomer.save();
            await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getDetailTransitionPointCustomer(lang, idTransitionPoint, admin: UserSystemDocument) {
        try {
            const getTransitionPoint = await this.transitionPointModel.findById(idTransitionPoint)
                .populate(POP_CUSTOMER_INFO);
            if (!getTransitionPoint) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'transition')], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getTransitionPoint.id_customer["city"]);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            return getTransitionPoint;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reportTotalTopup(lang, iPage: iPageReportCustomerDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { date_created: { $gte: iPage.start_date } },
                    { date_created: { $lte: iPage.end_date } },
                    { type_transfer: "top_up" },
                    { status: 'done' },
                    {
                        $or: [
                            { 'id_customer.full_name': { $regex: iPage.search } },
                            { 'id_customer.phone': { $regex: iPage.search } },
                            { 'id_customer.email': { $regex: iPage.search } }
                        ]
                    },
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
            const totalTopUp = await this.transitionCustomerModel.aggregate([
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
                    $group: {
                        _id: {},
                        total: { $sum: "$money", },
                        total_item: { $sum: 1, }
                    }
                },
            ]);
            const getdata = await this.transitionCustomerModel.aggregate([
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
                    $group: {
                        _id: '$id_customer._id',
                        total: { $sum: "$money", },
                        total_item: { $sum: 1, }
                    }
                },
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $sort: { total: -1 }
                },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ]);
            const count = await this.transitionCustomerModel.aggregate([
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
                    $group: {
                        _id: '$id_customer._id',
                        total: { $sum: "$money", },
                        total_item: { $sum: 1, }
                    }
                },
                {
                    $lookup: LOOKUP_CUSTOMER
                },
                {
                    $unwind: { path: "$id_customer" },
                },
                {
                    $count: 'total'
                },
            ]);

            return {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count.length > 0 ? count[0].total : 0,
                total: totalTopUp,
                data: getdata
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getAddresByCustomer(lang, idCustomer, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            const query = {
                $and: [
                    {
                        id_user: idCustomer
                    }
                ]
            }
            const getCustomer = await this.customerModel.findById(idCustomer)
                .select({ default_address: 1 })
                .populate(POP_CUSTOMER_ADDRESS);

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const getAddress = await this.addressModel.find(query)
                .sort({ is_default_address: -1, date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const total = await this.addressModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: total,
                data: getAddress
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getInviteCustomer(lang, idCustomer, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $and: [
                    { is_delete: false },
                    { id_inviter: getCustomer._id }
                ]
            }
            const arr = []
            const count = await this.customerModel.count(query)
            const getListCustomer = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .select(INFO_CUSTOMER)

            for (let item of getListCustomer) {
                let total_order = await this.orderModel.count({ is_delete: false, id_customer: item._id })
                let total_done_order = await this.orderModel.count({ is_delete: false, id_customer: item._id, status: 'done' });
                if (item.date_create < '2023-05-30T17:00:00.577Z' && item.total_price === 0) {
                    total_done_order = 1;
                    total_order = 1;
                }
                const customer = {
                    _id: item._id,
                    id_view: item.id_view,
                    full_name: item.full_name,
                    phone: item.phone,
                    code_phone_area: item.code_phone_area,
                    date_create: item.date_create,
                    email: item.email,
                    birthday: item.birthday,
                    rank_point: item.rank_point,
                    avatar: item.avatar,
                    total_order: total_order,
                    total_done_order: total_done_order,
                    total_price: item.total_price
                }
                arr.push(customer)
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arr
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async searchCustomer(lang, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
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
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }

            // if (admin.id_role_admin["is_area_manager"]) {
            //     const city: number[] = checkPermisstion.city;
            //     city.push(-1)
            //     query.$and.push({ city: { $in: checkPermisstion.city } })
            // }
            const getCustomer = await this.customerModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .select(INFO_CUSTOMER);
            const count = await this.customerModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getCustomer
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addFavouriteCollaborator(lang, idCollaborator, idUser) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);

            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);

            const check = getCustomer.id_favourite_collaborator.indexOf(idCollaborator);

            const checkBlock = getCustomer.id_block_collaborator.indexOf(idCollaborator);

            if (checkBlock >= 0) {
                await this.unblockCollaborator(lang, idCollaborator, idUser);
            }
            if (check >= 0) {
                return false;
            }
            getCustomer.id_favourite_collaborator.push(idCollaborator);
            await this.customerRepositoryService.findByIdAndUpdate(idUser, getCustomer);
            // await this.activityCustomerSystemService.updateFavoriteCollaborator(lang, idUser);
            return true;
        } catch (err) {
            console.log('err', err);

            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async unFavouriteCollaborator(lang, idCollaborator, idUser) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_favourite_collaborator.indexOf(idCollaborator);
            if (check < 0) {
                return false;
            }
            getCustomer.id_favourite_collaborator = getCustomer.id_favourite_collaborator.filter((item, index) => {
                return item.toString() !== getCollaborator._id.toString();
            });
            await this.customerRepositoryService.findByIdAndUpdate(idUser, getCustomer);
            // await this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async blockCollaborator(lang, idCollaborator, idUser) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_block_collaborator.indexOf(idCollaborator);
            const checkFavoutite = getCustomer.id_favourite_collaborator.includes(idCollaborator);
            if (check >= 0) {
                return true;
            }
            if (checkFavoutite) {
                await this.unFavouriteCollaborator(lang, idCollaborator, idUser);
            }

            getCustomer.id_block_collaborator.push(idCollaborator);
            await this.customerRepositoryService.findByIdAndUpdate(idUser, getCustomer);
            // await this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async unblockCollaborator(lang, idCollaborator, idUser) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idUser);

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_block_collaborator.indexOf(idCollaborator);
            if (check < 0) {
                return false;

            }
            getCustomer.id_block_collaborator = getCustomer.id_block_collaborator.filter((item, index) => {
                return item.toString() !== getCollaborator._id.toString();
            });
            await this.customerRepositoryService.findByIdAndUpdate(idUser, getCustomer);
            // this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getUsedPromotionByCustomer(lang, iPage: iPageReportCustomerDTOAdmin, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);

            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            let query: any = {
                $and: [
                    { is_delete: false },
                    { id_customer: getCustomer._id },
                    { code_promotion: { $ne: null } }
                ]
            }
            const getOrder = await this.orderModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate(POP_COLLABORATOR_INFO)
                .populate(POP_CUSTOMER_INFO)
                .populate({ path: 'code_promotion._id', select: { title: 1 } })
                .select({ service: 0, location: 0, service_fee: 0 })
            const count = await this.orderModel.count(query)
            const total = await this.orderModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$status',
                        total_used: TOTAL_ORDER,
                        total_discount: { $sum: '$code_promotion.discount' }
                    }
                }
            ])
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                total: total,
                data: getOrder
            }

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getCustomerReview(lang, iPage: iPageDTO, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const query = {
                $and: [
                    { is_delete: false },
                    { id_customer: getCustomer._id },
                    { status: 'done' },
                    { is_system_review: false },
                    { date_create_review: { $ne: null } }
                ]
            }
            const getReview = await this.orderModel.find(query)
                .populate(POP_COLLABORATOR_INFO)
                .populate(POP_CUSTOMER_INFO)
                .populate({ path: 'service._id', select: { title: 1 } })
                .select({
                    review: 1, date_create_review: 1, star: 1, id_view: 1, short_review: 1,
                    _id: 1, date_work: 1, end_date_work: 1,
                })
                .sort({ date_create_review: -1, date_work: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.groupOrderModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getReview
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async setIsStaff(lang, idCustomer, payload: setIsStaffDTOAdmin, admin) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            getCustomer.is_staff = (getCustomer.is_staff !== payload.is_staff) ? payload.is_staff : getCustomer.is_staff
            await getCustomer.save();
            if (getCustomer.is_staff) {
                this.activityAdminSystemService.setCustomerIsStaff(admin._id, getCustomer._id)
            } else {
                this.activityAdminSystemService.unSetCustomerIsStaff(admin._id, getCustomer._id)

            }
            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createAddressForCustomer(lang, idCustomer, payload: createAddressCustomerDTOAdmin, user) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            if (!payload.token && payload.token === "")
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const convertToken = await this.globalService.decryptObject(payload.token);
            console.log('toke ', payload.token);
            console.log('customer ', getCustomer.full_name);

            const newItem = new this.addressModel({
                name: getCustomer.full_name || "",
                address: convertToken.address,
                lat: convertToken.lat,
                lng: convertToken.lng,
                type_address_work: payload.type_address_work,
                note_address: payload.note_address || "",
                id_user: getCustomer._id,
                date_create: new Date(Date.now()).toISOString()
            });
            const result = await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async testList(iPage) {
        try {
            const id = ""
            const query = {}

            const result = await this.customerRepositoryService.getListPaginationDataByCondition(iPage, query);
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}   
