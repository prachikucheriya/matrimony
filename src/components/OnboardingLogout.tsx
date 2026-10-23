"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function OnboardingLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button type="button" disabled={busy} className="btn-ghost"
    onClick={async () => {
      setBusy(true);
      try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) throw new Error("Logout failed");
        router.replace("/login");
        router.refresh();
      } catch { alert("Could not log out. Please try again."); setBusy(false); }
    }}>{busy ? "Logging out..." : "Logout"}</button>;
}
