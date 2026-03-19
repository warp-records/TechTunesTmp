import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement } from "@stripe/react-stripe-js";



const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_TEST_KEY);

import styles from "./Payment.module.css";
import Pickbot, { Dialogue } from "../../components/Pickbot";
import CreditCardBox from "../../components/CreditCardBox";
import bitcoinLogo from "../../assets/Payment/bitcoin.svg";
import BinaryRain from "./BinaryRain";
import PremiumCard from "../Pricing/PremiumCard";
import { MdQrCode2, MdContentCopy, MdCheck, MdClose } from "react-icons/md";

export default function Payment() {
  const [showBtcPayment, setShowBtcPayment] = useState(false);
  const [payState, setPayState] = useState("idle");
  
  // make sure the confetti displays on top of everything else
  const canvasRef = useRef(null);
  const confettiInstance = useRef(null);

  async function handleCardSubmit(stripe, elements) {
    if (!stripe || !elements) return;
    setPayState("loading");
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement),
    });
    if (error) { setPayState("error"); return; }
    const token = localStorage.getItem("token");
    const res = await fetch("/api/pay/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ payment_id: paymentMethod.id }),
    });
    res.ok ? setPayState("success") : setPayState("error");
  }

  // fire confetti on successful purchase
  useEffect(() => {
    if (payState !== "success" || !canvasRef.current) return;
    if (!confettiInstance.current) {
      confettiInstance.current = confetti.create(canvasRef.current, { resize: true });
    }
    const fire = (origin, angle) => confettiInstance.current({
      particleCount: 80,
      angle,
      spread: 100,
      origin,
    });
    fire({ x: 0, y: 0.6 }, 60);
    fire({ x: 1, y: 0.6 }, 120);
  }, [payState]);

  return (
    <div className={styles["payment-root"]}>
      <canvas ref={canvasRef} className={styles["confetti-canvas"]} />
      <main className={styles["main-container"]}>
        <div className={styles["payment-card"]}>
          <div className={styles["header-section"]}>
            <Pickbot />
            <Dialogue text={payState === "success" ? "Thank you for purchasing! Enjoy your premium!" : "You're one step away from unlocking everything!"} />
          </div>
          <div className={styles["boxes-container"]}>
            <div className={[styles["flip-container"], showBtcPayment ? styles["flipped"] : ""].join(" ")}>
              <div className={styles["flip-inner"]}>
                <div className={styles["flip-front"]}>
                  <Elements stripe={stripePromise} options={{ fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins&display=swap" }] }}>
                    <CreditCardBox
                  payState={payState}
                  buttonText="$24.99/mo"
                  successMsg="Payment successful :D"
                  onSwitch={() => setShowBtcPayment(true)}
                  onSubmit={handleCardSubmit}
                />
                  </Elements>
                </div>
                <div className={styles["flip-back"]}>
                  <BitcoinBox onSwitch={() => setShowBtcPayment(false)} payState={payState} />
                </div>
              </div>
            </div>
            <PremiumCard greenList={payState === "success"} />
          </div>
        </div>
      </main>
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
