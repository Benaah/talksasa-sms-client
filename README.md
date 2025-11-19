# TalkSASA SMS Client

A comprehensive JavaScript/TypeScript client for the TalkSASA SMS Gateway API. This package provides an easy-to-use interface for sending SMS, Voice, MMS, and WhatsApp messages, managing templates, contacts, profiles, and handling delivery reports.

## Features

-  **Send SMS** - Send individual and bulk SMS messages
-  **Send Voice** - Send voice messages with language and gender selection
-  **Send MMS** - Send multimedia messages with images
-  **Send WhatsApp** - Send WhatsApp messages
-  **Campaigns** - Send messages to contact lists
-  **Scheduled Messages** - Schedule all message types for future delivery
-  **Template Management** - Create, read, update, and delete SMS templates
-  **Delivery Reports** - Track message delivery status
-  **Account Management** - Check balance and account information
-  **Profile Management** - Get user profile and SMS unit information
-  **Contacts Management** - Create, read, update, and delete contacts
-  **Contact Groups** - Organize contacts into groups
-  **OAuth 2.0 Authentication** - Secure authentication with automatic token refresh
-  **Retry Logic** - Automatic retry with exponential backoff
-  **TypeScript Support** - Full TypeScript definitions included
-  **Input Validation** - Comprehensive validation for all inputs
-  **Error Handling** - Detailed error classes and messages
-  **Logging** - Built-in request/response logging

## Installation

```bash
npm install @benaah/talksasa-sms-client
```

## Quick Start

```javascript
const { TalkSASAClient } = require('@benaah/talksasa-sms-client');

// Initialize the client
const client = new TalkSASAClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://bulksms.talksasa.com/api/v3/',
  timeout: 30000, // Optional, defaults to 30 seconds
  retries: 3 // Optional, defaults to 3 retries
});

// Send different types of messages
async function sendMessages() {
  try {
    // Send SMS
    const smsResponse = await client.sendSMS({
      recipient: '+1234567890',
      sender_id: 'YourApp',
      type: 'plain',
      message: 'Hello from TalkSASA!'
    });
    console.log('SMS sent:', smsResponse);

    // Send Voice
    const voiceResponse = await client.sendVoice({
      recipient: '+1234567890',
      sender_id: 'YourApp',
      type: 'voice',
      language: 'en-us',
      gender: 'female',
      message: 'Hello! This is a voice message.'
    });
    console.log('Voice sent:', voiceResponse);

    // Send MMS
    const mmsResponse = await client.sendMMS({
      recipient: '+1234567890',
      sender_id: 'YourApp',
      type: 'mms',
      media_url: 'https://via.placeholder.com/150.jpg',
      message: 'Check out this image!'
    });
    console.log('MMS sent:', mmsResponse);

    // Send WhatsApp
    const whatsappResponse = await client.sendWhatsApp({
      recipient: '+1234567890',
      sender_id: 'YourApp',
      type: 'whatsapp',
      message: 'Hello via WhatsApp!'
    });
    console.log('WhatsApp sent:', whatsappResponse);

  } catch (error) {
    console.error('Failed to send message:', error.message);
  }
}
```

## TypeScript Usage

```typescript
import { TalkSASAClient, SMSMessage, SMSResponse } from '@benaah/talksasa-sms-client';

const client = new TalkSASAClient({
  apiKey: 'your-api-key-here'
});

const message: SMSMessage = {
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'plain',
  message: 'Hello from TalkSASA!'
};

const response: SMSResponse = await client.sendSMS(message);
```

## API Reference

### Constructor

```javascript
new TalkSASAClient(config)
```

**Parameters:**
- `config.apiKey` (string, required): Your TalkSASA API key
- `config.baseUrl` (string, optional): API base URL (default: 'https://bulksms.talksasa.com/api/v3/')
- `config.timeout` (number, optional): Request timeout in milliseconds (default: 30000)
- `config.retries` (number, optional): Number of retry attempts (default: 3)

### Methods

#### Send Single SMS

