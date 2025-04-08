import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { iPageDTO } from 'src/@core'
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { ZnsService } from 'src/@share-module/zns/zns.service'
import { GroupServiceOopSystemService } from 'src/core-system/@oop-system/group-service-oop-system/group-service-oop-system.service'
import { ServiceOopSystemService } from 'src/core-system/@oop-system/service-oop-system/service-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'

@Injectable()
export class SettingSystemService {
    constructor(
        private settingOopSystemService: SettingOopSystemService,
        private groupServiceOopSystemService: GroupServiceOopSystemService,
        private serviceOopSystemService: ServiceOopSystemService,
        private znsService: ZnsService,
    ) {}
    
    async getCustomerSetting(lang, req) {
        try {
            await this.checkVersionCustomer(req)

            const iPage: iPageDTO = {
                search: "",
                length: 50,
                start: 0
            }
            const preparedata = await Promise.all([
                this.settingOopSystemService.getCustomerSetting(lang),
                this.groupServiceOopSystemService.getListForApp(lang, iPage, "customer", null),
                this.serviceOopSystemService.getList(lang, {type: TYPE_SUBJECT_ACTION.customer, _id: null}, iPage)
            ])
            
            const getSetting = preparedata[0]
            const getGroupService = preparedata[1].data
            const getService = preparedata[2].data

            

            let temp2 = []
            for(let i = 0 ; i < getGroupService.length ; i++) {
                const findService = getService.filter(item => item.id_group_service === getGroupService[i]._id.toString())
                // console.log(getGroupService[i], 'getGroupService[i]');
                
                const object = {
                    title: getGroupService[i].title,
                    thumbnail: getGroupService[i].thumbnail,
                    description: getGroupService[i].description,
                    service: findService[0] || [],
                    point_popular: getGroupService[i].point_popular
                }
                temp2.push({
                    ...object,
                    service: findService
                })
            }
            
            const payloadResult = {
                ...getSetting._doc,
                group_service: temp2,
                arr_code_phone_area: [
                    {
                        code_phone_area: "+84",
                        name: "vi",
                        icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254297/guvi/icon/vietnamTron_rbka2d.png"
                    }
                    // {
                    //     code_phone_area: "+1",
                    //     name: "us",
                    //     icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254293/guvi/icon/united_states_1_xz3wyu.png"
                    // }
                ],
                language: [
                    {
                        value: "vi",
                        value_view: "Tiếng Việt",
                        icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254297/guvi/icon/vietnamTron_rbka2d.png"
                    },
                    {
                        value: "en",
                        value_view: "English",
                        icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254293/guvi/icon/united_states_1_xz3wyu.png"
                    }
                ],
            }
            return payloadResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCollaboratorSetting(lang, req) {
        try {
            
            await this.checkVersionCollaborator(req)

            const setting = await this.settingOopSystemService.getCollaboratorSetting(lang);

            const result = {
                ...setting._doc,
                ...{goong_key: "no_secret_key",
                aministrative_division: AministrativeDivision}
            }

            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkVersionCollaborator(req) {
        try {
            const lang = req.query["lang"] || "vi";
            const version = (req.headers.version) ? req.headers.version.toString() : "1.0.0";
            const getSetting = await this.settingOopSystemService.getCollaboratorSetting(lang);
            const mess = (lang === "vi") ? "Ứng dụng đã có phiên bản mới, vui lòng cập nhật để trải nghiệm tiếp dịch vụ"
                : "The application has a new version, please update to experience the service again"
            const versionSetting = getSetting.support_version_app.replace(/\./g, "")
            const currentVersion = version.replace(/\./g, "")
            const link = {
                url_ota_android: getSetting.url_ota_android,
                url_ota_ios: getSetting.url_ota_ios
            }
            if(currentVersion < versionSetting) {
                if (getSetting.is_update_ota === true) {
                    throw new HttpException([{ message: mess, link_ota: link, field: "ota" }], HttpStatus.PRECONDITION_FAILED);
                } else {
                    throw new HttpException([{ message: mess, field: "store" }], HttpStatus.PRECONDITION_FAILED);
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkVersionCustomer(req) {
        try {
            const lang = req.query["lang"] || "vi";
            const version = (req.headers.version) ? req.headers.version.toString() : "1.0.0";
            const getSetting = await this.settingOopSystemService.getCustomerSetting(lang);
            const mess = (lang === "vi") ? "Ứng dụng đã có phiên bản mới, vui lòng cập nhật để trải nghiệm tiếp dịch vụ"
                : "The application has a new version, please update to experience the service again"
            const versionSetting = getSetting.support_version_app.replace(/\./g, "")
            const currentVersion = version.replace(/\./g, "")
            const link = {
                url_ota_android: getSetting.url_ota_android,
                url_ota_ios: getSetting.url_ota_ios
            }
            if(currentVersion < versionSetting) {
                if (getSetting.is_update_ota === true) {
                    throw new HttpException([{ message: mess, link_ota: link, field: "ota" }], HttpStatus.PRECONDITION_FAILED);
                } else {
                    throw new HttpException([{ message: mess, field: "store" }], HttpStatus.PRECONDITION_FAILED);
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getSystemSetting(lang) {
        try {
            return await this.settingOopSystemService.getSystemSetting(lang)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 
}
