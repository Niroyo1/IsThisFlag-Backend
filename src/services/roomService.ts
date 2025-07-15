
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { createUser } from './userService';
import { createGame, joinGame, getGameByCode } from './gameService';

export async function handleCreateRoom(username: string) {
  const user = await createUser(username, true);
  const code = uuidv4().slice(0, 6).toUpperCase();
  const game = await createGame(code, user._id as Types.ObjectId);
  return { code, user, game };
}


export async function handleJoinRoom(code: string, username: string) {
  const game = await getGameByCode(code);
  if (!game || game.players.length === 2) return {succes: false};
  const user = await createUser(username, false);
  await joinGame(code, user._id as Types.ObjectId);
  return { succes: true, user };
}
