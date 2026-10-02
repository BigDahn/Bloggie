import express from 'express';
import cookieParser from 'cookie-parser';
import { currentUser, ErrorHandler, NotFoundError } from '@bloggie/library';
import { CreateCommentRouter } from './routes/new';
import { UpdateCommentRouter } from './routes/update';
import { DeleteCommentRouter } from './routes/delete';
import { GetCommentRouter } from './routes';
const app = express();

app.set('trust proxy', 1);
app.use(cookieParser());

app.use(express.json());

app.use(currentUser);
app.use(GetCommentRouter);
app.use(CreateCommentRouter);
app.use(UpdateCommentRouter);
app.use(DeleteCommentRouter);

app.get('/*splat', () => {
  throw new NotFoundError();
});

app.use(ErrorHandler);
export { app };
