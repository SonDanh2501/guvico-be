import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LinkInviteDocument = LinkInvite & Document;

@Schema()
export class LinkInvite {
    @Prop({ default: "" })
    ip: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: "" })
    token: string;

    @Prop({ default: "" })
    code_invite: string;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: false })
    is_delete: boolean;

}

export const linkInviteschema = SchemaFactory.createForClass(LinkInvite);