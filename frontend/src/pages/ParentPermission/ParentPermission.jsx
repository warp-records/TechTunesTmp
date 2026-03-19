import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement } from "@stripe/react-stripe-js";
import styles from "../Payment/Payment.module.css";
import ppStyles from "./ParentPermission.module.css";
import Pickbot, { Dialogue } from "../../components/Pickbot";
import CreditCardBox from "../../components/CreditCardBox";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_TEST_KEY);

export default function ParentPermission() {
  const [payState, setPayState] = useState("idle");

  async function handleCardSubmit(stripe, elements) {
    if (!stripe || !elements) return;
    setPayState("loading");
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement),
    });
    if (error) { setPayState("error"); return; }
    const token = localStorage.getItem("token");
    const res = await fetch("/api/pay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ payment_id: paymentMethod.id }),
    });
    if (res.ok) {
      setPayState("success");
      window.open('/pricing', '_self');
    } else {
      setPayState("error");
    }
  }

  return (
    <div className={[styles["payment-root"], ppStyles["root"]].join(" ")}>
      <main className={styles["main-container"]}>
        <div className={styles["payment-card"]}>
          <div className={styles["header-section"]}>
            <Pickbot />
            <Dialogue
              text={
                payState === "success"
                  ? "Permission granted! Welcome aboard!"
                  : "To finish onboarding, get your parent's permission and have them verify with a credit card."
              }
            />
          </div>
          <div className={[styles["boxes-container"], ppStyles["boxes-container-centered"]].join(" ")}>
            <div className={ppStyles["card-wrapper"]}>
              <div className={ppStyles["charge-notice"]}><i>Your card won't be charged</i></div>
              <Elements
                stripe={stripePromise}
                options={{ fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins&display=swap" }] }}
              >
                <CreditCardBox
                  payState={payState}
                  buttonText="Verify"
                  successMsg="Verified!"
                  onSubmit={handleCardSubmit}
                />
              </Elements>
            </div>
          </div>
          <br /><br /><br />
        </div>
      </main>
    </div>
  );
}
