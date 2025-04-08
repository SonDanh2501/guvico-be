import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { differenceInSeconds } from 'date-fns'
import { ERROR, GlobalService, phoneDTO } from 'src/@core'
import { PHONE_OTP_TYPE, TYPE_USER_OBJECT, USER_TYPE } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { EtelecomService } from 'src/@share-module/etelecom/etelecom.service'
import { SmsService } from 'src/@share-module/sms/sms.service'
import { ZnsService } from 'src/@share-module/zns/zns.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { PhoneBlacklistOopSystemService } from 'src/core-system/@oop-system/phone-blacklist-oop-system/phone-blacklist-oop-system.service'
import { PhoneOTPOopSystemService } from 'src/core-system/@oop-system/phone-otp-oop-system/phone-otp-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'

@Injectable()
export class PhoneOTPSystemService {
  constructor(
    private globalService: GlobalService,
    private customExceptionService: CustomExceptionService,
    private smsService: SmsService,
    private customerOopSystemService: CustomerOopSystemService,
    private phoneOTPOopSystemService: PhoneOTPOopSystemService,
    private settingOopSystemService: SettingOopSystemService,
    private phoneBlacklistOopSystemService: PhoneBlacklistOopSystemService,

    private historyActivityOopSystemService: HistoryActivityOopSystemService,
    private znsService: ZnsService,
    private etelecomService: EtelecomService,
  ) { }

  async createAndSendPhoneOTP(lang, payload, user_type) {
    try {
        const generateCode = await this.generateCode(lang, payload, user_type);
        const salt = await bcrypt.genSalt();
        const hashedOtp = await bcrypt.hash(generateCode.codeOTP, salt);

        const payloadCreate = {
          token: hashedOtp,
          code_phone_area: payload.code_phone_area,
          phone: payload.phone,
          user_type: TYPE_USER_OBJECT.customer,
          type: PHONE_OTP_TYPE.etelecom,
          headers_request: payload.headers_request,
          tracking_id: generateCode.trackingId,
          date_create: new Date().toISOString()
        }
        
        await this.phoneOTPOopSystemService.createItem(payloadCreate)
        const phone = payload.code_phone_area + payload.phone.substring(1);
        // await this.znsService.sendOTP(getSytemSetting, codeOTP, phone, trackingId)
        await this.etelecomService.sendOTP(phone, generateCode.codeOTP, generateCode.trackingId)
        // await this.smsService.sendOTP(codeOTP, phone)


        return true
    } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }

  async generateCode(lang, payload: phoneDTO, user_type) {
    try {
      const getPhoneBlacklist = await this.phoneBlacklistOopSystemService.getItemByPhoneNumber(lang, payload.phone, true)
      const getCustomerSetting = await this.settingOopSystemService.getCustomerSetting(lang)
      const countPhoneOTPIn30Days = await this.phoneOTPOopSystemService.countPhoneOTPByPhoneIn30Days(payload, user_type)
      if(countPhoneOTPIn30Days >= getCustomerSetting.otp_setting_in_30days && (!getPhoneBlacklist || !getPhoneBlacklist.is_skipped)) {
        const getPhoneBlacklist = await this.phoneBlacklistOopSystemService.getItemByPhoneNumber(lang, payload.phone)
        if(!getPhoneBlacklist) {
          // Đưa số điện thoại vào danh sách đen
          const payloadCreateData = {
            user_type: USER_TYPE.customer,
            phone: payload.phone,
            date_create: new Date().toISOString()
          }
          await this.phoneBlacklistOopSystemService.createItem(payloadCreateData)
        }

        throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_HAS_BEEN_BLOCKED, lang, 'phone')], HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const countPhoneOTP = await this.phoneOTPOopSystemService.countPhoneOTPByPhone(payload, user_type)
  
        // OTP chỉ bắn 1 tháng số lần trong cấu hình cho 1 số điện thoại 
        if(countPhoneOTPIn30Days >= getCustomerSetting.otp_setting_in_30days){
          const property = {
            property: getCustomerSetting.otp_setting_in_30days
          }
          throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.OTP_OVER_IN_30DAYS,lang, property, 'phone')], HttpStatus.BAD_REQUEST);
        }
        
        // OTP chỉ bắn 1 ngày theo số lần trong cấu hình cho 1 số điện thoại 
        if(countPhoneOTP >= getCustomerSetting.otp_setting){
          const property = {
              property: getCustomerSetting.otp_setting
          }
            throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.OTP_OVER,lang, property, 'phone')], HttpStatus.BAD_REQUEST);
        }
  
        // do something send OTP
        const codeOTP = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();
        const trackingId = await this.globalService.randomReferralCode(11)
        // const codeOTP = "111111";
        
        return { codeOTP, trackingId };
      }
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async generateOTP(lang, payload, user_type) {
    try {
      await this.phoneBlacklistOopSystemService.getItemByPhoneNumber(lang, payload.phone, true)
      const getPhoneOTP = await this.phoneOTPOopSystemService.getPhoneOTPByPhone(payload, user_type)
      if (getPhoneOTP) {
          const checkTime = differenceInSeconds(new Date(Date.now()), new Date(getPhoneOTP.date_create));
          if (checkTime < 120) {
              return true
          } else {
              await this.createAndSendPhoneOTP(lang, payload, user_type)
              return true
          }
      } else {
          await this.createAndSendPhoneOTP(lang, payload, user_type)
          return true
      }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async checkOTP(lang, payload, type_user_object) {
    try {
       // Kiem tra so dien thoai
      payload.phone = await this.globalService.normalizePhoneNumber(lang, payload.phone)
      const getPhoneOTP = await this.phoneOTPOopSystemService.getPhoneOTPByPhone(payload, type_user_object)
      if (!getPhoneOTP) {
        throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'code')], HttpStatus.FORBIDDEN);
      }

      const dateNow = new Date().getTime();
      if ((dateNow - new Date(getPhoneOTP.date_create).getTime()) > 60000) {
        throw new HttpException([await this.customExceptionService.i18nError(ERROR.TOKEN_OUT_DATE, lang, 'code')], HttpStatus.BAD_REQUEST);
      }

      const isOTPValid = await bcrypt.compare(payload.code, getPhoneOTP.token);
      if (!isOTPValid) {
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
}