```javascript
await client.sendSMS(message)
```

**Parameters:**
- `message.recipient` (string|string[]): Recipient phone number(s)
- `message.sender_id` (string): Sender ID (max 11 characters)
- `message.type` (string): Message type ('plain' for SMS)
- `message.message` (string): SMS content
- `message.schedule_time` (string, optional): RFC3339 date string for scheduled sending
- `message.dlt_template_id` (string, optional): DLT template ID

#### Send Campaign SMS

```javascript
await client.sendCampaign(campaign)
```

**Parameters:**
- `campaign.contact_list_id` (string|string[]): Contact list ID(s)
- `campaign.sender_id` (string): Sender ID (max 11 characters)
- `campaign.type` (string): Message type ('plain' for SMS)
- `campaign.message` (string): SMS content
- `campaign.schedule_time` (string, optional): RFC3339 date string for scheduled sending
- `campaign.dlt_template_id` (string, optional): DLT template ID

#### Send Voice Message

```javascript
await client.sendVoice(message)
```

**Parameters:**
- `message.recipient` (string): Recipient phone number
- `message.sender_id` (string): Sender ID (max 11 characters)
- `message.type` (string): Message type ('voice' for voice messages)
- `message.language` (string): Voice language (e.g., 'en-us', 'en-gb', 'fr-fr')
- `message.gender` (string): Voice gender ('male' or 'female')
- `message.message` (string): Message content to be spoken
- `message.schedule_time` (string, optional): RFC3339 date string for scheduled sending

#### Send MMS Message

```javascript
await client.sendMMS(message)
```

**Parameters:**
- `message.recipient` (string): Recipient phone number
- `message.sender_id` (string): Sender ID (max 11 characters)
- `message.type` (string): Message type ('mms' for MMS messages)
- `message.media_url` (string): URL of the image to send (supports jpg, jpeg, png, gif, bmp, webp)
- `message.message` (string, optional): Text message to accompany the image
- `message.schedule_time` (string, optional): RFC3339 date string for scheduled sending

#### Send WhatsApp Message

```javascript
await client.sendWhatsApp(message)
```

**Parameters:**
- `message.recipient` (string): Recipient phone number
- `message.sender_id` (string): Sender ID (max 11 characters)
- `message.type` (string): Message type ('whatsapp' for WhatsApp messages)
- `message.message` (string): Message content to send
- `message.schedule_time` (string, optional): RFC3339 date string for scheduled sending

#### Get SMS Message

```javascript
await client.getSMS(uid)
```

**Parameters:**
- `uid` (string): SMS UID returned from send operation

#### Get All SMS Messages

```javascript
await client.getAllSMS()
```

**Returns:** Object with `messages` array and optional `pagination` info

#### Get User Profile

```javascript
await client.getProfile()
```

**Returns:** User profile information including name, email, status, etc.

#### Get SMS Units

```javascript
await client.getSMSUnits()
```

**Returns:** SMS unit balance information including total, used, and remaining units

#### Get Delivery Report

```javascript
await client.getDeliveryReport(messageId)
```

**Parameters:**
- `messageId` (string): Message ID returned from send operation

#### Account Management

```javascript
// Get account balance
const balance = await client.getAccountBalance();

// Get account information
const info = await client.getAccountInfo();
```

#### Template Management

```javascript
// Create template
const template = await client.createTemplate({
  name: 'Welcome Message',
  content: 'Welcome {{name}}! Your code is {{code}}.',
  variables: ['name', 'code']
});

// Get all templates
const templates = await client.getTemplates();

// Get specific template
const template = await client.getTemplate(templateId);

// Update template
const updatedTemplate = await client.updateTemplate(templateId, {
  content: 'Updated welcome message for {{name}}!'
});

// Delete template
await client.deleteTemplate(templateId);

// Send SMS using template
const response = await client.sendTemplateSMS(templateId, '+1234567890', {
  name: 'John',
  code: '12345'
});
```

## Error Handling

The client provides specific error classes for different scenarios:

