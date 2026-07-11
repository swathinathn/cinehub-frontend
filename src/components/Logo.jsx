import "./logo.css";
import logo from "../assets/logo.png";
export default function Logo() {
  return (
    <div className="logo-wrapper">
      <div className="logo-icon">
        <img
      src={logo}
      alt="CineHub Logo"
      style={{ height: "36px" }}
    />
      </div>

      <span className="logo-text">
        Cine<span>Hub</span>
      </span>
    </div>
  );
}
