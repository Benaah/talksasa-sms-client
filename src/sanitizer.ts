/**
 * Input Sanitization Utilities
 * Prevents XSS, injection attacks, and other security vulnerabilities
 */

export class Sanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSql(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/'/g, "''")
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/;/g, '');
  }

  /**
   * Sanitize shell command input
   */
  static sanitizeShell(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove dangerous characters
    return input
      .replace(/[;&|`$(){}[\]\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[/\\]/g, '/') // Normalize path separators
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/+/g, '/'); // Remove multiple slashes
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    } catch {
      return '';
    }
  }

  /**
   * Remove null bytes and control characters
   */
  static removeControlCharacters(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/\0/g, '') // Remove null bytes
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }

  /**
   * Normalize and validate email
   */
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const normalized = input.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(normalized)) {
      return '';
    }

    return normalized;
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhoneNumber(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // Validate format
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
      return '';
    }

    return cleaned;
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const url = new URL(input);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }

      // Remove dangerous protocols from the string
      const sanitized = input
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/file:/gi, '')
        .replace(/ftp:/gi, '');

      return sanitized;
    } catch {
      return '';
    }
  }

  /**
   * Sanitize general text input
   */
  static sanitizeText(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return this.removeControlCharacters(input)
      .substring(0, maxLength)
      .trim();
  }

  /**
   * Check if input contains dangerous patterns
   */
  static containsDangerousPatterns(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /eval\(/i,
      /exec\(/i,
      /system\(/i,
      /\.\.\//,  // Directory traversal
      /union\s+select/i,  // SQL injection
      /drop\s+table/i,  // SQL injection
      /insert\s+into/i,  // SQL injection
      /delete\s+from/i,  // SQL injection
      /update\s+set/i,  // SQL injection
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i,
      /<input/i,
      /<textarea/i,
      /<select/i
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Escape regex special characters
   */
  static escapeRegex(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
