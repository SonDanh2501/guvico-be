import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { KIND_GROUP_SERVICE, languageDTO } from 'src/@core';
import { BaseEntity } from '../entity';

export type GroupServiceDocument = GroupService & Document;

@Schema()
export class GroupService extends BaseEntity {
    @Prop({ type: { vi: String, en: String }, required: true, default: { en: "", vi: "" } })
    title: languageDTO;

    @Prop({ required: true, default: "" })
    thumbnail: string;

    @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
    description: languageDTO;

    @Prop({ enum: ["single", "multi_tab"], default: "single" })
    type: string;

    @Prop({ default: ''})
    kind: string;
    
    @Prop({default: 0 })
    point_popular: number;

    @Prop({default: true })
    is_active: boolean;

    @Prop({default: 0 })
    position: number;
}

export const groupServiceSchema = SchemaFactory.createForClass(GroupService);