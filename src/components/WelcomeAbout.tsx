"use client";

import Link from "next/link";
import { useT } from "@/components/LocaleProvider";

export function WelcomeAbout() {
  const t = useT();

  return (
    <section className="welcome-about">
      <div className="welcome-about-inner">
        <div className="welcome-visual" aria-hidden>
          <div className="welcome-shape-dark" />
          <div className="welcome-shape-ring" />
          <div className="welcome-shape-soft" />
          <div className="welcome-leaf welcome-leaf-tl" />
          <div className="welcome-leaf welcome-leaf-br" />

          <div
            className="welcome-photo welcome-photo-a"
            style={{ backgroundImage: "url(/images/about-1.jpg)" }}
          />
          <div
            className="welcome-photo welcome-photo-b"
            style={{ backgroundImage: "url(/images/about-2.jpg)" }}
          />
          <div className="welcome-badge">
            <strong>10+</strong>
            <span>{t("about.communities")}</span>
          </div>
        </div>

        <div className="welcome-copy">
          <p className="welcome-eyebrow">{t("about.eyebrow")}</p>
          <h2>
            <span>{t("about.welcomeTo")}</span>
            <em>BandhanMil</em>
          </h2>

          <p className="welcome-text">{t("about.body1")}</p>

          <p className="welcome-cta-line">
            <Link href="/register">{t("about.clickHere")}</Link>
            {t("about.ctaAfter")}
          </p>

          <hr className="welcome-divider" />

          <p className="welcome-text">{t("about.body2")}</p>

          <div className="welcome-contacts">
            <div className="welcome-contact">
              <div className="welcome-contact-icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path
                    d="M6.5 4h3l1.5 4-2 1.5a12 12 0 006 6L16.5 13l4 1.5v3A2.5 2.5 0 0118 20C10.5 20 4 13.5 4 6.5A2.5 2.5 0 016.5 4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <div>
                <p>{t("about.enquiry")}</p>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
            </div>

            <div className="welcome-contact">
              <div className="welcome-contact-icon" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path
                    d="M4 7l8 6 8-6M5 6h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <div>
                <p>{t("about.getSupport")}</p>
                <a href="mailto:hello@bandhanmil.com">hello@bandhanmil.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
