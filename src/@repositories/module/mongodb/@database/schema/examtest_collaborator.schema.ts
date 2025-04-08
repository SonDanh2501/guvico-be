import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ExamTestDocument = ExamTest & Document;

@Schema()
export class ExamTest {
  @Prop({ default: 0 })
  question: number;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: [
      {
        answer: { type: String },
        isCorrect: { type: Boolean }
      }]
    , default: []
  })
  choose: object[];

  @Prop({ default: false })
  mark_selected: boolean;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: [] })
  type_exam: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingLesson', default: null })
  id_training_lesson: string
}

export const examTestSchema = SchemaFactory.createForClass(ExamTest);