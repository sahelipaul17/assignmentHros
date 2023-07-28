import express from 'express';
import bodyParser from 'body-parser';
import { authMiddleware } from './authMiddleware';
import { userRouter } from './user';
import { feedRouter } from './feed';
import { logRouter } from './log';

const app = express();
app.use(bodyParser.json());

// Routes setup
app.use('/users', userRouter);
app.use('/feeds', authMiddleware, feedRouter);
app.use('/logs', authMiddleware, logRouter);

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});