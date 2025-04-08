import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { differenceInSeconds, getMonth } from 'date-fns'
import { Model } from 'mongoose'
import { ChangePasswordDTOCollaborator, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ERROR, GlobalService, LoginDTOCollaborator, newPasswordDTOCollaborator, Order, OrderDocument, OTPCheckDTOCollaborator, phoneDTO, RegisterV2DTOCollaborator } from 'src/@core'
import { Collaborator, CollaboratorDocument } from 'src/@core/db/schema/collaborator.schema'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema'
import { PHONE_OTP_TYPE, USER_TYPE } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { EtelecomService } from 'src/@share-module/etelecom/etelecom.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { SmsService } from 'src/@share-module/sms/sms.service'
import { ZnsService } from 'src/@share-module/zns/zns.service'
import { PhoneBlacklistOopSystemService } from 'src/core-system/@oop-system/phone-blacklist-oop-system/phone-blacklist-oop-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { PhoneOTP, PhoneOTPDocument } from '../../@core/db/schema/phone_otp.schema'

@Injectable()
export class AuthService {
    constructor(
        private globalService: GlobalService,
        private jwtService: JwtService,
        private smsService: SmsService,
        private znsService: ZnsService,
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private phoneBlacklistOopSystemService: PhoneBlacklistOopSystemService,
        private etelecomService: EtelecomService,

        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(PhoneOTP.name) private phoneOtpModel: Model<PhoneOTPDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,
    ) { }

