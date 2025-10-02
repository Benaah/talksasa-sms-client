/**
 * TalkSASA Client Tests
 */

import { TalkSASAClient } from '../src/talksasa-client';
import { TalkSASAValidationError, TalkSASAAuthenticationError } from '../src/errors';
import { mockedAxios } from './setup';

describe('TalkSASAClient', () => {
  let client: TalkSASAClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    mockedAxios.create.mockReturnValue({
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      },
      defaults: {
        headers: {
          common: {}
        }
      }
    } as any);
    
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
          status: 'success',
          data: { message: 'SMS sent successfully' }
        },
        status: 200
      };

      // Mock the request method to return our mock response
      const mockRequest = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        request: mockRequest,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as any);

      const result = await client.sendSMS({
        recipient: '+1234567890',
        sender_id: 'TestSender',
        type: 'plain',
        message: 'Test message'
      });

      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
    });

    it('should throw validation error for invalid phone number', async () => {
      await expect(
        client.sendSMS({
          recipient: 'invalid-phone',
          sender_id: 'TestSender',
          type: 'plain',
          message: 'Test message'
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });

    it('should throw validation error for empty message', async () => {
      await expect(
        client.sendSMS({
          recipient: '+1234567890',
          sender_id: 'TestSender',
          type: 'plain',
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
          recipient: '+1234567890',
          sender_id: 'TestSender',
          type: 'plain',
          message: 'Test message'
        })
      ).rejects.toThrow(TalkSASAAuthenticationError);
    });
  });

  describe('sendCampaignSMS', () => {
    it('should send campaign SMS successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: { message: 'Campaign sent successfully' }
        },
        status: 200
      };

      // Mock the request method to return our mock response
      const mockRequest = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        request: mockRequest,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as any);

      const result = await client.sendCampaign({
        contact_list_id: 'list_123',
        sender_id: 'TestSender',
        type: 'plain',
        message: 'Campaign message'
      });

      expect(result.status).toBe('success');
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
