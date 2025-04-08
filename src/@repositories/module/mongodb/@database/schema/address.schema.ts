import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema()
export class Address {
    @Prop({ default: "" })
    name: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    lat: number;

    @Prop({ required: true })
    lng: number;

    @Prop({ default: '' })
    phone: string;

    @Prop({ default: '+84' })
    code_phone_area: string;

    @Prop({ default: "customer", enum: ['customer', 'collaborator'] })
    type_user: string;

    @Prop({ default: null })
    id_user: string;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: false })
    is_default_address: boolean;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: "house", enum: ["house", "apartment", "office"] })
    type_address_work: string;

    @Prop({ default: "" })
    note_address: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;
}

export const addressSchema = SchemaFactory.createForClass(Address);