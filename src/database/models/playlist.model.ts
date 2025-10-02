import mongoose, { Document, Schema, Types } from 'mongoose';

export interface PlaylistTrack {
  trackId: string;
  name: string;
  artist: string;
  imageUrl?: string;
  duration?: number;
}

export interface Playlist extends Document {
  name: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  userId: Types.ObjectId;
  tracks: PlaylistTrack[];
  createdAt: Date;
  updatedAt: Date;
}

const trackSchema = new Schema<PlaylistTrack>(
  {
    trackId: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String, required: true },
    imageUrl: { type: String },
    duration: { type: Number },
  },
  { _id: false }
);

const playlistSchema = new Schema<Playlist>(
  {
    name: { type: String, required: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
    coverImage: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tracks: { type: [trackSchema], default: [] },
  },
  { timestamps: true }
);

playlistSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: unknown) => {
    const record = ret as {
      _id: Types.ObjectId;
      userId?: Types.ObjectId | string;
      id?: string;
    };
    record.id = record._id.toString();
    record.userId = record.userId ? record.userId.toString() : undefined;
    delete (record as { _id?: Types.ObjectId })._id;
  },
});

export const PlaylistModel = mongoose.model<Playlist>('Playlist', playlistSchema);
