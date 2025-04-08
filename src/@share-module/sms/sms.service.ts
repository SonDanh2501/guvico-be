import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
<<<<<<< HEAD
const APIkey = "7014FA8407BB8FE0319D9842A2E068";
const serectKey = "1B0C9D63BD9EDDE6FE8FA9E575C78F"
=======
const APIkey = "no_secret_key";
const serectKey = "no_secret_key"
>>>>>>> son
const brandName = "GUVI"
@Injectable()
export class SmsService {
    constructor(private readonly httpService: HttpService) {}

    public async sendOTP(code, phone) {
        try {
            console.log("i'm in");
            console.log(code, "code");
            console.log(phone, "phone");
            const text = `Ma xac thuc OTP cua ban la ${code}. Cam on da dong hanh cung GUVI.`
            const url = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${phone}&Content=${text}&ApiKey=${APIkey}&SecretKey=${serectKey}&Brandname=${brandName}&SmsType=2`
            return await this.httpService.axiosRef.get(url);
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


}
