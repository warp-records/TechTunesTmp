import { useRef } from 'react'
import { LuBell } from 'react-icons/lu'
import styles from './NotificationBell.module.css'

/**
 * Bell icon that toggles a scrollable notification dropdown.
 *
 * @param {Object} props
 * @param {Array<{title: string, subtext?: string}>} props.notifications List of notification objects.
 */
export default function NotificationBell({ notifications = [], onClearAll, open, onToggle }) {
  const wrapRef = useRef(null)

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.bell} onClick={onToggle} role="button" aria-label="Notifications">
        <LuBell />
      </div>
      {notifications.length > 0 && (
        <span className={styles.badge}>{notifications.length}</span>
      )}
      <div className={[styles.menu, open ? styles.open : ''].filter(Boolean).join(' ')}>
        <div className={styles.list}>
          {notifications.length === 0 ? (
            <p className={styles.empty}>No notifications</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className={styles.item}>
                <p className={styles['item-title']}>{n.title}</p>
                {n.subtext && <p className={styles['item-subtext']}>{n.subtext}</p>}
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className={styles.footer}>
            <button className={styles['clear-btn']} onClick={onClearAll}>Clear all</button>
          </div>
        )}
      </div>
    </div>
  )
}
