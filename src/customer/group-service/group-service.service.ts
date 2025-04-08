import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalService, iPageDTO } from 'src/@core';
import { GroupService, GroupServiceDocument } from 'src/@core/db/schema/group_service.schema';

@Injectable()
export class GroupServiceService {
    constructor(
        private globalService: GlobalService,
        // private i18n: I18nContext,
        @InjectModel(GroupService.name) private groupServiceModel: Model<GroupServiceDocument>,
    ) { }

    async getListItemHome(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                {
                    is_active: true
                }
                ]
            }
            const arrItem = await this.groupServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupServiceModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }


    async getListItem(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {
                        is_active: true
                    },
                    {
                        $or: [
                            { is_delete: false },
                            { is_delete: { $exists: false } }
                        ]
                    }
                ]
            }
            const arrItem = await this.groupServiceModel.find(query)
                .sort({ position: 1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupServiceModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
