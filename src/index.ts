/**
 * TalkSASA SMS Gateway Client - Main Export
 */

// Main client class
export { TalkSASAClient } from './talksasa-client';

// OAuth 2.0 client class
export { TalkSASAOAuth2Client } from './oauth2-client';

// Types
export * from './types';

// Error classes
export {
  TalkSASAAPIError,
  TalkSASAValidationError,
  TalkSASANetworkError,
  TalkSASAAuthenticationError,
  TalkSASAQuotaExceededError,
  TalkSASAInsufficientBalanceError
} from './errors';

// Utility classes
export { Validators } from './validators';
export { Utils } from './utils';

// Default export
import { TalkSASAClient } from './talksasa-client';
export default TalkSASAClient;
