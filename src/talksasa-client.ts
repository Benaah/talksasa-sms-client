/**
 * TalkSASA SMS Gateway Client
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  TalkSASAConfig,
  SMSMessage,
  VoiceMessage,
  MMSMessage,
  WhatsAppMessage,
  CampaignMessage,
  SMSResponse,
  SMSReport,
  DeliveryReport,
  AccountBalance,
  AccountInfo,
  ProfileInfo,
  SMSUnit,
  SMSTemplate,
  CreateTemplateRequest,
  RetryOptions,
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactGroup,
  CreateContactGroupRequest,
} from './types';
import { Validators } from './validators';
import { Utils } from './utils';
import { TalkSASAOAuth2Client } from './oauth2-client';
import { RateLimiter } from './rate-limiter';
import { Sanitizer } from './sanitizer';
import {
  TalkSASAAPIError,
  TalkSASAValidationError,
  TalkSASAAuthenticationError,
  TalkSASAQuotaExceededError,
  TalkSASAInsufficientBalanceError
} from './errors';

export class TalkSASAClient {
  private apiKey?: string;
  private oauth2Client?: TalkSASAOAuth2Client;
  private baseUrl: string;
  private httpClient: AxiosInstance;
  private retryOptions: RetryOptions;
  private rateLimiter: RateLimiter;

  constructor(config: TalkSASAConfig) {
    // Validate authentication method
    if (!config.apiKey && !config.oauth2) {
      throw new TalkSASAValidationError('Either apiKey or oauth2 configuration is required');
    }

    if (config.apiKey && config.oauth2) {
      throw new TalkSASAValidationError('Cannot use both apiKey and oauth2 authentication methods');
    }

    // Set up authentication
    if (config.apiKey) {
      this.apiKey = Validators.validateApiKey(config.apiKey);
    } else if (config.oauth2) {
      this.oauth2Client = new TalkSASAOAuth2Client(config.oauth2);
    }

    this.baseUrl = config.baseUrl || 'https://bulksms.talksasa.com/api/v3';
    this.retryOptions = {
      maxRetries: config.retries || 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    };
    this.rateLimiter = new RateLimiter({
      maxRequests: 100, // 100 requests per minute
      windowMs: 60000,  // 1 minute window
      blockDurationMs: 300000 // 5 minute block if exceeded
    });

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TalkSASA-SMS-Client/1.0.0'
      }
    });

    // Add authentication header based on auth method
    if (this.apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Add request interceptor for OAuth 2.0 and logging
    this.httpClient.interceptors.request.use(
      async (config) => {
        console.debug(`[TalkSASA] Making ${config.method?.toUpperCase()} request to ${config.url}`);
        
        // Add OAuth 2.0 token if using OAuth authentication
        if (this.oauth2Client && !config.url?.includes('/oauth/')) {
          try {
            const accessToken = await this.oauth2Client.getAccessToken();
            config.headers.Authorization = `Bearer ${accessToken}`;
          } catch (error) {
            console.error('[TalkSASA] Failed to get OAuth token:', error);
            throw new TalkSASAAuthenticationError('Failed to obtain OAuth access token');
          }
        }
        
        return config;
      },
      (error) => {
        console.error('[TalkSASA] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        console.debug(`[TalkSASA] Response received: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('[TalkSASA] Response error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Send a single SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      // Validate input
      const validatedMessage = this.validateSMSMessage(message);
      
      const payload = {
        recipient: Array.isArray(validatedMessage.recipient) 
          ? validatedMessage.recipient.join(',')
          : validatedMessage.recipient,
        sender_id: Validators.validateSenderId(validatedMessage.sender_id),
        type: 'plain',
        message: Validators.validateMessage(validatedMessage.message),
        schedule_time: validatedMessage.schedule_time ? Validators.validateSchedule(validatedMessage.schedule_time) : undefined,
        dlt_template_id: validatedMessage.dlt_template_id
      };

      const response = await this.makeRequest('POST', '/sms/send', payload);
      return this.parseSMSResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send campaign SMS to contact lists
   */
  async sendCampaign(campaign: CampaignMessage): Promise<SMSResponse> {
    try {
      // Validate input
      const validatedCampaign = this.validateCampaignMessage(campaign);
      
      const payload = {
        contact_list_id: Array.isArray(validatedCampaign.contact_list_id) 
          ? validatedCampaign.contact_list_id.join(',')
          : validatedCampaign.contact_list_id,
        sender_id: Validators.validateSenderId(validatedCampaign.sender_id),
        type: 'plain',
        message: Validators.validateMessage(validatedCampaign.message),
        schedule_time: validatedCampaign.schedule_time ? Validators.validateSchedule(validatedCampaign.schedule_time) : undefined,
        dlt_template_id: validatedCampaign.dlt_template_id
      };

      const response = await this.makeRequest('POST', '/sms/campaign', payload);
      return this.parseSMSResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // ==================== VOICE API METHODS ====================

  /**
   * Send a voice message
   */
  async sendVoice(message: VoiceMessage): Promise<SMSResponse> {
    try {
      // Validate input
      const validatedMessage = this.validateVoiceMessage(message);
      
      const payload = {
        recipient: Validators.formatPhoneNumber(validatedMessage.recipient),
        sender_id: Validators.validateSenderId(validatedMessage.sender_id),
        type: 'voice',
        language: Validators.validateVoiceLanguage(validatedMessage.language),
        gender: Validators.validateVoiceGender(validatedMessage.gender),
        message: Validators.validateMessage(validatedMessage.message),
        schedule_time: validatedMessage.schedule_time ? Validators.validateSchedule(validatedMessage.schedule_time) : undefined
      };

      const response = await this.makeRequest('POST', '/sms/send', payload);
      return this.parseSMSResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send an MMS message
   */
  async sendMMS(message: MMSMessage): Promise<SMSResponse> {
    try {
      // Validate input
      const validatedMessage = this.validateMMSMessage(message);
      
      const payload = {
        recipient: Validators.formatPhoneNumber(validatedMessage.recipient),
        sender_id: Validators.validateSenderId(validatedMessage.sender_id),
        type: 'mms',
        media_url: Validators.validateMediaUrl(validatedMessage.media_url),
        message: validatedMessage.message ? Validators.validateMessage(validatedMessage.message) : undefined,
        schedule_time: validatedMessage.schedule_time ? Validators.validateSchedule(validatedMessage.schedule_time) : undefined
      };

      const response = await this.makeRequest('POST', '/sms/send', payload);
      return this.parseSMSResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a WhatsApp message
   */
  async sendWhatsApp(message: WhatsAppMessage): Promise<SMSResponse> {
    try {
      // Validate input
      const validatedMessage = this.validateWhatsAppMessage(message);
      
      const payload = {
        recipient: Validators.formatPhoneNumber(validatedMessage.recipient),
        sender_id: Validators.validateSenderId(validatedMessage.sender_id),
        type: 'whatsapp',
        message: Validators.validateMessage(validatedMessage.message),
        schedule_time: validatedMessage.schedule_time ? Validators.validateSchedule(validatedMessage.schedule_time) : undefined
      };

      const response = await this.makeRequest('POST', '/sms/send', payload);
      return this.parseSMSResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get SMS message by UID
   */
  async getSMS(uid: string): Promise<SMSReport> {
    try {
      if (!uid || typeof uid !== 'string') {
        throw new TalkSASAValidationError('SMS UID is required');
      }

      const response = await this.makeRequest('GET', `/sms/${uid}`);
      return this.parseSMSReportResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all SMS messages
   */
  async getAllSMS(): Promise<{ messages: SMSReport[]; pagination?: any }> {
    try {
      const response = await this.makeRequest('GET', '/sms');
      const data = response.data;
      
      return {
        messages: Array.isArray(data.data) ? data.data : [data.data],
        pagination: data.pagination
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get delivery report for a message
   */
  async getDeliveryReport(messageId: string): Promise<DeliveryReport> {
    try {
      if (!messageId || typeof messageId !== 'string') {
        throw new TalkSASAValidationError('Message ID is required');
      }

      const response = await this.makeRequest('GET', `/sms/delivery-report/${messageId}`);
      
      return {
        messageId: response.data.messageId || messageId,
        status: response.data.status || 'unknown',
        timestamp: response.data.timestamp || new Date().toISOString(),
        error: response.data.error,
        cost: response.data.cost
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<AccountBalance> {
    try {
      const response = await this.makeRequest('GET', '/account/balance');
      
      return {
        balance: response.data.balance || 0,
        currency: response.data.currency || 'USD',
        lastUpdated: response.data.lastUpdated || new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<AccountInfo> {
    try {
      const response = await this.makeRequest('GET', '/account/info');
      
      return {
        accountId: response.data.accountId || '',
        username: response.data.username || '',
        email: response.data.email || '',
        status: response.data.status || 'inactive',
        balance: {
          balance: response.data.balance?.balance || 0,
          currency: response.data.balance?.currency || 'USD',
          lastUpdated: response.data.balance?.lastUpdated || new Date().toISOString()
        },
        createdAt: response.data.createdAt || new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  // ==================== PROFILE API METHODS ====================

  /**
   * Get user profile information
   */
  async getProfile(): Promise<ProfileInfo> {
    try {
      const response = await this.makeRequest('GET', '/me');
      return this.parseProfileResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get SMS unit balance
   */
  async getSMSUnits(): Promise<SMSUnit> {
    try {
      const response = await this.makeRequest('GET', '/balance');
      return this.parseSMSUnitResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create SMS template
   */
  async createTemplate(template: CreateTemplateRequest): Promise<SMSTemplate> {
    try {
      const validatedTemplate = {
        name: template.name.trim(),
        content: Validators.validateTemplateContent(template.content),
        variables: template.variables ? Validators.validateTemplateVariables(template.variables) : []
      };

      const response = await this.makeRequest('POST', '/templates', validatedTemplate);
      
      return {
        id: response.data.id || Utils.generateMessageId(),
        name: response.data.name || validatedTemplate.name,
        content: response.data.content || validatedTemplate.content,
        variables: response.data.variables || validatedTemplate.variables,
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all SMS templates
   */
  async getTemplates(): Promise<SMSTemplate[]> {
    try {
      const response = await this.makeRequest('GET', '/templates');
      return response.data.templates || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<SMSTemplate> {
    try {
      if (!templateId || typeof templateId !== 'string') {
        throw new TalkSASAValidationError('Template ID is required');
      }

      const response = await this.makeRequest('GET', `/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update SMS template
   */
  async updateTemplate(templateId: string, updates: Partial<CreateTemplateRequest>): Promise<SMSTemplate> {
    try {
      if (!templateId || typeof templateId !== 'string') {
        throw new TalkSASAValidationError('Template ID is required');
      }

      const validatedUpdates: any = {};
      
      if (updates.name) {
        validatedUpdates.name = updates.name.trim();
      }
      
      if (updates.content) {
        validatedUpdates.content = Validators.validateTemplateContent(updates.content);
      }
      
      if (updates.variables) {
        validatedUpdates.variables = Validators.validateTemplateVariables(updates.variables);
      }

      const response = await this.makeRequest('PUT', `/templates/${templateId}`, validatedUpdates);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete SMS template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      if (!templateId || typeof templateId !== 'string') {
        throw new TalkSASAValidationError('Template ID is required');
      }

      await this.makeRequest('DELETE', `/templates/${templateId}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send SMS using template
   */
  async sendTemplateSMS(templateId: string, to: string | string[], variables: Record<string, string> = {}): Promise<SMSResponse> {
    try {
      if (!templateId || typeof templateId !== 'string') {
        throw new TalkSASAValidationError('Template ID is required');
      }

      const payload = {
        templateId,
        to: Array.isArray(to) 
          ? to.map(Validators.formatPhoneNumber)
          : Validators.formatPhoneNumber(to),
        variables
      };

      const response = await this.makeRequest('POST', '/sms/send-template', payload);
      return this.parseSMSResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // ==================== CONTACTS API METHODS ====================

  /**
   * Create a new contact in a group
   */
  async createContact(groupId: string, contact: CreateContactRequest): Promise<Contact> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);
      const validatedContact = {
        phone: Validators.validateContactPhone(contact.phone),
        first_name: Validators.validateContactName(contact.first_name || '', 'first_name'),
        last_name: Validators.validateContactName(contact.last_name || '', 'last_name')
      };

      const response = await this.makeRequest('POST', `/contacts/${validatedGroupId}/store`, validatedContact);
      return this.parseContactResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a contact by UID
   */
  async getContact(groupId: string, contactUid: string): Promise<Contact> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);
      const validatedContactUid = Validators.validateContactUid(contactUid);

      const response = await this.makeRequest('POST', `/contacts/${validatedGroupId}/search/${validatedContactUid}`);
      return this.parseContactResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a contact
   */
  async updateContact(groupId: string, contactUid: string, updates: UpdateContactRequest): Promise<Contact> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);
      const validatedContactUid = Validators.validateContactUid(contactUid);
      const validatedUpdates = {
        phone: Validators.validateContactPhone(updates.phone),
        first_name: Validators.validateContactName(updates.first_name || '', 'first_name'),
        last_name: Validators.validateContactName(updates.last_name || '', 'last_name')
      };

      const response = await this.makeRequest('PATCH', `/contacts/${validatedGroupId}/update/${validatedContactUid}`, validatedUpdates);
      return this.parseContactResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a contact
   */
  async deleteContact(groupId: string, contactUid: string): Promise<boolean> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);
      const validatedContactUid = Validators.validateContactUid(contactUid);

      await this.makeRequest('DELETE', `/contacts/${validatedGroupId}/delete/${validatedContactUid}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all contacts in a group
   */
  async getContacts(groupId: string): Promise<{ contacts: Contact[]; pagination?: any }> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);

      const response = await this.makeRequest('POST', `/contacts/${validatedGroupId}/all`);
      const data = response.data;
      
      return {
        contacts: Array.isArray(data.data) ? data.data : [data.data],
        pagination: data.pagination
      };
    } catch (error) {
      throw error;
    }
  }

  // ==================== CONTACT GROUPS API METHODS ====================

  /**
   * Create a new contact group
   */
  async createContactGroup(group: CreateContactGroupRequest): Promise<ContactGroup> {
    try {
      const validatedGroup = {
        name: Validators.validateContactGroupName(group.name)
      };

      const response = await this.makeRequest('POST', '/contacts', validatedGroup);
      return this.parseContactGroupResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all contact groups
   */
  async getContactGroups(): Promise<ContactGroup[]> {
    try {
      const response = await this.makeRequest('GET', '/contacts');
      const data = response.data;
      return Array.isArray(data.data) ? data.data : [data.data];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a contact group by UID
   */
  async getContactGroup(groupId: string): Promise<ContactGroup> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);

      const response = await this.makeRequest('POST', `/contacts/${validatedGroupId}/show`);
      return this.parseContactGroupResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a contact group
   */
  async updateContactGroup(groupId: string, updates: Partial<CreateContactGroupRequest>): Promise<ContactGroup> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);
      const validatedUpdates: any = {};

      if (updates.name !== undefined) {
        validatedUpdates.name = Validators.validateContactGroupName(updates.name);
      }

      const response = await this.makeRequest('PATCH', `/contacts/${validatedGroupId}`, validatedUpdates);
      return this.parseContactGroupResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a contact group
   */
  async deleteContactGroup(groupId: string): Promise<boolean> {
    try {
      const validatedGroupId = Validators.validateGroupUid(groupId);

      await this.makeRequest('DELETE', `/contacts/${validatedGroupId}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // ==================== OAUTH 2.0 METHODS ====================

  /**
   * Get OAuth 2.0 client instance (only available when using OAuth authentication)
   */
  getOAuth2Client(): TalkSASAOAuth2Client | null {
    return this.oauth2Client || null;
  }

  /**
   * Check if using OAuth 2.0 authentication
   */
  isUsingOAuth2(): boolean {
    return this.oauth2Client !== undefined;
  }

  /**
   * Get current OAuth 2.0 token info (only available when using OAuth authentication)
   */
  getOAuth2TokenInfo() {
    if (!this.oauth2Client) {
      throw new TalkSASAValidationError('OAuth 2.0 client not available. This method only works with OAuth authentication.');
    }
    return this.oauth2Client.getTokenInfo();
  }

  /**
   * Check if OAuth 2.0 token is valid (only available when using OAuth authentication)
   */
  isOAuth2TokenValid(): boolean {
    if (!this.oauth2Client) {
      return false;
    }
    return this.oauth2Client.isTokenValid();
  }

  /**
   * Refresh OAuth 2.0 token (only available when using OAuth authentication)
   */
  async refreshOAuth2Token() {
    if (!this.oauth2Client) {
      throw new TalkSASAValidationError('OAuth 2.0 client not available. This method only works with OAuth authentication.');
    }
    return await this.oauth2Client.refreshToken();
  }

  /**
   * Revoke OAuth 2.0 token (only available when using OAuth authentication)
   */
  async revokeOAuth2Token(): Promise<boolean> {
    if (!this.oauth2Client) {
      throw new TalkSASAValidationError('OAuth 2.0 client not available. This method only works with OAuth authentication.');
    }
    return await this.oauth2Client.revokeToken();
  }

  /**
   * Parse contact response
   */
  private parseContactResponse(response: AxiosResponse): Contact {
    const data = response.data;
    
    if (data.status === 'error') {
      throw new TalkSASAAPIError(data.message || 'Contact operation failed');
    }

    if (!data.data) {
      throw new TalkSASAAPIError('Invalid contact response format');
    }

    return {
      uid: data.data.uid || '',
      phone: data.data.phone || '',
      first_name: data.data.first_name,
      last_name: data.data.last_name,
      group_id: data.data.group_id || '',
      created_at: data.data.created_at,
      updated_at: data.data.updated_at
    };
  }

  /**
   * Parse contact group response
   */
  private parseContactGroupResponse(response: AxiosResponse): ContactGroup {
    const data = response.data;
    
    if (data.status === 'error') {
      throw new TalkSASAAPIError(data.message || 'Contact group operation failed');
    }

    if (!data.data) {
      throw new TalkSASAAPIError('Invalid contact group response format');
    }

    return {
      uid: data.data.uid || '',
      name: data.data.name || '',
      created_at: data.data.created_at,
      updated_at: data.data.updated_at
    };
  }

  /**
   * Parse profile response
   */
  private parseProfileResponse(response: AxiosResponse): ProfileInfo {
    const data = response.data;
    
    if (data.status === 'error') {
      throw new TalkSASAAPIError(data.message || 'Profile operation failed');
    }

    if (!data.data) {
      throw new TalkSASAAPIError('Invalid profile response format');
    }

    return {
      id: data.data.id || '',
      name: data.data.name || '',
      email: data.data.email || '',
      phone: data.data.phone,
      country: data.data.country,
      timezone: data.data.timezone,
      created_at: data.data.created_at,
      updated_at: data.data.updated_at,
      status: data.data.status,
      role: data.data.role
    };
  }

  /**
   * Parse SMS unit response
   */
  private parseSMSUnitResponse(response: AxiosResponse): SMSUnit {
    const data = response.data;
    
    if (data.status === 'error') {
      throw new TalkSASAAPIError(data.message || 'SMS unit operation failed');
    }

    if (!data.data) {
      throw new TalkSASAAPIError('Invalid SMS unit response format');
    }

    return {
      total_units: data.data.total_units || 0,
      used_units: data.data.used_units || 0,
      remaining_units: data.data.remaining_units || 0,
      unit_type: data.data.unit_type || 'SMS',
      last_updated: data.data.last_updated
    };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<AxiosResponse> {
    // Security: Rate limiting check
    const clientId = this.apiKey || 'oauth2';
    if (!this.rateLimiter.isAllowed(clientId)) {
      throw new TalkSASAQuotaExceededError('Rate limit exceeded. Please try again later.');
    }

    // Security: Sanitize input data
    const sanitizedData = this.sanitizeRequestData(data);

    const config: AxiosRequestConfig = {
      method: method as any,
      url: endpoint,
      data: sanitizedData,
      headers: {
        'User-Agent': 'TalkSASA-SMS-Client/1.0.0'
      }
    };

    return Utils.retry(async () => {
      return await this.httpClient.request(config);
    }, this.retryOptions);
  }

  /**
   * Sanitize request data to prevent injection attacks
   */
  private sanitizeRequestData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Sanitize key
      const sanitizedKey = Sanitizer.sanitizeText(key, 100);
      if (!sanitizedKey) continue;

      // Sanitize value based on type
      if (typeof value === 'string') {
        // Check for dangerous patterns first
        if (Sanitizer.containsDangerousPatterns(value)) {
          throw new TalkSASAValidationError('Request contains potentially dangerous content');
        }
        sanitized[sanitizedKey] = Sanitizer.sanitizeText(value, 1000);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[sanitizedKey] = this.sanitizeRequestData(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate SMS message
   */
  private validateSMSMessage(message: SMSMessage): SMSMessage {
    if (!message) {
      throw new TalkSASAValidationError('Message is required');
    }

    if (!message.recipient) {
      throw new TalkSASAValidationError('Recipient phone number is required');
    }

    if (!message.sender_id) {
      throw new TalkSASAValidationError('Sender ID is required');
    }

    if (!message.message) {
      throw new TalkSASAValidationError('Message content is required');
    }

    return message;
  }

  /**
   * Validate campaign message
   */
  private validateCampaignMessage(campaign: CampaignMessage): CampaignMessage {
    if (!campaign) {
      throw new TalkSASAValidationError('Campaign is required');
    }

    if (!campaign.contact_list_id) {
      throw new TalkSASAValidationError('Contact list ID is required');
    }

    if (!campaign.sender_id) {
      throw new TalkSASAValidationError('Sender ID is required');
    }

    if (!campaign.message) {
      throw new TalkSASAValidationError('Message content is required');
    }

    return campaign;
  }

  /**
   * Validate voice message
   */
  private validateVoiceMessage(message: VoiceMessage): VoiceMessage {
    if (!message) {
      throw new TalkSASAValidationError('Voice message is required');
    }

    if (!message.recipient) {
      throw new TalkSASAValidationError('Recipient phone number is required');
    }

    if (!message.sender_id) {
      throw new TalkSASAValidationError('Sender ID is required');
    }

    if (!message.language) {
      throw new TalkSASAValidationError('Voice language is required');
    }

    if (!message.gender) {
      throw new TalkSASAValidationError('Voice gender is required');
    }

    if (!message.message) {
      throw new TalkSASAValidationError('Message content is required');
    }

    return message;
  }

  /**
   * Validate MMS message
   */
  private validateMMSMessage(message: MMSMessage): MMSMessage {
    if (!message) {
      throw new TalkSASAValidationError('MMS message is required');
    }

    if (!message.recipient) {
      throw new TalkSASAValidationError('Recipient phone number is required');
    }

    if (!message.sender_id) {
      throw new TalkSASAValidationError('Sender ID is required');
    }

    if (!message.media_url) {
      throw new TalkSASAValidationError('Media URL is required for MMS');
    }

    return message;
  }

  /**
   * Validate WhatsApp message
   */
  private validateWhatsAppMessage(message: WhatsAppMessage): WhatsAppMessage {
    if (!message) {
      throw new TalkSASAValidationError('WhatsApp message is required');
    }

    if (!message.recipient) {
      throw new TalkSASAValidationError('Recipient phone number is required');
    }

    if (!message.sender_id) {
      throw new TalkSASAValidationError('Sender ID is required');
    }

    if (!message.message) {
      throw new TalkSASAValidationError('Message content is required');
    }

    return message;
  }

  /**
   * Parse SMS response
   */
  private parseSMSResponse(response: AxiosResponse): SMSResponse {
    const data = response.data;
    
    if (data.status === 'error') {
      throw new TalkSASAAPIError(data.message || 'SMS operation failed');
    }

    return {
      status: data.status || 'success',
      data: data.data,
      message: data.message,
      pagination: data.pagination
    };
  }

  /**
   * Parse SMS report response
   */
  private parseSMSReportResponse(response: AxiosResponse): SMSReport {
    const data = response.data;
    
    if (data.status === 'error') {
      throw new TalkSASAAPIError(data.message || 'SMS report operation failed');
    }

    if (!data.data) {
      throw new TalkSASAAPIError('Invalid SMS report response format');
    }

    return {
      uid: data.data.uid || '',
      recipient: data.data.recipient || '',
      sender_id: data.data.sender_id || '',
      message: data.data.message || '',
      status: data.data.status || '',
      created_at: data.data.created_at,
      updated_at: data.data.updated_at,
      cost: data.data.cost,
      error: data.data.error
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): TalkSASAAPIError {
    if (error.response) {
      const statusCode = error.response.status;
      const responseData = error.response.data;
      
      // Security: Sanitize error messages to prevent information leakage
      const sanitizedMessage = this.sanitizeErrorMessage(responseData?.message || 'API request failed');
      
      switch (statusCode) {
        case 401:
          return new TalkSASAAuthenticationError('Authentication failed');
        case 402:
          return new TalkSASAInsufficientBalanceError('Insufficient balance');
        case 429:
          return new TalkSASAQuotaExceededError('Quota exceeded');
        default:
          return new TalkSASAAPIError(
            sanitizedMessage,
            statusCode,
            responseData,
            statusCode >= 500
          );
      }
    }
    
    if (error.request) {
      return Utils.createNetworkError(error);
    }
    
    // Security: Don't expose internal error details
    return new TalkSASAAPIError('An unexpected error occurred');
  }

  /**
   * Sanitize error messages to prevent information leakage
   */
  private sanitizeErrorMessage(message: string): string {
    if (!message || typeof message !== 'string') {
      return 'Unknown error';
    }

    // Remove potential sensitive information
    let sanitized = message
      .replace(/password[=:]\s*[^\s,]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s,]+/gi, 'token=***')
      .replace(/key[=:]\s*[^\s,]+/gi, 'key=***')
      .replace(/secret[=:]\s*[^\s,]+/gi, 'secret=***');

    // Limit message length
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500) + '...';
    }

    return sanitized;
  }
}
