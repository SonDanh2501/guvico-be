import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { activePromotionDTOAdmin, createPromotionDTOAdmin, editPromotionDTOAdmin, ERROR, iPageDTO, iPagePromotionDTOAdmin, iPageUsedPromotionDTOAdmin, updatePositionPromotion } from 'src/@core'
import { PROMOTION_STATUS } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { GroupCustomerOopSystemService } from 'src/core-system/@oop-system/group-customer-oop-system/group-customer-oop-system.service'
import { GroupOrderOopSystemService } from 'src/core-system/@oop-system/group-order-oop-system/group-order-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { PromotionOopSystemService } from 'src/core-system/@oop-system/promotion-oop-system/promotion-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { JobSystemService } from '../job-system/job-system.service'

@Injectable()
export class PromotionSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private generalHandleService: GeneralHandleService,
    private promotionOopSystemService: PromotionOopSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
    private customerOopSystemService: CustomerOopSystemService,
    private groupOrderOopSystemService: GroupOrderOopSystemService,
    private groupCustomerOopSystemService: GroupCustomerOopSystemService,

    private jobSystemService: JobSystemService,
  ) { }

  async getPromotionForAffiliate() {
    try {
      return await this.promotionOopSystemService.getPromotionForAffiliate()
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDetailItem(lang, idItem) {
    try {
      return await this.promotionOopSystemService.getDetailItem(lang, idItem)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDetailItemForMobile(lang, idItem) {
    try {
      return await this.promotionOopSystemService.getDetailItemForMobile(lang, idItem)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getListItem(iPage: iPagePromotionDTOAdmin) {
    try {
      return await this.promotionOopSystemService.getListItem(iPage)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createItem(lang, subjectAction, payload: createPromotionDTOAdmin) {
    try {
      const payloadDependency = {
        promotion: null,
        admin_action: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }
      // 1. Kiem tra ma khuyen mai da ton tai hay chua
      await this.promotionOopSystemService.checkCodeExistedWithType(lang, payload)

      // 2. Tao khuyen mai
      const getPromotion = await this.promotionOopSystemService.createItem(payload)
      payloadDependency.promotion = getPromotion

      // 3. Sinh ra cac khuyen mai con
      if (getPromotion.is_parent_promotion && getPromotion.total_child_promotion > 0) {
        await this.renderPromotion(lang, getPromotion)
      }

      await this.historyActivityOopSystemService.createPromotion(subjectAction, payloadDependency)
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async renderPromotion(lang, promotion) {
    try {
      const lstTask: any = []
      for (let i = 0; i < promotion.is_parent_promotion.length; i++) {
        let promotionCode = ''
        let isExisted = false;
        do {
          promotionCode = await this.generalHandleService.renderCodePromotion()
          const checkDuplicate = await this.promotionOopSystemService.getPromotionByCode(promotionCode)
          isExisted = !!checkDuplicate
        } while (isExisted);

        const dateNow = new Date(Date.now()).getTime();
        const startLimitDate = new Date(promotion.limit_start_date).getTime()

        const payload = { ...promotion }
        payload['code'] = `${promotion.code}${promotionCode}`
        payload['limit_start_date'] = promotion.is_limit_date === true ? promotion.limit_start_date : null,
          payload['limit_end_date'] = promotion.is_limit_date === true ? promotion.limit_end_date : null,
          payload['is_limit_count'] = true
        payload['limit_count'] = 1
        payload['is_limited_use'] = true
        payload['limited_use'] = 1
        payload['brand'] = 'guvi'
        payload['status'] = promotion.is_limit_date === true && dateNow < startLimitDate ? PROMOTION_STATUS.upcoming : PROMOTION_STATUS.doing
        payload['is_parent_promotion'] = false
        payload['total_child_promotion'] = 0
        payload['is_child_promotion'] = true
        payload['parent_promotion'] = promotion.code

        lstTask.push(this.promotionOopSystemService.createItem(payload))
        promotion.child_promotion.push(payload['code']);
      }

      await Promise.all(lstTask)
      await this.promotionOopSystemService.updatePromotion(lang, promotion)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async editItem(lang, subjectAction, idPromotion: string, payload: editPromotionDTOAdmin) {
    try {
      const payloadDependency = {
        promotion: null,
        admin_action: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      payload['_id'] = idPromotion
      await this.promotionOopSystemService.checkCodeExistedWithId(lang, payload)
      const getItem = await this.promotionOopSystemService.getDetailItem(lang, idPromotion);
      if (getItem.is_child_promotion) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, null)], HttpStatus.NOT_FOUND);
      payloadDependency.promotion = getItem
      if (getItem.is_parent_promotion) {
        await this.updateParentPromotion(lang, getItem, payload);
      } else {
        await this.promotionOopSystemService.updateItem(getItem, payload)
      }
      await this.historyActivityOopSystemService.editPromotion(subjectAction, payloadDependency)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateParentPromotion(lang, promotion, payload: editPromotionDTOAdmin) {
    try {
      const lstTask: any = []
      promotion.title = payload.title || promotion.title;
      promotion.short_description = payload.short_description || promotion.short_description;
      promotion.description = payload.description || promotion.description;
      promotion.thumbnail = payload.thumbnail || promotion.thumbnail;
      promotion.image_background = payload.image_background || promotion.image_background;
      promotion.position = payload.position || promotion.position;
      promotion.position_view_payment = payload.position_view_payment ? payload.position_view_payment : promotion.position_view_payment;
      promotion.is_payment_method = payload.is_payment_method || promotion.is_payment_method;
      promotion.payment_method = payload.payment_method || promotion.payment_method;
      promotion.service_apply = payload.service_apply || promotion.service_apply;

      promotion.is_id_group_customer = (payload.is_id_group_customer !== promotion.is_id_group_customer) ? payload.is_id_group_customer : promotion.is_id_group_customer;
      promotion.id_group_customer = payload.id_group_customer || promotion.id_group_customer;

      promotion.is_id_customer = (payload.is_id_customer !== promotion.is_id_customer) ? payload.is_id_customer : promotion.is_id_customer;
      promotion.id_customer = (payload.id_customer !== promotion.id_customer) ? payload.id_customer : promotion.id_customer;
      promotion.type_discount = payload.type_discount || promotion.type_discount;

      promotion.discount_max_price = payload.discount_max_price || promotion.discount_max_price;
      promotion.discount_value = payload.discount_value || promotion.discount_value;
      promotion.discount_unit = payload.discount_unit || promotion.discount_unit;
      promotion.price_min_order = payload.price_min_order || promotion.price_min_order;

      lstTask.push(this.promotionOopSystemService.updatePromotion(lang, promotion))
      const getChildPromotion = await this.promotionOopSystemService.getListChildPromotionByCode(promotion.code, promotion.type_promotion);

      for (let i = 0; i < getChildPromotion.length; i++) {
        getChildPromotion[i].title = promotion.title
        getChildPromotion[i].short_description = promotion.short_description
        getChildPromotion[i].description = promotion.description
        getChildPromotion[i].thumbnail = promotion.thumbnail
        getChildPromotion[i].image_background = promotion.image_background
        getChildPromotion[i].position = promotion.position
        getChildPromotion[i].position_view_payment = promotion.position_view_payment
        getChildPromotion[i].is_payment_method = promotion.is_payment_method;
        getChildPromotion[i].payment_method = promotion.payment_method;
        getChildPromotion[i].service_apply = promotion.service_apply
        getChildPromotion[i].is_id_group_customer = promotion.is_id_group_customer;
        getChildPromotion[i].id_group_customer = promotion.id_group_customer;
        getChildPromotion[i].type_discount = promotion.type_discount
        getChildPromotion[i].id_customer = promotion.id_customer;
        getChildPromotion[i].is_id_customer = promotion.is_id_customer;
        getChildPromotion[i].price_min_order = promotion.price_min_order
        getChildPromotion[i].discount_unit = promotion.discount_unit
        getChildPromotion[i].discount_value = promotion.discount_value;
        getChildPromotion[i].discount_max_price = promotion.discount_max_price;

        lstTask.push(this.promotionOopSystemService.updatePromotion(lang, getChildPromotion[i]))
      }

      await Promise.all(lstTask)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async activeItem(lang, subjectAction, payload: activePromotionDTOAdmin, idPromotion: string) {
    try {
      const payloadDependency = {
        promotion: null,
        admin_action: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      const getPromotion = await this.promotionOopSystemService.getDetailItem(lang, idPromotion);
      getPromotion.is_active = (payload.is_active !== getPromotion.is_active) ? payload.is_active : getPromotion.is_active;
      getPromotion.status = getPromotion.is_active ? PROMOTION_STATUS.doing : PROMOTION_STATUS.done
      payloadDependency.promotion = await this.promotionOopSystemService.updatePromotion(lang, getPromotion)
      await this.historyActivityOopSystemService.activePromotion(subjectAction, payloadDependency)

      if (getPromotion.is_parent_promotion) {
        await this.activeChildPromotion(lang, subjectAction, payloadDependency, getPromotion, payload)
      }

      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async activeChildPromotion(lang, subjectAction, payloadDependency, promotion, payload: activePromotionDTOAdmin,) {
    try {
      const lstTask: any = []
      const getChildPromotion = await this.promotionOopSystemService.getListChildPromotionByCode(promotion.code, promotion.type_promotion, false)
      for (let i = 0; i < getChildPromotion.length; i++) {
        getChildPromotion[i].is_active = (payload.is_active) ? payload.is_active : getChildPromotion[i].is_active;
        getChildPromotion[i].status = getChildPromotion[i].is_active ? PROMOTION_STATUS.doing : PROMOTION_STATUS.done
        payloadDependency.promotion = getChildPromotion[i]

        lstTask.push(this.promotionOopSystemService.updatePromotion(lang, getChildPromotion[i]))
        lstTask.push(this.historyActivityOopSystemService.activePromotion(subjectAction, payloadDependency))
      }

      await Promise.all(lstTask)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async softDeleteItem(lang, subjectAction, idPromotion: string) {
    try {
      const payloadDependency = {
        promotion: null,
        admin_action: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      const getPromotion = await this.promotionOopSystemService.getDetailItem(lang, idPromotion);
      payloadDependency.promotion = getPromotion
      const result = await this.promotionOopSystemService.softDeleteItem(idPromotion)

      if (getPromotion.is_parent_promotion && result === true) {
        await this.promotionOopSystemService.softDeleteListItems(getPromotion.code, getPromotion.type_promotion);
      }
      await this.historyActivityOopSystemService.deletePromotion(subjectAction, payloadDependency);

      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async codeAvailable(lang, subjectAction, iPage: iPageDTO, idCustomer, payload) {
    try {
      const dateNow = new Date(Date.now()).toISOString();
      const getCustomer = await this.customerOopSystemService.getDetailItem(lang, idCustomer);

      const my_promotion = [];
      for (let i = 0; i < getCustomer.my_promotion.length; i++) {
        if ((getCustomer.my_promotion[i]["limit_used"] > getCustomer.my_promotion[i]["used"]) && (new Date(dateNow).getTime() < new Date(getCustomer.my_promotion[i]["exp_date"]).getTime())) {
          my_promotion.push(getCustomer.my_promotion[i]["id_promotion"])
        }
      }

      payload['my_promotion'] = my_promotion
      payload['dateNow'] = dateNow

      const result = await this.promotionOopSystemService.getListPagination(subjectAction, iPage, payload, getCustomer)
      const newArrPromotion = [];
      for (let i = 0; i < result.data.length; i++) {
        const countUsedPromotion = await this.groupOrderOopSystemService.countGroupOrderUsingPromotion(getCustomer._id, result.data[i].code)
        if (result.data[i].is_limited_use === true && !(result.data[i].limited_use > countUsedPromotion)) {
          continue;
        }
        newArrPromotion.push(result.data[i])
      }

      result.totalItem = newArrPromotion.length,
        result.data = newArrPromotion

      return result;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async codeHasExchange(lang, subjectAction, iPage: iPageDTO) {
    try {
      const dateNow = new Date(Date.now()).toISOString();
      const getCustomer = await this.customerOopSystemService.getDetailItem(lang, subjectAction._id);
      const my_promotion = [];
      for (let i = 0; i < getCustomer.my_promotion.length; i++) {
        if ((getCustomer.my_promotion[i]["limit_used"] > getCustomer.my_promotion[i]["used"]) && (new Date(dateNow).getTime() < new Date(getCustomer.my_promotion[i]["exp_date"]).getTime())) {
          my_promotion.push(getCustomer.my_promotion[i]["id_promotion"])
        }
      }

      return await this.promotionOopSystemService.getListPaginationForExchange(iPage, my_promotion)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async detailUsedPromotion(lang, idPromotion: string, iPage: iPageUsedPromotionDTOAdmin) {
    try {
      const getPromotion = await this.promotionOopSystemService.getDetailItem(lang, idPromotion)

      return await this.groupOrderOopSystemService.getListPaginationByPromotion(iPage, getPromotion)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async getListChildPromotion(iPage: iPageUsedPromotionDTOAdmin, code) {
    try {
      return await this.promotionOopSystemService.getListPaginationChildByPromotion(iPage, code)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async getListPromotionByCustomer(lang, payload) {
    try {
      const dateNow = new Date(Date.now()).toISOString();
      payload['dateNow'] = dateNow
      if (payload.id_customer !== null && payload.id_customer !== undefined) {
        const getCustomer = await this.customerOopSystemService.getDetailItem(lang, payload.id_customer)
        const my_promotion = [];
        for (let i = 0; i < getCustomer.my_promotion.length; i++) {
          if ((getCustomer.my_promotion[i]["limit_used"] < getCustomer.my_promotion[i]["limit_count"]) && (new Date(dateNow).getTime() < new Date(getCustomer.my_promotion[i]["exp_date"]).getTime())) {
            my_promotion.push(getCustomer.my_promotion[i]["id_promotion"])
          }
        }
        payload['my_promotion'] = my_promotion
      }

      if (payload.id_group_customer !== null && payload.id_group_customer !== undefined && payload.id_group_customer !== "") {
        await this.groupCustomerOopSystemService.getDetailItem(lang, payload.id_group_customer);
        payload['id_group_customer'] = payload.id_group_customer
      }

      const getListItem = await this.promotionOopSystemService.getListPromotionByCustomer(payload)

      return { data: getListItem }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async setPositionPromotion(lang, payload: updatePositionPromotion) {
    try {
      const lstTask: any = []
      for (let i = 0; i < payload.arr_promotion.length; i++) {
        const getPromotion = await this.promotionOopSystemService.getDetailItem(lang, payload.arr_promotion[i]._id)
        getPromotion.position = payload.arr_promotion[i].position
        lstTask.push(this.promotionOopSystemService.updatePromotion(lang, getPromotion.position))
      }
      await Promise.all(lstTask);

      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async calculateCodePromotion(lang, subjectAction, req) {
    try {
      if (!req.code_promotion || req.code_promotion === "") {
        throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
      }
      const getCustomer = await this.customerOopSystemService.getDetailItem(lang, subjectAction._id);

      const infoJob = await this.jobSystemService.calculateFeeGroupOrder(lang, req, subjectAction);
      return await this.promotionOopSystemService.calculateCodePromotion(lang, infoJob, req.code_promotion, getCustomer)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
