import type { ReactNode } from 'react'
import styles from './Disclaimer.module.css'

export function Disclaimer(): ReactNode {
  return (
    <aside className={styles.band} aria-label="Disclaimer">
      <div className={`container ${styles.inner}`}>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
        <p className={styles.text}>
          Protocol Factory is an independent project and is not affiliated with
          or endorsed by Opentrons.
        </p>
      </div>
    </aside>
  )
}
