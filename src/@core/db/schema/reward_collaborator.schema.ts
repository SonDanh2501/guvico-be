import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type RewardCollaboratorDocument = RewardCollaborator & Document;

@Schema()
export class RewardCollaborator {
    @Prop({ type: { vi: String, en: String }, required: true })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, required: true })
    description: languageDTO;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: "doing", enum: ["doing", "upcoming", "out_of_stock", "out_of_date", "done"] })
    status: string;

    @Prop({ default: false }) // loại CTV được nhận quà
    is_type_collaborator: boolean;

    @Prop({ default: 'collaborator', enum: ['partner', 'collaborator'] }) // loại CTV được nhận quà
    type_collaborator: string;

    @Prop({ default: false })
    is_city: boolean;

    @Prop({ default: [79] })
    city: number[];

    @Prop({ default: 'Asia/Ho_Chi_Minh' })
    timezone: string;

    @Prop({
        type: {
            type_condition: String,
            condition_level_1: [{
                type_condition: String,
                money: Number,
                condition_level_2: [
                    {
                        type_condition: String,
                        condition: [
                            {
                                kind: String,
                                value: String,
                                operator: String,
                            }
                        ]
                    }
                ]
            }]
        }, default: { type_condition: "and", condition_level_1: [] }
    })
    condition: object;
    // @Prop({ default: true }) // có giới hạn số lần nhận không
    // is_limit_received: boolean;

    // @Prop({ default: 1 })
    // limit_received: number;

    @Prop({ enum: ['day', 'week', 'month', 'year'], default: 'month' }) // tổng kết theo loại thời gian nào
    type_day_condition: string;

    @Prop({ default: false }) // giới hạn ngày bắt đầu ngày kết thúc
    is_limit_date: boolean;

    @Prop({ default: null })
    start_date: string;

    @Prop({ default: null })
    end_date: string;

    // @Prop({ enum: ['money', 'artifacts'], default: 'money' }) // loại quà
    // type_bonus: string;

    // @Prop({ default: 0 })
    // money: number; // sẽ hoạt động khi type_bonus= money

    // @Prop({ enum: ['Đồng phục', 'Balo', 'Bộ dụng cụ vệ sinh', 'khác'], default: 'khác' })
    // artifacts: string; // hoạt động khi type_bonus=artifacts

    // @Prop({ enum: ['day', 'week', 'month', 'year'], default: 'day' }) // ngày phát quà
    // type_date_bonus: string;

    // @Prop({ default: true }) // 
    // is_total_invite_collaborator: boolean;

    // @Prop({ default: 10 })
    // total_invite_collaborator: number;

    @Prop({ default: 0 }) // tổng số lượt nhận
    total_received: number;

    @Prop({ default: false }) // tổng số quà tặng
    is_limit_total_received: boolean;

    @Prop({ default: 10 })
    limit_total_received: number;

    @Prop({ default: false }) // tổng số quà tặng
    is_service_apply: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Service', default: [] })
    service_apply: string[];

    @Prop({ default: 'wallet', enum: ['wallet', 'gift_wallet'] })
    type_wallet: string;

    @Prop({ default: false }) // tự động duyệt cho ctv
    is_auto_verify: boolean;
}
export const rewardCollaboratorSchema = SchemaFactory.createForClass(RewardCollaborator);