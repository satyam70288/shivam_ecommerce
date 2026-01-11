// emailTemplates.js
 const sendResetEmail = (resetLink, userName = "Valued Customer") => {
  const subject = "🔐 Reset Your Password - Shree Laxmi Shop";
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background-color: #f9fafb;
                line-height: 1.6;
                color: #374151;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            }
            .email-header {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                padding: 40px 30px;
                text-align: center;
            }
            .logo-container {
                margin-bottom: 20px;
            }
            .company-logo {
                height: 50px;
                width: auto;
            }
            .email-title {
                color: white;
                font-size: 24px;
                font-weight: 600;
                margin: 15px 0 5px;
            }
            .email-subtitle {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                font-weight: 400;
            }
            .email-body {
                padding: 50px 40px;
            }
            .greeting {
                font-size: 22px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 20px;
            }
            .message {
                color: #6b7280;
                margin-bottom: 30px;
                font-size: 16px;
                line-height: 1.7;
            }
            .reset-button-container {
                text-align: center;
                margin: 40px 0;
            }
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                text-decoration: none;
                padding: 18px 48px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }
            .reset-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }
            .expiry-notice {
                text-align: center;
                color: #9ca3af;
                font-size: 14px;
                margin: 20px 0 30px;
            }
            .highlight {
                color: #ef4444;
                font-weight: 600;
            }
            .manual-link-box {
                background: #f8fafc;
                border: 2px dashed #e2e8f0;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
            }
            .manual-link-label {
                color: #4b5563;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 10px;
            }
            .manual-link {
                color: #6366f1;
                word-break: break-all;
                font-family: 'SF Mono', Monaco, Consolas, monospace;
                font-size: 14px;
                line-height: 1.5;
            }
            .security-alert {
                background: #fef3c7;
                border-left: 5px solid #f59e0b;
                padding: 25px;
                border-radius: 10px;
                margin: 35px 0;
            }
            .alert-title {
                color: #92400e;
                font-weight: 600;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .alert-message {
                color: #b45309;
                font-size: 14px;
                line-height: 1.6;
            }
            .instructions {
                background: #ecfdf5;
                border-radius: 10px;
                padding: 25px;
                margin: 30px 0;
                border-left: 5px solid #10b981;
            }
            .instructions-title {
                color: #047857;
                font-weight: 600;
                margin-bottom: 15px;
            }
            .instructions-list {
                color: #065f46;
                padding-left: 20px;
            }
            .instructions-list li {
                margin-bottom: 8px;
            }
            .email-footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 30px;
                margin-top: 40px;
                text-align: center;
            }
            .footer-text {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 15px;
            }
            .support-link {
                color: #6366f1;
                text-decoration: none;
                font-weight: 500;
            }
            .signature {
                color: #111827;
                font-weight: 600;
                margin-top: 20px;
            }
            .copyright {
                color: #9ca3af;
                font-size: 12px;
                margin-top: 25px;
            }
            @media (max-width: 640px) {
                .email-header {
                    padding: 30px 20px;
                }
                .email-body {
                    padding: 40px 20px;
                }
                .reset-button {
                    padding: 16px 32px;
                    font-size: 15px;
                }
                .company-logo {
                    height: 40px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header with Logo -->
            <div class="email-header">
                <div class="logo-container">
                    <img src="https://shivam-ecommerce.vercel.app/assets/shivam_latest_logo-B8WToGYo.png" 
                         alt="Shivam Ecommerce Logo" 
                         class="company-logo">
                </div>
                <h1 class="email-title">Password Reset Request</h1>
                <p class="email-subtitle">Secure your account with a new password</p>
            </div>
            
            <!-- Email Body -->
            <div class="email-body">
                <h2 class="greeting">Hello ${userName},</h2>
                
                <p class="message">
                    We received a request to reset your password for your Shivam Ecommerce account. 
                    To create a new password, please click the button below:
                </p>
                
                <!-- Reset Button -->
                <div class="reset-button-container">
                    <a href="${resetLink}" class="reset-button" target="_blank">
                        🔐 Reset My Password
                    </a>
                </div>
                
                <p class="expiry-notice">
                    ⏰ This link will expire in <span class="highlight">1 hour</span> for security reasons.
                </p>
                
                <!-- Manual Link -->
                <div class="manual-link-box">
                    <div class="manual-link-label">If the button doesn't work, copy and paste this link:</div>
                    <div class="manual-link">${resetLink}</div>
                </div>
                
                <!-- Instructions -->
                <div class="instructions">
                    <div class="instructions-title">📝 How to create a strong password:</div>
                    <ul class="instructions-list">
                        <li>Use at least 8 characters</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Add numbers and special characters</li>
                        <li>Avoid personal information</li>
                        <li>Don't reuse old passwords</li>
                    </ul>
                </div>
                
                <!-- Security Alert -->
                <div class="security-alert">
                    <div class="alert-title">
                        <span>⚠️</span> Security Notice
                    </div>
                    <p class="alert-message">
                        If you didn't request this password reset, please ignore this email. 
                        Your account security is important to us. No changes will be made unless you use this link.
                    </p>
                </div>
                
                <!-- Footer -->
                <div class="email-footer">
                    <p class="footer-text">
                        Need assistance? Our support team is here to help at 
                        <a href="mailto:support@shivamecommerce.com" class="support-link">support@shivamecommerce.com</a>
                    </p>
                    <p class="signature">
                        Best regards,<br>
                        The Shivam Ecommerce Team
                    </p>
                    <p class="copyright">
                        © ${new Date().getFullYear()} Shivam Ecommerce. All rights reserved.<br>
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
  
  return { subject, htmlContent };
};

module.exports=sendResetEmail