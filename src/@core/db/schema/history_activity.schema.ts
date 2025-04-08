import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { TYPE_ACTIVITY } from 'src/@core/constant'
import { languageDTO } from 'src/@core/dto'

export type HistoryActivityDocument = HistoryActivity & Document;

@Schema()
export class HistoryActivity {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
  id_admin_action: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
  id_user_system: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', default: null })
  id_examtest: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
  id_collaborator: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Punish', default: null })
  id_punish: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CollaboratorBonus', default: null })
  id_collaborator_bonus: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'RewardCollaborator', default: null })
  id_reward: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest', default: null })
  id_question: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'InfoTestCollaborator', default: null })
  id_info: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'InfoRewardCollaborator', default: null })
  id_info_reward_collaborator: string;

  @Prop({ default: "" })
  title_admin: string;

  @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
  title: languageDTO;

  @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
  body: languageDTO;

  @Prop({ enum: TYPE_ACTIVITY, required: true , default: null})
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PunishPolicy', default: null })
  id_punish_policy: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket', default: null })
  id_punish_ticket: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'RewardTicket', default: null })
  id_reward_ticket: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null })
  id_order: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder', default: null })
  id_group_order: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null })
  id_promotion: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FeedBack', default: null })
  id_feedback: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TransitionCollaborator', default: null })
  id_transistion_collaborator: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null })
  id_transaction: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TransitionCustomer', default: null })
  id_transistion_customer: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_inviter: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Banner', default: null })
  id_banner: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null })
  id_address: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ExtendOptional', default: null })
  id_extend_optional: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket', default: null })
  // id_punish_ticket: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FeedBack', default: null })
  id_feed_back: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupCustomer', default: null })
  id_group_customer: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupPromotion', default: null })
  id_group_promotion: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupService', default: null })
  id_group_service: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'News', default: null })
  id_news: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'OptionalService', default: null })
  id_optional_service: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PushNotification', default: null })
  id_push_notification: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ReasonCancel', default: null })
  id_reason_cancel: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ReasonPunish', default: null })
  id_reason_punish: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null })
  id_service: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CustomerRequest', default: null })
  id_customer_request: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NotificationSchedule', default: null })
  id_notification_schedule: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer_referrer: string;

  @Prop({ default: 0 })
  value: number;

  @Prop({ default: null })
  value_string: string;

  @Prop({ default: null })
  value_select: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TransitionPoint', default: null })
  id_transistion_point: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingLesson', default: null })
  id_training_lesson: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null })
  id_business: string;

  @Prop({ default: 0 })
  current_remainder: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_remainder: string;

  @Prop({ default: 0 })
  current_gift_remainder: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_gift_remainder: string;

  @Prop({ default: 0 })
  current_pay_point: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_pay_point: string;

  @Prop({ default: 0 })
  current_reputation_score: number;

  @Prop({ default: 0 })
  current_work_wallet: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_work_wallet: string;

  @Prop({ default: 0 })
  current_collaborator_wallet: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_collaborator_wallet: string;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_point: string;

  @Prop({ default: 0 })
  current_point: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_a_pay: string;

  @Prop({ default: 0 })
  current_a_pay: number;

  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_reward_point: string;

  @Prop({ default: 0 })
  current_reward_point: number;
    
  @Prop({ enum: ["up", "down", "none"], default: "none" })
  status_current_monthly_reward_point: string;

  @Prop({ default: 0 })
  current_monthly_reward_point: number;

  @Prop({ default: false })
  is_delete: boolean;
}

export const historyActivitySchema = SchemaFactory.createForClass(HistoryActivity);