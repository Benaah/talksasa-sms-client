/**
 * OAuth 2.0 Client Tests
 */

import { TalkSASAOAuth2Client } from '../src/oauth2-client';
import { TalkSASAValidationError, TalkSASAAuthenticationError } from '../src/errors';
import axios from 'axios';

// Jest types
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

// Mock axios
jest.mock('axios');
const mockedAxios = axios as any;

describe('TalkSASAOAuth2Client', () => {
  let client: TalkSASAOAuth2Client;
  const mockClientId = 'test-client-id-12345';
  const mockClientSecret = 'test-client-secret-67890';

  beforeEach(() => {
    jest.clearAllMocks();
    client = new TalkSASAOAuth2Client({
      clientId: mockClientId,
      clientSecret: mockClientSecret
    });
  });

  describe('Constructor', () => {
    it('should initialize with valid config', () => {
      expect(client).toBeInstanceOf(TalkSASAOAuth2Client);
    });

    it('should throw error for missing client ID', () => {
      expect(() => {
        new TalkSASAOAuth2Client({ clientId: '', clientSecret: mockClientSecret });
      }).toThrow(TalkSASAValidationError);
    });

    it('should throw error for missing client secret', () => {
      expect(() => {
        new TalkSASAOAuth2Client({ clientId: mockClientId, clientSecret: '' });
      }).toThrow(TalkSASAValidationError);
    });
  });

  describe('getAccessToken', () => {
    it('should get access token successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'sms'
        },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const token = await client.getAccessToken();
      expect(token).toBe('test-access-token');
    });

    it('should handle token request errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: 'invalid_client', error_description: 'Invalid client credentials' }
        }
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      await expect(client.getAccessToken()).rejects.toThrow(TalkSASAAuthenticationError);
    });
  });

  describe('requestToken', () => {
    it('should request token with client credentials', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const response = await client.requestToken({
        grant_type: 'client_credentials',
        client_id: mockClientId,
        client_secret: mockClientSecret
      });

      expect(response.access_token).toBe('test-access-token');
      expect(response.token_type).toBe('Bearer');
      expect(response.expires_in).toBe(3600);
    });

    it('should request token with password grant', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'test-refresh-token'
        },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const response = await client.requestTokenWithPassword('testuser', 'testpass');

      expect(response.access_token).toBe('test-access-token');
      expect(response.refresh_token).toBe('test-refresh-token');
    });

    it('should throw validation error for invalid grant type', async () => {
      await expect(
        client.requestToken({
          grant_type: 'invalid_grant' as any,
          client_id: mockClientId,
          client_secret: mockClientSecret
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // First set a token with refresh token
      client.setTokenInfo({
        access_token: 'old-token',
        token_type: 'Bearer',
        expires_at: Date.now() - 1000, // Expired
        refresh_token: 'test-refresh-token',
        isExpired: true
      });

      const mockResponse = {
        data: {
          access_token: 'new-access-token',
          token_type: 'Bearer',
          expires_in: 3600
        },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const response = await client.refreshToken();
      expect(response.access_token).toBe('new-access-token');
    });

    it('should throw error when no refresh token available', async () => {
      await expect(client.refreshToken()).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('revokeToken', () => {
    it('should revoke token successfully', async () => {
      client.setTokenInfo({
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_at: Date.now() + 3600000,
        isExpired: false
      });

      const mockResponse = {
        data: { success: true },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await client.revokeToken();
      expect(result).toBe(true);
    });

    it('should return true when no token to revoke', async () => {
      const result = await client.revokeToken();
      expect(result).toBe(true);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid token', () => {
      client.setTokenInfo({
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_at: Date.now() + 3600000, // 1 hour from now
        isExpired: false
      });

      expect(client.isTokenValid()).toBe(true);
    });

    it('should return false for expired token', () => {
      client.setTokenInfo({
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_at: Date.now() - 1000, // Expired
        isExpired: true
      });

      expect(client.isTokenValid()).toBe(false);
    });

    it('should return false when no token', () => {
      expect(client.isTokenValid()).toBe(false);
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info when available', () => {
      const tokenInfo = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_at: Date.now() + 3600000,
        isExpired: false
      };

      client.setTokenInfo(tokenInfo);
      const result = client.getTokenInfo();

      expect(result).toEqual(expect.objectContaining({
        access_token: 'test-token',
        token_type: 'Bearer',
        isExpired: false
      }));
    });

    it('should return null when no token', () => {
      expect(client.getTokenInfo()).toBeNull();
    });
  });

  describe('setTokenInfo', () => {
    it('should set token info correctly', () => {
      const tokenInfo = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_at: Date.now() + 3600000,
        isExpired: false
      };

      client.setTokenInfo(tokenInfo);
      expect(client.getTokenInfo()).toEqual(expect.objectContaining(tokenInfo));
    });
  });

  describe('clearToken', () => {
    it('should clear token info', () => {
      client.setTokenInfo({
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_at: Date.now() + 3600000,
        isExpired: false
      });

      client.clearToken();
      expect(client.getTokenInfo()).toBeNull();
    });
  });
});