```javascript
const {
  TalkSASAAPIError,
  TalkSASAValidationError,
  TalkSASANetworkError,
  TalkSASAAuthenticationError,
  TalkSASAQuotaExceededError,
  TalkSASAInsufficientBalanceError
} = require('@benaah/talksasa-sms-client');

try {
  await client.sendSMS(message);
} catch (error) {
  if (error instanceof TalkSASAAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof TalkSASAInsufficientBalanceError) {
    console.error('Insufficient account balance');
  } else if (error instanceof TalkSASAValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof TalkSASANetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('API error:', error.message);
  }
}
```

## Examples

### Basic SMS Sending

```javascript
const { TalkSASAClient } = require('@benaah/talksasa-sms-client');

const client = new TalkSASAClient({
  apiKey: process.env.TALKSASA_API_KEY
});

// Send to single recipient
await client.sendSMS({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'plain',
  message: 'Hello World!'
});

// Send to multiple recipients
await client.sendSMS({
  recipient: ['+1234567890', '+0987654321'],
  sender_id: 'YourApp',
  type: 'plain',
  message: 'Hello Everyone!'
});
```

### Scheduled SMS

```javascript
// Send SMS tomorrow at 9 AM
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

await client.sendSMS({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'plain',
  message: 'Reminder: Meeting tomorrow at 10 AM',
  schedule_time: tomorrow.toISOString()
});
```

### Campaign SMS

```javascript
// Send campaign to contact lists
await client.sendCampaign({
  contact_list_id: '6415907d0d37a',
  sender_id: 'YourApp',
  type: 'plain',
  message: 'Special offer for our customers!'
});

// Send to multiple contact lists
await client.sendCampaign({
  contact_list_id: ['6415907d0d37a', '6415907d0d7a6'],
  sender_id: 'YourApp',
  type: 'plain',
  message: 'Special offer for our customers!'
});
```

### View SMS Messages

```javascript
// Get specific SMS by UID
const sms = await client.getSMS('606812e63f78b');
console.log('SMS status:', sms.status);

// Get all SMS messages
const { messages, pagination } = await client.getAllSMS();
console.log(`Found ${messages.length} messages`);
```

### Profile Management

```javascript
// Get user profile information
const profile = await client.getProfile();
console.log('User:', profile.name, profile.email);
console.log('Status:', profile.status);
console.log('Country:', profile.country);

// Get SMS unit balance
const smsUnits = await client.getSMSUnits();
console.log(`SMS Units - Total: ${smsUnits.total_units}, Used: ${smsUnits.used_units}, Remaining: ${smsUnits.remaining_units}`);
console.log('Unit Type:', smsUnits.unit_type);
```

### Voice Messages

```javascript
// Send a voice message
await client.sendVoice({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'voice',
  language: 'en-us',
  gender: 'female',
  message: 'Hello! This is a voice message from TalkSASA.'
});

// Send scheduled voice message
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

await client.sendVoice({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'voice',
  language: 'en-gb',
  gender: 'male',
  message: 'Good morning! This is your scheduled voice reminder.',
  schedule_time: tomorrow.toISOString()
});
```

### MMS Messages

```javascript
// Send an MMS message with image
await client.sendMMS({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'mms',
  media_url: 'https://via.placeholder.com/150.jpg',
  message: 'Check out this image!'
});

// Send MMS without text message
await client.sendMMS({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'mms',
  media_url: 'https://example.com/image.png'
});

// Send scheduled MMS
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(10, 0, 0, 0);

await client.sendMMS({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'mms',
  media_url: 'https://example.com/promotional-image.jpg',
  message: 'Special offer starting tomorrow!',
  schedule_time: tomorrow.toISOString()
});
```

### WhatsApp Messages

```javascript
// Send a WhatsApp message
await client.sendWhatsApp({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'whatsapp',
  message: 'Hello! This is a WhatsApp message from TalkSASA.'
});

// Send scheduled WhatsApp message
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(14, 0, 0, 0);

await client.sendWhatsApp({
  recipient: '+1234567890',
  sender_id: 'YourApp',
  type: 'whatsapp',
  message: 'Reminder: Your appointment is tomorrow at 2 PM.',
  schedule_time: tomorrow.toISOString()
});
```

