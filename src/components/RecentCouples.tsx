"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/LocaleProvider";

type Couple = {
  id: string;
  names: string;
  city: string;
  storyKey: string;
  image: string;
};

const COUPLES: Couple[] = [
  {
    id: "1",
    names: "Aarav & Meera",
    city: "Jaipur",
    storyKey: "couples.story1",
    image: "/images/couples/couple-1.jpg",
  },
  {
    id: "2",
    names: "Rohan & Ananya",
    city: "Pune",
    storyKey: "couples.story2",
    image: "/images/couples/couple-2.jpg",
  },
  {
    id: "3",
    names: "Kabir & Sara",
    city: "Mumbai",
    storyKey: "couples.story3",
    image: "/images/couples/couple-3.jpg",
  },
  {
    id: "4",
    names: "Vihaan & Isha",
    city: "Ahmedabad",
    storyKey: "couples.story4",
    image: "/images/couples/couple-4.jpg",
  },
  {
    id: "5",
    names: "Arjun & Diya",
    city: "Bengaluru",
    storyKey: "couples.story5",
    image: "/images/couples/couple-5.jpg",
  },
  {
    id: "6",
    names: "Dev & Kiara",
    city: "Delhi",
    storyKey: "couples.story6",
    image: "/images/couples/couple-6.jpg",
  },
];

export function RecentCouples() {
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  function scrollByCard(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".couple-card") as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 280) + 18;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 12;

    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => scrollByCard(1), 3800);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="recent-couples">
      <div className="recent-couples-header">
        <p className="recent-couples-kicker">{t("couples.subtitle")}</p>
        <h2>{t("couples.title")}</h2>
        <p>{t("couples.subtitle")}</p>
      </div>

      <div
        className="recent-couples-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <button
          type="button"
          className="couples-nav prev"
          aria-label={t("couples.prev")}
          onClick={() => scrollByCard(-1)}
        >
          ‹
        </button>

        <div className="couples-track" ref={trackRef}>
          {COUPLES.map((couple) => (
            <article key={couple.id} className="couple-card">
              <div
                className="couple-card-media"
                style={{ backgroundImage: `url(${couple.image})` }}
              />
              <div className="couple-card-overlay" />
              <div className="couple-card-body">
                <p className="couple-city">{couple.city}</p>
                <h3>{couple.names}</h3>
                <p className="couple-story">{t(couple.storyKey)}</p>
                <Link href="/register" className="couple-link">
                  {t("couples.viewMore")}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="couples-nav next"
          aria-label={t("couples.next")}
          onClick={() => scrollByCard(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
