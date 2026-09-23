import type { ReactNode } from 'react'
import styles from './Install.module.css'

export function Install(): ReactNode {
  return (
    <section
      id="install"
      className={styles.section}
      aria-label="Installation guide"
    >
      <div className="container">
        <h2 className={styles.heading}>Installation</h2>

        <div className={styles.columns}>
          <div className={styles.block}>
            <h3 className={styles.subHeading}>Prerequisites</h3>
            <ul className={styles.list}>
              <li>
                <strong>Python 3.8 or later</strong>, with <code>python3</code>{' '}
                available in PATH
              </li>
              <li>
                The <code>opentrons</code> Python package:{' '}
                <code className={styles.codeInline}>pip install opentrons</code>
              </li>
              <li>
                For OT-2 use{' '}
                <code className={styles.codeInline}>
                  pip install opentrons==9.0.0
                </code>{' '}
                (opentrons 9.1.0+ dropped OT-2 support)
              </li>
              <li>
                Select the matching Python interpreter in VSCode via{' '}
                <code>Python: Select Interpreter</code>
              </li>
              <li>
                Using both Flex and OT-2? Keep them in a separate virtual
                environment each and switch per protocol.
              </li>
            </ul>
          </div>

          <div className={styles.block} aria-label="Method A: Command Palette">
            <h3 className={styles.subHeading}>Method A: Command Palette</h3>
            <ol className={styles.list}>
              <li>
                Open the Command Palette (<kbd>Cmd+Shift+P</kbd> /{' '}
                <kbd>Ctrl+Shift+P</kbd>)
              </li>
              <li>
                Select <code>Extensions: Install from VSIX...</code>
              </li>
              <li>
                Choose the downloaded <code>.vsix</code> file
              </li>
            </ol>
          </div>

          <div className={styles.block} aria-label="Method B: Command line">
            <h3 className={styles.subHeading}>Method B: Command line</h3>
            <pre className={styles.codeBlock}>
              <code>code --install-extension protocol-factory-0.2.9-alpha.vsix</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
