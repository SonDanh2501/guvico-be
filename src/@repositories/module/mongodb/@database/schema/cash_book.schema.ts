import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TYPE_BANK } from '../enum';

export type CashBookDocument = CashBook & Document;

@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})
export class CashBook {

    @Prop({ type: String, default: null })
    name: string;

    @Prop({ type: String, enum: TYPE_BANK, default: TYPE_BANK.bank })
    type_bank: string;

    @Prop({ type: Number, default: 0 })
    money: number;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ type: String, enum: ["open", "pause", "close"], default: "open" })
    status: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;
}

export const cashBookSchema = SchemaFactory.createForClass(CashBook);