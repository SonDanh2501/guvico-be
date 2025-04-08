import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectModel, Schema } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, iPageDTO } from 'src/@core';
import { ExtendOptional, ExtendOptionalDocument } from '../../@core/db/schema/extend_optional.schema';
import { GlobalService } from '../../@core/service/global.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ExtendOptionalRepositoryService } from 'src/@repositories/repository-service/extend-optional-repository/extend-optional-repository.service';

@Injectable()
export class ExtendOptionalSystemService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private extendOptionalRepositoryService: ExtendOptionalRepositoryService,
        // @InjectModel(ExtendOptional.name) private extendOptionalModel: Model<ExtendOptionalDocument>
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
                    is_active: true
                },
                {
                    id_optional_service: id.toString()
                },
                {
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            // const arrItem = await this.extendOptionalModel.find(query)
            //     .skip(iPage.start)
            //     .limit(iPage.length).then();
            // const count = await this.extendOptionalModel.count(query)

            const getResult = await Promise.all([
                this.extendOptionalRepositoryService.getListDataByCondition(query),
                this.extendOptionalRepositoryService.countDataByCondition(query)
            ])


            const result = {
                start: iPage.start,
                length: iPage.length,
                data: getResult[0],
                totalItem: getResult[1]
            }

            // const result = {
            //     start: iPage.start,
            //     length: iPage.length,
            //     data: arrItem,
            //     totalItem: count
            // }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailExtendOptional(lang, id: string) {
        try {
            // const findItem = await this.extendOptionalModel.findById(id);
            const findItem = await this.extendOptionalRepositoryService.findOneById(id)

            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
