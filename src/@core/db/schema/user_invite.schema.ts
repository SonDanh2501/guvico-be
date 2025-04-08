import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserInviteDocument = UserInvite & Document;

@Schema()
export class UserInvite {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer_invite: string;// id của khách hàng được giới thiệu

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer_inviter: string; // id của người giới thiệu (người đó là khách hàng)

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator_invite: string;// id của ctv được giới thiệu

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator_inviter: string;// id của người giới thiệu (người đó là ctv)

    @Prop({
        default: null, type: [{
            date_done: String,
            status: { type: String, enum: ['done', 'cancel', 'pending'], default: 'pending' },
            total_done_order: Number,
            total_current_done_order: Number,
            value: Number,
            type_reward: { type: String, enum: ['g-point', 'g-pay', 'work_wallet', 'collaborator_wallet'] },
        }]
    })
    steps: object[];

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;
}

export const userInviteSchema = SchemaFactory.createForClass(UserInvite);

// thêm ý tưởng mới:
// chia các bước thành các step nhỏ và có thưởng nếu hoàn thành các step đó (đợi sau nghĩ kĩ hơn sẽ phát triển theo hướng đó)