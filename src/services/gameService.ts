import Game, { IGame } from '../models/Game';
import { Types } from 'mongoose';

export async function createGame(code: string, userId: Types.ObjectId): Promise<IGame> {
  const game = new Game({ code, hostId: userId, players: [userId] });
  await game.save();
  // Populate players and their country
  await game.populate({ path: 'players', populate: { path: 'country' } });
  return game;
}

export async function joinGame(code: string, userId: Types.ObjectId): Promise<IGame | null> {
  const game = await Game.findOne({ code });
  if (!game || game.players.length === 2) return null;
  
  game.players.push(userId);
  await game.save();
  // Populate players and their country
  await game.populate({ path: 'players', populate: { path: 'country' } });
  return game;
}

export async function getGameByCode(code: string): Promise<IGame | null> {
  return Game.findOne({ code })
    .populate({ path: 'players', populate: { path: 'country' } });
}
