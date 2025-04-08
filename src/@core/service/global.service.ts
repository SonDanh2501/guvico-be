import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as crypto from 'crypto-js'
import { I18nService } from 'nestjs-i18n'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { ERROR } from '../constant'
import { phoneDTO } from '../dto'

@Injectable()
export class GlobalService {
  constructor(
    private i18n: I18nService,
    private jwtService: JwtService,
    private customExceptionService: CustomExceptionService,
  ) { }

  async i18nValidation(validationField, lang, field?) {
    const text = {
      message: this.i18n.translate(`validation.${validationField}`, { lang, args: {} }),
      field: field || null
    }
    console.log(text, 'text');

    return text;
  }

  async i18nError(validationField, lang, field?) {
    console.log('<<<< ', validationField);

    const text = {
      message: this.i18n.translate(`error.${validationField}`, { lang, args: {} }),
      field: field || null
    }
    return text;
  }

  async convertPhone(lang, phone: phoneDTO) {
    switch (phone.code_phone_area) {
      case "+84": {
        phone.phone = (phone.phone.length === 10) ? phone.phone : "0" + phone.phone;
        // const temp = phone.phone.charAt(0);
        // if (temp === "0") phone.phone = phone.phone.slice(1);
        break;
      }
      default: {
        throw new HttpException([await this.i18nError(ERROR.PHONE_NOT_VALID, lang, 'phone')], HttpStatus.BAD_REQUEST);
      }
    }
    return phone
  }


  async encryptObject(object: object) {
    const temp = JSON.stringify(object);
    const result = crypto.AES.encrypt(temp, "guvico")
    return result.toString();
  }

  async decryptObject(code) {
    const temp2 = crypto.AES.decrypt(code, "guvico")
    const temp3 = temp2.toString(crypto.enc.Utf8)
    return JSON.parse(temp3.toString());
  }

  async convertStringToSlug(str: string) {
    str = str.trim();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/w/g, "-");
    return str;
  }

  async randomReferralCode(length: number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async randomID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async randomIDTransition(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var characters2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    var charactersLength = characters.length;
    var charactersLength2 = characters2.length;
    for (var i = 0; i < length; i++) {
      if (i === 0) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      } else {
        result += characters2.charAt(Math.floor(Math.random() * charactersLength2));
      }
    }
    return result;
  }

  async checkPermissionArea(user, city?, district?, id_service?, id_business?) {
    const result = {
      permisstion: true,
      city: user.area_manager_lv_1,
      district: user.area_manager_lv_2,
      id_service: user.id_service_manager
    }
    if (city && user.area_manager_lv_1.length > 0 && city !== -1) {
      // nếu có truyền params city và area manager lv_1 có giá trị != []
      result.permisstion = user.area_manager_lv_1.filter(i => Number(i) === Number(city)).length > 0;
      if (result.permisstion && district && user.area_manager_lv_2.length > 0) {
        // nếu có truyền params district và area manager lv_2 có giá trị != []
        result.permisstion = user.area_manager_lv_2.filter(i => Number(i) === Number(district)).length > 0;
      }
      if (!result.permisstion) return result;
    }
    if (id_service && id_service !== 'all' && user.id_service_manager.length > 0) {
      result.permisstion = user.id_service_manager.filter(i => i.toString() === id_service.toString()).length > 0;
      if (!result.permisstion) return result;
    }
    if (id_business && user.id_business) {
      result.permisstion = id_business.toString() === user.id_business.toString();
      if (!result.permisstion) return result;
    }
    return result;
  }

  async checkPermissionAreaV2(user, city?: number, district?: [], id_service?) { // ko sai
    const result = {
      permisstion: true,
      city: user.area_manager_lv_1,
      district: user.area_manager_lv_2,
      id_service: user.id_service_manager
    }
    if (city > 0 && user.area_manager_lv_1.length && city !== -1) {
      // nếu có truyền params city và area manager lv_1 có giá trị != []
      result.permisstion = user.area_manager_lv_1.filter(i => Number(i) === Number(city)).length > 0;
      if (result.permisstion && district.length > 0 && user.area_manager_lv_2.length > 0) {
        // nếu có truyền params district và area manager lv_2 có giá trị != []
        result.permisstion = user.area_manager_lv_2.filter(i => Number(i) === Number(district)).length > 0;
      }
      if (!result.permisstion) return result;
    }
    if (id_service && id_service !== 'all') {
      result.permisstion = user.area_manager_lv_1.filter(i => i.toString() === id_service.toString()).length > 0;
    }
    return result;
  }

  async convertDistrictOrCityToArray(province: string) {
    console.log('provicve ', province);

    const tempProvince = province.split(',');
    const tempArr = [];
    for (let i of tempProvince) {
      const temp = Number(i.trim())
      tempArr.push(temp)
    }
    return tempArr;
  }

  async getMaskedNumber(numberSeries: string) {
    const last4Digits = numberSeries.slice(-4);
    const maskedNumber = last4Digits.padStart(numberSeries.length, '*');

    return maskedNumber
  }

  async normalizePhoneNumber(lang, phoneNumber: string) { 
    // Loại bỏ các ký tự không phải là số 
    let normalized = phoneNumber.replace(/\D/g, ''); 
    // Kiểm tra nếu số đầu tiên không phải là '0', thêm '0' vào đầu 
    if (normalized.charAt(0) !== '0') { 
      normalized = '0' + normalized; 
    } 
    // Kiểm tra nếu độ dài của số điện thoại không là 10 thì báo lỗi
    if (normalized.length !== 10) {
      throw new HttpException([await this.customExceptionService.i18nError(ERROR.INVALID_PHONE_NUMBER, lang, null)], HttpStatus.BAD_REQUEST);
    } else {
      const phoneRegex = /^(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
      const validPhoneNumner = phoneRegex.test(normalized)
      if (!validPhoneNumner) {
        throw new HttpException([await this.customExceptionService.i18nError(ERROR.INVALID_PHONE_NUMBER, lang, null)], HttpStatus.BAD_REQUEST);
      }
    }

    return normalized; 
  }
}