import mongoose from 'mongoose';
import { seedCountries } from '../scripts/seedCountries';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'error';
    console.log('Connecting to MongoDB at', uri);
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const shouldSeedCountries = process.env.SEED_COUNTRIES;
    if (Number(shouldSeedCountries) === 1)
    await seedCountries();

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
