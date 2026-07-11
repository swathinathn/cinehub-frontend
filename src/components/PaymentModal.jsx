import React, { useState } from "react";
import "./payment.css";

export default function PaymentModal({
  movie, seats, total, theatre, time, date, onClose, onSuccess
}) {
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUpi] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [walletBalance, setWalletBalance] = useState(() => {
    return parseFloat(localStorage.getItem("wallet-balance") || "2500");
  });

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const validate = () => {
    const err = {};
    if (method === "card") {
      if (card.replace(/\s/g, "").length !== 16) err.card = "Enter valid 16-digit card number";
      if (!name.trim()) err.name = "Enter cardholder name";
      if (expiry.length !== 5) err.expiry = "Enter valid expiry (MM/YY)";
      if (cvv.length !== 3) err.cvv = "Enter valid 3-digit CVV";
    }
    if (method === "upi") {
      if (!upi.includes("@")) err.upi = "Enter valid UPI ID (example@upi)";
    }
    if (method === "wallet") {
      if (walletBalance < total) {
        err.wallet = "Insufficient wallet balance";
      }
    }
    return err;
  };

  const handlePay = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setErrors({});
    setProcessing(true);

    if (method === "wallet") {
      const newBalance = walletBalance - total;
      setWalletBalance(newBalance);
      localStorage.setItem("wallet-balance", newBalance.toString());
    }

    await new Promise(r => setTimeout(r, 1800));

    setProcessing(false);
    setSuccess(true);
    setTimeout(() => onSuccess(), 2000);
  };

  const paymentMethods = [
    { id: "card", icon: "💳", label: "Card" },
    { id: "upi", icon: "📱", label: "UPI" },
    { id: "wallet", icon: "👛", label: "Wallet" },
  ];

  return (
    <div className="pm-backdrop" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        {!success ? (
          <>
            <div className="pm-header">
              <div>
                <h3>Complete Payment</h3>
                <p className="pm-subtitle">Secure checkout</p>
              </div>
              <button className="pm-close" onClick={onClose}>✕</button>
            </div>

            <div className="pm-summary">
              <div className="pm-summary-left">
                <p className="pm-movie">{movie.title}</p>
                <p className="pm-detail">📍 {theatre}</p>
                <p className="pm-detail">📅 {date} • ⏰ {time}</p>
                <p className="pm-detail">💺 {seats.join(", ")}</p>
              </div>
              <div className="pm-summary-right">
                <p className="pm-seats">{seats.length}</p>
                <p className="pm-seats-label">seat{seats.length > 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="pm-amount">
              <span>Total Amount</span>
              <span className="pm-total">₹{total}</span>
            </div>

            <div className="pm-methods">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  className={`pm-method-btn ${method === m.id ? "active" : ""}`}
                  onClick={() => { setMethod(m.id); setErrors({}); }}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {method === "card" && (
              <div className="pm-form">
                <div className="pm-input-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={card}
                    onChange={e => setCard(formatCard(e.target.value))}
                    maxLength="19"
                  />
                  {errors.card && <span className="pm-error">{errors.card}</span>}
                </div>

                <div className="pm-input-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  {errors.name && <span className="pm-error">{errors.name}</span>}
                </div>

                <div className="pm-row">
                  <div className="pm-input-group">
                    <label>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      maxLength="5"
                    />
                    {errors.expiry && <span className="pm-error">{errors.expiry}</span>}
                  </div>
                  <div className="pm-input-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      maxLength="3"
                    />
                    {errors.cvv && <span className="pm-error">{errors.cvv}</span>}
                  </div>
                </div>
              </div>
            )}

            {method === "upi" && (
              <div className="pm-form">
                <div className="pm-upi-apps">
                  {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                    <div key={app} className="pm-upi-app">{app}</div>
                  ))}
                </div>
                <div className="pm-input-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={upi}
                    onChange={e => setUpi(e.target.value)}
                  />
                  {errors.upi && <span className="pm-error">{errors.upi}</span>}
                </div>
              </div>
            )}

            {method === "wallet" && (
              <div className="pm-form">
                <div className="pm-wallet-balance">
                  <span>💰 Wallet Balance</span>
                  <span className="pm-wallet-amt">₹{walletBalance.toFixed(2)}</span>
                </div>
                <p className="pm-wallet-note">
                  {total <= walletBalance
                    ? `✅ ₹${(walletBalance - total).toFixed(2)} will remain after payment`
                    : `❌ Insufficient balance. Need ₹${(total - walletBalance).toFixed(2)} more`}
                </p>
                {errors.wallet && <span className="pm-error">{errors.wallet}</span>}
              </div>
            )}

            <button
              className={`pm-pay-btn ${processing ? "processing" : ""}`}
              onClick={handlePay}
              disabled={processing}
            >
              {processing ? (
                <span className="pm-processing">
                  <span className="pm-spinner"></span>
                  Processing...
                </span>
              ) : (
                `Pay ₹${total}`
              )}
            </button>

            <p className="pm-secure">🔒 256-bit SSL encrypted • Secure payment</p>
          </>
        ) : (
          <div className="pm-success">
            <div className="pm-success-ring">
              <div className="pm-checkmark">✓</div>
            </div>
            <h3>Payment Successful!</h3>
            <p>Your booking is confirmed 🎉</p>
            <div className="pm-success-details">
              <p><strong>{movie.title}</strong></p>
              <p>{theatre} • {time}</p>
              <p>Seats: {seats.join(", ")}</p>
              <p className="pm-success-amount">₹{total} paid</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}