import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PopupDocument = Popup & Document;

@Schema()
export class Popup {

    @Prop({ required: true })
    image: string

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: "todo", enum: ["todo", "doing", "done"] })
    status: string;

    @Prop({ default: null })
    start_date: string;

    @Prop({ default: null })
    end_date: string;

    @Prop({ default: false })
    is_date_schedule: boolean;

    @Prop({ default: "promotion", enum: ['promotion'] })
    screen: string

    @Prop({ default: true })
    is_counted: boolean

    @Prop({ default: null })
    key_event_count: string

    @Prop({ default: null })
    deep_link: string
}

export const popupSchema = SchemaFactory.createForClass(Popup);