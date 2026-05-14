import { Link } from 'react-router-dom'
import { LuHouse } from 'react-icons/lu'
import styles from './HomeButton.module.css'

export default function HomeButton({ className, style, ...props }) {
  return (
    <Link 
      to="/homepage" 
      className={[styles['home-button'], className].filter(Boolean).join(' ')} 
      style={style}
      title="Go to Home" 
      {...props}
    >
      <LuHouse />
    </Link>
  )
}
