import mongoose from 'mongoose';
import { Password } from '../services/password';

interface UserAttr {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  isVerified: boolean;
}

interface UserModel extends mongoose.Model<UserDoc> {
  createUser(attrs: UserAttr): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(ret: Record<string, any>) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashed = await Password.hashPassword(this.get('password'));
    this.set('password', hashed);
  }
});

userSchema.statics.createUser = (attrs: UserAttr) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User, type UserDoc };
