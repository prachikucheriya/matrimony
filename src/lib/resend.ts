type SendResult =
  | { ok: true; provider: string }
  | { ok: false; error: string };

export async function sendResendEmailOtp(
  email: string,
  otp: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.OTP_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `BandhanMil <${fromEmail}>`,
      to: [email],
      subject: "Your BandhanMil Login OTP",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>BandhanMil Email Verification</h2>
          <p>Your verification code is:</p>
          <p style="font-size:30px;font-weight:bold;letter-spacing:6px">
            ${otp}
          </p>
          <p>This OTP expires in 10 minutes.</p>
          <p>Do not share this code with anyone.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    console.error("[Resend] Email delivery failed:", response.status);
    return {
      ok: false,
      error: "Unable to send email OTP. Check Resend sender settings.",
    };
  }

  return { ok: true, provider: "resend-email" };
}
