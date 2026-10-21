"use client";

import { useState } from "react";

export type InterestItem = {
  id: string;
  name: string;
  city: string | null;
  age: number | null;
  height: string | null;
  job: string | null;
  photoUrl: string | null;
  status: "PENDING" | "ACCEPTED" | "DENIED";
  direction: "sent" | "received";
  createdAt?: string | null;
  otherUserId?: string | null;
};

type TabKey = "pending" | "accepted";

export function DashboardClient({ interests }: { interests: InterestItem[] }) {
  const [items, setItems] = useState(interests);
  const [tab, setTab] = useState<TabKey>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = items.filter(
    (item) => item.status === "PENDING" && item.direction === "received",
  );
  const accepted = items.filter((item) => item.status === "ACCEPTED");
  const visible = tab === "pending" ? pending : accepted;

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

      if (status === "ACCEPTED") {
        setTab("accepted");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="dash-panel" id="interests">
      <div className="dash-panel-head">
        <h2>Interest request</h2>
        <div className="dash-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={tab === "pending" ? "active" : ""}
            aria-selected={tab === "pending"}
            onClick={() => setTab("pending")}
          >
            New requests ({pending.length})
          </button>
          <button
            type="button"
            role="tab"
            className={tab === "accepted" ? "active" : ""}
            aria-selected={tab === "accepted"}
            onClick={() => setTab("accepted")}
          >
            Accepted interests ({accepted.length})
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {visible.length === 0 ? (
        <p className="muted">
          {tab === "pending"
            ? "No new interest requests right now."
            : "Accepted interests will appear here after you accept a request."}
        </p>
      ) : (
        <div className="dash-interest-list">
          {visible.map((item) => (
            <article
              key={item.id}
              className={`dash-interest-card ${item.status.toLowerCase()}`}
            >
              <div className="dash-interest-photo">
                {item.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photoUrl} alt={item.name} />
                ) : (
                  <span>{item.name.slice(0, 1)}</span>
                )}
              </div>
              <div className="dash-interest-body">
                <p className="dash-plan-tag">
                  {item.status === "PENDING"
                    ? "New request"
                    : item.status === "ACCEPTED"
                      ? "Accepted"
                      : "Denied"}
                </p>
                <h3>{item.name}</h3>
                <ul>
                  <li>
                    City: <strong>{item.city || "—"}</strong>
                  </li>
                  <li>
                    Age: <strong>{item.age ?? "—"}</strong>
                  </li>
                  <li>
                    Height: <strong>{item.height || "—"}</strong>
                  </li>
                  <li>
                    Job: <strong>{item.job || "—"}</strong>
                  </li>
                </ul>
                {tab === "pending" ? (
                  <div className="dash-interest-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => respond(item.id, "ACCEPTED")}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? "Saving…" : "Accept"}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => respond(item.id, "DENIED")}
                      disabled={busyId === item.id}
                    >
                      Deny
                    </button>
                  </div>
                ) : (
                  <p className="dash-interest-note">
                    You can now continue conversation from Chat list.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
