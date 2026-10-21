"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { MicInput } from "@/components/MicInput";
import { useT } from "@/components/LocaleProvider";

type Channel = "SMS" | "EMAIL";
type Intent = "login" | "register";

type AuthFormProps = {
  intent: Intent;
};

const STORAGE_KEY = "matrimony_otp_pending";
const ACCOUNT_KEY = "matrimony_registered_account";

type SavedAccount = {
  channel: Channel;
  identifier: string;
};

function readSavedAccount(): SavedAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAccount;
    if (
      (parsed.channel === "SMS" || parsed.channel === "EMAIL") &&
      typeof parsed.identifier === "string" &&
      parsed.identifier.length >= 5
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveAccount(channel: Channel, identifier: string) {
  localStorage.setItem(
    ACCOUNT_KEY,
    JSON.stringify({ channel, identifier } satisfies SavedAccount),
  );
}

function displayIdentifier(channel: Channel, identifier: string) {
  if (channel !== "SMS") return identifier;
  const digits = identifier.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return identifier;
}

export function AuthForm({ intent }: AuthFormProps) {
  const router = useRouter();
  const t = useT();
  const [channel, setChannel] = useState<Channel>("SMS");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedToAccount, setLockedToAccount] = useState(false);
  const [alreadyRegisteredDevice, setAlreadyRegisteredDevice] = useState(false);

  useEffect(() => {
    const saved = readSavedAccount();
    if (!saved) return;

    // Same registered mobile forever on this device â€” another number not allowed
    if (intent === "register" && saved.channel === "SMS") {
      setChannel(saved.channel);
      setIdentifier(displayIdentifier(saved.channel, saved.identifier));
      setLockedToAccount(true);
    }

    if (intent === "register" && saved.channel === "SMS") {
      setAlreadyRegisteredDevice(true);
    }
  }, [intent]);

  // Registration is mobile-only
  useEffect(() => {
    if (intent === "register" && !lockedToAccount) {
      setChannel("SMS");
    }
  }, [intent, lockedToAccount]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (alreadyRegisteredDevice) {
      router.push("/login");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: intent === "register" ? "SMS" : channel,
          identifier,
          intent,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t("auth.failedSend"));
        return;
      }

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          channel: data.channel,
          identifier: data.identifier,
          intent,
          expiresAt: data.expiresAt,
          devCode: data.devCode ?? null,
          delivered: data.delivered ?? false,
          deliveryError: data.deliveryError ?? null,
        }),
      );

      router.push("/verify-otp");
    } catch {
      setError(t("common.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  const isRegister = intent === "register";
  const showChannelToggle = !isRegister;

  if (alreadyRegisteredDevice) {
    return (
      <div className="auth-form">
        <p className="form-hint" role="status">
          {t("authExtra.alreadyRegisteredDevice")}
        </p>
        <p className="muted">
          <strong>{displayIdentifier(channel, identifier)}</strong>
        </p>
        <Link href="/login" className="btn-primary" style={{ display: "inline-block", textAlign: "center" }}>
          {t("authExtra.goLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      {showChannelToggle ? (
        <div className="channel-toggle" role="tablist" aria-label="Verification method">
          <button
            type="button"
            role="tab"
            aria-selected={channel === "SMS"}
            className={channel === "SMS" ? "active" : ""}
            onClick={() => { setChannel("SMS"); setIdentifier(""); setLockedToAccount(false); }}
          >
            {t("auth.mobile")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={channel === "EMAIL"}
            className={channel === "EMAIL" ? "active" : ""}
            onClick={() => { setChannel("EMAIL"); setIdentifier(""); setLockedToAccount(false); }}
          >
            {t("auth.email")}
          </button>
        </div>
      ) : null}

      <p className="auth-flow-hint">
        {isRegister
          ? t("authExtra.registerMobileOnly")
          : lockedToAccount
            ? t("authExtra.lockedForever")
            : t("authExtra.mobileOnlyHint")}
      </p>

      <label className="field">
        <span>
          {channel === "SMS" || isRegister
            ? t("auth.mobileNumber")
            : t("auth.emailAddress")}
          {lockedToAccount ? t("auth.registeredSuffix") : ""}
        </span>
        <MicInput
          required
          autoComplete={channel === "SMS" || isRegister ? "tel" : "email"}
          inputMode={channel === "SMS" || isRegister ? "tel" : "email"}
          placeholder={
            channel === "SMS" || isRegister ? "9876543210" : "you@example.com"
          }
          value={identifier}
          onValueChange={(v) => {
            if (lockedToAccount && isRegister) return;
            setIdentifier(v);
          }}
          readOnly={lockedToAccount && isRegister}
          append={false}
          showHint={!lockedToAccount}
        />
      </label>

      {lockedToAccount ? (
        <p className="form-hint">{t("authExtra.lockedForever")}</p>
      ) : null}

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? t("auth.sendingOtp") : t("auth.sendOtp")}
      </button>

      <p className="auth-switch">
        {isRegister ? (
          <>
            {t("auth.alreadyAccount")}{" "}
            <Link href="/login">{t("nav.login")}</Link>
          </>
        ) : (
          <>
            {t("auth.newHere")}{" "}
            <Link href="/register">{t("auth.createAccount")}</Link>
          </>
        )}
      </p>
    </form>
  );
}

export function VerifyOtpForm() {
  const router = useRouter();
  const t = useT();
  const [channel, setChannel] = useState<Channel>("SMS");
  const [identifier, setIdentifier] = useState("");
  const [intent, setIntent] = useState<Intent>("login");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const pending = JSON.parse(raw) as {
        channel: Channel;
        identifier: string;
        intent?: Intent;
        devCode?: string | null;
        delivered?: boolean;
        deliveryError?: string | null;
      };
      setChannel(pending.channel);
      setIdentifier(pending.identifier);
      setIntent(pending.intent === "register" ? "register" : "login");
      setDelivered(Boolean(pending.delivered));
      setDeliveryError(pending.deliveryError ?? null);
      if (pending.devCode) {
        setDevCode(pending.devCode);
        setCode(pending.devCode);
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, identifier, code, intent }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t("auth.failedVerify"));
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      saveAccount(channel, data.identifier || identifier);
      // Sign-up / incomplete â†’ form process; complete login â†’ profile dashboard
      if (data.needsOnboarding) {
        router.push("/onboarding");
      } else if (data.needsPreferences) {
        router.push("/preferences");
      } else {
        router.push("/home");
      }
      router.refresh();
    } catch {
      setError(t("common.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setResending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, identifier, intent }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t("auth.failedSend"));
        if (data.retryAfterSeconds) setCooldown(data.retryAfterSeconds);
        return;
      }
      setCooldown(30);
      setDelivered(Boolean(data.delivered));
      setDeliveryError(data.deliveryError ?? null);
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          channel,
          identifier,
          intent,
          expiresAt: data.expiresAt,
          devCode: data.devCode ?? null,
          delivered: data.delivered ?? false,
          deliveryError: data.deliveryError ?? null,
        }),
      );
      if (data.devCode) {
        setDevCode(data.devCode);
        setCode(data.devCode);
      }
      setMessage(
        data.delivered
          ? channel === "SMS"
            ? t("auth.otpDeliveredSms")
            : t("auth.otpDeliveredEmail")
          : "Provider delivery failed â€” use on-screen demo OTP.",
      );
    } catch {
      setError(t("auth.failedSend"));
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <p className="muted">
        {t("auth.enterCodeFor")}{" "}
        <strong>{displayIdentifier(channel, identifier)}</strong>
      </p>
      <p className="form-hint">
        {channel === "SMS"
          ? t("auth.sameLoginHintMobile")
          : t("auth.sameLoginHintEmail")}
      </p>

      {delivered ? (
        <p className="form-hint" role="status">
          {channel === "SMS"
            ? t("auth.otpDeliveredSms")
            : t("auth.otpDeliveredEmail")}
        </p>
      ) : null}

      {deliveryError ? (
        <p className="form-error" role="alert">
          Delivery issue: {deliveryError}
        </p>
      ) : null}

      {devCode ? (
        <div className="otp-dev-banner" role="status">
          <p className="otp-dev-label">
            {delivered
              ? "Dev copy (real OTP also sent)"
              : "Fallback demo OTP â€” real delivery failed"}
          </p>
          <p className="otp-dev-code">{devCode}</p>
          <p className="otp-dev-note">
            Is code se verify kar sakte ho. Real delivery ke liye MSG91
            template/domain complete hona chahiye.
          </p>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setCode(devCode)}
          >
            Use this OTP
          </button>
        </div>
      ) : null}

      <label className="field">
        <span>{t("auth.otpCode")}</span>
        <input
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoComplete="one-time-code"
        />
      </label>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-hint">{message}</p> : null}

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || code.length !== 6}
      >
        {loading
          ? t("auth.verifying")
          : intent === "login"
            ? t("auth.verifyContinue")
            : t("common.continue")}
      </button>

      <button
        type="button"
        className="btn-ghost"
        onClick={resend}
        disabled={resending || cooldown > 0}
      >
        {cooldown > 0
          ? t("auth.resendIn", { seconds: cooldown })
          : resending
            ? t("auth.resending")
            : t("auth.resendOtp")}
      </button>

      <p className="auth-switch">
        <Link href={intent === "register" ? "/register" : "/login"}>
          {t("common.back")}
        </Link>
      </p>
    </form>
  );
}

export function LoginPageClient() {
  const t = useT();
  return (
    <AuthShell
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      flowHint={t("auth.loginOpensProfile")}
    >
      <Suspense fallback={<p className="muted">{t("common.loading")}</p>}>
        <AuthForm intent="login" />
      </Suspense>
    </AuthShell>
  );
}

export function RegisterPageClient() {
  const t = useT();
  return (
    <AuthShell
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      flowHint={t("auth.signupStartsForms")}
    >
      <Suspense fallback={<p className="muted">{t("common.loading")}</p>}>
        <AuthForm intent="register" />
      </Suspense>
    </AuthShell>
  );
}

export function VerifyOtpPageClient() {
  const t = useT();
  return (
    <AuthShell title={t("auth.otpTitle")} subtitle={t("auth.otpSubtitle")}>
      <Suspense fallback={<p className="muted">{t("common.loading")}</p>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthShell>
  );
}
