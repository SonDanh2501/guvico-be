import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { KIND_GROUP_SERVICE, languageDTO } from 'src/@core';

export type GroupServiceDocument = GroupService & Document;

@Schema()
export class GroupService {
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

    @Prop({default: false })
    is_delete: boolean;

    @Prop({default: true })
    is_active: boolean;

    @Prop({default: 0 })
    position: number;
}

export const groupServiceSchema = SchemaFactory.createForClass(GroupService);