"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { InterestItem } from "@/components/DashboardClient";
import { useT } from "@/components/LocaleProvider";

type TabKey = "pending" | "accepted" | "denied";

function formatRequestOn(value?: string | null) {
  if (!value) return "Request on: Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Request on: Recently";
  return `Request on: ${date.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
}

function badgeFor(index: number, status: InterestItem["status"]) {
  if (status !== "PENDING") return null;
  if (index % 3 === 0) return { label: "Platinum user", tone: "platinum" };
  if (index % 3 === 1) return { label: "Gold user", tone: "gold" };
  return null;
}

export function InterestsPageView({
  interests,
  canChat = false,
}: {
  interests: InterestItem[];
  canChat?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [items, setItems] = useState(interests);
  const [tab, setTab] = useState<TabKey>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openingChatFor, setOpeningChatFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "pending", label: t("interests.pending") },
    { key: "accepted", label: t("interests.accepted") },
    { key: "denied", label: t("interests.denied") },
  ];

  const groups = useMemo(() => {
    const pending = items.filter(
      (item) => item.status === "PENDING" && item.direction === "received",
    );
    const accepted = items.filter((item) => item.status === "ACCEPTED");
    const denied = items.filter(
      (item) => item.status === "DENIED" && item.direction === "received",
    );
    return { pending, accepted, denied };
  }, [items]);

  const visible = groups[tab];

  async function respond(id: string, status: "ACCEPTED" | "DENIED") {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/interests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update interest.");
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: data.interest.status as InterestItem["status"] }
            : item,
        ),
      );
      setTab(status === "ACCEPTED" ? "accepted" : "denied");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function openChat(otherUserId?: string | null) {
    if (!canChat) {
      setError("Chat is disabled on Free plan. Upgrade to Gold or Platinum.");
      return;
    }
    if (!otherUserId) {
      setError("Unable to open chat for this member.");
      return;
    }
    setOpeningChatFor(otherUserId);
    setError(null);
    try {
      const response = await fetch(`/api/chats/with/${otherUserId}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not open chat.");
        return;
      }
      router.push(data.redirectTo ?? `/chats/${data.conversationId}`);
    } catch {
      setError("Something went wrong while opening chat.");
    } finally {
      setOpeningChatFor(null);
    }
  }

  return (
    <section className="interest-page-panel">
      <div className="interest-page-head">
        <h1>{t("interests.title")}</h1>
        <button type="button" className="interest-more-btn" aria-label="More options">
          ···
        </button>
      </div>

      <div className="interest-page-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            className={tab === item.key ? "active" : ""}
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {visible.length === 0 ? (
        <p className="interest-empty">{t("interests.empty")}</p>
      ) : (
        <div className="interest-rows">
          {visible.map((item, index) => {
            const badge = badgeFor(index, item.status);
            return (
              <article key={item.id} className="interest-row">
                <div className="interest-row-photo">
                  {item.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photoUrl} alt={item.name} />
                  ) : (
                    <span>{item.name.slice(0, 1)}</span>
                  )}
                  {badge ? (
                    <em className={`interest-badge ${badge.tone}`}>{badge.label}</em>
                  ) : null}
                </div>

                <div className="interest-row-body">
                  <h2>{item.name}</h2>
                  <p className="interest-meta">
                    <span>
                      City: <strong>{item.city || "—"}</strong>
                    </span>
                    <span>
                      Age: <strong>{item.age ?? "—"}</strong>
                    </span>
                    <span>
                      Height: <strong>{item.height || "—"}</strong>
                    </span>
                    <span>
                      Job: <strong>{item.job || "—"}</strong>
                    </span>
                  </p>
                  <p className="interest-time">{formatRequestOn(item.createdAt)}</p>
                  <Link href="/profiles" className="interest-view-btn">
                    View full profile
                  </Link>
                </div>

                {tab === "pending" ? (
                  <div className="interest-row-actions">
                    <button
                      type="button"
                      className="interest-accept-btn"
                      onClick={() => respond(item.id, "ACCEPTED")}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? t("interests.saving") : t("interests.accept")}
                    </button>
                    <button
                      type="button"
                      className="interest-deny-btn"
                      onClick={() => respond(item.id, "DENIED")}
                      disabled={busyId === item.id}
                    >
                      {t("interests.deny")}
                    </button>
                  </div>
                ) : (
                  <div className="interest-row-actions">
                    <span className={`interest-status-pill ${item.status.toLowerCase()}`}>
                      {item.status === "ACCEPTED"
                        ? t("interests.accepted")
                        : t("interests.denied")}
                    </span>
                    {item.status === "ACCEPTED" ? (
                      <>
                        <button
                          type="button"
                          className="interest-accept-btn"
                          onClick={() => openChat(item.otherUserId)}
                          disabled={
                            !canChat || openingChatFor === item.otherUserId
                          }
                          title={
                            canChat
                              ? t("interests.openChat")
                              : t("interests.upgradeChat")
                          }
                        >
                          {openingChatFor === item.otherUserId
                            ? t("common.loading")
                            : t("interests.openChat")}
                        </button>
                        {!canChat ? (
                          <Link href="/plan" className="profile-upgrade-hint">
                            {t("interests.upgradeChat")}
                          </Link>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
