"use client";

import Link from "next/link";
import { useT } from "@/components/LocaleProvider";

export type ChatListItem = {
  id: string;
  name: string;
  photoUrl: string | null;
  preview: string;
  time: string;
  unread: number;
  hasMessages?: boolean;
};

export function ChatListView({
  chats,
  canChat = true,
}: {
  chats: ChatListItem[];
  canChat?: boolean;
}) {
  const t = useT();

  return (
    <section className="chat-page">
      <h1>{t("chat.title")}</h1>
      {!canChat ? (
        <p className="form-error" style={{ marginBottom: "1rem" }}>
          {t("chat.freeBanner")}{" "}
          <Link href="/plan">{t("pricing.getStarted")}</Link>
        </p>
      ) : null}
      <div className="chat-page-panel">
        {chats.length === 0 ? (
          <p className="chat-empty">
            {canChat ? t("chat.empty") : t("chat.locked")}
          </p>
        ) : (
          <ul className="chat-rows">
            {chats.map((chat) => (
              <li key={chat.id}>
                <Link
                  href={canChat ? `/chats/${chat.id}` : "/plan"}
                  className={`chat-row ${!canChat ? "locked" : ""}`}
                >
                  <div className="chat-avatar">
                    {chat.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={chat.photoUrl} alt={chat.name} />
                    ) : (
                      <span>{chat.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="chat-row-body">
                    <div className="chat-row-top">
                      <strong>{chat.name}</strong>
                      <time>{chat.time}</time>
                    </div>
                    <p>{canChat ? chat.preview : t("chat.locked")}</p>
                  </div>
                  {canChat && chat.unread > 0 ? (
                    <span className="chat-unread">{chat.unread}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
