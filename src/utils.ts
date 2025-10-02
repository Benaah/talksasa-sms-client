/**
 * TalkSASA SMS Gateway Utility Functions
 */

import { RetryOptions } from './types';
import { TalkSASANetworkError } from './errors';

export class Utils {
  /**
   * Sleep function for delays
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = { maxRetries: 3, retryDelay: 1000, backoffMultiplier: 2 }
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === options.maxRetries) {
          break;
        }

        // Don't retry if error is not retryable
        if (error && typeof error === 'object' && 'isRetryable' in error && !(error as any).isRetryable) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = options.retryDelay * Math.pow(options.backoffMultiplier, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Deep merge objects
   */
  static deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }
    
    return result;
  }

  /**
   * Check if value is an object
   */
  private static isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Generate unique message ID
   */
  static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format phone numbers array
   */
  static formatPhoneNumbers(phoneNumbers: string | string[]): string[] {
    if (typeof phoneNumbers === 'string') {
      return [phoneNumbers];
    }
    return phoneNumbers;
  }

  /**
   * Check if response indicates success
   */
  static isSuccessResponse(response: any): boolean {
    if (!response) return false;
    
    // Check common success indicators
    if (response.success === true) return true;
    if (response.status === 'success') return true;
    if (response.statusCode >= 200 && response.statusCode < 300) return true;
    
    return false;
  }

  /**
   * Extract error message from response
   */
  static extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      if (error.message) return error.message;
      if (error.error) return error.error;
      if (error.errorMessage) return error.errorMessage;
      if (error.details) return error.details;
    }
    
    return 'Unknown error occurred';
  }

  /**
   * Create network error
   */
  static createNetworkError(error: any): TalkSASANetworkError {
    const message = this.extractErrorMessage(error);
    return new TalkSASANetworkError(`Network error: ${message}`, error);
  }

  /**
   * Sanitize phone number for logging (hide sensitive parts)
   */
  static sanitizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber || phoneNumber.length < 4) {
      return '***';
    }
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 4) {
      return '***';
    }
    
    return cleaned.slice(0, 3) + '***' + cleaned.slice(-2);
  }

  /**
   * Sanitize API key for logging
   */
  static sanitizeApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '***';
    }
    
    return apiKey.slice(0, 4) + '***' + apiKey.slice(-4);
  }

  /**
   * Validate and format date string
   */
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date provided');
    }
    
    return dateObj.toISOString();
  }

  /**
   * Check if string is valid JSON
   */
  static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safe JSON parse
   */
  static safeJSONParse<T>(str: string, defaultValue: T): T {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }
}
