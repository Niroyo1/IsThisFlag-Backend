import fs from 'fs';
import path from 'path';
import Country from '../src/models/Country';

export async function seedCountries() {
  try {
    const filePath = path.join(__dirname, '../src/data/countries.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const countries = JSON.parse(raw);
    await Country.deleteMany({});
    await Country.insertMany(countries);
    console.log('Countries seeded!');
  } catch (err) {
    console.error('Error seeding countries:', err);
  }
}
