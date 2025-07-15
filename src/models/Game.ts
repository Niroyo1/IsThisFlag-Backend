import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGame extends Document {
  code: String;
  players: Types.ObjectId[];
  hostTurn: boolean;
  winner?: Types.ObjectId;
  createdAt: Date;
  questions: Types.ObjectId[];
  round: Number;
  lastGuessedFailed: Boolean;
  lastGuessedResponse: String;
  status: 'waiting' | 'asking' | 'answering' | 'showing_answer' | 'failed_guessing' | 'end';
}

const GameSchema = new Schema<IGame>({
  code: { type: String, required: true, unique: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  hostTurn: { type: Boolean, default: true },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  round: { type: Number, default: 1 },
  lastGuessedFailed: { type: Boolean, default: false},
  lastGuessedResponse: { type: String },
  status: {
    type: String,
    enum: ['waiting', 'asking', 'answering', 'showing_answer', 'failed_guessing', 'end'],
    default: 'waiting',
  },
});

export default mongoose.model<IGame>('Game', GameSchema);
