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

      // Create new client instance with the mocked axios
      const testClient = new TalkSASAClient({ apiKey: mockApiKey });

      const result = await testClient.sendSMS({
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
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as any);

      // Create new client instance with the mocked axios
      const testClient = new TalkSASAClient({ apiKey: mockApiKey });

      await expect(
        testClient.sendSMS({
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

      // Create new client instance with the mocked axios
      const testClient = new TalkSASAClient({ apiKey: mockApiKey });

      const result = await testClient.sendCampaign({
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
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as any);

      // Create new client instance with the mocked axios
      const testClient = new TalkSASAClient({ apiKey: mockApiKey });

      const result = await testClient.getAccountBalance();

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
        },
        defaults: {
          headers: {
            common: {}
          }
        }
      } as any);

      // Create new client instance with the mocked axios
      const testClient = new TalkSASAClient({ apiKey: mockApiKey });

      const result = await testClient.createTemplate({
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

  describe('Profile API - getProfile', () => {
    it('should get profile successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            id: 'user_123',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            country: 'US',
            timezone: 'America/New_York',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            status: 'active',
            role: 'admin'
          }
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      const result = await testClient.getProfile();

      expect(result.id).toBe('user_123');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('+1234567890');
      expect(result.country).toBe('US');
      expect(result.timezone).toBe('America/New_York');
      expect(result.status).toBe('active');
      expect(result.role).toBe('admin');
    });

    it('should handle error response for getProfile', async () => {
      const mockResponse = {
        data: {
          status: 'error',
          message: 'Unauthorized access'
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      await expect(testClient.getProfile()).rejects.toThrow('Unauthorized access');
    });

    it('should handle invalid profile response format', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: null
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      await expect(testClient.getProfile()).rejects.toThrow('Invalid profile response format');
    });
  });

  describe('Profile API - getSMSUnits', () => {
    it('should get SMS units successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            total_units: 10000,
            used_units: 2500,
            remaining_units: 7500,
            unit_type: 'SMS',
            last_updated: '2024-01-15T12:00:00Z'
          }
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      const result = await testClient.getSMSUnits();

      expect(result.total_units).toBe(10000);
      expect(result.used_units).toBe(2500);
      expect(result.remaining_units).toBe(7500);
      expect(result.unit_type).toBe('SMS');
      expect(result.last_updated).toBe('2024-01-15T12:00:00Z');
    });

    it('should handle zero units', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            total_units: 0,
            used_units: 0,
            remaining_units: 0,
            unit_type: 'SMS'
          }
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      const result = await testClient.getSMSUnits();

      expect(result.total_units).toBe(0);
      expect(result.used_units).toBe(0);
      expect(result.remaining_units).toBe(0);
    });

    it('should handle error response for getSMSUnits', async () => {
      const mockResponse = {
        data: {
          status: 'error',
          message: 'Failed to retrieve SMS units'
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      await expect(testClient.getSMSUnits()).rejects.toThrow('Failed to retrieve SMS units');
    });

    it('should handle invalid SMS unit response format', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: null
        },
        status: 200
      };

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

      const testClient = new TalkSASAClient({ apiKey: mockApiKey });
      await expect(testClient.getSMSUnits()).rejects.toThrow('Invalid SMS unit response format');
    });
  });
});
