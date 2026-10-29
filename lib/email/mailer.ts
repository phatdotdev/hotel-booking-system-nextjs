import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, code: string) {
  // 1. Kiểm tra biến môi trường
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error(
      "Thiếu cấu hình EMAIL_USER hoặc EMAIL_APP_PASSWORD trong .env",
    );
  }

  // 2. Khởi tạo transporter khi hàm được gọi
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    // 3. Gửi email
    const info = await transporter.sendMail({
      from: `"Hotel Booking Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${code} is your email verification code`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #2563eb; padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                      Hotel Booking
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px; font-weight: 600;">
                      Verify your email address
                    </h2>
                    <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.5;">
                      Thank you for joining Hotel Booking. Please use the verification code below to complete your sign in.
                    </p>

                    <!-- Code Box -->
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 28px; display: inline-block; width: 100%; box-sizing: border-box;">
                      <span style="display: block; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Verification Code
                      </span>
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #2563eb; letter-spacing: 10px; padding-left: 10px;">
                        ${code}
                      </span>
                    </div>

                    <!-- Expiration -->
                    <p style="margin: 0 0 16px 0; color: #ef4444; font-size: 13px; font-weight: 500;">
                      ⏱️ This code expires in <strong>5 minutes</strong>.
                    </p>
                    
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                      If you did not request this verification code, please ignore this email or contact support.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      © ${new Date().getFullYear()} Hotel Booking. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Lỗi gửi email:", error);
    throw new Error(`Không thể gửi email xác thực: ${error.message}`);
  }
}
