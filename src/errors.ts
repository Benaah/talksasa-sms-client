/**
 * TalkSASA SMS Gateway Error Classes
 */

import { TalkSASAError } from './types';

export class TalkSASAAPIError extends Error implements TalkSASAError {
  public statusCode?: number;
  public response?: any;
  public isRetryable: boolean;

  constructor(
    message: string,
    statusCode?: number,
    response?: any,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'TalkSASAAPIError';
    this.statusCode = statusCode;
    this.response = response;
    this.isRetryable = isRetryable;
  }
}

export class TalkSASAValidationError extends Error implements TalkSASAError {
  public statusCode = 400;
  public isRetryable = false;

  constructor(message: string) {
    super(message);
    this.name = 'TalkSASAValidationError';
  }
}

export class TalkSASANetworkError extends Error implements TalkSASAError {
  public statusCode?: number;
  public isRetryable = true;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'TalkSASANetworkError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class TalkSASAAuthenticationError extends Error implements TalkSASAError {
  public statusCode = 401;
  public isRetryable = false;

  constructor(message: string = 'Invalid API key or authentication failed') {
    super(message);
    this.name = 'TalkSASAAuthenticationError';
  }
}

export class TalkSASAQuotaExceededError extends Error implements TalkSASAError {
  public statusCode = 429;
  public isRetryable = true;

  constructor(message: string = 'SMS quota exceeded') {
    super(message);
    this.name = 'TalkSASAQuotaExceededError';
  }
}

export class TalkSASAInsufficientBalanceError extends Error implements TalkSASAError {
  public statusCode = 402;
  public isRetryable = false;

  constructor(message: string = 'Insufficient account balance') {
    super(message);
    this.name = 'TalkSASAInsufficientBalanceError';
  }
}
