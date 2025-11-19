/**
 * Validators Tests
 */

import { Validators } from '../src/validators';
import { TalkSASAValidationError } from '../src/errors';

describe('Validators', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(Validators.validatePhoneNumber('+1234567890')).toBe(true);
      expect(Validators.validatePhoneNumber('1234567890')).toBe(true);
      expect(Validators.validatePhoneNumber('+44123456789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(Validators.validatePhoneNumber('123')).toBe(false);
      expect(Validators.validatePhoneNumber('1234567890123456')).toBe(false);
      expect(Validators.validatePhoneNumber('abc123')).toBe(false);
      expect(Validators.validatePhoneNumber('')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format valid phone numbers', () => {
      expect(Validators.formatPhoneNumber('1234567890')).toBe('+1234567890');
      expect(Validators.formatPhoneNumber('+1234567890')).toBe('+1234567890');
    });

    it('should throw error for invalid phone numbers', () => {
      expect(() => Validators.formatPhoneNumber('123')).toThrow(TalkSASAValidationError);
      expect(() => Validators.formatPhoneNumber('')).toThrow(TalkSASAValidationError);
    });
  });

  describe('validateMessage', () => {
    it('should validate correct messages', () => {
      expect(Validators.validateMessage('Hello World')).toBe('Hello World');
      expect(Validators.validateMessage('  Hello World  ')).toBe('Hello World');
    });

    it('should throw error for invalid messages', () => {
      expect(() => Validators.validateMessage('')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateMessage('   ')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateMessage('a'.repeat(1601))).toThrow(TalkSASAValidationError);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct API keys', () => {
      expect(Validators.validateApiKey('valid-api-key-123')).toBe('valid-api-key-123');
      expect(Validators.validateApiKey('  valid-api-key-123  ')).toBe('valid-api-key-123');
    });

    it('should accept API keys with pipe characters', () => {
      expect(Validators.validateApiKey('valid-api|key-123')).toBe('valid-api|key-123');
      expect(Validators.validateApiKey('api|key|with|pipes')).toBe('api|key|with|pipes');
    });

    it('should throw error for invalid API keys', () => {
      expect(() => Validators.validateApiKey('')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateApiKey('   ')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateApiKey('short')).toThrow(TalkSASAValidationError);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(Validators.validateEmail('test@example.com')).toBe(true);
      expect(Validators.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(Validators.validateEmail('invalid-email')).toBe(false);
      expect(Validators.validateEmail('test@')).toBe(false);
      expect(Validators.validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validateSchedule', () => {
    it('should validate correct schedules', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      
      expect(Validators.validateSchedule(futureDate.toISOString())).toBe(futureDate.toISOString());
    });

    it('should throw error for invalid schedules', () => {
      expect(() => Validators.validateSchedule('invalid-date')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateSchedule('')).toThrow(TalkSASAValidationError);
      
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      expect(() => Validators.validateSchedule(pastDate.toISOString())).toThrow(TalkSASAValidationError);
    });
  });

  describe('validatePriority', () => {
    it('should validate correct priorities', () => {
      expect(Validators.validatePriority('low')).toBe('low');
      expect(Validators.validatePriority('NORMAL')).toBe('normal');
      expect(Validators.validatePriority('HIGH')).toBe('high');
    });

    it('should throw error for invalid priorities', () => {
      expect(() => Validators.validatePriority('invalid')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validatePriority('')).toThrow(TalkSASAValidationError);
    });
  });

  describe('validateTemplateContent', () => {
    it('should validate correct template content', () => {
      expect(Validators.validateTemplateContent('Hello {{name}}!')).toBe('Hello {{name}}!');
      expect(Validators.validateTemplateContent('  Hello {{name}}!  ')).toBe('Hello {{name}}!');
    });

    it('should throw error for invalid template content', () => {
      expect(() => Validators.validateTemplateContent('')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateTemplateContent('   ')).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateTemplateContent('a'.repeat(1601))).toThrow(TalkSASAValidationError);
    });
  });

  describe('validateTemplateVariables', () => {
    it('should validate correct template variables', () => {
      expect(Validators.validateTemplateVariables(['name', 'code'])).toEqual(['name', 'code']);
      expect(Validators.validateTemplateVariables(['user_name', 'verification_code'])).toEqual(['user_name', 'verification_code']);
    });

    it('should throw error for invalid template variables', () => {
      expect(() => Validators.validateTemplateVariables(['123name'])).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateTemplateVariables(['name-'])).toThrow(TalkSASAValidationError);
      expect(() => Validators.validateTemplateVariables([''])).toThrow(TalkSASAValidationError);
    });
  });
});
