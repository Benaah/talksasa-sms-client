/**
 * TalkSASA SMS Gateway Validation Utilities
 */

import { TalkSASAValidationError } from './errors';

export class Validators {
  /**
   * Validates phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (7-15 digits as per international standards)
    if (cleaned.length < 7 || cleaned.length > 15) {
      return false;
    }
    
    // Check if it starts with a valid country code or local number
    return /^[1-9]\d{6,14}$/.test(cleaned);
  }

  /**
   * Validates and formats phone number
   */
  static formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) {
      throw new TalkSASAValidationError('Phone number is required');
    }

    // Security: Check for potential injection patterns
    const dangerousChars = ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`', '$', '\\'];
    for (const char of dangerousChars) {
      if (phoneNumber.includes(char)) {
        throw new TalkSASAValidationError('Phone number contains invalid characters');
      }
    }

    // Security: Limit phone number length to prevent DoS
    if (phoneNumber.length > 50) {
      throw new TalkSASAValidationError('Phone number is too long');
    }

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new TalkSASAValidationError(
        `Invalid phone number format: ${phoneNumber}. Phone number must be 7-15 digits long.`
      );
    }

    // Security: Validate phone number format to prevent injection
    if (!/^[0-9]{7,15}$/.test(cleaned)) {
      throw new TalkSASAValidationError('Phone number contains invalid characters');
    }

    // Add + prefix if not present
    return phoneNumber.startsWith('+') ? phoneNumber : `+${cleaned}`;
  }

  /**
   * Validates SMS message content
   */
  static validateMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      throw new TalkSASAValidationError('Message content is required');
    }

    // Security: Limit message length to prevent DoS
    if (message.length > 10000) {
      throw new TalkSASAValidationError('Message is too long for processing');
    }

    if (message.trim().length === 0) {
      throw new TalkSASAValidationError('Message cannot be empty');
    }

    // Check for maximum length (160 characters for single SMS, 1600 for concatenated)
    if (message.length > 1600) {
      throw new TalkSASAValidationError(
        'Message too long. Maximum length is 1600 characters.'
      );
    }

    // Security: Check for potential XSS patterns
    const trimmed = message.trim();
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onmouseover=/i,
      /vbscript:/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        throw new TalkSASAValidationError('Message contains potentially unsafe content');
      }
    }

    return trimmed;
  }

  /**
   * Validates API key format
   */
  static validateApiKey(apiKey: string): string {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new TalkSASAValidationError('API key is required');
    }

    // Security: Limit API key length to prevent DoS
    if (apiKey.length > 200) {
      throw new TalkSASAValidationError('API key is too long for processing');
    }

    if (apiKey.trim().length === 0) {
      throw new TalkSASAValidationError('API key cannot be empty');
    }

    // Basic format validation (adjust based on actual API key format)
    if (apiKey.length < 10) {
      throw new TalkSASAValidationError('API key appears to be invalid');
    }

    // Security: Validate API key format to prevent injection
    const trimmed = apiKey.trim();
    
    // Allow most printable ASCII characters (common in API keys, tokens, etc.)
    // Exclude control characters, newlines, and other dangerous characters
    if (!/^[\x20-\x7E]+$/.test(trimmed)) {
      throw new TalkSASAValidationError('API key contains invalid characters');
    }
    
    // Security: Check for common attack patterns
    const attackPatterns = [
      /\.\./,  // Directory traversal
      /\/\//,  // Protocol confusion
      /<script/i,  // XSS
      /javascript:/i,  // XSS
      /eval\(/i,  // Code injection
      /exec\(/i,  // Command injection
      /system\(/i,  // Command injection
      /shell/i,  // Command injection
      /cmd/i,  // Command injection
      /powershell/i,  // Command injection
      /bash/i,  // Command injection
      /sh\s/i  // Command injection
    ];
    
    for (const pattern of attackPatterns) {
      if (pattern.test(trimmed)) {
        throw new TalkSASAValidationError('API key contains potentially malicious content');
      }
    }

    return trimmed;
  }

  /**
   * Validates email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates schedule format (ISO 8601)
   */
  static validateSchedule(schedule: string): string {
    if (!schedule) {
      throw new TalkSASAValidationError('Schedule is required');
    }

    const date = new Date(schedule);
    if (isNaN(date.getTime())) {
      throw new TalkSASAValidationError(
        'Invalid schedule format. Use ISO 8601 format (e.g., 2024-12-31T23:59:59Z)'
      );
    }

    // Check if the schedule is in the future
    if (date <= new Date()) {
      throw new TalkSASAValidationError('Schedule must be in the future');
    }

    return schedule;
  }

  /**
   * Validates priority level
   */
  static validatePriority(priority: string): 'low' | 'normal' | 'high' {
    const validPriorities = ['low', 'normal', 'high'];
    
    if (!validPriorities.includes(priority.toLowerCase())) {
      throw new TalkSASAValidationError(
        `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      );
    }

    return priority.toLowerCase() as 'low' | 'normal' | 'high';
  }

  /**
   * Validates template content
   */
  static validateTemplateContent(content: string): string {
    if (!content || typeof content !== 'string') {
      throw new TalkSASAValidationError('Template content is required');
    }

    if (content.trim().length === 0) {
      throw new TalkSASAValidationError('Template content cannot be empty');
    }

    if (content.length > 1600) {
      throw new TalkSASAValidationError(
        'Template content too long. Maximum length is 1600 characters.'
      );
    }

    return content.trim();
  }

  /**
   * Validates template variables
   */
  static validateTemplateVariables(variables: string[]): string[] {
    if (!Array.isArray(variables)) {
      throw new TalkSASAValidationError('Template variables must be an array');
    }

    const validVariables = variables.filter(variable => {
      if (typeof variable !== 'string') {
        return false;
      }
      // Variable names should be alphanumeric and start with a letter
      return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable);
    });

    if (validVariables.length !== variables.length) {
      throw new TalkSASAValidationError(
        'Invalid template variables. Variable names must be alphanumeric and start with a letter.'
      );
    }

    return validVariables;
  }

  /**
   * Validates contact phone number
   */
  static validateContactPhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      throw new TalkSASAValidationError('Contact phone number is required');
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length < 7 || cleaned.length > 15) {
      throw new TalkSASAValidationError(
        `Invalid contact phone number format: ${phone}. Phone number must be 7-15 digits long.`
      );
    }

    return cleaned;
  }

  /**
   * Validates contact name
   */
  static validateContactName(name: string, fieldName: string = 'name'): string {
    if (name === undefined || name === null) {
      return '';
    }

    if (typeof name !== 'string') {
      throw new TalkSASAValidationError(`${fieldName} must be a string`);
    }

    const trimmed = name.trim();
    
    if (trimmed.length > 100) {
      throw new TalkSASAValidationError(
        `${fieldName} is too long. Maximum length is 100 characters.`
      );
    }

    return trimmed;
  }

  /**
   * Validates contact group name
   */
  static validateContactGroupName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new TalkSASAValidationError('Contact group name is required');
    }

    const trimmed = name.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('Contact group name cannot be empty');
    }

    if (trimmed.length > 100) {
      throw new TalkSASAValidationError(
        'Contact group name is too long. Maximum length is 100 characters.'
      );
    }

    return trimmed;
  }


  /**
   * Validates contact UID
   */
  static validateContactUid(uid: string): string {
    if (!uid || typeof uid !== 'string') {
      throw new TalkSASAValidationError('Contact UID is required');
    }

    const trimmed = uid.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('Contact UID cannot be empty');
    }

    return trimmed;
  }

  /**
   * Validates group UID
   */
  static validateGroupUid(groupId: string): string {
    if (!groupId || typeof groupId !== 'string') {
      throw new TalkSASAValidationError('Group UID is required');
    }

    const trimmed = groupId.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('Group UID cannot be empty');
    }

    return trimmed;
  }

  /**
   * Validates OAuth client ID
   */
  static validateClientId(clientId: string): string {
    if (!clientId || typeof clientId !== 'string') {
      throw new TalkSASAValidationError('OAuth client ID is required');
    }

    const trimmed = clientId.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('OAuth client ID cannot be empty');
    }

    if (trimmed.length < 10) {
      throw new TalkSASAValidationError('OAuth client ID appears to be invalid');
    }

    return trimmed;
  }

  /**
   * Validates OAuth client secret
   */
  static validateClientSecret(clientSecret: string): string {
    if (!clientSecret || typeof clientSecret !== 'string') {
      throw new TalkSASAValidationError('OAuth client secret is required');
    }

    const trimmed = clientSecret.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('OAuth client secret cannot be empty');
    }

    if (trimmed.length < 10) {
      throw new TalkSASAValidationError('OAuth client secret appears to be invalid');
    }

    return trimmed;
  }

  /**
   * Validates OAuth grant type
   */
  static validateGrantType(grantType: string): 'client_credentials' | 'password' | 'refresh_token' {
    const validGrantTypes = ['client_credentials', 'password', 'refresh_token'];
    
    if (!validGrantTypes.includes(grantType)) {
      throw new TalkSASAValidationError(
        `Invalid grant type. Must be one of: ${validGrantTypes.join(', ')}`
      );
    }

    return grantType as 'client_credentials' | 'password' | 'refresh_token';
  }

  /**
   * Validates OAuth scope
   */
  static validateScope(scope: string): string {
    if (scope === undefined || scope === null) {
      return '';
    }

    if (typeof scope !== 'string') {
      throw new TalkSASAValidationError('OAuth scope must be a string');
    }

    const trimmed = scope.trim();
    
    if (trimmed.length > 200) {
      throw new TalkSASAValidationError(
        'OAuth scope is too long. Maximum length is 200 characters.'
      );
    }

    return trimmed;
  }

  /**
   * Validates OAuth username (for password grant)
   */
  static validateOAuthUsername(username: string): string {
    if (!username || typeof username !== 'string') {
      throw new TalkSASAValidationError('OAuth username is required for password grant');
    }

    const trimmed = username.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('OAuth username cannot be empty');
    }

    if (trimmed.length > 100) {
      throw new TalkSASAValidationError(
        'OAuth username is too long. Maximum length is 100 characters.'
      );
    }

    return trimmed;
  }

  /**
   * Validates OAuth password (for password grant)
   */
  static validateOAuthPassword(password: string): string {
    if (!password || typeof password !== 'string') {
      throw new TalkSASAValidationError('OAuth password is required for password grant');
    }

    const trimmed = password.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('OAuth password cannot be empty');
    }

    return trimmed;
  }

  /**
   * Validates OAuth refresh token
   */
  static validateRefreshToken(refreshToken: string): string {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new TalkSASAValidationError('OAuth refresh token is required');
    }

    const trimmed = refreshToken.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('OAuth refresh token cannot be empty');
    }

    return trimmed;
  }

  /**
   * Validates sender ID
   */
  static validateSenderId(senderId: string): string {
    if (!senderId || typeof senderId !== 'string') {
      throw new TalkSASAValidationError('Sender ID is required');
    }

    const trimmed = senderId.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('Sender ID cannot be empty');
    }

    if (trimmed.length > 11) {
      throw new TalkSASAValidationError(
        'Sender ID is too long. Maximum length is 11 characters.'
      );
    }

    return trimmed;
  }

  /**
   * Validates DLT template ID
   */
  static validateDLTTemplateId(dltTemplateId: string): string {
    if (!dltTemplateId || typeof dltTemplateId !== 'string') {
      throw new TalkSASAValidationError('DLT template ID is required');
    }

    const trimmed = dltTemplateId.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('DLT template ID cannot be empty');
    }

    return trimmed;
  }

  /**
   * Validates voice language
   */
  static validateVoiceLanguage(language: string): string {
    const validLanguages = [
      'cy-gb', 'da-dk', 'de-de', 'el-gr', 'en-au', 'en-gb', 'en-gb-wls',
      'en-in', 'en-us', 'es-es', 'es-mx', 'es-us', 'fr-ca', 'fr-fr',
      'id-id', 'is-is', 'it-it', 'ja-jp', 'ko-kr', 'ms-my', 'nb-no',
      'nl-nl', 'pl-pl', 'pt-br', 'pt-pt', 'ro-ro', 'ru-ru', 'sv-se',
      'ta-in', 'th-th', 'tr-tr', 'vi-vn', 'zh-cn', 'zh-hk'
    ];

    if (!language || typeof language !== 'string') {
      throw new TalkSASAValidationError('Voice language is required');
    }

    const trimmed = language.trim().toLowerCase();
    
    if (!validLanguages.includes(trimmed)) {
      throw new TalkSASAValidationError(
        `Invalid voice language. Must be one of: ${validLanguages.join(', ')}`
      );
    }

    return trimmed;
  }

  /**
   * Validates voice gender
   */
  static validateVoiceGender(gender: string): 'male' | 'female' {
    const validGenders = ['male', 'female'];
    
    if (!gender || typeof gender !== 'string') {
      throw new TalkSASAValidationError('Voice gender is required');
    }

    const trimmed = gender.trim().toLowerCase();
    
    if (!validGenders.includes(trimmed)) {
      throw new TalkSASAValidationError(
        `Invalid voice gender. Must be one of: ${validGenders.join(', ')}`
      );
    }

    return trimmed as 'male' | 'female';
  }

  /**
   * Validates MMS media URL
   */
  static validateMediaUrl(mediaUrl: string): string {
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      throw new TalkSASAValidationError('Media URL is required for MMS');
    }

    const trimmed = mediaUrl.trim();
    
    if (trimmed.length === 0) {
      throw new TalkSASAValidationError('Media URL cannot be empty');
    }

    // Security: Basic URL validation with protocol restrictions
    try {
      const url = new URL(trimmed);
      
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new TalkSASAValidationError('Media URL must use HTTP or HTTPS protocol');
      }
      
      // Security: Check for dangerous protocols
      // eslint-disable-next-line no-script-url
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
      const hasDangerousProtocol = dangerousProtocols.some(proto => 
        trimmed.toLowerCase().startsWith(proto)
      );
      if (hasDangerousProtocol) {
        throw new TalkSASAValidationError('Media URL uses a dangerous protocol');
      }
      
      // Security: Check for localhost or internal IPs (optional - depends on use case)
      const hostname = url.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        throw new TalkSASAValidationError('Media URL cannot point to local or internal addresses');
      }
      
    } catch (error) {
      if (error instanceof TalkSASAValidationError) {
        throw error;
      }
      throw new TalkSASAValidationError('Invalid media URL format');
    }

    // Check if URL points to an image (basic check)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => 
      trimmed.toLowerCase().includes(ext)
    );

    if (!hasImageExtension) {
      throw new TalkSASAValidationError(
        'Media URL must point to an image file. Supported formats: jpg, jpeg, png, gif, bmp, webp'
      );
    }

    return trimmed;
  }
}
