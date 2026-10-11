import nodemailer from "nodemailer";

const smtpEmail = process.env.EMAIL_USER;
const smtpPassword = process.env.EMAIL_PASS;

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/akun/verifikasi?token=${token}`;

  // Jika kredensial belum diisi, kita fallback log ke console agar sistem tidak crash
  if (!smtpEmail || !smtpPassword) {
    console.warn("\n⚠️ [EMAIL WARNING] EMAIL_USER atau EMAIL_PASS belum disetel di .env!");
    console.log(`[SIMULASI EMAIL] Verifikasi ${to}: ${verifyUrl}\n`);
    return { success: false, simulated: true };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fff9f5;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1b2a5c; margin-bottom: 8px;">Selamat Datang di CodeKids! 🚀</h1>
        <p style="color: #666; font-size: 16px;">Platform petualangan coding seru untuk anak-anak Indonesia</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #ffe2c6;">
        <p style="font-size: 16px; color: #333; line-height: 1.5;">
          Halo, terima kasih telah mendaftar di CodeKids.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.5;">
          Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #ff8a2b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">
            Verifikasi Email Saya
          </a>
        </div>

        <p style="font-size: 14px; color: #777; line-height: 1.4;">
          Atau salin tautan berikut ke browser Anda jika tombol di atas tidak dapat diklik:<br />
          <a href="${verifyUrl}" style="color: #ff8a2b; word-break: break-all;">${verifyUrl}</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #999;">
        <p>Jika Anda tidak merasa mendaftar di CodeKids, Anda dapat mengabaikan email ini.</p>
      </div>
    </div>
  `;

  try {
    const info = await mailTransporter.sendMail({
      from: `"CodeKids" <${smtpEmail}>`,
      to,
      subject: "Verifikasi Akun CodeKids Anda 🚀",
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Gagal mengirim email verifikasi:", error);
    return { success: false, error };
  }
}

