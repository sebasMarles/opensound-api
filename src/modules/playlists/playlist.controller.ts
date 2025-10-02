import { Request, Response } from 'express';
import {
  addTrackToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  listPlaylists,
  listPublicPlaylists,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  searchPlaylists,
  updatePlaylist,
} from './playlist.service';
import { createSuccessResponse } from '../../utils/response';

export const listPlaylistsHandler = async (req: Request, res: Response) => {
  const { userId } = req.query as { userId?: string };
  const playlists = await listPlaylists(req.user!, userId);
  res.json(createSuccessResponse(playlists));
};

export const createPlaylistHandler = async (req: Request, res: Response) => {
  const playlist = await createPlaylist(req.user!, req.body);
  res.status(201).json(createSuccessResponse(playlist));
};

export const getPlaylistHandler = async (req: Request, res: Response) => {
  const playlist = await getPlaylistById(req.params.id, req.user);
  res.json(createSuccessResponse(playlist));
};

export const updatePlaylistHandler = async (req: Request, res: Response) => {
  const playlist = await updatePlaylist(req.params.id, req.user!, req.body);
  res.json(createSuccessResponse(playlist, 'Playlist updated'));
};

export const deletePlaylistHandler = async (req: Request, res: Response) => {
  await deletePlaylist(req.params.id, req.user!);
  res.json(createSuccessResponse({} as Record<string, never>, 'Playlist deleted'));
};

export const addTrackHandler = async (req: Request, res: Response) => {
  const playlist = await addTrackToPlaylist(req.params.id, req.user!, req.body);
  res.json(createSuccessResponse(playlist, 'Track added'));
};

export const removeTrackHandler = async (req: Request, res: Response) => {
  const playlist = await removeTrackFromPlaylist(req.params.id, req.user!, req.params.trackId);
  res.json(createSuccessResponse(playlist, 'Track removed'));
};

export const reorderTracksHandler = async (req: Request, res: Response) => {
  const playlist = await reorderPlaylistTracks(req.params.id, req.user!, req.body.trackIds);
  res.json(createSuccessResponse(playlist, 'Tracks reordered'));
};

export const listPublicPlaylistsHandler = async (_req: Request, res: Response) => {
  const playlists = await listPublicPlaylists();
  res.json(createSuccessResponse(playlists));
};

export const searchPlaylistsHandler = async (req: Request, res: Response) => {
  const { q } = req.query as { q: string };
  const playlists = await searchPlaylists(q, req.user?.id);
  res.json(createSuccessResponse(playlists));
};
