/**
 * TalkSASA Client Tests
 */

import { TalkSASAClient } from '../src/talksasa-client';
import { TalkSASAValidationError, TalkSASAAuthenticationError } from '../src/errors';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TalkSASAClient', () => {
  let client: TalkSASAClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    client = new TalkSASAClient({ apiKey: mockApiKey });
  });

  describe('Constructor', () => {
    it('should initialize with valid config', () => {
      expect(client).toBeInstanceOf(TalkSASAClient);
    });

    it('should throw error for missing API key', () => {
      expect(() => {
        new TalkSASAClient({ apiKey: '' });
      }).toThrow(TalkSASAValidationError);
    });

    it('should use default base URL when not provided', () => {
      const client = new TalkSASAClient({ apiKey: mockApiKey });
      expect(client).toBeInstanceOf(TalkSASAClient);
    });
  });

  describe('sendSMS', () => {
    it('should send SMS successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          messageId: 'msg_123',
          status: 'sent'
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

      const result = await client.sendSMS({
        to: '+1234567890',
        message: 'Test message'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_123');
    });

    it('should throw validation error for invalid phone number', async () => {
      await expect(
        client.sendSMS({
          to: 'invalid-phone',
          message: 'Test message'
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });

    it('should throw validation error for empty message', async () => {
      await expect(
        client.sendSMS({
          to: '+1234567890',
          message: ''
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      await expect(
        client.sendSMS({
          to: '+1234567890',
          message: 'Test message'
        })
      ).rejects.toThrow(TalkSASAAuthenticationError);
    });
  });

  describe('sendBulkSMS', () => {
    it('should send bulk SMS successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          messageIds: ['msg_1', 'msg_2'],
          status: 'sent'
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

      const result = await client.sendBulkSMS({
        messages: [
          { to: '+1234567890', message: 'Message 1' },
          { to: '+0987654321', message: 'Message 2' }
        ]
      });

      expect(result.success).toBe(true);
      expect(result.messageIds).toEqual(['msg_1', 'msg_2']);
    });

    it('should throw validation error for empty messages array', async () => {
      await expect(
        client.sendBulkSMS({ messages: [] })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('getAccountBalance', () => {
    it('should get account balance successfully', async () => {
      const mockResponse = {
        data: {
          balance: 100.50,
          currency: 'USD',
          lastUpdated: '2024-01-01T00:00:00Z'
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

      const result = await client.getAccountBalance();

      expect(result.balance).toBe(100.50);
      expect(result.currency).toBe('USD');
    });
  });

  describe('createTemplate', () => {
    it('should create template successfully', async () => {
      const mockResponse = {
        data: {
          id: 'template_123',
          name: 'Test Template',
          content: 'Hello {{name}}!',
          variables: ['name'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
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

      const result = await client.createTemplate({
        name: 'Test Template',
        content: 'Hello {{name}}!',
        variables: ['name']
      });

      expect(result.id).toBe('template_123');
      expect(result.name).toBe('Test Template');
      expect(result.variables).toEqual(['name']);
    });

    it('should throw validation error for empty template content', async () => {
      await expect(
        client.createTemplate({
          name: 'Test Template',
          content: ''
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });
});
