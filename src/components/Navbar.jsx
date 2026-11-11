import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { loginUser, registerUser, logoutUser } from "../utils/auth";
import "./navbar.css";
import API from "../utils/axios";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cinehub-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirm: ""
  });
  const [errors, setErrors] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  useEffect(() => {
    if (user) {
      API.get("/users/notifications/").then((res) => {
        const notifs = res.data.results || res.data;
        const count = notifs.filter(n => !n.is_read).length;
        setUnreadCount(count);
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const openLogin = () => setModalOpen(true);
    window.addEventListener("open-login", openLogin);
    return () => window.removeEventListener("open-login", openLogin);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".profile-wrapper")) setProfileOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/search?q=${searchInput}`);
    setSearchInput("");
    setSearchFocused(false);
  };

  const goToFilter = (type, value) => {
    navigate(`/movies?${type}=${encodeURIComponent(value)}`);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  const validateLogin = () => {
    const err = {};
    if (!formData.email) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = "Invalid email";
    if (!formData.password) err.password = "Password is required";
    return err;
  };

  const validateSignup = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.email) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = "Invalid email";
    if (!formData.password) err.password = "Password is required";
    else if (formData.password.length < 6) err.password = "Min 6 characters";
    if (!formData.confirm) err.confirm = "Please confirm password";
    else if (formData.password !== formData.confirm) err.confirm = "Passwords don't match";
    return err;
  };

  const handleLogin = async () => {
    const errs = validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      await loginUser({ email: formData.email, password: formData.password });

      // Fetch user profile to check role
      const profileRes = await API.get("/users/profile/");
      const userData = {
        email: formData.email,
        name: profileRes.data.username,
        isAdmin: profileRes.data.role === "admin" || profileRes.data.is_staff
      };
      localStorage.setItem("cinehub-user", JSON.stringify(userData));
      setUser(userData);
      closeModal();
    } catch {
      setErrors({ password: "Invalid email or password" });
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    const errs = validateSignup();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      await registerUser({ email: formData.email, username: formData.name, password: formData.password });
      await loginUser({ email: formData.email, password: formData.password });
      const userData = { name: formData.name, email: formData.email };
      localStorage.setItem("cinehub-user", JSON.stringify(userData));
      setUser(userData);
      closeModal();
    } catch (err) {
      setErrors({ email: err.response?.data?.email ? "User already exists." : "Something went wrong." });
    } finally { setLoading(false); }
  };

  const logout = () => {
    logoutUser();
    localStorage.removeItem("cinehub-user");
    setUser(null);
    navigate("/");
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsSignup(false);
    setFormData({ name: "", email: "", password: "", confirm: "" });
    setErrors({});
  };

  const isActive = (path) => location.pathname === path;

  const genres = ["Action", "Romance", "Comedy", "Thriller", "Drama", "Horror"];
  const languages = ["English", "Hindi", "Malayalam", "Tamil", "Telugu"];

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        {/* LEFT */}
        <div className="nav-left">
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`ham-line ${menuOpen ? "open" : ""}`}></span>
            <span className={`ham-line ${menuOpen ? "open" : ""}`}></span>
            <span className={`ham-line ${menuOpen ? "open" : ""}`}></span>
          </button>

          <Link to="/" className="logo"><Logo /></Link>

          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
            <Link to="/movies" className={`nav-link ${isActive("/movies") ? "active" : ""}`}>Movies</Link>

            <div className="dropdown">
              <span className="dropdown-trigger">
                Genres
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <div className="dropdown-header">Genres</div>
                {genres.map(g => (
                  <p key={g} onClick={() => goToFilter("genre", g)}>
                    <span className="dot"></span>{g}
                  </p>
                ))}
              </div>
            </div>

            <div className="dropdown">
              <span className="dropdown-trigger">
                Languages
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div className="dropdown-menu">
                <div className="dropdown-header">Languages</div>
                {languages.map(l => (
                  <p key={l} onClick={() => goToFilter("language", l)}>
                    <span className="dot"></span>{l}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          <form onSubmit={handleSearch} className={`search-form ${searchFocused ? "focused" : ""}`}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="search-box"
              placeholder="Search movies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              ref={searchRef}
            />
          </form>

          {user ? (
            <>
              <button className="notification-bell" onClick={() => navigate('/notifications')}>
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              <div className="profile-wrapper">
                <button
                  className="profile-btn"
                  onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                >
                <div className="profile-avatar">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar-lg">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="pd-name">{user.name || "User"}</p>
                      <p className="pd-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="pd-divider"></div>
                  <Link to="/profile" className="pd-item" onClick={() => setProfileOpen(false)}>
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/my-bookings" className="pd-item" onClick={() => setProfileOpen(false)}>
                    <span>🎟️</span> My Bookings
                  </Link>

                  <Link to="/wishlist" className="pd-item" onClick={() => setProfileOpen(false)}>
                    <span>❤️</span> My Wishlist
                  </Link>

                  {user.isAdmin && (
                    <Link to="/admin" className="pd-item" onClick={() => setProfileOpen(false)}>
                      <span>⚙️</span> Admin Panel
                    </Link>
                  )}
                  <div className="pd-divider"></div>
                  <button className="pd-logout" onClick={logout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <button className="login-btn" onClick={() => setModalOpen(true)}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
          <Link to="/movies" onClick={() => setMenuOpen(false)}>🎬 Movies</Link>
          <div className="mobile-divider"></div>
          {genres.map(g => (
            <p key={g} onClick={() => { goToFilter("genre", g); setMenuOpen(false); }}>
              🎭 {g}
            </p>
          ))}
          <div className="mobile-divider"></div>
          {languages.map(l => (
            <p key={l} onClick={() => { goToFilter("language", l); setMenuOpen(false); }}>
              🌐 {l}
            </p>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-brand">
              <Logo />
            </div>

            <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
            <p className="modal-subtitle">
              {isSignup ? "Join CineHub today" : "Sign in to your account"}
            </p>

            {isSignup && (
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
            )}

            <div className="input-group">
              <label>Email</label>
              <input name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            {isSignup && (
              <div className="input-group">
                <label>Confirm Password</label>
                <input name="confirm" type="password" placeholder="••••••••" value={formData.confirm} onChange={handleChange} />
                {errors.confirm && <span className="error">{errors.confirm}</span>}
              </div>
            )}

            <button
              className="modal-submit-btn"
              onClick={isSignup ? handleSignup : handleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loader"></span>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>

            <p className="switch-text" onClick={() => { setIsSignup(!isSignup); setErrors({}); }}>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <span>{isSignup ? "Sign In" : "Sign Up"}</span>
            </p>

            <button className="modal-close-x" onClick={closeModal}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}