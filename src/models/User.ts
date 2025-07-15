import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  country: Types.ObjectId;
  isHost: boolean;
  active: boolean;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true},
  country: { type: Schema.Types.ObjectId, ref: 'Country' },
  isHost: { type: Boolean, default: false },
  active: { type: Boolean },
});

export default mongoose.model<IUser>('User', UserSchema);
