import User, { IUser } from '../models/User';
import Country from '../models/Country';

export async function createUser(username: string, isHost: boolean): Promise<IUser> {

  const countries = await Country.find();
  if (countries.length === 0) throw new Error('No countries available');
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];

  const user = new User({ username, country: randomCountry._id, active: true, isHost });
  await user.save();

  const populatedUser = await User.findById(user._id).populate('country');
  return populatedUser!;
}

export async function getUserById(_id: string): Promise<IUser | null> {
  return User.findById(_id);
}
