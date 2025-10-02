import mongoose, { Document, Schema, Types } from 'mongoose';

export interface User extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: unknown) => {
    const record = ret as {
      _id: Types.ObjectId;
      id?: string;
      passwordHash?: string;
    };
    record.id = record._id.toString();
    delete (record as { _id?: Types.ObjectId })._id;
    delete record.passwordHash;
  },
});

export const UserModel = mongoose.model<User>('User', userSchema);
