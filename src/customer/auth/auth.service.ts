import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { differenceInSeconds, getMonth } from 'date-fns'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, DeviceToken, DeviceTokenDocument, editInforDTOCustomer, ERROR, GlobalService, HistoryActivity, HistoryActivityDocument, LoginDTOCustomer, newPasswordDTOCustomer, Order, OrderDocument, OTPCheckDTOCustomer, phoneDTO, PhoneOTP, PhoneOTPDocument, RegisterDTOCustomer } from 'src/@core'
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema'
import { CustomerSetting, CustomerSettingDocument } from 'src/@core/db/schema/customer_setting.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Notification, NotificationDocument } from 'src/@core/db/schema/notification.schema'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { CustomerSettingRepositoryService } from 'src/@repositories/repository-service/customer-setting-repository/customer-setting-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { EtelecomService } from 'src/@share-module/etelecom/etelecom.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { SmsService } from 'src/@share-module/sms/sms.service'
import { ZnsService } from 'src/@share-module/zns/zns.service'
import { PromotionSystemService } from 'src/core-system/@core-system/promotion-system/promotion-system.service'
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service'
import { GroupCustomerSystemService } from 'src/core-system/group-customer-system/group-customer-system.service'
import { InviteCodeSystemService } from 'src/core-system/invite-code-system/invite-code-system.service'
import { NotificationSystemService } from 'src/core-system/notification-system/notification-system.service'
import { NotificationService } from 'src/notification/notification.service'
import { changePasswordDTOCustomer } from '../../@core/dto/customer.dto'
import { CollaboratorSystemService } from '../../core-system/collaborator-system/collaborator-system.service'
import { CustomerSystemService } from '../../core-system/customer-system/customer-system.service'

@Injectable()
export class AuthService {
    constructor(
        private globalService: GlobalService,
        private jwtService: JwtService,
        private smsService: SmsService,
        private znsService: ZnsService,
        private groupCustomerSystemService: GroupCustomerSystemService,
        private generalHandleService: GeneralHandleService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private customExceptionService: CustomExceptionService,
        private customerSystemService: CustomerSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private customerRepositoryService: CustomerRepositoryService,
        private promotionSystemService: PromotionSystemService,
        private customerSettingRepositoryService: CustomerSettingRepositoryService,
        private etelecomService: EtelecomService,

        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(PhoneOTP.name) private phoneOtpModel: Model<PhoneOTPDocument>,
        @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,


    ) { }

