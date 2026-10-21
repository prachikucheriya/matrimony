"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/LocaleProvider";

type ServiceItem = {
  id: string;
  titleKey: string;
  subKey: string;
  href: string;
  image: string;
  icon: "hearts" | "ring" | "users" | "search" | "shield" | "chat";
};

const SERVICES: ServiceItem[] = [
  {
    id: "browse",
    titleKey: "services.browseTitle",
    subKey: "services.browseSub",
    href: "/profiles",
    image: "/images/hero-banner.jpg",
    icon: "users",
  },
  {
    id: "join",
    titleKey: "services.joinTitle",
    subKey: "services.joinSub",
    href: "/register",
    image: "/images/auth-banner.jpg",
    icon: "hearts",
  },
  {
    id: "search",
    titleKey: "services.searchTitle",
    subKey: "services.searchSub",
    href: "/profiles",
    image: "/images/hero-banner.jpg",
    icon: "search",
  },
  {
    id: "verified",
    titleKey: "services.verifiedTitle",
    subKey: "services.verifiedSub",
    href: "/register",
    image: "/images/auth-banner.jpg",
    icon: "shield",
  },
  {
    id: "community",
    titleKey: "services.communityTitle",
    subKey: "services.communitySub",
    href: "/register",
    image: "/images/hero-banner.jpg",
    icon: "ring",
  },
  {
    id: "connect",
    titleKey: "services.connectTitle",
    subKey: "services.connectSub",
    href: "/register",
    image: "/images/auth-banner.jpg",
    icon: "chat",
  },
];

function ServiceIcon({ type }: { type: ServiceItem["icon"] }) {
  switch (type) {
    case "hearts":
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path
            d="M24 40s-12.5-8.2-17-15.2C3.5 19 5.2 12 11.2 10.5c4-.9 7.5 1.2 9.3 4.2 1.8-3 5.3-5.1 9.3-4.2 6 1.5 7.7 8.5 4.2 14.3C36.5 31.8 24 40 24 40z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="26" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M18 14l3-5h6l3 5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="18" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M8 36c1.5-6 6-9 10-9s8.5 3 10 9M20 36c1.5-6 6-9 10-9s8.5 3 10 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="22" cy="22" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M29 29l9 9" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path
            d="M24 8l14 5v11c0 9-6.5 15.5-14 18-7.5-2.5-14-9-14-18V13l14-5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M18 24l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path
            d="M12 34V18c0-2 1.5-4 4-4h8l4 4h8c2.5 0 4 2 4 4v16c0 2-1.5 4-4 4H16c-2.5 0-4-2-4-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
  }
}

export function ServicesSlider() {
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [paused, setPaused] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
  }

  function scrollByCard(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".service-card") as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 280) + 20;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 12;

    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === -1 && el.scrollLeft <= 8) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      return;
    }

    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      scrollByCard(1);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="services-section">
      <div className="services-decor services-decor-tl" aria-hidden />
      <div className="services-decor services-decor-br" aria-hidden />

      <div className="services-header">
        <p className="services-kicker">{t("services.eyebrow")}</p>
        <h2>{t("services.title")}</h2>
        <div className="services-flourish" aria-hidden>
          <span />
          <i />
          <span />
        </div>
      </div>

      <div
        className="services-slider-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <button
          type="button"
          className="services-nav prev"
          aria-label={t("services.prev")}
          disabled={!canPrev}
          onClick={() => scrollByCard(-1)}
        >
          ‹
        </button>

        <div className="services-track" ref={trackRef}>
          {SERVICES.map((service) => (
            <article key={service.id} className="service-card">
              <div
                className="service-card-media"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className="service-card-shade" />

              <div className="service-card-content">
                <div className="service-icon">
                  <ServiceIcon type={service.icon} />
                </div>
                <h3>{t(service.titleKey)}</h3>
                <p>{t(service.subKey)}</p>
              </div>

              <div className="service-card-hover">
                <h3>{t(service.titleKey)}</h3>
                <p>{t(service.subKey)}</p>
                <Link href={service.href} className="service-view-more">
                  {t("services.viewMore")}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="services-nav next"
          aria-label={t("services.next")}
          onClick={() => scrollByCard(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