### Using Templates

```javascript
// Create a template
const template = await client.createTemplate({
  name: 'OTP Message',
  content: 'Your verification code is {{code}}. Valid for {{minutes}} minutes.',
  variables: ['code', 'minutes']
});

// Send using template
await client.sendTemplateSMS(template.id, '+1234567890', {
  code: '123456',
  minutes: '5'
});
```

### Bulk SMS with Different Messages

```javascript
await client.sendBulkSMS({
  messages: [
    {
      to: '+1234567890',
      message: 'Hello John!',
      from: 'Company'
    },
    {
      to: '+0987654321',
      message: 'Hello Jane!',
      from: 'Company'
    }
  ]
});
```

### Error Handling with Retry

```javascript
const client = new TalkSASAClient({
  apiKey: 'your-api-key',
  retries: 5, // Retry up to 5 times
  timeout: 60000 // 60 second timeout
});

try {
  const response = await client.sendSMS({
    to: '+1234567890',
    message: 'Important message'
  });
  console.log('Message sent:', response.messageId);
} catch (error) {
  if (error.isRetryable) {
    console.log('Error is retryable, will retry automatically');
  } else {
    console.error('Non-retryable error:', error.message);
  }
}
```

### OAuth 2.0 Authentication

```javascript
const { TalkSASAClient } = require('@benaah/talksasa-sms-client');

// Initialize with OAuth 2.0
const client = new TalkSASAClient({
  oauth2: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  }
});

// Send SMS (OAuth token is automatically managed)
await client.sendSMS({
  to: '+1234567890',
  message: 'Hello from TalkSASA with OAuth!'
});

// Check OAuth token status
if (client.isUsingOAuth2()) {
  const tokenInfo = client.getOAuth2TokenInfo();
  console.log('Token expires at:', new Date(tokenInfo.expires_at));
}
```

### Contacts Management

```javascript
// Create a contact group
const group = await client.createContactGroup({
  name: 'VIP Customers'
});

// Add contacts to the group
const contact1 = await client.createContact(group.uid, {
  phone: '+1234567890',
  first_name: 'John',
  last_name: 'Doe'
});

const contact2 = await client.createContact(group.uid, {
  phone: '+0987654321',
  first_name: 'Jane',
  last_name: 'Smith'
});

// Get all contacts in a group
const { contacts, pagination } = await client.getContacts(group.uid);
console.log(`Found ${contacts.length} contacts`);

// Update a contact
const updatedContact = await client.updateContact(group.uid, contact1.uid, {
  phone: '+1111111111',
  first_name: 'Johnny'
});

// Send SMS to all contacts in a group
for (const contact of contacts) {
  await client.sendSMS({
    to: contact.phone,
    message: `Hello ${contact.first_name}! Special offer just for you.`
  });
}
```

### Advanced OAuth 2.0 Usage

```javascript
const { TalkSASAClient, TalkSASAOAuth2Client } = require('@benaah/talksasa-sms-client');

// Create OAuth 2.0 client directly
const oauthClient = new TalkSASAOAuth2Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// Get access token manually
const accessToken = await oauthClient.getAccessToken();
console.log('Access token:', accessToken);

// Check token validity
if (oauthClient.isTokenValid()) {
  console.log('Token is valid');
} else {
  console.log('Token is expired or invalid');
}

// Refresh token
const newToken = await oauthClient.refreshToken();
console.log('New token:', newToken.access_token);

// Revoke token
await oauthClient.revokeToken();
console.log('Token revoked');

// Use with main client
const client = new TalkSASAClient({
  oauth2: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  }
});
```

## Configuration

### Environment Variables

```bash
TALKSASA_API_KEY=your-api-key-here
TALKSASA_BASE_URL=https://bulksms.talksasa.com/api/v3/
TALKSASA_TIMEOUT=30000
TALKSASA_RETRIES=3
```

