import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { BaseEntity } from 'src/@repositories/module/mongodb/@database';


export type InfoTestCollaboratorDocument = InfoTestCollaborator & Document;

@Schema()
export class InfoTestCollaborator extends BaseEntity {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: string;

    @Prop({ default: null })
    name_collaborator: string | null;

    @Prop({ default: null })
    phone_collaborator: string | null;

    @Prop({ default: null })
    time_start: String

    @Prop({
        type: [{
            info_question: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest' },
            selected_answer: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTest' },
            // info_question:String,
            // selected_answer: String,
            isCorrect: { type: Boolean }
        }], default: []
    })
    answers: object[];

    @Prop({ default: new Date(Date.now()).toISOString() })
    time_end: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    // @Prop({ default: false })
    // is_delete: boolean;

    @Prop({ default: 0 })
    total_answers: number;

    @Prop({ default: 0 })
    correct_answers: number;

    @Prop({ default: null })
    score: string | null;

    @Prop({ default: 'input', enum: ['input', 'periodic', 'theory_input', 'training', 'premium'] })
    type_exam: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingLesson', default: null })
    id_training_lesson: string

    @Prop({ default: false })
    is_pass: boolean;
}

export const infoTestCollaboratorSchema = SchemaFactory.createForClass(InfoTestCollaborator);