    async login(lang, payload: LoginDTOCustomer) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (!getCustomer.is_active) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_ACTIVE, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (getCustomer.is_delete) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            }
            const isMatch = await bcrypt.compare(payload.password, getCustomer.password);
            if (!isMatch) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, 'password')], HttpStatus.BAD_REQUEST);
            const payloadToken = {
                code_phone_area: getCustomer.code_phone_area,
                phone: getCustomer.phone,
                name: getCustomer.name,
                full_name: getCustomer.full_name,
                email: getCustomer.email,
                _id: getCustomer._id,
                avatar: getCustomer.avatar,
                birth_date: getCustomer.birth_date,
                birthday: getCustomer.birthday,
                gender: getCustomer.gender,

            }
            const accessToken = await this.jwtService.sign(payloadToken);
            if (payload.device_token) {
                const findLastDeviceToken = await this.deviceTokenModel.findOne({user_id: getCustomer._id}).sort({date_update: -1});
                if (findLastDeviceToken) {
                    findLastDeviceToken.is_delete = true;
                    findLastDeviceToken.save();
                }
                
                const findToken = await this.deviceTokenModel.findOne({ token: payload.device_token });
                if (findToken) {
                    findToken.is_delete = false
                    findToken.user_id = getCustomer._id;
                    findToken.user_object = "customer";
                    findToken.date_update = new Date(Date.now()).toISOString()
                    findToken.save();
                } else {
                    const newDeviceToken = new this.deviceTokenModel({
                        user_id: getCustomer._id,
                        user_object: "customer",
                        token: payload.device_token,
                        date_create: new Date(Date.now()).toISOString(),
                        date_update: new Date(Date.now()).toISOString()
                    })
                    newDeviceToken.save();
                }
            }

            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async register(lang, payload: RegisterDTOCustomer) {
        try {
            const convertToken = await this.globalService.decryptObject(payload.token);
            const checkPhoneExisted = await this.customerModel.findOne({ $and: [{ phone: convertToken.phone }, { code_phone_area: convertToken.code_phone_area }] });
            if (checkPhoneExisted) {
                if (checkPhoneExisted.is_delete) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_VALID, lang, null)], HttpStatus.BAD_REQUEST);
                else throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
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
                    getInviter = await this.collaboratorModel.findOne({ invite_code: payload.code_inviter, is_delete: false, is_verify: true });
                    if (!getInviter) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                    is_customer = false;
                } else{
                    this.activityCustomerSystemService.inviterCodeWasApplied(payload.full_name, payload.code_inviter);
                }
            }
            const getLastestCustomer = await this.customerModel.findOne().sort({ ordinal_number: -1 });
            let tempIdView = `KH`;
            if (getLastestCustomer) {
                let tempOrdinalNumber = '00000000';
                const temp = getLastestCustomer.ordinal_number + 1;
                tempOrdinalNumber = tempOrdinalNumber.concat(temp.toString());
                tempOrdinalNumber = tempOrdinalNumber.slice(-8);
                tempIdView = `KH${tempOrdinalNumber}`
            } else {
                tempIdView = `KH00000001`;
            }
            const low = payload.full_name.toLocaleLowerCase()
            const nomark = await this.generalHandleService.cleanAccents(low);
            const indexSearch = [convertToken.phone, low, nomark]

            let getCustomerSetting = await this.customerSettingRepositoryService.findOne();
            if(!getCustomerSetting) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer_setting")], HttpStatus.NOT_FOUND)
            getCustomerSetting = getCustomerSetting._doc
            
            const paymentInformation = []
            for(let i = 0; i < getCustomerSetting.payment_method.length;i ++) {
                const itemPaymentMethod:any = {}
                itemPaymentMethod['method'] = getCustomerSetting.payment_method[i].method
                itemPaymentMethod['information'] = []
                paymentInformation.push(itemPaymentMethod)
            }
            

            const newCustomer = new this.customerModel({
                phone: convertToken.phone,
                code_phone_area: convertToken.code_phone_area,
                password: payload.password,
                salt: salt,
                name: payload.name || "",
                full_name: payload.full_name || "",
                date_create: new Date(Date.now()).toISOString(),
                email: payload.email || "",
                invite_code: convertToken.phone,
                id_inviter: getInviter ? getInviter._id : null,
                pay_point: 0,
                ordinal_number: (getLastestCustomer) ? getLastestCustomer.ordinal_number + 1 : 1,
                id_view: tempIdView,
                index_search: indexSearch,
                payment_information: paymentInformation,
                payment_method_default: getCustomerSetting.payment_method[0]
            });
            let result = await newCustomer.save();


            // const getSetting = await this.customerSettingModel.findOne();
            // thay đổi cách thức tặng tiền chỉ tặng 50K khi KH đặt đơn thành công
            // let money: number = (getSetting.money_invite && (getSetting.money_invite > 0)) ? getSetting.money_invite : 2000
            // if (getInviter && is_customer) {
            //     this.customerSystemService.addMoneyInviterByCustomer(lang, getInviter._id, newCustomer.full_name, money)
            // } else if (getInviter && !is_customer) {
            //     this.collaboratorSystemService.addMoneyReferingByCollaborator(lang, getInviter._id, newCustomer.full_name, money)
            // }
            const payloadToken = {
                code_phone_area: result.code_phone_area,
                phone: result.phone,
                name: result.name,
                full_name: result.full_name,
                email: result.email,
                _id: result._id,
                avatar: result.avatar,
                birth_date: result.birth_date,
                birthday: result.birthday,
                gender: result.gender,
                id_view: result.id_view
            }
            const accessToken = await this.jwtService.sign(payloadToken);
            this.groupCustomerSystemService.updateConditionIn(result._id)

            if (payload.device_token) {
                const findToken = await this.deviceTokenModel.findOne({ token: payload.device_token });
                if (findToken) {
                    findToken.is_delete = false;
                    findToken.user_id = result._id,
                    findToken.user_object = "customer";
                    findToken.date_update = new Date(Date.now()).toISOString(),
                    findToken.save();
                } else {
                    const newDeviceToken = new this.deviceTokenModel({
                        user_id: result._id,
                        user_object: "customer",
                        token: payload.device_token,
                        date_create: new Date(Date.now()).toISOString(),
                        date_update: new Date(Date.now()).toISOString(),
                    })
                    newDeviceToken.save();
                }
            }
            this.activityCustomerSystemService.newAccount(result._id, result.pay_point);
            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async forgotPassword(lang, payload) {
        try {
            const checkCustomerByPhone = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!checkCustomerByPhone) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.NOT_FOUND);
            const getPhoneOtp = await this.phoneOtpModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }, { user_type: 'customer' }] }).sort({ date_create: -1 });
            if (getPhoneOtp) {
                const checkTime = differenceInSeconds(new Date(Date.now()), new Date(getPhoneOtp.date_update));
                if (checkTime < 120) {
                    return { token: getPhoneOtp.token };
                } else {
                    const generateCode = await this.sendOTP(lang, payload);
                    const payloadToken = {
                        phone: payload.phone.toString(),
                        code_phone_area: payload.code_phone_area.toString(),
                        date_create: new Date(Date.now()).getTime(),
                        code: generateCode.codeOTP
                    }
                    const generateToken = await this.globalService.encryptObject(payloadToken)
                    const itemPhoneOtp = new this.phoneOtpModel({
                        token: generateToken,
                        code_phone_area: payload.code_phone_area,
                        phone: payload.phone,
                        user_type: 'customer',
                        headers_request: payload.headers_request,
                        date_create: new Date().toISOString(),
                        tracking_id: generateCode.trackingId
                    });
                    console.log(itemPhoneOtp, 'itemPhoneOtp 1')
                    await itemPhoneOtp.save();
                    return { token: generateToken };
                }
            } else {
                const generateCode = await this.sendOTP(lang, payload);
                const payloadToken = {
                    phone: payload.phone.toString(),
                    code_phone_area: payload.code_phone_area.toString(),
                    date_create: new Date(Date.now()).getTime(),
                    code: generateCode.codeOTP,
                }
                const generateToken = await this.globalService.encryptObject(payloadToken)
                const itemPhoneOtp = new this.phoneOtpModel({
                    token: generateToken,
                    code_phone_area: payload.code_phone_area,
                    phone: payload.phone,
                    user_type: 'customer',
                    headers_request: payload.headers_request,
                    date_create: new Date().toISOString(),
                    tracking_id: generateCode.trackingId
                });
                console.log(itemPhoneOtp, 'itemPhoneOtp 2')
                await itemPhoneOtp.save();
                return { token: generateToken };
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async newPassword(lang, payload: newPasswordDTOCustomer) {
        try {
            const convertToken = await this.globalService.decryptObject(payload.token);
            console.log('==== >>> ', convertToken);

            if (!convertToken.phone && !convertToken.code_phone_area && !convertToken.date_create) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_NOT_VALID, lang, 'code')], HttpStatus.BAD_REQUEST);
            const dateNow = new Date(Date.now()).getTime();
            if ((dateNow - convertToken.date_create) > 120000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TOKEN_OUT_DATE, lang, 'code')], HttpStatus.BAD_REQUEST);
            const getCustomerByPhone = await this.customerModel.findOne({ $and: [{ phone: convertToken.phone }, { code_phone_area: convertToken.code_phone_area }] });
            getCustomerByPhone.salt = await bcrypt.genSalt();
            getCustomerByPhone.password = await bcrypt.hash(payload.password, getCustomerByPhone.salt);
            await getCustomerByPhone.save();
            const payloadToken = {
                code_phone_area: getCustomerByPhone.code_phone_area,
                phone: getCustomerByPhone.phone,
                name: getCustomerByPhone.name,
                full_name: getCustomerByPhone.full_name,
                email: getCustomerByPhone.email,
                _id: getCustomerByPhone._id,
                avatar: getCustomerByPhone.avatar,
                birth_date: getCustomerByPhone.birth_date,
                birthday: getCustomerByPhone.birthday,
                gender: getCustomerByPhone.gender,
            }

            const accessToken = await this.jwtService.sign(payloadToken);
            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    // async verifyPhone(lang, payload: OTPCheckDTOCustomer) {
    //     try {
    //         const customer = await this.checkOTP(lang, payload);
    //         const payloadToken = {
    //             phone: customer.phone,
    //             name: customer.code_phone_area,
    //             date_create: new Date(Date.now()).getTime()
    //         }
    //         const accessToken = await this.jwtService.sign(payloadToken);
    //         return { token: accessToken };
    //     } catch (err) {
    //         throw new HttpException([{ message: err, type: null }], HttpStatus.FORBIDDEN);
    //     }
    // }

    async checkOTP(lang, payload: OTPCheckDTOCustomer) {
        try {
            const convertToken = await this.globalService.decryptObject(payload.token);
            console.log(convertToken, 'convertToken');
            if (!convertToken.phone && !convertToken.code_phone_area && !convertToken.date_create) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_NOT_VALID, lang, 'code')], HttpStatus.BAD_REQUEST);
            const dateNow = new Date(Date.now()).getTime();
            if ((dateNow - convertToken.date_create) > 60000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TOKEN_OUT_DATE, lang, 'code')], HttpStatus.BAD_REQUEST);
            if (convertToken.phone.toString().localeCompare(payload.phone.toString()) === -1 ||
                convertToken.code_phone_area.toString().localeCompare(payload.code_phone_area.toString()) === -1) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'code')], HttpStatus.BAD_REQUEST);
            }

            if (Number(convertToken.code) !== Number(payload.code)) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_NOT_VALID, lang, 'code')], HttpStatus.BAD_REQUEST);
            }

            const payloadToken = {
                phone: payload.phone.toString(),
                code_phone_area: payload.code_phone_area.toString(),
                date_create: new Date(Date.now()).getTime(),
            }
            const generateToken = await this.globalService.encryptObject(payloadToken)

            return { token: generateToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async sendOTP(lang, payload: phoneDTO) {
        try {
            const today = new Date(); // Tính toán cuối ngày và đầu ngày 
            today.setHours(0, 0, 0, 0);
            const startOfDay = new Date(today);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999); // Tính toán cuối ngày và đầu ngày 
            const countDoc = await this.phoneOtpModel.countDocuments({
                phone: payload.phone,
                date_create:{
                    $gte: startOfDay.toISOString(),
                    $lte: endOfDay.toISOString()
                },
                user_type:"customer",
            }).exec();
            const optSetting = (await this.customerSettingModel.findOne()).otp_setting;
            const property = {
                property:optSetting
            }
            // OTP chỉ bắn 1 ngày 10 lần cho 1 số điện thoại 
            if(countDoc > optSetting){
                throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.OTP_OVER,lang ,property, 'phone')], HttpStatus.BAD_REQUEST);
            }
            // do something send OTP
            const codeOTP = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();
            const phone = payload.code_phone_area + payload.phone.substring(1);
            const trackingId = await this.globalService.randomReferralCode(11)
            // await this.etelecomService.sendOTP(phone, codeOTP, trackingId)
            // await this.smsService.sendOTP(codeOTP, phone)
            // const codeOTP = "111111";
            return { codeOTP, trackingId};
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async registerPhone(lang, payload) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, 'phone')], HttpStatus.BAD_REQUEST);
            const getPhoneOtp = await this.phoneOtpModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }, { user_type: 'customer' }] }).sort({ date_create: -1 });
            if (getPhoneOtp) {
                const checkTime = differenceInSeconds(new Date(Date.now()), new Date(getPhoneOtp.date_create));
                if (checkTime < 1) {
                    return { token: getPhoneOtp.token };
                } else {
                    const generateCode = await this.sendOTP(lang, payload);
                    const payloadToken = {
                        phone: payload.phone.toString(),
                        code_phone_area: payload.code_phone_area.toString(),
                        date_create: new Date(Date.now()).getTime(),
                        code: generateCode.codeOTP,
                    }
                    const generateToken = await this.globalService.encryptObject(payloadToken)
                    const itemPhoneOtp = new this.phoneOtpModel({
                        token: generateToken,
                        code_phone_area: payload.code_phone_area,
                        phone: payload.phone,
                        user_type: 'customer',
                        headers_request: payload.headers_request,
                        date_create: new Date().toISOString(),
                        tracking_id: generateCode.trackingId
                    });
                    await itemPhoneOtp.save();
                    return { token: generateToken };
                }
            } else {
                const generateCode = await this.sendOTP(lang, payload);
                const payloadToken = {
                    phone: payload.phone.toString(),
                    code_phone_area: payload.code_phone_area.toString(),
                    date_create: new Date(Date.now()).getTime(),
                    code: generateCode.codeOTP
                }
                const generateToken = await this.globalService.encryptObject(payloadToken)
                const itemPhoneOtp = new this.phoneOtpModel({
                    token: generateToken,
                    code_phone_area: payload.code_phone_area,
                    phone: payload.phone,
                    user_type: 'customer',
                    headers_request: payload.headers_request,
                    date_create: new Date().toISOString(),
                    tracking_id: generateCode.trackingId
                });
                await itemPhoneOtp.save();
                return { token: generateToken };
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInfoByToken(lang, payload: phoneDTO) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getPoints(lang, user) {
        try {
            const getUser = await this.customerModel.findOne({ _id: user._id });
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getUser.point
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getRankPoints(lang, user) {
        try {
            const getUser = await this.customerModel.findOne({ _id: user._id });
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getUser.rank_point
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getCash(lang, user) {
        try {
            const getUser = await this.customerModel.findOne({ _id: user._id });
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getUser.pay_point
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async customerEditItem(lang, payload: editInforDTOCustomer, user) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: user.phone }, { code_phone_area: user.code_phone_area }] });
            console.log(getCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            const checkEmailExisted = await this.customerModel.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "" && checkEmailExisted.email !== getCustomer.email) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            // const checkPhoneExisted = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            // if (checkPhoneExisted && checkPhoneExisted.phone !== getCustomer.phone) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            // }
            console.log(getCustomer)
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getCustomer.email = payload.email || getCustomer.email
            getCustomer.name = payload.name || getCustomer.name
            getCustomer.full_name = payload.full_name || getCustomer.full_name
            
            const low = getCustomer.full_name.toLocaleLowerCase()
            const nomark = await this.generalHandleService.cleanAccents(low);
            getCustomer.index_search = [getCustomer.phone, low, nomark]

            getCustomer.birthday = payload.birthday || getCustomer.birthday
            getCustomer.gender = payload.gender || getCustomer.gender
            getCustomer.avatar = payload.avatar || getCustomer.avatar
            if (payload.birthday) {
                getCustomer.month_birthday = getMonth(new Date(payload.birthday)).toString();
            }
            await getCustomer.save();
            const payloadToken = {
                gender: getCustomer.gender,
                birthday: getCustomer.birthday,
                full_name: getCustomer.full_name,
                name: getCustomer.name,
                email: getCustomer.email,
                avatar: getCustomer.avatar,
                phone: user.phone,
                code_phone_area: user.code_phone_area,
                _id: getCustomer._id
            }

            const accessToken = await this.jwtService.sign(payloadToken);
            this.activityCustomerSystemService.editAccount(user._id);


            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async saveTokenDevice(token) {
        try {
            const findToken = await this.deviceTokenModel.findOne({ token: token });
            if (!findToken) {
                const newToken = new this.deviceTokenModel({
                    token: token,
                    user_object: "customer",
                    date_created: new Date(Date.now()).toISOString(),
                });
                await newToken.save();
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async deleteAccount(lang, user) {
        try {
            const findUser = await this.customerRepositoryService.findOneById(user._id);
            if (!findUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.BAD_REQUEST);
            const findOrder = await this.orderModel.findOne({
                $and: [
                    { id_customer: user._id },
                    { status: { $ne: "done" } },
                    { status: { $ne: "cancel" } }
                ]
            });
            if (findOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.STUCK_ORDER_FOR_DELETE_ACCOUNT, lang, "customer")], HttpStatus.BAD_REQUEST);
            //xoa mem
            findUser.is_delete = true;
            await this.customerRepositoryService.findByIdAndUpdate(findUser._id, findUser);
            this.activityCustomerSystemService.deleteAccount(user._id);

            // await this.orderModel.updateMany({id_customer: user._id}, {$set: {is_delete: true}});
            // await this.groupOrderModel.updateMany({id_customer: user._id}, {$set: {is_delete: true}});
            // await this.notificationModel.updateMany({id_customer: user._id}, {$set: {is_delete: true}});
            // await this.historyActivityModel.updateMany({id_customer: user._id}, {$set: {is_delete: true}});
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changePassword(lang, user, payload: changePasswordDTOCustomer) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: user.phone }, { code_phone_area: user.code_phone_area }] })
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            const checkPassword = await bcrypt.compare(payload.old_password, getCustomer.password);
            if (checkPassword) {
                getCustomer.salt = await bcrypt.genSalt();
                getCustomer.password = await bcrypt.hash(payload.new_password, getCustomer.salt);
                await getCustomer.save();
                const payloadToken = {
                    code_phone_area: getCustomer.code_phone_area,
                    phone: getCustomer.phone,
                    name: getCustomer.name,
                    full_name: getCustomer.full_name,
                    email: getCustomer.email,
                    _id: getCustomer._id,
                    avatar: getCustomer.avatar,
                    birth_date: getCustomer.birth_date,
                    birthday: getCustomer.birthday,
                    gender: getCustomer.gender,
                }

                const accessToken = await this.jwtService.sign(payloadToken);
                return { token: accessToken };
            } else {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.INVALID_PASSWORD, lang, 'password')], HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
    async loginV2(lang, payload: LoginDTOCustomer) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (!getCustomer.is_active) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_ACTIVE, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (getCustomer.is_delete) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (getCustomer.invalid_password >= 5) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_IS_LOCKED, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const isMatch = await bcrypt.compare(payload.password, getCustomer.password);
            if (!isMatch) {
                getCustomer.invalid_password += 1;
                await getCustomer.save();

                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, 'password')], HttpStatus.BAD_REQUEST);
            }
            getCustomer.invalid_password = 0;
            await getCustomer.save();
            const payloadToken = {
                code_phone_area: getCustomer.code_phone_area,
                phone: getCustomer.phone,
                name: getCustomer.name,
                full_name: getCustomer.full_name,
                email: getCustomer.email,
                _id: getCustomer._id,
                avatar: getCustomer.avatar,
                birth_date: getCustomer.birth_date,
                birthday: getCustomer.birthday,
                gender: getCustomer.gender,

            }
            const accessToken = await this.jwtService.sign(payloadToken);
            if (payload.device_token) {
                const findToken = await this.deviceTokenModel.findOne({ token: payload.device_token });
                if (findToken) {
                    findToken.is_delete = false
                    findToken.user_id = getCustomer._id,
                    findToken.user_object = "customer";
                    findToken.date_update = new Date(Date.now()).toISOString(),
                    findToken.save();
                } else {
                    const newDeviceToken = new this.deviceTokenModel({
                        user_id: getCustomer._id,
                        user_object: "customer",
                        token: payload.device_token,
                        date_create: new Date(Date.now()).toISOString(),
                        date_update: new Date(Date.now()).toISOString(),
                    })
                    newDeviceToken.save();
                }
            }

            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getMax() {
        try {
            const max = await this.customerModel.find().sort({ ordinal_number: -1 })
            return max;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
