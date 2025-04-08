import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, GlobalService, iPageDTO } from 'src/@core';
import { ExtendOptional, ExtendOptionalDocument } from 'src/@core/db/schema/extend_optional.schema';
import { ExtendOptionalRepositoryService } from 'src/@repositories/repository-service/extend-optional-repository/extend-optional-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';

@Injectable()
export class ExtendOptionalService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private extendOptionalRepositoryService: ExtendOptionalRepositoryService,
        private generalHandleService: GeneralHandleService,

        // private i18n: I18nContext,
        // @InjectModel(ExtendOptional.name) private groupServiceModel: Model<ExtendOptionalDocument>,
    ) { }

    async getExtendOptionalByOptionalService(lang, iPage: iPageDTO, id: string) {
        try {
            const query = {
                $and: [
                // {
                //     $or: [{
                //         name: {
                //             $regex: iPage.search,
                //             $options: "i"
                //         },
                //     },]
                // },
                {
                    id_optional_service: id.toString()
                },
                {
                    is_show_in_app: true,
                },
                {
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            // const arrItem = await this.groupServiceModel.find(query)
            //     .skip(iPage.start)
            //     .limit(iPage.length)
            //     .sort({ position_view: 1 });
            // const count = await this.groupServiceModel.count(query)

            const getResult = await Promise.all([   
                this.extendOptionalRepositoryService.getListDataByCondition(query),
                this.extendOptionalRepositoryService.countDataByCondition(query)
            ])


            // sap xep lai cac extend, extend nao la con cua extend khac thi ko can hien thi o ben ngoai
            const arrData = await this.generalHandleService.sortExtendInIdExtend(getResult[0]);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: getResult[1],
                data: arrData
            }
            // const result = {
            //     start: iPage.start,
            //     length: iPage.length,
            //     totalItem: count,
            //     data: arrItem
            // }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailExtendOptional(lang, id: string) {
        try {
            const findItem = await this.extendOptionalRepositoryService.findOneById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
