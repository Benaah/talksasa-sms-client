/**
 * TalkSASA SMS Gateway API Types
 */

export interface TalkSASAConfig {
  apiKey?: string;
  oauth2?: OAuth2Config;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export type VoiceLanguage = 
  | 'cy-gb' | 'da-dk' | 'de-de' | 'el-gr' | 'en-au' | 'en-gb' | 'en-gb-wls' 
  | 'en-in' | 'en-us' | 'es-es' | 'es-mx' | 'es-us' | 'fr-ca' | 'fr-fr' 
  | 'id-id' | 'is-is' | 'it-it' | 'ja-jp' | 'ko-kr' | 'ms-my' | 'nb-no' 
  | 'nl-nl' | 'pl-pl' | 'pt-br' | 'pt-pt' | 'ro-ro' | 'ru-ru' | 'sv-se' 
  | 'ta-in' | 'th-th' | 'tr-tr' | 'vi-vn' | 'zh-cn' | 'zh-hk';

export interface SMSMessage {
  recipient: string | string[];
  sender_id: string;
  type: 'plain';
  message: string;
  schedule_time?: string;
  dlt_template_id?: string;
}

export interface VoiceMessage {
  recipient: string;
  sender_id: string;
  type: 'voice';
  language: VoiceLanguage;
  gender: 'male' | 'female';
  message: string;
  schedule_time?: string;
}

export interface MMSMessage {
  recipient: string;
  sender_id: string;
  type: 'mms';
  media_url: string;
  message?: string;
  schedule_time?: string;
}

export interface WhatsAppMessage {
  recipient: string;
  sender_id: string;
  type: 'whatsapp';
  message: string;
  schedule_time?: string;
}

export interface CampaignMessage {
  contact_list_id: string | string[];
  sender_id: string;
  type: 'plain';
  message: string;
  schedule_time?: string;
  dlt_template_id?: string;
}

export interface SMSReport {
  uid: string;
  recipient: string;
  sender_id: string;
  message: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  cost?: number;
  error?: string;
}

export interface SMSResponse {
  status: 'success' | 'error';
  data?: SMSReport | SMSReport[];
  message?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface DeliveryReport {
  messageId: string;
  status: 'delivered' | 'failed' | 'pending' | 'unknown';
  timestamp: string;
  error?: string;
  cost?: number;
}

export interface AccountBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface AccountInfo {
  accountId: string;
  username: string;
  email: string;
  status: 'active' | 'suspended' | 'inactive';
  balance: AccountBalance;
  createdAt: string;
}

export interface ProfileInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  role?: string;
}

export interface SMSUnit {
  total_units: number;
  used_units: number;
  remaining_units: number;
  unit_type: string;
  last_updated?: string;
}

export interface ProfileResponse {
  status: 'success' | 'error';
  data?: ProfileInfo | SMSUnit;
  message?: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  content: string;
  variables?: string[];
}

export interface TalkSASAError extends Error {
  statusCode?: number;
  response?: any;
  isRetryable?: boolean;
}

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

// Contact API Types
export interface Contact {
  uid: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  group_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateContactRequest {
  phone: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateContactRequest {
  phone: string;
  first_name?: string;
  last_name?: string;
}

export interface ContactResponse {
  status: 'success' | 'error';
  data?: Contact | Contact[];
  message?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ContactGroup {
  uid: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateContactGroupRequest {
  name: string;
}

export interface ContactGroupResponse {
  status: 'success' | 'error';
  data?: ContactGroup | ContactGroup[];
  message?: string;
}

// OAuth 2.0 API Types
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface OAuth2TokenRequest {
  grant_type: 'client_credentials' | 'password' | 'refresh_token';
  client_id: string;
  client_secret: string;
  username?: string;
  password?: string;
  refresh_token?: string;
  scope?: string;
}

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  created_at?: number;
}

export interface OAuth2ErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface OAuth2TokenInfo {
  access_token: string;
  token_type: string;
  expires_at: number;
  scope?: string;
  refresh_token?: string;
  isExpired: boolean;
}

export interface OAuth2Client {
  getAccessToken(): Promise<string>;
  refreshToken(): Promise<OAuth2TokenResponse>;
  revokeToken(): Promise<boolean>;
  isTokenValid(): boolean;
  getTokenInfo(): OAuth2TokenInfo | null;
}
