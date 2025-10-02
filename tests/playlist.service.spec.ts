import { Types } from 'mongoose';
import { PlaylistModel } from '../src/database/models/playlist.model';
import { UserModel } from '../src/database/models/user.model';
import {
  addTrackToPlaylist,
  createPlaylist,
  deletePlaylist,
  listPlaylists,
  reorderPlaylistTracks,
  updatePlaylist,
} from '../src/modules/playlists/playlist.service';
import { hashPassword } from '../src/utils/password';

const createTestUser = async () => {
  const user = await UserModel.create({
    email: `${new Types.ObjectId().toString()}@test.com`,
    passwordHash: await hashPassword('Password123!'),
    name: 'Playlist User',
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

describe('Playlist Service', () => {
  it('creates and retrieves playlists for a user', async () => {
    const user = await createTestUser();
    await createPlaylist(user, { name: 'Focus', isPublic: false });
    await createPlaylist(user, { name: 'Chill', isPublic: true });

    const playlists = await listPlaylists(user);
    expect(playlists).toHaveLength(2);
    expect(playlists[0]).toHaveProperty('id');
  });

  it('updates playlist metadata and tracks', async () => {
    const user = await createTestUser();
    const playlist = await createPlaylist(user, { name: 'Original' });

    const updated = await updatePlaylist(playlist.id, user, {
      name: 'Updated',
      tracks: [
        { trackId: '1', name: 'Song A', artist: 'Artist A' },
        { trackId: '2', name: 'Song B', artist: 'Artist B' },
      ],
    });

    expect(updated.name).toBe('Updated');
    expect(updated.tracks).toHaveLength(2);
  });

  it('reorders playlist tracks', async () => {
    const user = await createTestUser();
    const playlist = await createPlaylist(user, {
      name: 'Reorder Me',
      tracks: [
        { trackId: '1', name: 'Song A', artist: 'Artist A' },
        { trackId: '2', name: 'Song B', artist: 'Artist B' },
        { trackId: '3', name: 'Song C', artist: 'Artist C' },
      ],
    });

    const reordered = await reorderPlaylistTracks(playlist.id, user, ['3', '1']);
    expect(reordered.tracks?.[0]?.trackId).toBe('3');
    expect(reordered.tracks).toHaveLength(3);
  });

  it('adds a track to a playlist', async () => {
    const user = await createTestUser();
    const playlist = await createPlaylist(user, { name: 'Tracks' });

    const updated = await addTrackToPlaylist(playlist.id, user, {
      trackId: '42',
      name: 'Answer',
      artist: 'The Universe',
    });

    expect(updated.tracks).toHaveLength(1);
  });

  it('deletes a playlist', async () => {
    const user = await createTestUser();
    const playlist = await createPlaylist(user, { name: 'To Delete' });

    await deletePlaylist(playlist.id, user);

    const found = await PlaylistModel.findById(playlist.id);
    expect(found).toBeNull();
  });
});
