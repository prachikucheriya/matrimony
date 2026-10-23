"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTestRegistration() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/test-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: otp ? "verify" : "send", email, code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      if (result.code) {
        setOtp(result.code);
        setCode(result.code);
      } else if (result.ok) {
        router.replace("/onboarding");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-4 text-2xl font-bold">Admin test registration</h1>
      <p className="mb-4 text-sm text-gray-600">
        Admin-only testing. No email is sent. Completing verification signs you in as the new test user,
        so you will need to log in as admin again for another test.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">Test email
          <input className="mt-1 w-full rounded border p-2" type="email" required
            value={email} disabled={Boolean(otp)} onChange={e => setEmail(e.target.value)} />
        </label>
        {otp && <>
          <p className="rounded bg-gray-100 p-3">Screen OTP: <strong>{otp}</strong></p>
          <label className="block">OTP
            <input className="mt-1 w-full rounded border p-2" inputMode="numeric"
              maxLength={6} value={code} onChange={e => setCode(e.target.value)} required />
          </label>
        </>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <button className="rounded bg-blue-700 px-5 py-2 text-white" disabled={busy} type="submit">
          {busy ? "Please wait..." : otp ? "Verify and create test account" : "Generate screen OTP"}
        </button>
      </form>
    </main>
  );
}
