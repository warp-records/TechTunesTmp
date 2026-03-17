import { useState } from "react";
import valid from "card-validator";
import {loadStripe} from '@stripe/stripe-js'

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
import { MdQrCode2, MdContentCopy, MdCheck } from "react-icons/md";

export default function Payment() {
  return (
    <div className={styles["payment-root"]}>
      <main className={styles["main-container"]}>
        <div className={styles["payment-card"]}>
          <div className={styles["header-section"]}>
            <Pickbot />
            <Dialogue text={"You're one step away from unlocking everything!"} />
          </div>
          <div className={styles["boxes-container"]}>
            <CreditCardBox />
            <BitcoinBox />
          </div>
        </div>
      </main>
    </div>
  );
}



function CreditCardBox() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [failedPay, setFailedPay] = useState(false)
  const [touched, setTouched] = useState({ cardNumber: false, expiry: false, cvc: false });
  
  const public_test_key = "REMOVED"
  const secret_key = "REMOVED"
  
  async function makePayment() {
    const stripe = await loadStripe(public_test_key);
    
    // goes to stripes servers
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: {
        number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(expiry.split(' / ')[0]),
          exp_year: parseInt(expiry.split(' / ')[1]),
          cvc: cvc,
      },
    })
    
    if (error) { 
      setFailedPay(true)
      return
    }
    
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
    }).then(r => r.json());
    
    if (res.success) {
      alert("Payment succeeded");
    } else {
      alert("Payment failed")
    }
  }

  const cardResult = valid.number(cardNumber);
  const expiryResult = valid.expirationDate(expiry);
  const cvcMaxLength = cardResult.card?.code?.size ?? 4;
  const cvcResult = valid.cvv(cvc, cvcMaxLength);

  const cardError = touched.cardNumber && cardNumber && !cardResult.isValid ? "Invalid card number" : null;
  const expiryError = touched.expiry && expiry && !expiryResult.isValid ? "Invalid expiry" : null;
  const cvcError = touched.cvc && cvc && !cvcResult.isValid ? "Invalid CVC" : null;
  const allValid = cardResult.isValid && expiryResult.isValid && cvcResult.isValid;

  function handleCardNumber(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  }

  function handleExpiry(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(digits.slice(0, 2) + " / " + digits.slice(2));
    } else {
      setExpiry(digits);
    }
  }

  function handleCvc(e) {
    setCvc(e.target.value.replace(/\D/g, "").slice(0, cvcMaxLength));
  }

  function blur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  return (
    <div className={styles["payment-box"]}>
      <div className={styles["box-title"]}>
        <span className={styles["stripe-title"]}>Credit Card</span>
        <span className={styles["box-icon"]}>
          <img
            src={getCardLogo(cardResult.card?.type)}
            alt={cardResult.card?.niceType ?? "Card"}
            className={styles["box-icon-img"]}
          />
        </span>
      </div>
      <div className={styles["box-content"]}>
        <div className={styles["field"]}>
          <label>Card Number</label>
          <input
            className={[styles["mock-input"], cardError ? styles["input-error"] : ""].join(" ")}
            type="text"
            value={cardNumber}
            placeholder="•••• •••• •••• ••••"
            onChange={handleCardNumber}
            onBlur={() => blur("cardNumber")}
          />
          {cardError && <span className={styles["error-msg"]}>{cardError}</span>}
        </div>
        <div className={styles["field"]}>
          <label>Expiry</label>
          <input
            className={[styles["mock-input"], expiryError ? styles["input-error"] : ""].join(" ")}
            type="text"
            value={expiry}
            placeholder="MM / YY"
            onChange={handleExpiry}
            onBlur={() => blur("expiry")}
          />
          {expiryError && <span className={styles["error-msg"]}>{expiryError}</span>}
        </div>
        <div className={styles["field"]}>
          <label>CVC</label>
          <input
            className={[styles["mock-input"], cvcError ? styles["input-error"] : ""].join(" ")}
            type="password"
            value={cvc}
            placeholder="•••"
            onChange={handleCvc}
            onBlur={() => blur("cvc")}
          />
          {cvcError && <span className={styles["error-msg"]}>{cvcError}</span>}
        </div>
        <button className={styles["pay-button"]} disabled={!allValid}>
          $24.99/mo
        </button>
      </div>
    </div>
  );
}

function BitcoinBox() {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("1XPTgDRhN8RFnzniWCddobD9iKZatrvH4");

  function handleCopy() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles["payment-box"]}>
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
        <button className={styles["pay-button"]}>Generate Address</button>
      </div>
    </div>
  );
}
