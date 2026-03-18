import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_TEST_KEY);

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
import styles from "./Payment.module.css";
import Pickbot, { Dialogue } from "../../components/Pickbot";
import bitcoinLogo from "../../assets/Payment/bitcoin.svg";
import BinaryRain from "./BinaryRain";
import PremiumCard from "../Pricing/PremiumCard";
import { MdQrCode2, MdContentCopy, MdCheck, MdClose } from "react-icons/md";

export default function Payment() {
  const [showBtcPayment, setShowBtcPayment] = useState(false);
  const [payState, setPayState] = useState("idle");

  return (
    <div className={styles["payment-root"]}>
      <main className={styles["main-container"]}>
        <div className={styles["payment-card"]}>
          <div className={styles["header-section"]}>
            <Pickbot />
            <Dialogue text={"You're one step away from unlocking everything!"} />
          </div>
          <div className={styles["boxes-container"]}>
            <div className={[styles["flip-container"], showBtcPayment ? styles["flipped"] : ""].join(" ")}>
              <div className={styles["flip-inner"]}>
                <div className={styles["flip-front"]}>
                  <Elements stripe={stripePromise} options={{ fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins&display=swap" }] }}>
                    <CreditCardBox onSwitch={() => setShowBtcPayment(true)} payState={payState} setPayState={setPayState} />
                  </Elements>
                </div>
                <div className={styles["flip-back"]}>
                  <BitcoinBox onSwitch={() => setShowBtcPayment(false)} payState={payState} />
                </div>
              </div>
            </div>
            <PremiumCard />
          </div>
        </div>
      </main>
    </div>
  );
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

function CreditCardBox({ onSwitch, payState, setPayState }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardBrand, setCardBrand] = useState(null);
  const [fieldState, setFieldState] = useState({ number: {}, expiry: {}, cvc: {} });

  const allValid = fieldState.number.complete && fieldState.expiry.complete && fieldState.cvc.complete;

  function handleChange(field, e) {
    if (field === "number") setCardBrand(e.brand ?? null);
    setFieldState((s) => ({ ...s, [field]: e }));
  }

  async function makePayment() {
    // live private key for receiving payments
    const STRIKE_PRIVATE_KEY = "REMOVED";
    
    if (!stripe || !elements) return;
    setPayState("loading");

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement),
    });

    if (error) {
      setPayState("error");
      return;
    }

    const token = localStorage.getItem("token")
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ payment_id: paymentMethod.id }),
    });

    try {
      const data = await res.json();
      console.log(data)
      if (!data.client_secret) { setPayState("error"); return; }

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: paymentMethod.id,
      });
      
      console.log(paymentIntent)
      console.log(confirmError)

      if (confirmError || paymentIntent.status !== "succeeded") {
        setPayState("error");
      } else {
        setPayState("success");
      }
    } catch {
      setPayState("error");
    }
  }

  return (
    <div className={[styles["payment-box"], styles["cc-box"]].join(" ")}>
      <div className={styles["box-title"]}>
        <span className={styles["stripe-title"]}>Credit Card</span>
        <span className={styles["box-icon"]}>
          <img
            src={getCardLogo(cardBrand)}
            alt={cardBrand ?? "Card"}
            className={styles["box-icon-img"]}
          />
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
          {payState === "success" ? "Payment successful :D" : payState === "error" ? "Payment failed" : "\u00a0"}
        </span>
        <button className={styles["pay-button"]} disabled={!allValid || payState === "loading" || payState === "success"} onClick={makePayment}>
          {payState === "loading" ? <span className={styles["pay-spinner"]} /> : "$24.99/mo"}
        </button>
        <button className={styles["btc-toggle"]} onClick={onSwitch}>
          <img src={bitcoinLogo} alt="" className={styles["btc-toggle-icon"]} />
          Pay with Bitcoin instead
        </button>
      </div>
    </div>
  );
}

function BitcoinBox({ onSwitch, payState }) {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={[styles["payment-box"], styles["btc-box"]].join(" ")}>
      <BinaryRain />
      <div className={styles["box-title"]}>
        <span className={styles["btc-title"]}>Bitcoin</span>
        <span className={styles["box-icon"]}>
          <img src={bitcoinLogo} alt="Bitcoin" className={styles["box-icon-img"]} />
        </span>
      </div>
      <div className={styles["box-content"]}>
        <div className={styles["field"]}>
          <label>Send exactly</label>
          <div className={styles["mock-input"]}>0.000013 BTC</div>
        </div>
        <div className={styles["field"]}>
          <label>To address</label>
          <div className={styles["input-row"]}>
            <div className={[styles["mock-input"], styles["mono"], styles["address-input"]].join(" ")}>
              <span>{address}</span>
              <button className={styles["copy-button"]} onClick={handleCopy}>
                {copied ? <MdCheck style={{ color: "rgba(255,255,255,0.4)" }} /> : <MdContentCopy />}
              </button>
            </div>
            <button className={styles["qr-button"]}>
              <MdQrCode2 />
            </button>
          </div>
        </div>
        <button className={styles["pay-button"]} disabled={payState === "loading" || payState === "success"}>Generate Address</button>
        <button className={styles["btc-toggle"]} onClick={onSwitch}>
          💳 Pay with card instead
        </button>
      </div>
    </div>
  );
}
