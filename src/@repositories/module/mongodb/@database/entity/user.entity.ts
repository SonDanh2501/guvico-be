import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { BaseEntity } from './base.entity';

export enum GENDER {
	male = 'male',
	female = 'female',
	other = 'other',
}

export class UserEntity extends BaseEntity {

    @Prop({ default: null })
    id_view: string;

    @Prop({
        default: "unknow",
        set: (full_name: string) => {
            return full_name.trim();
        }
    })
    full_name: string;

    @Prop({ default: "" })
    name: string;

    @Prop({
        default: "",
        set: (full_name: string) => {
            return full_name.trim();
        }
     })
    email: string;

    @Prop({ required: true, default: null })
    password: string;

    @Prop({ required: true, default: null })
    salt: string;

    @Prop({ required: false, enum: GENDER, default: GENDER.male })
    gender: string;
}
