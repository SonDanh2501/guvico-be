import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Collaborator, Customer, ServiceDTO } from 'src/@core';


export type GoogleMapDocument = GoogleMap & Document;

@Schema()
export class GoogleMap {
    @Prop({ default: "" })
    place_id: string;

    @Prop({ default: "" })
    formatted_address: string;

    @Prop({
        type: {
            location: {
                lat: { type: Number },
                lng: { type: Number }
            }
        }, default: null
    })
    geometry: object | any;

    @Prop({
        type: {
            compound_code: { type: String },
            global_code: { type: String }

        }, default: null
    })
    plus_code: object | any;

    @Prop({
        type: {
            district: { type: String },
            commune: { type: String },
            province: { type: String }

        }, default: null
    })
    compound: object | any;

    @Prop({ default: '' })
    name: string;

    @Prop({ default: '' })
    url: string;

    @Prop({ default: [] })
    types: string[];
}
export const googleMapSchema = SchemaFactory.createForClass(GoogleMap);