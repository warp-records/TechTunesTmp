import { useState } from "react";
import styles from "./Payment.module.css";
import Pickbot, { Dialogue } from "../../components/Pickbot";
import bitcoinLogo from "../../assets/Payment/bitcoin.svg";
import BinaryRain from "./BinaryRain";
import { MdQrCode2 } from "react-icons/md";

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
    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4));
  }

  return (
    <div className={styles["payment-box"]}>
      <div className={styles["box-title"]}>
        <span className={styles["stripe-title"]}>Credit Card</span>
        <span className={styles["box-icon"]}>💳</span>
      </div>
      <div className={styles["box-content"]}>
        <div className={styles["field"]}>
          <label>Card Number</label>
          <input
            className={styles["mock-input"]}
            type="text"
            value={cardNumber}
            placeholder="•••• •••• •••• ••••"
            onChange={handleCardNumber}
          />
        </div>
        <div className={styles["field"]}>
          <label>Expiry</label>
          <input
            className={styles["mock-input"]}
            type="text"
            value={expiry}
            placeholder="MM / YY"
            onChange={handleExpiry}
          />
        </div>
        <div className={styles["field"]}>
          <label>CVC</label>
          <input
            className={styles["mock-input"]}
            type="password"
            value={cvc}
            placeholder="•••"
            onChange={handleCvc}
          />
        </div>
        <button className={styles["pay-button"]}>Subscribe - $24.99/mo</button>
      </div>
    </div>
  );
}

function BitcoinBox() {
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
          <div className={styles["mock-input"]}>0.000097 BTC</div>
        </div>
        <div className={styles["field"]}>
          <label>To address</label>
          <div className={styles["input-row"]}>
            <div className={[styles["mock-input"], styles["mono"]].join(" ")} />
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
