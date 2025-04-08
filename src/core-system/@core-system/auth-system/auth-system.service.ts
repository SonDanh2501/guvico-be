import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { getMonth } from 'date-fns'
import { createCustomerDTOAdmin, ERROR, GlobalService, LoginDTOCustomer, RegisterDTOCustomer, RegisterV2DTOCollaborator } from 'src/@core'
import { TYPE_REFERRAL_CODE, TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { DeviceTokenOopSystemService } from 'src/core-system/@oop-system/device-token-oop-system/device-token-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { PromotionOopSystemService } from 'src/core-system/@oop-system/promotion-oop-system/promotion-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { GroupCustomerSystemService } from 'src/core-system/group-customer-system/group-customer-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { PhoneOTPSystemService } from '../phone-otp-system/phone-otp-system.service'
import { TYPE_SUBJECT_ACTION } from './../../../@repositories/module/mongodb/@database/enum/base.enum'

@Injectable()
export class AuthSystemService {
    constructor(
        private globalService: GlobalService,
        private generalHandleService: GeneralHandleService,
        private jwtService: JwtService,
        private customExceptionService: CustomExceptionService,
        private customerOopSystemService: CustomerOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private phoneOTPSystemService: PhoneOTPSystemService,
        private groupCustomerSystemService: GroupCustomerSystemService,
        private deviceTokenOopSystemService: DeviceTokenOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private notificationSystemService: NotificationSystemService,
        private settingOopSystemService: SettingOopSystemService,
        private promotionOopSystemService: PromotionOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
    ) { }

    async loginForCustomer(lang, payload: LoginDTOCustomer) {
        try {
            const getCustomer = await this.customerOopSystemService.getCustomerByPhone(lang, payload, true);
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

            const accessToken = this.jwtService.sign(payloadToken);
            if (payload.device_token) {
                const subjectAction = {
                    _id: getCustomer._id,
                    type: TYPE_SUBJECT_ACTION.customer
                }

                await this.deviceTokenOopSystemService.updateDeviceToken(subjectAction, payload)
            }

            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async forgotPasswordForCustomer(lang, payload) {
        try {
            const checkCustomerByPhone = await this.customerOopSystemService.getCustomerByPhone(lang, payload)
            if(!checkCustomerByPhone)  {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.NOT_FOUND);
            }
            if(!checkCustomerByPhone.is_active) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_ACTIVE, lang, 'phone')], HttpStatus.NOT_FOUND);
            }
            await this.phoneOTPSystemService.generateOTP(lang, payload, TYPE_USER_OBJECT.customer)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateNewPassword(lang, payload) {
        try {
            const convertToken = await this.globalService.decryptObject(payload.token);
            const dateNow = new Date(Date.now()).getTime();
            if ((dateNow - convertToken.date_create) > 120000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_RESET_EXPIRES, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCustomer = await  this.customerOopSystemService.getCustomerByPhone(lang, convertToken, true);
            getCustomer.salt = await bcrypt.genSalt();
            getCustomer.password = await bcrypt.hash(payload.password, getCustomer.salt);
            await this.customerOopSystemService.updateCustomer(lang, getCustomer)
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

            const accessToken = this.jwtService.sign(payloadToken);
            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async registerPhoneForCustomer(lang, payload) {
        try {
            // Kiem tra so dien thoai
            payload.phone = await this.globalService.normalizePhoneNumber(lang, payload.phone)
            await this.customerOopSystemService.checkPhoneExisted(lang, payload)
            await this.phoneOTPSystemService.generateOTP(lang, payload, TYPE_USER_OBJECT.customer)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async genIndexSearch(convertToken, payload) {
        const low = payload.full_name.toLocaleLowerCase()
        const nomark = await this.generalHandleService.cleanAccents(low);
        return [convertToken.phone, low, nomark]
    }

    async registerForCustomer(lang, payload: RegisterDTOCustomer, version, isWebsite: boolean = false) {
        try {
            const payloadDependency = {
                customer: null
            }

            const convertToken = await this.globalService.decryptObject(payload.token);

            // Kiem tra SDT va email co ton tai hay khong
            await this.customerOopSystemService.checkPhoneExisted(lang, convertToken)
            await this.customerOopSystemService.checkEmailExisted(lang, payload.email)

            const getCustomerSetting = await this.settingOopSystemService.getCustomerSetting(lang)
            
            const versionStr = version ? version.toString() : "1.0.0"
            const arrVersion = versionStr.split(".") 
            const fixVersion = Number(arrVersion[2])

            // Hash password
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash(payload.password, salt)
            
            // Lay nguoi gioi thieu theo ma gioi thieu
            let resultInviter = null
            let resultReferrerPerson = null
            if (payload?.code_inviter) {
                if(fixVersion < 42 && !isWebsite) {
                    resultInviter = await this.getInviterForCustomer(lang, payload.code_inviter)
                } else {
                    resultReferrerPerson = await this.getReferrerForCustomer(lang, payload.code_inviter)
                }
            }

            const getLastestCustomer = await this.customerOopSystemService.getNewestCustomer()
            // Gen id view
            const tempIdView = this.getTempIdView(getLastestCustomer, 'KH')

            // Gen index search
            const indexSearch = await this.genIndexSearch(convertToken, payload)

            // Gen ma gioi thieu
            // prefix p la promotional (voucher)
            // prefix d la chiet khau (discount)
            const promotionalReferralCode = `${TYPE_REFERRAL_CODE.promotional}${convertToken.phone}`
            const referralCode = `${TYPE_REFERRAL_CODE.discount}${convertToken.phone}`

            // Tao danh sach thong tin thanh toan
            const paymentInformation = []
            for(let i = 0; i < getCustomerSetting.payment_method.length;i ++) {
                const itemPaymentMethod:any = {}
                itemPaymentMethod['method'] = getCustomerSetting.payment_method[i].method
                itemPaymentMethod['information'] = []

                paymentInformation.push(itemPaymentMethod)
            }

            // Tao moi khach hang
            const payloadCreate = {
                phone: convertToken.phone,
                password: password,
                salt: salt,
                name: payload.name,
                date_create: new Date(Date.now()).toISOString(),
                invite_code: convertToken.phone,
                pay_point: 0,
                ordinal_number: (getLastestCustomer) ? getLastestCustomer.ordinal_number + 1 : 1,
                id_view: tempIdView,
                index_search: indexSearch,
                promotional_referral_code: promotionalReferralCode,
                referral_code: referralCode,
                id_customer_inviter: resultInviter?.isCustomer === true ? resultInviter?.inviter?._id : null,
                id_collaborator_inviter: resultInviter?.isCustomer === false ? resultInviter?.inviter?._id : null,
                id_customer_referrer: resultReferrerPerson?.referrer?._id || null,
                get_voucher: resultReferrerPerson?.getVoucher || false,
                payment_information: paymentInformation,
                payment_method_default: getCustomerSetting.payment_method[0],
                
                gender: payload.gender,
                full_name: payload.full_name || "",
                email: payload.email || "",
                birth_date: payload.birthday,
                birthday: payload.birthday,
                identity_number: payload.identity_number,
                tax_code: payload.tax_code,
                city: payload.city,
                district: payload.district,
<<<<<<< HEAD

=======
>>>>>>> son
            }

            const newCustomer = await this.customerOopSystemService.createCustomer(payloadCreate)
            payloadDependency.customer = newCustomer

            // Ghi log nhap ma gioi thieu
            if (resultReferrerPerson?.inviter?._id) {
                await this.logAndPushNotificationForInviter(lang, resultReferrerPerson.inviter, newCustomer, resultReferrerPerson.isCustomer, TYPE_SUBJECT_ACTION.customer)
            }

            // Neu resultReferrerPerson?.getVoucher = true thi dua id cua customer vao id_customer cua promotion danh cho affiliate
            if(resultReferrerPerson?.getVoucher) {
                const getPromotion = await this.promotionOopSystemService.getPromotionForAffiliate()
                if(getPromotion) {
                    getPromotion.id_customer.push(newCustomer._id)

                    await this.promotionOopSystemService.updatePromotion(lang, getPromotion)
                }
            }

            const subjectAction = {
                _id: newCustomer._id,
                type: TYPE_SUBJECT_ACTION.customer
            }

            // Cap nhat device token neu co
            if (payload.device_token) {
                await this.deviceTokenOopSystemService.updateDeviceToken(subjectAction, payload)
            }

            // Ghi log
            await this.historyActivityOopSystemService.createNewAccountForCustomer(subjectAction, payloadDependency);

            // Cap nhat ngay chap nhan chinh sach
            newCustomer.date_accept_policy = new Date(Date.now()).toISOString();
            await this.customerOopSystemService.updateCustomer(lang, newCustomer)

            await this.groupCustomerSystemService.updateConditionIn(newCustomer._id) // Đưa dòng này xuống cuối, lúc trước để ở trên nên bị cập nhật 2 lần dẫn đến group customer sẽ là rỗng

             // Gen access token
            const payloadToken = {
                code_phone_area: newCustomer.code_phone_area,
                phone: newCustomer.phone,
                name: newCustomer.name,
                full_name: newCustomer.full_name,
                email: newCustomer.email,
                _id: newCustomer._id,
                avatar: newCustomer.avatar,
                birth_date: newCustomer.birth_date,
                birthday: newCustomer.birthday,
                gender: newCustomer.gender,
                id_view: newCustomer.id_view
            }
            const accessToken = this.jwtService.sign(payloadToken);

            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async registerForCustomerByAdmin(lang, subjectAction, payload: createCustomerDTOAdmin) {
        try {
            const payloadDependency = {
                customer: null,
                admin_action: null
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
            }

            // Kiem tra SDT va email co ton tai hay khong
            await this.customerOopSystemService.checkPhoneExisted(lang, payload)
            await this.customerOopSystemService.checkEmailExisted(lang, payload.email)

            const getCustomerSetting = await this.settingOopSystemService.getCustomerSetting(lang)

            // Hash password
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash(payload.password, salt)

            const getLastestCustomer = await this.customerOopSystemService.getNewestCustomer()
            // Gen id view
            const tempIdView = this.getTempIdView(getLastestCustomer, 'KH')

            // Gen index search
            const indexSearch = await this.genIndexSearch(payload, payload)

            // Gen ma gioi thieu
            // prefix p la promotional (voucher)
            // prefix d la chiet khau (discount)
            const promotionalReferralCode = `${TYPE_REFERRAL_CODE.promotional}${payload.phone}`
            const referralCode = `${TYPE_REFERRAL_CODE.discount}${payload.phone}`

            // Tao danh sach thong tin thanh toan
            const paymentInformation = []
            for(let i = 0; i < getCustomerSetting.payment_method.length;i ++) {
                const itemPaymentMethod:any = {}
                itemPaymentMethod['method'] = getCustomerSetting.payment_method[i].method
                itemPaymentMethod['information'] = []

                paymentInformation.push(itemPaymentMethod)
            }

            // Tao moi khach hang
            const payloadCreate = {
                phone: payload.phone,
                password: password,
                salt: salt,
                name: payload.name,
                full_name: payload.full_name,
                date_create: new Date(Date.now()).toISOString(),
                email: payload.email || "",
                invite_code: payload.phone,
                pay_point: 0,
                ordinal_number: (getLastestCustomer) ? getLastestCustomer.ordinal_number + 1 : 1,
                id_view: tempIdView,
                index_search: indexSearch,
                promotional_referral_code: promotionalReferralCode,
                referral_code: referralCode,
                id_customer_inviter: null,
                id_collaborator_inviter: null,
                id_customer_referrer:  null,
                get_voucher: false,
                payment_information: paymentInformation,
                payment_method_default: getCustomerSetting.payment_method[0]
            }

            const newCustomer = await this.customerOopSystemService.createCustomer(payloadCreate)
            payloadDependency.customer = newCustomer

            // Ghi log
            await this.historyActivityOopSystemService.createNewAccountForCustomer(subjectAction, payloadDependency);
            await this.groupCustomerSystemService.updateConditionIn(newCustomer._id) // Đưa dòng này xuống cuối, lúc trước để ở trên nên bị cập nhật 2 lần dẫn đến group customer sẽ là rỗng

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    getTempIdView(getLastestCustomer, prefix) {
        try {
            let tempIdView = prefix;
            if (getLastestCustomer) {
                let tempOrdinalNumber = '00000000';
                const temp = getLastestCustomer.ordinal_number + 1;
                tempOrdinalNumber = tempOrdinalNumber.concat(temp.toString());
                tempOrdinalNumber = tempOrdinalNumber.slice(-8);
                tempIdView = `${prefix}${tempOrdinalNumber}`
            } else {
                tempIdView = `${prefix}00000001`;
            }

            return tempIdView
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInviterForCustomer(lang, inviteCode) {
        try {
            let isCustomer = true
            let getInviter = await this.customerOopSystemService.checkReferralCode(lang, inviteCode)
            if(!getInviter) {
                getInviter = await this.collaboratorOopSystemService.checkReferralCode(lang, inviteCode)

                if(getInviter) {
                    isCustomer = false
                } 
            }

            return { inviter: getInviter, isCustomer }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getReferrerForCustomer(lang, inviteCode) {
        try {
            let getVoucher = false
            const prefix = inviteCode.slice(0, 1)
            let getReferrer = await this.customerOopSystemService.checkReferralCode(lang, inviteCode, prefix)
            
            if (getReferrer?.promotional_referral_code === inviteCode) {
                getVoucher = true
            }  

            return { referrer: getReferrer, getVoucher }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async registerForCollaborator(lang, payload: RegisterV2DTOCollaborator) {
        try {
            const payloadDependency = {
                collaborator: null
            }
            const convertToken = await this.globalService.decryptObject(payload.token);
            // Kiem tra SDT va email co ton tai chua
            await this.collaboratorOopSystemService.checkPhoneExisted(lang, convertToken)
            await this.collaboratorOopSystemService.checkEmailExisted(lang, payload.email)

            // Hash password
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash(payload.password, salt)

            // Lay nguoi gioi thieu theo ma gioi thieu
            let resultInviter = null
            if (payload?.code_inviter) {
                resultInviter = await this.getInviterForCollaborator(payload.code_inviter,)
            }

            // Gen id view
            const query = {
                $and: [
                    { city: payload.city }
                ]
            }
            const sort = { ordinal_number: -1 }
            const getListCollaborator = await this.collaboratorOopSystemService.getListCollaborator(query, sort)
            let tempOrdinalNumber;
            if (getListCollaborator.length > 0) {
                tempOrdinalNumber = getListCollaborator[0].ordinal_number + 1;
            } else {
                tempOrdinalNumber = 1;
            }
            let tempIdView = '00000';
            const temp_city = +payload.city > 10 ? payload.city : `0${payload.city}`
            tempIdView = `${tempIdView}${tempOrdinalNumber}`;
            tempIdView = `CTV${temp_city}${tempIdView.slice(-5)}`;

            // Gen index search
            const indexSearch = this.genIndexSearch(convertToken, payload)

            // Gen ma gioi thieu
            const promotionalReferralCode = `${TYPE_REFERRAL_CODE.promotional}${convertToken.phone}`
            const referralCode = `${TYPE_REFERRAL_CODE.discount}${convertToken.phone}`

            // Tao moi doi tac
            const payloadCreate = {
                phone: convertToken.phone,
                code_phone_area: convertToken.code_phone_area,
                password: password,
                salt: salt,
                full_name: payload.full_name ,
                identity_number: payload.identity_number,
                gender: "other",
                birthday: payload.birthday ? payload.birthday : new Date(Date.now()).toISOString(),
                city: payload.city,
                district: payload.district,
                email: payload.email,
                avatar: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1667204262/guvi/htbwmbolam1uh18vjle4.png",
                device_token: payload.device_token || "",
                invite_code: convertToken.phone,
                id_inviter: resultInviter?._id || "",
                month_birthday: getMonth(new Date(Date.now())),
                id_view: tempIdView,
                ordinal_number: tempOrdinalNumber,
                type: payload.type,
                desire_service: payload.desire_service,
                index_search: indexSearch,
                promotional_referral_code: promotionalReferralCode,
                referral_code: referralCode,
            }
            const newCollaborator = await this.collaboratorOopSystemService.createItem(payloadCreate)
            payloadDependency.collaborator = newCollaborator

            if (resultInviter?.inviter?._id) {
                await this.logAndPushNotificationForInviter(lang, resultInviter.inviter, newCollaborator, resultInviter.isCustomer, TYPE_SUBJECT_ACTION.collaborator)
            }

            // Gen access token
            const payloadToken = {
                is_verify: false,
                is_active: false,
                name: newCollaborator.name,
                full_name: newCollaborator.full_name,
                email: newCollaborator.email,
                avatar: newCollaborator.avatar,
                phone: newCollaborator.phone,
                code_phone_area: newCollaborator.code_phone_area,
                _id: newCollaborator._id,
            }
            const accessToken = this.jwtService.sign(payloadToken);
        
            const subjectAction = {
                _id: newCollaborator._id,
                type: TYPE_USER_OBJECT.collaborator
            }

            // Cap nhat device token neu co
            if (payload.device_token) {
                await this.deviceTokenOopSystemService.updateDeviceToken(subjectAction, payload)
            }
            this.historyActivityOopSystemService.createNewAccountForCollaborator(subjectAction, payloadDependency);

            return {
                token: accessToken,
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInviterForCollaborator(inviteCode) {
        try {
            let isCustomer = true
            let getInviter = await this.customerOopSystemService.getInviteCode(inviteCode)
            if (!getInviter) {
                isCustomer = false
                getInviter = await this.collaboratorOopSystemService.getReferralCode(inviteCode)

                return { inviter: getInviter, isCustomer }
            } 

            return { inviter: getInviter, isCustomer }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async logAndPushNotificationForInviter(lang, inviter, referralPerson, isCustomer, type_subject_action) {
        try {
            const  subjectAction = {
                _id: referralPerson._id,
                type: TYPE_SUBJECT_ACTION[type_subject_action]
            }

            const payloadDependency = {
                customer: null,
                collaborator: null
            }

            if (isCustomer) {
                payloadDependency.customer = inviter
            } else {
                payloadDependency.collaborator = inviter
            }

            await this.historyActivityOopSystemService.applyReferralCode(subjectAction, payloadDependency, isCustomer, referralPerson, type_subject_action)
            await this.notificationSystemService.applyReferralCode(lang, inviter, referralPerson, isCustomer)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateReferralCode(lang, subjectAction, referralCode) {
        try {
            const payloadDependency = {
                customer: null
            }

            // Kiem tra ma gioi thieu da ton tai hay chua
            await this.customerOopSystemService.getReferralCode(lang, referralCode, true)

            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, subjectAction._id)
            getCustomer.promotional_referral_code = `${TYPE_REFERRAL_CODE.promotional}${referralCode}`
            getCustomer.referral_code = `${TYPE_REFERRAL_CODE.discount}${referralCode}`

            payloadDependency.customer = await this.customerOopSystemService.updateCustomer(lang, getCustomer)
            await this.historyActivityOopSystemService.updateReferralCode(subjectAction, payloadDependency)
            
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkOldPasswordForCustomer(lang, subjectAction, payload) {
        try {
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, subjectAction._id);
            const isMatch = await bcrypt.compare(payload.password, getCustomer.password);
            if (!isMatch) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, 'password')], HttpStatus.BAD_REQUEST);

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changePasswordForCustomer(lang, subjectAction, payload) {
        try {
            const getCustomer = await  this.customerOopSystemService.getDetailItem(lang, subjectAction._id);
            // Kiem tra mat khau va xac nhan mat khau co trung hay khong
            if(payload.new_password !== payload.confirm_password) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_MATCH, lang, "password")], HttpStatus.BAD_REQUEST)
            }
            getCustomer.salt = await bcrypt.genSalt();
            getCustomer.password = await bcrypt.hash(payload.new_password, getCustomer.salt);
            await this.customerOopSystemService.updateCustomer(lang, getCustomer)
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

            const accessToken = this.jwtService.sign(payloadToken);
            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
