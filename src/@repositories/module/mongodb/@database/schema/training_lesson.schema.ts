import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { languageDTO } from 'src/@core/dto';
import { BaseEntity } from '../entity';

export type TrainingLessonDocument = TrainingLesson & Document;

@Schema()
export class TrainingLesson extends BaseEntity {
    @Prop({ default: 0 })
    lesson: number;

    @Prop({ type: { vi: String, en: String }, required: true })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, required: true })
    description: languageDTO;

    @Prop({ default: 10 })
    total_estimate_lesson: number;

    @Prop({ default: null })
    link_video: string;

    @Prop({ default: true })
    is_active: boolean;

    // @Prop({ default: false })
    // is_delete: boolean;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: true })
    is_show_in_app: boolean;

    @Prop({ default: 'training', enum: ['input', 'periodic', 'theory_input', 'training', 'premium'] })
    type_training_lesson: string;

    @Prop({ default: 3 })
    times_submit: number; // số lần nộp bài tối đa

    @Prop({ default: 15 })
    total_exam: number; // tổng số câu hỏi

    @Prop({ default: 5 })
    total_correct_exam_pass: number; // tổng số câu để pass

    @Prop({ default: '' })
    theory: string;
    @Prop({ default: [] })
    type_service_exam: string[];
}

export const trainingLessonSchema = SchemaFactory.createForClass(TrainingLesson);