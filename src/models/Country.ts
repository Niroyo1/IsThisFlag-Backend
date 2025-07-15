import mongoose, { Document, Schema } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  nameVariants?: string[];
  pool: number;
  flagUrl: string;
}

const CountrySchema = new Schema<ICountry>({
  name: { type: String, required: true, unique: true },
  nameVariants: { type: [String], default: [] },
  pool: { type: Number, required: true},
  flagUrl: { type: String, required: true }
});

export default mongoose.model<ICountry>('Country', CountrySchema);
