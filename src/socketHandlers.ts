
import './models/Question';
import './models/Game';
import './models/User';
import { Server, Socket } from 'socket.io';
import { handleCreateRoom, handleJoinRoom } from './services/roomService';

export function registerSocketHandlers(io: Server) {

  const socketUserMap = new Map();
  io.on('connection', (socket: Socket) => {
    //const socketUserMap = new Map();

    socket.on('create_room', async ({ username }, cb) => {
      try {
        const { code, user, game } = await handleCreateRoom(username);
        socket.join(code);

        socketUserMap.set(socket.id, { userId: user._id, code });
        cb && cb({ success: true, user, game });
        io.to(code).emit('game_updated', game);
      } catch (err) {
        console.log("internal error in create_room " + err);
        cb && cb({ success: false });
      }
    });

    socket.on('join_room', async ({ code, username }, cb) => {
      try {
        const Game = require('./models/Game').default;
        const {succes, user } = await handleJoinRoom(code, username);
        if (!succes) {
          cb && cb({ success: false, error: 'Room not found or full' });
          return;
        }
        socket.join(code);

        if (user) {
          socketUserMap.set(socket.id, { userId: user._id, code });
        }
        
        const game = await Game.findOne({ code })
        .populate({ path: 'players', populate: { path: 'country' } })
        if(!game) {
          cb && cb({ success: false, error: 'Internal error in join_room' });
          return;
        }

        game.status = 'asking';
        game.save();
        
        cb && cb({ success: true, user, game });
        io.to(code).emit('game_updated', game);
      } catch (err) {
        console.log("internal error in join_room " + err);
        cb && cb({ success: false });
      }
    });

    async function updateAndEmitGame(code: string) {
      const Game = require('./models/Game').default;
      const updatedGame = await Game.findOne({ code })
        .populate({ path: 'players', populate: { path: 'country' } })
        .populate('questions');
        //.populate({ path: 'questions', populate: { path: 'author' } });
      if (updatedGame) {
        io.to(code).emit('game_updated', updatedGame);
      }
    }

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      const info = socketUserMap.get(socket.id);
      if (info) {
        const { userId, code } = info;
        const User = require('./models/User').default;
        await User.findByIdAndUpdate(userId, { active: false });
        await updateAndEmitGame(code);
        socketUserMap.delete(socket.id);
      }
    });

    socket.on('ask_question', async ({ game_id, question, author }) => {
      try {
        const Game = require('./models/Game').default;
        const Question = require('./models/Question').default;
        
        const game = await Game.findById(game_id);
        if (!game) {
          console.log("Internal error, game not found.");
          return;
        }

        const newQuestion = new Question({ text: question, author, round: game.round });
        await newQuestion.save();

        game.questions.push(newQuestion._id);
        game.status = 'answering';
        await game.save();
        
        await updateAndEmitGame(game.code);

      } catch (err) {
        console.log("internal error in ask_question " + err);
      }
    });

    socket.on('answer_question', async ({ game_id, response }) => {
      try {
        const Game = require('./models/Game').default;
        const Question = require('./models/Question').default;

        const game = await Game.findById(game_id);
        if (!game) {
          console.log("Internal error, game not found.");
          return;
        }

        const lastQuestionId = game.questions[game.questions.length - 1];
        if (!lastQuestionId) {
          console.log("No last question found.");
          return;
        }

        const question = await Question.findById(lastQuestionId);
        if (!question) {
          console.log("Internal error, question not found.");
          return;
        }

        question.response = response;
        question.hasResponse = true;
        await question.save();

        game.status = 'showing_answer';
        await game.save();
        
        await updateAndEmitGame(game.code);
      } catch (err) {
        console.log("internal error in answer_question " + err);
      }
    });

    socket.on('change_turn', async ({ game_id }) => {
      try {
        const Game = require('./models/Game').default;

        const game = await Game.findById(game_id);
        if (!game) {
          console.log("Internal error, game not found.");
          return;
        }
        
        game.lastGuessedFailed = false;
        game.hostTurn = !game.hostTurn;
        game.round++;
        game.status = 'asking';
        await game.save();
        await updateAndEmitGame(game.code);
      } catch (err) {
        console.log("internal error in change_turn " + err);
      }
    });

    socket.on('flag_guessed', async ({ game_id, win, winner, lastGuessedResponse }) => {
      try {
        const Game = require('./models/Game').default;

        const game = await Game.findById(game_id);
        if (!game) {
          console.log("Internal error, game not found.");
          return;
        }
        
        if(win)
        {
          game.winner = winner;
          game.status = 'end';
        }
        else
        {
          game.winner = winner;
          game.status = 'failed_guessing';
        }
        game.lastGuessedResponse = lastGuessedResponse;
        await game.save();
        await updateAndEmitGame(game.code);
      } catch (err) {
        console.log("internal error in flag_guessed " + err);
      }
    });

  });
}
