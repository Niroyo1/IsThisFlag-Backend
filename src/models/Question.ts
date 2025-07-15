import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuestion extends Document {
  author: Types.ObjectId;
  text: string,
  response?: boolean;
  hasResponse: boolean;
  round: Number;
}

const QuestionSchema = new Schema<IQuestion>({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String},
  response: { type: Boolean },
  hasResponse: { type: Boolean, default: false },
  round: { type: Number },
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);
