"use client";

import Link from "next/link";
import { useT } from "@/components/LocaleProvider";

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-support">{t("footer.supportLine")}</div>

      <div className="site-footer-main">
        <div className="site-footer-decor site-footer-decor-tl" aria-hidden />
        <div className="site-footer-decor site-footer-decor-br" aria-hidden />

        <div className="site-footer-grid">
          <section>
            <h3>{t("footer.getInTouch")}</h3>
            <ul className="site-footer-contact">
              <li>Jalgaon, Maharashtra, India</li>
              <li>+91 75888 69103</li>
              <li>help@bandhanmil.com</li>
            </ul>
          </section>

          <section>
            <h3>{t("footer.helpSupport")}</h3>
            <div className="site-footer-help">
              <ul>
                <li>
                  <Link href="/">{t("footer.about")}</Link>
                </li>
                <li>
                  <Link href="/contact">{t("footer.feedback")}</Link>
                </li>
                <li>
                  <Link href="/">{t("footer.testimonials")}</Link>
                </li>
              </ul>
              <ul>
                <li>
                  <Link href="/contact">{t("footer.contactUs")}</Link>
                </li>
                <li>
                  <Link href="/plans">{t("footer.plans")}</Link>
                </li>
                <li>
                  <Link href="/register">{t("footer.faqs")}</Link>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3>{t("footer.social")}</h3>
            <div className="site-footer-social">
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                in
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
                x
              </a>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                f
              </a>
              <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer">
                ▶
              </a>
            </div>
          </section>
        </div>

        <div className="site-footer-cta">
          <p>{t("footer.cta")}</p>
          <Link href="/register" className="site-footer-join">
            {t("footer.join")}
          </Link>
        </div>

        <div className="site-footer-copy">
          Copyright © {year} <Link href="/">BandhanMil.com</Link>{" "}
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
