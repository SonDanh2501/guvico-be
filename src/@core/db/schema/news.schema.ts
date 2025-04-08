import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

@Schema()
export class News {
  @Prop({ required: true })
  title: string;

  @Prop({required: true})
  thumbnail: string;

  @Prop({required: true})
  url: string;

  @Prop({default: true})
  short_description: string;

  @Prop({default: "guvilover", enum:["guvilover", "news"]})
  type: string;

  @Prop({default: true})
  is_active: boolean;
  
  @Prop({default: 0})
  position: number;

  // @Prop({default: false})
  // is_delete: boolean;
  
}

export const newsSchema = SchemaFactory.createForClass(News);