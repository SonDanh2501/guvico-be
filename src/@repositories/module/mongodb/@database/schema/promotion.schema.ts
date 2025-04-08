import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO, PAYMENT_METHOD } from 'src/@core'
import { BaseEntity } from '../entity'
import { DISCOUNT_TYPE, DISCOUNT_UNIT, PROMOTION_ACTION_TYPE, PROMOTION_STATUS, PROMOTION_TYPE } from '../enum'

export type PromotionDocument = Promotion & Document;

@Schema()
export class Promotion extends BaseEntity {

  @Prop({ type: { vi: String, en: String }, required: true, default: { vi: "", en: "" } })
  title: languageDTO;

  @Prop({ type: { vi: String, en: String }, required: true, default: { vi: "", en: "" } })
  short_description: languageDTO;

  @Prop({ type: { vi: String, en: String }, required: true, default: { vi: "", en: "" } })
  description: languageDTO;

  @Prop({ default: "" })
  thumbnail: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Customer", default: [] })
  id_customer: string[];

  @Prop({ required: false, default: false })
  is_id_customer: boolean;

  @Prop({ type: [String], default: [] })
  id_group_customer: string[];

  @Prop({ default: false })
  is_id_group_customer: boolean;

  @Prop({ default: "" })
  image_background: string;

  @Prop({ default: null })
  code: string

  @Prop({ required: true, default: false })
  is_limit_date: boolean;

  @Prop({ default: null })
  limit_start_date: string;

  @Prop({ default: null })
  limit_end_date: string;

  @Prop({ required: true, default: false })
  is_limit_count: boolean;

  @Prop({ default: 0 })
  limit_count: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Service', required: true, default: [] })
  service_apply: string[];

  @Prop({ required: true, default: false })
  is_limited_use: boolean;

  @Prop({ required: true, default: 0 })
  limited_use: number;

  @Prop({ required: true, default: DISCOUNT_TYPE.order, enum: DISCOUNT_TYPE })
  type_discount: string;

  @Prop({ required: true, default: PROMOTION_TYPE.code, enum: PROMOTION_TYPE })
  type_promotion: string;

  @Prop({ required: true, default: 0 })
  price_min_order: number;

  @Prop({ required: true, default: DISCOUNT_UNIT.amount, enum: DISCOUNT_UNIT })
  discount_unit: string;

  @Prop({ default: 0 })
  discount_value: number;

  @Prop({ default: 0 })
  discount_max_price: number;

  @Prop({ default: false })
  is_exchange_point: boolean;

  @Prop({ default: 0 })
  exchange_point: number;

  @Prop({ default: 1 })
  exp_date_exchange: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  total_used_promotion: number;

  @Prop({ default: false })
  is_enough_limit_used: boolean;

  @Prop({ default: 0 })
  total_used_customer: number;

  @Prop({ default: "guvi" })
  brand: string;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: PROMOTION_STATUS.doing, enum: PROMOTION_STATUS })
  status: string;

  @Prop({ default: false })
  is_payment_method: boolean;

  @Prop({ default: "", PAYMENT_METHOD })
  payment_method: string[];

  // CN = 0, T7 = 6
  @Prop({
    type: [
      {
        day_local: { type: Number, default: -1 },
        date_create: { type: String, default: new Date(Date.now()).toISOString() },
        // start_time_local: { type: String, default: null },
        // end_time_local: { type: String, default: null },
        time_loop: { type: [Object], default: [] },
        // timezone: { type: String },
        is_check_loop: { type: Boolean, default: false }
      }]
    , default: []
  })
  day_loop: object[];

  @Prop({ default: false })
  is_loop: boolean;

  @Prop({ default: null })
  start_time_loop: number;

  @Prop({ default: null })
  end_time_loop: number;

  @Prop({ default: 0 })
  position_view_payment: number;

  @Prop({ default: null })
  parrent_promotion: string;

  @Prop({ default: false })
  is_parrent_promotion: boolean;

  @Prop({ default: null })
  parent_promotion: string;

  @Prop({ default: false })
  is_parent_promotion: boolean;

  @Prop({ default: 0 })
  total_child_promotion: number;

  @Prop({ default: [] })
  child_promotion: string[];

  @Prop({ default: false })
  is_child_promotion: boolean;

  @Prop({ default: false })
  is_turn_on_loop: boolean;

  @Prop({ default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Prop({ default: true })
  is_show_in_app: boolean;


  @Prop({
    type: [
      {
        id_customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
        date_create: { type: String, default: new Date(Date.now()).toISOString() },
        count_used: { type: Number, default: 0 }
      }]
    , default: []
  })
  used_by: object[];


  @Prop({ default: false })
  is_day_apply: boolean;

  @Prop({ default: 'date_create', enum: ['date_create', 'date_work'] })
  type_date_apply: string;

  // CN = 0, T7 = 6 chỉ hoạt động với type_date_apply = 'date_work' 
  @Prop({
    type: [
      {
        day_local: { type: Number, default: -1 },
        date_create: { type: String, default: new Date(Date.now()).toISOString() },
        time_apply: {
          type: [
            {
              start_time_local: String,
              end_time_local: String
            },
          ], default: []
        },
        is_day_apply: { type: Boolean, default: false }
      }]
    , default: []
  })
  day_apply: object[];

  @Prop({ default: false })
  is_apply_area: boolean;

  @Prop({ default: [] })
  city: number[];

  @Prop({ default: [] })
  district: number[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'GroupPromotion', default: [] })
  id_group_promotion: string[];

  @Prop({ default: false })
  is_affiliate: boolean
  
  @Prop({ enum: PROMOTION_ACTION_TYPE, default: PROMOTION_ACTION_TYPE.use_in_app })
  type_action: string;

  @Prop({ default: false })
  is_counted: boolean

  @Prop({ default: null })
  key_event_count: string
}

export const promotionSchema = SchemaFactory.createForClass(Promotion);