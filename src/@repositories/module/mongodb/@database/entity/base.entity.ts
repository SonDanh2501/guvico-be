import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

// export type ServiceDocument = BaseEntity & Document;

export class BaseEntity {

    // @Prop()
    // _id?: ObjectId;

    @Prop({ default: false })
    is_delete: boolean;
}
