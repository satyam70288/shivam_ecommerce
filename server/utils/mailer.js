// filename: sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail transporter setup with SSL fix
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "swagfashion077@gmail.com",
    pass: "lnxk wszo movn gubk", // Use App Password, not regular password
  },
  tls: {
    rejectUnauthorized: false // This fixes the self-signed certificate error
  },
  debug: true, // Enable debug for troubleshooting
  logger: true // Enable logger
});

// Send mail function with improved error handling
const sendMail = async (toEmail, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Swag Fashion" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags for plain text
      html: htmlContent,
      // Optional: Add headers for better email deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log("✅ Email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("👤 To:", toEmail);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
    
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    console.error("🔧 Error details:", error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// OTP email template
const sendOtpEmail = async (toEmail, otp, userName = "User") => {
  const subject = "Your Password Reset OTP - Swag Fashion";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; }
        .content { background: white; padding: 40px; border-radius: 8px; }
        .otp-box { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          font-size: 32px; 
          font-weight: bold; 
          padding: 20px; 
          text-align: center; 
          border-radius: 10px; 
          letter-spacing: 8px;
          margin: 30px 0;
        }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>You requested to reset your password for your Swag Fashion account.</p>
          <p>Use the OTP below to reset your password:</p>
          
          <div class="otp-box">${otp}</div>
          
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          
          <div class="footer">
            <p>Best regards,<br>Swag Fashion Team</p>
            <p><small>This is an automated message, please do not reply to this email.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail(toEmail, subject, htmlContent);
};

// Password reset confirmation email
const sendPasswordResetConfirmation = async (toEmail, userName = "User") => {
  const subject = "Password Reset Successful - Swag Fashion";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .success-box { background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div style="max-width: 600px; margin: 0 auto;">
        <h2>Password Updated Successfully</h2>
        <p>Hello ${userName},</p>
        
        <div class="success-box">
          <h3>✅ Your password has been reset successfully!</h3>
          <p>You can now log in to your Swag Fashion account with your new password.</p>
        </div>
        
        <p>If you didn't make this change, please contact our support team immediately.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Stay stylish!<br>Swag Fashion Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail(toEmail, subject, htmlContent);
};
module.exports = sendMail;
