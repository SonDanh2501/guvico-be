import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalService } from 'src/@core';
import { District, DistrictDocument } from 'src/@core/db/schema/district.schema';
import { Province, ProvinceDocument } from 'src/@core/db/schema/province.schema';
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json';

@Injectable()
export class AministrativeDivisionManagerService implements OnApplicationBootstrap{
    constructor(
        private globalService: GlobalService,
        @InjectModel(Province.name) private provinceModel: Model<ProvinceDocument>,
        @InjectModel(District.name) private districtModel: Model<DistrictDocument>
    ) { }

    async onApplicationBootstrap(): Promise<any> {
        const checkProvinceSeed = await this.provinceModel.findOne({})
        const checkDistrictSeed = await this.districtModel.findOne({})
        console.log(AministrativeDivision, 'AministrativeDivision');
        if(!checkProvinceSeed) {
            for(let i = 0 ; i < AministrativeDivision.length ; i++) {
                const newProvince = new this.provinceModel({
                    name: AministrativeDivision[i].name,
                    code: AministrativeDivision[i].code,
                    division_type: AministrativeDivision[i].division_type,
                })
                newProvince.save();
            }
        }
        if(!checkDistrictSeed) {
            for(let i = 0 ; i < AministrativeDivision.length ; i++) {
                for(let y = 0 ; y < AministrativeDivision[i].districts.length ; y++) {
                    const newDistrict = new this.districtModel({
                        name: AministrativeDivision[i].districts[y].name,
                        code: AministrativeDivision[i].districts[y].code,
                        division_type: AministrativeDivision[i].districts[y].division_type,
                        code_province: AministrativeDivision[i].code
                    })
                    newDistrict.save();
                }
            }
        }
    }



    // async getProvince(id) {
    //     try {
    //         const getList = await this.provinceModel.find();
    //         return getList;
    //     } catch (err) {
    //         throw new HttpException(err, HttpStatus.FORBIDDEN);
    //     }
    // }

    // async getDistrict(id) {
    //     try {

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err, HttpStatus.FORBIDDEN);
    //     }
    // }


}
