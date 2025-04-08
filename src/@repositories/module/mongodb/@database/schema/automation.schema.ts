import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { languageDTO } from 'src/@core'

export type AutomationDocument = Automation & Document;

@Schema()
export class Automation {
  @Prop({ type: { vi: String, en: String }, required: true })
  title: languageDTO;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: new Date(Date.now()).toISOString() })
  start_date: string;

  @Prop({ default: null })
  end_date: string;

  @Prop({ type: String, enum: ["standby", "doing", "pause", "stop", "close"], default: "doing" })
  status: string;

  @Prop({
    type: String, enum: ["after_action","schedule"], default: "schedule"
  })
  type_trigger: string

  @Prop({ type: String, enum: ["customer_created_order", "collaborator_cancel_order", "collaborator_doing_order", "none"], default: "none" })
  action_trigger: string

  @Prop({ type: String, enum: ["every_hour, every_minitue", "every_date", "none"], default: "none" })
  schedule_trigger: string

  @Prop({
    type: {
      type_condition: {type: String, enum: ["or", "and"], default: "and"},
      condition_level_1: [{
        type_condition: String,
        condition: [{
          data_table: {type: String, enum: ["order", "collaborator", "customer", "punish_ticket", "reward_ticket"], default: null},
          dependency: {type: [String], enum: ["order", "collaborator", "customer", "punish_ticket", "reward_ticket"], default: []},
          type_condition: {type: String, enum: ["number", "string", "custom"], default: "custom"},
          kind: String,
          value: String,
          operator: String
        }]
      }]
    },
    default: { type_condition: "and", condition_level_1: [] }
  })
  condition: any

  // @Prop({ type: String, enum: ["every_hour, every_minitue", "every_date"], default: "every_minitue" })
  // action: string
    @Prop({
      type: {
        type_action: {type: String, enum: ['create_and_start_punish_ticket', 'send_push_notification', 'create_and_start_reward_ticket']},
        input_require: {type: [String], enum: ['id_customer', 'id_collaborator', 'id_order'], default: []},
        id_punish_policy: {type: String, default: null},
        id_context_notification: {type: String, default: null},
        id_reward_policy: {type: String, default: null},
      },
      default: null
    })
    action: any;



}

export const automationSchema = SchemaFactory.createForClass(Automation);