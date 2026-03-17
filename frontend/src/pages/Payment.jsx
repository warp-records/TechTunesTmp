import styles from "./Payment.module.css";
import Pickbot, { Dialogue } from "../components/Pickbot";
import bitcoinLogo from "../assets/Payment/bitcoin.svg";

export default function Payment() {
  return (
    <div className={styles["payment-root"]}>
      <main className={styles["main-container"]}>
        <div className={styles["payment-card"]}>
          <div className={styles["header-section"]}>
            <Pickbot />
            <Dialogue
              text={"You're one step away from unlocking everything!"}
            />
          </div>

          <div className={styles["boxes-container"]}>
            <PaymentBox
              title="Credit Card"
              titleClassName={styles["stripe-title"]}
              icon="💳"
              label="Pay through Stripe"
              fields={[
                { label: "Card Number", value: "•••• •••• •••• ••••" },
                { label: "Expiry", value: "MM / YY" },
                { label: "CVC", value: "•••" },
              ]}
              buttonText="Subscribe — $9.99/mo"
            />
            <PaymentBox
              title="Bitcoin"
              titleClassName={styles["btc-title"]}
              icon={<img src={bitcoinLogo} alt="Bitcoin" className={styles["box-icon-img"]} />}
              label="Pay with Bitcoin"
              fields={[
                { label: "Send exactly", value: "0.000097 BTC" },
                { label: "To address", value: "bc1qxy2kgdygjrsqtzq2n0yrf24…", mono: true },
              ]}
              buttonText="I've Sent Payment"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function PaymentBox({ title, icon, fields, buttonText, titleClassName }) {
  return (
    <div className={styles["payment-box"]}>
      <div className={styles["box-title"]}>
        <span className={titleClassName}>{title}</span>
        <span className={styles["box-icon"]}>{icon}</span>
      </div>
      <div className={styles["box-content"]}>
        {fields.map(({ label: fieldLabel, value, mono }) => (
          <div key={fieldLabel} className={styles["field"]}>
            <label>{fieldLabel}</label>
            <div className={[styles["mock-input"], mono ? styles["mono"] : ""].join(" ")}>
              {value}
            </div>
          </div>
        ))}
        <button className={styles["pay-button"]}>{buttonText}</button>
      </div>
    </div>
  );
}
