"use client";

import Link from "next/link";
import { Gender } from "@prisma/client";
import { DashShell } from "@/components/DashShell";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { InterestItem } from "@/components/DashboardClient";
import { useT } from "@/components/LocaleProvider";

type MatchCard = {
  id: string;
  displayName: string | null;
  city: string | null;
  state: string | null;
  photoUrl: string | null;
  age: number | null;
  occupation: string | null;
  height: string | null;
};

type DashboardProps = {
  userName: string;
  contact: string;
  photoUrl: string | null;
  completion: number;
  planLabel: string;
  canChat: boolean;
  canViewContact: boolean;
  profileSummary: {
    gender: string;
    age: number | null;
    city: string | null;
    state: string | null;
    community: string;
    education: string | null;
    occupation: string | null;
  };
  matches: MatchCard[];
  interests: InterestItem[];
  suggestionsBasedOnPrefs?: boolean;
};

export function UserDashboard({
  userName,
  contact,
  photoUrl,
  completion,
  planLabel,
  canChat,
  canViewContact,
  profileSummary,
  matches,
  interests,
  suggestionsBasedOnPrefs = false,
}: DashboardProps) {
  const t = useT();
  const pendingCount = interests.filter(
    (i) => i.status === "PENDING" && i.direction === "received",
  ).length;
  const acceptedCount = interests.filter((i) => i.status === "ACCEPTED").length;

  return (
    <DashShell
      userName={userName}
      contact={contact}
      photoUrl={photoUrl}
      active="dashboard"
    >
      <section className="dash-page-panel">
        <header className="dash-top">
          <div>
            <p className="eyebrow">{t("nav.dashboard")}</p>
            <h1>{t("dash.welcome", { name: userName })}</h1>
          </div>
          <Link href="/profiles" className="btn-primary">
            {t("dash.viewAll")}
          </Link>
        </header>

        <section className="dash-panel soft">
          <div className="dash-panel-head">
            <h2>
              {suggestionsBasedOnPrefs
                ? t("dash.matchesPrefs")
                : t("dash.matchesTitle")}
            </h2>
            <Link href="/profiles">{t("dash.viewAll")}</Link>
          </div>
          {matches.length === 0 ? (
            <p className="muted">{t("dash.noMatches")}</p>
          ) : (
            <div className="dash-match-track">
              {matches.map((match) => (
                <article key={match.id} className="dash-match-card">
                  <div className="dash-match-photo">
                    {match.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={match.photoUrl}
                        alt={match.displayName ?? "Match"}
                      />
                    ) : (
                      <span>No photo</span>
                    )}
                  </div>
                  <div className="dash-match-body">
                    <h3>{match.displayName ?? "Member"}</h3>
                    <p>
                      {[match.city, match.state].filter(Boolean).join(", ") || "—"}
                    </p>
                    <p>{match.age ? `${match.age} Years old` : "Age N/A"}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="dash-grid-2">
          <section className="dash-panel soft" id="settings">
            <div className="dash-panel-head">
              <h2>{t("dash.profileStatus")}</h2>
              <Link href="/profile/edit">{t("dash.editProfile")}</Link>
            </div>
            <div className="dash-completion">
              <div
                className="dash-ring"
                style={{ ["--pct" as string]: `${completion}` }}
              >
                <strong>{completion}%</strong>
              </div>
              <div>
                <h3>{t("dash.completion", { percent: completion })}</h3>
                <p>{t("editProfile.subtitle")}</p>
                <div className="dash-mini-links">
                  <Link href="/profile/edit">{t("dash.editProfile")}</Link>
                  <Link href="/preferences?edit=1">
                    {t("preferences.editTitle")}
                  </Link>
                </div>
              </div>
            </div>
            <div className="dash-stats">
              <div>
                <strong>12</strong>
                <span>Likes</span>
              </div>
              <div>
                <strong>28</strong>
                <span>Views</span>
              </div>
              <div>
                <strong>{acceptedCount}</strong>
                <span>{t("dash.accepted")}</span>
              </div>
              <div>
                <strong>{pendingCount}</strong>
                <span>{t("dash.pendingInterests")}</span>
              </div>
            </div>
            <div className="dash-summary-chips">
              <span>{profileSummary.gender}</span>
              <span>
                {profileSummary.age ? `${profileSummary.age} yrs` : "Age —"}
              </span>
              <span>{profileSummary.community || "Community"}</span>
              <span>
                {[profileSummary.city, profileSummary.state]
                  .filter(Boolean)
                  .join(", ") || "Location"}
              </span>
            </div>
          </section>

          <section className="dash-panel soft" id="plan">
            <div className="dash-panel-head">
              <h2>{t("dash.yourPlan")}</h2>
              <span className="dash-plan-badge">{planLabel}</span>
            </div>
            <ul className="dash-plan-list">
              <li>
                <span>{t("dash.yourPlan")}</span>
                <strong>{planLabel}</strong>
              </li>
              <li>
                <span>{t("contact.phone")}</span>
                <strong>
                  {canViewContact ? t("dash.canContact") : t("dash.noContact")}
                </strong>
              </li>
              <li>
                <span>{t("interests.title")}</span>
                <strong>{t("dash.accepted")}</strong>
              </li>
              <li>
                <span>{t("nav.chats")}</span>
                <strong>{canChat ? t("dash.canChat") : t("dash.noChat")}</strong>
              </li>
            </ul>
            <Link href="/plan" className="btn-secondary">
              {canChat ? "View plan" : "Upgrade plan"}
            </Link>
          </section>
        </div>

        <div className="dash-grid-2">
          <section className="dash-panel soft" id="chats">
            <div className="dash-panel-head">
              <h2>Recent chat list</h2>
              {canChat ? (
                <Link href="/chats">Open chat list</Link>
              ) : (
                <Link href="/plan">Upgrade to chat</Link>
              )}
            </div>
            <ul className="dash-chat-list">
              {matches.slice(0, 4).map((match) => (
                <li key={`chat-${match.id}`}>
                  <div className="dash-chat-avatar">
                    {match.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={match.photoUrl} alt="" />
                    ) : (
                      <span>{(match.displayName || "M").slice(0, 1)}</span>
                    )}
                  </div>
                  <div>
                    <strong>{match.displayName ?? "Member"}</strong>
                    <p>
                      {[match.city, match.state].filter(Boolean).join(", ") ||
                        "India"}
                    </p>
                  </div>
                  <em className={canChat ? undefined : "chat-locked"}>
                    {canChat ? "Chat" : "Locked"}
                  </em>
                </li>
              ))}
              {matches.length === 0 ? (
                <li className="empty">No chats yet. Start browsing profiles.</li>
              ) : null}
            </ul>
          </section>

          <section className="dash-panel soft" id="photo">
            <div className="dash-panel-head">
              <h2>Profile photo</h2>
            </div>
            <PhotoUpload currentUrl={photoUrl} />
          </section>
        </div>

        <section className="dash-panel soft">
          <div className="dash-panel-head">
            <h2>Interest request</h2>
            <Link href="/interests">Open interests</Link>
          </div>
          <p className="muted">
            Review new requests, accept matches, and manage denied interests on
            the Interests page.
          </p>
          <div className="dash-mini-links" style={{ marginTop: "0.8rem" }}>
            <Link href="/interests">Go to Interests</Link>
            <span>{pendingCount} new</span>
          </div>
        </section>
      </section>
    </DashShell>
  );
}

export function toOppositeGender(
  gender: Gender | null | undefined,
): Gender | undefined {
  if (gender === "BRIDE") return "GROOM";
  if (gender === "GROOM") return "BRIDE";
  return undefined;
}
