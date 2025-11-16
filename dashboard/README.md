# TalkSASA Account Management Dashboard

A professional, production-ready web interface for managing your TalkSASA SMS account without visiting the TalkSASA website.

## Features

- **Dashboard Overview**: View account statistics, balance, and group counts at a glance
- **Profile Management**: View and manage your account profile information
- **SMS Balance**: Monitor total, used, and remaining SMS units with visual progress indicator
- **Contact Groups**: Create, view, and delete contact groups
- **Contact Management**: Add, view, and delete contacts within groups
- **SMS Sending**: Send SMS messages with character counter and scheduling
- **Templates**: Create and manage SMS templates with variable support
- **Settings**: Configure API authentication (API Key or OAuth 2.0)

## Installation

The dashboard is bundled with the `@benaah/talksasa-sms-client` package. After installing the package, the dashboard files are available in your `node_modules/@benaah/talksasa-sms-client/dashboard/` directory.

```bash
npm install @benaah/talksasa-sms-client
```

## Usage

### Option 1: Serve Directly from node_modules

You can serve the dashboard files directly from your node_modules using a static file server:

```bash
# Using npx serve
npx serve node_modules/@benaah/talksasa-sms-client/dashboard

# Using Python
cd node_modules/@benaah/talksasa-sms-client/dashboard
python -m http.server 8080

# Using Node.js http-server
npx http-server node_modules/@benaah/talksasa-sms-client/dashboard
```

### Option 2: Copy to Your Project

Copy the dashboard folder to your project's public directory:

```bash
# Copy dashboard files
cp -r node_modules/@benaah/talksasa-sms-client/dashboard ./public/talksasa-dashboard

# Or on Windows
xcopy /E /I node_modules\@benaah\talksasa-sms-client\dashboard public\talksasa-dashboard
```

### Option 3: Integrate with Your Web Application

Include the dashboard in your existing web application by copying the files to your static assets folder and linking them in your HTML.

## Configuration

On first launch:

1. Click the **Settings** icon in the sidebar
2. Choose your authentication method:
   - **API Key**: Enter your TalkSASA API key
   - **OAuth 2.0**: Enter your client ID and client secret
3. **Enter your Default Sender ID**: This will be automatically filled in the SMS sending form (max 11 characters)
4. (Optional) Update the Base URL if using a different endpoint
5. Click **Save Configuration**

Your configuration (including API key and default Sender ID) is stored in browser localStorage for convenience.

### Configuration Fields

- **Authentication Method**: Choose between API Key (Bearer Token) or OAuth 2.0
- **API Key**: Your TalkSASA API key (required for API Key authentication)
- **Client ID / Client Secret**: OAuth 2.0 credentials (required for OAuth authentication)
- **Default Sender ID**: Your default sender ID for SMS messages (max 11 characters). This will be pre-filled when sending SMS.
- **Base URL**: TalkSASA API base URL (default: `https://bulksms.talksasa.com/api/v3`)

## API Endpoints Used

The dashboard interacts with the following TalkSASA API endpoints:

- `GET /me` - Retrieve profile information
- `GET /balance` - Get SMS balance
- `GET /contacts` - List contact groups
- `POST /contacts` - Create contact group
- `DELETE /contacts/{groupId}` - Delete contact group
- `POST /contacts/{groupId}/all` - Get all contacts in group
- `POST /contacts/{groupId}/store` - Add contact to group
- `DELETE /contacts/{groupId}/delete/{contactUid}` - Delete contact
- `POST /sms/send` - Send SMS message
- `GET /templates` - List templates
- `POST /templates` - Create template
- `DELETE /templates/{id}` - Delete template

## Security Considerations

### Production Deployment

**Important**: This dashboard stores your API credentials in browser localStorage. For production use:

1. **Use OAuth 2.0** instead of API keys when possible
2. **Implement server-side proxy** to avoid exposing credentials in browser
3. **Enable HTTPS** for all production deployments
4. **Set proper CORS headers** on your TalkSASA API
5. **Implement rate limiting** to prevent abuse
6. **Use environment-specific configurations**

### Recommended Architecture

For production applications, consider this architecture:

```
Browser (Dashboard) 
    ↓ (HTTPS)
Your Backend Server (Proxy)
    ↓ (API Key/OAuth)
TalkSASA API
```

Your backend server should:
- Store API credentials securely (environment variables, secrets manager)
- Validate incoming requests
- Proxy requests to TalkSASA API
- Implement authentication/authorization
- Add rate limiting and logging

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Files

- `index.html` - Main dashboard HTML structure
- `styles.css` - Professional styling and responsive design
- `dashboard.js` - JavaScript functionality and API integration
- `README.md` - This file

## Customization

### Styling

Modify `styles.css` to match your brand:

```css
:root {
    --primary: #4f46e5;        /* Primary brand color */
    --primary-dark: #4338ca;   /* Hover/active state */
    --success: #10b981;        /* Success messages */
    --warning: #f59e0b;        /* Warning states */
    --danger: #ef4444;         /* Error states */
    /* ... other variables */
}
```

### Base URL

Change the default API base URL in `dashboard.js`:

```javascript
let config = {
    apiKey: '',
    baseUrl: 'https://your-custom-endpoint.com/api/v3',
    authMethod: 'apiKey'
};
```

## Development

To modify the dashboard:

1. Clone the repository
2. Navigate to the `dashboard` folder
3. Make your changes
4. Test locally using any HTTP server
5. Submit a pull request

## Troubleshooting

### "Failed to load profile/balance/contacts"

- Check that your API key is correct in Settings
- Verify the Base URL is correct
- Check browser console for error messages
- Ensure CORS is properly configured

### "API request failed"

- Verify your API credentials are valid
- Check your internet connection
- Ensure you have sufficient SMS balance (for sending operations)
- Review TalkSASA API documentation for endpoint requirements

### Modal doesn't close

- Click outside the modal
- Refresh the page if modals are stuck

## License

This dashboard is part of the `@benaah/talksasa-sms-client` package and follows the same license.

## Support

For issues related to:
- **Dashboard functionality**: Open an issue on the GitHub repository
- **TalkSASA API**: Contact TalkSASA support at https://talksasa.com
- **Package usage**: Check the main package README

## Version

Dashboard Version: 1.1.0
Compatible with: TalkSASA API v3

---

Built with ❤️ for the TalkSASA developer community
