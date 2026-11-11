import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
import API from "../utils/axios";
import { mediaUrl } from "../utils/media";
import "./home.css";

/* Display-only promos. They are not applied at checkout yet. */
const OFFERS = [
  { code: "FIRST50", icon: "🎟️", title: "Flat ₹50 off", text: "On your first ticket booking" },
  { code: "COMBO20", icon: "🍿", title: "20% off snacks", text: "On any food combo with tickets" },
  { code: "WEEKEND10", icon: "🎬", title: "10% off weekends", text: "Fri to Sun shows, up to ₹100" },
  { code: "GROUP4", icon: "👥", title: "Book 4+ seats", text: "₹40 off for every extra seat" },
];

const STAT_LABELS = [
  ["movies", "Movies", "🎬"],
  ["theatres", "Theatres", "🏛️"],
  ["users", "Happy users", "😊"],
  ["bookings", "Tickets booked", "🎟️"],
];

/* ---------- small reusable pieces (kept OUTSIDE Home so they don't remount) ---------- */

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Row({ title, onMore, children }) {
  const scroller = useRef(null);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <Reveal>
      <section className="home-row">
        <div className="home-section-header">
          <h2 className="home-section-title">
            <span className="title-bar" />
            {title}
          </h2>

          <div className="row-tools">
            {onMore && (
              <button className="view-more" onClick={onMore}>
                View all →
              </button>
            )}
            <button className="row-arrow" aria-label="Scroll left" onClick={() => scrollBy(-1)}>
              ‹
            </button>
            <button className="row-arrow" aria-label="Scroll right" onClick={() => scrollBy(1)}>
              ›
            </button>
          </div>
        </div>

        <div className="scroll-row" ref={scroller}>
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function CountUp({ to, duration = 1500 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(to)) return;

    let raf;
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      setValue(to);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return <span ref={ref}>{value.toLocaleString("en-IN")}</span>;
}

function HomeSkeleton() {
  return (
    <div className="home-skeleton">
      <div className="sk sk-hero" />
      <div className="sk-row">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sk sk-card" />
        ))}
      </div>
    </div>
  );
}

const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/placeholder.jpg";
};

/* ---------- page ---------- */

