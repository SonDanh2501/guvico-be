import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '../entity';

export type LinkInviteDocument = LinkInvite & Document;

@Schema()
export class LinkInvite extends BaseEntity {
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
}

export const linkInviteschema = SchemaFactory.createForClass(LinkInvite);