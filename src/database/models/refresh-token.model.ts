import mongoose, { Document, Schema, Types } from 'mongoose';

export interface RefreshToken extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshToken>(
  {
    token: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: unknown) => {
    const record = ret as { _id: Types.ObjectId; id?: string };
    record.id = record._id.toString();
    delete (record as { _id?: Types.ObjectId })._id;
  },
});

export const RefreshTokenModel = mongoose.model<RefreshToken>('RefreshToken', refreshTokenSchema);
