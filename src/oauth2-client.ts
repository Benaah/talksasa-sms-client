/**
 * TalkSASA OAuth 2.0 Client
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  OAuth2Config,
  OAuth2TokenRequest,
  OAuth2TokenResponse,
  OAuth2TokenInfo,
  OAuth2Client,
  RetryOptions
} from './types';
import { Validators } from './validators';
import { Utils } from './utils';
import {
  TalkSASAAPIError,
  TalkSASAValidationError,
  TalkSASAAuthenticationError
} from './errors';

export class TalkSASAOAuth2Client implements OAuth2Client {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;
  private retryOptions: RetryOptions;
  private tokenInfo: OAuth2TokenInfo | null = null;

  constructor(config: OAuth2Config) {
    this.clientId = Validators.validateClientId(config.clientId);
    this.clientSecret = Validators.validateClientSecret(config.clientSecret);
    this.baseUrl = config.baseUrl || 'https://bulksms.talksasa.com/api/v3';
    this.retryOptions = {
      maxRetries: config.retries || 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    };

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TalkSASA-OAuth2-Client/1.0.0'
      }
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        console.debug(`[TalkSASA OAuth2] Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[TalkSASA OAuth2] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        console.debug(`[TalkSASA OAuth2] Response received: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('[TalkSASA OAuth2] Response error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Get access token (with automatic refresh if needed)
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.tokenInfo && !this.isTokenExpired()) {
        return this.tokenInfo.access_token;
      }

      // Request new token
      const tokenResponse = await this.requestToken({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      // Store token info
      this.tokenInfo = {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
        scope: tokenResponse.scope,
        refresh_token: tokenResponse.refresh_token,
        isExpired: false
      };

      return tokenResponse.access_token;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request OAuth 2.0 token
   */
  async requestToken(request: OAuth2TokenRequest): Promise<OAuth2TokenResponse> {
    try {
      const validatedRequest = this.validateTokenRequest(request);

      const response = await this.makeRequest('POST', '/oauth/token', validatedRequest);
      return this.parseTokenResponse(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<OAuth2TokenResponse> {
    try {
      if (!this.tokenInfo?.refresh_token) {
        throw new TalkSASAValidationError('No refresh token available');
      }

      const tokenResponse = await this.requestToken({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.tokenInfo.refresh_token
      });

      // Update stored token info
      this.tokenInfo = {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
        scope: tokenResponse.scope,
        refresh_token: tokenResponse.refresh_token || this.tokenInfo.refresh_token,
        isExpired: false
      };

      return tokenResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(): Promise<boolean> {
    try {
      if (!this.tokenInfo?.access_token) {
        return true; // No token to revoke
      }

      await this.makeRequest('POST', '/oauth/revoke', {
        token: this.tokenInfo.access_token,
        token_type_hint: 'access_token'
      });

      // Clear stored token
      this.tokenInfo = null;
      return true;
    } catch (error) {
      // Even if revocation fails, clear the local token
      this.tokenInfo = null;
      throw error;
    }
  }

  /**
   * Check if current token is valid
   */
  isTokenValid(): boolean {
    return this.tokenInfo !== null && !this.isTokenExpired();
  }

  /**
   * Get current token info
   */
  getTokenInfo(): OAuth2TokenInfo | null {
    if (!this.tokenInfo) {
      return null;
    }

    return {
      ...this.tokenInfo,
      isExpired: this.isTokenExpired()
    };
  }

  /**
   * Request token with password grant
   */
  async requestTokenWithPassword(username: string, password: string, scope?: string): Promise<OAuth2TokenResponse> {
    try {
      const validatedUsername = Validators.validateOAuthUsername(username);
      const validatedPassword = Validators.validateOAuthPassword(password);
      const validatedScope = Validators.validateScope(scope || '');

      const tokenResponse = await this.requestToken({
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: validatedUsername,
        password: validatedPassword,
        scope: validatedScope || undefined
      });

      // Store token info
      this.tokenInfo = {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
        scope: tokenResponse.scope,
        refresh_token: tokenResponse.refresh_token,
        isExpired: false
      };

      return tokenResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set token info manually (useful for testing or when you have a token from elsewhere)
   */
  setTokenInfo(tokenInfo: OAuth2TokenInfo): void {
    this.tokenInfo = tokenInfo;
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.tokenInfo = null;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<AxiosResponse> {
    const config: AxiosRequestConfig = {
      method: method as any,
      url: endpoint,
      data
    };

    return Utils.retry(async () => {
      return await this.httpClient.request(config);
    }, this.retryOptions);
  }

  /**
   * Validate token request
   */
  private validateTokenRequest(request: OAuth2TokenRequest): OAuth2TokenRequest {
    const validatedRequest: OAuth2TokenRequest = {
      grant_type: Validators.validateGrantType(request.grant_type),
      client_id: Validators.validateClientId(request.client_id),
      client_secret: Validators.validateClientSecret(request.client_secret)
    };

    // Add optional fields based on grant type
    if (request.scope) {
      validatedRequest.scope = Validators.validateScope(request.scope);
    }

    if (request.grant_type === 'password') {
      if (!request.username || !request.password) {
        throw new TalkSASAValidationError('Username and password are required for password grant');
      }
      validatedRequest.username = Validators.validateOAuthUsername(request.username);
      validatedRequest.password = Validators.validateOAuthPassword(request.password);
    }

    if (request.grant_type === 'refresh_token') {
      if (!request.refresh_token) {
        throw new TalkSASAValidationError('Refresh token is required for refresh_token grant');
      }
      validatedRequest.refresh_token = Validators.validateRefreshToken(request.refresh_token);
    }

    return validatedRequest;
  }

  /**
   * Parse token response
   */
  private parseTokenResponse(response: AxiosResponse): OAuth2TokenResponse {
    const data = response.data;

    if (data.error) {
      throw new TalkSASAAuthenticationError(
        data.error_description || data.error || 'OAuth token request failed'
      );
    }

    if (!data.access_token) {
      throw new TalkSASAAPIError('Invalid token response: missing access_token');
    }

    return {
      access_token: data.access_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600,
      refresh_token: data.refresh_token,
      scope: data.scope,
      created_at: data.created_at || Date.now()
    };
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.tokenInfo) {
      return true;
    }

    // Add 5 minute buffer to account for clock skew
    const buffer = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (this.tokenInfo.expires_at - buffer);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): TalkSASAAPIError {
    if (error.response) {
      const statusCode = error.response.status;
      const responseData = error.response.data;
      
      switch (statusCode) {
        case 401:
          return new TalkSASAAuthenticationError(
            responseData?.error_description || responseData?.error || 'OAuth authentication failed'
          );
        case 400:
          return new TalkSASAAPIError(
            responseData?.error_description || responseData?.error || 'OAuth request failed',
            statusCode,
            responseData,
            false
          );
        default:
          return new TalkSASAAPIError(
            responseData?.error_description || responseData?.error || 'OAuth API request failed',
            statusCode,
            responseData,
            statusCode >= 500
          );
      }
    }
    
    if (error.request) {
      return Utils.createNetworkError(error);
    }
    
    return new TalkSASAAPIError(
      error.message || 'Unknown OAuth error occurred',
      undefined,
      undefined,
      true
    );
  }
}
