import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../api/axios";
import paymentUtils from "../components/PaymentUtils";
import "./Payment.css";
import {
  CreditCardIcon,
  QrIcon,
  WalletIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  ShieldIcon,
} from "../utils/Icon";

//  HELPERS
const { loadRazorpayScript, SuccessOverlay } = paymentUtils;

// ─────────────────────────────────────────────
//  PAYMENT METHODS CONFIG
// ─────────────────────────────────────────────

/** Convert paise → ₹ display string */

const formatAmount = (paise) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    label: "Pay Online",
    sublabel: "Cards, UPI, Netbanking & more",
    Icon: CreditCardIcon,
  },
  {
    id: "upi",
    label: "UPI / QR Code",
    sublabel: "Scan & pay instantly",
    Icon: QrIcon,
  },
  {
    id: "cash",
    label: "Cash on Visit",
    sublabel: "Pay at the clinic",
    Icon: WalletIcon,
  },
];

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Pull state passed from SlotSelection ──
  const {
    appointmentDetails, // full API response { success, message, order: { id, amount, currency, receipt, ... } }
    appointmentData,
    doctorName,
    dateDisplay,
    timeDisplay,
    fees,
  } = location.state || {};

  const order = appointmentDetails;

  // ── Guards ────────────────────────────────
  useEffect(() => {
    if (!order?.id) {
      // No valid order — redirect back
      navigate("/", { replace: true });
    }
  }, [order, navigate]);

  // ── State ─────────────────────────────────
  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMethod, setSuccessMethod] = useState("");
  const [showQr, setShowQr] = useState(false);

  // ── RAZORPAY FLOW ─────────────────────────
  const handleRazorpay = async () => {
    setError("");
    setLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError(
        "Failed to load payment gateway. Check your internet connection.",
      );
      setLoading(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // set in your .env
      amount: order.amount,
      currency: order.currency || "INR",
      name: doctorName,
      description: `Appointment with ${doctorName}`,
      order_id: order.id,
      handler: async (response) => {
        //response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        try {
          await instance.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            appointmentData, // Send this to backend so it can save the appointment
          });
          setSuccessMethod("razorpay");
          setShowSuccess(true);
        } catch (err) {
          console.error("Verification failed:", err);
          setError(
            err?.response?.data?.message ||
              "Payment received but verification failed. Please contact support.",
          );
        }
      },
      prefill: {
        name: doctorName ? `Appointment — ${doctorName}` : "",
        email: "",
        contact: "",
      },
      theme: { color: "#4a8ff5" },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => {
      setError(resp?.error?.description || "Payment failed. Please try again.");
      setLoading(false);
    });
    rzp.open();
    setLoading(false); // Razorpay modal is now open
  };

  // ── CASH ON VISIT FLOW ────────────────────
  const handleCash = async () => {
    setError("");
    setLoading(true);
    try {
      await instance.post("/payment/cash-confirm", {
        orderId: order.id,
        receipt: order.receipt,
        appointmentData,
      });
      setSuccessMethod("cash");
      setShowSuccess(true);
    } catch (err) {
      console.error("Cash confirm failed:", err);
      setError(
        err?.response?.data?.message ||
          "Could not confirm appointment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── UPI / QR ──────────────────────────────
  // Shows a QR panel — in prod, generate a real UPI deep link or fetch from backend.
  const UPI_ID = import.meta.env.VITE_UPI_ID || "your-upi@bank"; // set in .env
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=DocBook&am=${order?.amount / 100}&cu=INR&tn=${order?.receipt}`;
  // QR via a free public API — replace with your own in production
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=200x200`;

  const handleUpiConfirm = async () => {
    setLoading(true);
    try {
      console.log(appointmentData.date, "in payment.jsx");
      await instance.post("/payment/upi-confirm", {
        orderId: order.id,
        receipt: order.receipt,
        appointmentData: appointmentData,
      });
      setSuccessMethod("upi");
      setShowSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not verify UPI payment. Please contact support.",
      );
    } finally {
      setLoading(false);
    }
  };
  // ── PAY BUTTON HANDLER ────────────────────
  const handlePay = () => {
    if (selectedMethod === "razorpay") handleRazorpay();
    else if (selectedMethod === "cash") handleCash();
    else if (selectedMethod === "upi") setShowQr(true);
  };

  // ── AFTER SUCCESS ─────────────────────────
  const handleDone = () =>
    navigate("/my-appointments", {
      replace: true,
      state: {
        doctorId: appointmentData?.doctorId,
        date: appointmentData?.date,
      },
    }); //next Page

  // ── RENDER ────────────────────────────────
  if (!order?.id) return null;

  return (
    <div className="payment-page">
      {showSuccess && (
        <SuccessOverlay method={successMethod} onDone={handleDone} />
      )}

      <div className="payment-container">
        {/* ── Header ── */}
        <button className="pay-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon /> Back
        </button>

        <h1 className="pay-title">Complete Payment</h1>

        {/* ── Order Summary Card ── */}
        <div className="order-summary-card">
          <p className="order-label">Appointment Summary</p>

          <div className="order-row">
            <span className="order-row-key">Doctor</span>
            <span className="order-row-val">{doctorName || "—"}</span>
          </div>

          <div className="order-row">
            <span className="order-row-key">
              <CalendarIcon /> Date
            </span>
            <span className="order-row-val">{dateDisplay || "—"}</span>
          </div>

          <div className="order-row">
            <span className="order-row-key">
              <ClockIcon /> Time
            </span>
            <span className="order-row-val">{timeDisplay || "—"}</span>
          </div>

          <div className="order-divider" />

          <div className="order-row total-row">
            <span className="order-row-key">Total</span>
            <span className="order-amount">
              {order?.amount ? formatAmount(order.amount) : `₹${fees}`}
            </span>
          </div>

          <p className="order-receipt-id">Order ID: {order.id}</p>
        </div>

        {/* ── Payment Method Selector ── */}
        <div className="method-section">
          <p className="method-section-label">Select Payment Method</p>

          <div className="method-list">
            {PAYMENT_METHODS.map(({ id, label, sublabel, Icon }) => (
              <button
                key={id}
                className={`method-item ${selectedMethod === id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedMethod(id);
                  setShowQr(false);
                  setError("");
                }}
              >
                <div className="method-icon-wrap">
                  <Icon />
                </div>
                <div className="method-text">
                  <span className="method-label">{label}</span>
                  <span className="method-sublabel">{sublabel}</span>
                </div>
                <div className="method-radio">
                  {selectedMethod === id && (
                    <div className="method-radio-dot" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── UPI QR Panel (shown inline after selecting UPI + clicking Pay) ── */}
        {showQr && selectedMethod === "upi" && (
          <div className="qr-panel">
            <p className="qr-title">Scan to Pay</p>
            <img src={qrUrl} alt="UPI QR Code" className="qr-image" />
            <p className="qr-upi-id">
              UPI ID: <strong>{UPI_ID}</strong>
            </p>
            <p className="qr-amount">{formatAmount(order.amount)}</p>
            <p className="qr-note">
              After paying, tap <strong>Confirm Payment</strong> below.
            </p>
            <button
              className="qr-confirm-btn"
              onClick={handleUpiConfirm}
              disabled={loading}
            >
              {loading ? "Verifying…" : "Confirm Payment"}
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {error && <div className="pay-error-msg">{error}</div>}

        {/* ── Pay CTA ── */}
        {!showQr && (
          <button
            className={`pay-cta-btn ${selectedMethod ? "active" : ""}`}
            onClick={handlePay}
            disabled={loading || !selectedMethod}
          >
            {loading
              ? "Processing…"
              : selectedMethod === "cash"
                ? "Confirm — Pay at Clinic"
                : selectedMethod === "upi"
                  ? `Show QR — ${formatAmount(order.amount)}`
                  : `Pay ${formatAmount(order.amount)}`}
          </button>
        )}

        {/* ── Trust Badge ── */}
        <div className="trust-badge">
          <ShieldIcon />
          <span>256-bit SSL secured · Powered by Razorpay</span>
        </div>
      </div>
    </div>
  );
}
