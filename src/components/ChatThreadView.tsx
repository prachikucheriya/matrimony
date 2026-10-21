"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  body: string;
  time: string;
  mine: boolean;
};

type ChatThreadViewProps = {
  conversationId: string;
  otherName: string;
  otherPhotoUrl: string | null;
  initialMessages: ChatMessage[];
  canChat?: boolean;
};

export function ChatThreadView({
  conversationId,
  otherName,
  otherPhotoUrl,
  initialMessages,
  canChat = true,
}: ChatThreadViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    if (!canChat) {
      setError("Chat is disabled on Free plan. Upgrade to send messages.");
      return;
    }
    const body = text.trim();
    if (!body || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/chats/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not send message.");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch {
      setError("Something went wrong while sending.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-thread">
      <header className="chat-thread-head">
        <Link href="/chats" className="chat-back">
          ← Back
        </Link>
        <div className="chat-thread-user">
          <div className="chat-avatar small">
            {otherPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={otherPhotoUrl} alt={otherName} />
            ) : (
              <span>{otherName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1>{otherName}</h1>
            <p>Chat history</p>
          </div>
        </div>
      </header>

      <div className="chat-thread-panel">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="chat-empty-thread">
              No messages yet. Say hello to start this conversation. It will
              appear in your Chat list.
            </p>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={`chat-bubble ${message.mine ? "mine" : "theirs"}`}
              >
                <p>{message.body}</p>
                <time>{message.time}</time>
              </article>
            ))
          )}
          <div ref={endRef} />
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {!canChat ? (
          <p className="form-error">
            Chat is disabled on Free plan.{" "}
            <Link href="/plan">Upgrade to Gold or Platinum</Link>
          </p>
        ) : null}

        <form className="chat-composer" onSubmit={onSend}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              canChat ? "Type your message..." : "Chat locked on Free plan"
            }
            maxLength={2000}
            disabled={loading || !canChat}
          />
          <button
            type="submit"
            className="interest-accept-btn"
            disabled={loading || !canChat}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}
