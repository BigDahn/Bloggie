import express from 'express';

import { currentUser, ErrorHandler, NotFoundError } from '@bloggie/library';
import cookieParser from 'cookie-parser';
import { NewPostRouter } from './routes/new';
import { GetPostRouter } from './routes';
import { DeletePostRouter } from './routes/delete';
import { UpdatePostRouter } from './routes/update';
import { LikeRouter } from './routes/like';
import { unLikeRouter } from './routes/unlike';

const app = express();

app.set('trust proxy', 1);
app.use(cookieParser());

app.use(express.json());

app.use(currentUser);

app.use(NewPostRouter);
app.use(GetPostRouter);
app.use(DeletePostRouter);
app.use(UpdatePostRouter);
app.use(LikeRouter);
app.use(unLikeRouter);

app.get('/*splat', () => {
  throw new NotFoundError();
});

app.use(ErrorHandler);
export { app };
