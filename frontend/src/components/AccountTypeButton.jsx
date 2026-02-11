export default function AccountTypeButton({ action, icon, title, description }) {
  return (
    <button className="account-type-btn" data-action={action}>
      <div className="account-icon">{icon}</div>
      <div className="account-info">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </button>
  )
}
