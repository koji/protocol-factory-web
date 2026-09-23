import type { ReactNode } from 'react'
import styles from './Screenshot.module.css'

const DEMO_GIF =
  'https://github.com/user-attachments/assets/eeb96be5-8334-4370-bd4a-1564cb12d690'

export function Screenshot(): ReactNode {
  return (
    <section className={styles.section} aria-label="Screenshot">
      <div className="container">
        <figure className={styles.figure}>
          <img
            className={styles.demo}
            src={DEMO_GIF}
            alt="Protocol Factory visualizing an Opentrons protocol on a simulated deck"
            loading="lazy"
          />
          <figcaption className={styles.caption}>
            Protocol Factory in action
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