    async forgotPassword(lang, payload) {
        try {
            const checkCollaboratorByPhone = await this.collaboratorModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!checkCollaboratorByPhone) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.NOT_FOUND);
            if(!checkCollaboratorByPhone.is_active) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_ACTIVE, lang, 'phone')], HttpStatus.NOT_FOUND);
            }
            // if (checkCustomerByPhone.password_default !== null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.NOT_FOUND);
            const getPhoneOtp = await this.phoneOtpModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }, { user_type: 'collaborator' }] }).sort({ date_create: -1 });
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
                        user_type: 'collaborator',
                        type: PHONE_OTP_TYPE.etelecom,
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
                    user_type: 'collaborator',
                    type: PHONE_OTP_TYPE.etelecom,
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

    async newPassword(lang, payload: newPasswordDTOCollaborator) {
        try {
            const convertToken = await this.globalService.decryptObject(payload.token);
            if (!convertToken.phone && !convertToken.code_phone_area && !convertToken.date_create) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CODE_NOT_VALID, lang, 'code')], HttpStatus.BAD_REQUEST);
            const dateNow = new Date(Date.now()).getTime();
            if ((dateNow - convertToken.date_create) > 120000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TOKEN_OUT_DATE, lang, 'code')], HttpStatus.BAD_REQUEST);
            const getCollaboratorByPhone = await this.collaboratorModel.findOne({ $and: [{ phone: convertToken.phone }, { code_phone_area: convertToken.code_phone_area }] });
            getCollaboratorByPhone.salt = await bcrypt.genSalt();
            getCollaboratorByPhone.password = await bcrypt.hash(payload.password, getCollaboratorByPhone.salt);
            await getCollaboratorByPhone.save();
            const payloadToken = {
                name: getCollaboratorByPhone.name,
                full_name: getCollaboratorByPhone.full_name,
                email: getCollaboratorByPhone.email,
                avatar: getCollaboratorByPhone.avatar,
                phone: getCollaboratorByPhone.phone,
                code_phone_area: getCollaboratorByPhone.code_phone_area,
                _id: getCollaboratorByPhone._id,
                is_verify: getCollaboratorByPhone.is_verify,
                is_active: getCollaboratorByPhone.is_active
            }
            const accessToken = await this.jwtService.sign(payloadToken);
            return {
                token: accessToken,
                request_change_password_default: false
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async checkOTP(lang, payload: OTPCheckDTOCollaborator) {
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
            const getPhoneBlacklist = await this.phoneBlacklistOopSystemService.getItemByPhoneNumber(lang, payload.phone, true)
            const today = new Date(); // Tính toán cuối ngày và đầu ngày 
            today.setHours(0, 0, 0, 0);
            const startOfDay = new Date(today);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999); // Tính toán cuối ngày và đầu ngày 
            const startOfDayBefore30Days = new Date(new Date(new Date().setDate(new Date().getDate() - 30)).setHours(0, 0, 0, 0))

            const countDoc = await this.phoneOtpModel.countDocuments({
                type: PHONE_OTP_TYPE.etelecom,
                user_type: "collaborator",
                code_phone_area: payload.code_phone_area,
                phone: payload.phone,
                date_create: {
                    $gte: startOfDay.toISOString(),
                    $lte: endOfDay.toISOString()
                },
            }).exec();

            const countDocIn30Days = await this.phoneOtpModel.countDocuments({
                type: PHONE_OTP_TYPE.etelecom,
                user_type: "collaborator",
                code_phone_area: payload.code_phone_area,
                phone: payload.phone,
                date_create: {
                    $gte: startOfDayBefore30Days.toISOString(),
                    $lte: endOfDay.toISOString()
                },
            }).exec();

            const collaboratorSetting = await this.collaboratorSettingModel.findOne()
            const otpSetting = collaboratorSetting.otp_setting
            const otpSettingIn30Days = collaboratorSetting.otp_setting_in_30days

            if(countDocIn30Days >= otpSettingIn30Days && (!getPhoneBlacklist || !getPhoneBlacklist.is_skipped)) {
                const getPhoneBlacklist = await this.phoneBlacklistOopSystemService.getItemByPhoneNumber(lang, payload.phone)
                // Đưa số điện thoại vào danh sách đen
                if(!getPhoneBlacklist) {
                    const payloadCreateData = {
                        user_type: USER_TYPE.collaborator,
                        phone: payload.phone,
                        date_create: new Date().toISOString()
                    }
            
                    await this.phoneBlacklistOopSystemService.createItem(payloadCreateData)
                }
        
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_HAS_BEEN_BLOCKED, lang, 'phone')], HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                // OTP chỉ bắn 1 tháng theo số lần trong cấu hình cho 1 số điện thoại 
                if (countDocIn30Days >= otpSettingIn30Days) {
                    const property = {
                        property: otpSettingIn30Days
                    }
                    throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.OTP_OVER_IN_30DAYS, lang, property, 'phone')], HttpStatus.BAD_REQUEST);
                }
    
                // OTP chỉ bắn 1 ngày theo số lần trong setting cho 1 số điện thoại 
                if (countDoc > otpSetting) {
                    const property = {
                        property: otpSetting
                    }
                    throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.OTP_OVER, lang, property, 'phone')], HttpStatus.BAD_REQUEST);
                }
                // do something send OTP
                const codeOTP = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString()
                const trackingId = await this.globalService.randomReferralCode(11)
                const phone = payload.code_phone_area + payload.phone.substring(1);
                // await this.znsService.sendOTP(getSytemSetting, codeOTP, phone, trackingId)
                await this.etelecomService.sendOTP(phone, codeOTP, trackingId)
                // await this.smsService.sendOTP(codeOTP, phone)
                // const codeOTP = "111111";
                return { codeOTP, trackingId };
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    };

    async getInfoByToken(lang, payload) {
        try {
            const getCollaborator = await this.collaboratorModel.findOne({ _id: payload._id });
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async registerPhone(lang, payload) {
        try {
            payload.phone = await this.globalService.normalizePhoneNumber(lang, payload.phone)
            const getCustomer = await this.collaboratorModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, 'phone')], HttpStatus.BAD_REQUEST);
            const getPhoneOtp = await this.phoneOtpModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }, { user_type: 'collaborator' }] }).sort({ date_create: -1 });
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
                        user_type: 'collaborator',
                        type: PHONE_OTP_TYPE.etelecom,
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
                    user_type: 'collaborator',
                    type: PHONE_OTP_TYPE.etelecom,
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

    async deleteAccount(lang, user) {
        try {
            const findUser = await this.collaboratorRepositoryService.findOneById(user._id);

            if (!findUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.BAD_REQUEST);
            const findOrder = await this.orderModel.findOne({
                $and: [
                    { id_collaborator: user._id },
                    { status: "confirm" },
                    { status: "doing" }
                ]
            });
            if (findOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.STUCK_ORDER_FOR_DELETE_ACCOUNT, lang, "customer")], HttpStatus.BAD_REQUEST);
            //xoa mem
            findUser.is_delete = true;
            // await findUser.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(user._id, findUser);
            this.activityCollaboratorSystemService.deleteAccount(findUser)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async registerV2(lang, payload: RegisterV2DTOCollaborator) {
        try {
            const salt = await bcrypt.genSalt();
            // let password_default = await this.generalHandleService.GenerateRandomNumberString(6);
            const convertToken = await this.globalService.decryptObject(payload.token);
            const password = await bcrypt.hash(payload.password, salt);
            //////////////////////////// check sđt có tồn tại không ///////////////////////
            const checkPhoneExisted = await this.collaboratorModel.findOne({ $and: [{ phone: convertToken.phone }, { code_phone_area: convertToken.code_phone_area }] });
            if (checkPhoneExisted) {
                if (checkPhoneExisted.is_delete) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_VALID, lang, null)], HttpStatus.BAD_REQUEST);
                else throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            }
            //////////////////////////// check sđt có tồn tại không ///////////////////////


            //////////////////////////// check email có tồn tại không ///////////////////////
            const checkEmailExisted = await this.collaboratorModel.findOne({ email: payload.email });
            if (checkEmailExisted && payload.email !== "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
            //////////////////////////// check email có tồn tại không ///////////////////////
            let resultCode = "";
            let checkCodeInvite = false;
            do {
                resultCode = await this.generalHandleService.GenerateRandomString(6);
                const checkDuplicate = await Promise.all([
                    this.customerModel.findOne({ invite_code: resultCode }),
                    this.collaboratorModel.findOne({ invite_code: resultCode })
                ]);
                checkCodeInvite = (checkDuplicate[0] || checkDuplicate[1]) ? true : false;
            } while (checkCodeInvite === true);
            let getIdInviter = null;
            if (payload.code_inviter && payload.code_inviter !== "" && payload.code_inviter !== null) {
                const getInviter = await this.collaboratorModel.findOne({ invite_code: payload.code_inviter, is_delete: false });
                if (!getInviter) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.INVITE_CODE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
                getIdInviter = getInviter._id;
                getInviter.save();
            }
            const getArrCollaborator = await this.collaboratorModel.find({ city: payload.city }).sort({ ordinal_number: -1 });
            let tempOrdinalNumber;
            if (getArrCollaborator.length > 0) {
                tempOrdinalNumber = getArrCollaborator[0].ordinal_number + 1;
            } else {
                tempOrdinalNumber = 1;
            }
            let tempIdView = '00000';

            const temp_city = Number(payload.city) > 10 ? payload.city : `0${payload.city}`
            tempIdView = `${tempIdView}${tempOrdinalNumber}`;

            tempIdView = `CTV${temp_city}${tempIdView.slice(-5)}`;


            const low = payload.full_name.toLocaleLowerCase()
            const nomark = await this.generalHandleService.cleanAccents(low);
            const indexSearch = [convertToken.phone, low, nomark]
            console.log(payload.desire_service)
            const newCustomer = new this.collaboratorModel({
                phone: convertToken.phone,
                code_phone_area: convertToken.code_phone_area,
                password: password,
                password_default: null,
                salt: salt,
                full_name: payload.full_name,
                identity_number: payload.identity_number,
                date_create: new Date(Date.now()).toISOString(),
                gender: "other",
                birthday: payload.birthday ? payload.birthday : new Date(Date.now()).toISOString(),
                city: payload.city,
                district: payload.district,
                email: payload.email || "",
                avatar: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1667204262/guvi/htbwmbolam1uh18vjle4.png",
                device_token: payload.device_token || "",
                invite_code: resultCode,
                id_collaborator_inviter: getIdInviter,
                month_birthday: getMonth(new Date(Date.now())),
                id_view: tempIdView,
                ordinal_number: tempOrdinalNumber,
                type: payload.type,
                desire_service: payload.desire_service,
                index_search: indexSearch
            });
            const result = await newCustomer.save();
            const payloadToken = {
                is_verify: false,
                is_active: false,
                name: result.name,
                full_name: result.full_name,
                email: result.email,
                avatar: result.avatar,
                phone: result.phone,
                code_phone_area: result.code_phone_area,
                _id: result._id,
            }
            const accessToken = await this.jwtService.sign(payloadToken);
            ////////////////////////// update device token //////////////////////////
            if (payload.device_token) {
                const findToken = await this.deviceTokenModel.findOne({ token: payload.device_token });
                if (findToken) {
                    findToken.is_delete = false
                    findToken.user_id = result._id;
                    findToken.user_object = "collaborator";
                    findToken.date_update = new Date(Date.now()).toISOString()
                    findToken.save();
                } else {
                    const newDeviceToken = new this.deviceTokenModel({
                        user_id: result._id,
                        user_object: "collaborator",
                        token: payload.device_token,
                        date_create: new Date(Date.now()).toISOString(),
                        date_update: new Date(Date.now()).toISOString(),
                    })
                    newDeviceToken.save();
                }
            }
            ////////////////////////// kết thúc update device token //////////////////////////
            this.activityCollaboratorSystemService.newAccount(result._id);

            return {
                token: accessToken,
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async loginV2(lang, payload: LoginDTOCollaborator) {
        try {
            const getUser = await this.collaboratorRepositoryService.findOne({ phone: payload.phone, code_phone_area: payload.code_phone_area });

            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);

            if (getUser.is_locked === true) {
                if (getUser.date_lock !== null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_IS_LOCKED, lang, null)], HttpStatus.BAD_REQUEST);
                if (getUser.date_lock === null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_IS_LOCKED, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (getUser.is_delete) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const isMatch = await bcrypt.compare(payload.password, getUser.password);
            if (!isMatch) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, 'password')], HttpStatus.BAD_REQUEST);
            const payloadToken = {
                is_verify: getUser.is_verify,
                is_active: getUser.is_active,
                name: getUser.name,
                full_name: getUser.full_name,
                email: getUser.email,
                avatar: getUser.avatar,
                phone: getUser.phone,
                code_phone_area: getUser.code_phone_area,
                _id: getUser._id,
            }
            const accessToken = await this.jwtService.sign(payloadToken);
            ////////////////////////// update device token //////////////////////////
            if (payload.device_token) {
                const findLastDeviceToken = await this.deviceTokenModel.findOne({ user_id: getUser._id }).sort({ date_update: -1 });
                if (findLastDeviceToken) {
                    findLastDeviceToken.is_delete = true;
                    findLastDeviceToken.save();
                }

                const findToken = await this.deviceTokenModel.findOne({ token: payload.device_token });
                if (findToken) {
                    findToken.is_delete = false;
                    findToken.user_id = getUser._id;
                    findToken.user_object = "collaborator";
                    findToken.date_update = new Date(Date.now()).toISOString(),
                    findToken.save();
                } else {
                    const newDeviceToken = new this.deviceTokenModel({
                        user_id: getUser._id,
                        user_object: "collaborator",
                        token: payload.device_token,
                        date_create: new Date(Date.now()).toISOString(),
                        date_update: new Date(Date.now()).toISOString(),
                    })
                    newDeviceToken.save();
                }

            }
            ////////////////////////// kết thúc update device token //////////////////////////

            return {
                token: accessToken,
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changePassword(lang, payload: ChangePasswordDTOCollaborator, id) {
        try {
            if (payload.password === '') throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_CAN_NOT_BE_BLANK, lang, null)], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(id);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const checkPassword = await bcrypt.compare(payload.old_password, getCollaborator.password);
            if (!checkPassword) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DUPLICATE_PASSWORD_DEFAULT, lang, 'not correct password')], HttpStatus.BAD_REQUEST);
            getCollaborator.salt = await bcrypt.genSalt();
            if (getCollaborator.password_default !== null) {
                getCollaborator.password = await bcrypt.hash(payload.password, getCollaborator.salt);
                getCollaborator.password_default = null;
            } else {
                getCollaborator.password = await bcrypt.hash(payload.password, getCollaborator.salt);
            }
            await this.collaboratorRepositoryService.findByIdAndUpdate(id, getCollaborator);
            const payloadToken = {
                name: getCollaborator.name,
                full_name: getCollaborator.full_name,
                email: getCollaborator.email,
                avatar: getCollaborator.avatar,
                phone: getCollaborator.phone,
                code_phone_area: getCollaborator.code_phone_area,
                _id: getCollaborator._id,
                is_verify: getCollaborator.is_verify,
                is_active: getCollaborator.is_active
            };
            const accessToken = await this.jwtService.sign(payloadToken);
            return {
                token: accessToken,
                request_change_password_default: false
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkPhone(lang, payload: phoneDTO) {
        try {
            const getCollaborator = await this.collaboratorModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async changeNewPassword(lang, payload: ChangePasswordDTOCollaborator, idCollaborator) {
        try {
            if (payload.password === '' && payload.old_password) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_CAN_NOT_BE_BLANK, lang, null)], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const check_old_pass_word = await bcrypt.compare(payload.old_password, getCollaborator.password);
            if (!check_old_pass_word) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, 'old password')], HttpStatus.BAD_REQUEST);
            getCollaborator.salt = await bcrypt.genSalt();
            getCollaborator.password = await bcrypt.hash(payload.password, getCollaborator.salt);
            await getCollaborator.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, getCollaborator);
            const payloadToken = {
                name: getCollaborator.name,
                full_name: getCollaborator.full_name,
                email: getCollaborator.email,
                avatar: getCollaborator.avatar,
                phone: getCollaborator.phone,
                code_phone_area: getCollaborator.code_phone_area,
                _id: getCollaborator._id,
                is_verify: getCollaborator.is_verify,
                is_active: getCollaborator.is_active
            };
            const accessToken = await this.jwtService.sign(payloadToken);
            return {
                token: accessToken,
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
