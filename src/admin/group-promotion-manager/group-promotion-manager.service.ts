import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, Promotion, PromotionDocument, iPageDTO, searchQuery } from 'src/@core';
import { GroupPromotion, GroupPromotionDocument } from 'src/@core/db/schema/group_promotion.schema';
import { actiGroupPromotionDTOAdmin, createGroupPromotionDTOAdmin, editGroupPromotionDTOAdmin } from 'src/@core/dto/groupPromotion.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class GroupPromotionManagerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        @InjectModel(GroupPromotion.name) private groupPromotionModel: Model<GroupPromotionDocument>,
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,

    ) { }
    async getListItem(lang, iPage: iPageDTO) {
        try {
            console.log('iPage  ', iPage.length);
            // const query = searchQuery(["name"], iPage)
            const query = {
                $and: [
                    { is_delete: false },
                    // {
                    //     $or: [
                    //         {
                    //             "name": {
                    //                 $regex: iPage.search,
                    //                 $options: "i"
                    //             },
                    //         }
                    //     ]
                    // },
                ]
            }
            const arrItem = await this.groupPromotionModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.groupPromotionModel.count(query)
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

    async getDetailItem(lang, id: string) {
        try {
            const findItem = await this.groupPromotionModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createGroupPromotionDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.groupPromotionModel({
                name: payload.name,
                description: payload.description,
                date_create: new Date(Date.now()).toISOString(),
                thumbnail: payload.thumbnail,
                position: payload.position,
                type_render_view: payload.type_render_view
            });
            await newItem.save();
            await this.activityAdminSystemService.createGroupPromotion(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editGroupPromotionDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.groupPromotionModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.name = payload.name || getItem.name
            getItem.description = payload.description || getItem.description
            getItem.thumbnail = payload.thumbnail || getItem.thumbnail
            getItem.position = payload.position || getItem.position
            getItem.type_render_view = payload.type_render_view || getItem.type_render_view;
            await getItem.save();
            this.activityAdminSystemService.editGroupPromotion(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            const groupPromotion = await this.groupPromotionModel.findById(id);
            if (!groupPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            groupPromotion.is_delete = true;
            await groupPromotion.save();
            const query = {
                id_group_promotion: groupPromotion._id
            }
            const iPage = {
                start: 0,
                length: 300,
            }
            const count = await this.promotionModel.count(query)
            do {
                const getPromotion = await this.promotionModel.find(query)
                for (let promotion of getPromotion) {
                    promotion.id_group_promotion = promotion.id_group_promotion.filter(item => item.toString() !== groupPromotion._id.toString()) // loại bỏ id của group promotion cần xóa khỏi các promotion
                    await promotion.save();
                }
                iPage.start += 300
            } while (iPage.start < count)
            this.activityAdminSystemService.deleteGroupPromotion(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async actiItem(lang, payload: actiGroupPromotionDTOAdmin, id, idAdmin) {
        try {
            const groupPromotion = await this.groupPromotionModel.findById(id);
            if (!groupPromotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            groupPromotion.is_active = (payload.is_active === groupPromotion.is_active) ? groupPromotion.is_active : payload.is_active;
            await groupPromotion.save();
            if (!groupPromotion.is_active) { // nếu is_active = false thì lọc hết tất cả các khuyến mãi có nhóm khuyến mãi đó ra
                const query = {
                    id_group_promotion: groupPromotion._id
                }
                const iPage = {
                    start: 0,
                    length: 300,
                }
                const count = await this.promotionModel.count(query)
                do {
                    const getPromotion = await this.promotionModel.find(query)
                    for (let promotion of getPromotion) {
                        promotion.id_group_promotion = promotion.id_group_promotion.filter(item => item.toString() !== groupPromotion._id.toString()) // loại bỏ id của group promotion cần xóa khỏi các promotion
                        await promotion.save();
                    }
                    iPage.start += 300
                } while (iPage.start < count)
            }
            this.activityAdminSystemService.actiGroupPromotion(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}

