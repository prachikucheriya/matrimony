type SendResult =
  | { ok: true; provider: string }
  | { ok: false; error: string };

function getAuthKey() {
  return process.env.MSG91_AUTH_KEY?.trim() || "";
}

function digitsOnlyPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/** Send SMS OTP via MSG91 SendOTP API. Requires approved template_id. */
export async function sendMsg91SmsOtp(phone: string, otp: string): Promise<SendResult> {
  const authkey = getAuthKey();
  const templateId = process.env.MSG91_TEMPLATE_ID?.trim() || "";
  const senderId = process.env.MSG91_SENDER_ID?.trim() || "";

  if (!authkey) {
    return { ok: false, error: "MSG91_AUTH_KEY missing in .env" };
  }
  if (!templateId || templateId.toUpperCase() === "MSG91") {
    return {
      ok: false,
      error:
        "Valid MSG91_TEMPLATE_ID required. Create an OTP template in MSG91 → OTP → Templates, then paste that Template ID in .env",
    };
  }

  const mobile = digitsOnlyPhone(phone);
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", templateId);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("otp", otp);
  url.searchParams.set("otp_length", "6");
  url.searchParams.set("otp_expiry", "10");
  if (senderId) url.searchParams.set("sender", senderId);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      authkey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const text = await response.text();
  let data: { type?: string; message?: string | string[] } = {};
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    data = { message: text };
  }

  if (!response.ok || data.type === "error") {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `MSG91 SMS failed (${response.status})`;
    console.error("[MSG91 SMS]", message, text);
    return { ok: false, error: String(message) };
  }

  return { ok: true, provider: "msg91-sms" };
}

/** Send Email OTP via MSG91 Email API (HTML body). Needs verified sending domain. */
export async function sendMsg91EmailOtp(email: string, otp: string): Promise<SendResult> {
  const authkey = getAuthKey();
  const fromEmail = process.env.OTP_FROM_EMAIL?.trim() || "";

  if (!authkey) {
    return { ok: false, error: "MSG91_AUTH_KEY missing in .env" };
  }
  if (!fromEmail || !fromEmail.includes("@")) {
    return { ok: false, error: "OTP_FROM_EMAIL must be a valid from-address in .env" };
  }

  const domain =
    process.env.MSG91_EMAIL_DOMAIN?.trim() ||
    fromEmail.split("@")[1] ||
    "";

  const payload = {
    to: [{ email, name: "User" }],
    from: {
      email: fromEmail,
      name: "BandhanMil",
    },
    domain,
    subject: "Your BandhanMil OTP",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>BandhanMil verification</h2>
        <p>Your one-time password is:</p>
        <p style="font-size:28px;letter-spacing:6px;font-weight:bold">${otp}</p>
        <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  const response = await fetch("https://control.msg91.com/api/v5/email/send", {
    method: "POST",
    headers: {
      authkey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data: { status?: string; message?: string; errors?: unknown } = {};
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    data = { message: text };
  }

  if (!response.ok || data.status === "error" || data.errors) {
    const message =
      data.message ||
      (typeof data.errors === "string" ? data.errors : JSON.stringify(data.errors || text));
    console.error("[MSG91 EMAIL]", message);
    return {
      ok: false,
      error:
        String(message) ||
        "MSG91 email failed. Verify your sending domain in MSG91 Email settings (Gmail personal inbox as From often fails).",
    };
  }

  return { ok: true, provider: "msg91-email" };
}
