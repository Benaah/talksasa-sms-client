/**
 * Contacts API Tests
 */

import { TalkSASAClient } from '../src/talksasa-client';
import { TalkSASAValidationError, TalkSASAAuthenticationError } from '../src/errors';
import { mockedAxios } from './setup';

describe('TalkSASAClient - Contacts API', () => {
  let client: TalkSASAClient;
  const mockApiKey = 'test-api-key';
  const mockGroupId = 'test-group-id-123';
  const mockContactUid = 'test-contact-uid-456';

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

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            uid: mockContactUid,
            phone: '1234567890',
            first_name: 'John',
            last_name: 'Doe',
            group_id: mockGroupId,
            created_at: '2024-01-01T00:00:00Z'
          }
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

      const contact = await client.createContact(mockGroupId, {
        phone: '1234567890',
        first_name: 'John',
        last_name: 'Doe'
      });

      expect(contact.uid).toBe(mockContactUid);
      expect(contact.phone).toBe('1234567890');
      expect(contact.first_name).toBe('John');
      expect(contact.last_name).toBe('Doe');
    });

    it('should throw validation error for invalid phone number', async () => {
      await expect(
        client.createContact(mockGroupId, {
          phone: 'invalid-phone',
          first_name: 'John'
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });

    it('should throw validation error for missing group ID', async () => {
      await expect(
        client.createContact('', {
          phone: '1234567890',
          first_name: 'John'
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('getContact', () => {
    it('should get contact successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            uid: mockContactUid,
            phone: '1234567890',
            first_name: 'John',
            last_name: 'Doe',
            group_id: mockGroupId
          }
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

      const contact = await client.getContact(mockGroupId, mockContactUid);

      expect(contact.uid).toBe(mockContactUid);
      expect(contact.phone).toBe('1234567890');
    });

    it('should throw validation error for missing contact UID', async () => {
      await expect(
        client.getContact(mockGroupId, '')
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('updateContact', () => {
    it('should update contact successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            uid: mockContactUid,
            phone: '0987654321',
            first_name: 'Jane',
            last_name: 'Smith',
            group_id: mockGroupId,
            updated_at: '2024-01-01T00:00:00Z'
          }
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

      const contact = await client.updateContact(mockGroupId, mockContactUid, {
        phone: '0987654321',
        first_name: 'Jane',
        last_name: 'Smith'
      });

      expect(contact.uid).toBe(mockContactUid);
      expect(contact.phone).toBe('0987654321');
      expect(contact.first_name).toBe('Jane');
    });

    it('should throw validation error for invalid phone number', async () => {
      await expect(
        client.updateContact(mockGroupId, mockContactUid, {
          phone: 'invalid-phone'
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      const mockResponse = {
        data: { status: 'success' },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await client.deleteContact(mockGroupId, mockContactUid);
      expect(result).toBe(true);
    });

    it('should throw validation error for missing contact UID', async () => {
      await expect(
        client.deleteContact(mockGroupId, '')
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('getContacts', () => {
    it('should get all contacts successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: [
            {
              uid: 'contact1',
              phone: '1234567890',
              first_name: 'John',
              group_id: mockGroupId
            },
            {
              uid: 'contact2',
              phone: '0987654321',
              first_name: 'Jane',
              group_id: mockGroupId
            }
          ],
          pagination: {
            current_page: 1,
            per_page: 10,
            total: 2,
            last_page: 1
          }
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

      const result = await client.getContacts(mockGroupId);

      expect(result.contacts).toHaveLength(2);
      expect(result.contacts[0].uid).toBe('contact1');
      expect(result.contacts[1].uid).toBe('contact2');
      expect(result.pagination).toBeDefined();
    });

    it('should throw validation error for missing group ID', async () => {
      await expect(
        client.getContacts('')
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('createContactGroup', () => {
    it('should create contact group successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            uid: 'group-uid-123',
            name: 'Test Group',
            created_at: '2024-01-01T00:00:00Z'
          }
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

      const group = await client.createContactGroup({
        name: 'Test Group'
      });

      expect(group.uid).toBe('group-uid-123');
      expect(group.name).toBe('Test Group');
    });

    it('should throw validation error for empty group name', async () => {
      await expect(
        client.createContactGroup({
          name: ''
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('getContactGroups', () => {
    it('should get all contact groups successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: [
            {
              uid: 'group1',
              name: 'Group 1'
            },
            {
              uid: 'group2',
              name: 'Group 2'
            }
          ]
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

      const groups = await client.getContactGroups();

      expect(groups).toHaveLength(2);
      expect(groups[0].uid).toBe('group1');
      expect(groups[1].uid).toBe('group2');
    });
  });

  describe('getContactGroup', () => {
    it('should get contact group successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            uid: mockGroupId,
            name: 'Test Group'
          }
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

      const group = await client.getContactGroup(mockGroupId);

      expect(group.uid).toBe(mockGroupId);
      expect(group.name).toBe('Test Group');
    });

    it('should throw validation error for missing group ID', async () => {
      await expect(
        client.getContactGroup('')
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('updateContactGroup', () => {
    it('should update contact group successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            uid: mockGroupId,
            name: 'Updated Group',
            description: 'Updated description',
            updated_at: '2024-01-01T00:00:00Z'
          }
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

      const group = await client.updateContactGroup(mockGroupId, {
        name: 'Updated Group'
      });

      expect(group.uid).toBe(mockGroupId);
      expect(group.name).toBe('Updated Group');
    });

    it('should throw validation error for empty group name', async () => {
      await expect(
        client.updateContactGroup(mockGroupId, {
          name: ''
        })
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });

  describe('deleteContactGroup', () => {
    it('should delete contact group successfully', async () => {
      const mockResponse = {
        data: { status: 'success' },
        status: 200
      };

      mockedAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      } as any);

      const result = await client.deleteContactGroup(mockGroupId);
      expect(result).toBe(true);
    });

    it('should throw validation error for missing group ID', async () => {
      await expect(
        client.deleteContactGroup('')
      ).rejects.toThrow(TalkSASAValidationError);
    });
  });
});
