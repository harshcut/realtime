import * as React from 'react'
import styles from './Cursor.module.css'

export interface MousePosition {
  x: number | null
  y: number | null
}

const Cursor: React.FC<{ mousePosition: MousePosition }> = ({ mousePosition }) => {
  const { x, y } = mousePosition

  if (!x || !y) return null

  return (
    <svg
      width="18"
      height="24"
      viewBox="0 0 18 24"
      fill="#000"
      style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
      className={styles.cursor}
    >
      <path d="M2.717 2.22918L15.9831 15.8743C16.5994 16.5083 16.1503 17.5714 15.2661 17.5714H9.35976C8.59988 17.5714 7.86831 17.8598 7.3128 18.3783L2.68232 22.7C2.0431 23.2966 1 22.8434 1 21.969V2.92626C1 2.02855 2.09122 1.58553 2.717 2.22918Z" />
    </svg>
  )
}

export default Cursor
