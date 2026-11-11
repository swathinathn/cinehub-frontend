import React, { useState } from "react";
import API from "../utils/axios";
import "./payment.css";

export default function PaymentModal({
  movie, seats, total, theatre, time, date, onClose, onSuccess
}) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    setError("");

    try {
      // Step 1: Create order on backend
      const orderRes = await API.post("/payments/create-order/", { amount: total });
      const { order_id, amount, currency, key } = orderRes.data;

      const user = JSON.parse(localStorage.getItem("cinehub-user"));

      // Step 2: Open Razorpay checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: "CineHub",
        description: `${movie.title} • ${seats.length} seat${seats.length > 1 ? "s" : ""}`,
        image: "/logo.png",
        handler: async function (response) {
          try {
            
            const verifyRes = await API.post("/payments/verify-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.status === "success") {
              setProcessing(false);
              setSuccess(true);
              setTimeout(() => onSuccess(response), 2000);
            } else {
              setProcessing(false);
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setProcessing(false);
            setError("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#f84464",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setProcessing(false);
        setError("Payment failed: " + response.error.description);
      });

      rzp.open();
    } catch (err) {
      setProcessing(false);
      setError("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="pm-backdrop" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        {!success ? (
          <>
            <div className="pm-header">
              <div>
                <h3>Complete Payment</h3>
                <p className="pm-subtitle">Secure checkout via Razorpay</p>
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

            {error && (
              <div style={{
                background: "rgba(248,68,100,0.1)",
                border: "1px solid rgba(248,68,100,0.3)",
                color: "#f84464",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "16px"
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className={`pm-pay-btn ${processing ? "processing" : ""}`}
              onClick={handleRazorpayPayment}
              disabled={processing}
            >
              {processing ? (
                <span className="pm-processing">
                  <span className="pm-spinner"></span>
                  Processing...
                </span>
              ) : (
                `Pay ₹${total} with Razorpay`
              )}
            </button>

            <p className="pm-secure">🔒 256-bit SSL encrypted • Powered by Razorpay</p>
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