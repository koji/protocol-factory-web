import type { ReactNode } from 'react'
import styles from './AiWorkflow.module.css'

const DEMO_VIDEO =
  'https://github.com/user-attachments/assets/812fbcdf-a84a-49fd-b631-ae925b64dddf'
const SKILL_REPO = 'https://github.com/koji/protocol-fix-loop'
const SKILL_INSTALL_COMMAND = 'npx skills add koji/protocol-fix-loop'

export function AiWorkflow(): ReactNode {
  return (
    <section
      id="ai-workflow"
      className={styles.section}
      aria-label="Generate protocols with AI"
    >
      <div className="container">
        <h2 className={styles.heading}>
          Generate protocols with AI, verify with Protocol Factory
        </h2>
        <p className={styles.lead}>
          Connect Protocol Factory to your LLM with{' '}
          <a
            className={styles.link}
            href={SKILL_REPO}
            target="_blank"
            rel="noreferrer"
          >
            protocol-fix-loop
          </a>
          . Generate Opentrons protocols with GitHub Copilot or Cursor, then
          simulate and fix them in a visual feedback loop.
        </p>

        <figure className={styles.figure}>
          <video
            className={styles.video}
            src={DEMO_VIDEO}
            controls
            preload="metadata"
            aria-label="Demo video of generating and fixing a protocol with protocol-fix-loop and Protocol Factory"
          >
            Your browser does not support the video tag.
          </video>
          <figcaption className={styles.caption}>
            Generate a protocol from a prompt, then fix it while watching the
            simulation
          </figcaption>
        </figure>

        <h3 className={styles.subHeading}>How to use</h3>
        <ol className={styles.steps}>
          <li>Install VSCode or Cursor</li>
          <li>
            Install the skill:{' '}
            <code className={styles.codeInline}>{SKILL_INSTALL_COMMAND}</code>{' '}
            <span className={styles.muted}>
              (see{' '}
              <a
                className={styles.link}
                href={SKILL_REPO}
                target="_blank"
                rel="noreferrer"
              >
                koji/protocol-fix-loop
              </a>
              )
            </span>
          </li>
          <li>
            Install the Protocol Factory extension (see{' '}
            <a className={styles.link} href="#install">
              Installation guide
            </a>
            )
          </li>
          <li>
            Use <code className={styles.codeInline}>/protocol-fix-loop</code> in
            chat and add your prompt to generate a protocol
          </li>
        </ol>
      </div>
    </section>
  )
}
