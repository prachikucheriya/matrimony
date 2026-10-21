"use client";

import { FormEvent, useState } from "react";
import { MicInput } from "@/components/MicInput";
import { useT } from "@/components/LocaleProvider";

export function ContactForm() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label className="field">
        <span>{t("contact.fullName")}</span>
        <MicInput
          value={name}
          onValueChange={setName}
          required
          minLength={2}
          showHint
        />
      </label>
      <label className="field">
        <span>{t("contact.email")}</span>
        <MicInput
          type="email"
          value={email}
          onValueChange={setEmail}
          required
          append={false}
        />
      </label>
      <label className="field">
        <span>{t("contact.phone")}</span>
        <MicInput
          value={phone}
          onValueChange={setPhone}
          required
          minLength={10}
          append={false}
        />
      </label>
      <label className="field contact-span">
        <span>{t("contact.message")}</span>
        <MicInput
          multiline
          rows={5}
          value={message}
          onValueChange={setMessage}
          required
          minLength={10}
          showHint
        />
      </label>
      {sent ? (
        <p className="form-hint contact-span">{t("contact.thanks")}</p>
      ) : null}
      <button type="submit" className="btn-primary contact-span">
        {t("contact.send")}
      </button>
    </form>
  );
}
