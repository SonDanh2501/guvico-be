import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerSetting, CustomerSettingDocument } from '../db/schema/customer_setting.schema';
import { FastifyRequest, FastifyReply } from 'fastify';
import { SettingSystemService } from 'src/core-system/@core-system/setting-system/setting-system.service';
@Injectable()
export class CustomerMiddleWareService implements NestMiddleware {
    constructor(
        private settingSystemService: SettingSystemService
        // @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,
    ) { }
    async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
        await this.settingSystemService.checkVersionCustomer(req)
        next();

        // const lang = req.query["lang"] || "vi";
        // const version = (req.headers.version) ? req.headers.version.toString() : "1.0.0";
        // const findSetting = await this.customerSettingModel.findOne();
        // const mess = (lang === "vi") ? "Ứng dụng đã có phiên bản mới, vui lòng cập nhật để trải nghiệm tiếp dịch vụ"
        //     : "The application has a new version, please update to experience the service again"
        // const arrVersion = version.split(".");
        // console.log(version, 'version customer');

        // // const arrVersionSetting = ["1", "1", "0"]
        // const arrVersionSetting = findSetting.support_version_app.split(".");
        // const featureVersion = Number(arrVersion[0]);
        // const middleVersion = Number(arrVersion[1]);
        // const fixVersion = Number(arrVersion[2]);

        // const featureVersionSetting = Number(arrVersionSetting[0]);
        // const middleVersionSetting = Number(arrVersionSetting[1]);
        // const fixVersionSetting = Number(arrVersionSetting[2]);

        // // let temp = 0;
        // // if (arrVersion[2] < arrVersionSetting[2]) temp -= 1
        // // else if (arrVersion[2] > arrVersionSetting[2]) temp += 1
        // // if (arrVersion[1] < arrVersionSetting[1]) temp -= 2
        // // else if (arrVersion[1] > arrVersionSetting[1]) temp += 2
        // // if (arrVersion[0] < arrVersionSetting[0]) temp -= 3
        // // else if (arrVersion[0] > arrVersionSetting[0]) temp += 3
        // // let temp = 0;
        // // if (fixVersion < fixVersionSetting) temp -= 1
        // // else if (fixVersion > fixVersionSetting) temp += 1
        // // if (middleVersion < middleVersionSetting) temp -= 2
        // // else if (middleVersion > middleVersionSetting) temp += 2
        // // if (featureVersion < featureVersionSetting) temp -= 3
        // // else if (featureVersion > featureVersionSetting) temp += 3

        // let temp = true;
        // if(featureVersion < featureVersionSetting) {
        //     temp = false;
        // }
        // else if(!(featureVersion < featureVersionSetting) && middleVersion < middleVersionSetting){
        //     temp = false;
        // } 
        // else if(!(featureVersion < featureVersionSetting) && !(middleVersion < middleVersionSetting) && (fixVersion < fixVersionSetting)) {
        //     temp = false;
        // }
        // if (temp === false) {
        //     throw new HttpException([{ message: mess, field: "version" }], HttpStatus.PRECONDITION_FAILED);
        // } else {
        //     next();
        // }

        // // if (temp < 0) {
        // //     throw new HttpException([{ message: mess, field: "version" }], HttpStatus.PRECONDITION_FAILED);
        // // } else {
        // //     next();
        // // }

        // // next();
        // // const arrVersionSetting = findSetting.support_version_app.split(".");
        // // const versionApp = arrVersion[0] + arrVersion[1] + arrVersion[2]
        // // const versionSetting = arrVersionSetting[0] + arrVersionSetting[1] + arrVersionSetting[2]
        // // if (Number(versionApp) < Number(versionSetting)) {
        // //     throw new HttpException([{ message: mess, field: "version" }], HttpStatus.PRECONDITION_FAILED);
        // // } else {
        // //     next();
        // // }
    }
}