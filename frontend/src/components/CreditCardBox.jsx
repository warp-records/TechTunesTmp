import { useState } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import styles from "../pages/Payment/Payment.module.css";
import bitcoinLogo from "../assets/Payment/bitcoin.svg";

const cardIcons = import.meta.glob(
  "/node_modules/payment-icons/min/flat/*.svg",
  { eager: true, query: "?url", import: "default" }
);

const CARD_TYPE_TO_ICON = {
  visa: "visa",
  mastercard: "mastercard",
  "american-express": "amex",
  discover: "discover",
  jcb: "jcb",
  "diners-club": "diners",
  maestro: "maestro",
  unionpay: "unionpay",
};

function getCardLogo(cardType) {
  const name = CARD_TYPE_TO_ICON[cardType] ?? "default";
  return cardIcons[`/node_modules/payment-icons/min/flat/${name}.svg`];
}

const ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "'Poppins', sans-serif",
      fontSize: "16px",
      letterSpacing: "0.05em",
      "::placeholder": { color: "rgba(255, 255, 255, 0.3)" },
    },
    invalid: { color: "rgba(255, 80, 80, 0.9)" },
  },
};

// onSubmit(stripe, elements) — parent owns all payment logic
export default function CreditCardBox({ payState, buttonText, successMsg = "Payment successful :D", onSwitch, onSubmit }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardBrand, setCardBrand] = useState(null);
  const [fieldState, setFieldState] = useState({ number: {}, expiry: {}, cvc: {} });

  const allValid = fieldState.number.complete && fieldState.expiry.complete && fieldState.cvc.complete;

  function handleChange(field, e) {
    if (field === "number") setCardBrand(e.brand ?? null);
    setFieldState((s) => ({ ...s, [field]: e }));
  }

  return (
    <div className={[styles["payment-box"], styles["cc-box"]].join(" ")}>
      <div className={styles["box-title"]}>
        <span className={styles["stripe-title"]}>Credit Card</span>
        <span className={styles["box-icon"]}>
          <img src={getCardLogo(cardBrand)} alt={cardBrand ?? "Card"} className={styles["box-icon-img"]} />
        </span>
      </div>
      <div className={styles["box-content"]}>
        <div className={styles["field"]}>
          <label>Card Number</label>
          <div className={[styles["mock-input"], fieldState.number.error ? styles["input-error"] : ""].join(" ")}>
            <CardNumberElement options={ELEMENT_OPTIONS} onChange={(e) => handleChange("number", e)} />
          </div>
          {fieldState.number.error && <span className={styles["error-msg"]}>{fieldState.number.error.message}</span>}
        </div>
        <div className={styles["field"]}>
          <label>Expiry</label>
          <div className={[styles["mock-input"], fieldState.expiry.error ? styles["input-error"] : ""].join(" ")}>
            <CardExpiryElement options={ELEMENT_OPTIONS} onChange={(e) => handleChange("expiry", e)} />
          </div>
          {fieldState.expiry.error && <span className={styles["error-msg"]}>{fieldState.expiry.error.message}</span>}
        </div>
        <div className={styles["field"]}>
          <label>CVC</label>
          <div className={[styles["mock-input"], fieldState.cvc.error ? styles["input-error"] : ""].join(" ")}>
            <CardCvcElement options={ELEMENT_OPTIONS} onChange={(e) => handleChange("cvc", e)} />
          </div>
          {fieldState.cvc.error && <span className={styles["error-msg"]}>{fieldState.cvc.error.message}</span>}
        </div>
        <span className={payState === "success" ? styles["pay-status-success"] : payState === "error" ? styles["pay-status-error"] : styles["pay-status-hidden"]}>
          {payState === "success" ? successMsg : payState === "error" ? "Payment failed" : "\u00a0"}
        </span>
        <button
          className={styles["pay-button"]}
          disabled={!allValid || payState === "loading" || payState === "success"}
          onClick={() => onSubmit(stripe, elements)}
        >
          {payState === "loading" ? <span className={styles["pay-spinner"]} /> : buttonText}
        </button>
        {onSwitch && (
          <button className={styles["btc-toggle"]} onClick={onSwitch}>
            <img src={bitcoinLogo} alt="" className={styles["btc-toggle-icon"]} />
            Pay with Bitcoin instead
          </button>
        )}
      </div>
    </div>
  );
}
