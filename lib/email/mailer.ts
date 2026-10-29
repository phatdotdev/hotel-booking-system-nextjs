import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: `"Hotel Booking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Email Verification</h2>

        <p>Your verification code is:</p>

        <h1 style="letter-spacing: 8px;">
          ${code}
        </h1>

        <p>This code expires in 5 minutes.</p>

        <p>If you did not request this code,
        please ignore this email.</p>
      </div>
    `,
  });
}
