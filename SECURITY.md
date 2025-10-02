# Security Policy

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Features

This package implements several security measures to protect against common vulnerabilities:

### Input Validation
- **Phone Number Validation**: Prevents injection attacks and validates format
- **Message Content Validation**: Checks for XSS patterns and limits length
- **API Key Validation**: Validates format and prevents injection
- **Length Limits**: Prevents DoS attacks through oversized inputs

### Error Handling
- **Information Leakage Prevention**: Sanitizes error messages to remove sensitive data
- **Secure Error Responses**: Doesn't expose internal system details
- **Consistent Error Types**: Uses specific error classes for different scenarios

### Dependencies
- **Regular Security Audits**: Uses `npm audit` to check for vulnerabilities
- **Security Linting**: ESLint security plugin to catch potential issues
- **Minimal Dependencies**: Only essential dependencies to reduce attack surface

### Authentication
- **OAuth 2.0 Support**: Secure token-based authentication
- **API Key Validation**: Proper validation of API keys
- **Token Management**: Automatic token refresh and secure storage

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@talksasa.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

### For Developers
1. **Keep Dependencies Updated**: Run `npm audit` regularly
2. **Use Environment Variables**: Never hardcode API keys or secrets
3. **Validate All Inputs**: Use the built-in validators
4. **Handle Errors Securely**: Don't expose sensitive information in error messages
5. **Use HTTPS**: Always use HTTPS for API communications

### For Production
1. **Regular Security Audits**: Run `npm run security:audit` before deployment
2. **Monitor Dependencies**: Set up alerts for security updates
3. **Use Least Privilege**: Run with minimal required permissions
4. **Log Security Events**: Monitor for suspicious activities
5. **Keep Node.js Updated**: Use supported Node.js versions (18+)

## Security Scripts

This package includes several security-focused npm scripts:

- `npm run security:audit` - Check for vulnerabilities
- `npm run security:audit:fix` - Fix automatically fixable vulnerabilities
- `npm run security:check` - Run audit and linting
- `npm run security:update` - Update dependencies

## Security Configuration

### ESLint Security Rules
The package uses `eslint-plugin-security` with the following rules:
- `detect-object-injection` - Warns about object injection vulnerabilities
- `detect-unsafe-regex` - Detects potentially unsafe regular expressions
- `detect-eval-with-expression` - Prevents eval() usage
- `detect-new-buffer` - Warns about deprecated Buffer constructor
- And many more security-focused rules

### Node.js Version
- **Minimum**: Node.js 18.0.0
- **Recommended**: Latest LTS version
- **Configuration**: `.nvmrc` and `.node-version` files included

## Changelog

### Security Updates
- **v1.0.0**: Initial security implementation
  - Input validation with security checks
  - Error message sanitization
  - Security-focused ESLint configuration
  - Dependency vulnerability scanning

## Contact

For security-related questions or concerns:
- Email: security@talksasa.com
- GitHub: [Create a private security advisory](https://github.com/Benaah/talksasa-sms-client/security/advisories/new)
