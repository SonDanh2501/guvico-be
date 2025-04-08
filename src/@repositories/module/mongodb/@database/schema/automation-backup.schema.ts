import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core';
import { TYPE_ACTION_TRIGGER_AUTOMATION } from '../enum/automation.enum';
import { BaseEntity } from '../entity';

export type AutomationDocument = Automation & Document;

@Schema()
export class Automation extends BaseEntity {
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

  @Prop({ type: String, enum: ["customer_created_order", "collaborator_cancel_order"], default: null })
  action_trigger: string

  @Prop({ type: String, enum: ["every_hour, every_minitue", "every_date"], default: null })
  schedule_trigger: string

  @Prop({
    type: {
      type_condition: {type: String, enum: ["or", "and"], default: "and"},
      condition_level_1: [{
        type_condition: String,
        condition: [{
          data_table: {type: String, enum: ["order", "collaborator", "customer", "punish_ticket"], default: null},
          dependency: {type: [String], enum: ["order", "collaborator", "customer", "punish_ticket"], default: []},
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
        type_action: {type: String, enum: ['create_and_start_punish_ticket', 'send_push_notification']},
        
        id_punish_policy: {type: String, default: null},
        id_reward_policy: {type: String, default: null},
      },
      default: null
    })
    action: any;



    // // chi duoc phep chon 1 trong 2 doi tuong collaborator hoac customer, neu trong cung condition co 2 doi tuong thi bat buoc phai co collection nhu order lien ket voi 2 doi tuong do
    // @Prop({
    //   type: {
    //     type_condition: {type: String, enum: ["or", "and"], default: "and"},
    //     condition_level_1: [{
    //       type_condition: String,
    //       condition: [{
    //         index: {type: Number, default: 0},
    //         object: {type: String, enum: ["collaborator", "customer", "order", "punish_ticket"], default: null},
    //         id_punish_policy: { type: mongoose.Schema.Types.ObjectId, ref: 'PunishPolicy' , default: null },
    //         // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket' }], default: [] })
    //         // id_punish_ticket: string[];
    //         kind: String,
    //         value: String,
    //         operator: String
    //       }]
    //     }]
    //   }, default: { type_condition: "and", condition_level_1: [] }
    // })
    // condition: any;
  
    // @Prop({
    //   type: {
    //     type_action: {type: String, enum: TYPE_ACTION_TRIGGER_AUTOMATION},
    //     id_punish_policy: {type: String, default: null},
    //     id_reward_policy: {type: String, default: null},
    //     // subject: {type: String, enum: ["collaborator", "customer", "order", "group_order", "punish_policy", "reward_policy"], default: null},
    //     // is_get_subject_condition: {type: Boolean, default: false},
    //     id_subject_condition: {type: [String], default: []}
    //   },
    //   default: null
    // })
    // trigger: any;

}

export const automationSchema = SchemaFactory.createForClass(Automation);