import type { ReactNode } from 'react'
import styles from './Features.module.css'

export interface Feature {
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    title: 'Real-time Deck Visualization',
    description:
      'Deck state and liquid volume changes render in real time through an interactive panel while your protocol runs.',
  },
  {
    title: 'Auto-analysis on Save',
    description:
      'The simulation automatically reruns whenever you save changes (Ctrl+S / Cmd+S) to your protocol file.',
  },
  {
    title: 'Runtime Parameters UI',
    description:
      'Input fields are generated for Runtime Parameters, with a guard that blocks analysis on unstaged csv_file params, in English and Japanese — your original code is never modified.',
  },
  {
    title: 'Custom Labware Support',
    description:
      'Place sibling custom labware definition files (.json) next to your protocol file and they just work.',
  },
  {
    title: 'Pop-out / Aux Window',
    description:
      "Pop the panel out to its own window or drag the tab to another monitor via VSCode's Auxiliary Window support.",
  },
  {
    title: 'Step Jumper + Search',
    description:
      'Enter any step number under Protocol Steps and hit Enter to jump the visualization state instantly, with step search to land fast.',
  },
  {
    title: 'Multi-file Bundler',
    description:
      'Bundle `from helpers import x` into `<name>.bundled.py` with a line map via the `Protocol Factory: Bundle Protocol` command.',
  },
]

export function Features(): ReactNode {
  return (
    <section id="features" className={styles.section} aria-label="Features">
      <div className="container">
        <h2 className={styles.heading}>
          Everything you need to see your protocol run
        </h2>
        <ul className={styles.grid}>
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardBody}>{feature.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
