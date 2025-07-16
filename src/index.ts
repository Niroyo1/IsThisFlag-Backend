import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './db';
import cors from 'cors';
import { registerSocketHandlers } from './socketHandlers';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

registerSocketHandlers(io);

async function startServer() {
  try {
    await connectDB();
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  }
}

startServer();