export default function Home() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [genres, setGenres] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    const user = JSON.parse(localStorage.getItem("cinehub-user"));

    (async () => {
      // allSettled: one failing request must not blank the whole page
      const [m, t, g, s, w] = await Promise.allSettled([
        API.get("/movies/list/?page_size=1000"),
        API.get("/movies/list/trending/"),
        API.get("/movies/genres/?page_size=1000"),
        API.get("/movies/stats/"),
        user ? API.get("/movies/wishlist/?page_size=1000") : Promise.resolve(null),
      ]);

      if (!alive) return;

      const list = (r) =>
        r.status === "fulfilled" && r.value
          ? r.value.data.results || r.value.data
          : [];

      setMovies(list(m));
      setTrending(list(t));
      setGenres(list(g));
      setWishlist(list(w));
      if (s.status === "fulfilled") setStats(s.value.data);
      setLoading(false);
    })();

    return () => {
      alive = false;
      clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2000);
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(`Code ${code} copied`);
    } catch {
      showToast(`Code: ${code}`);
    }
  };

  const inTheatres = movies.filter((m) => m.category === "in_theatres").slice(0, 6);
  const ottMovies = movies.filter((m) => m.category === "ott").slice(0, 6);
  const comingSoon = movies.filter((m) => m.category === "coming_soon").slice(0, 6);

  const top10 = [...movies]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 10);

  // chips only for single-value languages, because the backend filter is an exact match
  const languages = [
    ...new Set(movies.map((m) => m.language).filter((l) => l && !l.includes(","))),
  ].slice(0, 8);

  const heroMovies = trending.length ? trending : movies;
  const wishlistMovies = wishlist.map((w) => w.movie).filter(Boolean).slice(0, 12);

  const statItems = STAT_LABELS.filter(([key]) => Number.isFinite(stats?.[key]));

  const renderCards = (list, extra = {}) =>
    list.map((m) => (
      <div key={m.id} className="home-card-wrapper">
        <MovieCard movie={m} {...extra} />
      </div>
    ));

  if (loading) {
    return (
      <div className="home-page">
        <HomeSkeleton />
      </div>
    );
  }

  return (
    <div className="home-page">
      <HeroSlider movies={heroMovies} />

      <div className="home-inner">
        {/* QUICK FILTERS */}
        {(genres.length > 0 || languages.length > 0) && (
          <div className="quick-filters">
            {genres.length > 0 && (
              <div className="chip-group">
                <span className="chip-label">Genres</span>
                <div className="chip-scroll">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      className="chip"
                      onClick={() => navigate(`/movies?genre=${encodeURIComponent(g.name)}`)}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="chip-group">
                <span className="chip-label">Languages</span>
                <div className="chip-scroll">
                  {languages.map((l) => (
                    <button
                      key={l}
                      className="chip lang"
                      onClick={() => navigate(`/movies?language=${encodeURIComponent(l)}`)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {movies.length === 0 && trending.length === 0 && (
          <p className="home-empty">No movies are available right now. Please check back soon.</p>
        )}

        {/* TRENDING */}
        {trending.length > 0 && (
          <Row title="🔥 Trending now" onMore={() => navigate("/movies")}>
            {renderCards(trending)}
          </Row>
        )}

        {/* TOP 10 */}
        {top10.length > 0 && (
          <Row title="Top 10 on CineHub">
            {top10.map((m, i) => (
              <button
                key={m.id}
                className="top10-card"
                onClick={() => navigate(`/movies/${m.id}`)}
              >
                <span className="top10-rank">{i + 1}</span>
                <span className="top10-body">
                  <img src={mediaUrl(m.poster)} alt={m.title} loading="lazy" onError={onImgError} />
                  <span className="top10-meta">
                    <strong>{m.title}</strong>
                    <em>⭐ {m.rating}</em>
                  </span>
                </span>
              </button>
            ))}
          </Row>
        )}

        {/* OFFERS */}
        <Reveal>
          <section className="home-row">
            <div className="home-section-header">
              <h2 className="home-section-title">
                <span className="title-bar" />
                🏷️ Offers for you
              </h2>
            </div>

            <div className="offers-grid">
              {OFFERS.map((o) => (
                <button key={o.code} className="offer-card" onClick={() => copyCode(o.code)}>
                  <span className="offer-icon">{o.icon}</span>
                  <span className="offer-text">
                    <strong>{o.title}</strong>
                    <small>{o.text}</small>
                  </span>
                  <span className="offer-code">{o.code}</span>
                  <span className="offer-hint">Tap to copy</span>
                </button>
              ))}
            </div>
          </section>
        </Reveal>

        {/* IN CINEMAS */}
        {inTheatres.length > 0 && (
          <Row title="🎬 In cinemas" onMore={() => navigate("/movies")}>
            {renderCards(inTheatres)}
          </Row>
        )}

        {/* WISHLIST */}
        {wishlistMovies.length > 0 && (
          <Row title="❤️ Continue from your wishlist" onMore={() => navigate("/wishlist")}>
            {renderCards(wishlistMovies, { initialWishlisted: true })}
          </Row>
        )}

        {/* OTT */}
        {ottMovies.length > 0 && (
          <Row title="📺 Watch online" onMore={() => navigate("/movies")}>
            {renderCards(ottMovies)}
          </Row>
        )}

        {/* COMING SOON */}
        {comingSoon.length > 0 && (
          <Row title="🆕 Coming soon" onMore={() => navigate("/movies")}>
            {renderCards(comingSoon)}
          </Row>
        )}

        {/* STATS */}
        {statItems.length > 0 && (
          <Reveal>
            <section className="stats-strip">
              {statItems.map(([key, label, icon]) => (
                <div className="stat" key={key}>
                  <span className="stat-icon">{icon}</span>
                  <strong className="stat-num">
                    <CountUp to={stats[key]} />
                  </strong>
                  <span className="stat-label">{label}</span>
                </div>
              ))}
            </section>
          </Reveal>
        )}
      </div>

      {toast && <div className="home-toast">{toast}</div>}
    </div>
  );
}