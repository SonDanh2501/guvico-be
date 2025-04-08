import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { addDays } from 'date-fns'
import { Model } from 'mongoose'
import { ERROR, IMAGE_HIDE_AVATAR } from 'src/@core'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Order, OrderDocument } from 'src/@core/db/schema/order.schema'
import { createReviewDTOCustomer } from 'src/@core/dto/reivew.dto'
import { GlobalService } from 'src/@core/service/global.service'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { InviteCodeSystemService } from 'src/core-system/invite-code-system/invite-code-system.service'
import { Collaborator, CollaboratorDocument } from '../../@core/db/schema/collaborator.schema'
import { iPageReviewCollaboratorDTOCustomer } from '../../@core/dto/reivew.dto'
import { ActivityCustomerSystemService } from '../../core-system/activity-customer-system/activity-customer-system.service'

@Injectable()
export class ReviewService {
    constructor(
        private globalService: GlobalService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private customExceptionService: CustomExceptionService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,


        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,

        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,

    ) { }

    async createReview(lang, idOrder, payload: createReviewDTOCustomer, user) {
        try {
            if (payload.star <= 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.THE_STAR_CANNOT_BE_LESS_THAN_0, lang, null)], HttpStatus.BAD_REQUEST);
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getOrder.id_collaborator.toString());
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (user._id.toString() !== getOrder.id_customer.toString()) throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            if (getOrder.status === 'cancel' || getOrder.status === 'confirm' || getOrder.status === 'doing') throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            if (getOrder.star !== 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            const dateLimitReview = addDays(new Date(getOrder.end_date_work), 2);
            const currentDate = new Date(Date.now()).getTime();
            if (currentDate > dateLimitReview.getTime()) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (getOrder.status === 'done') {
                getOrder.review = payload.review || '';
                getOrder.star = payload.star;
                getOrder.date_create_review = new Date(Date.now()).toISOString();
                getOrder.is_hide = payload.is_hide || false;
                getOrder.short_review = payload.short_review || [];
                getOrder.status_handle_review = (payload.star > 3) ? "done" : "pending";
            }
            const groupOrder = await this.groupOrderModel.findById(getOrder.id_group_order)
            if (groupOrder) await this.activityCustomerSystemService.customerCreateReview(idOrder, groupOrder._id);
            // else await this.activityCustomerSystemService.customerCreateReview(idOrder);
            await getOrder.save();
            getCollaborator.total_review += 1;
            getCollaborator.total_star += payload.star;
            let tempStar = 0;
            if (getCollaborator.total_review <= 5) {
                const temp = 5 - getCollaborator.total_review;
                tempStar = (getCollaborator.total_star + (temp * 5)) / (getCollaborator.total_review + temp);
            } else {
                tempStar = getCollaborator.total_star / getCollaborator.total_review
            }
            getCollaborator.star = Number(tempStar.toFixed(1));
            getCollaborator.save();
            ////////////////////////////////////////////////////////////////
            // cộng tiền cho ctv nếu ctv đó hoàn thành 3 ca 
            if (getCollaborator.id_inviter) {
                const query = {
                    is_delete: false,
                    id_collaborator: getCollaborator._id,
                    status: 'done',
                    star: { $gt: 0 }
                }
                const getToTalDoneOrder = await this.orderModel.count(query)
                if (getToTalDoneOrder >= 3 && !getCollaborator.is_added_gift_remainder) {
                    const getOrder = await this.orderModel.find(query)
                        .sort({ date_work: 1 })
                        .limit(3)
                    let check = true;
                    for (const order of getOrder) {
                        if (order.star < 4) {
                            check = false;
                            break;
                        }
                    }
                    // if (check) {
                    //     this.inviteCodeSystemService.addGiftRemainder(lang, getCollaborator._id);
                    // }
                }
            }
            // kết thúc cộng tiền cho ctv nếu ctv đó hoàn thành 3 ca
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getReviewCollaborator(lang, idCollaborator, iPage: iPageReviewCollaboratorDTOCustomer) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const query: any = {
                $and: [
                    { id_collaborator: idCollaborator },
                    { star: { $gt: 0 } },
                ]
            }
            const count = await this.orderModel.count(query);
            iPage.typeSort = (iPage.typeSort === 'star') ? iPage.typeSort : 'date_create_review';
            const getReview = await this.orderModel.find(query)
                .sort({ [iPage.typeSort]: iPage.valueSort === "1" ? 1 : -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'id_customer', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1 } })
                .select({ _id: 1, star: 1, review: 1, date_create_review: 1, is_hide: 1, short_review: 1 })

            let data = [];
            for (let item of getReview) {
                let order = {
                    _id: "",
                    id_customer: "",
                    avatar: "",
                    full_name: "",
                    star: 0,
                    review: "",
                    short_review: [],
                    date_create_review: null,
                    is_hide: false,
                }
                order._id = item._id;
                order.id_customer = item.id_customer["id"];
                order.avatar = item.is_hide === true ? IMAGE_HIDE_AVATAR : item.id_customer["avatar"];
                order.full_name = item.is_hide === true ? "Ẩn danh" : item.id_customer["full_name"];
                order.star = item.star;
                order.review = item.review;
                order.short_review = item.short_review || [];
                order.date_create_review = item.date_create_review;
                order.is_hide = item.is_hide === true ? item.is_hide : false;
                data.push(order);
            }
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: data
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async test() {
        try {


        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async getLastOrderDone(lang, user) {
        try {
            const lastOrder = await this.orderModel.findOne({
                id_customer: user._id,
                status: "done"
            })
                .populate({ path: 'id_group_order', select: { type: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .sort({ date_work: -1 });
            return lastOrder || {};
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async doneShowQuickReview(lang, user, idOrder) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            getOrder.active_quick_review = true;
            await getOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }




}
