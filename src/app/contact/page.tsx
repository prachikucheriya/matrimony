"use client";

import { ContactForm } from "@/components/ContactForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useT } from "@/components/LocaleProvider";

export default function ContactPage() {
  const t = useT();

  return (
    <main className="public-page">
      <div className="public-page-top">
        <SiteHeader active="contact" />
      </div>
      <div className="public-page-body">
        <section className="contact-section">
          <div className="contact-intro">
            <p className="eyebrow">{t("contactPage.eyebrow")}</p>
            <h1>{t("contactPage.title")}</h1>
            <p className="lede">{t("contactPage.lede")}</p>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              <h2>{t("contactPage.support")}</h2>
              <ul className="contact-details">
                <li>
                  <span>{t("contactPage.phone")}</span>
                  <strong>+91 75888 69103</strong>
                </li>
                <li>
                  <span>{t("contactPage.email")}</span>
                  <strong>help@bandhanmil.com</strong>
                </li>
                <li>
                  <span>{t("contactPage.hours")}</span>
                  <strong>{t("contactPage.hoursValue")}</strong>
                </li>
                <li>
                  <span>{t("contactPage.address")}</span>
                  <strong>{t("contactPage.addressValue")}</strong>
                </li>
              </ul>
            </div>

            <div className="contact-card">
              <h2>{t("contactPage.sendMessage")}</h2>
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
