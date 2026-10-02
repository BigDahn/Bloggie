import express from 'express';

import { ErrorHandler, NotFoundError } from '@bloggie/library';

import cookieParser from 'cookie-parser';
import { SigninRouter } from './routes/signin';
import { SignOutRouter } from './routes/signout';
import { SignUpRouter } from './routes/signup';
import { RefreshTokenRouter } from './routes/refresh-token';
import { VerifyOtpRouter } from './routes/verify-otp';
import { ResendOtpRouter } from './routes/resend-otp';
import { CurrentUserRouter } from './routes/current-user';

const app = express();

app.set('trust proxy', 1);

app.use(express.json());

app.use(cookieParser());

app.use(CurrentUserRouter);

app.use(SigninRouter);
app.use(SignOutRouter);
app.use(SignUpRouter);
app.use(RefreshTokenRouter);
app.use(VerifyOtpRouter);
app.use(ResendOtpRouter);

app.get('/*splat', () => {
  throw new NotFoundError();
});

app.use(ErrorHandler);

export { app };
