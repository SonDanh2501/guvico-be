import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TYPE_BANK } from '../enum';
import { BaseEntity } from '../entity';
import { TYPE_SUBJECT_ACTION } from '../enum/base.enum';

export type BehaviorTrackingDocument = BehaviorTracking & Document;

@Schema()
export class BehaviorTracking extends BaseEntity {

    @Prop({ default: null })
    id_user: string;

    @Prop({ enum: TYPE_SUBJECT_ACTION, default: TYPE_SUBJECT_ACTION.system })
    subject_action: string;

    @Prop({ default: null })
    behavior: string;

    @Prop({ default: 1 })
    count: number;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;
}

export const behaviorTrackingSchema = SchemaFactory.createForClass(BehaviorTracking);