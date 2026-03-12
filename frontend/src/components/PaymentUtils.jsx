import { CheckIcon } from "./Icon";
/** Load Razorpay SDK dynamically if not already present */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─────────────────────────────────────────────
//  SUCCESS OVERLAY
// ─────────────────────────────────────────────

export function SuccessOverlay({ method, onDone }) {
  return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="success-icon-ring">
          <CheckIcon />
        </div>
        <h2 className="success-title">
          {method === "cash" ? "Appointment Confirmed!" : "Payment Successful!"}
        </h2>
        <p className="success-sub">
          {method === "cash"
            ? "Please pay at the clinic on your appointment day."
            : "Your appointment has been booked and payment received."}
        </p>
        <button className="success-done-btn" onClick={onDone}>
          Go to My Appointments
        </button>
      </div>
    </div>
  );
}

export default { loadRazorpayScript, SuccessOverlay };
