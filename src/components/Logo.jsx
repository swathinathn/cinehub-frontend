import "./logo.css";
import logoo from "../assets/logoo.png";

export default function Logo() {
  return (
    <div className="logo-wrapper">
      <div className="logo-icon">
        <img
          src={logoo}
          alt="CineHub Logo"
        />
      </div>

      {/* <span className="logo-text">
        Cine<span>Hub</span>
      </span> */}
    </div>
  );
}