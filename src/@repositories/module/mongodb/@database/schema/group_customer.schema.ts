import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { coditionDTOGroupCustomer } from 'src/@core/dto/groupCustomer.dto';

export type GroupCustomerDocument = GroupCustomer & Document;

@Schema()
export class GroupCustomer {
  @Prop({ required: true, default: "" })
  name: string;

  @Prop({default: "" })
  description: string;

  @Prop({default: Date.now() })
  date_create: string;


  //type_condition: ["and", "or", null]
  //operator: ["<", "<=", "==", "!=", ">=", ">"]
//   @Prop({type: {
//     type_condition: String, 
//     condition: [{
//       name: String,
//       kind: String,
//       value: String,
//       operator: String
//     }],
//     condition_level_2: [{
//       type_condition: String,
//       condition: [{
//         name: String,
//         kind: String,
//         value: String,
//         operator: String
//       }]
//   }] 
// }, default: {}})
//   condition_in: coditionDTOGroupCustomer;

  @Prop({type: {
    type_condition: String, 
    condition_level_1: [{
      type_condition: String,
      condition: [{
        kind: String,
        value: String,
        operator: String
      }]
    }]
}, default: {type_condition: "and", condition_level_1: []}})
  condition_in: coditionDTOGroupCustomer;

  @Prop({type: {
    type_condition: String, 
    condition_level_1: [{
      type_condition: String,
      condition: [{
        kind: String,
        value: String,
        operator: String
      }]
    }]
 }, default: {type_condition: "and", condition_level_1: []}})
  condition_out: coditionDTOGroupCustomer;

  // @Prop({type: {
  //   type_condition: String, 
  //   condition: [{
  //     name: String,
  //     kind: String,
  //     value: String,
  //     operator: String
  //   }],
  //   condition_level_2: [{
  //     type_condition: String,
  //     condition: [{
  //       name: String,
  //       kind: String,
  //       value: String,
  //       operator: String
  //     }]
  // }] }, default: {}})
  // condition_out: coditionDTOGroupCustomer;

  @Prop({default: true })
  is_active: boolean;

  @Prop({default: false })
  is_delete: boolean;

}

export const groupCustomerSchema = SchemaFactory.createForClass(GroupCustomer);