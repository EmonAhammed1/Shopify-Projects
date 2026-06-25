const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email notification for new contact message
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `📬 New Message: ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #0d0d14; color: #f0f0ff; padding: 32px; border-radius: 12px; border: 1px solid rgba(108,99,255,0.3);">
        <h2 style="color: #6c63ff; margin-top: 0;">📬 New Portfolio Contact</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #7a7a9d; width: 100px;">Name:</td>
            <td style="padding: 8px 0; color: #f0f0ff;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7a7a9d;">Email:</td>
            <td style="padding: 8px 0; color: #6c63ff;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7a7a9d;">Subject:</td>
            <td style="padding: 8px 0; color: #f0f0ff;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: rgba(108,99,255,0.1); border-radius: 8px; border-left: 3px solid #6c63ff;">
          <p style="margin: 0; color: #f0f0ff; line-height: 1.6;">${message}</p>
        </div>
        <p style="margin-top: 20px; color: #7a7a9d; font-size: 12px;">This message was sent via your portfolio contact form.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log('✅ Contact email sent to', process.env.EMAIL_TO);
};

module.exports = { sendContactEmail };
