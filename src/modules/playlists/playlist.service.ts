import { FilterQuery, Types } from 'mongoose';
import { Playlist, PlaylistModel, PlaylistTrack } from '../../database/models/playlist.model';
import { AuthenticatedUser } from '../auth/auth.types';

const toClientPlaylist = (playlist: unknown) => {
  if (!playlist) return null;
  const record = playlist as {
    _id: Types.ObjectId | string;
    userId?: Types.ObjectId | string;
    __v?: unknown;
    [key: string]: unknown;
  };
  const { _id, userId, ...rest } = record;
  delete (rest as Record<string, unknown> & { __v?: unknown }).__v;
  return {
    id: typeof _id === 'string' ? _id : _id.toString(),
    userId: userId instanceof Types.ObjectId ? userId.toString() : (userId as string | undefined),
    ...rest,
  };
};

const ensureOwnership = (playlist: Playlist, userId: string) => {
  if (playlist.userId.toString() !== userId) {
    const error = new Error('You are not allowed to modify this playlist');
    (error as Error & { statusCode: number }).statusCode = 403;
    throw error;
  }
};

export const listPlaylists = async (
  currentUser: AuthenticatedUser,
  filterUserId?: string,
) => {
  const query: FilterQuery<Playlist> = {};
  if (filterUserId) {
    if (!Types.ObjectId.isValid(filterUserId)) {
      const error = new Error('Invalid userId');
      (error as Error & { statusCode: number }).statusCode = 400;
      throw error;
    }
    query.userId = new Types.ObjectId(filterUserId);
  } else {
    query.userId = new Types.ObjectId(currentUser.id);
  }

  const playlists = await PlaylistModel.find(query)
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  return playlists.map(toClientPlaylist);
};

export const listPublicPlaylists = async () => {
  const playlists = await PlaylistModel.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return playlists.map(toClientPlaylist);
};

export const searchPlaylists = async (query: string, userId?: string) => {
  const filters: FilterQuery<Playlist> = {
    $or: [{ name: new RegExp(query, 'i') }, { description: new RegExp(query, 'i') }],
  };

  if (userId) {
    if (!Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid userId');
      (error as Error & { statusCode: number }).statusCode = 400;
      throw error;
    }
    filters.$or = [
      {
        $and: [{ userId: new Types.ObjectId(userId) }, { name: new RegExp(query, 'i') }],
      },
      {
        $and: [{ userId: new Types.ObjectId(userId) }, { description: new RegExp(query, 'i') }],
      },
      { isPublic: true, name: new RegExp(query, 'i') },
      { isPublic: true, description: new RegExp(query, 'i') },
    ];
  } else {
    filters.isPublic = true;
  }

  const playlists = await PlaylistModel.find(filters)
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return playlists.map(toClientPlaylist);
};

export const getPlaylistById = async (id: string, currentUser?: AuthenticatedUser) => {
  const playlist = await PlaylistModel.findById(id).lean({ virtuals: true });

  if (!playlist) {
    const error = new Error('Playlist not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  if (!playlist.isPublic && currentUser && playlist.userId.toString() !== currentUser.id) {
    const error = new Error('You are not allowed to view this playlist');
    (error as Error & { statusCode: number }).statusCode = 403;
    throw error;
  }

  return toClientPlaylist(playlist);
};

export const createPlaylist = async (
  currentUser: AuthenticatedUser,
  payload: {
    name: string;
    description?: string;
    isPublic?: boolean;
    coverImage?: string;
    tracks?: PlaylistTrack[];
  },
) => {
  const playlist = await PlaylistModel.create({
    ...payload,
    userId: new Types.ObjectId(currentUser.id),
  });

  return playlist.toJSON();
};

export const updatePlaylist = async (
  id: string,
  currentUser: AuthenticatedUser,
  payload: Partial<Omit<Playlist, 'id' | 'userId' | 'tracks'>> & { tracks?: PlaylistTrack[] },
) => {
  const playlist = await PlaylistModel.findById(id);

  if (!playlist) {
    const error = new Error('Playlist not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  ensureOwnership(playlist, currentUser.id);

  if (payload.tracks) {
    playlist.tracks = payload.tracks;
  }

  if (payload.name !== undefined) playlist.name = payload.name as string;
  if (payload.description !== undefined) playlist.description = payload.description as string;
  if (payload.isPublic !== undefined) playlist.isPublic = payload.isPublic as boolean;
  if (payload.coverImage !== undefined) {
    playlist.coverImage = (payload.coverImage as string | null) || undefined;
  }

  await playlist.save();
  return playlist.toJSON();
};

export const deletePlaylist = async (id: string, currentUser: AuthenticatedUser) => {
  const playlist = await PlaylistModel.findById(id);
  if (!playlist) {
    const error = new Error('Playlist not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  ensureOwnership(playlist, currentUser.id);
  await playlist.deleteOne();
};

export const addTrackToPlaylist = async (
  id: string,
  currentUser: AuthenticatedUser,
  track: PlaylistTrack,
) => {
  const playlist = await PlaylistModel.findById(id);
  if (!playlist) {
    const error = new Error('Playlist not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  ensureOwnership(playlist, currentUser.id);

  playlist.tracks.push(track);
  await playlist.save();
  return playlist.toJSON();
};

export const removeTrackFromPlaylist = async (
  id: string,
  currentUser: AuthenticatedUser,
  trackId: string,
) => {
  const playlist = await PlaylistModel.findById(id);
  if (!playlist) {
    const error = new Error('Playlist not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  ensureOwnership(playlist, currentUser.id);
  playlist.tracks = playlist.tracks.filter((track) => track.trackId !== trackId);
  await playlist.save();
  return playlist.toJSON();
};

export const reorderPlaylistTracks = async (
  id: string,
  currentUser: AuthenticatedUser,
  trackIds: string[],
) => {
  const playlist = await PlaylistModel.findById(id);
  if (!playlist) {
    const error = new Error('Playlist not found');
    (error as Error & { statusCode: number }).statusCode = 404;
    throw error;
  }

  ensureOwnership(playlist, currentUser.id);

  const trackMap = new Map(playlist.tracks.map((track) => [track.trackId, track]));
  const newOrder: PlaylistTrack[] = [];

  trackIds.forEach((trackId) => {
    const track = trackMap.get(trackId);
    if (track) {
      newOrder.push(track);
      trackMap.delete(trackId);
    }
  });

  // Append remaining tracks not explicitly ordered
  newOrder.push(...Array.from(trackMap.values()));

  playlist.tracks = newOrder;
  await playlist.save();
  return playlist.toJSON();
};
