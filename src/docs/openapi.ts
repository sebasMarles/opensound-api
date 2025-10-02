export const openApiPaths = {
  '/api/v1/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'name'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
                name: { type: 'string' },
                avatar: { type: 'string', format: 'uri' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate user and obtain tokens',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Authentication response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Authentication response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Revoke refresh token and logout',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Logout confirmation',
        },
      },
    },
  },
  '/api/v1/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get authenticated user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Authenticated user',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/profile': {
    put: {
      tags: ['Auth'],
      summary: 'Update authenticated user profile',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                avatar: { type: 'string', format: 'uri' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated profile',
        },
      },
    },
  },
  '/api/v1/auth/change-password': {
    put: {
      tags: ['Auth'],
      summary: 'Change password',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string' },
                newPassword: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password updated',
        },
      },
    },
  },
  '/api/v1/playlists': {
    get: {
      tags: ['Playlists'],
      summary: 'List playlists for the authenticated user or specific userId',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'userId',
          schema: { type: 'string' },
          required: false,
        },
      ],
      responses: {
        200: {
          description: 'List of playlists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Playlist' },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Playlists'],
      summary: 'Create a new playlist',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PlaylistCreate' },
          },
        },
      },
      responses: {
        201: {
          description: 'Created playlist',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Playlist' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/playlists/public': {
    get: {
      tags: ['Playlists'],
      summary: 'List public playlists',
      responses: {
        200: {
          description: 'Public playlists',
        },
      },
    },
  },
  '/api/v1/playlists/search': {
    get: {
      tags: ['Playlists'],
      summary: 'Search playlists',
      parameters: [
        { in: 'query', name: 'q', schema: { type: 'string' }, required: true },
      ],
      responses: {
        200: { description: 'Search results' },
      },
    },
  },
  '/api/v1/playlists/{id}': {
    get: {
      tags: ['Playlists'],
      summary: 'Get playlist by id',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true },
      ],
      responses: {
        200: { description: 'Playlist details' },
      },
    },
    put: {
      tags: ['Playlists'],
      summary: 'Update playlist',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PlaylistUpdate' },
          },
        },
      },
      responses: {
        200: { description: 'Updated playlist' },
      },
    },
    delete: {
      tags: ['Playlists'],
      summary: 'Delete playlist',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true },
      ],
      responses: {
        200: { description: 'Playlist deleted' },
      },
    },
  },
  '/api/v1/playlists/{id}/tracks': {
    post: {
      tags: ['Playlists'],
      summary: 'Add track to playlist',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PlaylistTrack' },
          },
        },
      },
      responses: {
        200: { description: 'Track added' },
      },
    },
  },
  '/api/v1/playlists/{id}/tracks/{trackId}': {
    delete: {
      tags: ['Playlists'],
      summary: 'Remove track from playlist',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true },
        { in: 'path', name: 'trackId', schema: { type: 'string' }, required: true },
      ],
      responses: {
        200: { description: 'Track removed' },
      },
    },
  },
  '/api/v1/playlists/{id}/reorder': {
    put: {
      tags: ['Playlists'],
      summary: 'Reorder playlist tracks',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', schema: { type: 'string' }, required: true },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['trackIds'],
              properties: {
                trackIds: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Tracks reordered' },
      },
    },
  },
};

export const openApiComponents = {
  schemas: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        avatar: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    PlaylistTrack: {
      type: 'object',
      required: ['trackId', 'name', 'artist'],
      properties: {
        trackId: { type: 'string' },
        name: { type: 'string' },
        artist: { type: 'string' },
        imageUrl: { type: 'string', format: 'uri' },
        duration: { type: 'integer' },
      },
    },
    Playlist: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        isPublic: { type: 'boolean' },
        coverImage: { type: 'string', format: 'uri' },
        userId: { type: 'string' },
        tracks: {
          type: 'array',
          items: { $ref: '#/components/schemas/PlaylistTrack' },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    PlaylistCreate: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        isPublic: { type: 'boolean' },
        coverImage: { type: 'string', format: 'uri' },
        tracks: {
          type: 'array',
          items: { $ref: '#/components/schemas/PlaylistTrack' },
        },
      },
    },
    PlaylistUpdate: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        isPublic: { type: 'boolean' },
        coverImage: { type: 'string', format: 'uri', nullable: true },
        tracks: {
          type: 'array',
          items: { $ref: '#/components/schemas/PlaylistTrack' },
        },
      },
    },
    AuthResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
  },
};