### Using Environment Variables

```javascript
const client = new TalkSASAClient({
  apiKey: process.env.TALKSASA_API_KEY,
  baseUrl: process.env.TALKSASA_BASE_URL,
  timeout: parseInt(process.env.TALKSASA_TIMEOUT) || 30000,
  retries: parseInt(process.env.TALKSASA_RETRIES) || 3
});
```

## Account Management Dashboard

This package includes a professional web-based dashboard for managing your TalkSASA account without visiting the TalkSASA website directly.

### Dashboard Features

- **Dashboard Overview**: View account statistics, balance, and group counts
- **Profile Management**: View and manage your account profile
- **SMS Balance**: Monitor SMS units with visual progress indicator
- **Contact Groups**: Create, view, and delete contact groups
- **Contact Management**: Add, view, and delete contacts within groups
- **SMS Sending**: Send SMS messages with character counter and scheduling
- **Templates**: Create and manage SMS templates with variables
- **Settings**: Configure API authentication (API Key or OAuth 2.0) and default Sender ID

### Dashboard Configuration

The dashboard allows you to configure:

1. **API Key or OAuth 2.0 credentials** for authentication
2. **Default Sender ID** - Your preferred sender ID that will be automatically filled when sending SMS (max 11 characters)
3. **Base URL** - API endpoint (default: `https://bulksms.talksasa.com/api/v3`)

All settings are saved in browser localStorage for convenience.

### Using the Dashboard

The dashboard files are included in the `dashboard/` folder of the package.

#### Option 1: Serve from node_modules

```bash
# Using npx serve
npx serve node_modules/@benaah/talksasa-sms-client/dashboard

# Using Python
cd node_modules/@benaah/talksasa-sms-client/dashboard
python -m http.server 8080

# Using Node.js http-server
npx http-server node_modules/@benaah/talksasa-sms-client/dashboard -p 8080
```

#### Option 2: Copy to Your Project

```bash
# Copy dashboard to your public folder
cp -r node_modules/@benaah/talksasa-sms-client/dashboard ./public/talksasa-admin

# Or on Windows
xcopy /E /I node_modules\@benaah\talksasa-sms-client\dashboard public\talksasa-admin
```

#### Option 3: Integrate with Your Application

Copy the dashboard files (`index.html`, `styles.css`, `dashboard.js`) to your application's static assets and serve them through your web server.

### Dashboard Configuration

1. Open the dashboard in your browser
2. Click the Settings icon in the sidebar
3. Choose authentication method (API Key or OAuth 2.0)
4. Enter your credentials
5. Save configuration

**Security Note**: For production deployments, implement a server-side proxy to avoid exposing API credentials in the browser. See `dashboard/README.md` for detailed security recommendations.

### Dashboard Files

- `dashboard/index.html` - Main dashboard interface
- `dashboard/styles.css` - Professional styling
- `dashboard/dashboard.js` - JavaScript functionality
- `dashboard/README.md` - Detailed dashboard documentation

## Development

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

-  Email: support@talksasa.com
-  Issues: [GitHub Issues](https://github.com/Benaah/talksasa-sms-client/issues)
-  Documentation: [TalkSASA API Docs](https://docs.talksasa.com)

## Changelog

### 2.0.0
- Fixed API key validation to support TalkSASA API key format with pipe character (`|`)
- Improved API key validation to accept all printable ASCII characters including pipes
- Enhanced security while maintaining compatibility with various API key formats
- Added test coverage for API keys with pipe characters
- Published to npm public registry

### 1.1.0
- Fixed API key validation to support TalkSASA API key format with pipe character 
- Improved API key validation to accept all printable ASCII characters
- Enhanced security while maintaining compatibility with various API key formats

### 1.0.0
- Initial release
- Single and bulk SMS sending
- Template management
- Delivery reports
- Account management
- TypeScript support
- Comprehensive error handling
- Retry logic with exponential backoff
